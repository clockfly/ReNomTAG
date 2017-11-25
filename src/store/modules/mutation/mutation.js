let mutation = {
  reset_all (state) {
    state.file_list = []
  },
  set_file_list (state, payload) {
    state.file_list = payload.file_list
  }
}

export default mutation
