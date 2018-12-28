const Pipeline = require('../database/pipeline.js');

module.exports = class PipelineHandler {
  constructor(req, userId, actions) {
    this.actions = actions;
    this.what = req.what;
    this.value = req.value;
    this.userId = userId;
    this.handler = "";
    this.__loaded = false;
    this.pipeline = new Pipeline(userId);
    
    switch(this.what) {
      case "create":
        break;
      case "delete":
        break;
      case "prefix":
        this.handler = "getPrefix";
        break;
      case "getAll":
        this.handler = "getAllPipelines";
        break;
      case "shout":
        this.handler = "shout";
        break;
      case "appUpdate":
        this.handler = "appUpdate";
        break;
      default:
        this.handler = "unknown";
        break;
    } 
  }
  
  load() {
    this.__loaded = true;
    return this.pipeline.fOnLoad();
  }
  
  resolve() {
    if(!this.__loaded) {
      throw Error("PipelineHandler: trying to access pipeline before loading it. Call load first!");
    }
    return this[this.handler]();
  };
  
  response(value, error="") {
    return {
      name: this.what ? this.what : typeof this.what,
      value: value,
      error: error,
      timestamp: Date.now()
    }
  };

  unknown() {
    return new Promise((resolve, reject) => {
      reject(this.response({}, "Unknown request"));
    });
  }
  
  getPrefix() {
    return new Promise((resolve, reject) => {
      let prefix = this.pipeline.fPrefix();
      if (prefix) resolve(this.response(prefix));
      else reject(prefix, "Error while loading prefix");
    });
  }
  
  appUpdate() {
    return new Promise((resolve, reject) => {
      if (!this.pipeline.isOwner()) {
        console.log("Non-owner pipeline was trying to acces appUpdate method.")
        reject(this.response({}, "Error while shouting app update"));
        return;
      }
      this.pipeline.getReceivers().then(receivers => {
        receivers.forEach(user => {
          this.actions.callSendTagAPI(user, this.value, "APPLICATION_UPDATE");
        });
        resolve(this.response(receivers.length));
      }, errorMsg => {
        console.error(errorMsg);
        reject(this.response({}, "Error while shouting app update"))
      })
    });
  }
  
  getAllPipelines() {
    return new Promise((resolve, reject) => {
      this.pipeline.getAllPipelines().then((pipelines) => {
        resolve(this.response(pipelines));
      },
                              () => {
        reject(this.response({}, "Error while loading pipelines, check the console"));
      });

    })
  }
  
  shout() {
    return new Promise((resolve, reject) => {
      this.pipeline.getReceivers().then(receivers => {
        receivers.forEach(user => {
          this.actions.callSendTagAPI(user.sender_psid, this.value, "NON_PROMOTIONAL_SUBSCRIPTION"); // will not work for now, waiting for response from facebook
        });
        resolve(this.response("appUpdate", receivers.length, ""));
      }, errorMsg => {
        console.error(errorMsg);
        reject(this.response("shout", {}, "Error while shouting"))
      })
    });
  }

}