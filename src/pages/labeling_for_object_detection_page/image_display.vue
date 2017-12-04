<template>
  <div id='image-display'>
    <div id='header'>
      <div id='file-text'>
        <span style='margin-right: 20px; margin-left: 20px;'>{{ this.current_file_index
          }} / {{ this.filename_list_length }}</span>
        <span>{{ this.current_file_name }}</span>
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
        <input type='button' value='<<' @click='load_raw_img(-1)'>
        <input type='button' value='save'>
        <input type='button' value='>>' @click='load_raw_img(1)'>
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
        self.load_raw_img(0)
      }
    },
    methods: {
      load_raw_img: function (increment) {
        const self = this
        this.$store.dispatch('load_raw_img', {increment: increment}).then(function () {
          let img = new Image()
          let img_data
          img.onload = function () {
            self.$children[0].setImgSrc(img)
          }
          img_data = 'data:image/png;base64,' + self.current_raw_img
          img.src = img_data
        })
      }
    }
  }
</script>

<style lang='scss'>
  #image-display {
    width: 100%;
    height: 100%;

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
