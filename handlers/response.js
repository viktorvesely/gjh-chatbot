const Utils = require('../helpers/utils.js');

class ResponseHandler {
  constructor(response, actions, sender_psid) {
    this.actions = actions;
    this.response = response;
    this.sender_psid = sender_psid;
  }
  
  getTasks(tag="") {
    var todos = [];
    var msgs = this.response.msgs;
    for (let i = 0; i < msgs.length; ++i) {
      let msg = msgs[i];
      this.validateType(msg.type);
      switch(msg.type) {
        case "text":
          todos.push(() => { return this.actions.callSendAPI(this.sender_psid, msg.value, tag); });
          break;
        case "buttons":
          todos.push(() => { return this.actions.sendButtons(this.sender_psid, msg.value, msg.options.get()); });
          break;
        case "image":
          todos.push(() => { return this.actions.sendAttachment(this.sender_psid, msg.type, msg.value); });
          break;
        case "generic":
          todos.push(() => { return this.actions.facebookRequest(msg.value); });
          break;
        case "gif":
          todos.push(() => { return new Promise((resolve, reject) => { 
            Utils.getGifURL(msg.value).then(url => {
                this.actions.sendAttachment(this.sender_psid, "image", url).then((res) => {
                  resolve();
                });
              });
            });
          });
          break; 
        case "wait":
          todos.push(() => { return new Promise(resolve => {
              setTimeout(() => {
                resolve()
              }, msg.value);             
            })
          })
          break;
        case "carousel":
          todos.push(() => { return this.actions.sendTemplate(this.sender_psid, msg.value._payload(), tag); });
          break;
        case "list":
          todos.push(() => { return this.actions.sendTemplate(this.sender_psid, msg.value._payload(), tag); });
          break;
      }
    }
    return todos;
  }
  
  validateType(type) {
    let valid = this.validTypes.includes(type);
    if (!valid) throw Error("ResponseHandler: unsupported response type. Expected " + JSON.stringify(this.validTypes) + " . Got " + type.toString());
    return valid;
  } 
}

ResponseHandler.prototype.validTypes = ["text", "image", "generic", "gif", "buttons", "wait", "carousel", "list"];

module.exports = ResponseHandler;