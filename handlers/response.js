const Utils = require('../helpers/utils.js');

class ResponseHandler {
  constructor(response, actions, sender_psid) {
    this.actions = actions;
    this.response = response;
    this.sender_psid = sender_psid;
  }
  
  getTasks() {
    var todos = [];
    var msgs = this.response.msgs;
    for (let i = 0; i < msgs.length; ++i) {
      let msg = msgs[i];
      this.validateType(msg.type);
      switch(msg.type) {
        case "text":
          todos.push(() => { return this.actions.sendMessage(this.sender_psid, msg); });
          break;
        case "buttons":
          todos.push(() => { return  this.actions.sendButtons(this.sender_psid, msg); });
          break;
        case "image":
          todos.push(() => { return  this.actions.sendImage(this.sender_psid, msg); });
          break;
        case "gif":
          todos.push(() => { return new Promise((resolve, reject) => { 
            Utils.getGifURL(msg.value).then(url => {
                this.actions.sendImage(this.sender_psid, msg).then(() => {
                  resolve();
                });
              });
            });
          });
          break; 
        case "wait":
          todos.push(() => { return new Promise(resolve => {
              setTimeout(() => {
                resolve();
              }, msg.value);             
            })
          })
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

ResponseHandler.prototype.validTypes = ["text", "image", "gif", "buttons", "wait"];

module.exports = ResponseHandler;