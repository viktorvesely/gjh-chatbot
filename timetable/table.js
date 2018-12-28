const fs = require('fs');
const Days = require('../helpers/days.js');

const filePath = "./timetable/timeTables.json";

module.exports = class TimeTable {
  constructor(classId) {
    this.classId = classId;
    this.days = this.initDays();
    
    this.seminarPeriod = {
      start: "14:00",
      end: "15:30"
    }
    this.periods = [
      {
        start: "7:10",
        end: "7:50"
      },
      {
        start: "8:00",
        end: "8:45"
      },
      {
        start: "8:50",
        end: "9:35"
      },
      {
        start: "9:50",
        end: "10:35"
      },
      {
        start: "10:50",
        end: "11:35"
      },
      {
        start: "11:45",
        end: "12:30"
      },
      {
        start: "12:40",
        end: "13:25"
      },
      {
        start: "13:30",
        end: "14:15"
      },
      {
        start: "14:30",
        end: "15:15"
      },
      {
        start: "15:20",
        end: "16:05"
      }
    ]
  }
  
  getTimeFromPeriod(period, seminar, correctTime) {
    if (correctTime) return this.seminarPeriod;
    else if (seminar) return {
      start: this.periods[1].start,
      end: this.periods[2].end
    }
    else if (seminar && period === 8) return {
      start: this.periods[8].start,
      end: this.periods[9].end
    }
    else return this.periods[period]
  }
  
  addLesson(day, period, duration, teacher, room, subject) {
    let seminar = duration === 2;
    let correctTime = (seminar && period == 7);
    let lesson = {
      seminar: seminar,
      duration: duration,
      teacher: teacher,
      subject: subject,
      room: room,
      time: this.getTimeFromPeriod(period, seminar, correctTime)
    }
    if (typeof this.days[day][period] === "undefined") {
      this.days[day][period] = [];
    }
    this.days[day][period].push(lesson);
    if (seminar) {
      if (typeof this.days[day][period + 1] === "undefined") {
        this.days[day][period + 1] = [];
      }
      this.days[day][period + 1].push(lesson);
    }
  }
  
  initDays() {
    let ret = [];
    ret[Days.mon] = [];
    ret[Days.tue] = [];
    ret[Days.wed] = [];
    ret[Days.thu] = [];
    ret[Days.fri] = [];
    return ret;
  }
  
  export() {
    return {
      days: this.days
    }
  }
  
  get(day, period) {
    return this.days[day][period];
  }
  
  getTimeTables() {
    return new Promise(resolve => {
      fs.readFile(filePath, "utf8" ,(err, data) => {
        if (err) throw err;
        let object;
        try {
          object = JSON.parse(data);
        } catch (e) {
          object = {};
        }
        resolve(object);
      });
    });
  }
  
  load() {
    return new Promise(resolve => {
      this.getTimeTables().then(timeTables => {
        
        this.days = typeof timeTables[this.classId] === "undefined" ? undefined : timeTables[this.classId].days;
        resolve();
      });
    });  
  }
  
  save() {
    return new Promise(resolve => {
      this.getTimeTables().then(timeTables => {
        debugger;
        timeTables[this.classId] = this.export();
        let writeData = JSON.stringify(timeTables);
        fs.writeFile(filePath, writeData, err => {
          if (err) throw err;
          resolve();
        });
      })
    });
  }
}