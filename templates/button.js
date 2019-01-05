module.exports = class Button {
  constructor(type) { 
    this.btns = [];
    this.btns.push(this.determinTypeConstructor(type, arguments));
  }
  
  determinTypeConstructor(type, args) {
    let btn;
    switch (type) {
      case "postback":
        btn = this.constructorPostback(args[1], args[2], args);
        break;
      case "url":
        btn = this.constructorUrl(args[1], args[2]);
        break;
      default:
        throw Error("Invalid Button type. Expected url / postback, got " + type.toString());
        break;
    }
    return btn;
  }
  
  constructorPostback(display, handler, args) {
    let payloadArgs = [];
    for (let i = 3; i < args.length; ++i) { payloadArgs.push(args[i]); }
    let payload = this.generatePayload(handler, payloadArgs);
    let obj = {
      title: display,
      payload: payload,
      type: "postback"
    };
    return obj;
  }
  
  constructorUrl(display, url, webview_height_ratio ="tall", messenger_extensions="true") {
    let obj = {
      title: display,
      type: "web_url",
      url: url,
      webview_height_ratio: webview_height_ratio, // tall, compact, full
      messenger_extensions: messenger_extensions
    };
  }
  
  get() {
    return this.btns;
  }
  
  generatePayload(handler, payloadArgs) {
    let payload = handler;
    payloadArgs.forEach(arg => {
      let type = typeof arg;
      if (type !== "string" && type !== "number" && type !== "boolean") throw Error("ButtonBuilder: Unexpected type of argument while generating payload. Got " + type +  " instead of string, number or boolean");
      payload += ":" + arg.toString();
    });
    return payload;
  }
  
  next(type) {
    this.btns.push(this.determinTypeConstructor(type, arguments));
    return this;
  }
  
}