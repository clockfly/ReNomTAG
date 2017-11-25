<template>
  <div id='labeling-for-object-detection-page'> 
    <file-list></file-list>
    <image-display></image-display>
    <recent-image-list></recent-image-list>
  </div>
</template>

<script>
import FileList from './file_list.vue'
import ImageDisplay from './image_display.vue'
import RecentImageList from './recent_image_list.vue'

export default {
  name: 'LabelObjectDetectionPage',
  components: {
    'file-list': FileList,
    'image-display': ImageDisplay,
    'recent-image-list': RecentImageList
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
