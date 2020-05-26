const Utils = require('../helpers/utils.js');
const Response = require('../responses/responseObject.js');
const ContinualResponse = require('./continualResponses.js');
const WitResponse = require('../wit/witResponse.js');

class MessageHandler {
  constructor (response, profile, cache, originalText) {
    if (typeof response === "undefined") {
      return this;
    }
    this.cache = cache;
    this.response = new WitResponse(response);
    this.sender_psid = profile.fSender_psid();
    this.profile = profile;
    this.originalText = originalText;
    this.continualResponse = new ContinualResponse(profile, cache, originalText);
    this.intent = response.entities ? response.entities.intent : undefined;
  }
  
  simulate(intent, entities, profile, cache) {
    this.response = new WitResponse().fromEntities(entities);
    this.profile = profile;
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.sender_psid = profile.fSender_psid();
    this.cache = cache;
    return this[intent]();
  }
  
  resolve () {
    let intent = this.response.intent();

    if (!intent) {
      throw new Error("The Wit response was not initliazed properly. The intent was null");
    }

    if(intent === WitResponse.NO_INTENT) {
      this.dontKnow();
    }

    let isConfident, value;
    value = intent[0];
    isConfident = intent[1];

    if (!isConfident) {
      this.partiallyDontKnow(value);
    }

    return this[value]();
  }
  
  dontKnow() {
    return this.ret("Vobec neviem")
  }
  
  partiallyDontKnow(value) {
    return new Promise(resolve => {
      let helperFunctionName = value + "$help";
      let helperFunction = this[helperFunctionName];
      if(typeof helperFunction === "undefined") {
        return resolve(new Response("text", "vobec neviem")); // helper function not implemented -> BAD BEHAVIOUR!
      }
      return helperFunction();
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

  show_case() {
    return new Promise((resolve, reject) => {
      resolve(new Response("text", "Caukymnauky").next("text", "Popismenkujeme si?"));
    });
  }

  show_case$help(resolve) {
    resolve(new Response("text", "Snazis sa dostat do show_case? Sprav to takto ..."));
  }

  // Place intent handlers here
};

module.exports = MessageHandler;
