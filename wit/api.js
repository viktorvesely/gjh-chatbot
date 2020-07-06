const fetch = require('node-fetch');

module.exports = {
    getIntents(authentication) {
        return new Promise((resolve, reject) => {
            fetch("https://api.wit.ai/intents?v=20200513", {
                method: "GET",
                headers: { "Authorization": `Bearer ${authentication}` }
            })
            .then(res => res.json())
            .then(intents =>{
                resolve(intents);
            }, err => {
                console.error(err);
                reject();
            });
        });
    }
}