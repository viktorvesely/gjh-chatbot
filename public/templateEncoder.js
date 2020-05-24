class TemplateEncoder {
  constructor(response) {
    this.original = response;
    this.new = {
      msgs: []
    }
    
    this.new.msgs = this.original.msgs.map(msg => {
      switch(msg.type) {
        case "text":
          return msg;
        case "carousel":
          return {
            type: "carousel",
            value: msg.value._payload()
          }
        case "list":
          return {
            type: "list",
            value: msg.value._payload()
          }
        default:
          throw Error("This response is not supported. Got " + msg.type);
          break;
      }
    });
  }
  
  get() {
    return this.new;
  }
}