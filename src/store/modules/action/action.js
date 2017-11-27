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
    fd.append('root_dir', '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/')
    fd.append('filename', '2012_001839.jpg')
    return axios.post('/api/get_raw_img', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          return
        }
        context.commit('set_raw_img', {
          raw_img: response.data.raw_img,
        })
      }
    )
  }
}
export default action
