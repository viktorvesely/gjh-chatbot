/*

Cacher class - Interface for caching jsons

Interface methods:

constructor(
filePath : string (relative to the caller),
onCacheReload : function (needs to return a promise which supplies data (heavy operation)),
recacheAfter : number (miliseconds after which the cache will become expired)
)

get(
) returns promise => data from cache or recache


*/

const fs = require('fs');


class Cacher {
  
  constructor(filePath, onCacheReload, recacheAfter) {
    this.recacheAfter = recacheAfter;
    this.path = filePath;
    this.reloadCache = onCacheReload;
    this.json = null;
  }
  
  get() {
    return new Promise(resolve => {
      this.recache().then(
        ()=> {
          this.reloadCache.then(data => { // zmena
            this.saveData(data).then(() => {
              resolve(data);
            })
          });
        },
        (data) => {
          resolve(data);  
        }
      );
      
    });
  }
  
  recache() {
    return new Promise((resolve, reject) => {
      this.fileExist().then(
        ()=> { // file exists
          this.loadData().then(json => {
            let delta = (json.timestamp + this.recacheAfter) - Date.now()
            console.log(json.timestamp - Date.now())
            if(delta  <= 0) {
              resolve();
            }
            reject(json.data);
          })
        },
        ()=> { // file does not exist
          resolve();
        }
      );
    }); 
  }
  
  loadData() {
    return new Promise(resolve => {
      fs.readFile(this.path, "utf8", (err, data) => {
        if (err) throw err;
        let object = JSON.parse(data);
        resolve(object);
      });
    });
  }
  
  fileExist() {
    return new Promise((resolve, reject) => {
      fs.access(this.path, fs.F_OK, (err) => {
        if (err) {
          return reject();
        }
        resolve();
      });
    });
  }
  
  generateStorageJson(data) {
    return {
      data: data,
      timestamp: Date.now()
    };
  }
  
  saveData(data) {
    return new Promise(resolve => {
        this.json = this.generateStorageJson(data);
        let writeData = JSON.stringify(this.json);
        fs.writeFile(__dirname + this.path, writeData, err => {
          //if (err) throw err;
          if(err) console.log(err)
          resolve();
        });
    });
  }
  
  
}



module.exports = Cacher;