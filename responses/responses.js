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
  
  whatCanIDo(sender_psid) {
    let request_body ={
      "recipient":{
        "id": sender_psid
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": "Pár vhodných vecí na začiatok: ",
            "buttons":[
              {
                "type": "postback",
                "title": "Čo dokážeš?",
                "payload": "button_show_powers"
              },
              {
                "type": "postback",
                "title": "Ahoj",
                "payload": "button_greeting"
              },
              {
                "type": "postback",
                "title": "Povedz mi o sebe viac.",
                "payload": "button_about_me"
              }
            ]
          }
        }
      }
    }
    return request_body;
  }
  
}