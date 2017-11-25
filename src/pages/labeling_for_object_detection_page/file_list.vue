<template>
  <div id='file-list'>
    <div id='inner-file-list'>
      <div id='search-box'>
        <input value="search" type="text"/>
      </div>
      <file-item></file-item>
      <file-item></file-item>
      <file-item></file-item>
      <file-item></file-item>
    </div>
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
    #inner-file-list{
      height: 100%;
      box-sizing:border-box;
      border: 1px solid #ccc;
      overflow: auto;
      #search-box {
        width: 95%;
        margin: 3px 3px 3px 3px;
        input {
          width: 100%;
          padding: 0 0 0 0;
          margin: 0 0 0 0;
        }
      }
    }
  }

</style>
