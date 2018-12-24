const request = require('request');
const translate = {
  drink: 'Nápoj',
  side: 'Príloha',
  salad: 'Šalát',
  main: 'Hlavné jedlo',
  extra: 'Bonus',
  soup: 'Polievka'
}

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
    })
    resolve(properties)
  });
}

module.exports = {
  getDate: (day_offset) => {
    if (day_offset === undefined) day_offset = 0;
    let today = new Date();
    var nextDay = new Date();
    nextDay.setDate(today.getDate() + day_offset);
    return nextDay.toISOString().split("T")[0]; //format date to YYYY-MM-DD
  },
  
  getJSON: (date_from, date_until) => {
    //temp dates
    // TODO use template strings
    // pseudo code
    let now = new Date();
    let offsetFromMonday = now.getDay() - 1;
    offsetFromMonday = offsetFromMonday === - 1 ? 6 : offsetFromMonday; // handle Sunday
    let weekStartDate = now.getDate() - offsetFromMonday; // should be Monday
    let weekEndDate = weekStartDate + 6; // should be Sunday
    let new_date_from =  `${now.getFullYear()}-${now.getMonth()}-${weekStartDate}`; // will break when the week lays across two moths (also for year)
    let new_date_until =  `${now.getFullYear()}-${now.getMonth()}-${weekEndDate}`; // will break when the week lays across two moths (also for year)
    date_from = "2018-12-10"
    date_until = "2018-12-16"
    
    return new Promise((resolve, reject) => {
      let querystring = require('querystring');
      let temp_form = querystring.stringify({
        method: 'getUdajeGlobal', 
        veci: {"setChosenSchoolYearFromDate":{"co":"setChosenSchoolYearFromDate","date": date_until},
               "alergeny":{"co":"alergeny","plati_od": date_from,"plati_do": date_until},
               "mobile_getListok":{"co":"mobile_getListok","od": date_from,"do": date_until,"pcVerzia":true}
              }
      });
      
      request({
        url: 'https://ssnovohradska.edupage.org/menu/',
        form: temp_form
      }, (err, response, body) => {
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
        }
      );
    });
  },
  
  getLunchObject: (day_offset) => {
    return new Promise((resolve, reject) => {
      let date = module.exports.getDate(day_offset);
      
      // method na vytvorenie dolnych 2 boundaries
      // let date_from, date_until = 
      module.exports.getJSON()
        .then((data) => {
          if (data[date].hasOwnProperty('2')) { // if no lunch, data[date] is an empty array
            let temp = data[date]['2'].nazov
              .split('\n')
              .map(line => {
                return line.replace(/\s+\s/g,' ')
              })
            
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
                })
              .then(() => {
                lunch_obj.common.soup = temp[0].substring(temp[0].indexOf(' ') + 1).toLowerCase()
                resolve(lunch_obj);
              })
            } else { // If there is only one option (e.g. the week after Christmas holidays)
              // Q: Extract whole array? What is the structure?
            }
          } else { // If the array is empty (e.g. weekend, during holidays)
            reject("Jedáleň vtedy nevarí 😕")
          }
        })
        .catch((err) => reject(err));
    })
  },
  
  objectToText(obj) {
    let s = "";
    for (var meal_type in obj) {
      s += translate[meal_type] + ': ' + obj[meal_type] + '\u000A';
    }
    return s;
  },
  
  getLunchText(day_offset, getA, getB) {
    return new Promise((resolve, reject) => {
      let properties = []
      let getBoth = (getA && getB) || (!getA && !getB) //XNOR; if the user does not specify A or B, we assume they want both, A and B
      module.exports.getLunchObject(day_offset)
        .then((lunch_obj) => {
          properties.push('Papať budeš:')
          if (getBoth) {
            properties.push('A-čko:\u000A' + module.exports.objectToText(lunch_obj.A))
            properties.push('B-čko:\u000A' + module.exports.objectToText(lunch_obj.B))
          } else if (getA) {
            properties.push(module.exports.objectToText(lunch_obj.A))
          } else if (getB) {
            properties.push(module.exports.objectToText(lunch_obj.B))
          } 
          properties.push('A k tomu:\u000A' + module.exports.objectToText(lunch_obj.common))        
          resolve(properties);
        })
        .catch((err_msg) => {
          reject(err_msg);
        })
    });
  }
}
  