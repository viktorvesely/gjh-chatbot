module.exports = class TimeTable {
  constructor(classId) {
    this.classId = classId;
    this.days = [];
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
    this.days[day][period] = lesson;
    if (seminar) this.days[day][period + 1] = lesson;
  }
}