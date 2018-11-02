
'use strict';

// Imports dependencies and set up http server

const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server
  
const userdb = require('./database/user.js');
const remdb = require('./database/reminders.js');
const subsdb = require('./database/memes_subs.js');
const basicResponses = require('./responses/basic_responses');
const {Wit, log} = require('node-wit');
const attachmentHandler = require('./handlers/attachment.js');
const Actions = require('./helpers/actions.js');
const Utils = require('./helpers/utils.js');
const Responses = require('./responses/responses.js');
const Cache = require('./helpers/cache.js');
const MessageHandler = require('./handlers/text.js');
const SerieExecutor = require('./helpers/serieExecutor');
//const ReminderInterface = require()

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WIT_ACCES_TOKEN = process.env.WIT_ACCES_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const client = new Wit({
  accessToken: WIT_ACCES_TOKEN,
  logger: new log.Logger(log.DEBUG) // optional
});

const wit_entities = ["obligation", "gjh_lunch", "gjh_teacher", "gjh_test", "lesson_name", "tell_name", "reminder_show", "subscribe_memes", "life_meaning", "reminder_delete", "show_abilities", "reminder_delete_spesific", "tell_joke", "compare_object", "cannot", "why_object", "favourite_obj"];
const daysInWeek = ["pondelok", "utorok", "streda", "stvrtok", "piatok", "sobota", "nedela"]
const Version = "beta 1.3";

const confidenceTreshold = 0.70;
const actions = new Actions(PAGE_ACCESS_TOKEN);
const responses = new Responses();
const cache = new Cache();

var Reminders = {};
var Users = {};

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

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

actions.setGreetingMsg();

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
    }
  }
  
  var serieExecutor = new SerieExecutor(todos, () => { serieExecutor = undefined });
}

function messageRejected (response, sender_psid) {
  console.error(response.error);
  actions.callSendAPI(sender_psid, "Ou toto je nepríjemné, niečo sa pokailo.");
}

function setReminder(data, sender_psid) {
  let reminder = {};
  let question = "";
  let subject = "";
  let date = new Date();
  reminder["target"] = sender_psid;
  reminder["year"] = date.getFullYear();
  
  Object.keys(data["entities"]).forEach((key) => {
      let value = data["entities"][key];
      if (key == "time_tomorrow" && value[0].confidence > 0.70) {
        reminder["month"] = date.getMonth();
        reminder["day"] = date.getDate() - 1;
      }
      else if (key == "time_day" && value[0].confidence > 0.70 ) {
          let dayId = -1;
          for (let i = 0; i < daysInWeek.length; ++i) {
            if (daysInWeek[i].substring(0,3) == value[0].value.substring(0,3)) {
              dayId = i;
              break;
            }
          }
          if (dayId == -1) {
            let responseError = {text: "Nerozumiem, ktorý deň myslíš."};
            actions.callSendAPI(sender_psid, responseError);
            return;
          }
          let diff = dayId - date.getDay();
          if (diff < 0) {
            diff = 7 - Math.abs(diff)
          }
          diff -= 1;
          reminder["day"] = date.getDate() + diff;
          reminder["month"] = date.getMonth();
          
      } else if (key == "time_date") {
        
        let date = value[0].value;
        reminder["day"] = Number(date.substring(0, date.indexOf("d"))) - 2;
        let distance = 0;
        if (reminder["day"] < 0) {
          reminder["day"] = 29;
          distance = -1;
        }
        reminder["month"] = Number(date.substring(date.indexOf("d") + 1, date.indexOf("m"))) - 1  + distance; 
        
      } else if (key == "lesson_name") {
        
        reminder["lesson"] = value[0].value;
        
      } 
    });

    if (Utils.hasObjectKeys(reminder, ["month","lesson","year","day","target"]) == false) {
      actions.callSendAPI(sender_psid, "Nevedel som rozoznať nejaké údaje. Skús si, prosím, pozrieť chyby.");
      return;
    }

    //let save = {target: sender_psid, day: }
    let reminderTime = new Date();
    reminderTime.setFullYear(reminder["year"], reminder["month"], reminder["day"] + 1);
    reminderTime.setHours(17, 0, 0);
    reminder["year"] = reminderTime.getFullYear();
    reminder["month"] = reminderTime.getMonth();
    reminder["day"] = reminderTime.getDate() - 1;

    if (reminderTime < date) {
      actions.callSendAPI(sender_psid, "To už je minulosť.");
      return;
    }
    reminder["timestamp"] = reminderTime.getTime();
    Reminders[sender_psid] = reminder;
    question = "Mám ti pripomenúť " + reminder["lesson"].substring(0, reminder["lesson"].length -1) + "u" + " " 
                + (reminder["day"] + 1) + "." + (reminder["month"]+1)  + "." + reminder["year"] + " ?";

  actions.sendConfirmation(sender_psid, question,"button_save_reminder_yes", "button_save_reminder_no");
}


