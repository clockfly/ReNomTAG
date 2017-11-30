<template>
  <div id='file-list'>
    <div id='inner-file-list'>
      <div id='search-box'>
        <input value="search" type="text"/>
      </div>
      <file-item v-for='(fname, index) in getFileNameList'
        :file-name='fname' :key='index'
        :img-data='"data:image/png;base64,"+imgDataList[index]'>
      </file-item>
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
        selected: null,
        imgDataList: [],
        imgNameList: [],
      }
    },
    computed: {
      getFileNameList: function () {
        this.imgNameList = this.$store.getters.get_filename_list
        this.imgDataList = this.$store.getters.get_thumbnail_img_list
        return this.imgNameList
      }
    }
  }
</script>

<style lang='scss'>

  #file-list {
    #inner-file-list {
      height: 100%;
      box-sizing: border-box;
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
