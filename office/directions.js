const fs = require('fs')
const filePath = './office/offices.json'
const Constants = require('../helpers/constants.js')


class OfficeDirections {
  constructor() {
    this.loadData().then(data => this.offices = data)
  } 
  
  loadData() {
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
  
  getDirections(officeName) {
    return new Promise((resolve, reject) => {
      if (officeName) {
         officeName = officeName.replace(/ /g, '_');
      }
      if (this.offices.hasOwnProperty(officeName)) { 
        var office = this.offices[officeName]
        var responseText;
        if (office.floor && office.schoolSide && office.fromStairs && office.afterStairs) {
          var floor = office.floor === "0" ? "prízemie" : office.floor + ". poschodie"
          var note = (office.hasOwnProperty('note') && office.note !== null) ? office.note : ""
          
          var responseText =  `Choď na ${floor} na strane ${Constants.directions.schoolSides[office.schoolSide]}. Od schodov ${Constants.directions.fromStairs[office.fromStairs]}. Kabinet uvidíš ${Constants.directions.afterStairs[office.afterStairs]}. ${note}`
        } else {
          responseText = "Nepodarilo sa mi načítať dáta o kabinete 😔"
        }
        resolve(responseText);
      } else {
        reject('Hups, niekde sa stala chyba 😟');
      }
    });
  }
}

var officeDirections = new OfficeDirections();
module.exports = officeDirections;