import App from "./app/main.js"

var app = new Vue({
  render: h => h(App)
});

app.$mount('#app');