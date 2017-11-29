<template>
  <div id='image-display'>
    <div id='header'>
      <div id='file-text'>
        <tt style='margin-right: 20px; margin-left: 20px;'>{{ nthImg }} / {{ totalImg }}</tt>
        <tt>{{ fileName }}</tt>
      </div>
      <div id='icon'>
        <tt><i class="fa fa-search-plus" aria-hidden="true"></i></tt>
        <tt><i class="fa fa-search-minus" aria-hidden="true"></i></tt>
      </div>
    </div>
    <div id='outer-panel'>
      <transition>
        <image-canvas></image-canvas>
      </transition>
      <div id='low-button'>
        <input type='button' value='<<' @click='priorRawImg'>
        <input type='button' value='save'>
        <input type='button' value='>>' @click='nextRawImg'>
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
        fileName: '',
        nthImg: '',
        totalImg: ''
      }
    },
    methods: {
      nextRawImg: function () {
        self = this
        this.nthImg = this.$store.getters.get_filename_list_index
        this.totalImg = this.$store.getters.get_filename_list.length
        this.$store.dispatch('load_next_raw_img').then(function (){
          let img = new Image();
          let img_data
          let img_filename
          img.onload = function(){
            self.$children[0].setImgSrc(img) 
          }
          self.imgData = self.$store.getters.get_raw_img
          img_data = 'data:image/png;base64,' + self.imgData['img']
          img_filename = self.imgData['filename']
          img.src = img_data
          self.fileName = img_filename
        })
      },
      priorRawImg: function () {
        self = this
        this.$store.dispatch('load_prior_raw_img').then(function(){
          let img = new Image();
          let img_data
          let img_filename
          img.onload = function(){
            self.$children[0].setImgSrc(img) 
          }
          self.imgData = self.$store.getters.get_raw_img
          img_data = 'data:image/png;base64,' + self.imgData['img']
          img_filename = self.imgData['filename']
          img.src = img_data
          self.fileName = img_filename
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
