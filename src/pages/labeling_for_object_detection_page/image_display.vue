<template>
  <div id='image-display'>
    <div id='header'>
      <div id='file-text'>
        <span style='margin-right: 20px; margin-left: 20px;'>{{ current_file_index
        + 1 }} / {{ filename_list_length }}</span>
        <span>{{ current_file_name }}</span>
      </div>
      <div id='icon'>
        <span><i class="fa fa-search-plus" aria-hidden="true"></i></span>
        <span><i class="fa fa-search-minus" aria-hidden="true"></i></span>
      </div>
    </div>
    <div id='outer-panel'>
      <transition>
        <image-canvas></image-canvas>
      </transition>
      <div id='low-button'>
        <input type='button' value='<<' @click='load_prev_raw_img()'>
        <input type='button' value='save'>
        <input type='button' value='>>' @click='load_next_raw_img()'>
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
        imgData: ''
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
      current_file_name: function () {
        return this.$store.getters.get_current_file_name
      },
      current_raw_img: function () {
        return this.$store.getters.get_current_raw_img
      }
    },
    created () {
      const self = this
      if (this.$store.getters.get_filename_list.length === 0) {
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
        let self = this
        this.$store.dispatch('load_raw_img', {index: index}).then(
          self.$store.dispatch('calc_and_set_sidebar_file_list_scroll_position')
        )
      },
      load_next_raw_img: function () {
        this.load_raw_img(this.current_file_index + 1)
      },

      load_prev_raw_img: function () {
        this.load_raw_img(this.current_file_index - 1)
      },
      calc_and_set_sidebar_file_list_scroll_position: function () {
        this.$nextTick(function () {
          this.$store.dispatch('calc_and_set_sidebar_file_list_scroll_position')
        })
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
