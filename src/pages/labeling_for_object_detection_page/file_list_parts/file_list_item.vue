<template>
  <div class='img-box'>
    <img :src='imgData'>
  </div>
</template>

<script>
  export default {
    name: 'FileItem',
    props: [
      'fileName',
      'imgData',
    ],
    data: function () {
      return {
        selected_index: 0,
        scroll_top: 0
      }
    },
    methods: {},
    computed: {
      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      }
    }
  }
</script>

<style lang='scss'>

  .img-box {
    height: 100%;
    width: 30%;
    position: relative;

    img {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      position: absolute;
      margin: auto;
      text-align: left;
    }
  }

</style>
