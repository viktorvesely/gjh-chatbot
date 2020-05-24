const Utils = require('../helpers/utils.js');
const Actions = require('../helpers/actions.js');
const ReminderInterface = require('../interface/reminder.js');
const Response = require('../responses/responseObject.js');
const Responses = require('../responses/responses.js');
const ReminderDB = require('../database/reminders.js');
const BasicResponses = require('../responses/basic_responses.js');
const request = require('request');
const Lunch = require('../interface/lunch.js');
const gTimeTableManager = require('../timetable/manager.js');
const ContinualResponse = require('./continualResponses.js');
const Button = require('../templates/button.js');
const Generic = require('../templates/generic.js');
const List = require('../templates/list.js');
const OfficeManager = require('../office/manager.js');
const Dates = require('../helpers/dates.js')
const Constants = require('../helpers/constants.js')

const reminderI = new ReminderInterface();
const responses = new Responses();
const lunchHandler = new Lunch();

class MessageHandler {
  constructor (response, profile, cache, originalText) {
    if (typeof response === "undefined") {
      return this;
    }
    this.cache = cache;
    this.response = response;
    this.sender_psid = profile.fSender_psid();
    this.profile = profile;
    this.originalText = originalText;
    this.continualResponse = new ContinualResponse(profile, cache, originalText);
    let entities = this.entities = response.entities;
    let intent = this.intent = response.entities ? response.entities.intent : undefined;
  }
  
  simulate(intent, entities, profile, cache) {
    this.entities = entities;
    this.profile = profile;
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.sender_psid = profile.fSender_psid();
    this.cache = cache;
    return this[intent]();
  }
  
  resolve () {
    let entities = this.entities;
    let intent = this.intent;
    if (Utils.isConfident(intent)) {
      return this[intent[0].value]();
    }
    else if (Object.keys(entities).length > 0) {
      return this.partiallyDontKnow(entities);
    }
    else {
      return this.ret(this.dontKnow());
    } 
  }
  
  dontKnow() {
    return BasicResponses.doesNotUnderstandMessage();
  }
  