function addUser(sender_psid, data, originalText) {
  
  let name  = "";
  if(data["entities"].hasOwnProperty("user_name") == false) {
    actions.callSendAPI(sender_psid, {text: "Gratulujem. Do tejto časti kódu by som sa nemal dostať. Nahlás, prosím, túto chybu. Ďakujem!"});
    return;
  }
  originalText = originalText.replace(".", "");
  let words = originalText.split(" ");
  let numberOfNames = data["entities"]["user_name"][0].value.split(" ").length;
  if (numberOfNames != 2) {
    for (let i = 0; i < numberOfNames; ++i) {
      name +=words[words.length - (numberOfNames - i)] + " ";
    }
    actions.callSendAPI(sender_psid, {text: "Super meno, " + name + ", ale poprosím ťa len o presné krstné meno a priezvisko." });
    return;
  }
  
  name = words[words.length - 2] + " " + words[words.length - 1];
  let payload = {}
  payload["sender_psid"] = sender_psid;
  payload["first_name"] = words[words.length - 2];
  payload["second_name"] = words[words.length - 1];
  Users[sender_psid] = payload;
  actions.sendConfirmation(sender_psid, "Naozaj je '" + name + "' tvoje meno? Prosím, nech je aj s diakritikou.", "button_right_name_yes", "button_right_name_no");
}
    



function showReminder(reminders) {
  let message = "Čaká ťa,\n";
  
  let exist = false;
  reminders.forEach((row) => {
    exist = true;
    message += row["subject"].substring(0, row["subject"].length -1) + "a";
    message += " " + (row["day"] + 1 ) + "." + (row["month"] + 1) + "." + row["year"] + ",\n";
  });
  message += "To bude ale srandy."
  if (exist === false) {
    message = "Máš voľno. Wuuuu.";
  }
  return message
}


// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;
  let text = received_message.text;

  // Check if the message contains text
  if (text) {    

    //odstrani diakritiku 
    let strippedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    client.message(strippedText.replace(".", ""), {})
    .then((data) => {

      let responseText = "";
      var wasAlreadySend = false;

      
      let messageHandler = new MessageHandler(data, sender_psid, cache);
      messageHandler.resolve().then(response => {
        messageAccepted(response, sender_psid)
      }, response => {
        messageRejected(response, sender_psid);
      })
      
      return;
      
      if(data["entities"]["intent"] && data["entities"]["intent"][0].confidence > confidenceTreshold) {
        switch(data["entities"]["intent"][0].value) {
          case "current_lesson":
              responseText = "Teraz mas nemcinu 303";
            break;
          case "spesific_lesson":
              responseText = "anglictina 505";
            break;
          case "teacher_cabinet":
            responseText = "815";
            break;
          case "today_lunch":
              responseText = "Jedlo";
            break;
          case "reminder_time":
              responseText = "Lol nie";
              setReminder(data, sender_psid);
            break;
          case "reminder_delete":
              actions.sendConfirmation(sender_psid, "Naozaj mám zmazať všetky pripomienky? Jednotlivé pripomienky zmažeš správou Nepíšeme [predmet].", "button_reminder_delete_yes", "button_reminder_delete_no");
              wasAlreadySend = true;
            break;
          case "reminder_show":
              remdb.findReminderByUser(sender_psid, (reminders) => {
                actions.callSendAPI(sender_psid,  showReminder(reminders));
              });
              wasAlreadySend = true;
            break;
          case "reminder_delete_spesific":
            remdb.deleteReminderBySubject(sender_psid, data["entities"]["lesson_name"][0].value, (changes) => {
              if (changes == 0) 
                actions.callSendAPI(sender_psid, "Uhmmm, takú písomku nemáš.");
              else 
                actions.callSendAPI(sender_psid, "O starosť menej.");
            });
            wasAlreadySend = true;
            break;
          case "welcome_message":
            responses.welcomeMessage(sender_psid, msg => {
              actions.callSendAPI(sender_psid, msg);
            });
            wasAlreadySend = true;
            break;
          case "save_user":
            addUser(sender_psid, data, text);
            wasAlreadySend = true;
            break;
          case "samko_mode":
            actions.callSendAPI(sender_psid, "nie!");
            wasAlreadySend = true;
            break;
          case "subscribe_memes":
            subsdb.checkIfExist(sender_psid, (exist) =>{
              if (exist == false) {
                subsdb.addSub(sender_psid);
                actions.callSendAPI(sender_psid, "Letz meme it up.");
              }
              else {
                actions.callSendAPI(sender_psid, "Neboj, už odoberáš freš memes.");
              }
            });
            wasAlreadySend = true;
            break;
          case "show_mood":
            responseText = basicResponses.mood();
            break;
          case "life_meaning":
            responseText = basicResponses.lifeMeaning();
            break;
          case "current_time":
            responseText = basicResponses.currentTime();
            break;
          case "tell_name":
            wasAlreadySend = true;
            userdb.checkIfExist(sender_psid, (exist) => {
              if (exist) {
                actions.callSendAPI(sender_psid, "Jednoznačne, " + exist[0]["first_name"] + ", prečo sa pýtaš?")
              }
              else{
                actions.callSendAPI(sender_psid, "Ahoj, " + sender_psid + "#. Zaťiaľ ťa poznám iba takto. Ale pokojne sa mi predstav.")
              }
            });
            break;
          case 'tell_joke':
            responseText = basicResponses.joke();
            Utils.getGifURL('laugh').then((gif_url) => actions.sendAttachment(sender_psid, 'image', gif_url))
            break;
          case 'tell_opinion':
            if(data['entities'].hasOwnProperty('opinion_object')) {
              let value = data['entities']['opinion_object'][0].value;
              let opinion_obj = basicResponses.getOpinionOn(value);
              responseText = opinion_obj.text;
              if (opinion_obj.hasOwnProperty('gif_keyword')) {
                Utils.getGifURL(opinion_obj.gif_keyword)
                  .then((gif_url) => actions.sendAttachment(sender_psid, 'image', gif_url))
              } else if (opinion_obj.hasOwnProperty('gif_url')) {
                actions.sendAttachment(sender_psid, 'image', opinion_obj.gif_url);
              }
            } else {
              responseText = 'Nevedel som vyhodnotiť, na čo si sa pýtal 😕. Čoskoro sa to ale naučím!';
            }
            break;
          case 'say_something':
            responseText = basicResponses.saySomething();
            break;
          case 'tell_why':
            if (! data['entities'].hasOwnProperty('why_object')) {
              responseText = 'Nevedel som vyhodnotiť, na čo si sa pýtal 😕. Čoskoro sa to ale naučím!';
            } else {
              responseText = basicResponses.tellWhy(data['entities']);
            }
            break;
          case 'compare':
            let cannot_compare = 'Aši mi ušlo nejaké slovíčko, neviem ti povedať 😕'
            if (!data['entities'].hasOwnProperty('compare_object')) {
              responseText = cannot_compare;
            } else {
              let compare_object_arr = data['entities']['compare_object'];
              if (compare_object_arr.length != 2) { // if not enough objects to compare
                responseText = cannot_compare;
              } else { // 
                responseText = basicResponses.compare(compare_object_arr[0].value, compare_object_arr[1].value);
              }
            }
            break;
          case 'say_bye':
            responseText = basicResponses.sayBye();
            break;
          case 'thanks':
            responseText = basicResponses.respondToThanks();
            break;
          case 'swear':
            responseText = basicResponses.handleSwearing();
            break;
          case 'tell_activity':
            responseText = basicResponses.tellActivity();
            break;
          case 'tell_favourite':
            if (! data['entities'].hasOwnProperty('favourite_obj')) {
              responseText = 'Nad tým som sa nikdy nezamýšľal 🤔';
            } else {
              responseText = basicResponses.tellFavourite(data['entities']['favourite_obj']);
            }
            break;
        }
      } else if (Object.keys(data.entities).length > 0) {
        if (data.entities.hasOwnProperty("greeting") && data.entities["greeting"][0].confidence > 0.7) {
          responses.welcomeMessage(sender_psid, msg => {
            actions.callSendAPI(sender_psid, msg);
          });
          return;
        }
        let max = -1;
        let id = -1;
        for (var i = 0; i < wit_entities.length; ++i){
          if (data["entities"].hasOwnProperty(wit_entities[i])){
            if(data["entities"][wit_entities[i]].confidence > max) {
              id = i;
              max = data["entities"][wit_entities[i]].confidence;
            }
          }
        }

        if (id != -1) {
          responseText = "Uhm, nerozumiem, čo si tým myslel. Rozumiem, ale slovíčku " + data["entities"][wit_entities[id]]["value"]  + ", skús ho použiť v inom kontexte."; 
        } else {
          responseText = "Zachytil som nejaké slovíčka, ale žiadne, ktorého by som sa mohol chytiť.";
        }

      } else {
        responseText = basicResponses.doesNotUnderstandMessage();
      }

      if (! wasAlreadySend) {
        actions.callSendAPI(sender_psid, responseText);
      }

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
  
  switch(payload) {
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
      }
}
