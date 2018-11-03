const Utils = require('../helpers/utils.js');
const Reminder = require('../helpers/reminder_struct.js');

module.exports = class ReminderInterface {
  constructor() {
    this.days = ["pondelok", "utorok", "streda", "stvrtok", "piatok", "sobota", "nedela"]
  }
  
  print(reminders) {
    let message = "Čaká ťa,\n";

    if (reminders.length < 1) {
      return "Máš voľno. Wuuuu.";
    }
    reminders.forEach((row) => {
      message += row["subject"].substring(0, row["subject"].length -1) + "a";
      message += " " + (row["day"] + 1 ) + "." + (row["month"] + 1) + "." + row["year"] + ",\n";
    });
    message += "To bude ale srandy."
    return message;
  }
  
  makeConfirmationQuestion(reminder) {
    return "Mám ti pripomenúť " + reminder.what.substring(0, reminder.what.length -1) + "u" 
    + " " + (reminder.day + 1) + "." + (reminder.month + 1)  + "." + reminder.year + " ?";
  }
  
  parseEntity(name, entity, reminder) {
    if (!Utils.isConfident(entity)) return;
    
    var now = new Date();
    switch(name) {
      case "time_day":
        let day = "";
        let dayId = -1;
        for (let i = 0; i < this.days.length; ++i) {
          if (this.days[i].substring(0,3) == entity[0].value.substring(0,3)) {
            day = this.days[i];
            dayId = i;
            break;
          }
        }
        if (!day) {
          reminder.error = "Nerozumiem, ktorý deň myslíš."
          return;
        }
        let diff = dayId - now.getDay();
        if (diff < 0) {
          diff = 7 - Math.abs(diff)
        }
        diff -= 1;
        reminder.day = now.getDate() + diff;
        reminder.month = now.getMonth();
        break;
        
      case "time_date":
        let date = entity[0].value;
        reminder.day = Number(date.substring(0, date.indexOf("d"))) - 2;
        let distance = 0;
        if (reminder.day < 0) {
          reminder.day = 29;
          distance = -1;
        }
        reminder.month = Number(date.substring(date.indexOf("d") + 1, date.indexOf("m"))) - 1  + distance;
        break;
        
      case "lesson_name":
        reminder.what = entity[0].value;
        break;
        
      case "time_tomorrow":
        reminder["month"] = now.getMonth();
        reminder["day"] = now.getDate() - 1;
        break;
        
      default:
        return;
    }          
  }
  
  parseReminder(entities, sender_psid) {
    let reminder = new Reminder();
    
    reminder.target = sender_psid;
    reminder.year = new Date().getFullYear();

    Object.keys(entities).forEach((key) => {
      let entity = entities[key];
      this.parseEntity(key, entity, reminder); 
    });

    if (!reminder.isComplete()) {
      reminder.error = reminder.error || "Nevedel som rozoznať nejaké údaje. Skús si, prosím, pozrieť chyby.";
      return reminder;
    }

    let reminderTime = new Date();
    reminderTime.setFullYear(reminder.year, reminder.month, reminder.day + 1);
    reminderTime.setHours(17, 0, 0);
    reminder.year = reminderTime.getFullYear();
    reminder.month = reminderTime.getMonth();
    reminder.day = reminderTime.getDate() - 1;

    if (reminderTime < new Date()) {
      reminder.error = reminder.error || "To už je minulosť.";
      return reminder;
    }
    reminder.timestamp = reminderTime.getTime();
    return reminder;
  }

}