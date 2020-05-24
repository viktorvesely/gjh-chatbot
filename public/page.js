new Vue({
  el: "#app",
  data: {
    correctInput: false,
    inputText: "",
    output: "",
  },
  methods: {
    checkInput() {
      if (this.inputText === "jurko hronec") {
        this.correctInput = true;
      } else {
        this.correctInput = false;
      }
    },
    login(e) {
      e.preventDefault();
      var context = this;
      $.ajax("/login", {
        contentType: "application/json",
        data: JSON.stringify({userId: this.inputText}),
        method: "POST",
        complete: (res) => {
          let response = res.responseJSON;
          if (response.success) {
            context.output = "";
            this.correctInput = true;
            setTimeout(()=> {
              window.location.href = "/shout";
            }, 1000);
          } else {
            context.output = response.msg;
          }
        }
      });
    }
  },
  computed: {
    animation() {
      if (this.correctInput) {
        return { animation: "spinner 0.9s linear 0s infinite normal none running, glitch 3s linear infinite normal none running" };
      } else {
        return { animation: "spinner 10s linear 0s infinite normal none running, glitch 3s linear infinite normal none running" };
      }
    }
  }
});