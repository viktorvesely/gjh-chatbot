module.exports = class Entities {
  constructor(name, value='', confidence=1) {
    this.entities = {};
    if (typeof name === "undefined") {
      return this;
    }
    this.entities[name] = [];
    this.entities[name].push(this.entity(value, confidence));
  }
  
  entity(value, confidence) {
    return {
      confidence: confidence,
      value: value,
      type: "value"
    }
  }
  
  next(name, value='', confidence=1) {
    if (!this.entities.hasOwnProperty(name)) {
      this.entities[name] = [];
    }
    this.entities[name].push(this.entity(value, confidence));
    return this;
  }
  
  get() {
    return this.entities;
  }
}