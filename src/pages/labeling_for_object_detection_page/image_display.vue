<template>
  <div id='image-display'>
    <div id='header'>
      <div id='file-text'>
        <span style='margin-right: 20px; margin-left: 20px;'>{{ current_file_index
        + 1 }} / {{ filename_list_length }}</span>
        <span>{{ current_file_path }}</span>
      </div>
      <div id='icon'>
        <span><i class='fa fa-search-plus' aria-hidden='true'></i></span>
        <span><i class='fa fa-search-minus' aria-hidden='true'></i></span>
      </div>
    </div>
    <div id='outer-panel'>
      <transition>
        <image-canvas></image-canvas>
      </transition>
      <div id='low-button'>
        <input type='button' value='<<' @click='load_prev_raw_img()'>
        <input type='button' value='save' @click='save_xml_from_dict()'>
        <input type='button' value='>>' @click='load_next_raw_img()'>
        <div class="">save at {{ save_xml_dir }}/{{ save_xml_file_name_computed }}.xml</div>
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
      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      },
      current_file_path: function () {
        return this.$store.getters.get_current_file_path
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
          let file_path_split = this.filename_list[this.current_file_index].split('/')
          return file_path_split[file_path_split.length - 1].split('.')[0]
        }
      },
      sidebar_current_page: function () {
        return this.$store.getters.get_sidebar_current_page
      },
      sidebar_page_step: function () {
        return this.$store.getters.get_sidebar_page_step
      },
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
        this.$store.dispatch('load_raw_img', {index: index})
      },
      load_next_raw_img: function () {
        let self = this
        self.$store.dispatch('set_sidebar_file_list_scroll_position_flag', {flag: true}).then(
          this.$store.dispatch('load_raw_img', {index: this.current_file_index + 1})
        )
      },

      reload_sidebar_thumbnail_and_filename_list () {
        this.$store.dispatch('reload_sidebar_thumbnail_and_filename_list', {
          current_page: this.sidebar_current_page,
          page_step: this.sidebar_page_step
        })
      },

      load_prev_raw_img: function () {
        let self = this
        self.$store.dispatch('set_sidebar_file_list_scroll_position_flag', {flag: true}).then(
          this.$store.dispatch('load_raw_img', {index: this.current_file_index - 1})
        )
      },
      set_sidebar_file_list_scroll_position_flag: function (flag) {
        this.$store.dispatch('set_sidebar_file_list_scroll_position_flag', {flag: flag})
      },
      save_xml_from_dict: function () {
        let self = this

        self.$store.dispatch('set_current_label_dict', {
          file_path: self.filename_list[self.current_file_index],
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
          self.reload_sidebar_thumbnail_and_filename_list()
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

    #header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 30px;
      background-color: #b5b5b5;
      #file-text {
        color: #3a3a3a;
        font-weight: bold;
      }
      #icon {
        tt {
          font-size: 1.2rem;
          margin-right: 10px;
        }
      }
    }
    #outer-panel {
      width: 100%;
      height: calc(100% - 30px);
      padding: 3px 3px 3px 3px;
      background-color: #ffffff;
      box-sizing: border-box;
      border: solid 1px #a3a3a3;
      #low-button {
        height: 40px;
        width: 400px;
        display: flex;
        align-items: center;
        margin: auto;
        justify-content: space-around;
        input {
          margin: 0 0 0 0;
          padding: 3px 4px 3px 4px;
        }
        .save_xml_file_name_input {
          :focus {
            outline: none;
          }
        }
        .save_xml_file_name_input {
          width: 150px;
        }
        .save_xml_dir_input {
          width: 40px;
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
