<template>
  <div id='image-canvas'
       tabindex='0'
       @mousemove='onMouseMove'
       @keydown='onAnyKeyDown'
       @keyup='onAnyKeyUp'
       @keyup.delete='onKeyDelete'>

    <div id='inner-canvas'>
      <div id='mask'
           @mousedown='onMouseDown'
           @mouseup='onMouseUp'
           v-bind:style='{"background-image": "url("+current_raw_img_src+")",
                        "height": maskHeight+"%",
                        "width": maskWidth+"%"
           }'
           v-show='showFlag'>

        <box v-for='(bbox_id, index) in bbox_id_list'
             v-if="bbox_list.length > 0"

             :key='bbox_id'
             :box_id='bbox_id'
             :bndbox='bbox_list[index]["bndbox"]'
             :prop_name="bbox_list[index]['name']"

             :current_img_width="current_img_width"
             :current_img_height="current_img_height"
        ></box>
      </div>
    </div>
  </div>
</template>

<script>
  import Bbox from './image_canvas_parts/box.vue'
  import axios from 'axios'

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
        boxId: 0,
        mouseDownFlag: false,
        currentBbox: null,
        boxEventType: null,
        imgSrc: '',
        imgWidth: 0,
        imgHeight: 0,
        maskHeight: 0,
        maskWidth: 0,
        currentDownKey: '',
        showFlag: true, // This is for transition images.
        showLabelFlag: false,

        bbox_list: [],
        bbox_id_list: [],
        bbox_id_counter: 0
      }
    },
    watch: {
      // この関数は current_raw_img_src が変わるごとに実行されます。
      xml_file_path: function (newImg) {

        const self = this
        let img = new Image()
        let img_data
        // let img_data
        img.onload = function () {
          self.setImgSrc(img)
        }
        img_data = this.current_raw_img_src
        img.src = img_data

        this.loadBbox()
      }
    },
    created: function () {
      window.addEventListener('resize', this.onResizeWindow)
      this.updateBoxes()
    },
    computed: {
      label_candidates_dict () {
        return this.$store.getters.get_label_candidates_dict
      },
      current_raw_img_src: function () {
        return 'data:image/png;base64,' + this.$store.getters.get_current_raw_img
      },
      current_file_index: function () {
        return this.$store.getters.get_current_file_index
      },
      current_file_path (state) {
        return this.$store.getters.get_current_file_path
      },
      current_file_name: function () {
        return this.$store.getters.get_current_file_name
      },
      recent_labeled_images_file_paths: function () {
        return this.$store.getters.get_recent_labeled_file_paths
      },
      selected_box_id: function () {
        return this.$store.getters.get_selected_box_id
      },
      parentHeight: function () {
        return document.getElementById('mask').clientHeight
      },
      current_img_height: function () {
        return this.$store.getters.get_current_img_height
      },
      current_img_width: function () {
        return this.$store.getters.get_current_img_width
      },
      img_aspect_ratio: function () {
        return this.parentHeight / this.current_img_height
      },
      xml_file_path: function () {
        let file_name = this.$store.getters.get_current_file_name
        return 'xml/' + file_name.split('.')[0] + '.xml'
      },
      current_label_dict: function () {
        return this.$store.getters.get_current_label_dict
      },
      bbox_labeled_flag: function () {
        return this.$store.getters.get_bbox_labeled_flag
      }
    },
    methods: {
      setShowFlag: function (flag) {
        this.showFlag = flag
      },
      set_bbox_labeled_flag: function (flag) {
        this.$store.commit('set_bbox_labeled_flag', {
          flag: flag
        })
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
          this.maskHeight = 100
          this.maskWidth = 100 * this.imgWidth / parentWidth * parentHeight / this.imgHeight
        } else {
          this.maskHeight = 100 * this.imgHeight / parentHeight * parentWidth / this.imgWidth
          this.maskWidth = 100
        }
      },
      onKeyDelete: function (event) {

        let delete_index = this.bbox_id_list.indexOf(this.selected_box_id)

        this.$children.splice(delete_index, 1)
        this.bbox_id_list.splice(delete_index, 1)
        this.bbox_list.splice(delete_index, 1)

        this.updateBoxes()
        this.$store.commit('set_bbox_labeled_flag', {
          flag: true
        })
//         this.boxIdList.splice(this.boxIdList.indexOf(String(this.selected_box_id)), 1)
      },
      onMouseDown: function (event) {
        console.log('mouse down')

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

        if (!this.bbox_labeled_flag) {
          return
        }

        if (select_flag) {
          this.appendBbox(event)
          this.boxEventType = boxEvent['create']
        }
        this.add_recent_labeled_file_path(this.current_file_path)


        this.$store.commit('set_bbox_labeled_flag', {
          flag: false
        })


      },
      onMouseUp: function (event) {
        this.mouseDownFlag = false
        if (this.currentBbox) {
          this.currentBbox = null
        }
        this.updateBoxes()
      },
      onMouseMove: function (event) {
        console.log('move')
        if (!this.mouseDownFlag) return
        let [x, y] = this.transformCurrentCorrdinate(event)
        if (!this.currentBbox) {
          this.currentBbox = this.$children[this.bbox_list.length - 1]
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
        if (box && this.currentDownKey in this.label_candidates_dict) {
          let label = this.label_candidates_dict[this.currentDownKey]['label']
          let true_selected_box_id = this.bbox_id_list.indexOf(this.selected_box_id)

          this.$children[true_selected_box_id]['name'] = label

          this.$store.commit('set_bbox_labeled_flag', {
            flag: true
          })

          this.updateBoxes()
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

          let xmin = this.imgWidth * (box['x'] / 100.0)
          let xmax = this.imgWidth * ((box['x'] + box['w']) / 100.0)
          let ymin = this.imgHeight * (box['y'] / 100.0)
          let ymax = this.imgHeight * ((box['y'] + box['h']) / 100.0)

          let name = ''

          if (typeof box['name'] === 'undefined') {
            name = ''
          } else {
            name = box['name']
          }

          let o = {
            'object': {
              'name': name,
              'pose': 'Unspecified',
              'truncated': 0,
              'difficult': 0,
              'bndbox': {
                'xmin': xmin,
                'xmax': xmax,
                'ymin': ymin,
                'ymax': ymax
              }
            }
          }
          objects.push(o)
        }
        this.$store.commit('update_current_label_objects', {
          label_objects: objects
        })
      },
      add_recent_labeled_file_path: function (add_file_path) {
        let self = this
        this.$store.dispatch('add_recent_labeled_file_path', {
          add_file_path: add_file_path
        }).then(
          this.$store.dispatch('load_recent_images', {
            file_paths: self.$store.getters.get_recent_labeled_file_paths
          })
        )
      },
      appendBbox: function (event) {
        let object = {
          'object': {
            'bndbox': {
              'xmin': 0, 'xmax': 0, 'ymin': 0, 'ymax': 0
            },
            'name': '',
            'difficult': '',
            'pose': ''
          }
        }

        this.bbox_list.push(object)
        this.bbox_id_list.push(this.bbox_id_counter)
        this.bbox_id_counter++

      },
      loadBbox: function () {
        let self = this

        let fd = new FormData()
        fd.append('xml_file_path', this.xml_file_path)

        return axios.post('/api/get_bbox_list', fd).then(
          function (response) {
            if (response.data.json_data === '') {
              self.bbox_id_list = []
              self.bbox_list = []
              return
            }

            let temp_bbox_list = JSON.parse(response.data.json_data)['anotation']['object']

            self.bbox_id_list = []
            self.bbox_list = []

            if (typeof temp_bbox_list === 'undefined') {
              return
            }

            for (let n in temp_bbox_list) {
              self.bbox_id_list.push(self.bbox_id_counter)
              self.bbox_id_counter++
            }
            self.bbox_list = temp_bbox_list
          }
        )
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
