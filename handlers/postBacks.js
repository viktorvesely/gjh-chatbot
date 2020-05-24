const Response = require('../responses/responseObject.js');
const WitEntities = require('../wit/entities.js');
const TextHandler = require('./text.js');
const ContinualResponse = require('./continualResponses.js');

module.exports = class PostBackHandler {
  constructor(profile, postBack, cache) {
    this.sender_psid = profile.fSender_psid();
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.profile = profile;
    this.postBack = postBack;
    let builder = postBack.split(":");
    this.handler = builder.shift();
    this.args = builder;

    this.cache = cache;
  }
  
  resolve() {
    let handleFunction = this[this.handler];
    if (handleFunction !== undefined) {
      return handleFunction.apply(this, this.args);
    }
    else {
      return this.ret("Uhmm, niečo sa pokazilo. My bad.", "invalid postback name: " + this.handler);
    }
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
  
 
}