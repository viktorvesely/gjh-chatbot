const whiteList = ["1325016894292787", "1888816147822126"] // my sender_psid
const http = require("http");
var fs = require('fs');
var querystring = require('querystring');

module.exports = {
  donwloadAttachment: function(url, callback) {
    var file = fs.createWriteStream("file.jpg");
    var request = http.get(url, function(response) {
      response.pipe(file);
      callback(file)
    });
  },
  handle: function(sender_psid, url, client, callback) {
    console.log(url);
    if (!whiteList.includes(sender_psid)) {
      callback(false)
      return;
    }
    if(url.indexOf(".mp4") !== -1) {
      this.donwloadAttachment(url, (file) => {
      this.sendToWit(file, client);
      })
    }
    else {
      return {type: "unknown"};
    }
    
  },
  sendToWit: function(file, client) {
    // Build the post string from an object
    var post_data = querystring.stringify({
        v: "20180825"
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'https://api.wit.ai',
        port: '80',
        path: '/speech',
        method: 'POST',
        headers: {
            'Content-Type': 'Content-Type: audio/mpeg3',
            'Authorization': 'Bearer ' + process.env.WIT_ACCES_TOKEN
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();
  }
}