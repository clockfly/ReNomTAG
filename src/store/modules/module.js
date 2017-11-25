import state from './state/state.js'
import mutation from './mutation/mutation.js'
import action from './action/action.js'
import getters from './getters.js'

const module = {
  state: state,
  actions: action,
  mutations: mutation,
  getters: getters
}

export default module
