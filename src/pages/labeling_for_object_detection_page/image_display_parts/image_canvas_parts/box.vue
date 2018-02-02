<template>
  <div class='outer-box'>
    <div class='bbox' v-bind:class='{selected: isSelected}'
         draggable='false'
         v-bind:style='{top: y+"%", left: x+"%", width: w+"%", height: h+"%"}'>
      <div class='left-top small-box'></div>
      <div class='left-bottom small-box'></div>
      <div class='right-top small-box'></div>
      <div class='right-bottom small-box'></div>
      <div class="object_name" v-if="name">{{ name }}</div>

      <!--<div class="not_labeled" v-else>
        <table class="bbox-label-list">
          <tr>
            <th>
              Label
            </th>
            <th>
              Shortcut
            </th>
          </tr>
          <tr class="bbox-list-item" v-for="key in Object.keys(label_candidates_dict)"
              :shortcut="key"
              :label="label_candidates_dict[key]['label']"
          >
            <td class="label-text">{{ label_candidates_dict[key]['label'] }}</td>
            <td class="label-shortcut">{{ key }}</td>
          </tr>
        </table>
      </div>-->

    </div>
  </div>
</template>

<script>
  export default {
    name: 'Bbox',
    data () {
      return {
        initialX: 0,
        initialY: 0,
        moveInitX: 0,
        moveInitY: 0,
        scaleInitX: 0,
        scaleInitY: 0,
        scaleInitW: 0,
        scaleInitH: 0,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        selectedFlag: false,
        name: ''
      }
    },
    computed: {
      isSelected: function () {
        return this.selectedFlag
      },
      label_candidates_dict () {
        return this.$store.getters.get_label_candidates_dict
      },
      bbox_labeled_flag () {
        return this.$store.getters.get_bbox_labeled_flag
      }

    },
    props: ['box_id', 'bndbox', 'current_img_width', 'current_img_height', 'prop_name'],

    methods: {
      scaleByLeftTop: function (x, y, dx = 0, dy = 0) {
        let px, py, pw, ph
        let scale_initial_x = this.scaleInitX + dx
        let scale_initial_y = this.scaleInitY + dy

        if (x < 0)
          x = 0
        if (y < 0)
          y = 0

        px = x
        py = y
        pw = this.scaleInitW + scale_initial_x - x
        ph = this.scaleInitH + scale_initial_y - y

        if (pw < 0) {
          this.scaleByRightTop(x, y, this.scaleInitW, dy)
        } else if (ph < 0) {
          this.scaleByLeftBottom(x, y, dx, this.scaleInitH)
        } else {
          this.x = px
          this.y = py
          this.w = pw
          this.h = ph
        }
      },
      scaleByLeftBottom: function (x, y, dx = 0, dy = 0) {
        let px, py, pw, ph
        let scale_initial_x = this.scaleInitX + dx
        let scale_initial_y = this.scaleInitY + dy

        if (x < 0)
          x = 0
        if (y >= 100)
          y = 100

        px = x
        py = scale_initial_y
        pw = this.scaleInitW + scale_initial_x - x
        ph = y - scale_initial_y

        if (pw < 0) {
          this.scaleByRightBottom(x, y, this.scaleInitW, dy)
        } else if (ph < 0) {
          this.scaleByLeftTop(x, y, dx, -this.scaleInitH)
        } else {
          this.x = px
          this.y = py
          this.w = pw
          this.h = ph
        }
      },
      scaleByRightTop: function (x, y, dx = 0, dy = 0) {
        let px, py, pw, ph
        let scale_initial_x = this.scaleInitX + dx
        let scale_initial_y = this.scaleInitY + dy

        if (x >= 100)
          x = 100
        if (y < 0)
          y = 0

        px = scale_initial_x
        py = y
        pw = x - scale_initial_x
        ph = this.scaleInitH + scale_initial_y - y

        if (pw < 0) {
          this.scaleByLeftTop(x, y, -this.scaleInitW, dy)
        } else if (ph < 0) {
          this.scaleByRightBottom(x, y, dx, this.scaleInitH)
        } else {
          this.x = px
          this.y = py
          this.w = pw
          this.h = ph
        }
      },
      scaleByRightBottom: function (x, y, dx = 0, dy = 0) {
        let px, py, pw, ph
        let scale_initial_x = this.scaleInitX + dx
        let scale_initial_y = this.scaleInitY + dy

        if (x >= 100)
          x = 100
        if (y >= 100)
          y = 100

        px = scale_initial_x
        py = scale_initial_y
        pw = x - scale_initial_x
        ph = y - scale_initial_y
        if (pw < 0) {
          this.scaleByLeftBottom(x, y, -this.scaleInitW, dy)
        } else if (ph < 0) {
          this.scaleByRightTop(x, y, dx, -this.scaleInitH)
        } else {
          this.x = px
          this.y = py
          this.w = pw
          this.h = ph
        }
      },
      createdScalingBox: function (x, y) {
        let px, py, pw, ph
        if (x < 0)
          x = 0
        if (y < 0)
          y = 0
        if (x >= 100)
          x = 100
        if (y >= 100)
          y = 100
        let initX = this.initialX
        let initY = this.initialY
        var moveX = x
        var moveY = y
        var w = (moveX - initX)
        var h = (moveY - initY)
        if (w >= 0) {
          px = initX
          pw = w
        } else {
          px = moveX
          pw = -w
        }
        if (h >= 0) {
          py = initY
          ph = h
        } else {
          py = moveY
          ph = -h
        }
        this.x = px
        this.y = py
        this.w = pw
        this.h = ph
      },
      moveBox: function (x, y) {
        // Touched corrdinate must be kept here.
        let px = x - this.moveInitX
        let py = y - this.moveInitY
        let pw = px + this.w
        let ph = py + this.h

        if (px < 0) px = 0
        if (py < 0) py = 0
        if (pw > 100) px = 100 - this.w
        if (ph > 100) py = 100 - this.h

        this.x = px
        this.y = py
      },
      initializeBox: function (x, y) {
        this.setSelectedFlag(true)
        this.initialX = x
        this.initialY = y
        this.x = x
        this.y = y
        this.$store.dispatch('set_selected_box_id', {
          selected_box_id: this.box_id
        })
      },
      isBoxCreated: function () {
        if (this.w !== 0 || this.h !== 0) {
          return true
        } else {
          return false
        }
      },
      setSelectedFlag: function (flag) {
        this.selectedFlag = flag
      },
      setMoveInitCoordinate: function (x, y) {
        this.moveInitX = x
        this.moveInitY = y
      },
      setScaleInitCoordinate: function () {
        this.scaleInitX = this.x
        this.scaleInitY = this.y
        this.scaleInitW = this.w
        this.scaleInitH = this.h
      },
      isLabeled: function () {
        let name = this.name
        if (name == null || name == 'None' || name == undefined || !name) {
          return false
        }
        return true
      }
    },

    created: function () {
      if (typeof this.bndbox === 'undefined') {
        this.name = ''
        return
      }
      let name = this.prop_name
      this.x = this.bndbox['xmin'] / this.current_img_width * 100
      this.y = this.bndbox['ymin'] / this.current_img_height * 100
      this.w = (this.bndbox['xmax'] - this.bndbox['xmin']) / this.current_img_width * 100
      this.h = (this.bndbox['ymax'] - this.bndbox['ymin']) / this.current_img_height * 100
      if (name == null || name == 'None' || name == undefined || !name) {
        name = ''
      }
      this.name = name
    },
    watch: {
      // この関数は current_raw_img_src が変わるごとに実行されます。
      name: function (newValue, oldValue) {
        if (oldValue === '' && newValue !== '') {
          this.$store.commit('set_bbox_labeled_flag', {
            flag: true
          })
        }
      }
    },
  }
</script>

<style lang='scss'>
  .outer-box {
    z-index: 5;
    .bbox {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.7);
      border: 3px solid rgba(115, 221, 0, 0.93);
      box-sizing: border-box;
      .small-box {
        position: absolute;
        background-color: rgba(0, 0, 255, 0);
        width: 14px;
        height: 14px;
      }
      .left-top {
        top: -7px;
        left: -7px;
      }
      .left-bottom {
        bottom: -7px;
        left: -7px;
      }
      .right-top {
        top: -7px;
        right: -7px;
        z-index: 4;
      }
      .right-bottom {
        bottom: -7px;
        right: -7px;
      }
      .object_name {
        position: absolute;
        right: 0;
        top: 0;
        color: #fff;
        font-size: 14px;
        padding: 0 2px 4px 5px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #73DD00;

        z-index: 3;
      }
      .not_labeled {
        position: absolute;
        right: -200px;
        top: 0;
        color: #000;

        .bbox-label-list {
          tr {
            padding: 0;
          }
          th, td {
            padding: 2px 5px;
          }
        }
      }
    }
    .selected {
      border: 3px solid red;
      .object_name {
        background: red;
      }
    }
  }
</style>
