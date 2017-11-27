let getters = {
  get_thumbnail_img_list (state) {
    return state.thumbnail_image_list
  },
  get_filename_list (state) {
    return state.filename_list
  },
  get_raw_img (state) {
    return state.raw_img
  },
  get_is_menu_show (state) {
    return state.isMenuShow
  }
}

export default getters
