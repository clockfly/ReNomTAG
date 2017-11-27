import axios from 'axios'

let action = {
  load_thumbnail_img_and_filename_list (context) {
    let fd = new FormData()
    fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    return axios.post('/api/get_thumbnail_img_and_filename_list', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_thumbnail_img_and_filename_list', {
          thumbnail_image_list: response.data.thumbnail_image_list,
          filename_list: response.data.filename_list
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
          filename: filename_list[index],
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
  // Menu Actions
  toggle_menu_action (context) {
    context.commit('toggle_menu')
  },
  close_menu_action (context) {
    context.commit('close_menu')
  },
  open_menu_action (context) {
    context.commit('open_menu')
  },

}
export default action
