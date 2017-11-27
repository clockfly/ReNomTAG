let mutation = {
  set_thumbnail_img_and_filename_list (state, payload) {
    state.filename_list = payload.filename_list
    state.thumbnail_image_list = payload.thumbnail_image_list
  },
  set_next_raw_img (state, payload) {
    if (state.raw_img_list.length > 0)
      state.raw_img_list.shift()
    state.raw_img_list.push({
      "img":payload.raw_img,
      "filename":payload.filename
    })
    state.filename_list_index ++
  },
  set_prior_raw_img (state, payload) {
    if (state.raw_img_list.length > 0)
      state.raw_img_list.pop()
    state.raw_img_list.unshift({
      "img":payload.raw_img,
      "filename":payload.filename
    })
    state.filename_list_index --
  },
  set_raw_image_list_index (state, payload) {
    state.raw_image_list_index = payload.raw_image_list_index
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
