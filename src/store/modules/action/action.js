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
  load_sidebar_thumbnail_and_filename_list (context, {filename_list, current_page, page_step}) {
    let fd = new FormData()
    fd.append('filename_list', filename_list)
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
          sidebar_filename_list: response.data.sidebar_filename_list
        })
      }
    )
  },

  load_next_raw_img (context) {
    let fd = new FormData()
    let index = context.getters.get_filename_list_index
    let filename_list = context.getters.get_filename_list

    if (filename_list.length <= index+1) {
      alert("List out of bounds.")
      return
    }
    fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    fd.append('filename', filename_list[index])
    return axios.post('/api/get_raw_img', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_next_raw_img', {
          raw_img: response.data.raw_img,
          filename: filename_list[index]
        })
      }
    )
  },
  load_prior_raw_img (context) {
    let fd = new FormData()
    let index = context.getters.get_filename_list_index - 1
    let filename_list = context.getters.get_filename_list
    if (0 > index) {
      alert("List out of bounds.")
      return
    }
    fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    fd.append('filename', filename_list[index])

    return axios.post('/api/get_raw_img', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_prior_raw_img', {
          raw_img: response.data.raw_img,
          filename: filename_list[index],
        })
      }
    )
  },
}
export default action