  partiallyDontKnow(entities) {
    return new Promise(resolve => {
      var max = -1;
      var maxName;
      for (let name in entities) {
        let entity = entities[name];
        if(entity[0].confidence > max) {
          max = entity[0].confidence;
          maxName = name;
        }
      }
      if (maxName === "intent") {
        resolve(new Response("text","Trochu chápem, čo sa mi snažíš povedať, ale asi to nie je formáciu vety").next("text", "Skús to trochu inak 😅"));
        return;
      }
      resolve(new Response("text", "Uhm, nerozumiem, čo si tým myslel. Rozumiem, ale slovíčku \"" + entities[maxName][0]["value"] + "\".").next("text", "Skús ho použiť v inom kontexte."));
    })
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
  
  static __internal_error_response() {
    return new Response("text", "Internal server error has occured while trying to resolve your request").next("text", "Tough luck pre teba (pls skontaktuj môjho developera)");
  }
  
  debug_command() {
    return new Promise((resolve, reject) => {
      gTimeTableManager.getCurrentLesson(this.profile.fClassId(), 1).then(lessons => {
        if (lessons) {
          let response;
          lessons.forEach((lesson, i) => {
            if (i === 0) {
              response = new Response("text", `${lesson.subject} v ${lesson.room} s ${lesson.teacher}`);
            } else {
              response.next("text", `${lesson.subject} v ${lesson.room} s ${lesson.teacher}`);
            }
          });
          resolve(response);
        } else {
          resolve(new Response("text", "Nemáš žiadnu. To je ale slasti!"))
        }
      }).catch(e => {
        reject(new Response("text", "Nedokážem načítať tvoje hodiny :(").setError(e));
      });
    });
  }
  
  current_lesson() {
    return new Promise((resolve, reject) => {
      if (!this.profile.fRole()) {
        resolve("buttons", "Neviem, či si učiteľ alebo študent 🤔", new Button("postback", "Nastaviť, kto som 💪", "button_user_identification"));
        return;
      }
      switch (this.profile.fRole()) {
        case "student":
          if (!this.profile.fClassId()) {
            this.continualResponse.expect("get_class_id");
            resolve(new Response("text", "Ešte neviem, do akej triedy chodíš. Napíš mi meno triedy.").next("text", "Napríklad ak do 3.C, tak napíš III.C"));
            return;
          }
          break;
        case "teacher":
          if (!this.profile.fFirstName() || !this.profile.fSecondName()) {
            this.continualResponse.expect("set_name");
            resolve(new Response("text", "Neviem, kto si. Potrebujem od teba tvoje krstné meno A priezvisko. Tak mi ho sem prosím napíš")
                    .next("text", "Ak nemáš záujem, tak napíš \"zruš\""));
          }
          break;
        case "parent":
          if (!this.profile.fClassId()) {
            this.continualResponse.expect("get_class_id");
            resolve(new Response("text", "Ešte neviem, do akej triedy chodí tvoje dieťa. Napíš mi meno jeho/jej triedy.").next("text", "Napríklad ak do 2.C, tak napíš II.C"));
            return;
          }
          break;
        case "applicant":
          break;
      }
      gTimeTableManager.getCurrentLesson(this.profile.fClassId(), this.entities.delta[0].value).then(lessons => {
        if (lessons) {
          let response;
          lessons.forEach((lesson, i) => {
            if (i === 0) {
              response = new Response("text", `${lesson.subject} v ${lesson.room} s ${lesson.teacher}`);
            } else {
              response.next("text", `${lesson.subject} v ${lesson.room} s ${lesson.teacher}`);
            }
          });
          resolve(response);
        } else {
          resolve(new Response("text", "Nemáš žiadnu. To je ale slasti!"))
        }
      }).catch(e => {
        reject(new Response("text", "Nedokážem načítať tvoje hodiny :(").setError(e));
      });
    });
  }
  
  specific_lesson() {
    return this.ret("Angličtina 505");
  }
  
  reminder_time() {
    let reminder = reminderI.parseReminder(this.entities, this.sender_psid);
    if (reminder.error) {
      return this.ret(reminder.error);
    }
    this.cache.set(this.sender_psid, "reminder", reminder);
    return new Promise(resolve => {
      resolve(new Response("buttons", reminderI.makeConfirmationQuestion(reminder), new Button("postback" ,"Áno", "button_save_reminder", true).next("postback", "Nie", "button_save_reminder", false)));
    });
  }
  
  reminder_delete() {
    return new Promise((resolve) => {
      let response = new Response(
        "buttons",
        "Naozaj mám zmazať všetky pripomienky? Jednotlivé pripomienky zmažeš správou Nepíšeme [predmet].",
        new Button("postback", "Preč s nimi ", "button_reminder_delete", true).next("postback", "Nie", "button_reminder_delete", false)
      );
      resolve(response);
    });
  }
  
  reminder_delete_spesific() {
    return new Promise(resolve => {
      ReminderDB.deleteReminderBySubject(this.sender_psid, this.entities["lesson_name"][0].value, (changes) => {
        if (changes == 0) 
          resolve(new Response("text", "Uhmmm, takú písomku nemáš."));
        else
          resolve(new Response("text", "O starosť menej."));
      });
    });
  }
        
  reminder_show() {
    return new Promise((resolve, reject) => {
      ReminderDB.findReminderByUser(this.sender_psid, (reminders) => {
        if (!reminders) {
          reject(new Response("text", "Nepodarilo sa mi to :(", [], "Could not find reminders by psid"));
        }
        else {
          resolve(new Response("text", reminderI.print(reminders)).next("gif", "fake laugh"));
        }
      });
    });
  }
  
  welcome_message() {
    return new Promise((resolve, reject) => {
      if (this.profile.fFirstName()) {
        resolve(new Response("text", "*Veľmi usilovne mávam* - asi to ale nevidíš, " + this.profile.fFirstName() + "."));
      } else {
        resolve(new Response("text", "Ahoj, " + this.sender_psid + "#. Zatiaľ ťa poznám iba takto. Nehanbi sa a predstav sa mi.").next("text", "Nekúšem ;)."));
      }
    });
  }
  
  save_user() {
    if (this.entities.hasOwnProperty("s_first_name")) {
      return new Promise(resolve => {
      resolve(new Response("buttons", "'" + confirmationName + "', je to správne?",
                           new Button("postback", "Správne 👌", "button_right_name", true)
                           .next("postback", "Nie 🙄", "button_right_name", false)
                          ));
      });
    }
    let name = Utils.userNameParser(this.entities, this.originalText);
    let confirmationName = "";
    if (!name || name.length === 0) {
      return this.ret("Tak tomuto menu fakt nerozumiem.", "Could not parse username (undefined)");
    }
    let names = name.split(" ");
    names = names.filter(name => !!name); // in case of empty string
    if (names.length === 1 || names.length === 2) {
      confirmationName = name;
    }
    else if (names.length > 2) {
      confirmationName = names[0] + " " + names[names.length - 1];
    }
    this.cache.set(this.sender_psid, "username", names);
    return new Promise(resolve => {
      resolve(new Response("buttons", "Naozaj je '" + confirmationName + "' tvoje meno?",
                           new Button("postback", "Správne 👌", "button_right_name", true)
                           .next("postback", "Nie 🙄", "button_right_name", false)
                          ));
    });
  }
  
  show_mood() {
    return this.ret(BasicResponses.mood());
  }
  
  life_meaning() {
    return new Promise(resolve => {
      Utils.getGifURL("to be or not to be?").then( url => {
        resolve(new Response("image", url).next("text", BasicResponses.lifeMeaning()));
      });
    });
  }
  
  current_time() {
    return this.ret(BasicResponses.currentTime()); 
  }
  
  tell_user_name() {
    return new Promise(resolve => {
      if (this.profile.fFirstName()) {
        resolve(new Response("text", this.profile.fFirstName() + " " + this.profile.fSecondName() + ", prečo sa pýtaš?"));
      } else {
        resolve(new Response("text", "Ahoj, " + this.sender_psid + "#. Zaťiaľ ťa poznám iba takto. Ale pokojne sa mi predstav."));
      }
    });
  }
  
  tell_bot_name() {
    return new Promise(resolve => {
      resolve(new Response('text', BasicResponses.botName()))
    });
  }
  
  compare() {
    return new Promise(resolve => {
      let cannotCompareMsg = "Aši mi ušlo nejaké slovíčko, neviem ti povedať 😕";
      var responseText;
      if (! this.entities.hasOwnProperty('compare_object')) {
        responseText = cannotCompareMsg;
      } else {
        let compare_object_arr = this.entities['compare_object'];
        if (compare_object_arr.length != 2) { // if not enough objects to compare
          responseText = cannotCompareMsg;
        } else {
          responseText = BasicResponses.compare(compare_object_arr[0].value, compare_object_arr[1].value);
        }
      }
      resolve(new Response('text', responseText));
    });
  }
  
  tell_joke() {
    return new Promise(resolve => {
      let joke = BasicResponses.joke()
      resolve(new Response("text", joke).next("wait", joke.length * 50).next('gif', 'laugh'));
    });
  }
  
  say_bye() {
    return this.ret(BasicResponses.sayBye());
  }
  
  thanks() {
    return this.ret(BasicResponses.respondToThanks());
  }
  
  swear() {
    return this.ret(BasicResponses.handleSwearing());
  }
  
  samko_mode() {
    return new Promise(resolve => {
      resolve(new Response("text", "This feature is no longer supported, I am so sorry.").next("text", "samko samko 4ever"));
    });
  }
  
  subscribe_memes() {
    return this.ret("nie");
  }
  
  tell_why() {
    return new Promise(resolve => {
      let responseText;
      
      if (! this.response.entities.hasOwnProperty('why_object')) {
        responseText = 'Nevedel som vyhodnotiť, na čo si sa pýtal 😕. Čoskoro sa to ale naučím!';
      } else {
        responseText = BasicResponses.tellWhy(this.response.entities);
      }
      
      resolve(new Response('text', responseText));
    });
  }
  
  tell_activity() {
    return new Promise(resolve => {
      let responseText = BasicResponses.tellActivity();
      resolve(new Response('text', responseText));
    });
  }
  
  tell_favourite() {
    return new Promise(resolve => {
      let responseText;
      if (! this.response.entities.hasOwnProperty('favourite_obj')) {
        responseText = 'Aši mi ušlo nejaké slovíčko, neviem 😕';
      } else {
        responseText = BasicResponses.tellFavourite(this.response.entities.favourite_obj[0].value);
      }
      resolve(new Response('text', responseText));
    });
  }
  
  say_something() {
    return new Promise(resolve => {
      let responseText = BasicResponses.saySomething();
      resolve(new Response('text', responseText));
    });
  }
  
  tell_opinion() {
    return new Promise(resolve => {
      let responseText;
      if (this.response.entities.hasOwnProperty('opinion_object')) {
        let value = this.response.entities.opinion_object[0].value;
        let opinion_obj = BasicResponses.getOpinionOn(value);
        responseText = opinion_obj.text;
        if (opinion_obj.hasOwnProperty('gif_keyword')) {
          resolve(new Response("gif", opinion_obj.gif_keyword).next("text", responseText));
        } else if (opinion_obj.hasOwnProperty('gif_url')) {
          resolve(new Response("image", opinion_obj.gif_url).next("text", responseText));
        } else {
          resolve(new Response("text", responseText));
        }
      } else {
        responseText = 'Nevedel som vyhodnotiť, na čo si sa pýtal 😕. Čoskoro sa to ale naučím!';
        resolve(new Response('text', responseText)); 
      }
    });
  }
  
  get_lunch() {
    return new Promise((resolve, reject) => {
      var offset = Dates.getLunchDayOffset(this.entities)
      var getA = this.entities.hasOwnProperty('lunch_option_1')
      var getB = this.entities.hasOwnProperty('lunch_option_2')
      lunchHandler.getLunchText(offset, getA, getB).then((properties) => {
          var response = new Response('text', undefined);
          properties.forEach((property) => response.next('text', property));
          resolve(response);
        }).catch((err_msg) => resolve(new Response("text", err_msg)));
    });
  }
  
  e_swim() {
    return new Promise(resolve => {
      var dayIndex = Utils.parseDayIndexFromDaySpecificationEntity(this.entities["e_time_specification"]);
      if (dayIndex === -1) {
        resolve(new Response("text", "Could not understand the time"));
        return;
      }
      request("https://paper-tornado.glitch.me/timeLine.json?days=" + dayIndex, (err, res, body) => {
        var data = JSON.parse(body);
        var isAlright = true;
        var response = null;
        for (let i = 0; i < data.periods.length; ++i) {
          let period = data.periods[i];
          if (data.closed) {
            resolve(new Response("text", "The pool is closed for today 😪"));
            return;
          } else if (period.lines < 5) {
            if (isAlright) {
              response = new Response("text", "Yes, but watch out for");
            }
            isAlright = false;
            var start = Utils.fromUtcTimeToHours(period.start);
            var end = Utils.fromUtcTimeToHours(period.end);
            if (period.lines === 0) {
              response.next("text", start[0] + ":" + start[1]  + " - " + end[0] + ":" + end[1] + " the pool is closed");
            } else {
              response.next("text", start[0] + ":" + start[1]  + " - " + end[0] + ":" + end[1] + " there are only " + period.lines + " lines opened");
            }
          }
        }
        if (isAlright) {
          response = new Response("text", "Yes, enjoy."); 
        }
        let startTime = Utils.fromUtcTimeToHours(data.periods[0].start);
        var endTime = Utils.fromUtcTimeToHours(data.periods[data.periods.length - 1].end);
        response.next("text", `The swimming pool opens at ${startTime[0]}:${startTime[1]} and closes at ${endTime[0]}:${endTime[1]}`);
        resolve(response);
        if (!isAlright) {
          response.next("text", "enjoy your swim!");
        }
      })
    }); 
  }
  
  get_office_directions() {
    let teacherEntity = this.entities["gjh_teacher"]
    let teacherName = teacherEntity ? teacherEntity[0]["value"] : null
    
    if (teacherName) {
      return OfficeManager.getOfficeDirections(teacherName)
    }
    return new Promise(resolve => {
      this.continualResponse.expect("get_office_directions_from_teachername");
      resolve(new Response("text", "Napíš, prosím, meno pedagóga, ktorého hľadáš 👩🏼‍🏫👨🏻‍🏫"));
    });  
  }
  
  request_travelmode() {
    return new Promise(resolve => {
      resolve(new Response('buttons', 'Ako prídeš?', new Button('url','MHD 🚌', Constants.url.maps.schoolDirections + '&travelmode=transit').next('postback','Bikom 🚲','get_directions_to_school:bicycle').next('postback','Autom  🚘','get_directions_to_school:car')))
    });
  }

  get_parking_options() {
    return new Promise(resolve => {
      resolve(new Response('buttons', 'Zaparkovať môžeš na mini parkovisku školy:', new Button('url', 'Mini parkovisko 📌', Constants.url.maps.parkingLot)).next('text', 'Počítaj však s tým, že počas rodička býva plné 😕').next('text', 'Vtedy je najlepšie zaparkovať v okolitých uličkách'))
    });
  }
  
  why_informal() {
    return new Promise(resolve => {
      resolve(new Response('text', `Ja už mám ${Utils.getYearsFrom(Constants.date.jurHronecBirthdate)} rokov... snáď ma nechceš naprávať`).next('text', '😄😉'))
    })
  }
  
  tell_age() {
    return new Promise(resolve => {
      resolve(new Response('text', `${Utils.getYearsFrom(Constants.date.jurHronecBirthdate)} rokov... už mi lásko není dvacet let 🙁`))
    })
  }
  
  accept_praise() {
    return this.ret(BasicResponses.acceptPraise());
  }
  
  get_classroom() {
    return new Promise(resolve => {
      this.continualResponse.expect("get_classroom_directions_from_teachername")
      resolve(new Response('text', 'Napíš, prosím, meno triedneho 👨🏻‍🏫/triednej 👩🏼‍🏫'))
    });
  }
  
  get_classroom_number() {
    return new Promise(resolve => {
      this.continualResponse.expect("get_classroom_number")
      resolve(new Response('text', 'Napíš, prosím, číslo triedy:'))
    });
  }
  
  request_test_subject() {
    return new Promise(resolve => {
      resolve(new Response('buttons', 'Ktorý predmet ťa zaujíma?', 
                           new Button('url', 'Matematika 🔢', Constants.url.test.maths)
                           .next('url', 'Slovenčina 🇸🇰', Constants.url.test.slovak)
                          ))
    })
  }
  
  pay_lunch() {
    return new Promise(resolve => {
      resolve(new Response('text', '1️⃣ V EduPagi v sekcii "Platby" nájdeš sumu na zaplatenie, IBAN a variabilný symbol')
              .next('text', '2️⃣ Konštantný symbol je 0308')
              .next('buttons', '3️⃣ Do poznámky nezabudni uviesť meno a triedu stravníka 😉', 
                    new Button('url', 'Poďme na to 👩🏽‍💼', Constants.url.eduPageLogin)
                    .next('url', 'Viac o obedoch 🔎', Constants.url.moreAboutLunches))
              .next('buttons', '... inak v EduPage appke všetko zaplatíš jednoducho cez VIAMO 📱', 
                    new Button('url', 'iOS', Constants.url.eduPageAppLink.iOS)
                    .next('url', 'Android', Constants.url.eduPageAppLink.Android))
             )
    })
  }
  
  contribute() {
    return new Promise(resolve => {
      resolve(new Response('buttons', 'Akou formou by si chcel(a) prispieť? 🤔', new Button('url', 'Prevodom 🏦', Constants.url.nadaciaNovohradskaAnyContribution).next('url', '2% z daní 👩🏽‍💼', Constants.url.nadaciaNovohradskaTwoPercent)))
    })
  }
};

module.exports = MessageHandler;
