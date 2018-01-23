<template>

  <div class="recent-images-bbox"
       v-bind:style='{
             top: this.top,
             left: this.left,
             width: this.width,
             height: this.height
         }'>
    <div class="recent-images-bbox-inner">
      <span class="recent-images-bbox-name">{{ name }}</span>
    </div>
  </div>

</template>
<script>
  export default {
    name: 'RecentImagesBbox',
    props: ['rawImageSize', 'bbox'],
    data: function () {
      return {}
    },
    computed: {
      top () {
        let parentHeight = this.$parent.$el.clientHeight
        let ratio = parentHeight/this.rawImageSize[1]

        return String(this.bbox['bndbox']['ymin'] * ratio) + 'px'
      },
      left () {
        let parentWidth = this.$parent.$el.clientWidth
        let ratio = parentWidth/this.rawImageSize[0]

        return String(this.bbox['bndbox']['xmin'] * ratio) + 'px'
      },
      width () {
        let parentWidth = this.$parent.$el.clientWidth
        let ratio = parentWidth/this.rawImageSize[0]

        return String((this.bbox['bndbox']['xmax'] - this.bbox['bndbox']['xmin']) * ratio) + 'px'
      },
      height () {
        let parentHeight = this.$parent.$el.clientHeight
        let ratio = parentHeight/this.rawImageSize[1]
        return String((this.bbox['bndbox']['ymax'] - this.bbox['bndbox']['ymin']) * ratio) + 'px'
      },
      name () {
        return this.bbox['name']
      }
    },
    created: function () {
    }
  }
</script>

<style lang='scss'>

  .recent-images-bbox {
    position: absolute;
    border: 2px solid red;
    box-sizing: border-box;

    .recent-images-bbox-inner {
      position: relative;

      .recent-images-bbox-name {
        position: absolute;
        top: 0;
        right: 0;
        background-color: red;
        color: #fff;
        text-align: center;
        padding: 1px 2px;
        font-size: 10px;
      }
    }
  }


</style>
