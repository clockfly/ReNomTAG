import error_msg from './error'

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
  get_current_file_path (state) {
    return state.current_file_path
  },
  get_current_file_name (state) {
    let split_file_path = state.current_file_path.split('/')
    return split_file_path[split_file_path.length - 1]
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
  get_label_candidates_dict (state) {
    return state.label_candidates_dict
  },
  get_shortcut_label_dict (state) {
    return state.shortcut_label_dict
  },
  get_label_id_dict_list (state) {
    return state.label_id_dict_list
  },
  get_recent_labeled_file_paths (state) {
    return state.recent_labeled_file_paths
  },
  get_sidebar_selected_item_offset_top (state) {
    return state.sidebar_selected_item_offset_top
  },
  get_sidebar_selected_item_offset_height (state) {
    return state.sidebar_selected_item_offset_height
  },
  get_inner_file_list_offset_top (state) {
    return state.sidebar_inner_file_list_offset_top
  },
  get_inner_file_list_offset_height (state) {
    return state.sidebar_inner_file_list_offset_height
  },
  get_sidebar_file_list_scroll_position (state) {
    return state.sidebar_file_list_scroll_position
  },
  get_sidebar_file_list_scroll_window_start_position (state) {
    return state.sidebar_file_list_scroll_window_start_position
  },
  get_sidebar_file_list_scroll_window_end_position (state) {
    return state.sidebar_file_list_scroll_window_end_position
  },
  get_sidebar_file_list_scroll_position_flag (state) {
    return state.sidebar_file_list_scroll_position_flag
  },
  get_current_label_dict (state) {
    return state.current_label_dict
  },
  get_current_img_width (state) {
    return state.current_img_width
  },
  get_current_img_height (state) {
    return state.current_img_height
  },
  get_selected_box_id (state) {
    return state.selected_box_id
  },
  get_update_bbox_flag (state) {
    return state.update_bbox_flag
  },
  get_bbox_labeled_flag (state) {
    return state.bbox_labeled_flag
  },
  get_error_message(state){
    return error_msg[state.error_status]
  }
}

export default getters
