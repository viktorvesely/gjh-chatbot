var sqlite3 = require('sqlite3').verbose();

module.exports = {
  databasePath: 'database/.data/reminders.db',
  
  deleteReminderBySubject: function (sender_psid, subject, callback) {
    let db = new sqlite3.Database(this.databasePath, (err) => {
    if (err) {
      console.error(err.message);
    }

    });
  db.run("DELETE FROM notifications WHERE sender_psid=? AND LOWER(subject) LIKE ?", [sender_psid, subject.substring(0,3).toLowerCase() + '%'] , (err) => {
    if (err) {
      throw err;
    }
    callback(1);
    });  

    db.close();
  },

  deleteReminder: function (sender_psid, id = -1) {
    let db = new sqlite3.Database(this.databasePath, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
   
    if (id != -1){
      db.run("DELETE FROM notifications WHERE ID=?", id, function(err) {
        if (err)
          return console.error(err.message);
        console.log(`Row(s) deleted ${this.changes}`);
      });
    }
    else {
      db.run("DELETE FROM notifications WHERE sender_psid=?", sender_psid, function(err) {
        if (err)
          return console.error(err.message);
        console.log(`Row(s) deleted ${this.changes}`);
      });
    }

    db.close();
  },

  
  findReminderByUser: function (sender_psid, callback) {
    let db = new sqlite3.Database(this.databasePath, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
    db.all("SELECT * FROM notifications WHERE sender_psid=? ORDER BY timestamp ASC", sender_psid, (err, rows) => {
      if (err) {
        throw err;
      }
      callback(rows);
    });
    db.close();
  },
  
  insertNewReminder: function(reminder) {
    let db = new sqlite3.Database(this.databasePath, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  
    let save = [reminder.target, reminder.day, reminder.month, reminder.year, reminder.what, reminder.timestamp];

    db.run('INSERT INTO notifications(sender_psid,day,month,year,subject,timestamp) VALUES(?,?,?,?,?,?)', save, function(err) {
      if (err) {
        return console.log(err.message);
      }
      console.log("A row has been inserted with rowid ${this.lastID}");
    });

    db.close();
  },

  checkReminders: function () {
    let db = new sqlite3.Database(this.databasePath, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
    let date = new Date();
    db.all("SELECT * FROM notifications WHERE day=? AND month=? AND year=?",[date.getDate() - 1, date.getMonth(), date.getFullYear()], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        console.log(row);
      });
    });
    db.close();
  }
};