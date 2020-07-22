const Response = require('../responses/responseObject.js');
const ContinualResponse = require('./continualResponses.js');

module.exports = class PostBackHandler {
  constructor(profile, sender_psid,  postBack, cache, database) {
    this.sender_psid = sender_psid;
    this.responses = database;
    this.continualResponse = new ContinualResponse(profile, cache, undefined);
    this.profile = profile;
    this.postBack = postBack;
    this.cache = cache;
  }
  
  resolve() {
    return new Promise((resolve, reject) => {
      this.responses.get(this.postBack).then(data => {
        let out = new Response().fromDatabase(data);
        if (!out.hasResponse) {
          resolve(new Response("text", "Táto funkcionalita neboľa ešte implementovaná")
          .next("wait", 1500)
          .next("text", "Povedz HR o tomto incidente")
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
 
}