<template>
  <div id='labeling-for-object-detection-page'> 
    <file-list></file-list>
    <image-display></image-display>
  </div>
</template>

<script>
import FileList from './file_list.vue'
import ImageDisplay from './image_display.vue'

export default {
  name: 'LabelObjectDetectionPage',
  components: {
    'file-list': FileList,
    'image-display': ImageDisplay
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
