const Msg = require('./message.js');
const request = require('request');
const fetch = require('node-fetch');

module.exports = class Actions {
  constructor(PAGE_ACCESS_TOKEN) {
    this.__PAGE_ACCESS_TOKEN = PAGE_ACCESS_TOKEN;
    this.__attachmentResponseOffsetTime = 0; // seconds
  }
  
  messageRequest(sender_psid, structure, type="RESPONSE") {
    structure['messaging_type'] = type;
    
    const qs = 'access_token=' + encodeURIComponent(this.__PAGE_ACCESS_TOKEN);
    return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(structure)
    });  
  }
  
  facebookRequest(structure) {
    
    const qs = 'access_token=' + encodeURIComponent(this.__PAGE_ACCESS_TOKEN);
    return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(structure)
    });
  }
  
  sendButtons(sender_psid, question, buttons) {
    let payload = {
      "template_type":"button",
      "text": question,
      "buttons": buttons
    }
    return this.sendTemplate(sender_psid, payload);
  }
  
  sendTemplate(sender_psid, payload) {
    let request_body ={
      "recipient":{
        "id": sender_psid
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload": payload
        }
      }
    }
    return this.messageRequest(sender_psid, request_body);
  }

  callSendTagAPI(sender_psid, response, tag) {
     let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": new Msg(response),
      "tag": tag
    }
    return this.messageRequest(sender_psid, request_body, "MESSAGE_TAG");
  }
  
  setStatus(status, sender_psid) {
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "sender_action": status
    };
    return this.messageRequest(sender_psid, request_body); 
  }

  callSendAPI(sender_psid, response, type='RESPONSE') {
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": new Msg(response) 
    }
    return this.messageRequest(sender_psid, request_body, type);
  }
  
  setGreetingMsg() {
    let request_body_first = {"get_started": {"payload": "button_get_started"}};
    let request_body_second = {"greeting":[
      {
        "locale": "default",
        "text": "Posťažuj sa o študentskom živote, na komplikované veci zo zásady neodpisujem",
      }
    ]};
    this.setPersistentMenu();
    this.facebookRequest(request_body_first);
    this.facebookRequest(request_body_second);
  }
  
  setPersistentMenu() {
    let request_body = {
      "persistent_menu":[
        {
          "locale":"default",
          "composer_input_disabled": false,
          "call_to_actions":[
            {
              "title":"Zistiť obed",
              "type":"nested",
              "call_to_actions":[
                {
                  "title":"A-čko a B-čko",
                  "type":"postback",
                  "payload":"button_lunch"
                },
                {
                  "title":"A-čko",
                  "type":"postback",
                  "payload":"button_lunch_A"
                },
                {
                  "title":"B-čko",
                  "type":"postback",
                  "payload":"button_lunch_B"
                }
              ]
            }
          ]
        }
      ]
    }
    this.facebookRequest(request_body);
  }
  
  sendAttachment(sender_psid, type, url) {
    let request_body =  {
      "recipient":{
        "id": sender_psid
      },
      "message":{
        "attachment":{
          "type": type, 
          "payload":{
            "url": url, 
            "is_reusable":true
          }
        }
      }
    }
    return this.messageRequest(sender_psid, request_body, 'UPDATE');
  }
  
}