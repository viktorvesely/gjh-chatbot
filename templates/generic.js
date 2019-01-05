module.exports = class Generic {
  constructor(sharable=false, imageRatio="horizontal") {
    this.imageRatio = imageRatio;
    this.sharable = sharable.toString();
    
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
  
  _validateLastElement() {
    let current = this._currentElement();
    if (!current.title) throw Error("GenericTemplate unfinished_element: Element is missing a title. Call .title() on the Element with nonEmpty string.");
    if (!current.subTitle && !current.imageUrl) throw Error("GenericTemplate unfinished_element: Element must also have one or both of image_url or subtitle set.");
    if (current.buttons && current.buttons.get().length > 3) throw Error("GenericTemplate max_button_exceeded. List's elements can have maximum of 3 buttons.");
  }
  
  next() {
    this._validateLastElement();
    if (this.length === 10) throw Error("GenericTemplate: Carousel exceded it's maximum length (10)");
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
  
  sharable() {
    this.sharable = "true";
    return this;
  }
  
  nonsharable() {
    this.sharable = "false";
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
  this._validateLastElement();
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
      "sharable": this.sharable,
      "image_aspect_ratio": this.imageRatio
    }
    return payload;
  }
}