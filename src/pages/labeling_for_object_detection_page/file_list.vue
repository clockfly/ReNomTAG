<template>
  <div id='file-list'>
    <div id='search-box'>
      <input placeholder="search" type="text"/>
    </div>
    <div>
      <select name="select_page_step"
              id="select_page_step"
              @change="change_page_step(select_page_step)"
              v-model="select_page_step">
        <option>50</option>
        <option selected="selected">100</option>
        <option>200</option>
      </select>
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
      <li v-for="n in sidebar_page_number" @click="change_page(n)" :class="{active: n===sidebar_current_page}">{{ n }}
      </li>
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
        // current_page: 1,
        'select_page_step': 100
      }
    },
    created () {
      const self = this
      this.$store.dispatch('load_filename_list').then(function () {
        self.change_page(self.sidebar_current_page)
      })
    },
    computed: {
      sidebar_thumbnail_list: function () {
        return this.$store.getters.get_sidebar_thumbnail_list
      },
      sidebar_filename_list: function () {
        return this.$store.getters.get_sidebar_filename_list
      },
      sidebar_filename_list_index: function () {
        return this.$store.getters.get_sidebar_filename_list_index
      },
      sidebar_current_file_index: function () {
        return this.current_file_index - ((this.sidebar_current_page - 1) * this.sidebar_page_step)
      },
      sidebar_page_number: function () {
        // divide file number by page step then plus1
        return parseInt(this.$store.getters.get_filename_list_length / this.sidebar_page_step) + 1
      },
      sidebar_current_page: function () {
        return this.$store.getters.get_sidebar_current_page
      },
      sidebar_page_step: function () {
        return this.$store.getters.get_sidebar_page_step
      },
      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      },
      filename_list: function () {
        return this.$store.getters.get_filename_list
      }
    },
    methods: {
      change_page: function (new_page) {
        this.$store.dispatch('load_sidebar_thumbnail_and_filename_list', {
          current_page: new_page,
          page_step: this.sidebar_page_step
        })
      },
      change_page_step: function (page_step) {
        this.$store.dispatch('change_sidebar_page_step', {sidebar_page_step: page_step})
      },
      click_action (index) {
        this.$store.dispatch('load_raw_img', {index: ((this.sidebar_current_page - 1) * this.sidebar_page_step) + index})
      }
    }
  }
</script>

<style lang='scss'>

  #file-list {
    width: 200px;
    #inner-file-list {
      height: calc(100% - 120px);
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

    #select_page_step {
      width: 100%;
      padding-top: 0;
      padding-bottom: 0;
      margin: 0 0 5px 0;
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
