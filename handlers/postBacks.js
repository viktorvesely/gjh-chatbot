const Response = require('../responses/responseObject.js');
const ReminderDB = require('../database/reminders.js');
const UserDB = require('../database/user.js');
const Responses = require('../responses/responses.js');
const WitEntities = require('../wit/entities');
const TextHandler = require('./text');
const ContinualResponse = require('./continualResponses.js');
const Utils = require('../helpers/utils.js');
const BasicResponses = require('../responses/basic_responses.js');

const responses = new Responses();

module.exports = class PostBackHandler {
  constructor(profile, postBack, cache) {
    this.sender_psid = profile.fSender_psid();
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.profile = profile;
    this.postBack = postBack;
    let builder = postBack.split(":");
    this.handler = builder.shift();
    this.args = builder;
    this.cache = cache;
  }
  
  resolve() {
    let handleFunction = this[this.handler];
    if (handleFunction !== undefined) {
      return handleFunction.apply(this, this.args);
    }
    else {
      return this.ret("Uhmm, niečo sa pokazilo. My bad.", "invalid postback name: " + this.handler);
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
  
  button_save_reminder (save) {
    let shouldSave = save === "true";
    if (shouldSave) {
      let reminder = this.cache.get(this.sender_psid, "reminder");
      if (reminder === undefined) {
        return this.ret("Neskoro");
      }
      ReminderDB.insertNewReminder(reminder);
      return this.ret("Idem na to!");
    } else {
      var response = new Response("text", "Akoby sa nestalo.").next("text", "Ak nie si spokojný s dátumom, odporúčam používať formát [deň]d[mesiac]m.").next("text", "Príklad: 28d9m pisem pisomku z chemie.");
      return new Promise (resolve => {
         resolve(response);
      });
    }
  }
  
  button_reminder_delete (del) {
    if (del === "true") {
      ReminderDB.deleteReminder(this.sender_psid);
      return this.ret("Bam! A sú fuč.");
    } else {
      return this.ret("Ha! Skoro som ich vymazal.");
    }
  }
  
  button_right_name(isRight) {
    if (isRight === "true") {
      let names = this.cache.get(this.sender_psid, "username");
      this.profile.fFirstName(names[0]);
      if (names.length > 1) {
        this.profile.fSecondName(names[names.length - 1]); 
      }
      return this.ret("Tvoje meno je navždy zaznamenané. No nie je to super?");
    } else {
      return this.ret("Tak teda nič.");
    }
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
  
  // Get started and related
  button_get_started() {
    return new Promise(resolve => {
      resolve(new Response("text", "Som uväznený duch Jura Hronca... Super vtip, že?").next("text", "Budem sa snažiť spríjemniť ti život na GJH a na našej stránke.").next("generic", responses.menu(this.sender_psid)));
    });  
  }
  
  //CONTENT IS TEMPORARY
  button_about_gjh() {
    // INFO ABOUT STUDENTS' ACHIEVEMENTS, NOTABLE SCHOOL EVENTS, ..., NOTABLE ALUMNI
    return new Promise(resolve => {
      resolve(new Response('text', BasicResponses.getInfo('gjh')));
    });
  }
  
  button_about_hronec() {
    return new Promise(resolve => {
      resolve(new Response('text', BasicResponses.getInfo('hronec')));
    });
  }
  
  
  // User identification
  button_identify_user() {
    return new Promise(resolve => {
      resolve(new Response('generic', responses.userTypes('general', this.sender_psid)));
    });
  }
  
  button_identify_gjh() {
    return new Promise(resolve => {
      resolve(new Response('generic', responses.userTypes('gjh', this.sender_psid)));
    });
  }
  
  button_identify_stranger() {
    return new Promise(resolve => {
      resolve(new Response('generic', responses.userTypes('stranger', this.sender_psid)));
    });
  }
  
  // Modify content based on user
  button_user_teacher() {
    return new Promise(resolve => {
      resolve(new Response('text', 'teacher'));
    });
  }
  
  button_user_student() {
    return new Promise(resolve => {
      resolve(new Response('text', 'student'));
    });
  }
  
  button_user_parent() {
    return new Promise(resolve => {
      resolve(new Response('text', 'parent'));
    });
  }
  
  button_user_applicant() {
    return new Promise(resolve => {
      resolve(new Response('text', 'applicant'));
    });
  }
  
  button_show_powers() {
    return new Promise(resolve => {
      resolve(new Response('generic', responses.mainFunctions(this.sender_psid)));
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