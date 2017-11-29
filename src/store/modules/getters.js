let getters = {
  get_thumbnail_img_list (state) {
    return state.thumbnail_image_list
  },
  get_filename_list (state) {
    return state.filename_list
  },
  get_raw_img (state) {
    return state.raw_img_list[0]
  },
  get_filename_list_index (state) {
    return state.filename_list_index
  },
  get_is_menu_shown (state) {
    return state.isMenuShown
  },
  get_tag_list (state) {
    return state.tag_dict
  },
  get_shortcut_label_dict_list () {
    return state.shortcut_label_dict_list
  },
  get_label_id_dict_list () {
    return state.label_id_dict_list
  }
}

export default getters
