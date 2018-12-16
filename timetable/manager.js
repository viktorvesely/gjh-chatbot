const request = require('request');
const Parser = require('./parser.js');
const Table = require('./table.js');
const Days = require('../helpers/days.js');

module.exports = class TimeTableManager {
  constructor() {
    this.cache = {
      json: null,
      last:0 
    };
  }
  
  getPeriodFromTime(timestamp) {
    let date = typeof timestamp === "object" && timestamp.constructor.name === "Date" ? timestamp : new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if (hours < 8) { // before first
      return 1; 
    } else if (hours >= 16) { // after last
      return 10;
    }    
    else if (hours === 8 && minutes < 35) { // during first
      return 1;
    } else if (hours === 8 && minutes >= 35) { // before second
      return 2;
    } else if (hours === 9 && minutes < 25) { // during second
      return 2;
    } else if (hours === 9 && minutes >= 25) { // before third
      return 3;
    } else if (hours === 10 && minutes < 25) { // during third
      return 3;
    } else if (hours == 10 && minutes >= 25) { // before fourth
      return 4;
    } else if (hours == 11 && minutes < 25) { // during fourth
      return 4;
    } else if (hours == 11 && minutes >= 25) { // before fifth
      return 5;
    } else if (hours == 12 && minutes < 20) { // during fourth
      return 5;
    } else if (hours == 12 && minutes >= 20) { // before sixth
      return 6;
    } else if (hours == 13 && minutes < 15) { // during sixth
      return 6;
    } else if (hours == 13 && minutes >= 15) { // befor seventh
      return 7;
    } else if (hours == 14 && minutes < 5) { // during seventh
      return 7;
    } else if (hours == 14 && minutes >= 5) { // before eightth
      return 8;
    } else if (hours == 15 && minutes < 5) { // before eightth
      return 8;
    } else if (hours == 15 && minutes >= 5) { // ninth
      return 9;
    }
    
    
  }
  
  getCurrentLesson() {
    let today = Days.today();
    
  }
  
  load() {
    return new Promise((resolve, reject) => {
      if (this.recache()) {
        request('https://ssnovohradska.edupage.org/timetable/', (error, response, body) => {
          let json = this.extractJson(body);
          this.cache.json = json;
          this.cache.last = Date.now();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  
  
  extractJson(value) {
    let tempStart = value.indexOf("localModCount");
    let tempSubstr = value.substring(0, tempStart);
    let start = tempSubstr.lastIndexOf("{");
    let tempEnd = value.indexOf("ce_ttnum_last", tempStart);
    tempSubstr = value.substring(tempEnd);
    let end = tempSubstr.indexOf("}") + 1 + tempEnd;
    let json = value.substring(start, end);
    this.object = JSON.parse(json);
    return this.object;
  }
  
  recache() {
    return (!this.cache.json || this.cache.last - Date.now() > 1000 * 60 * 60 * 8);
  }
}