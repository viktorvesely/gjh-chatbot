const Utils = require('../helpers/utils.js');
const Response = require('../responses/responseObject.js');
const ContinualResponse = require('./continualResponses.js');

class MessageHandler {
  constructor (response, profile, cache, originalText) {
    if (typeof response === "undefined") {
      return this;
    }
    this.cache = cache;
    this.response = response;
    this.sender_psid = profile.fSender_psid();
    this.profile = profile;
    this.originalText = originalText;
    this.continualResponse = new ContinualResponse(profile, cache, originalText);
    this.entities = response.entities;
    this.intent = response.entities ? response.entities.intent : undefined;
  }
  
  simulate(intent, entities, profile, cache) {
    this.entities = entities;
    this.profile = profile;
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.sender_psid = profile.fSender_psid();
    this.cache = cache;
    return this[intent]();
  }
  
  resolve () {
    let entities = this.entities;
    let intent = this.intent;
    if (Utils.isConfident(intent)) {
      return this[intent[0].value]();
    }
    else if (Object.keys(entities).length > 0) {
      return this.partiallyDontKnow(entities);
    }
    else {
      return this.ret(this.dontKnow());
    } 
  }
  
  dontKnow() {
    return this.ret("Vobec neviem")
  }
  
  partiallyDontKnow(entities) {
    return new Promise(resolve => {
      var max = -1;
      var maxName;
      for (let name in entities) {
        let entity = entities[name];
        if(entity[0].confidence > max) {
          max = entity[0].confidence;
          maxName = name;
        }
      }
      if (maxName === "intent") {
        resolve(new Response("text","Trochu chápem, čo sa mi snažíš povedať, ale asi to nie je formáciu vety").next("text", "Skús to trochu inak 😅"));
        return;
      }
      resolve(new Response("text", "Uhm, nerozumiem, čo si tým myslel. Rozumiem, ale slovíčku \"" + entities[maxName][0]["value"] + "\".").next("text", "Skús ho použiť v inom kontexte."));
    })
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
  
  static __internal_error_response() {
    return new Response("text", "Internal server error has occured while trying to resolve your request").next("text", "Tough luck pre teba (pls skontaktuj môjho developera)");
  }
  

  // Place intent handlers here
};

module.exports = MessageHandler;
