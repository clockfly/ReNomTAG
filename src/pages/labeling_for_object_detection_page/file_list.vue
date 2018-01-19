<template>
  <div id='left-sidebar'>

    <!--<div>-->
    <!--<select name="select_page_step"-->
    <!--id="select_page_step"-->
    <!--@change="change_page_step(select_page_step)"-->
    <!--v-model="select_page_step">-->
    <!--<option>50</option>-->
    <!--<option selected="selected">100</option>-->
    <!--<option>200</option>-->
    <!--</select>-->
    <!--</div>-->
    <!--<p>it :{{ inner_file_list_offset_top }} ih: {{ inner_file_list_offset_height }}</p>-->

    <!--<p style="font-size: 10px; line-height: 0.8; margin: 5px;">sidebar_selected_item_offset_top :{{ sidebar_selected_item_offset_top-->
    <!--}} <br />sidebar_selected_item_offset_height: {{ sidebar_selected_item_offset_height}} </p>-->
    <!--<p style="font-size: 10px; line-height: 0.5; margin: 5px;">file list scroll pos: {{ sidebar_file_list_scroll_position }}</p>-->

    <div class="file-list-header">Images</div>
    <div id='file-list-wrapper'>

      <ul id="file-list-inner">

        <li class="file-item" v-for='(fname, index) in sidebar_filename_list'
            :key='index' @click="click_action(index)"
            :class="{selected: index===sidebar_current_file_index}">
          <file-item :img-data='"data:image/png;base64,"+sidebar_thumbnail_list[index]'>
          </file-item>
        </li>
      </ul>

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
          self.$store.dispatch('load_raw_img', {
            filename_list: self.sidebar_filename_list,
            index: ((self.sidebar_current_page - 1) * self.sidebar_page_step) + index
          })
        )
        this.$store.commit('set_bbox_labeled_flag', {
          flag: true
        })
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
      },

      reload_filename_list () {
        this.$store.dispatch('reload_sidebar_thumbnail_and_filename_list', {
          current_page: this.sidebar_current_page,
          page_step: this.sidebar_page_step
        })
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
    },
    filters: {
//      filterFileName: function (fname) {
//        // 適当なfilter処理
//        let fname_split = fname.split('/')
//        return fname_split[fname_split.length - 1]
//      }
    }
  }
</script>

<style lang='scss'>

  #left-sidebar {
    width: 200px;
    padding: 0 25px;
    border-right: 1px solid #666666;

    .file-list-header {
      font-size: 18px;
      font-weight: bold;
      width: 200px;
      margin: 0 auto;
      padding: 20px 0 5px 0;

    }
    #file-list-wrapper {
      height: calc(100% - 120px);
      overflow: scroll;
      width: 200px;
      margin: 0 auto;

      #file-list-inner {

        width: 100%;
        height: auto;
        overflow: scroll;

        -webkit-column-count: 3;
        -webkit-column-gap: 1.3px;
        -webkit-column-fill: auto;

        -moz-column-count: 3;
        -moz-column-gap: 1.3px;
        -moz-column-fill: auto;

        -o-column-count: 3;
        -o-column-gap: 1.3px;
        -o-column-fill: auto;

        -ms-column-count: 3;
        -ms-column-gap: 1.3px;
        -ms-column-fill: auto;

        column-count: 3;
        column-gap: 1.3px;
        column-fill: auto;

        margin: 0;
        padding-left: 0;

        .file-item {
          display: inline-block;
          background: #FEFEFE;

          -webkit-column-break-inside: avoid;
          -moz-column-break-inside: avoid;
          -o-column-break-inside: avoid;
          -ms-column-break-inside: avoid;
          column-break-inside: avoid;

          background: -webkit-linear-gradient(45deg, #FFF, #F9F9F9);
          opacity: 1;

          -webkit-transition: all .2s ease;
          -moz-transition: all .2s ease;
          -o-transition: all .2s ease;
          transition: all .2s ease;

          margin-bottom: -4px;

          &.selected {
            background: #2d3e50;
            color: #fff;
          }
          &:hover {
            cursor: pointer;
          }
        }
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
        width: 20px;
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
