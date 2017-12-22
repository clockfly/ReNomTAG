import axios from 'axios'

let mutation = {
  set_filename_list (state, payload) {
    state.filename_list = payload.filename_list
  },
  set_sidebar_thumbnail_and_filename_list (state, payload) {
    state.sidebar_thumbnail_list = payload.sidebar_thumbnail_list
    state.sidebar_filename_list = payload.sidebar_filename_list
    state.sidebar_filename_list_index = payload.sidebar_filename_list_index
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
    state.current_file_name = payload.current_file_name
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
  add_tag (state, payload) {
    let parent_node = payload.parent_node
    let shortcut = payload.shortcut
    let label = payload.label
    let payload_id = payload.id

    state.shortcut_label_dict[shortcut] = {'label': label, 'id': payload_id}

    function recursive_search (node) {
      for (let n of node) {
        let lb = n['label']

        if (parent_node === lb) {
          n['nodes'].unshift({
            label: label,
            id: payload_id,
            shortcut: shortcut,
            nodes: []
          })
        }
        recursive_search(n['nodes'])
      }
    }
    recursive_search(state.tag_candidates_dict)
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
  set_current_dict (state, payload) {
    state.current_dict = payload.dict_data
  },
  set_working_dict (state, payload) {
    state.working_dict = payload.dict_data
  },
  set_tag_dict (state, payload) {
    state.current_tag_dict_data['anotation']['path'] = payload.file_path
    state.current_tag_dict_data['anotation']['name'] = payload.file_path
    state.current_tag_dict_data['anotation']['size']['width'] = payload.size_width
    state.current_tag_dict_data['anotation']['size']['height'] = payload.size_height
  },
  update_current_tag_objects (state, payload) {
    state.current_tag_dict_data['anotation']['objects'] = payload.tag_objects
  },
  set_selected_box_id (state, payload) {
    state.selected_box_id = payload.selected_box_id
  },
  set_tag_candidates_dict (state, payload) {
    state.tag_candidates_dict = payload.tag_candidates_dict
  }
}

export default mutation
