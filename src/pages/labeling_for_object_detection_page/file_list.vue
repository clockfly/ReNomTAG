<template>
  <div id='file-list'>
    <div id='search-box'>
      <input placeholder="search" type="text"/>
    </div>

    <div id='inner-file-list'>

      <file-item v-for='(fname, index) in sidebar_filename_list'
                 :file-name='fname'
                 :key='index'
                 :img-data='"data:image/png;base64,"+sidebar_thumbnail_list[index]'
                 @click_action="click_action(index)"
                 :class="{selected: index===sidebar_current_file_index}"
      >
      </file-item>
    </div>
    <ul id="file-list-page-nation">
      <li v-for="n in 5" @click="change_page(n)" :class="{active: n===current_page}">{{ n }}</li>
    </ul>
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
        current_page: 1,
        page_step: 100
      }
    },

    created () {
      const self = this
      this.$store.dispatch('load_filename_list').then(function () {
        self.$store.dispatch('load_sidebar_thumbnail_and_filename_list', {
          current_page: self.current_page,
          page_step: self.page_step
        })
      })
    },
    computed: {
      filename_list: function () {
        return this.$store.getters.get_filename_list
      },
      sidebar_thumbnail_list: function () {
        return this.$store.getters.get_sidebar_thumbnail_list
      },
      sidebar_filename_list: function () {
        return this.$store.getters.get_sidebar_filename_list
      },
      sidebar_filename_list_index: function () {
        return this.$store.getters.get_sidebar_filename_list_index
      },
      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      },
      sidebar_current_file_index: function () {
        return this.current_file_index - ((this.current_page - 1) * this.page_step)
      }
    },
    methods: {
      change_page: function (n) {
        this.current_page = n
        this.$store.dispatch('load_sidebar_thumbnail_and_filename_list', {
          current_page: this.current_page,
          page_step: this.page_step
        })
      },
      click_action (index) {
        this.$store.dispatch('load_raw_img', {index: ((this.current_page - 1) * this.page_step) + index})
      },
    }
  }
</script>

<style lang='scss'>

  #file-list {
    #inner-file-list {
      height: calc(100% - 80px);
      box-sizing: border-box;
      border: 1px solid #ccc;
      overflow: auto;
    }
    #search-box {
      width: 100%;
      margin: 3px 0;
      box-sizing: border-box;

      input {
        width: 100%;
        margin: 0;
        outline: none;
        padding: 1px 5px;
        box-sizing: border-box;
      }
    }

    #file-list-page-nation {
      list-style: none;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0;
      height: 10%;

      li {
        padding: 2px 8px;
        border: 1px solid #0c0c0c;
        box-sizing: border-box;
        margin: 0 4px;

        &.active {
          background: #0c0c0c;
          color: #fff;
        }
        &:hover {
          cursor: pointer;
        }
      }
    }
  }

</style>
