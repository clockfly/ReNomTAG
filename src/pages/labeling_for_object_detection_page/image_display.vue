<template>
  <div id='image-display'>
    <div id='outer-panel'>
      <transition>
        <image-canvas></image-canvas>
      </transition>
      <div id='low-button'>
        <span class="file-name">{{ current_file_name }}</span>
        <div id="save_xml_btn" @click='save_xml_from_dict()'>
          Save <span class="save_xml_btn_arrow">>></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ImageCanvas from './image_display_parts/image_canvas.vue'

  export default {
    name: 'ImageDisplay',
    components: {
      'image-canvas': ImageCanvas
    },
    data: function () {
      return {
        imgData: '',
        save_xml_dir: 'xml'
      }
    },
    computed: {
      filename_list: function () {
        return this.$store.getters.get_filename_list
      },
      filename_list_length: function () {
        return this.filename_list.length
      },
      sidebar_filename_list: function () {
        return this.$store.getters.get_sidebar_filename_list
      },

      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      },
      current_file_path: function () {
        return this.$store.getters.get_current_file_path
      },
      current_file_name: function () {
        return this.$store.getters.get_current_file_name
      },
      current_raw_img: function () {
        return this.$store.getters.get_current_raw_img
      },
      current_label_dict: function () {
        return this.$store.getters.get_current_label_dict
      },
      current_img_width: function () {
        return this.$store.getters.get_current_img_width
      },
      current_img_height: function () {
        return this.$store.getters.get_current_img_height
      },
      save_xml_file_name_computed: function () {
        if (this.filename_list.length < 1) {
          return ''
        } else {
//          let file_path_split = this.filename_list[this.current_file_index].split('/')
          return this.current_file_name.split('.')[0]
        }
      },
      sidebar_current_page: function () {
        return this.$store.getters.get_sidebar_current_page
      },
      sidebar_page_step: function () {
        return this.$store.getters.get_sidebar_page_step
      },
      bbox_labeled_flag () {
        return this.$store.getters.get_bbox_labeled_flag
      }
    },
    created () {
      const self = this
      if (this.filename_list.length === 0) {
        let ret = this.$store.dispatch('load_filename_list')
        ret.then(function () {
          self.load_raw_img(0)
        })
      } else {
        self.load_raw_img(-1)
      }
    },
    methods: {
      // Defined index
      load_raw_img: function (index) {
        this.$store.dispatch('load_raw_img', {
          filename_list: this.filename_list,
          index: index
        })
      },
      load_next_raw_img: function () {
        let self = this
        self.$store.dispatch('set_sidebar_file_list_scroll_position_flag', {flag: true}).then(
          this.$store.dispatch('load_raw_img', {
            filename_list: this.sidebar_filename_list,
            index: this.current_file_index + 1
          })
        )
      },
      load_prev_raw_img: function () {
        let self = this
        self.$store.dispatch('set_sidebar_file_list_scroll_position_flag', {flag: true}).then(
          this.$store.dispatch('load_raw_img', {
            filename_list: self.sidebar_filename_list,
            index: this.current_file_index - 1
          })
        )
      },
      load_sidebar_thumbnail_and_filename_list () {
        this.$store.dispatch('load_sidebar_thumbnail_and_filename_list', {
          current_page: this.sidebar_current_page,
          page_step: this.sidebar_page_step
        })
      },
      set_sidebar_file_list_scroll_position_flag: function (flag) {
        this.$store.dispatch('set_sidebar_file_list_scroll_position_flag', {flag: flag})
      },
      save_xml_from_dict: function () {
        let self = this

        self.$store.dispatch('set_current_label_dict', {
          file_path: self.current_file_path,
          size_height: self.current_img_height,
          size_width: self.current_img_width
        }).then(
          self.$store.dispatch('save_xml_from_label_dict', {
            save_xml_file_name: self.save_xml_file_name_computed,
            save_xml_dir: self.save_xml_dir,
            label_dict: self.current_label_dict
          })
        ).then(
          self.$store.commit('toggle_update_bbox_flag')
        ).then(
          self.load_sidebar_thumbnail_and_filename_list()
        )
      }
    }
  }
</script>

<style lang='scss'>
  #image-display {
    width: 100%;
    height: 100%;
    flex: 1;

    #outer-panel {
      width: 100%;
      height: calc(100% - 30px);
      /*padding: 3px 3px 3px 3px;*/

      background-color: #ffffff;
      box-sizing: border-box;
      // border: solid 1px #a3a3a3;
      #low-button {
        height: 40px;
        width: 400px;
        display: flex;
        align-items: center;
        margin: auto;
        justify-content: center;

        .file-name {
          color: #666;
          padding-right: 15px;
        }

        #save_xml_btn {
          background-color: #326699;
          border-radius: 5px;
          color: #fff;
          padding: 3px 15px;
          .save_xml_btn_arrow {
            margin-left: 5px;
          }

          &:hover {
            background-color: lighten(#326699, 10%);
            cursor: pointer;
          }

        }
      }
      .v-enter-active, .v-leave-active {
        transition: opacity .5s
      }
      .v-enter, .v-leave-to {
        opacity: 0;
      }
    }
  }
</style>
