const userdb = require('../database/user.js');


module.exports = class Responses {
  constructor() {
  }
  
  welcomeMessage(sender_psid, callback) {
    userdb.checkIfExist(sender_psid, (exist) => {
      if (exist) {
        callback("*Veľmi usilovne mávam* - asi to ale nevidíš, " + exist[0]["first_name"] + ".");
      } else {
        callback("Ahoj, " + sender_psid + "#. Zatiaľ ťa poznám iba takto. Nehanbi sa a predstav sa mi. Nekúšem ;).");
      }
    });
  }
  
  menu(sender_psid) {
    return {
      "recipient":{
        "id": sender_psid
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": "Budem ťa sprevádzať životom na GJH alebo školským webom",
            "buttons":[
              {
                "type": "postback",
                "title": "Povedz o sebe viac",
                "payload": "button_about_hronec"
              },
              {
                "type": "postback",
                "title": "Čo je GJH?",
                "payload": "button_about_gjh"
              },      
              {
                "type": "postback",
                "title": "Čo dokážeš?",
                "payload": "button_user_identification"
              }
            ]
          }
        }
      }
    }
  }
  /*
  userTypes(identifier, sender_psid) {
    let text, button1, button2, payload1, payload2;
    
    switch(identifier) {
      case "general":
        text = "Najprv mi prezraď, odkiaľ si:";
        button1 = "Som z GJH";
        payload1 = "button_identify_gjh";
        button2 = "Nie som z GJH";
        payload2 = "button_identify_stranger";
        break;
      case "gjh":
        text = "Vitaj, GJH-ák! A čože si?";
        button1 = "Som učiteľ";
        payload1 = "button_user_teacher";
        button2 = "Som študent";
        payload2 = "button_user_student";
        break;
      case "stranger":
        text = "Cíť sa tu ako doma, návštevník! A čože si?";
        button1 = "Som rodič";
        payload1 = "button_user_parent";
        button2 = "Som uchádzač";
        payload2 = "button_user_applicant";
        break;
      }
        
    return {
      "recipient":{
        "id": sender_psid
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": text,
            "buttons":[
              {
                "type": "postback",
                "title": button1,
                "payload": payload1
              },
              {
                "type": "postback",
                "title": button2,
                "payload": payload2
              }
            ]
          }
        }
      }
    }
  }
  */
  mainFunctions(sender_psid) {
    return {
      "recipient":{
        "id": sender_psid
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": "Viem povedať:",
            "buttons":[
              {
                "type": "postback",
                "title": "Akú máš teraz hodinu",
                "payload": "button_about_hronec"
              },
              {
                "type": "postback",
                "title": "Čo je na obed",
                "payload": "button_about_hronec"
              },      
              {
                "type": "postback",
                "title": "Kde má kto kabinet",
                "payload": "button_about_hronec"
              }
            ]
          }
        }
      }
    }
  }
}