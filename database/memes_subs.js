var sqlite3 = require('sqlite3').verbose();

module.exports = {
  
  databasePath: 'database/.data/meme_subs.db',
  
  removeSub: function(sender_psid) {
    let db = new sqlite3.Database(this.databasePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    });
    
    db.run("DELETE FROM subs WHERE sender_psid=?", sender_psid, (err) => {
       if (err) {
        console.error(err.message);
      }
    });
  },
  
  allSubs : function(sender_psid, callback) {
    let db = new sqlite3.Database(this.databasePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    });
    
    db.all("SELECT sender_psid FROM subs", (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      else
        callback(rows);
    });
    
  },
  
  addSub : function(sender_psid) {
    let db = new sqlite3.Database(this.databasePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    });
    
    
    db.run("INSERT INTO subs(sender_psid) VALUES(?)", sender_psid, (err) => {
      if (err){
        console.error(err.message);
      }
    })
  },
  
  checkIfExist : function (sender_psid, callback){
    let db = new sqlite3.Database(this.databasePath, (err) => {
    if (err) {
      console.error(err.message);
    }
    });
    
    db.all("SELECT 1 FROM subs WHERE sender_psid=?", sender_psid, (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      if(rows && rows.length)
        callback(true);
      else
        callback(false);
    });
  },
  

};
