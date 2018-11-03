const Utils = require('../helpers/utils.js');
const ReminderInterface = require('../interface/reminder.js');
const Response = require('../responses/responseObject.js');
const Responses = require('../responses/responses.js');
const ReminderDB = require('../database/reminders.js');
const BasicResponses = require('../responses/basic_responses.js');

const reminderI = new ReminderInterface();
const responses = new Responses();

module.exports = class MessageHandler {
  constructor (response, sender_psid, cache, originalText) {
    this.cache = cache;
    this.response = response;
    this.sender_psid = sender_psid;
    this.originalText = originalText;
    let entities = this.entities = response.entities;
    let intent = this.intent = response.entities ? response.entities.intent : undefined;
  }
  
  resolve () {
    let entities = this.entities;
    let intent = this.intent;
    if (Utils.isConfident(intent)) {
      return this[intent[0].value]();
    }
    else if (Object.keys(entities).length > 0) {
      return this.ret(this.partiallyDontKnow(entities));
    }
    else {
      return this.ret(this.dontKnow);
    } 
  }
  
  dontKnow() {
    return "";
  }
  
  partiallyDontKnow(entities) {
    return "";
  }
  
  ret(responseText, error="") {
    var response = new Response("text", responseText);
    return new Promise((resolve, reject) => {
      if (error) {
        response.error = error;
        reject(response);
      }
      else resolve(response);
    })
  }
  
  current_lesson() {
    return this.ret("Teraz máš nemčinu 303. Legit.");
  }
  
  spesific_lesson() {
    return this.ret("Angličtina 505");
  }
  
  teacher_cabinet() {
    return this.ret("815");
  }
  
  today_lunch() {
    return new Promise(resolve => {
      Utils.getGifURL("food").then((url) => {
        resolve(new Response("text", "Jedlo").next("image", url).next("text", "... yummy"));
      })
    });
  }
  
  reminder_time() {
    let reminder = reminderI.parseReminder(this.entities, this.sender_psid);
    if (reminder.error) {
      return this.ret(reminder.error);
    }
    this.cache.set(this.sender_psid, "reminder", reminder);
    return new Promise(resolve => {
      resolve(new Response("confirmation", reminderI.makeConfirmationQuestion(reminder), ["button_save_reminder_yes", "button_save_reminder_no"]))
    });
  }
  
  reminder_delete() {
    return new Promise((resolve) => {
      let response = new Response(
        "confirmation",
        "Naozaj mám zmazať všetky pripomienky? Jednotlivé pripomienky zmažeš správou Nepíšeme [predmet].",
        ["button_reminder_delete_yes", "button_reminder_delete_no"]
      );
      resolve(response);
    });
  }
        
  reminder_show() {
    return new Promise((resolve, reject) => {
      Utils.getGifURL("fake laugh").then((url) => {
        ReminderDB.findReminderByUser(this.sender_psid, (reminders) => {
          if (!reminders) {
            reject(new Response("text", "Nepodarilo sa mi to :(", [], "Could not find reminders by psid"));
          }
          else {
            resolve(new Response("text", reminderI.print(reminders)).next("image", url));
          }
        });
      });
    });
  }
  
  welcome_message() {
    return new Promise((resolve, reject) => {
      responses.welcomeMessage(this.sender_psid, msg => {
        resolve(new Response("text", msg));
      });
    });
  }
  
  save_user() {
    let name = Utils.userNameParser(this.entities, this.originalText);
    if (!name || name.length === 0) {
      return this.ret("Tak tomuto menu fakt nerozumiem.", "Could not parsed username (is undefined)");
    }
    else if (name.split(" ").length !== 2) {
      return this.ret("Super meno, " + name + ", ale poprosím ťa len o presné krstné meno a priezvisko.");
    }
    else {
      this.cache.set(this.sender_psid, "username", name);
      return new Promise(resolve => {
        resolve(new Response("confirmation", "Naozaj je '" + name + "' tvoje meno? Prosím, nech je aj s diakritikou.", ["button_right_name_yes", "button_right_name_no"]));
      });
    }
  }
  
  show_mood() {
    return this.ret(BasicResponses.mood());
  }
  
  life_meaning() {
    return new Promise(resolve => {
      Utils.getGifURL("meaning of life").then( url => {
        resolve(new Response("image", url).next("text", BasicResponses.lifeMeaning()));
      });
    });
  }
  
  current_time() {
   return this.ret(BasicResponses.currentTime()); 
  }
};