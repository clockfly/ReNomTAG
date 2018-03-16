import Vue from 'vue'
import Vuex from 'vuex'

import state from './state.js'
import mutation from './mutation.js'
import action from './action.js'
import getters from './getters.js'


Vue.use(Vuex)


const store = new Vuex.Store({
  state: state,
  actions: action,
  mutations: mutation,
  getters: getters
})

export default store
