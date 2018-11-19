const GIF_API = process.env.GIPHY_API_KEY 
var request = require('request')
const http = require('http')

module.exports = {
  hasObjectKeys: (obj, keys) => {
    for (let i = 0; i < keys.length; ++i) {
      if (obj.hasOwnProperty(keys[i]) == false) {
        return false;
      }
    }
    return true;
  },
  isConfident: (value) => {
    if (!value || !value[0] || !value[0].confidence) {
      return false;
    }
    return value[0].confidence > 0.7;
  },
  
  getRandInt: (min, max) => {
    return Math.floor((Math.random() * max) + min);
  },
  
  getJSONFromWebsite: (options) => {
    return new Promise((resolve, reject) => {
      var request = http.request(options, (res) => {
        var data = '';
        // Parse through the URL's content
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          // Extract JSON url from data
          data = JSON.parse(data);
          var gif_url = data.data[0].images.original.url;
          resolve(gif_url);
        });
      });
      request.on('error', (e) => {
        reject('Something went wrong loading d ' + e.message);
      });
      // End request - IMPORTANT
      request.end();
    });
  },
  
  getJSONFromURL: (options) => { 
    // (in) options = object with attributes 'host' and 'path'
    return new Promise((resolve, reject) => {
      var request = http.request(options, (res) => {
        var data = '';
        // Parse through URL's content
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          // Extract JSON from URL
          resolve(JSON.parse(data));
        });
      });
      request.on('error', (e) => {
        reject(e.message);
      });
      // End request - IMPORTANT
      request.end();
    });
  },

  getGifURL: (keyword) => {
    var keywordEncoded = encodeURIComponent(keyword);
    return new Promise((resolve, reject) => {
      // Generate request URL object
      let offset = module.exports.getRandInt(1, 5) // Used to add randomness when requesting the same keyword repeatedly
      var options = {
          host: 'api.giphy.com',
          path: '/v1/gifs/search?q=' + keywordEncoded + 
                '&api_key=' + GIF_API + 
                '&limit=1&offset=' + offset // Limit - number of gifs requested
      }
      module.exports.getJSONFromURL(options)
        .then((data) => {
          var gif_url = data.data[0].images.original.url;
          resolve(gif_url);
        })
        .catch((err_msg) => console.log('Something went wrong loading the GIF: ' + err_msg))
    });
  },
  
  getRandomElement: (array) => {
    let index = Math.floor(Math.random()*array.length);
    return array[index];
  },
  
  isFridayOrWeekend: () => {
    let isFridayOrWeekend = false;
    let today = new Date();
    // Sunday = 0; Friday = 5, Saturday = 6
    if (today.getDay() == 0 || today.getDay()%4 != 0) {
      isFridayOrWeekend = true;
    }
    return isFridayOrWeekend;
  },
  
  timeIsAtLeast : (hours_compare) => {
    let now = new Date();
    let hours = now.getHours();
    return hours >= hours_compare;
  },
  
  userNameParser(entities, originalText) {
    if(entities.hasOwnProperty("user_name") == false) {
      return "";
    }
    let name = "";
    let strippedOriginalText = originalText.replace(".", "");
    let words = strippedOriginalText.split(" ");
    let numberOfNames = entities.user_name[0].value.split(" ").length;
    if (numberOfNames != 2) {
      for (let i = 0; i < numberOfNames; ++i) {
        name +=words[words.length - (numberOfNames - i)] +  ((i + 1) == numberOfNames ?  "" : " ");
      }
      return name;
    }
    name = words[words.length - 2] + " " + words[words.length - 1];
    return name;
  },
  
  fromUtcTimeToHours(timestamp) {
    let date = new Date(timestamp);
    date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
    let start = date.toTimeString().split(":");
    return start;
  },
  
  dayOffset(target, days, onlyIndex=false) {
    var targetId = -1;
    var currentId = new Date().getDay() - 1;
    for (let i = 0; i < days.length; ++i) {
      let day = days[i]
      if (target.substr(0, 3).toLowerCase() === day.substr(0, 3)) {
        targetId = i;
        if(onlyIndex) {
          return targetId;
        }
        break;
      }
    }
    if (targetId === -1) { return -1; }
    if (targetId > currentId) {
      return targetId - currentId;
    }
    else {
      return 7 - (currentId - targetId);
    }
  },
  
  parseDayIndexFromDaySpecificationEntity(timeSpecificationEntity) {
    let dayIndex = -1;
    if (this.isConfident(timeSpecificationEntity)) {
      let value = timeSpecificationEntity[0].value.toLowerCase();
      switch (value) {
        case "today":
          dayIndex = new Date().getDay() -1;
          break;
        case "tomorrow":
          dayIndex = new Date().getDay();
          break;
        default:
          dayIndex = this.dayOffset(value, ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], true);
          if (dayIndex === -1) {
            return -1;
          }
          break;
      }
    }
    else {
      dayIndex = new Date().getDay() -1;
    }
    return dayIndex;
  }
}