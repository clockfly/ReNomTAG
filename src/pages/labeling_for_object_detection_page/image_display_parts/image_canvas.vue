<template>
  <div id='image-canvas'>
    <img id='main-image' :src='imgSrc'
      @mousedown='disabled'
    >
    <box v-for='(sbox, index) in boxList'></box>
    <div id='mask'
      @click='onClick'
      @mousedown.capture.stop='onMouseDown'
      @mouseup='onMouseUp'
      @mousemove.capture.stop='onMouseMove'
    >
    </div>
  </div>
</template>

<script>
import Bbox from './image_canvas_parts/box.vue'

export default {
  name: 'ImageCanvas',
  components: {
    'box': Bbox
  },
  props: [
    'imgSrc'
  ],
  beforeUpdate () {
    let mask = document.getElementById('mask')
    mask.style.top = this.$el.style.top
  },
  data() {
    return {
      boxList: [],
      mouseDownFlag:false,
      currentBbox: null
    }
  },
  methods: {
    onClick: function (event) {

    },
    onMouseDown: function (event) {
      let [x, y] = this.transformCurrentCorrdinate(event)
      this.mouseDownFlag = true      
      let select_flag = true
      for (let box of this.$children) {
        if (false) {
          select_flag = false
        }
      }
      if (select_flag) {
        this.boxList.push(0)
      }
      return false
    },
    onMouseUp: function (event) {
      this.mouseDownFlag = false
      if(this.currentBbox) {
        if (!this.currentBbox.isBoxCreated()) {
          this.boxList.pop()
        }
        this.currentBbox = null
      }
    },
    onMouseMove: function (event) {
      if (!this.mouseDownFlag) return
      let [x, y] = this.transformCurrentCorrdinate(event)
      if (!this.currentBbox) {
        this.currentBbox = this.$children[this.boxList.length-1]
        this.currentBbox.initializeBox(x, y)
        // console.log(x, y, event.target)
      }else{
        this.currentBbox.handleClickEvent(x, y, event.target)
      } 
    },
    transformCurrentCorrdinate: function (event) {
      let box = document.getElementById('image-canvas').getBoundingClientRect()
      let rectX = box.left
      let rectY = box.top
      let width = box.width
      let height = box.height
      let x = (event.pageX - rectX)/width*100
      let y = (event.pageY - rectY)/height*100
      return [x, y]
    },
    disabled: function () {
      return false
    }
  }
}

</script>

<style lang='scss'>
  #image-canvas {
    width: 100%;
    height: calc(100% - 40px);
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    img {
      pointer-events: none;
      object-fit: contain;
      max-width: 100%;
      max-height: 100%;
    }
    #mask {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
</style>
