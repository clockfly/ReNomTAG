let mutation = {
  reset_all_server_file (state) {
    state.images_list = []
  },
  set_server_file (state, payload) {
    state.images_list = payload.images_list
  },
  plus_images_count (state) {
    state.images_count += 1
    console.log(state.images_count)
  },
  minus_images_count (state) {
    state.images_count -= 1
  },
  reset_images_count (state) {
    state.images_count = 0
  },
  maximize_images_count (state) {
    state.images_count = state.images_list.length - 1
  }
}

export default mutation
