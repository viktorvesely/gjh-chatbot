var sql = require('sqlite3').verbose();

class Pipeline {
  constructor(userId) {
    this.user = userId;
    this.flags = "";
    this.prefix = "";
    if (userId === undefined) return this;
    this.onLoad = this.load();
  }
  
  fOnLoad() {
    return this.onLoad;
  }
  
  fPrefix() {
    return this.prefix;
  }
  
  makeFrom(userId, flags, prefix) {
    this.user = userId;
    this.prefix = prefix;
    this.flags = flags;
    return this;
  }
  
  delete() {
    return new Promise((resolve, reject) => {
      var db = this.pipelaneDatabase();
      db.run("DELETE FROM pipelines WHERE userId=?", this.user, (err, idk) => {
        if (err) {
          console.error(err);
          reject();
        } else {
          if (this.changes.length === 1) {
            resolve();
          } else {
            reject();
          }
        }
      });
    });
  }
  
  load() {
    return new Promise((resolve, reject) => {
      if(this.isOwner()) {
        this.flags = "z";
        this.prefix = "Viktor & Filip";
        resolve();
        return;
      }
      var db = this.pipelaneDatabase();
      db.get("SELECT * FROM pipelines WHERE userId=? LIMIT 1", this.user, (err, user) => {
        if (err) {
          console.error(err);
          reject();
        } else {
          if (!user) {
            reject();
          } else {
            this.flags = user.flags;
            this.prefix = user.prefix;
            resolve();
          }
        }
      });
      db.close();
    });
  }
    
  createPipeline(userId, flags, prefix, onCreated=null) {
    if (!this.isOwner()) return;
    var db = this.pipelaneDatabase();
    db.get("INSERT INTO pipelines(userId,flags,prefix) VALUES(?,?,?)", [userId, flags, prefix], (err, changes) => {
      if (err) {
        console.log(err);
      } else {
        onCreated ? onCreated(new Pipeline().makeFrom(userId, flags, prefix)) : null; 
      }
    });
    db.close();
  }
  
  getAllPipelines() {
    return new Promise((resolve, reject) => {
      if (!this.isOwner()) reject(-1);
      var db = this.pipelaneDatabase();
      db.get("SELECT * FROM pipelines", [], (err, pipelines) => {
        if (err) {
          console.log(err);
          reject();
        } else {
          resolve(pipelines);
        }
      });
      db.close();
    });
  }
  
  getAllProfiles() {
    return new Promise((resolve, reject) => {
      var db = this.userDatabase();
      
      db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
          console.error(err);
          reject();
        } else {
          resolve(rows);
        }
      })
      db.close();
    });
  }
  
  isOwner() {
    return this._owner === this.user;
  }
  
  getReceivers() {
    return new Promise((resolve, reject) => {
      if (!this.flags) {
        reject("Could not load the pipeline's flags");
        return;
      }
      this.getAllProfiles().then(rows => {
        let recievers = [];
        rows.forEach(profile => {
          let sender_psid = profile.sender_psid.toString();
          switch (this.flags) {
            case "z":
              recievers.push(sender_psid);
              break;
            case "a":
              if (!profile.generalOptOut) {
                recievers.push(sender_psid);
              }
              break;
          }
        });
        resolve(recievers);
      });
    });
  }
  
}

Pipeline.prototype._owner = process.env.PIPELINE_OWNER;
Pipeline.prototype._userDatabasePath = "database/.data/profiles.db";
Pipeline.prototype._pipelineDatabasePath = "database/.data/pipelines.db";
Pipeline.prototype.pipelaneDatabase = () => {
    return new sql.Database(Pipeline.prototype._pipelineDatabasePath, err => {
      if (err) console.error(err);
  });
}
Pipeline.prototype.userDatabase = () => {
    return new sql.Database(Pipeline.prototype._userDatabasePath, err => {
      if (err) console.error(err);
    });
  }

module.exports = Pipeline;