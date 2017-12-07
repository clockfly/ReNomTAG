let getters = {
  get_sidebar_thumbnail_list (state) {
    return state.sidebar_thumbnail_list
  },
  get_sidebar_filename_list (state) {
    return state.sidebar_filename_list
  },
  get_sidebar_filename_list_index (state) {
    return state.sidebar_filename_list_index
  },
  get_sidebar_current_page (state) {
    return state.sidebar_current_page
  },
  get_sidebar_page_step (state) {
    return state.sidebar_page_step
  },
  get_filename_list (state) {
    return state.filename_list
  },
  get_filename_list_length (state) {
    return state.filename_list.length
  },
  get_current_raw_img (state) {
    return state.current_raw_img
  },
  get_current_file_name (state) {
    return state.current_file_name
  },
  get_current_file_index (state) {
    return state.current_file_index
  },
  get_recent_raw_images (state) {
    return state.recent_raw_images
  },
  get_is_menu_shown (state) {
    return state.isMenuShown
  },
  get_tag_list (state) {
    return state.tag_dict
  },
  get_shortcut_label_dict (state) {
    return state.shortcut_label_dict
  },
  get_label_id_dict_list (state) {
    return state.label_id_dict_list
  },
  get_recent_labeled_images_id_arr (state) {
    return state.recent_labeled_images_id_arr
  }
}

export default getters
