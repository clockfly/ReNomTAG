<template>
  <div id='labeling-for-object-detection-page'>
    <div id='row1'>
      <file-list class='row1'></file-list>
      <image-display class='row1'></image-display>
      <tag-list class='row1'></tag-list>
    </div>
    <div id='row2'>
      <recent-image-list class='row2'></recent-image-list>
      <div id='shortcut-description' class='row2'></div>
    </div>
  </div>
</template>

<script>
  import FileList from './file_list.vue'
  import ImageDisplay from './image_display.vue'
  import RecentImageList from './recent_image_list.vue'
  import TagList from './tag_list.vue'

  export default {
    name: 'LabelObjectDetectionPage',
    components: {
      'file-list': FileList,
      'image-display': ImageDisplay,
      'recent-image-list': RecentImageList,
      'tag-list': TagList
    },
    data: function () {
      return {
        selected: null
      }
    },
  }
</script>

<style lang='scss'>
  #labeling-for-object-detection-page {
    height: calc(100% - 35px);
    #row1 {
      display: flex;
      height: calc(100% - 200px);
      padding-left: 5px;
      .row1 {
        height: calc(100% - 10px);
        display: inline-block;
        padding-right: 5px;
        padding-top: 5px;
        padding-bottom: 5px;
      }
    }
    #row2 {
      display: flex;
      height: 200px;
      padding-left: 5px;
      .row2 {
        padding-right: 5px;
        height: calc(100% - 5px);
        display: inline-block;
        padding-bottom: 5px;
      }
    }
  }

  #shortcut-description {
    width: 200px;
  }
</style>
