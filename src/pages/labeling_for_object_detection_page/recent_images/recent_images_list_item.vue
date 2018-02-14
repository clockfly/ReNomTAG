<template>
  <li class="recent-images-list-item" @click="click_action">

    <img :src="'data:image/png;base64,' + this.img_src" alt="" class="recent-images-list-item-img">

    <recent-images-bbox
      v-for="(bbox, index) in bbox_list"
      :bbox="bbox.object"
      :rawImageSize="rawImageSize"
      :key="index">
    </recent-images-bbox>
  </li>
</template>

<script>
  import axios from 'axios'
  import RecentImagesBbox from './recent_images_bbox.vue'

  export default {
    name: 'RecentImagesListItem',
    props: ['img_src', 'file_path', 'parent_height', 'index', 'annotation'],
    components: {
      'recent-images-bbox': RecentImagesBbox
    },
    data: function () {
      return {
        imgWidth: 0,
        imgHeight: 0,
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        file_name_data: ''
      }
    },
    methods: {
      click_action () {
        let self = this
        self.$store.dispatch('load_raw_img_from_path', {
          file_path: self.file_path,
        })
      }
    },
    computed: {
      bbox_list (){
        if(!this.annotation){
          return []
        }
        return this.annotation.objects
      },
      rawImageSize () {
        let img_size = this.annotation['size']
        this.imgWidth = img_size.width
        this.imgHeight = img_size.height
        return [this.imgWidth, this.imgHeight]
      },
      xml_file_path () {
        let file_path_split = this.file_path.split('/')
        let file_name = file_path_split[file_path_split.length - 1].split('.')[0]
        return file_name + '.xml'
      },
      current_file_path () {
        return this.$store.getters.get_current_file_path
      },
      current_file_name () {
        return this.$store.getters.get_current_file_name
      },
      recent_labeled_file_paths: function () {
        return this.$store.getters.get_recent_labeled_file_paths
      },
      recent_label_list: function () {
        return this.$store.getters.get_recent_label_list
      },
    },
    created: function () {
      this.file_name_data = this.file_name
      let self = this
      let img = new Image()
      img.src = 'data:image/png;base64,' + this.img_src
    },
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
    // flex: 0 0 auto;

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
