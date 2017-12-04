let getters = {
  get_sidebar_thumbnail_list (state) {
    return state.sidebar_thumbnail_list
  },
  get_sidebar_filename_list (state) {
    return state.sidebar_filename_list
  },
  get_filename_list (state) {
    return state.filename_list
  },
  get_raw_img (state) {
    return state.raw_img
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
  get_shortcut_label_dict_list (state) {
    return state.shortcut_label_dict_list
  },
  get_label_id_dict_list (state) {
    return state.label_id_dict_list
  }
}

export default getters
