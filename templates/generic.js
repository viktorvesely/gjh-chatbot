module.exports = class Generic {
  constructor(shareable=false, imageRatio="horizontal") {
    this.imageRatio = imageRatio;
    this.shareable = shareable.toString();
    
    this.elements = []
    this.elements.push(this._element());
    this.length = 1;
  }
  
  _element() {
    return {
      title: "",
      subTitle: "",
      imageUrl: "",
      action: null,
      buttons: null
    }
  }
  
  _currentElement() {
    return this.elements[this.elements.length - 1];
  }
  
  next() {
    let current = this._currentElement();
    if (!current.title) throw Error("GenericTemplate: Unfinished previous template when calling .next(). Missing a title. Call .title() with nonEmpty string.");
    if (this.length === 10) {
      console.error("GenericTemplate: Carousel exceded it's maximum length (10). Removing first element");
      this.elemets.shift();
      this.length--;
    }
    this.elements.push(this._element());
    this.length++;
    return this;
  }
  
  title(title) {
    let current = this._currentElement();
    current.title = title;
    return this;
  }
  
  subTitle(subTitle) {
    let current = this._currentElement();
    current.subTitle = subTitle;
    return this;
  }
  
  image(url) {
    let current = this._currentElement();
    current.imageUrl = url;
    return this;
  }
  
  action(url, messenger_extensions="true", webview_height_ratio="tall") {
    let current = this._currentElement();
    current.action = {
      url: url,
      type: "web_url",
      messenger_extensions: messenger_extensions,
      webview_height_ratio: webview_height_ratio // tall, compact, full
    };
    return this;
  }
  
  buttons(buttons) {
    let current = this._currentElement();
    current.buttons = buttons;
    return this;
  }
  
  shareable() {
    this.shareable = "true";
    return this;
  }
  
  nonshareable() {
    this.shareable = "false";
    return this;
  }
  
  setHorizontalRatio() {
      this.imageRatio = "horizontal";
      return this;
  }
  
  setSquareRatio() {
    this.imageRatio = "square"
    return this;
  }
  
  _payload() {
    let elements = []
    
    this.elements.forEach(e => {
      let element = {
        "title": e.title
      }
      e.subTitle ? element.subtitle = e.subTitle : false;
      e.imageUrl ? element.image_url = e.imageUrl : false;
      e.action ? element.default_action = e.action : false;
      e.buttons ? element.buttons = e.buttons.get() : false;
      elements.push(element);
    });
  
    
    let payload  = {
      "template_type":"generic",
      "elements": elements,
      "sharable": this.shareable,
      "image_aspect_ratio": this.imageRatio
    }
    console.log(JSON.stringify(payload));
    return payload;
  }
}