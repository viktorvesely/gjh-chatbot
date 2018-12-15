var app = new Vue({
  el: "#app",
  data: {
    pipelines: [],
    errorMsg: "",
    errorMsgVisible: false
  },
  methods: {
    init() {
      console.log("init");
      this.loadPipelines();
    },
    loadPipelines() {
      var context = this;
      return new Promise((resolve, reject) => {
        $.ajax("/allPipes", {
          contentType: "application/json",
          data: JSON.stringify({timestamp: Date.now()}),
          method: "POST",
          complete: (res) => {
            let response = res.responseJSON;
            if (response.success) {
              context.pipelines = response.pipelines;
              console.log(context.pipelines);
            } else {
              context.popErrorMsg(response.msg);
            }
          }
        });
        
      });
    },
    popErrorMsg(msg) {
      console.error(msg);
      this.errorMsg = msg;
      this.erroMsgVisible = true;
      setTimeout(()=> {
        this.errorMsg = "";
        this.erroMsgVisible = false;
      }, 4000)
    }
  }
});

app.init();