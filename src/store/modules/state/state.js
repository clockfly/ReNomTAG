let state = {
  // Error status
  error_status: 0,

  // Global
  filename_list: [],
  current_raw_img: '',
  current_img_width: 0,
  current_img_height: 0,
  current_file_index: 0,
  current_file_path: '',
  current_file_name: '',

  current_json: '',
  current_dict: {},
  working_dict: {},

  // Left_side_bar
  sidebar_filename_list: [],

  sidebar_current_page: 1,
  sidebar_page_step: 100,
  sidebar_selected_item_offset_top: 0,
  sidebar_selected_item_offset_height: 0,
  sidebar_inner_file_list_offset_top: 0,
  sidebar_inner_file_list_offset_height: 0,
  sidebar_file_list_scroll_position: 0,
  sidebar_file_list_scroll_window_start_position: 0,
  sidebar_file_list_scroll_window_end_position: 0,
  sidebar_file_list_scroll_position_flag: false,

  selected_box_id: null,

  // Recent images
  recent_raw_images: [],
  recent_labeled_file_paths: [],
  recent_label_list: [],

  isMenuShown: false,
  shortcut_label_dict: {}, // Key: shortcut key, Value: {'label': label, 'id': id}
  label_id_dict_list: [], // Key: label, Value: id

  label_candidates_dict: {},

  current_label_dict: {
    'annotation': {
      path: '',
      source: {
        database: 'Unknown'
      },
      size: {
        width: 0,
        height: 0,
        depth: 3
      },
      segments: 0,
      objects: [
        {
          object: {}
        }
      ]
    }
  },
  bbox_labeled_flag: true
}

export default state
