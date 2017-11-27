let mutation = {
  set_thumbnail_img_and_filename_list (state, payload) {
    state.filename_list = payload.filename_list
    state.thumbnail_image_list = payload.thumbnail_image_list
  },
  set_raw_img (state, payload) {
    state.raw_img = payload.raw_img
  },
  // Menu Mutations
  close_menu (state) {
    state.isMenuShow = false
  },
  open_menu (state) {
    state.isMenuShow = true
  },
  toggle_menu (state) {
    state.isMenuShow = !state.isMenuShow
  }
}

export default mutation
