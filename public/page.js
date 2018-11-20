new Vue({
  el: "#app",
  data: {
    correctInput: false,
    inputText: ""
  },
  methods: {
    checkInput() {
      if (this.inputText === "jurko hronec") {
        this.correctInput = true;
      } else {
        this.correctInput = false;
      }
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