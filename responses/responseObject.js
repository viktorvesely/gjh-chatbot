module.exports = class Response {
  constructor(type, value, options = [], error=null) {
    this.type = type;
    this.value = value;
    this.options = options;
    this.error = error;
    
    this.msgs = [{
      type: type,
      value: value,
      options: options
    }];
    this._hasError = error ? true : false;
  }
  
  setError(error) {
    this.error = error;
    this._hasError = true;
    return this;
  }
  
  hasError() {
    return this._hasError;
  }
  
  next (type, value, options =[], error=null) {
    this.msgs.push({
      type: type,
      value: value,
      options: options
    })
    this.error = error || this.error;
    this._hasError = this.error ? true : false;
    return this;
  }
}