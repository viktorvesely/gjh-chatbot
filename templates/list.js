module.exports = class List {
  constructor(sharable=false) { 
    this.sharable = sharable.toString();
    
    this._customPayload = false;
    this.elements = []
    this.elements.push(this._element());
    this.length = 1;
    this.topElementStyle = "compact";
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
    if (!current.title) throw Error("ListTemplate unfinished_element: Element is missing a title. Call .title() on the Element with nonEmpty string.");
    if (!current.subTitle && !current.imageUrl) throw Error("ListTemplate unfinished_element: Element must also have one or both of image_url or subtitle set.");
    if (current.buttons && current.buttons.get().length > 1) throw Error("ListTemplate max_button_exceeded. List's elements can have maximum of one button.");
  }
  
  next() {
    this._validateLastElement();
    if (this.length === 4) throw Error("ListTemplate: ListTemplate exceded it's maximum length (4)");
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
  
  large() {
    this.topElementStyle = "large";
    return this;
  }
  
  compact() {
    this.topElementStyle = "compact";
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
  
  _fromPayload(payload) {
    this._customPayload = payload;
    return this;
  }
  
  _payload() {
    if (this._customPayload) return this._customPayload;
    this._validateLastElement();
    if (this.length < 2) throw Error("ListTemplate: Is required to have at least 2 elements");
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
      "template_type":"list",
      "elements": elements,
      "top_element_style": this.topElementStyle,
      "sharable": this.sharable
    }
    return payload;
  }
  
}