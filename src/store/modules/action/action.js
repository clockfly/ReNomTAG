import axios from 'axios'

let action = {
  load_filename_list (context) {
    let fd = new FormData()
    fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    return axios.post('/api/get_filename_list', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_filename_list', {
          filename_list: response.data.filename_list
        })
      }
    )
  },
  load_sidebar_thumbnail_and_filename_list (context, {current_page, page_step}) {
    let fd = new FormData()
    fd.append('filename_list', context.getters.get_filename_list)
    fd.append('current_page', current_page)
    fd.append('page_step', page_step)

    return axios.post('/api/get_sidebar_thumbnail_and_filename_list', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_sidebar_thumbnail_and_filename_list', {
          sidebar_thumbnail_list: response.data.sidebar_thumbnail_list,
          sidebar_filename_list: response.data.sidebar_filename_list,
          sidebar_filename_list_index: response.data.sidebar_filename_list_index,
          sidebar_current_page: current_page,
          sidebar_page_step: page_step
        })
      }
    )
  },

  load_raw_img (context, payload) {
    // Arguments : index

    let fd = new FormData()
    let current_file_index = payload.index
    // let filename_list = context.getters.get_filename_list
    let filename_list = payload.filename_list

    // Reset current_file_index to filename_list.length - 1
    if (current_file_index < 0) {
      current_file_index = filename_list.length - 1
      // Reset current_file_index to 0
    } else if (current_file_index > filename_list.length - 1) {
      current_file_index = 0
    }

    // Get file name from file_name list
    let current_file_path = filename_list[current_file_index]

    // fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    fd.append('filename', current_file_path)

    return axios.post('/api/get_raw_img', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_raw_img', {
          current_raw_img: response.data.raw_img,
          current_file_index: current_file_index,
          current_file_path: current_file_path
        })

        // check sidebar current page
        context.dispatch('check_sidebar_current_page')
      }
    )
  },

  load_raw_img_from_path (context, payload) {
    // Arguments : index

    let fd = new FormData()

    // fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    fd.append('filename', payload.file_path)


    return axios.post('/api/get_raw_img', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_raw_img_from_path', {
          current_raw_img: response.data.raw_img,
          current_file_path: payload.file_path
        })

        // check sidebar current page
        context.dispatch('check_sidebar_current_page')
      }
    )
  },

  set_current_img_width_and_height (context, payload) {
    context.commit('set_current_img_width_and_height', {
      img_width: payload.img_width,
      img_height: payload.img_height
    })
  },
  update_current_label_objects (context, payload) {
    context.commit('update_current_label_objects', {
      label_objects: payload.label_objects
    })
  },
  check_sidebar_current_page (context, payload) {
    // Change page nation if new page !== current page
    // index is start by 0, so +1(avoid 0 divide)
    let new_page = Math.ceil((context.getters.get_current_file_index + 1) / (context.getters.get_sidebar_page_step))
    if (new_page !== context.getters.get_sidebar_current_page) {
      context.commit('set_sidebar_current_page', {
        sidebar_current_page: new_page
      })
    }
  },
  load_recent_images (context, payload) {
    let fd = new FormData()
    let file_paths = payload.file_paths

    // let filename_list = context.getters.get_filename_list

    // let fetch_filename_list = []

    // for (let n of file_paths) {
    //   fetch_filename_list.push(filename_list[n])
    // }

    fd.append('filename_list', file_paths)

    return axios.post('/api/get_raw_images', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_recent_raw_images', {
          recent_raw_images: response.data.raw_images
        })
      }
    )
  },
  change_sidebar_page_step (context, payload) {
    context.commit('set_sidebar_page_step', {
      sidebar_page_step: payload.sidebar_page_step
    })
  },
  add_recent_labeled_file_path (context, payload) {
    let add_file_path = payload.add_file_path
    let index = context.getters.get_recent_labeled_file_paths.indexOf(payload.add_file_path)

    if (index >= 0) {
      context.state.recent_labeled_file_paths.splice(index, 1)
      context.state.recent_labeled_file_paths.unshift(add_file_path)
    } else {
      if (context.getters.get_recent_labeled_file_paths.length >= 10) {
        context.state.recent_labeled_file_paths.shift()
      }
      context.state.recent_labeled_file_paths.unshift(add_file_path)
    }
  },
  set_sidebar_selected_item_offset (context, payload) {
    context.commit('set_sidebar_selected_item_offset', {
      sidebar_selected_item_offset_top: payload.sidebar_selected_item_offset_top,
      sidebar_selected_item_offset_height: payload.sidebar_selected_item_offset_height
    })
  },
  set_sidebar_inner_file_list_offset (context, payload) {
    context.commit('set_sidebar_inner_file_list_offset', {
      sidebar_inner_file_list_offset_top: payload.sidebar_inner_file_list_offset_top,
      sidebar_inner_file_list_offset_height: payload.sidebar_inner_file_list_offset_height
    })
  },
  calc_and_set_sidebar_file_list_scroll_position (context, payload) {
    let sidebar_selected_item_offset_top = context.getters.get_sidebar_selected_item_offset_top
    let sidebar_selected_item_offset_height = context.getters.get_sidebar_selected_item_offset_height
    let inner_file_list_offset_top = context.getters.get_inner_file_list_offset_top
    let inner_file_list_offset_height = context.getters.get_inner_file_list_offset_height
    let sidebar_file_list_scroll_window_start_position = context.getters.get_sidebar_file_list_scroll_window_start_position
    let sidebar_file_list_scroll_window_end_position = context.getters.get_sidebar_file_list_scroll_window_end_position

    // scroll windowからのselected_itemの位置
    let real_sidebar_selected_item_offset_top = sidebar_selected_item_offset_top - inner_file_list_offset_top
    let real_sidebar_selected_item_offset_bottom = real_sidebar_selected_item_offset_top + sidebar_selected_item_offset_height

    let scroll_position = context.getters.get_sidebar_file_list_scroll_position
    // 上にはみ出る時
    if (real_sidebar_selected_item_offset_top < sidebar_file_list_scroll_window_start_position) {
      scroll_position = real_sidebar_selected_item_offset_top - 1

      let scroll_window_start_position = real_sidebar_selected_item_offset_top
      let scroll_window_end_position = real_sidebar_selected_item_offset_top + inner_file_list_offset_height

      context.commit('set_sidebar_file_list_scroll_window_position', {
        start_position: scroll_window_start_position,
        end_position: scroll_window_end_position
      })
      // 下にはみ出る時
    } else if (sidebar_selected_item_offset_top > sidebar_file_list_scroll_window_end_position) {
      scroll_position = real_sidebar_selected_item_offset_bottom - inner_file_list_offset_height + 1

      let scroll_window_start_position = real_sidebar_selected_item_offset_bottom - inner_file_list_offset_height
      let scroll_window_end_position = sidebar_selected_item_offset_top

      context.commit('set_sidebar_file_list_scroll_window_position', {
        start_position: scroll_window_start_position,
        end_position: scroll_window_end_position
      })
    }

    context.commit('set_sidebar_file_list_scroll_position', {
      sidebar_file_list_scroll_position: scroll_position
    })
  },
  set_sidebar_file_list_scroll_position_flag (context, payload) {
    context.commit('set_sidebar_file_list_scroll_position_flag', {
      flag: payload.flag
    })
  },
  set_sidebar_file_list_scroll_window_position (context, payload) {
    context.commit('set_sidebar_file_list_scroll_window_position', {
      start_position: payload.start_position,
      end_position: payload.end_position
    })
  },
  set_current_label_dict (context, payload) {
    context.commit('set_current_label_dict', {
      file_path: payload.file_path,
      size_height: payload.size_height,
      size_width: payload.size_width
    })
  },
  save_xml_from_label_dict (context, payload) {
    let fd = new FormData()

    fd.append('save_xml_file_name', payload.save_xml_file_name)
    fd.append('save_xml_dir', payload.save_xml_dir)

    // convert dict to json
    fd.append('label_dict', JSON.stringify(payload.label_dict))

    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
    axios.defaults.headers.post['Content-Type'] = 'application/json'

    return axios.post('/api/save_xml_from_label_dict', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('Error is occured.')
          return
        }
        // context.commit('set_json_data', {
        //   xml_data: response.data.xml_data
        // })
      }
    )
  },
  load_dict_from_xml (context, payload) {
    let fd = new FormData()
    fd.append('file_name', payload.file_name)
    return axios.post('/api/load_dict_from_xml', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('Error is occured')
          return
        }
        context.commit('set_current_json', {
          json_data: response.data.json_data
        })
      }
    )
  },
  set_selected_box_id (context, payload) {
    context.commit('set_selected_box_id', {
      selected_box_id: payload.selected_box_id
    })
  },
  save_label_candidates_dict (context, payload) {
    let fd = new FormData()
    fd.append('save_json_file_path', payload.save_json_file_path)
    // convert dict to json
    fd.append('json_data', JSON.stringify(payload.label_candidates_dict))

    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
    axios.defaults.headers.post['Content-Type'] = 'application/json'

    return axios.post('/api/save_label_candidates_dict', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('Error is occured.')
          return
        }
        // context.commit('set_json_data', {
        //   xml_data: response.data.xml_data
        // })
      }
    )
  },
  load_label_candidates_dict (context, payload) {
    let fd = new FormData()
    fd.append('load_json_file_path', payload.load_json_file_path)
    return axios.post('/api/load_label_candidates_dict', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('Error is occured')
          return
        }
        context.commit('set_label_candidates_dict', {
          label_candidates_dict: response.data.json_data
        })
      }
    )
  },
  update_label_candidates_dict_shortcut (context, payload) {
    context.commit('update_label_candidates_dict_shortcut', {
      old_shortcut: payload.old_shortcut,
      new_shortcut: payload.new_shortcut,
    })
  },
  update_label_candidates_dict_label (context, payload) {
    context.commit('update_label_candidates_dict_label', {
      shortcut: payload.shortcut,
      new_label: payload.new_label
    })
  },
  toggle_update_bbox_flag (context, payload) {
    context.commit('toggle_update_bbox_flag')
  },
  set_bbox_labeled_flag (context, payload) {
    context.commit('set_bbox_labeled_flag', {
      flag: payload.flag
    })
  }
}
export default action
