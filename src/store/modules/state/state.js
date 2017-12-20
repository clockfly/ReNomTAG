let state = {
  // Global
  filename_list: [],
  current_raw_img: '',
  current_img_width: 0,
  current_img_height: 0,
  current_file_index: 0,
  current_file_name: '',
  current_json: '',
  current_dict: {},
  working_dict: {},

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
  sidebar_file_list_scroll_window_start_position: 0,
  sidebar_file_list_scroll_window_end_position: 0,
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
  recent_labeled_images_id_arr: [],

  current_tag_dict_data: {
    'anotation': {
      path: 'sample.png',
      source: {
        database: 'Unknown'
      },
      size: {
        width: 200,
        height: 300,
        depth: 3
      },
      segments: 0,
      objects: [
        {
          object: {
            name: 'dog',
            pose: 'Unspecified',
            truncated: 0,
            difficult: 0,
            bndbox: {
              xmin: 3,
              ymin: 20,
              xmax: 200,
              ymax: 40
            }
          }
        },
        {
          object: {
            name: 'cat',
            pose: 'Unspecified',
            truncated: 0,
            difficult: 0,
            bndbox: {
              xmin: 3,
              ymin: 20,
              xmax: 200,
              ymax: 40
            }
          }
        },
        {
          object: {
            name: 'bird',
            pose: 'Unspecified',
            truncated: 0,
            difficult: 0,
            bndbox: {
              xmin: 3,
              ymin: 20,
              xmax: 200,
              ymax: 40
            }
          }
        },

      ]
    }
  }
}

export default state
