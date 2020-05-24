const Response = require('../responses/responseObject.js');
const gTimeTableManager = require('../timetable/manager.js');
const OfficeManager = require('../office/manager.js');
const classroomManager = require('../classroom/manager.js');
const classroomDirections = require('../classroom/directions.js');
const WitEntities = require('../wit/entities.js');
const TextHandler = require('./text.js');
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
        reject(new Response("text", "Edupage mi nedá data, som angry.").setError(e));
      });
    });
  }
  
  get_office_directions_from_teachername() {
    return OfficeManager.getOfficeDirections(this.text)
  }
  
  get_classroom_directions_from_teachername() {
    return classroomManager.getClassroomDirections(this.text)
  }
  
  set_name() {
    let names = this.text.split(" ");
    names = names.filter(value => !!value);
    if (names.length !== 2) {
      return new Promise(resolve => {
        resolve(new Response("text", "Očákaval som len meno a priezvisko"));
      });
    }
    debugger;
    let entities = new WitEntities("s_first_name", names[0]).next("s_second_name", names[1]).get();
    return new TextHandler().simulate("save_user", entities, this.profile, this.cache);
  }
  
  get_classroom_number() {
    return new Promise(resolve => {
      classroomDirections.getDirections(this.text)
        .then(msg => resolve(new Response('text', msg)))
        .catch(msg => resolve(new Response('text', msg)))
    })
  }
}