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
    <!--<p>it :{{ inner_file_list_offset_top }} ih: {{ inner_file_list_offset_height }}</p>-->

    <!--<p style="font-size: 10px; line-height: 0.8; margin: 5px;">sidebar_selected_item_offset_top :{{ sidebar_selected_item_offset_top-->
    <!--}} <br />sidebar_selected_item_offset_height: {{ sidebar_selected_item_offset_height}} </p>-->
    <!--<p style="font-size: 10px; line-height: 0.5; margin: 5px;">file list scroll pos: {{ sidebar_file_list_scroll_position }}</p>-->

    <div id='inner-file-list'>

      <div class="file-item" v-for='(fname, index) in sidebar_filename_list'
           :key='index' @click="click_action(index)"
           :class="{selected: index===sidebar_current_file_index}">
        <file-item :img-data='"data:image/png;base64,"+sidebar_thumbnail_list[index]'>
        </file-item>
        {{ fname }}
      </div>

    </div>
    <ul id="file-list-page-nation">
      <li @click="change_page(1)" class="arrow"><</li>
      <li v-for="n in this.sidebar_page_nation" @click="change_page(n)"
          :class="{active: n===sidebar_current_page}">{{ n
        }}
      </li>
      <li @click="change_page(sidebar_page_number)" class="arrow">></li>
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
        'select_page_step': 100,
        'max_page': 5, // ページネーションの表示数
        'inner_file_list_offset_top': 0,
        'inner_file_list_offset_height': 0
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
      sidebar_page_nation: function () {
        // divide file number by page step then plus1
        let page_number = this.sidebar_page_number

        // ページが6ページ以上ある場合
        if (page_number > this.max_page) {
          let temp_page_nation = []

          // カレントページから最終ページまで6ページ以下である場合
          if (page_number - this.sidebar_current_page < this.max_page - 1) {
            for (let i = page_number - this.max_page + 1; i < page_number + 1; i++) {
              temp_page_nation.push(i)
            }
            // カレントページから最終ページまで6ページ以上である場合
          } else {
            // カレントページが1ページ目である場合
            if (this.sidebar_current_page === 1) {
              for (let i = 1; i < this.max_page + 1; i++) {
                temp_page_nation.push(i)
              }
              // カレントページが2ページ目である場合
            } else if (this.sidebar_current_page === 2) {
              console.log('2')
              for (let i = this.sidebar_current_page - 1; i < this.sidebar_current_page + this.max_page - 1; i++) {
                temp_page_nation.push(i)
              }
            } else if (this.sidebar_current_page === page_number - 1) {
              for (let i = this.sidebar_current_page - (this.max_page - 2); i < page_number; i++) {
                temp_page_nation.push(i)
              }
            } else {
              for (let i = this.sidebar_current_page - 2; i < this.sidebar_current_page + this.max_page - 2; i++) {
                temp_page_nation.push(i)
              }
              return temp_page_nation
            }
            // 最終ページ番号
            // temp_page_nation.push(page_number)
          }
          return temp_page_nation
        } else {
          return page_number
        }
      },
      sidebar_current_page: function () {
        return this.$store.getters.get_sidebar_current_page
      },
      sidebar_page_step: function () {
        return this.$store.getters.get_sidebar_page_step
      },
      sidebar_selected_item_offset_top: function () {
        return this.$store.getters.get_sidebar_selected_item_offset_top
      },
      sidebar_selected_item_offset_height: function () {
        return this.$store.getters.get_sidebar_selected_item_offset_height
      },
      sidebar_file_list_scroll_position: function () {
        return this.$store.getters.get_sidebar_file_list_scroll_position
      },

      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      },
      filename_list: function () {
        return this.$store.getters.get_filename_list
      },
      sidebar_file_list_scroll_position_flag: function () {
        return this.$store.getters.get_sidebar_file_list_scroll_position_flag
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
        let self = this
        self.$store.dispatch('set_sidebar_file_list_scroll_position_flag', {flag: false}).then(
          self.$store.dispatch('load_raw_img', {index: ((self.sidebar_current_page - 1) * self.sidebar_page_step) + index})
        )
      },
      reload_sidebar_current_position_top () {
        let selected_item = document.getElementById('inner-file-list').getElementsByClassName('selected')
        this.$store.dispatch('set_sidebar_selected_item_offset', {
          sidebar_selected_item_offset_top: selected_item[0].offsetTop,
          sidebar_selected_item_offset_height: selected_item[0].offsetHeight
        })
      },
      calc_and_set_sidebar_file_list_scroll_position: function () {
//        console.log('sidebar_selected_item_offset_top : ' + this.sidebar_selected_item_offset_top)
        this.$store.dispatch('calc_and_set_sidebar_file_list_scroll_position')
      }
    },
    mounted: function () {
      let self = this
      this.$nextTick(function () {
        let inner_file_list = document.getElementById('inner-file-list')
        self.$store.dispatch('set_sidebar_inner_file_list_offset', {
          sidebar_inner_file_list_offset_top: inner_file_list.offsetTop,
          sidebar_inner_file_list_offset_height: inner_file_list.offsetHeight
        }).then(
          self.$store.dispatch('set_sidebar_file_list_scroll_window_position', {
            start_position: 0,
            end_position: inner_file_list.offsetHeight
          })
        )
      })
    },
    watch: {
      // この関数は sidebar_current_file_index が変わるごとに実行されます。
      sidebar_current_file_index: function () {
        if (!this.sidebar_file_list_scroll_position_flag) {
          return
        }
        let self = this
        this.$nextTick(function () {
          self.reload_sidebar_current_position_top()
          self.calc_and_set_sidebar_file_list_scroll_position()
          document.getElementById('inner-file-list').scrollTop = this.sidebar_file_list_scroll_position
        })
      },
      sidebar_current_page: function () {
        this.$nextTick(function () {
          this.change_page(this.sidebar_current_page)
        })
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

      .file-item {
        height: 40px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #e6e6e6;
        padding-right: 10px;
        box-sizing: border-box;
        margin-bottom: 2px;

        cursor: pointer;

        font-size: 12px;

        &.selected {
          border: 2px solid #2d3e50;
        }
      }
    }
    #search-box {
      width: 100%;
      margin-bottom: 3px;
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
        padding: 2px 0;
        width: 25px;
        text-align: center;
        border: 1px solid #0c0c0c;
        box-sizing: border-box;
        margin: 0 4px;
        transition: 150ms;

        &.active {
          background: #2d3e50;
          color: #fff;
        }
        &:hover {
          cursor: pointer;
          background: #2d3e50;
          color: #fff;
        }
        &.arrow {
          letter-spacing: -1px;
        }
      }
    }
  }

</style>
