const Generic = require('../templates/generic.js');
const List = require('../templates/list.js');

module.exports = class TemplateDecoder {
  constructor(response) {
    this.new = response;
    this.original = {
      msgs: []
    }
    
    this.original.msgs = this.new.msgs.map(msg => {
      switch(msg.type) {
        case "text":
          return msg;
        case "carousel":
          return {
            type: "carousel",
            value: new Generic()._fromPayload(msg.value)
          }
        case "list":
          return {
            type: "list",
            value: new List()._fromPayload(msg.value)
          }
        default:
          console.error("This response is not supported. Got " + msg.type);
          break;
      }
    });
  }
  
  get() {
    return this.original;
  }
}