<template>
  <div id='image-canvas'>
    <div id='mask'
      v-bind:style='{"background-image": "url("+imgSrc+")"}'
      @click='onClick'
      @mousedown='onMouseDown'
      @mouseup='onMouseUp'
      @mousemove='onMouseMove'
    >
    <box v-for='(sbox, index) in boxList'></box>
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
    console.log(mask)
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
    #mask {
      position: relative;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center center;
      width: 100%;
      height: 100%;
    }
  }
</style>
