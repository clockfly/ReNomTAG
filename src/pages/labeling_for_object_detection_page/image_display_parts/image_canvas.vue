<template>
  <div id='image-canvas'>
    <div id='mask'
      v-bind:style='{"background-image": "url("+imgSrc+")",
                      "padding-top": padTop+"%",
                      "padding-left": padLeft+"%"}'
      @mousedown='onMouseDown'
      @mouseup='onMouseUp'
      @mousemove='onMouseMove'
      @mouseleave='onMouseUp'
      v-show='showFlag'> 
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
  data() {
    return {
      boxList: [],
      mouseDownFlag:false,
      currentBbox: null,
      imgSrc:'',
      imgWidth:0,
      imgHeight:0,
      padTop:0,
      padLeft:0,
      showFlag:true // This is for transition images.
    }
  },
  created: function () {
    window.addEventListener('resize', this.onResizeWindow)
  },
  methods: {
    setShowFlag: function (flag) {
      this.showFlag = flag
    },
    setImgSrc: function (img) {
      this.imgSrc = img.src
      this.imgWidth = img.width
      this.imgHeight = img.height
      this.onResizeWindow()
    },
    onResizeWindow: function () {
      let parentBox = document.getElementById('image-canvas').getBoundingClientRect()
      let parentWidth = parentBox.width
      let parentHeight = parentBox.height
      let childAspectRatio = this.imgWidth/this.imgHeight
      let parentAspectRatio = parentWidth/parentHeight
      
      if (childAspectRatio < parentAspectRatio) {
        this.padTop=100
        this.padLeft=100*this.imgWidth/parentWidth*parentHeight/this.imgHeight
      } else {
        this.padTop=100*this.imgHeight/parentHeight*parentWidth/this.imgWidth
        this.padLeft=100
      }
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
      }else{
        this.currentBbox.handleClickEvent(x, y, event.target)
      } 
    },
    transformCurrentCorrdinate: function (event) {
      let box = document.getElementById('mask').getBoundingClientRect()
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
    justify-content: center;
    align-items: center;
    #mask {
      position: relative;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center center;
      width: 0;
      height: 0;
    }
  }
</style>
