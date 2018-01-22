<template>
  <div id='labeling-for-object-detection-page'>
    <div id='row1'>
      <file-list class='row1'></file-list>
      <image-display class='row1'></image-display>
      <label-list class='row1'></label-list>
    </div>
    <div id='row2'>
      <recent-images-list class='row2'></recent-images-list>
    </div>
  </div>
</template>

<script>
  import FileList from './file_list.vue'
  import ImageDisplay from './image_display.vue'
  import RecentImagesList from './recent_images/recent_images_list.vue'
  import LabelList from './label_list.vue'

  export default {
    name: 'LabelObjectDetectionPage',
    components: {
      'file-list': FileList,
      'image-display': ImageDisplay,
      'recent-images-list': RecentImagesList,
      'label-list': LabelList
    },
    created(){
      const self = this
      let ret = this.$store.dispatch('load_sidebar_thumbnail_and_filename_list', {
        'current_page': 1,
        'page_step': 100
      })
      let filename_list = this.$store.getters.get_filename_list
      ret.then(function () {
        self.load_raw_img(0, filename_list)
      })
    },
    methods: {
      load_raw_img: function (index, filename_list) {
        this.$store.dispatch('load_raw_img', {
          filename_list: filename_list,
          index: index
        })
      },
    }
  }
</script>

<style lang='scss'>
  #labeling-for-object-detection-page {
    height: calc(100% - 35px);
    #row1 {
      display: flex;
      height: calc(100% - 215px);
      /*padding-left: 5px;*/
      .row1 {
        /*height: calc(100% - 10px);*/
        display: inline-block;
        /*padding-right: 5px;*/
        /*padding-top: 5px;*/
        /*padding-bottom: 5px;*/
      }
    }
    #row2 {
      display: flex;
      height: 200px;
      /*padding-left: 5px;*/
      .row2 {
        /*padding-right: 5px;*/
        height: calc(100%);
        display: inline-block;
        /*padding-bottom: 5px;*/
      }
    }
  }
</style>
