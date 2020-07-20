const Utils = require('../helpers/utils.js');
const Response = require('../responses/responseObject.js');
const ContinualResponse = require('./continualResponses.js');
const WitResponse = require('../wit/witResponse.js');
const Button = require("../templates/button.js");

class MessageHandler {
  constructor (response, profile, cache, originalText, database) {
    if (typeof response === "undefined") {
      return this;
    }
    this.cache = cache;
    //this.response = new WitResponse(response);
    this.intent = response.intent;
    this.confidence = response.confidence;
    this.isConfident = this.confidence > 0.4;
    this.noIntent = this.confidence < 0.1;
    this.sender_psid = profile.sender_psid;
    this.profile = profile;
    this.originalText = originalText;
    this.responses = database;
    this.continualResponse = new ContinualResponse(profile, cache, originalText);
    //this.intent = response.entities ? response.entities.intent : undefined;
  }
  
  // Does not work right now
  simulate(intent, entities, profile, cache) {
    this.response = new WitResponse().fromEntities(entities);
    this.profile = profile;
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.sender_psid = profile.fSender_psid();
    this.cache = cache;
    return this[intent]();
  }
  
  resolve () {
    if (!this.intent) {
      throw new Error("Response was not initliazed properly. The intent was undefined");
    }

    if (this.noIntent) {
      return this.dontKnow()
    }

    return new Promise((resolve, reject) => {
      this.responses.get(this.intent).then(data => {
        let out = new Response().fromDatabase(data);
        if (!out.hasResponse) {
          resolve(new Response("text", "Viem čo myslíš ale neviem aká je na to odpoveď")
          .next("text", `${this.intent} with ${this.confidence * 100}%`)
          .next("wait", 2000)
          .next("text", "Povedz HR nech mi expandujú vedomosti")
          );
          return;
        }
        resolve(out);
      }, () => { 
        reject(new Response(
          "text",
          "Ou, toto je nepríjemné. Niečo sa pokazilo. 😞",
        )
          .next(
            "text",
            "Prosím kontaktuj môjho developera (HR odelenie)"
          ).setError("There was an error whilst loading the response from database, there should be more logs above")
        );
      });
    });
  }
  
  dontKnow() {
    return this.ret("Vobec neviem")
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
