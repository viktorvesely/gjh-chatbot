const Response = require('../responses/responseObject.js');
const WitEntities = require('../wit/entities.js');
const TextHandler = require('./text.js');

module.exports = class ContinualResponses {
  constructor(profile, cache, text) {
    this.__cacheKey = "__continualResponse";
    this.sender_psid = profile.sender_psid;
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
}