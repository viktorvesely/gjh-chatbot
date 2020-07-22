const Datastore = require('nedb');

const pathProfileDatabase = "./data/msgs.db";
const MAX_STORE_MSGS = 20;

class Pendings {
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

    processProperties(msg) {
        return JSON.stringify(msg);
    }

    getUserMsgs(sender_psid) {
        return new Promise((resolve, reject) => {
            this.db.findOne({sender_psid: sender_psid}, (err, doc) => {
                if (this.errorRoutine(err, reject)) return;
                resolve(doc);
            });
        });
    }

    unpackmsgs(msgs) {
        let unpacked = [];
        msgs.forEach(msg => {
            unpacked.push(
                JSON.parse(msg)
            );
        });
        return unpacked;
    }

    clearPendings(sender_psid) {
        return new Promise((resolve, reject) => {
            this.db.remove({sender_psid: sender_psid}, {}, (err, nRemoved) => {
                if (this.errorRoutine(err, reject)) return;
                resolve();
            });
        });
    }

    hasPendings(sender_psid) {
        return new Promise((resolve, reject) => {
            this.pendings(sender_psid, false).then(msgs => {
                resolve(msgs.length > 0); 
            });
        });
    }


    pendings(sender_psid) {
        return new Promise((resolve, reject) => {
            this.db.findOne({sender_psid: sender_psid}, (err, doc) => {
                if (this.errorRoutine(err, reject)) return;

                if (doc === null) {
                    resolve([]);
                    return;
                }
                let pendings = this.unpackmsgs(doc.pendings); 
                
                this.clearPendings(sender_psid);

                resolve(pendings);
            });
        });
    }


    createRoutine(sender_psid, msg) {
        return new Promise((resolve, reject) => {
            
            let toInsert = {
                sender_psid: sender_psid,
                pendings: [this.processProperties(msg)],
            }
            this.db.insert(toInsert, (err, newDoc) => {
                if (this.errorRoutine(err, reject)) return;
                resolve();
            });
        });
    }

    updateRoutine(sender_psid, msg) {
        return new Promise((resolve, reject) => {
            let updateObj = {
                "$push": {pendings: this.processProperties(msg)}
            };
            this.db.update({sender_psid: sender_psid}, updateObj, {}, (err, nAffected) => {
                if (nAffected > 1) throw new Error(`Multiple pending messages with the same sender_psid detected! sender_psid: ${sender_psid}`);
                if (this.errorRoutine(err, reject)) return;
                resolve();
            })
        });
    }

    newMsg(sender_psid, msg) {
        return new Promise((resolve, reject) => {
            this.getUserMsgs().then(doc => {
                if (doc === null) {
                    this.createRoutine(sender_psid, msg).then(() => {
                        resolve();
                    }, () => {
                        reject();
                    });
                } else  {
                    this.updateRoutine(sender_psid, msg).then(() => {
                        resolve();
                    }, () => {
                        reject();
                    });
                }
            });
        });
    }


}

module.exports = Pendings;