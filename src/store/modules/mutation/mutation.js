let mutation = {
  set_thumbnail_img_and_filename_list (state, payload) {
    state.filename_list = payload.filename_list
    state.thumbnail_image_list = payload.thumbnail_image_list
  },
  set_next_raw_img (state, payload) {
    if (state.raw_img_list.length > 2)
      state.raw_img_list.shift()
    state.raw_img_list.push(payload.raw_img)
    state.raw_image_index += payload.shift_index
  },
  set_prior_raw_img (state, payload) {
    if (state.raw_img_list.length > 2)
      state.raw_img_list.pop()
    state.raw_img_list.unshift(payload.raw_img)
    state.raw_image_index += payload.shift_index
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
