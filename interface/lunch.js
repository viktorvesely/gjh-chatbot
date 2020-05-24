const request = require('request');
const Dates = require('../helpers/dates.js')
const axios = require('axios')
const Utils = require('../helpers/utils.js')
const Constants = require('../helpers/constants.js')
const Cacher = require('../helpers/Cacher.js')

const cachePath = "/.cache/lunchesForTwoWeeks.json"

function getLunchJSON(from, until) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: 'https://ssnovohradska.edupage.org/menu/',
      qs: { 
        akcia: 'getUdajeGlobal',
        veci: JSON.stringify({
          "mobile_getListok": {
            "co":"mobile_getListok",
            "od":from,
            "do":until,
            "pcVerzia":true
          }
        })
      },
      headers: { 
        'Postman-Token': '95642518-6e56-497f-b423-5adb22517a3b',
        'cache-control': 'no-cache' 
      } 
    };
    request(options, (error, response, body) => {
      if (error) return reject(error);
      var json = JSON.parse(body)
      resolve(json.mobile_getListok)
    });
  })
}

// JSON-scraping
function extractFoodFromStringToObject(foodString, obj) {
    // Example input:
    // '16037 Zemiaky s maslom a petržlenovou vňaťou', - side dishes are always around 16000
    // '1027 Ovocný nápoj' - drinks are always around 1000
    // '24XXX Šalát cviklový' - salads are always around 24000
    // '10019 Ryba v syrovom cestíčku' - mains get all the other numbers
    // 'ovocný nápoj' - extras do not have numbers 
  if(/\d/.test(foodString)) { // there is a number to identify the food/drink
    let content_num = parseInt(foodString.substring(0, foodString.indexOf(' ')));
    let content = foodString.substring(foodString.indexOf(' ') + 1);
    if (Utils.isInRange(content_num,1000,2000)) {
      obj.drink = content.toLowerCase();          
    } else if (Utils.isInRange(content_num,5000,6000)) {
      obj.soup = content.toLowerCase();
    } else if (Utils.isInRange(content_num,16000,17000)) {
      obj.side = content.toLowerCase();
    } else if (Utils.isInRange(content_num,24000,25000)) {
      obj.salad = content.toLowerCase();
    } else {
      obj.main = content.toLowerCase();
    }
  } else { // there is no number so this must be an extra
    obj.extra = foodString.toLowerCase();
  }
}

function reload() {
  return new Promise(resolve => {
    Dates.getDateObjectForLunchPostRequest().then(dateObj => {
      Promise.all([getLunchJSON(dateObj.from, dateObj.until), 
                   getLunchJSON(dateObj.nextFrom, dateObj.nextUntil)]
                 ).then(lunchJSONs => {
        var merged = Object.assign({}, lunchJSONs[0], lunchJSONs[1])
        resolve(merged)
      })  
    })
  });
}

function stringify(obj) {
  let s = "";
  for (var meal_type in obj) {
    s += Constants.lunch.dictionary[meal_type] + ': ' + Utils.capitalize(obj[meal_type]) + '\u000A';
  }
  return s;
}

module.exports = class Lunch {
  constructor() {
    this.cache = new Cacher(cachePath, reload(), Constants.time.everyDay)
  }
  
  getLunchObject(offset) {
    return new Promise((resolve, reject) => {
      Dates.getOffsetDate(offset).then(date => {
        this.cache.get().then(data => {
          if (!data.hasOwnProperty(date)) {
            return reject('Ajáj, EduPage mi nedal dobré dáta 😟')
          }
          if (!data[date].hasOwnProperty('2')  || !data[date]['2'].isCooking) {
            return reject('V školskej jedálni buď na papanie nebude nič, alebo jedlo pre tento deň ešte nebolo pridelené 🤔')
          }
          let lunch = data[date]['2']
          if (lunch.druhov_jedal !== 2) {
            // IF NO 2nd OPTION - NEED TO CHECK JSON FORMATTING
          } else {
            var lunchObject = {A: {}, B: {}, common: {}}

            lunch.receptury.forEach(dish => {
              if (dish.nazov.length !== 0) {
                dish.nazov = dish.nazov.replace(/\s+\s/g,' ')
                switch(dish.menusStr) {
                  case 'A':
                    extractFoodFromStringToObject(dish.nazov, lunchObject.A)
                    break;
                  case 'B':
                    extractFoodFromStringToObject(dish.nazov, lunchObject.B)
                    break;
                  case 'all':
                    extractFoodFromStringToObject(dish.nazov, lunchObject.common)
                    break;
                }
              }
            })
            resolve(lunchObject)
          }
        }).catch((err) => reject(err));
      })
    })
  }
  
  getLunchText(day_offset, getA, getB) {
    return new Promise((resolve, reject) => {
      let properties = []
      let getBoth = (getA && getB) || (!getA && !getB) //XNOR; if the user does not specify A or B, we assume they want both, A and B
      this.getLunchObject(day_offset).then((lunch_obj) => {
        properties.push('Papať budeš:')
        if (getBoth) {
          properties.push('🅰️\u000A' + stringify(lunch_obj.A))
          properties.push('🅱️\u000A' + stringify(lunch_obj.B))
        } else if (getA) {
          properties.push(stringify(lunch_obj.A))
        } else if (getB) {
          properties.push(stringify(lunch_obj.B))
        } 
        properties.push(stringify(lunch_obj.common))        
        resolve(properties);
      }).catch((err_msg) => reject(err_msg))
    });
  }
}
  