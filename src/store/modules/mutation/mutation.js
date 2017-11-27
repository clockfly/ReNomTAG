let mutation = {
  set_thumbnail_img_and_filename_list (state, payload) {
    state.filename_list = payload.filename_list
    state.thumbnail_image_list = payload.thumbnail_image_list
  },
  set_raw_img (state, payload) {
    state.raw_img = payload.raw_img
  }
}

export default mutation
