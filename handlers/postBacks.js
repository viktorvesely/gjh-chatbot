const Response = require('../responses/responseObject.js');
const ReminderDB = require('../database/reminders.js');
const UserDB = require('../database/user.js');

module.exports = class PostBackHandler {
  constructor(sender_psid, postBack, cache) {
    this.sender_psid = sender_psid;
    this.postBack = postBack;
    this.cache = cache;
  }
  
  resolve() {
    let handleFunction = this[this.postBack];
    if (handleFunction !== undefined) {
      return this[this.postBack]();
    }
    else {
      return this.ret("Uhmm, niečo sa pokazilo. My bad.", "invalid postback name: " + this.postBack);
    }
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
  
  button_save_reminder_yes () {
    console.log(this);
    let reminder = this.cache.get(this.sender_psid, "reminder");
    if (reminder === undefined) {
      return this.ret("Neskoro");
    }
    ReminderDB.insertNewReminder(reminder);
    return this.ret("Idem na to!");
  }
  button_save_reminder_no () {
    var response = new Response("text", "Akoby sa nestalo.").next("text", "Ak nie si spokojný s dátumom, odporúčam používať formát [deň]d[mesiac]m.").next("text", "Príklad: 28d9m pisem pisomku z chemie.");
    return new Promise (resolve => {
       resolve(response);
    })
  }
  
  button_reminder_delete_yes () {
    ReminderDB.deleteReminder(this.sender_psid);
    return this.ret("Bam! A sú fuč.");
  }
  button_reminder_delete_no () {
    return this.ret("Ha! Skoro som ich vymazal.");
  }
  
  button_right_name_yes() {
    let username = this.cache.get(this.sender_psid, "username");
    let names = username.split(" ");
    UserDB.addUser(this.sender_psid, names[0], names[1]);
    return this.ret("Tvoje meno je navždy zaznamenané. No nie je to super?");
  }
  
  button_right_name_no() {
    return this.ret("Tak teda nič.");
  }
}