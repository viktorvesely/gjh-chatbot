const Response = require('../responses/responseObject.js');
const ReminderDB = require('../database/reminders.js');
const UserDB = require('../database/user.js');
const Responses = require('../responses/responses.js');
const WitEntities = require('../wit/entities');
const TextHandler = require('./text');
const ContinualResponse = require('./continualResponses.js');

const responses = new Responses();

module.exports = class PostBackHandler {
  constructor(profile, postBack, cache) {
    this.sender_psid = profile.fSender_psid();
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.profile = profile;
    this.postBack = postBack;
    this.cache = cache;
  }
  
  resolve() {
    let handleFunction = this[this.postBack];
    if (handleFunction !== undefined) {
      return handleFunction.call(this);
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
    this.profile.fFirstName(names[0]);
    this.profile.fSecondName(names[1]);
    UserDB.addUser(this.sender_psid, names[0], names[1]);
    return this.ret("Tvoje meno je navždy zaznamenané. No nie je to super?");
  }
  
  
  // Lunch postbacks
  button_right_name_no() {
    return this.ret("Tak teda nič.");
  }
  
  button_lunch() {    
    let entities = new WitEntities().get(); // no entities are required for this handler
    return new TextHandler().simulate("get_lunch", entities, this.profile, this.cache);
  }
   
  button_lunch_A() {
    let entities = new WitEntities("lunch_option_1", "acko").get(); // use function next for next entity
    return new TextHandler().simulate("get_lunch", entities, this.profile, this.cache);
  } 
  
  button_lunch_B() {
    let entities = new WitEntities("lunch_option_2", "bcko").get();
    return new TextHandler().simulate("get_lunch", entities, this.profile, this.cache);
  }
  
  // Get started
  button_get_started() {
    return new Promise(resolve => {
      resolve(new Response("text", "Tak poďme na to. Som uväznený duch Jura Hronca.").next("text", "... `Super vtip, čo?").next("text", "Budem sa ti snažiť spríjemniť život na GJH.").next("generic", responses.whatCanIDo(this.sender_psid)));
    });  
  }
  
  set_class() {
    return new Promise(resolve => {
      this.continualResponse.expect("get_class_id");
      resolve(new Response("text", "Teraz mi napíš triedu, do ktorej chodíš.").next("text", "Napríklad si IB tretiak, tak napíš III.IBDA"));
    });
  }
  
  get_current_lesson() {
    return new TextHandler().simulate("current_lesson", new WitEntities().get(), this.profile, this.cache);
  }
}