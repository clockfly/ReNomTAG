<template>
  <div id='labeling-for-object-detection-page'> 
    <div style='display: flex;'>
      <file-list class='row1'></file-list>
      <image-display class='row1'></image-display>
      <tag-list class='row1'></tag-list>
    </div>
    <div style='display:flex;'>
      <recent-image-list class='row2'></recent-image-list>
      <div id='shortcut-description'></div>
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
  created () {
    this.$store.dispatch('load_file_list')
  }
}
</script>

<style lang='scss'>
  #labeling-for-object-detection-page {
    .row1 {
      display: inline-block;
      padding: 5px;
    }
    .row2 {
      display: inline-block;
      padding: 5px;
    }
  }

  #shortcut-description {
    width: 200px;
  }
</style>
