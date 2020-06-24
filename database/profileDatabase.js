const Datastore = require('nedb')

const pathProfileDatabase = "./data/profiles_test.db"

class ProfileDatabase {
    constructor() {
        this.db = new Datastore({ filename: pathProfileDatabase })
        this.db.loadDatabase( err => {    
            if (err) { 
                console.error(err);
            }
        });
    }

    load() {
        return new Promise((resolve, reject) => {
            this.db.loadDatabase( err => {    
                if (err) { 
                    console.error(err);
                    reject();
                    return;
                }
                resolve();
            });
        });
    }

    errorRoutine(err, reject) {
        if (err) { 
            console.error(err);
            reject();
            return true;
        }
        return false;
    }

    userExist(sender_psid) {
        return new Promise((resolve, reject) => {
            this.db.findOne({sender_psid: sender_psid}, (err, doc) => {
                if (this.errorRoutine(err, reject)) return;
                resolve(doc !== null);
            })
        });
    }


    createRoutine(sender_psid, properties) {
        return new Promise((resolve, reject) => {
            let saveObj = {
                sender_psid: sender_psid
            };
    
            for (let key in properties) {
                if (key[0] === '_') continue;
                saveObj[key] = properties[key];
            }
    
            
            this.db.insert(saveObj, (err, newDoc) => {
                if (this.errorRoutine(err, reject)) return;
                resolve();
            });
        });
    }

    getUser(sender_psid) {
        return new Promise((resolve, reject) => {
            this.db.findOne({sender_psid: sender_psid}, (err, doc) => {
                if (this.errorRoutine(err, reject)) return;
                if (doc === null) {
                    this.createRoutine(sender_psid, {}).then(() => {
                        resolve({sender_psid: sender_psid});
                    });
                    return;
                }
                resolve(doc);
            });
        });
    }

    serializeUser(sender_psid, blueprint) {
        return new Promise((resolve, reject) => {
            this.getUser(sender_psid).then(user => {
                
                if (user == null) { 
                    resolve();
                    return;
                }

                let unset = {};

                for (let key in user) {
                    if (key == "sender_psid") continue;
                    
                    if (!blueprint.hasOwnProperty(key)) {
                        unset[key] = true;
                    }
                }

                this.db.update({sender_psid: sender_psid}, {$unset: unset}, {}, (err, nAffected) => {
                    if (this.errorRoutine(err, reject)) return;
                    resolve();
                });

            }, () => {
                reject();
            });
        });
    } 

    updateRoutine(sender_psid, properties) {
        return new Promise((resolve, reject) => {
            let setData = {};

            for(let key in properties) {
                if (key[0] === '_') continue;
                setData[key] = properties[key];
            }

            let setObj = {
                $set: {
                    data:{
                        setData
                    }
                }
            };
    
            this.db.update({sender_psid: sender_psid}, setObj, {}, (err, nAffected) => {
                if (this.errorRoutine(err, reject)) return;
                resolve();
            });
        });
    }

    breakDown(_sender_psid, _properties) {
        let sender_psid, properties;

        if (_properties == null) {
            sender_psid = _sender_psid.sender_psid
            if (!sender_psid) {
                throw new Error("sender_psid was undefined!");
            }
            _sender_psid.sender_psid = undefined;
            properties = _sender_psid;
        } else {
            sender_psid = _sender_psid;
            properties = _properties;
        }
       
        return [sender_psid, properties];
    }

    /**
    * @param {string|object} sender_psid Either id of the user or the entire user object
    * @param {object|null} properties Object of the user properties, default is null
    */
    updateUser(sender_psid, properties=null) {
        return new Promise((resolve, reject) => {
            let _sender_psid, _properties, both;

            both = this.breakDown(sender_psid, properties);
            _sender_psid = both[0];
            _properties = both[1];

            this.userExist(_sender_psid).then(exists => {
                if (exists) {
                    this.updateRoutine(_sender_psid, _properties).then(() => {
                        resolve();
                    }, () => {
                        reject();
                    })
                } else {
                    this.createRoutine(_sender_psid, _properties).then(() => {
                        resolve();
                    }, () => {
                        reject();
                    })
                }
            }, () => {
                reject();
            })
        });
    }
}

module.exports = ProfileDatabase;
