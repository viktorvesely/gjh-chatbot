
'use strict';

const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

const {Wit, log} = require('node-wit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const shajs = require('sha.js');
const attachmentHandler = require('./handlers/attachment.js');
const Actions = require('./helpers/actions.js');
const Cache = require('./helpers/cache.js');
const MessageHandler = require('./handlers/text.js');
const SerieExecutor = require('./helpers/serieExecutor');
const PostBackHandler = require('./handlers/postBacks.js');
const Profile = require('./database/profile.js');
const Pipeline = require('./database/pipeline.js');
const ContinualResponse = require('./handlers/continualResponses.js');
const PipelineHandler = require('./handlers/pipeline.js');
const ResponseHandler = require('./handlers/response.js');

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WIT_ACCES_TOKEN = process.env.WIT_ACCES_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const Version = "beta 1.4";
const actions = new Actions(PAGE_ACCESS_TOKEN);
const cache = new Cache();

const client = new Wit({
  accessToken: WIT_ACCES_TOKEN,
  logger: new log.Logger(log.DEBUG) // optional
});

app.use(express.static('public'));
app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: function(req) {
      return shajs('sha256').update(Date.now()).digest('hex'); // use UUIDs for session IDs
    },
    cookie: { 
      secure: true
    }
}));

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.get('/', (req, res) => {
  res.sendFile(__dirname +  '/views/index.html');
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(__dirname +  '/views/privacyPolicy.html');
});

app.post('/pipes-command', (req, res) => {
  req.session.reload(() => {
    let pipelineHandler = new PipelineHandler(req.body, req.session.userId, actions, messageAccepted);
    if(req.session.userId === undefined) {
      res.send(pipelineHandler.response({}, "sesssion has expired"));
      return;
    }
    pipelineHandler.load().then(() => {
      pipelineHandler.resolve().then(response => {
        res.send(response);
      },
      response => {
        res.send(response);
      })
    },
    () => {
      res.send(pipelineHandler.response({}, "Error while loading your profile"));
    });
  });
});

app.get('/shout', (req, res) => {
  req.session.reload(() => {
    let pipeline = new Pipeline(req.session.userId);
    if (pipeline.isOwner()) {
      res.sendFile(__dirname + '/views/app.html');
    } else {
      res.sendFile(__dirname +  '/views/app.html'); 
    }
  });
});

app.post('/login', (req, res) => {
  let body = req.body;
  var pipeline = new Pipeline(body.userId);
  pipeline.fOnLoad().then(() => {
    let hash = shajs('sha256').update(body.userId + Date.now()).digest('hex');
    req.session.userId = body.userId;
    res.cookie("user", hash).send({
      success: true
    });
  },
                         () => {
    res.send({
      success: false,
      msg: "something is wrong"
    })
  });
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
  
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  }
});


function messageAccepted (response, sender_psid) {
  if (response.hasError()) {
    messageRejected(response, sender_psid);
    return;
  }
  let responseHandler = new ResponseHandler(response, actions, sender_psid);
  let todos = responseHandler.getTasks();
  var serieExecutor = new SerieExecutor(todos, () => { serieExecutor = undefined });
}

function messageRejected (response, sender_psid) {
  console.error(response.error);
  let customMsg = response.type === "text" && !!response.value;
  actions.callSendAPI(sender_psid, customMsg ? response.value : "Ou, toto je nepríjemné. Niečo sa pokazilo. 😞");
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;
  var text = received_message.text;
  // Check if the message contains text
  if (text) {    
    var profile = new Profile(sender_psid); // loads profile from database
    //odstrani diakritiku 
    let strippedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    client.message(strippedText.replace(".", ""), {})
    .then((data) => {
      profile.fOnLoad().then(() => {
        let continualConversationHandler = new ContinualResponse(profile, cache, text);
        let continualConversationPromise = continualConversationHandler.resolve(); // inject before text handler
        if (continualConversationPromise) {
          
          continualConversationPromise.then(response => {
            messageAccepted(response, sender_psid);
          }, response => {
            messageRejected(response, sender_psid);
          });
          continualConversationPromise.finally(() => {
            profile.end();
          })
        } else {
          
          let messageHandler = new MessageHandler(data, profile, cache, text);
          let messagePromise = messageHandler.resolve();
          messagePromise.then(response => {
            messageAccepted(response, sender_psid);
          }, response => {
            messageRejected(response, sender_psid);
          })
          messagePromise.finally(() => {
            profile.end();
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
  
 /* switch(payload) {
    case "button_save_reminder_yes":
      actions.callSendAPI(sender_psid, "Idem na to!");
      remdb.insertNewReminder(Reminders[sender_psid]);
      Reminders[sender_psid] = undefined;
      break;
    case "button_save_reminder_no":
      actions.callSendAPI(sender_psid, "Akoby sa nestalo. Ak nie si spokojný s dátumom, odporúčam používať formát [deň]d[mesiac]m. Príklad: 28d9m pisem pisomku z chemie.");
      Reminders[sender_psid] = undefined;
      break;
    case "button_reminder_delete_yes":
      remdb.deleteReminder(sender_psid);
      actions.callSendAPI(sender_psid, "Bam! A sú fuč.")
      break;
    case "button_reminder_delete_no":
      actions.callSendAPI(sender_psid, "Ha! Skoro som ich vymazal.")
      break;
    case "button_right_name_yes":
      userdb.addUser(sender_psid, Users[sender_psid]["first_name"], Users[sender_psid]["second_name"]);
      Users[sender_psid] = undefined;
      actions.callSendAPI(sender_psid, "Tvoje meno je navždy zaznamenané. No nie je to super?");
      break;
    case "button_right_name_no":
      actions.callSendAPI(sender_psid, "Tak teda nič.");
      Users[sender_psid] = undefined;
      break;
    case "button_get_started":
      actions.messageRequest(sender_psid, responses.whatCanIDo(sender_psid));
      break;
    case "button_about_me":
      actions.callSendAPI(sender_psid, "Som chatbot pre GJH-ákov. Bol som vytvorený Viktorom Veselým a ďalšími iniciatívnymi GJH-ákmi. Verzia " + Version);
      break;
    case "button_greeting":
      responses.welcomeMessage(sender_psid, msg => {
        actions.callSendAPI(sender_psid, msg);
      });
      break;
    case "button_show_powers":
      break;
      }*/
}
