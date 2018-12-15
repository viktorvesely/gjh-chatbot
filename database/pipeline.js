var sql = require('sqlite3').verbose();

class Pipeline {
  constructor(userId) {
    if (userId === undefined) return this;
    this.user = userId;
    this.flags = "";
    this.onLoad = this.load();
  }
  
  fOnLoad() {
    return this.onLoad;
  }
  
  makeFrom(userId, flags) {
    this.user = userId;
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
            resolve();
          }
        }
      });
      db.close();
    });
  }
    
  createPipeline(userId, flags, onCreated=null) {
    if (!this.isOwner()) return;
    var db = this.pipelaneDatabase();
    db.get("INSERT INTO pipelines(userId,flags) VALUES(?,?)", [userId, flags], (err, changes) => {
      if (err) {
        console.log(err);
      } else {
        onCreated ? onCreated(new Pipeline().makeFrom(userId, flags)) : null; 
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
  
}

Pipeline.prototype._owner = process.env.PIPELINE_OWNER;
Pipeline.prototype._userDatabasePath = "database/.data/profiles.db";
Pipeline.prototype._pipelineDatabasePath = "database/.data/pipelines.db";
Pipeline.prototype.pipelaneDatabase = () => {
    return new sql.Database(this._pipelineDatabasePath, err => {
      if (err) console.error(err);
  });
}
Pipeline.prototype.userDatabase = () => {
    return new sql.Database(this._userDatabasePath, err => {
      if (err) console.error(err);
    });
  }

module.exports = Pipeline;