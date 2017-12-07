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
    let fd = new FormData()
    let current_file_index = payload.index
    let filename_list = context.getters.get_filename_list

    if (current_file_index < 0) {
      current_file_index = filename_list.length - 1
    } else if (current_file_index > filename_list.length - 1) {
      current_file_index = 0
    }

    let current_file_name = filename_list[current_file_index]

    // fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    fd.append('filename', current_file_name)

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
          current_file_name: current_file_name
        })
        // Change page nation if new page !== current page
        // index is start by 0, so +1(avoid 0 divide)
        let new_page = Math.ceil((context.getters.get_current_file_index + 1) / (context.getters.get_sidebar_page_step))
        if (new_page !== context.getters.get_sidebar_current_page) {
          context.commit('set_sidebar_current_page', {
            sidebar_current_page: new_page
          })
        }
      }
    )
  },
  load_recent_images (context, payload) {
    let fd = new FormData()
    let file_indices = payload.file_indices
    let filename_list = context.getters.get_filename_list

    let fetch_filename_list = []

    for (let n of file_indices) {
      fetch_filename_list.push(filename_list[n])
    }
    fd.append('filename_list', fetch_filename_list)

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
  add_recent_labeled_images_id_arr (context, payload) {
    let index = context.getters.get_recent_labeled_images_id_arr.indexOf(payload.add_file_index)
    if (index >= 0) {
      context.state.recent_labeled_images_id_arr.splice(index, 1)
      context.state.recent_labeled_images_id_arr.push(payload.add_file_index)
    } else {
      if (context.getters.get_recent_labeled_images_id_arr.length >= 10) {
        context.state.recent_labeled_images_id_arr.shift()
      }
      context.state.recent_labeled_images_id_arr.push(payload.add_file_index)
    }
  },
}
export default action
