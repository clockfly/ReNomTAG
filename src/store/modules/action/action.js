// import client from '../../../client'
import axios from 'axios'

let action = {
  load_file_list (context) {
    let fd = new FormData()
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
  }
}

export default action
