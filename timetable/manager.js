const request = require('request');
const Parser = require('./parser.js');
const Table = require('./table.js');
const Days = require('../helpers/days.js');
const fs = require('fs');

class TimeTableManager {
  constructor() {
    this.isLoading = false;
  }
  
  getCurrentLesson(classId, delta=0) {
    return new Promise(resolve => {
      let today = Days.today();
      let period = this.getPeriodFromTime(Date.now());
      period += delta;
      let table = new Table(classId);
      table.load().then(() => {
        if (typeof table.days === "undefined") {
          this.load().then(() => {
            let builtTable = this.parser.build(classId);
            resolve(builtTable.get(today, period));
          });
        } else {
          resolve(table.get(today, period));
        }
      });
    });
  }
  
  load() {
    if (this.isLoading) {
      return this.onLoad;
    }
    this.isLoading = true;
    this.onLoad = new Promise((resolve, reject) => {
      this.recache().then(json => {
        this.parser = new Parser(json);
        resolve();
        this.isLoading = false;
      }, () => {
        request('https://ssnovohradska.edupage.org/timetable/', (error, response, body) => {
          let json = this.extractJson(body);
          this.parser = new Parser(json);
          this.cacheJson(json, ()=> {
            resolve();
            this.isLoading = false;
          });
        });
      }).catch(err => {
        console.error(err);
      });
      if (this.recache()) {
        request('https://ssnovohradska.edupage.org/timetable/', (error, response, body) => {
          let json = this.extractJson(body);
          this.json = json;
          this.cacheLast = Date.now();
          this.parser = new Parser(json);
          resolve();
          this.isLoading = false;
        });
      } else {
        resolve();
        this.isLoading = false;
      }
    });
    return this.onLoad;
  }
  
  getAllClasses() {
    return new Promise(resolve => {
      this.load().then(() => {
        resolve(this.parser.getTableRows("classes"));
      })
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
  
  
  getCache() {
    return new Promise(resolve => {
      fs.readFile(this.cachePath, "utf8" ,(err, data) => {
        if (err) throw err;
        let object;
        try {
          object = JSON.parse(data);
        } catch (e) {
          object = {};
        }
        resolve(object);
      });
    });
  }
  
  cacheJson(json, onFinished=null) { 
    let save = {
      value: json,
      timestamp: Date.now()
    }
    let writeData = JSON.stringify(save);
    fs.writeFile(this.cachePath, writeData, err => {
      if (err) throw err;
      onFinished ? onFinished() : null;
    });
  }
  
  recache() {
    return new Promise((resolve, reject) => {
      this.getCache()
        .then(cache => {
        if (Object.keys(cache).length === 0 || new Date().getDate() === 1) {
         reject();
        }
        resolve(cache.value);
      })
        .catch(err => {
        throw err;
      });
    });
    return (!this.json || this.cacheLast - Date.now() > 1000 * 60 * 60 * 24 * 5);
  }
  
  getPeriodFromTime(timestamp) {
    let date = typeof timestamp === "object" && timestamp.constructor.name === "Date" ? timestamp : new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    if ((month === 10 && day >= 27) || month > 10) {
      hours++;
    } else {
      hours += 2;
    }
    console.log(hours);
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
    } else if (hours == 14 && minutes >= 5) { // before eighth
      return 8;
    } else if (hours == 15 && minutes < 5) { // before eighth
      return 8;
    } else if (hours == 15 && minutes >= 5) { // ninth
      return 9;
    }
  }
}

TimeTableManager.prototype.cachePath = "./timetable/.cache/edupage.json";

const gTimeTableManager = new TimeTableManager();

module.exports = gTimeTableManager;