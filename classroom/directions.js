const Constants = require('../helpers/constants.js')
const fs = require('fs')
const filePath = './classroom/classrooms.json'


function loadData() {
  return new Promise(resolve => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (!err) {
        try {
          var data = JSON.parse(data)['0']
          resolve(data)
        } catch(e) {
          resolve({})
        }
      } else {
        resolve({})
      }
    })
  })
} 


class ClassroomDirections {
  constructor() {
    loadData().then(data => this.classrooms = data)
  }
  
  getDirections(classroomNumber) {
    return new Promise((resolve, reject) => {
      if (classroomNumber && this.classrooms.hasOwnProperty(classroomNumber)) {
        var classroom = this.classrooms[classroomNumber]
        var responseText;
        if (classroom.floor && classroom.schoolSide && classroom.fromStairs && classroom.afterStairs) {
          var floor = classroom.floor === "0" ? "prízemie" : classroom.floor + ". poschodie"
          var note = (classroom.hasOwnProperty('note') && classroom.note) ? classroom.note : ""
          
          var responseText =  `Choď na ${floor} na strane ${Constants.directions.schoolSides[classroom.schoolSide]}. Od schodov ${Constants.directions.fromStairs[classroom.fromStairs]}. Triedu uvidíš ${Constants.directions.afterStairs[classroom.afterStairs]} ${note}`
        } else {
          responseText = "Nepodarilo sa mi načítať dáta o triede 😔"
        }
        resolve(responseText);
      } else {
        reject('Hups, niekde sa stala chyba 😟');
      }
    });
  }
}

var classroomDirections = new ClassroomDirections();
module.exports = classroomDirections;