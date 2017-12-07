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
        // let sc = n['shortcut']
        // let id = n['id']
        let lb = n['label']
        // if (sc) {
        //   state.shortcut_label_dict[sc] = {'label': lb, 'id': id}
        // }
        // state.label_id_dict_list.push({[lb]: id})

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

    recursive_search(state.tag_dict)
  },
}

export default mutation
