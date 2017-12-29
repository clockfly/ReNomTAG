<template>
  <li class="recent-images-list-item">
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
    props: ['img_src', 'file_name', 'parent_height'],

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
        fd.append('xml_file_path', this.xml_file_path)
        return axios.post('/api/get_bbox_list', fd).then(
          function (response) {
            self.bbox_list = JSON.parse(response.data.json_data)['anotation']['object']
          }
        )
      }
    },
    computed: {
      aspectRatio () {
        return this.parent_height / this.imgHeight
      },
      xml_file_path () {
        return 'xml/' + this.file_name + '.xml'
      },
    },
    mounted: function () {
      this.file_name_data = this.file_name
      console.log(this.file_name_data)
      let self = this
      let img = new Image()
      img.onload = function () {
        self.setImgSrc(img)
      }

      img.src = 'data:image/png;base64,' + this.img_src

      this.update_bbox()
    }
  }
</script>

<style lang='scss'>

  .recent-images-list-item {
    position: relative;
    list-style: none;
    width: auto;
    height: 100%;

    .recent-images-list-item-img {
      width: auto;
      height: 100%;
      cursor: pointer;
      display: block;
    }

  }


</style>
