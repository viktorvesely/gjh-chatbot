const Utils = require('../helpers/utils.js');
const ReminderInterface = require('../interface/reminder.js');
const Response = require('../responses/responseObject.js');
const ReminderDB = require('../database/reminders.js');

const reminderI = new ReminderInterface();

module.exports = class MessageHandler {
  constructor (response, sender_psid, cache) {
    this.cache = cache;
    this.response = response;
    this.sender_psid = sender_psid;
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
      if (!responseText) {
        response.error = "No response text";
        response.value = "Prečo som ti chcel odpísať nič? Niečo sa pokazilo."
        reject(response);
      }
      else if (error) {
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
      ReminderDB.findReminderByUser(this.sender_psid, (reminders) => {
        if (!reminders) reject(this.ret('Nepodarilo sa mi to :(', "Could not find reminders by psid"));
        else return new Promise(resolve =>  {
          resolve(new Response("text", reminderI.print(reminders)));
        });
      });
    });
  }
}