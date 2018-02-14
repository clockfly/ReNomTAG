import axios from 'axios'

let mutation = {
  set_filename_list (state, payload) {
    state.filename_list = payload.filename_list
    state.filename_max_display = 100;

    if (state.filename_list.length < state.filename_max_display) {
      state.filename_max_display = state.filename_list.length;
    }
  },

  set_filename_max_display(state, payload) {
    state.filename_max_display = payload.filename_max_display;
    if (state.filename_list.length < state.filename_max_display) {
      state.filename_max_display = state.filename_list.length;
    }
  },

  set_sidebar_thumbnail_and_filename_list (state, payload) {
    state.sidebar_filename_list = payload.sidebar_filename_list
    state.sidebar_page_step = payload.sidebar_page_step
    state.sidebar_current_page = payload.sidebar_current_page
  },
  set_current_file_index (state, payload) {
    state.current_file_index = payload.current_file_index
  },
  set_sidebar_current_page (state, payload) {
    state.sidebar_current_page = payload.sidebar_current_page
  },
  set_sidebar_page_step (state, payload) {
    state.sidebar_page_step = payload.sidebar_page_step
  },
  set_raw_img (state, payload) {
    state.current_raw_img = payload.current_raw_img
    state.current_file_index = payload.current_file_index
    state.current_file_path = payload.current_file_path
  },
  set_raw_img_from_path (state, payload) {
    state.current_raw_img = payload.current_raw_img
    state.current_file_path = payload.current_file_path
  },
  set_current_img_width_and_height (state, payload) {
    state.current_img_width = payload.img_width
    state.current_img_height = payload.img_height
  },
  set_recent_raw_images (state, payload) {
    state.recent_raw_images = payload.recent_raw_images
  },
  // Menu Mutations
  close_menu (state) {
    state.isMenuShown = false
  },
  open_menu (state) {
    state.isMenuShown = true
  },
  toggle_menu (state) {
    state.isMenuShown = !state.isMenuShown
  },
  add_new_label (state, payload) {
    // let parent_node = payload.parent_node

    let shortcut = payload.shortcut
    let label_text = payload.label_text
    let id = payload.id

    state.label_candidates_dict[shortcut] = {'label': label_text, 'id': id}
  },
  set_sidebar_selected_item_offset (state, payload) {
    state.sidebar_selected_item_offset_top = payload.sidebar_selected_item_offset_top
    state.sidebar_selected_item_offset_height = payload.sidebar_selected_item_offset_height
  },
  set_sidebar_inner_file_list_offset (state, payload) {
    state.sidebar_inner_file_list_offset_top = payload.sidebar_inner_file_list_offset_top
    state.sidebar_inner_file_list_offset_height = payload.sidebar_inner_file_list_offset_height
  },
  set_sidebar_file_list_scroll_position (state, payload) {
    state.sidebar_file_list_scroll_position = payload.sidebar_file_list_scroll_position
  },
  set_sidebar_file_list_scroll_position_flag (state, payload) {
    state.sidebar_file_list_scroll_position_flag = payload.flag
  },
  set_sidebar_file_list_scroll_window_position (state, payload) {
    state.sidebar_file_list_scroll_window_start_position = payload.start_position
    state.sidebar_file_list_scroll_window_end_position = payload.end_position
  },
  set_current_json (state, payload) {
    state.current_json = payload.json_data
  },
  update_current_label_objects (state, payload) {
    if (!state.current_label_dict.annotation)
      state.current_label_dict['annotation'] = {}
    state.current_label_dict['annotation']['objects'] = payload.label_objects
  },
  set_selected_box_id (state, payload) {
    state.selected_box_id = payload.selected_box_id
  },
  set_current_label_dict (state, payload) {
    if (!state.current_label_dict.annotation)
      state.current_label_dict['annotation'] = {}
    if (!state.current_label_dict.annotation.size)
      state.current_label_dict['annotation']['size'] = {}
    state.current_label_dict['annotation']['path'] = payload.file_path
    state.current_label_dict['annotation']['size']['height'] = payload.size_height
    state.current_label_dict['annotation']['size']['width'] = payload.size_width
  },
  flush_current_label_dict (state) {
    state.current_label_dict = {}
  },
  set_label_candidates_dict (state, payload) {
    state.label_candidates_dict = payload.label_candidates_dict
  },
  update_label_candidates_dict_shortcut (state, payload) {
    let temp_dict_data = state.label_candidates_dict[payload.old_shortcut]
    delete state.label_candidates_dict[payload.old_shortcut]
    state.label_candidates_dict[payload.new_shortcut] = temp_dict_data
  },
  update_label_candidates_dict_label (state, payload) {
    state.label_candidates_dict[payload.shortcut]['label'] = payload.new_label
  },
  set_bbox_labeled_flag (state, payload) {
    state.bbox_labeled_flag = payload.flag
  },
  set_error_status (state, payload) {
    state.error_status = payload.success
  },
  remove_thumbnail_img (state, payload) {
    let filename = payload.filename
    let index = state.sidebar_filename_list.indexOf(filename)
    let len = state.sidebar_filename_list.length - 1
    state.sidebar_filename_list.splice(index, 1)
  }
}

export default mutation
