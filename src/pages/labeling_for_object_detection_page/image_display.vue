<template>
  <div id='image-display'>
    <div id='header'>
      <div id='file-text'>
        <tt style='margin-right:20px;'>{{ nthImg }} / {{ totalImg }}</tt>
        <tt>{{ fileName }}</tt>
      </div>
      <div id='icon'>
        <tt><i class="fa fa-search-plus" aria-hidden="true"></i></tt>
        <tt><i class="fa fa-search-minus" aria-hidden="true"></i></tt>
      </div>
    </div>
    <div id='outer-panel'>
      <image-canvas></image-canvas>
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
        fileName: 'test2.png',
        nthImg: '10',
        totalImg: '100',
      }
    },
    methods: {
      nextRawImg: function () {
        self = this
        let img = new Image();
        img.onload = function(){
          self.$children[0].setImgSrc(img) 
        }
        this.imgData = self.$store.getters.get_raw_img_list
        if (this.imgData.length > 1) {
          img.src = 'data:image/png;base64,' + this.imgData[1]
        } else if (this.imgData.length > 0) {
          img.src = 'data:image/png;base64,' + this.imgData[0]
        }
        this.$store.dispatch('load_next_raw_img')
      },
      priorRawImg: function () {
        let img = new Image();
        img.onload = function(){
          self.$children[0].setImgSrc(img) 
        }
        this.imgData = this.$store.getters.get_raw_img_list
        if (this.imgData.length > 0) {
          img.src = 'data:image/png;base64,' + this.imgData[0]
        }
        this.$store.dispatch('load_prior_raw_img')
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
    }

  }
</style>
