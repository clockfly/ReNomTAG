// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

require("@/css/reset.css");
require("mini.css/dist/mini-default.min.css");
require("font-awesome/css/font-awesome.css");
require("@/css/common.css");

import Vue from "vue";
import App from "@/App";
import router from "@/router";
import { store } from "@/store/store.js";

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  store,
  router,
  components: { App },
  template: "<App/>"
});
