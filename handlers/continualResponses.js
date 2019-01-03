const Response = require('../responses/responseObject.js');
const gTimeTableManager = require('../timetable/manager.js');
const levenshtein = require('fast-levenshtein');

module.exports = class ContinualResponses {
  constructor(profile, cache, text) {
    this.__cacheKey = "__continualResponse";
    this.sender_psid = profile.fSender_psid();
    this.cache = cache;
    this.text = text;
    this.profile = profile;
  }
  
  cacheObject(handlerName, start) {
    return {
      handler: handlerName,
      start: start
    }
  }
  
  getFromCache() {
    return this.cache.get(this.sender_psid, this.__cacheKey);
  }
  
  expect(handlerName) {
    this.cache.set(this.sender_psid, this.__cacheKey, this.cacheObject(handlerName, Date.now()));
  }
  
  ret(responseText, error="") {
    var response = new Response("text", responseText);
    return new Promise((resolve, reject) => {
      if (error) {
        response.error = error;
        reject(response);
      }
      else resolve(response);
    })
  }
  
  resolve() {
    this.handlerObject = this.getFromCache();
    if (!this.handlerObject || Date.now() - this.handlerObject.start > 1000 * 60 * 7) {
      return false;
    }
    return this[this.handlerObject.handler]();
  }
  
  get_class_id () {
    return new Promise((resolve, reject) => {
      let strippedText = this.text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      gTimeTableManager.getAllClasses().then(classes => {
        let possibilities = [];
        for (let i = classes.length - 1; i > 0; --i) { // quick scan
          let Class = classes[i];
          let cmprName = Class.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
          if (strippedText.substr(0, 3) === cmprName.substr(0, 3)) {
            possibilities.push({
              name: Class.name,
              strName: cmprName,
              id: Class.id,
              lDistance: levenshtein.get(cmprName, strippedText)
            });
          }
        }
        let min = 7; // threshold;
        let best = -1;
        possibilities.forEach(possibility => { // final scan min sort
          if (possibility.lDistance < min) {
            best = possibility;
            min = possibility.lDistance;
          }
        });
        if (best === -1) {
          resolve(new Response("text", "Takú triedu som nenašiel")); 
        } else {
          this.profile.fClassId(best.id);
          resolve(new Response("text", "Zapamätal som si, že chodíš do " + best.name).next("text", "No nie je technológia úžasná?"));
        }
      }).catch((e) => {
        reject(new Response("text", "Edupage mi nedá data, som angery.").setError(e));
      });
    });
  }
}