<template>
  <div id='image-canvas'
       tabindex='0'
       @mousemove='onMouseMove'
       @mouseup='onMouseUp'
       @keydown='onAnyKeyDown'
       @keyup='onAnyKeyUp'
       @keyup.delete='onKeyDelete'>

    <div id='inner-canvas'>
      <div id='mask'
           @mousedown='onMouseDown'
           @mouseup='onMouseUp'
           v-bind:style='{"background-image": "url("+current_raw_img_src+")",
                        "height": padTop+"%",
                        "width": padLeft+"%"
           }'
           v-show='showFlag'
           @click='add_recent_labeled_images_id(current_file_index)'>

        <box v-for='(box_id, index) in boxIdList' :key='box_id' :box_id='box_id'></box>
      </div>
    </div>

  </div>
</template>

<script>
  import Bbox from './image_canvas_parts/box.vue'

  let boxEvent = {
    "create": 0,
    "move": 1,
    "rescale-left-top": 2,
    "rescale-left-bottom": 3,
    "rescale-right-top": 4,
    "rescale-right-bottom": 5
  }

  export default {
    name: 'ImageCanvas',
    components: {
      'box': Bbox,
      'labelList': []
    },
    data () {
      return {
        boxIdList: [],
        boxId: 0,
        mouseDownFlag: false,
        currentBbox: null,
        boxEventType: null,
        imgSrc: '',
        imgWidth: 0,
        imgHeight: 0,
        padTop: 0,
        padLeft: 0,
        currentDownKey: '',
        showFlag: true // This is for transition images.
      }
    },
    watch: {
      // この関数は current_raw_img_src が変わるごとに実行されます。
      current_raw_img_src: function (newImg) {
        const self = this
        let img = new Image()
        let img_data
        // let img_data
        img.onload = function () {
          self.setImgSrc(img)
        }
        img_data = this.current_raw_img_src
        img.src = img_data
      }
    },
    created: function () {
      window.addEventListener('resize', this.onResizeWindow)
    },
    computed: {
      shortcut_label_dict () {
        return this.$store.getters.get_shortcut_label_dict
      },
      current_raw_img_src: function () {
        return 'data:image/png;base64,' + this.$store.getters.get_current_raw_img
      },
      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      },
      recent_labeled_images_id_arr: function () {
        return this.$store.getters.get_recent_labeled_images_id_arr
      },
      selected_box_id: function () {
        return this.$store.getters.get_selected_box_id
      }

    },
    methods: {
//      setLabelList (){
//        let tags = this.$store.getters.get_tag_list
//        let arr = []
//        let recursive = function (arr, nodes) {
//          for (let n of nodes) {
//            let key = n["shortcut"]
//            arr.push({key: [n['label'], n['id']]})
//            recursive(arr, n['nodes'])
//          }
//        }
//        recursive(arr, tags)
//        this.labelList = arr
//      },
      setShowFlag: function (flag) {
        this.showFlag = flag
      },
      setImgSrc: function (img) {
        this.imgSrc = img.src
        this.imgWidth = img.width
        this.imgHeight = img.height
        this.$store.dispatch('set_current_img_width_and_height', {
          img_width: img.width,
          img_height: img.height
        })

        this.onResizeWindow()
      },
      onResizeWindow: function () {
        let parentBox = document.getElementById('inner-canvas').getBoundingClientRect()
        let parentWidth = parentBox.width
        let parentHeight = parentBox.height
        let childAspectRatio = this.imgWidth / this.imgHeight
        let parentAspectRatio = parentWidth / parentHeight

        if (childAspectRatio < parentAspectRatio) {
          this.padTop = 100
          this.padLeft = 100 * this.imgWidth / parentWidth * parentHeight / this.imgHeight
        } else {
          this.padTop = 100 * this.imgHeight / parentHeight * parentWidth / this.imgWidth
          this.padLeft = 100
        }
      },
      onKeyDelete: function (event) {
        this.boxIdList.splice(this.boxIdList.indexOf(String(this.selected_box_id)), 1)
      },
      onMouseDown: function (event) {
        let [x, y] = this.transformCurrentCorrdinate(event)
        let select_flag = true
        let target = event.target

        this.mouseDownFlag = true
        this.currentBbox = null
        for (let box of this.$children) {
          let query_list = []
          query_list.push(box.$el.querySelector('.left-top'))
          query_list.push(box.$el.querySelector('.left-bottom'))
          query_list.push(box.$el.querySelector('.right-top'))
          query_list.push(box.$el.querySelector('.right-bottom'))
          query_list.push(box.$el.querySelector('.bbox'))
          if (query_list.indexOf(target) >= 0) {
            select_flag = false

            this.currentBbox = box
            this.currentBbox.setSelectedFlag(true)

            this.$store.dispatch('set_selected_box_id', {
              selected_box_id: box['box_id']
            })

            if (target === box.$el.querySelector('.left-top')) {
              this.boxEventType = boxEvent['rescale-left-top']
              this.currentBbox.setScaleInitCoordinate()
            } else if (target === box.$el.querySelector('.left-bottom')) {
              this.boxEventType = boxEvent['rescale-left-bottom']
              this.currentBbox.setScaleInitCoordinate()
            } else if (target === box.$el.querySelector('.right-top')) {
              this.boxEventType = boxEvent['rescale-right-top']
              this.currentBbox.setScaleInitCoordinate()
            } else if (target === box.$el.querySelector('.right-bottom')) {
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
          this.boxIdList.push(String(this.boxId))
          this.boxId += 1
          this.boxEventType = boxEvent['create']
        }
      },
      onMouseUp: function (event) {
        this.mouseDownFlag = false
        if (this.currentBbox) {
          this.currentBbox = null
        }

        this.updateBoxes()
      },
      onMouseMove: function (event) {
        if (!this.mouseDownFlag) return
        let [x, y] = this.transformCurrentCorrdinate(event)
        if (!this.currentBbox) {
          this.currentBbox = this.$children[this.boxIdList.length - 1]
          this.currentBbox.initializeBox(x, y)
        } else {
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
        let x = (event.pageX - rectX) / width * 100
        let y = (event.pageY - rectY) / height * 100
        return [x, y]
      },

      onAnyKeyDown: function (event) {
        let box = this.$el.querySelector('.selected')
        this.currentDownKey = event.key
        if (box) {
          let label = this.shortcut_label_dict[this.currentDownKey]

          if (label) {
            this.$children[this.selected_box_id]['object_name'] = label['label']
            this.updateBoxes()
          }
        }
      },
      onAnyKeyUp: function (event) {
        this.currentDownKey = ''
      },
      disabled: function () {
        return false
      },
      updateBoxes: function () {
        let objects = []
        for (let box of this.$children) {

          let o = {
            'object': {
              'name': box['object_name'],
              'pose': 'Unspecified',
              'truncated': 0,
              'difficult': 0,
              'bndbox': {
                'xmin': box['x'],
                'xmax': box['w'],
                'ymin': box['y'],
                'ymax': box['h']
              }
            }
          }
          objects.push(o)
        }

        this.$store.dispatch('update_current_label_objects', {
          label_objects: objects
        })
      },
      add_recent_labeled_images_id: function (add_file_index) {
        const self = this
        this.$store.dispatch('add_recent_labeled_images_id_arr', {
          add_file_index: add_file_index
        }).then(
          this.$store.dispatch('load_recent_images', {
            file_indices: self.$store.getters.get_recent_labeled_images_id_arr
          })
        )
      }
    },
  }
</script>

<style lang='scss'>
  #image-canvas {
    width: 100%;
    height: calc(100% - 40px);
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
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
      }
    }
  }
</style>
