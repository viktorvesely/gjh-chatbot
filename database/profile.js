var sql = require('sqlite3').verbose();

class Profile {
  constructor(sender_psid, onLoad=null) {
    if (sender_psid && onLoad && typeof onLoad == "function") {
      this.loadProfile().then(() => {
        onLoad();
      }, ()=> {
        console.error("Database error occur see the log above for more details");
      });
    }
    this.formatData(sender_psid || null);
  }
  
  init(sender_psid=null) {
    this.formatData(sender_psid || this.sender_psid, "", "", -1, false);
  }
  
  loadProfile(sender_psid) {
    return new Promise((resolve, reject) => {
      var db = this.getDatabase();
      
      db.get("SELECT * from users WHERE sender_psid=? LIMIT 1", sender_psid, (err, row) => {
        if (err) {
          console.error(err);
          reject();
        } else {
          resolve(row); 
        }
      })
      
      db.close();
    });
  }
  
  identify(sender_psid) {
    this.sender_psid = sender_psid;
  }
  
  exist() {
    return new Promise((resolve, reject) => {
      var db = this.getDatabase();
      
      db.get("SELECT * from users WHERE sender_psid=? LIMIT 1", this.sender_psid, (err, row) => {
        if (err) {
          console.error(err);
          reject();
        } else {
          resolve(row === undefined ? false : true); 
        }
      })
      
      db.close();
    });
  }
  
  save(onError=null, onSuccess=null) {
    if (this.validateData()) {
      this.exist().then( exist => {
        var db = this.getDatabase();
        let data = Object.values(this.exportData());
        console.log(exist);
        if (exist) {
          data.push(data.splice(0,1)[0]); // switch sender_psid to last position
          db.run("UPDATE users SET first_name=?, second_name=?, class=?, optOut=? WHERE sender_psid=?", data, err=> {
            if (err) {
              console.error(err);
              onError === null ? null : onError();
            } else {
              onSuccess === null ? null : onSuccess();
            }
          });
        } else {
          db.run("INSERT INTO users(sender_psid,first_name,second_name,class,optOut) VALUES(?,?,?,?,?)", data, err => {
            if (err) {
              console.error(err);
              onError === null ? null : onError();
            } else {
              onSuccess === null ? null : onSuccess();
            }
          })
        }
        db.close();
      }, () => {
        onError === null ? null : onError();
      })
    }
  }
  
  
  validateData() {
    let data = this.exportData();
    for (let key in this.Data) {
      if (typeof data[key] !== this.Data[key]) {
        throw Error("Profile validation error. Invalid data: " + JSON.stringify(data));
      }
    }
    return true;
  }
  
  formatData(sender_psid=null, firstName=null, secondName=null, classId=null, optOut=null) {
    this.sender_psid = sender_psid;
    this.firstName = firstName;
    this.secondName = secondName;
    this.classId = classId;
    this.optOut = optOut;
  }
  
  exportData() {
    return {
      sender_psid: this.sender_psid,
      firstName: this.firstName,
      secondName: this.secondName, 
      classId: this.classId,
      optOut: this.optOut
    }
  }
  
  getDatabase() {
    return new sql.Database(this._databasePath, err => {
      if (err) console.error(err);
    });
  }
  
  fFirstName(value=null) {
    return value === null ? this.firstName : (this.firstName = value);
  }
  fSecondName(value=null) {
    return value === null ? this.firstName : (this.secondName = value);
  }
  fClassId(value=null) {
    return value === null ? this.firstName : (this.classId = value);
  }
  fOptOut(value=null) {
    return value === null ? this.firstName : (this.optOut = value);
  }
}

Profile.prototype._databasePath = "database/.data/profiles.db"

Profile.prototype.Data = {
  sender_psid: "string",
  firstName: "string",
  secondName: "string",
  classId: "number",
  optOut: "boolean"
}

module.exports = Profile;