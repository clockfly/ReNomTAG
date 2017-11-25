// import client from '../../../client'
import axios from 'axios'

let action = {
  load_file_list (context) {
    let fd = new FormData()
    // fd.append('root_dir', '/home/suwa/Documents/local_repositories/ObjDetector/img')
    // fd.append('root_dir', '/Users/shotakikuchi/Screenshot')
    fd.append('root_dir', 'img')
    return axios.post('/api/get_file_list', fd).then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          context.commit('set_loading', {
            'loading': false
          })
          return
        }
        context.commit('set_file_list', {
          file_list: response.data.file_list
        })
      }
    )
  },
  load_server_file (context) {
    // let fd = new FormData()
    // fd.append('root_dir', '/Users/shotakikuchi/Screenshot')

    return axios.post('/api/get_img').then(
      function (response) {
        let error = response.data.error
        if (error) {
          alert('File not found. Please try again.')
          context.commit('set_loading', {
            'loading': false
          })
          return
        }
        context.commit('set_server_file', {
          images_list: response.data.images_list
        })
      }
    )
  },
  plus_images_count (context) {
    context.commit('plus_images_count')
  },
  minus_images_count (context) {
    context.commit('minus_images_count')
  },
  reset_images_count (context) {
    context.commit('reset_images_count')
  },
  maximize_images_count (context) {
    context.commit('maximize_images_count')
  }
}

export default action
