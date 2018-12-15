const request = require('request');

module.exports = class TimeTableManager {
  constructor(start=true) {
    this.cache = {
      value: null,
      last:0 
    };
    if (start) {
      this.download();
    }
  }
  
  OnLoad() {
    return this.onLoad;  
  }
  
  download() {
    this.onLoad = new Promise((resolve, reject) => {
      if (this.recache()) {
        request('https://ssnovohradska.edupage.org/timetable/', (error, response, body) => {
          let value = body;
          
          this.cache.value = value;
          this.cache.last = Date.now();
          resolve(value);
        });
      } else {
        resolve(this.cache.value);
      }
    })
    return this.onLoad;
  }
  
  extractJson() {
    if (this.recache()) {
      this.download().then(()=> {
        this.extractJson();
      })
    } else {
      let value = this.cache.value;
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
  }
  
  recache() {
    return (!this.cache.value || this.cache.last - Date.now() > 1000 * 60 * 60 * 8);
  }
}