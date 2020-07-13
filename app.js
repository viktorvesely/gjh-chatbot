'use strict';

require('dotenv').config(); // for .env usage

const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()), // creates express http server
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  shajs = require('sha.js'), 
  http = require('http').Server(app);

const {Wit, log} = require('node-wit');

const attachmentHandler = require('./handlers/attachment.js');
const Actions = require('./responses/actions.js');
const Cache = require('./helpers/cache.js');
const MessageHandler = require('./handlers/text.js');
const SerieExecutor = require('./helpers/serieExecutor');
const PostBackHandler = require('./handlers/postBacks.js');
const ProfileDatabase = require('./database/ProfileDatabase.js');
const PendingsDatabase = require('./database/msgsDatabase.js');
const ResponsesDatabase = require('./database/responseDatabase.js');
const ContinualResponse = require('./handlers/continualResponses.js');
const ResponseHandler = require('./handlers/response.js');
const Response = require('./responses/responseObject.js');
const Socket = require('./handlers/socket.js');
const WitAPi = require('./wit/api.js');

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WIT_ACCES_TOKEN = process.env.WIT_ACCES_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(express.static('public'));
app.use(express.static(__dirname + '/chat'))
app.use(express.static(__dirname + '/builder'))
app.use(cookieParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const server = app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
const socketio = require('socket.io').listen(server);
const Pendings = new PendingsDatabase();
const socket = new Socket(socketio, Pendings);
const cache = new Cache();
const Profile = new ProfileDatabase();
const Responses = new ResponsesDatabase();

function store_message(sender_psid, msg) {
  return new Promise((resolve, reject) => {
    Pendings.newMsg(sender_psid, msg).then(() => { 
      resolve();
    });
    socket.new_message(sender_psid);
  });
}

const actions = new Actions(store_message, store_message, store_message);

const client = new Wit({
  accessToken: WIT_ACCES_TOKEN,
  logger: new log.Logger(log.DEBUG),
  apiVersion: "20200513"
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname +  '/chat/dist/index.html');
});

app.post('/api', (req, res) => {
  let body = req.body;
  
  switch (body.request) {
    case "intents":
      WitAPi.getIntents(WIT_ACCES_TOKEN).then(intents => {
        res.send(intents);
      });
      break;
  }

});

app.post('/responses', (req, res) => {
  let body = req.body;

  switch(body.request) {
    case "save":
      Responses.save(body.payload).then(() => {
        res.sendStatus(200);
      }).catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
      break;
    case "load": 
      Responses.get(body.name).then(doc => {
        let response = null;
        if (doc !== null) {
          response = doc.response;
        } else {
          response = JSON.stringify([]);
        }
        res.status(200).send(response);
      });
      break;
  }
});

app.post('/pendings', (req, res) => {
    let sender_psid = req.body.sender_psid;

    if (!sender_psid) {
      res.sendStatus(400);
      return;
    }

    Pendings.pendings(sender_psid).then(msgs => {
      let response =  {
        update: null,
        msgs: null
      }
      response.update = msgs.length !== 0;
      response.msgs = msgs;
      res.status(200).send(JSON.stringify(response));
    });
});

app.post('/webhook', (req, res) => {  
  if (processQuery(req.body)) res.status(200).send('EVENT_RECEIVED');
  else res.sendStatus(400);
});

// Fro FB authentication
app.get('/webhook', (req, res) => {
  
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  
  if (mode && token) {
  
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  }
  res.sendStatus(403);
});

function processQuery(body) {
  if (body.object !== 'page') return false; 
  
  body.entry.forEach((entry) => {
    // Get the webhook event. entry.messaging is an array, but
    // will only ever contain one event, so we get index 0
    let webhook_event = entry.messaging[0];
    let sender_psid = webhook_event.sender.id;
    
    if (webhook_event.message) {
      handleMessage(sender_psid, webhook_event.message)
    } else if (webhook_event.postback) {
      handlePostback(sender_psid, webhook_event.postback)
    }
  });
  return true;
}

function formMessages(response, sender_psid) {
  let responseHandler = new ResponseHandler(response, actions, sender_psid);
  let todos = responseHandler.getTasks();
  var serieExecutor = new SerieExecutor(todos, () => { serieExecutor = undefined });
}

function messageAccepted (response, sender_psid) {
  if (response.hasError()) {
    messageRejected(response, sender_psid);
    return;
  }
  formMessages(response, sender_psid);
}

function messageRejected (response, sender_psid) {
  console.error(response.error);
  formMessages(new Response("text", "Ou, toto je nepríjemné. Niečo sa pokazilo. 😞"), sender_psid);
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
  var text = received_message.text;
  // Check if the message contains text
  if (text) {
    //odstrani diakritiku 
    let strippedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    client.message(strippedText.replace(".", ""), {})
    .then((data) => {
      Profile.getUser(sender_psid).then(profile => {
        let continualConversationHandler = new ContinualResponse(profile, cache, text);
        let continualConversationPromise = continualConversationHandler.resolve(); // inject before text handler
        if (continualConversationPromise) {
          
          continualConversationPromise.then(response => {
            messageAccepted(response, sender_psid);
          }, response => {
            messageRejected(response, sender_psid);
          });
          continualConversationPromise.finally(() => {
            Profile.updateUser(profile);
          });
        } else {
          
          let messageHandler = new MessageHandler(data, profile, cache, text);
          let messagePromise = messageHandler.resolve();
          messagePromise.then(response => {
            messageAccepted(response, sender_psid);
          }, response => {
            messageRejected(response, sender_psid);
          })
          messagePromise.finally(() => {
            Profile.updateUser(profile);
          });
        }
      }).catch(err => {
        console.error(err);
        messageAccepted(MessageHandler.__internal_error_response(), sender_psid);
      });
    }).catch(console.error);

  } else if (received_message.attachments) {
    let attachment_url = received_message.attachments[0].payload.url; // use iteration for all
    attachmentHandler.handle(sender_psid, attachment_url, client, (response) => {
      if(response) {
        if (response.type === "unknown") {
          actions.callSendAPI(sender_psid, "You're VIP, but I don't know what to do with this file :(")
        }
      } else {
        actions.callSendAPI(sender_psid, "Táto feature je len pre VIP. #sorryNotSorry")
      }
    });
  }
}

function handlePostback(sender_psid, received_postback) {
  let payload = received_postback.payload;
  var profile = new Profile(sender_psid);
  
  profile.fOnLoad().then(() => {
    let postBackHandler = new PostBackHandler(profile, payload, cache);
    let postBackPromise = postBackHandler.resolve();
    postBackPromise.then(response => {
        messageAccepted(response, sender_psid)
      }, response => {
        messageRejected(response, sender_psid);
      });
    postBackPromise.finally(() => {
      profile.end();
    })
  });
  return;
}
