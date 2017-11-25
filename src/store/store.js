import Vue from 'vue'
import Vuex from 'vuex'
import module from './modules/module.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    detector: module
  }
})

export default store
