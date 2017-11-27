let getters = {
  get_thumbnail_img_list (state) {
    return state.thumbnail_image_list
  },
  get_filename_list (state) {
    return state.filename_list
  },
  get_raw_img (state) {
    return state.raw_img
  }
}

export default getters
