<template>
  <div id='file-list'> 
    <div id='search-box'>
      <input value="search" type="text"/>
    </div>
    <file-item></file-item>
    <file-item></file-item>
    <file-item></file-item>
    <file-item></file-item>
  </div>
</template>

<script>
import FileItem from './file_list_parts/file_list_item.vue'

export default {
  name: 'FileList',
  components: {
    'file-item': FileItem
  },
  data: function () {
    return {
      selected: null
    }
  }
}
</script>

<style lang='scss'>
  #file-list {
    border: 1px solid #ccc;
    width: 150px;
    overflow: auto;
    #search-box {
      height: 100%;
      width: 95%;
      // padding: 1px 3px 1px 3px;
      margin: 3px 3px 3px 3px;
      input {
        width: 100%;
        padding: 0 0 0 0;
        margin: 0 0 0 0;
      }
    }
  }

</style>
