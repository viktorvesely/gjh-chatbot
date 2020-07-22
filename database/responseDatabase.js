const Datastore = require('nedb');

const pathProfileDatabase = "./data/responses.db";

class Responses {
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

    processProperties(response) {
        let filtered = {};
        for (let key in response) {
            if (key[0] === '_') continue;
            filtered[key] = response[key];
        }
        return filtered;
    }

    saveRoutine(payload) {
        return new Promise((resolve, reject) => {
            let saveObj = this.processProperties(payload);

            this.db.insert(saveObj, (err, newDoc) => {
                if (this.errorRoutine(err, reject)) return;
                resolve();
            });

        });
    }

    updateRoutine(payload) {
        return new Promise((resolve, reject) => {
            let setObj = {
                $set: this.processProperties(payload)
            };
            
            this.db.update({name: payload.name}, setObj, {}, (err, nAffected) => {
                if (nAffected > 1) throw new Error(`Multiple responses with same name detected! name: ${payload.name}`);
                if (this.errorRoutine(err, reject)) return;
                resolve();
            });            
        });
    }

    save(payload) {
        return new Promise((resolve, reject) => {
            this.get(payload.name).then(doc => {
                if (doc === null) {
                    this.saveRoutine(payload).then(() => {
                        resolve();
                    });
                } else  {
                    this.updateRoutine(payload).then(() => {
                        resolve();
                    });
                }
            });
        });
    }

    get(name) {
        return new Promise((resolve, reject) => {
            this.db.findOne({name: name}, (err, doc) => {
                if (this.errorRoutine(err, reject)) return;
                resolve(doc);
            });
        });
    }

    removeOne(name) {
        return this.remove([name]);
    }

    remove(names) {
        return new Promise((resolve, reject) => {
            let query = [];
            names.forEach(name => {
                query.push({name: name});
            });
            this.db.remove({ $or: query }, (err, nAffected) => {
                if (this.errorRoutine(err, reject)) return;
                resolve(nAffected);
            });
        });
    }    

}

module.exports = Responses;