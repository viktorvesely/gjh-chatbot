const Utils = require("./utils.js");

module.exports = class Reminder {
  constructor(target, year, month, day, what, error="", timestamp = 0) {
    this.target = target;
    this.year = year;
    this.month = month;
    this.day = day;
    this.what = what;
    this.error = error;
    this.timestamp = timestamp;
  }
  
  isComplete() {
    for (let key in this) {
      let value = this[key];
      if (value === undefined) return false;
    }
    return true;
  }
}