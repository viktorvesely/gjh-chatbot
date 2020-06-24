'use strict';

require('dotenv').config(); // for .env usage

const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()), // creates express http server
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  shajs = require('sha.js')

const {Wit, log} = require('node-wit');

const attachmentHandler = require('./handlers/attachment.js');
const Actions = require('./responses/actions.js');
const Cache = require('./helpers/cache.js');
const MessageHandler = require('./handlers/text.js');
const SerieExecutor = require('./helpers/serieExecutor');
const PostBackHandler = require('./handlers/postBacks.js');
// const Profile = require('./database/profile.js');
const ProfileDatabase = require('./database/ProfileDatabase.js');
const ContinualResponse = require('./handlers/continualResponses.js');
const ResponseHandler = require('./handlers/response.js');
const Response = require('./responses/responseObject.js');

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WIT_ACCES_TOKEN = process.env.WIT_ACCES_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

function send_type(sender_psid, msg) {
  return new Promise((resolve, reject) => {
    console.log(`Sending ${msg.type}, "${msg.value}" to ${sender_psid}`);
    resolve();
  });
}

const actions = new Actions(send_type, send_type, send_type);
const cache = new Cache();
const Profile = new ProfileDatabase();
const client = new Wit({
  accessToken: WIT_ACCES_TOKEN,
  logger: new log.Logger(log.DEBUG),
  apiVersion: "20200513"
});

app.use(express.static('public'));
app.use(cookieParser());

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.get('/', (req, res) => {
  res.sendFile(__dirname +  '/views/index.html');
});


app.post('/webhook', (req, res) => {  
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message)
        //actions.setStatus('mark_seen', sender_psid)
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback)
      }
    });
    res.status(200).send('EVENT_RECEIVED');

  } else {
    res.sendStatus(404);
  }

});

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
});

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
            Profile.updateUser(sender_psid, profile);
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
            Profile.updateUser(sender_psid, profile);
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
