<template>
  <div id='main'>
    <header-bar></header-bar>
    <div class='container main-container'>
      <div class='row'>
        <div class='col-sm-10'>
          <image-display class='upper-window'></image-display>
        </div>
        <side-bar class='col-sm-2'></side-bar>
      </div>
    </div>
  </div>
</template>

<script>
  import SideBar from '../components/sidebar.vue'
  import HeaderBar from '../components/header_bar.vue'
  import MainCategoryBlock from '../components/main_category_block.vue'
  import ImageDisplay from '../components/image_display.vue'

  export default {
    name: 'app',
    components: {
      'main-category-block': MainCategoryBlock,
      'side-bar': SideBar,
      'header-bar': HeaderBar,
      'image-display': ImageDisplay
    },
    computed: {}
  }
</script>

<style lang='scss'>


</style>
