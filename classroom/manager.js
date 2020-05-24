const request = require('request');
const Cacher = require('../helpers/Cacher.js')
const Constants = require('../helpers/constants.js')
const cachePath = "/.cache/classrooms.json"
const Utils = require('../helpers/utils.js')
const levenshtein = require('fast-levenshtein');
const Button = require('../templates/button.js');
const Response = require('../responses/responseObject.js');


function reload() {
  return new Promise((resolve) => {
    let json = []
    request.get("https://gjh.sk/pbx/index.php?page=teachers", (err, res, body) => {
      JSON.parse(body).forEach(classroom => {
        if (classroom.Učiteľ && classroom.Učebňa && classroom.Trieda) {
          json.push({
            teacherFullname: classroom.Učiteľ,
            teacherSurname: Utils.stripSurname(classroom.Učiteľ),
            schoolClass: classroom.Trieda,
            doorNumber: classroom.Učebňa.replace(/\D/g,'') //remove any accidental letters
          })
        }
      })
      resolve(json)
    })
  });
}

class ClassroomManager {
  constructor() {
    this.cache = new Cacher(cachePath, reload(), Constants.time.everyWeek) 
  }
  
  getClassroomDirections(name) {
    return new Promise((resolve, reject) => {
      let searchedTeacherSurname = Utils.getPrettySurname(name)
      
      this.cache.get().then(classrooms => {
        let best = {
          names: [],
          schoolClasses: [],
          classrooms: [],
          distance: 100
        }
        classrooms.forEach(classroom => {
          if (searchedTeacherSurname.length >= 3 && 
              classroom.teacherSurname.length >= 3 && 
              searchedTeacherSurname.substring(0,3) === classroom.teacherSurname.substring(0,3)
             ) {
            var distance = levenshtein.get(classroom.teacherSurname, searchedTeacherSurname);
            if (distance === best.distance) {
              best.names.push(classroom.teacherFullname);
              best.schoolClasses.push(classroom.schoolClass)
              best.classrooms.push(classroom.doorNumber);
            } else if (distance < best.distance) {
              best.names = [classroom.teacherFullname];
              best.schoolClasses = [classroom.schoolClass];
              best.classrooms = [classroom.doorNumber];
              best.distance = distance;
            }
          }
        })
        
        if (best.names.length > 0) {
          var response = new Response("text", undefined);
          for(var i = 0; i < best.names.length; i++) {
            var name = Utils.getNameObject(best.names[i]);
            var schoolClass = best.schoolClasses[i];
            var classroom = best.classrooms[i];
            response.next('buttons', `Tried. uč. ${name.first} ${name.last} učí triedu ${schoolClass} s hlavnou triedou v miestnosti č. ${classroom}`, new Button('postback','Naviguj ma 🧭🗺',`get_directions_to_known_classroom:${classroom}`));
          }
          return resolve(response);
        } else {
          resolve(new Response("text", "Toto meno som v zozname triednych učiteľov nenašiel..."));
        }
      }).catch((e) => reject(new Response("text", "Edupage mi nedá data, som angry 🙍🏻‍♂️").setError(e)));
    });
  }
}

var classroomManager = new ClassroomManager()
module.exports = classroomManager