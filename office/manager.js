const request = require('request');
const fs = require('fs');
const levenshtein = require('fast-levenshtein');
const Button = require('../templates/button.js');
const Cacher = require('../helpers/Cacher.js')
const Response = require('../responses/responseObject.js');
const Constants = require('../helpers/constants.js')
const Utils = require('../helpers/utils.js')

//const cachePath = "./office/.cache/offices.json";
const cachePath = "/.cache/offices.json"

function reload() {
  return new Promise((resolve) => {
    let json = []
    request.get("https://www.gjh.sk/pbx/index.php?page=directory", (err, res, body) => {
      JSON.parse(body).forEach(teacher => {
        if (teacher.Meno !== null) {
          json.push({
            name: teacher.Meno,
            surname: Utils.stripSurname(teacher.Meno,true),
            office: teacher.Kabinet.substr(0, teacher.Kabinet.indexOf(' -'))
          })
        }
      })
      resolve(json)
    })
  });
}

class OfficeManager {
  constructor() {
    this.cache = new Cacher(cachePath, reload(), Constants.time.everyWeek)
  }
  
  getOfficeDirections(name) {
    return new Promise((resolve, reject) => {
      let searchedTeacherSurname = Utils.getPrettySurname(name)
      
      this.cache.get().then(teachers => {
        let best = {
          names: [],
          offices: [],
          distance: 100
        };
        teachers.forEach(teacher => {
          if (searchedTeacherSurname.length >= 3 && 
              teacher.surname.length >= 3 && 
              searchedTeacherSurname.substring(0,3) === teacher.surname.substring(0,3)
             ) {
            var distance = levenshtein.get(teacher.surname, searchedTeacherSurname);
            if (distance === best.distance) {
              best.names.push(teacher.name);
              best.offices.push(teacher.office);
            } else if (distance < best.distance) {
              best.names = [teacher.name];
              best.offices = [teacher.office];
              best.distance = distance;
            }
          }
        });

        if (best.names.length > 0) {
          var response = new Response("text", undefined);
          for(var i = 0; i < best.names.length; i++) {
            var name = Utils.getNameObject(best.names[i]);
            var office = best.offices[i];
            response.next('buttons', `P. uč. ${name.first} ${name.last} má kabinet v miestnosti ${office}`, new Button('postback','Naviguj ma 🧭🗺',`get_directions_to_known_office:${office}`));
          }
          return resolve(response);
        } else {
          resolve(new Response("text", "Toto meno som v zozname učiteľov nenašiel..."));
        }
      }).catch((e) => reject(new Response("text", "Edupage mi nedá data, som angry 🙍🏻‍♂️").setError(e)));
    });
  }
}


var officeManager = new OfficeManager()
module.exports = officeManager