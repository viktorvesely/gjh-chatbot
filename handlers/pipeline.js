const Pipeline = require('../database/pipeline.js');
const Wrapper =  require('../templates/wrapper.js');
const TemplateDecoder = require('./templateDecoder.js');
const ResponseHandler = require('./response.js');
const SerieExecutor = require('../helpers/serieExecutor');

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
      case "owner":
        this.handler = "getOwner";
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
      case "getGroups":
        this.handler = "getGroups";
        break;
      case "getAnnouncements":
        this.handler = "getAnnouncements";
        break;
      case "builder":
        this.handler = "getBuilder";
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
  
  getOwner() {
    return new Promise((resolve, reject) => {
      resolve(this.response(this.pipeline.isOwner()));
    });
  }
  
  getPrefix() {
    return new Promise((resolve, reject) => {
      let prefix = this.pipeline.fPrefix();
      if (prefix) resolve(this.response(prefix));
      else reject(prefix, "Error while loading prefix");
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
  
  getBuilder() {
    return new Promise((resolve => {
      resolve(this.response(Wrapper));
    }));
  }
  getAnnouncements() {
    return new Promise((resolve, reject) => {
      let flags = this.pipeline.flags;
      let allTypes = [
        this._group("General", "general"),
        this._group("App update", "app_update"),
        this._group("ŽŠR", "school_council"),
        this._group("Rádio gjh", "school_radio")
      ]
      let types = [];
      if (flags === "z") {
        resolve(this.response(allTypes));
        return;
      }
      if (flags.includes("a")) {
        types.push(allTypes[0]);
      }
      if (flags.includes("r")) {
        types.push(allTypes[3]);
      }
      if (flags.includes("s")) {
        types.push(allTypes[2]);
      }
      resolve(this.response(types));
    });
  }
  
  _group(displayName, name) {
    return {
      display: displayName,
      name: name
    };
  }
  
  getGroups() {
    return new Promise((resolve, reject) => {
      resolve(this.response([
        this._group("Všetci", "everyone"),
        this._group("Študenti", "students"),
        this._group("Uchádzači", "applicants"),
        this._group("Učitelia", "teachers"),
        this._group("Rodičia", "parents")     
              ]))
    });
  }
  
  shout() {
    return new Promise((resolve, reject) => {
      let type = this.value.type;
      let response = this.value.response;
      let groups = this.value.groups;
      
      let decodedResponse = new TemplateDecoder(response);
      this.getAnnouncements().then(response => {
        let verifyTypes = response.value;
        if (!verifyTypes.find(group => group.name === type)) reject(this.response({}, "Could not verify your pipeline. Try refreshing the page"))
        let tag;
        
        switch (type) {
          case "general":
            tag = "NON_PROMOTIONAL_SUBSCRIPTION";
            break;
          case "app_update":
            tag = "APPLICATION_UPDATE";
            break;
          case "school_council":
            tag = "NON_PROMOTIONAL_SUBSCRIPTION";
            break;
          case "school_radio":
            tag = "NON_PROMOTIONAL_SUBSCRIPTION";
            break;
        }

        this.pipeline.getReceivers().then(receivers => {
          receivers.forEach(user => {
            let responseHandler = new ResponseHandler(response, this.actions, sender_psid);
            let todos = responseHandler.getTasks(tag);
            let serieExecutor = new SerieExecutor(todos, () => { serieExecutor = undefined });
            this.actions.callSendTagAPI(user, msg, tag); 
          });
          resolve(this.response(receivers.length));
        }, errorMsg => {
          console.error(errorMsg);
          reject(this.response({}, "Error while shouting"))
        });
      });
    });
  }

}