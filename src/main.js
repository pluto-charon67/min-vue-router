import Vue from "vue";
import App from "./App.vue";
import router from "./router/test.js";

Vue.config.productionTip = false;

new Vue({
  router,
  cpp: "pluto",
  render: (h) => h(App),
}).$mount("#app");
