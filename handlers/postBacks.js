const Response = require('../responses/responseObject.js');
const ReminderDB = require('../database/reminders.js');
const UserDB = require('../database/user.js');
const Responses = require('../responses/responses.js');
const WitEntities = require('../wit/entities.js');
const TextHandler = require('./text.js');
const ContinualResponse = require('./continualResponses.js');
const Utils = require('../helpers/utils.js');
const BasicResponses = require('../responses/basic_responses.js');
const Generic = require('../templates/generic.js');
const Button = require('../templates/button.js');
const OfficeDirections = require('../office/directions.js');
const ClassroomDirections = require('../classroom/directions.js')
const Constants = require('../helpers/constants.js')

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
  
  // Get started and related
  button_get_started() {
    //TEST
    return new Promise(resolve => {
      resolve(new Response("text", "Som uväznený duch Jura Hronca... zasmej sa, nech mi nie je trápne 😅").next("generic", responses.menu(this.sender_psid)));
    });
  }
  
  button_about_gjh() {
    return new Promise(resolve => {
      resolve(new Response('text', BasicResponses.getInfo('gjh')));
    });
  }
  
  button_about_hronec() {
    return new Promise(resolve => {
      resolve(new Response('text', BasicResponses.getInfo('hronec')));
    });
  }
  
  button_user_identification() {
    return new Promise(resolve => {
      resolve(new Response("text", "Najprv mi prezraď, kto si 🧐").next("wait", 500).next('carousel', new Generic()
        .title("Študent 👨‍🎓")
          .subTitle("Chodím na GJH")
          .buttons(new Button("postback", "Presne tak", "identify_user", "student"))
          .image("https://cdn.glitch.com/69a8ca3a-18d8-421a-912d-2c0f9593e89d%2FJurko_student_v2.png?1546809653391")
          .setSquareRatio()
        .next()
          .title("Profesor 👩‍🏫")
          .subTitle("Učím na GJH")
          .buttons(new Button("postback", "Správne", "identify_user", "teacher"))
          .image("https://cdn.glitch.com/69a8ca3a-18d8-421a-912d-2c0f9593e89d%2FJurko_teacher_v2.png?1546809653644")
          .setSquareRatio()
        .next()
          .title("Uchádzač 🤩")
          .subTitle("Premýšľam nad GJH")
          .buttons(new Button("postback", "To som ja", "identify_user", "applicant"))
          .image("https://cdn.glitch.com/69a8ca3a-18d8-421a-912d-2c0f9593e89d%2FJurko_kid_v2.png?1546809653351")
          .setSquareRatio()
        .next()
          .title("Rodič 👩‍👦")
          .subTitle("Mám potomka na GJH")
          .buttons(new Button("postback", "Je to tak", "identify_user", "parent"))
          .image("https://cdn.glitch.com/69a8ca3a-18d8-421a-912d-2c0f9593e89d%2FJurko_parent_v2.png?1546809653566")
          .setSquareRatio()
       ))
    });
  }
  
  
  identify_user(role) {
    return new Promise(resolve => {
      switch (role) {
        case 'student':
          resolve(new Response('text', 'Ahoj, GJHák! 😁')
                  .next('text', 'Tu je zopár vecí, s ktorými ti rád pomôžem:')
                  .next('buttons', 'Zisti, čo dnes vypekajú:', new Button('postback', 'Menučko na dnes 🥣', 'get_lunch:today')
                       .next('postback', 'Zaplať obedy 🍝', 'pay_lunch'))
                  .next('buttons', 'Už nikdy nezabudni, kde máš hodinu:', new Button('postback', 'Nastaviť triedu 📚', 'set_class'))
                  .next('buttons', 'Ak práve začínaš na GJH, možno hľadáš:', new Button('postback', 'Triedu 📐🌎🖋', 'get_classroom_number')
                                                               .next('postback', 'Kabinet 👩‍🏫', 'get_office_directions'))
                  .next('text', 'Dokážem toho však oveľa viac 🙌')
                 )
          break;
        case 'teacher':
          resolve(new Response('text', 'Dobrý deň, kolega! 😉')
                  .next('text', 'Tu je zopár vecí, s ktorými ti rád pomôžem:')
                  .next('buttons', 'Zisti, čo dnes vypekajú:', new Button('postback', 'Menučko na dnes 🥣', 'get_lunch:today'))
                  .next('buttons', 'Už nikdy nezabudni, v ktorej triede učíš:', new Button('postback', 'Poďme na to! 🔕', 'set_teacher_name'))
                  .next('text', 'Dokážem toho však oveľa viac 🙌')
                 )
          break;
        case 'applicant':
          resolve(new Response('text', 'Vitaj, nádejný GJHák! 😁')
                  .next('text', 'Tu je zopár vecí, s ktorými ti rád pomôžem:')
                  .next('buttons', 'Pomôžem ti napríklad nájsť', 
                        new Button('postback', 'Cestu na GJH 🗺','request_travelmode')
                        .next('postback', 'Prijímačkové testy 📄', 'request_test_subject'))
                  .next('buttons', 'Nenašiel si, čo si hľadal?', new Button('url', 'Viac info 🔎', Constants.url.moreAboutApplication))
                  .next('buttons', 'Psst... inak, vedel si, že u nás môžeš získať štipko od Nadácie Novohradská?', new Button('url', 'Ako na to? 💸', 'https://gjh.sk/o-skole/nadacia-novohradska/Nadacia_stipendijny_program.pdf'))
                 )
          break;
        case 'parent':
          resolve(new Response('text', 'Dobrý! 😄')
                  .next('buttons', 'Chystáš sa na rodičko? Pomôžem napríklad nájsť:', 
                        new Button('postback', 'Kabinet učiteľa 👩‍🏫', 'get_office_directions')
                        .next('postback', 'Triedu dieťaťa 👩‍🎓', 'get_classroom')
                        .next('postback','Cestu na GJH 🗺','request_travelmode'))
                  .next('buttons', 'Mohlo by ťa tiež zaujímať:', 
                        new Button('url', 'EduPage pre rodiča 👩🏼‍💻', Constants.url.eduPageParentLogin)
                       .next('postback', 'Zaplatiť obedy 🍝', 'pay_lunch')
                       .next('postback', 'Prispieť nadácii 🏫', 'contribute'))
                 );
          break;
      }
      this.profile.fRole(role);
    });
  }
  
  button_show_powers() {
    return new Promise(resolve => {
      resolve(new Response('generic', responses.mainFunctions(this.sender_psid)));
    });
  }
  
  // Functions
  set_class() {
    return new Promise(resolve => {
      this.continualResponse.expect("get_class_id");
      resolve(new Response("text", "Napíš triedu, do ktorej chodíš").next("text", "Napr. ak si tretiak na IB, napíš III.IBDA:"));
    });
  }
  
  set_teacher_name() {
    return new Promise(resolve => {
      //this.continualResponse.expect("set_name");
      //resolve(new Response("text", "Napíš, prosím, svoje priezvisko:"));
      resolve(new Response("text", "Na tejto funkcii práve pracujeme 😉"));
    });
  }
  
  get_current_lesson(delta) {
    let n_delta = Number(delta) || 0;
    let entities = new WitEntities("delta", n_delta);
    return new TextHandler().simulate("current_lesson", entities.get(), this.profile, this.cache);
  }
  
  get_office_directions() {
    return new TextHandler().simulate("get_office_directions", new WitEntities(), this.profile, this.cache);
  }
  
  get_directions_to_known_office(office) {
    return new Promise((resolve, reject) => {
      OfficeDirections.getDirections(office)
        .then((msg)=> resolve(new Response('text', msg)))
        .catch((err_msg) => resolve(new Response('text', err_msg)));
    });
  }
  
  request_travelmode() {
    return new TextHandler().simulate("request_travelmode", new WitEntities(), this.profile, this.cache)
  }
  
  get_directions_to_school(travelmode) {
    return new Promise(resolve => {
      let response = new Response('text', undefined)
      switch (travelmode) {
        case 'bicycle':
          response.next('buttons', '🅿️ Bike si odparkuj v stojane na strane gymnázia smerom do suterénu', new Button('url', 'Cesta 🗺', Constants.url.maps.schoolDirections + '&travelmode=bicycling'))
          break;
        case 'car':
          response.next('buttons', '🚘', new Button('url', 'Cesta 🗺', Constants.url.maps.schoolDirections + '&travelmode=driving').next('postback', 'Parking 🅿️', 'get_parking_options'))
          break;
      }
      resolve(response)
    })
  }
  
  get_classroom() {
    return new TextHandler().simulate("get_classroom", new WitEntities(), this.profile, this.cache)
  }
  
  get_classroom_number() {
    return new TextHandler().simulate("get_classroom_number", new WitEntities(), this.profile, this.cache)
  }
  
  get_directions_to_known_classroom(classroom) {
    return new Promise((resolve, reject) => {
      ClassroomDirections.getDirections(classroom)
        .then((msg)=> resolve(new Response('text', msg)))
        .catch((err_msg) => resolve(new Response('text', err_msg)));
    });
  }
  
  get_lunch(time) {
    var entities;
    switch(time) {
      case 'today':
        entities = new WitEntities('time_today');
        break;
      case 'tomorrow':
        entities = new WitEntities('time_tomorrow');  
        break;
      default:
        entities = new WitEntities('time_day', time);
        break;
    }
    return new TextHandler().simulate('get_lunch', entities.get(), this.profile, this.cache);
  }
  
  get_parking_options() {
    return new TextHandler().simulate('get_parking_options', new WitEntities(), this.profile, this.cache);
  }
  
  request_test_subject() {
    return new TextHandler().simulate('request_test_subject', new WitEntities(), this.profile, this.cache);
  }
  
  pay_lunch() {
    return new TextHandler().simulate('pay_lunch', new WitEntities(), this.profile, this.cache);
  }
  
  
  contribute() {
    return new TextHandler().simulate('contribute', new WitEntities(), this.profile, this.cache);
  }
}