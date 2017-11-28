<template>
  <div id='image-canvas'
      tabindex='0'
      @mousedown='onMouseDown'
      @mouseup='onMouseUp'
      @mousemove='onMouseMove'
      @keyup.delete='onKeyDelete'>
    <div id='inner-canvas'>
      <div id='mask'
        v-bind:style='{"background-image": "url("+imgSrc+")",
                        "padding-top": padTop+"%",
                        "padding-left": padLeft+"%"}'
        v-show='showFlag'> 
        <box v-for='(sbox, index) in boxList' :key='index'></box>
      </div>
    </div>
  </div>
</template>

<script>
import Bbox from './image_canvas_parts/box.vue'

var boxEvent = {
    "create":0,
    "move":1,
    "rescale-left-top":2,
    "rescale-left-bottom":3,
    "rescale-right-top":4,
    "rescale-right-bottom":5
  }

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
      boxEventType: null,
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
      let parentBox = document.getElementById('inner-canvas').getBoundingClientRect()
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
    onKeyDelete: function (event) {
      let bbox = this.$el.querySelector('.selected')
      if (bbox){
        let parent = bbox.parentNode
        parent.parentNode.removeChild(parent)
      }
    },
    onMouseDown: function (event) {
      let [x, y] = this.transformCurrentCorrdinate(event)
      let select_flag = true
      let target = event.target

      this.mouseDownFlag = true      
      this.currentBbox = null

      for (let box of this.$children) {
        let query_list = []
        query_list.push(box.$el.querySelector('#left-top'))
        query_list.push(box.$el.querySelector('#left-bottom'))
        query_list.push(box.$el.querySelector('#right-top'))
        query_list.push(box.$el.querySelector('#right-bottom'))
        query_list.push(box.$el.querySelector('#bbox'))
        if (query_list.indexOf(target) >= 0) {
          select_flag = false

          this.currentBbox = box
          this.currentBbox.setSelectedFlag(true)

          if (target === box.$el.querySelector('#left-top')) {
            this.boxEventType = boxEvent['rescale-left-top']
            this.currentBbox.setScaleInitCoordinate()
          } else if (target === box.$el.querySelector('#left-bottom')) {
            this.boxEventType = boxEvent['rescale-left-bottom']
            this.currentBbox.setScaleInitCoordinate()
          } else if (target === box.$el.querySelector('#right-top')) {
            this.boxEventType = boxEvent['rescale-right-top']
            this.currentBbox.setScaleInitCoordinate()
          } else if (target === box.$el.querySelector('#right-bottom')) {
            this.boxEventType = boxEvent['rescale-right-bottom']
            this.currentBbox.setScaleInitCoordinate()
          } else {
            this.currentBbox.setMoveInitCoordinate(x - box.x, y - box.y)
            this.boxEventType = boxEvent['move']
          }
        } else {
          box.setSelectedFlag(false)
        }
      }
      if (select_flag) {
        this.boxList.push(0)
        this.boxEventType = boxEvent['create']
      }
    },
    onMouseUp: function (event) {
      this.mouseDownFlag = false
      if(this.currentBbox) {
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
        if (this.boxEventType === boxEvent['create']) {
          this.currentBbox.createdScalingBox(x, y)
        } else if (this.boxEventType === boxEvent['move']) {
          this.currentBbox.moveBox(x, y, event.target)
        } else if (this.boxEventType === boxEvent['rescale-left-top']) {
          this.currentBbox.scaleByLeftTop(x, y)
        } else if (this.boxEventType === boxEvent['rescale-left-bottom']) {
          this.currentBbox.scaleByLeftBottom(x, y)
        } else if (this.boxEventType === boxEvent['rescale-right-top']) {
          this.currentBbox.scaleByRightTop(x, y)
        } else if (this.boxEventType === boxEvent['rescale-right-bottom']) {
          this.currentBbox.scaleByRightBottom(x, y)
        } else {
        
        }
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
    #inner-canvas {
      width: calc(100% - 100px);
      height: calc(100% - 100px);
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
  }
</style>
