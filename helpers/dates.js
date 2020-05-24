const Utils = require('./utils.js');
const Constants = require('./constants.js')

function pad(num) { // Converts single-digit numbers to double digit (e.g. 9 -> 09)
  return num<10 ? '0'+num : num;
}

function getFullPaddedDate(date) {
  return `${pad(date.getFullYear())}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`
}

module.exports =  {
  
  /*
  todayIsSummerHolidays: () => {
    var date = new Date()
    return (date.getMonth() == 6 || date.getMonth() == 7)
  },*/
  
  getOffsetDate: (offset) => {
    return new Promise(resolve => {
      let today = new Date()
      var offsetDate = new Date()
      offsetDate.setDate(today.getDate() + offset)
      resolve(getFullPaddedDate(offsetDate));
    })
  },
  
  getDateObjectForLunchPostRequest: () => {
    return new Promise(resolve => {
      let lunchDateObject = {} 

      /*
      BACKUP
      
      let monday = new Date()
      let day = offsetDate.getDay()
      let diff = offsetDate.getDate() - day + (day == 0 ? -6:1) // adjust when day is sunday
      monday.setDate(diff);
      lunchDateObject.from = getFullPaddedDate(monday)
      */
      
      // TODO
      // Won't handle new year!!!
      var monday = new Date()
      monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
      lunchDateObject.from = getFullPaddedDate(monday)

      var sunday = new Date()
      sunday.setDate(monday.getDate() + 6);
      lunchDateObject.until = getFullPaddedDate(sunday)

      var nextMonday = new Date()
      nextMonday.setDate(monday.getDate() + 7)
      lunchDateObject.nextFrom = getFullPaddedDate(nextMonday)
      
      var nextSunday = new Date()
      nextMonday.setDate(monday.getDate() + 13)
      lunchDateObject.nextUntil = getFullPaddedDate(nextMonday)
      
      resolve(lunchDateObject)
    });
  },
  
  getLunchDayOffset: (data) => {
    if (data.hasOwnProperty('time_tomorrow')) {
      return 1
    }
    if (data.hasOwnProperty('time_day_after_tomorrow')) {
      return 2
    }
    if (data.hasOwnProperty('time_day')) {
      return Utils.dayOffset(data.time_day[0].value, Constants.date.weekdaysSK)
    }
    return 0
  }
}