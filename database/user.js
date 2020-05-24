var sqlite3 = require('sqlite3').verbose();

module.exports = {
  databasePath: 'database/.data/users.db',

  addUser : function(sender_psid, name, surrname, callback) {
    let db = new sqlite3.Database( this.databasePath, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
    
    this.checkIfExist(sender_psid, (exist) => {
      if (exist) {
        db.all("UPDATE users SET first_name = ?, second_name = ? WHERE sender_psid=?", [name, surrname, sender_psid], (changed, err) => {
          console.error(err);
        });
      } else {
        db.run("INSERT INTO users(sender_psid,first_name,second_name) VALUES(?,?,?)", [sender_psid, name, surrname], (changed, err) => {
          if (err){
            console.error(err.message);
          }
        })
      }
    });
  },
  
  checkIfExist : function (sender_psid, callback){
    let db = new sqlite3.Database( this.databasePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    });
    
    db.all("SELECT first_name, second_name FROM users WHERE sender_psid=?", sender_psid, (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      if(rows && rows.length)
        callback(rows);
      else
        callback(false);
    });
  },
  
  getName : function (sender_psid, callback) {
    let db = new sqlite3.Database( this.databasePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    });
    
    db.all("SELECT first_name, second_name FROM users WHERE sender_psid=?", sender_psid, (err, data) => {
      if (err) {
        console.error(err);
      }
      
      callback(data);
      
    });
    
  }

};



