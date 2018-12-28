var app = new Vue({
  el: "#app",
  data: {
    pipelines: [],
    errors: [],
    createHover: false,
    menuHover: false,
    prefix: "",
    shoutText: "",
    shoutType: "",
    shoutTypeVisual: "Select a type",
    path: "/pipes-command"
  },
  methods: {
    init() {
      console.log("init");
      this.getPrefix();
      this.loadPipelines();
    },
    shout () {
      if (!this.shoutText) return this.popErrorMsg("Shout text cannot be empty");
      if (!this.shoutType) return this.popErrorMsg("Select a announcement type");
      switch(this.shoutType) {
        case "general":
          break;
        case "appUpdate":
          this.appUpdate(this.shoutText);
      }
    },
    command(what, value=null) {
      return new Promise((resolve, reject) => {
        var context = this;
        $.ajax(this.path, {
          contentType: "application/json",
          data: JSON.stringify({what: what, value: value}),
          method: "POST",
          complete: (res) => {
            let response = res.responseJSON;
            if (!response.error) {
              resolve(response.value);
            } else {
              context.popErrorMsg(response.error);
              reject(response);
            }
          }
        });
      });
    },
    removeError(id) {
      this.errors.splice(this.errors.find( error=> { return error.id === id }),1);
    },
    getPrefix() {
      var context = this;
      this.command("prefix").then(prefix => {
        context.prefix = prefix;
      }, ()=>{});
    },
    appUpdate(msg) {
      var context = this;
      this.command("appUpdate", msg).then(nAffected => {
        console.log(`${nAffected} users were affected`);
      },(response)=>{console.log(response)});
    },
    loadPipelines() {
      var context = this;
      this.command("getAll").then(pipelines => {
        context.pipelines = pipelines;
        console.log(pipelines);
      }, ()=>{});
    },
    createPipeline() {
    
    },
    guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    },
    popErrorMsg(msg) {
      console.error(msg);
      let cache = {msg: msg, id: this.guid()};
      this.errors.push(cache);
      setTimeout(()=> {
        this.errors.splice(this.errors.find( error=> { return error.id === cache.id }),1);
      }, 10000)
    }
  }
});

app.init();