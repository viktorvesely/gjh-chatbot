const fetch = require('node-fetch');

class API {
    constructor(baseUrl) {
        this.url = baseUrl;
    }

    getIntents() {
        return new Promise((resolve, reject) => {
            fetch(this.url + "/intents", {
                method: 'GET'
            })
            .then(res => res.json())
            .then(data =>  {
                resolve(data["intents"]);
            }, err => {
                console.error(err);
                reject();
            });
        });
    }
}

module.exports = API;