<template>
  <div id="tagged-images">
    <div class="labelbox">
      <div class="label_text">Images<br />+Tags</div>


    </div><div v-for="image in tagged_images" :key="image.filename" class='tagged-image'
         :style="{'background-image': 'url('+image.image+')', width:imagewidth(image)+'px'}"
         :data-filename='image.filename'
         @click.stop.prevent='on_click'>

        <div v-for="(box, idx) in image.boxes" class='image-box' :key='idx'
           :style='boxstyles(image, box)'>
        <div class='taglabel'>{{box.label}}</div>

      </div>
    </div>

  </div>
</template>

<script>
import { mapState } from "vuex";

export const BLOCK_HEIGHT = 200;

export default {
  computed: {
    ...mapState(["tagged_images"])
  },

  methods: {
    ratio: function(image) {
      return BLOCK_HEIGHT / image.height;
    },

    imagewidth: function(image) {
      const ratio = this.ratio(image);
      return image.width * ratio;
    },
    boxstyles: function(image, box) {
      const ratio = this.ratio(image);
      return {
        left: `${box.left * ratio}px`,
        top: `${box.top * ratio}px`,
        width: `${(box.right - box.left) * ratio}px`,
        height: `${(box.bottom - box.top) * ratio}px`
      };
    },
    on_click: function(event) {
      const filename = event.currentTarget.dataset.filename;
      this.$store.dispatch("load_current_image", filename);
    }
  }
};
</script>

<style scoped lang='scss'>
#tagged-images {
  position: relative;
  box-sizing: border-box;
  background-color: #cccccc;
  white-space: nowrap;
  height: 125px;
  overflow: hidden;
  flex-wrap: wrap;

  .labelbox {
    position: relative;
    display: inline-block;
    line-height: normal;
    color: white;
    background-color: #1e264d;
    width: 125px;
    height: 125px;
    text-align: center;
  }
  .label_text {
    position: absolute;
    margin: auto;
    width: 125px;
    /*line-height: 50px;*/
    margin-top: 50px;
  }
  .tagged-image {
    box-sizing: border-box;
    position: relative;
    display: inline-block;
    height: 150px;
    background-size: cover;
    margin-top: 0px;
  }

  .image-box {
    position: absolute;
    border: solid 1px red;

    .taglabel {
      position: absolute;
      right: 0;
      top: 0;
      color: white;
      background-color: red;
      font-size: 10px;
    }
  }
}
</style>
