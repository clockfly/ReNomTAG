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
    props: ['aspectRatio', 'bbox'],
    data: function () {
      return {}
    },
    methods: {},
    computed: {
      top () {
        return String(this.bbox['bndbox']['ymin'] * this.aspectRatio) + 'px'
      },
      left () {
        return String(this.bbox['bndbox']['xmin'] * this.aspectRatio) + 'px'
      },
      width () {
        return String((this.bbox['bndbox']['xmax'] - this.bbox['bndbox']['xmin']) * this.aspectRatio) + 'px'
      },
      height () {
        return String((this.bbox['bndbox']['ymax'] - this.bbox['bndbox']['ymin']) * this.aspectRatio) + 'px'
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
