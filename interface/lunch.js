const request = require('request');
const translate = {
  drink: 'Nápoj',
  side: 'Príloha',
  salad: 'Šalát',
  main: 'Hlavné jedlo',
  soup: 'Polievka',
  extra: 'Bonus'
}

// Date-provision
function pad(num) { // Converts single-digit numbers to double digit (e.g. 9 -> 09)
  return num<10 ? '0'+num : num;
}

function getDateObject(offset) {
  // Get offset date
  if (offset === undefined) offset = 0;
  let today = new Date();
  var offsetDate = new Date();
  offsetDate.setDate(today.getDate() + offset);

  // Format date to YYYY-MM-DD -- this format is used in the lunch JSON
  let formattedDate = 
      `${pad(offsetDate.getFullYear())}-${pad(offsetDate.getMonth()+1)}-${pad(offsetDate.getDate())}`; 

  // Won't handle new year
  let monday = new Date();
  let day = offsetDate.getDay();
  let diff = offsetDate.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  monday.setDate(diff);
  let from = `${monday.getFullYear()}-${monday.getMonth()+1}-${monday.getDate()}`; 

  let sunday = new Date();
  sunday.setDate(monday.getDate() + 6);
  let until = `${sunday.getFullYear()}-${sunday.getMonth()+1}-${sunday.getDate()}`;

  // Return values
  return {
    date: formattedDate,
    from: from,
    until: until
  }
}


// Web-scraping
function getJSON(from, until) {
  return new Promise((resolve, reject) => {      
    // Make request
    let querystring = require('querystring');
    request({
      url: 'https://ssnovohradska.edupage.org/menu/',
      form: querystring.stringify({
        method: 'getUdajeGlobal', 
        veci: {"setChosenSchoolYearFromDate":{"co":"setChosenSchoolYearFromDate", "date": until},
               "alergeny":{"co":"alergeny", "plati_od": from, "plati_do": until},
               "mobile_getListok":{"co":"mobile_getListok", "od": from, "do": until, "pcVerzia":true}
        }
    })}, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let sub_str = body.substring(
          body.lastIndexOf("var novyListok"), 
          body.lastIndexOf("if(novyListok==null)")
        );
        let json = JSON.parse(
          sub_str.substring(
            sub_str.indexOf("{"), 
            sub_str.lastIndexOf("}")+1
          )
        );
        resolve(json);
      } else if (err) {
        reject(err);
      }
    });
  });
}

// JSON-scraping
function extractFood(arr) {
    // Example input:
    // '16037 Zemiaky s maslom a petržlenovou vňaťou', - side dishes are always around 16000
    // '1027 Ovocný nápoj' - drinks are always around 1000
    // '24XXX Šalát cviklový' - salads are always around 24000
    // '10019 Ryba v syrovom cestíčku' - mains get all the other numbers
    // 'ovocný nápoj' - extras do not have numbers
  return new Promise((resolve, reject) => {
    let properties = []
    arr.forEach(line => {
      if(/\d/.test(line)) { // there is a number to identify the food/drink
        let content_num = parseInt(line.substring(0, line.indexOf(' ')));
        let content = line.substring(line.indexOf(' ') + 1);
        if (1000 <= content_num && content_num < 2000) {
          properties.push({key: 'drink', value: content.toLowerCase()})
        } else if (16000 <= content_num && content_num < 17000) {
          properties.push({key: 'side', value: content.toLowerCase()}) 
        } else if (24000 <= content_num && content_num < 25000) {
          properties.push({key: 'salad', value: content.toLowerCase()})
        } else {
          properties.push({key: 'main', value: content.toLowerCase()})
        }
      } else { // must be an extra
        properties.push({key: 'extra', value: line.toLowerCase()})
      }
    });
    resolve(properties)
  });
}

function getLunchObject(offset) {
  return new Promise((resolve, reject) => {
    let dateObj = getDateObject(offset);
    let date = dateObj.date;

    getJSON(dateObj.from, dateObj.until)
      .then((data) => {
        if (data[date].hasOwnProperty('2')) {
          if (!data[date]['2'].isCooking) { // Holidays
            reject('Nic nebude, jedáleň nevarí 😕');
          } else {
            let temp = data[dateObj.date]['2'].nazov
              .split('\n')
              .map(line => line.replace(/\s+\s/g,' '))

            let lunch_obj = {}
            let idx_A = temp.indexOf('A:');
            let idx_B = temp.indexOf('B:');
            let idx_common = temp.indexOf('');

            if (idx_B !== undefined) { 
              let arr_A = temp.slice(idx_A + 1, idx_B)
              let arr_B = temp.slice(idx_B + 1, idx_common)
              let arr_common = temp.slice(idx_common + 1)
              lunch_obj.A = {}
              lunch_obj.B = {}
              lunch_obj.common = {}
              Promise.all([extractFood(arr_A), extractFood(arr_B), extractFood(arr_common)])
                .then((data) => {
                  data[0].forEach(({key, value}) => lunch_obj.A[key] = value);
                  data[1].forEach(({key, value}) => lunch_obj.B[key] = value);
                  data[2].forEach(({key, value}) => lunch_obj.common[key] = value);
              }).then(() => {
                lunch_obj.common.soup = temp[0].substring(temp[0].indexOf(' ') + 1).toLowerCase()
                resolve(lunch_obj);
              })
            } else {
              // CHECK
              // NO 2nd OPTION - CHECK JSON FORMATTING
            }
          }
        } else {
          reject('V školskej jedálni nič, ale môžeš sa tešiť na sladký pondelok 😍')
        }
      })
      .catch((err) => reject(err));
  })
}

function objectToText(obj) {
  let s = "";
  for (var meal_type in obj) {
    s += translate[meal_type] + ': ' + obj[meal_type] + '\u000A';
  }
  return s;
}

module.exports = class Lunch {  
  constructor() {
  }
  
  getLunchText(day_offset, getA, getB) {
    return new Promise((resolve, reject) => {
      let properties = []
      let getBoth = (getA && getB) || (!getA && !getB) //XNOR; if the user does not specify A or B, we assume they want both, A and B
      getLunchObject(day_offset)
        .then((lunch_obj) => {
          properties.push('Papať budeš:')
          if (getBoth) {
            properties.push('A-čko:\u000A' + objectToText(lunch_obj.A))
            properties.push('B-čko:\u000A' + objectToText(lunch_obj.B))
          } else if (getA) {
            properties.push(objectToText(lunch_obj.A))
          } else if (getB) {
            properties.push(objectToText(lunch_obj.B))
          } 
          properties.push('A k tomu:\u000A' + objectToText(lunch_obj.common))        
          resolve(properties);
        })
        .catch((err_msg) => {
          reject(err_msg);
        })
    });
  }
}
  