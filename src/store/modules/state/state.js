let state = {
  // Global
  filename_list: [],
  current_raw_img: '',
  current_file_index: 0,
  current_file_name: '',

  // Left_side_bar
  sidebar_thumbnail_list: [],
  sidebar_filename_list: [],
  sidebar_filename_list_index: [],

  sidebar_current_page: 1,
  sidebar_page_step: 100,
  sidebar_selected_item_offset_top: 0,
  sidebar_selected_item_offset_height: 0,
  sidebar_inner_file_list_offset_top: 0,
  sidebar_inner_file_list_offset_height: 0,
  sidebar_file_list_scroll_position: 0,
  sidebar_file_list_scroll_position_flag: false,

  // Recent images
  recent_raw_images: [],

  isMenuShown: false,
  shortcut_label_dict: {}, // Key: shortcut key, Value: {'label': label, 'id': id}
  label_id_dict_list: [], // Key: label, Value: id
  tag_dict: [{
    label: 'Labels',
    id: -1,
    shortcut: '',
    nodes: []
  }],
  recent_labeled_images_id_arr: []
}

export default state
