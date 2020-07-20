module.exports = class Response {
  constructor(type = null, value = null, options = [], error = null) {
    if (type === null) {
      return this;
    }
    this.type = type;
    this.value = value;
    this.options = options;
    this.error = error;
    this.hasResponse = true;

    this.msgs = [{
      type: type,
      value: value,
      options: options
    }];
    this._hasError = error ? true : false;
  }

  fromDatabase(data) {
    if (!data) {
      this.hasResponse = false;
      return this;
    }

    let response = JSON.parse(data.response);

    if (response.length === 0) {
      this.hasResponse = false;
      return this;
    }

    let first = response[0];
    
    this.type = first.type;
    this.value = first.value;
    this.options = first.options || null;
    this.error = null;
    this.hasResponse = true;

    this.msgs = response;
    this._hasError = false;
    return this;
  }

  setError(error) {
    this.error = error;
    this._hasError = true;
    return this;
  }

  hasError() {
    return this._hasError;
  }

  export() {
    return {
      msgs: this.msgs
    }
  }

  next(type, value, options = [], error = null) {
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