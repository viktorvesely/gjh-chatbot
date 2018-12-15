
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
const TimeTableManager = require('./timetable/manager.js');

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

app.post('/allPipes', (req, res) => {
  req.session.reload(() => {
    let pipeline = new Pipeline(req.session.userId);
    if (pipeline.isOwner()) {
      pipeline.getAllPipelines().then((pipelines) => {
        res.send({
          sucess: true,
          pipelines: pipelines
        });
      },
                              () => {
        res.send({
          success: false,
          msg: "There was some error in sql. Check console."
        });
      });
    } else {
      res.send({
        success: false,
        msg: "You lost owner-ship... weird. Check session."
      });
    }
  });
});

app.get('/shout', (req, res) => {
  req.session.reload(() => {
    let pipeline = new Pipeline(req.session.userId);
    if (pipeline.isOwner()) {
      res.sendFile(__dirname + '/views/pipelineEditor.html');
    } else {
      res.sendFile(__dirname +  '/views/shout.html'); 
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
        actions.setStatus('mark_seen', sender_psid)
        handleMessage(sender_psid, webhook_event.message);
        
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
  const VERIFY_TOKEN = "<GJH_BOT>";
  
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


function messageAccepted (response, sender_psid) {
  if (response.hasError()) {
    messageRejected(response, sender_psid);
    return;
  }
  var todos = [];
  var msgs = response.msgs;
  for (let i = 0; i < msgs.length; ++i) {
    let msg = msgs[i];
    switch(msg.type) {
      case "text":
        todos.push(() => { return actions.callSendAPI(sender_psid, msg.value); });
        break;
      case "confirmation":
        todos.push(() => { return actions.sendConfirmation(sender_psid, msg.value, msg.options[0], msg.options[1]); });
        break;
      case "image":
        todos.push(() => { return actions.sendAttachment(sender_psid, msg.type, msg.value); });
        break;
      case "generic":
        todos.push(() => { return actions.facebookRequest(msg.value); });
        break;
    }
  }
  var serieExecutor = new SerieExecutor(todos, () => { serieExecutor = undefined });
}

function messageRejected (response, sender_psid) {
  console.error(response.error);
  actions.callSendAPI(sender_psid, "Ou, toto je nepríjemné. Niečo sa pokazilo. 😞");
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
      
        let messageHandler = new MessageHandler(data, profile, cache, text);
        let messagePromise = messageHandler.resolve();
        messagePromise.then(response => {
          messageAccepted(response, sender_psid);
        }, response => {
          messageRejected(response, sender_psid);
        });
        messagePromise.finally(() => {
          profile.end();
        });
        
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
