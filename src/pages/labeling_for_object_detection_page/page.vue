<template>
  <div id='labeling-for-object-detection-page'> 
    <div style='display:flex;'>
      <file-list></file-list>
      <image-display></image-display>
      <tag-list></tag-list>
    </div>
      <recent-image-list></recent-image-list>
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
  }
}
</script>

<style lang='scss'>
</style>
