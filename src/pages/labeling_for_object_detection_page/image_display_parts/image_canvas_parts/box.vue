<template>
  <div id='bbox'
    v-bind:style='{top: y+"%", left: x+"%", width: w+"%", height: h+"%"}'>
    <div id='left-top' class='small-box'
      v-bind:style='{top: y+"%", left: x-5+"%"}'></div>
    <div id='left-bottom' class='small-box'
      v-bind:style='{top: y+"%", left: x+"%"}'></div>
    <div id='right-top' class='small-box'
      v-bind:style='{top: y+"%", left: x+"%"}'></div>
    <div id='right-bottom' class='small-box'
      v-bind:style='{top: y+"%", left: x+"%"}'></div>
  </div>
</template>

<script>

  export default {
    name: 'Bbox',
    data () {
      return {
        initialX:0,
        initialY:0,
        x:0,
        y:0,
        w:0,
        h:0
      }
    },
    methods: {
      handleClickEvent: function (x, y, target) {
        if (target === document.getElementById('left-top')){

        } else if (target === document.getElementById('left-bottom')){

        } else if (target === document.getElementById('right-top')){

        } else if (target === document.getElementById('right-bottom')){

        } else {
          let px, py, pw, ph
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
        }
      },
      initializeBox: function (x, y) {
        this.initialX = x
        this.initialY = y
        this.x = x
        this.y = y
      },
      isBoxCreated: function () {
        if ( this.w != 0 || this.h != 0 ){
          return true
        } else {
          return false
        }
      }
    }
  }

</script>

<style>

  #bbox {
    position: absolute;
    background-color: rgba(0, 0, 255, 0.5);
    .small-box {
      background-color: rgba(0, 0, 255, 0.8);
      width:10px;
      height: 10px;
    }
    z-index: 2;
  }

</style>
