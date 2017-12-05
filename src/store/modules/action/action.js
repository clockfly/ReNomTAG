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
          sidebar_filename_list_index: response.data.sidebar_filename_list_index
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
    } else if (current_file_index > filename_list.length) {
      current_file_index = 0
    }

    let current_file_name = filename_list[current_file_index]

    fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
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
      }
    )
  },
}
export default action
