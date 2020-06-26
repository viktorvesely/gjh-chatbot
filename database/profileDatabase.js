const Datastore = require('nedb');

const pathProfileDatabase = "./data/profiles.db";

class ProfileDatabase {
    constructor() {
        this.db = new Datastore({ filename: pathProfileDatabase })
        this.db.loadDatabase( err => {    
            if (err) { 
                console.error(err);
            }
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
            });
        });
    }

    processProperties(user) {
        let filtered = {};
        for (let key in user) {
            if (key[0] === '_') continue;
            filtered[key] = user[key];
        }
        return filtered;
    }


    createRoutine(user) {
        return new Promise((resolve, reject) => {
            let saveObj = this.processProperties(user);

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
                    this.createRoutine({sender_psid: sender_psid}).then(() => {
                        resolve({sender_psid: sender_psid});
                    });
                    return;
                }
                resolve(doc);
            });
        });
    }

    updateRoutine(user) {
        return new Promise((resolve, reject) => {
            let setObj = {
                $set: this.processProperties(user)
            };
            
            this.db.update({sender_psid: user.sender_psid}, setObj, {}, (err, nAffected) => {
                if (nAffected > 1) throw new Error(`Multiple users with same sender_psid detected! sender_psid: ${sender_psid}`);
                if (this.errorRoutine(err, reject)) return;
                resolve();
            });
        });
    }

    /**
    * @param {object} user user object (must have sender_psid)!
    */
    updateUser(user) {
        return new Promise((resolve, reject) => {
            let sender_psid = user.sender_psid;

            this.userExist(sender_psid).then(exists => {
                if (exists) {
                    this.updateRoutine(user).then(() => {
                        resolve();
                    }, () => {
                        reject();
                    })
                } else {
                    this.createRoutine(user).then(() => {
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
