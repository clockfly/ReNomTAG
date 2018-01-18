<template>
  <li class="recent-images-list-item" @click="click_action">

    <img :src="'data:image/png;base64,' + this.img_src" alt="" class="recent-images-list-item-img">

    <recent-images-bbox
      v-for="(bbox, index) in bbox_list"
      :bbox="bbox"
      :aspectRatio="aspectRatio"
      :key="index">
    </recent-images-bbox>
  </li>
</template>

<script>
  import axios from 'axios'
  import RecentImagesBbox from './recent_images_bbox.vue'

  export default {
    name: 'RecentImagesListItem',
    props: ['img_src', 'file_path', 'parent_height', 'index'],
    components: {
      'recent-images-bbox': RecentImagesBbox
    },
    data: function () {
      return {
        imgWidth: 0,
        imgHeight: 0,
        bbox_list: [],
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        file_name_data: ''
      }
    },
    methods: {
      setImgSrc: function (img) {
        this.imgWidth = img.width
        this.imgHeight = img.height
      },
      update_bbox () {
        let self = this
        let fd = new FormData()
        if (this.xml_file_path !== '') {
          fd.append('xml_file_path', this.xml_file_path)
          return axios.post('/api/get_bbox_list', fd).then(
            function (response) {
              if (response.data.json_data === '') {
                self.bbox_list = []
              } else {
                self.bbox_list = JSON.parse(response.data.json_data)['anotation']['object']
              }
            }
          )
        }
      },
      click_action () {
        let self = this
        self.$store.dispatch('load_raw_img_from_path', {
          file_path: self.file_path,
        })
      }
    },
    computed: {
      aspectRatio () {
        return this.parent_height / this.imgHeight
      },
      xml_file_path () {
        let file_path_split = this.file_path.split('/')
        let file_name = file_path_split[file_path_split.length - 1].split('.')[0]
        return 'xml/' + file_name + '.xml'
      },
      current_file_path () {
        return this.$store.getters.get_current_file_path
      },
      current_file_name () {
        return this.$store.getters.get_current_file_name
      },
      update_bbox_flag () {
        return this.$store.getters.get_update_bbox_flag
      }
    },
    mounted: function () {
      this.file_name_data = this.file_name
      let self = this
      let img = new Image()
      img.onload = function () {
        self.setImgSrc(img)
      }

      img.src = 'data:image/png;base64,' + this.img_src

      this.update_bbox()
    },
    watch: {
      // この関数は sidebar_current_file_index が変わるごとに実行されます。
      update_bbox_flag: function () {
        let split_file_path = this.file_path.split('/')
        let split_file_name = split_file_path[split_file_path.length - 1].split('.')[0]

        let split_current_file_name = this.current_file_name.split('.')[0]

//        let current_file_name = current_file_name_split[temp_current_file_name_split.length - 1].split('.')[0]

        if (split_current_file_name === split_file_name) {
          this.update_bbox()
//          this.$store.commit('toggle_update_bbox_flag')
        }
      }
    }
  }
</script>

<style lang='scss'>

  .recent-images-list-item {
    position: relative;
    list-style: none;
    width: auto;
    height: 100%;

    display: inline-block;
    white-space: normal;

    &:hover {
      cursor: pointer;
    }

    .recent-images-list-item-img {
      width: auto;
      height: 100%;
      cursor: pointer;
      display: block;
    }
  }

</style>
