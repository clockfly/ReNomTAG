<template>
  <img :src='imgData' class="file_list_item_img">
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
  .file_list_item_img {
    width: 100%;
    display: block;
    transition: all .8s;

  }

</style>
