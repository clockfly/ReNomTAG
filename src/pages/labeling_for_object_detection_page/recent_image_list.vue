<template>
  <div id='recent-image-list'>
    <div id='inner-recent-image-list'>
      <div id='header'>
        <span>Recent Labeled Images</span>
      </div>
      <div id='image-list'>
        <!--<div v-for='im in labeledImageList' class='img-panel'>-->
        <!--<img :src='im'/>-->
        <!--</div>-->

        <!--{{im}}-->
        <img v-for='im in recent_raw_images' :src="'data:image/png;base64,' + im"/>

      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'RecentImageList',
    data: function () {
      return {
        labeledImageList: []
      }
    },
    methods: {
      load_recent_raw_images: function () {
        const self = this
        this.$store.dispatch('load_recent_images', {
          file_indices: self.recent_labeled_images_id_arr
        })
      }
    },
    computed: {
      recent_labeled_images_id_arr: function () {
        return this.$store.getters.get_recent_labeled_images_id_arr
      },
      recent_raw_images: function () {
        return this.$store.getters.get_recent_raw_images
      }
    },
  }
</script>

<style lang='scss'>

  #recent-image-list {
    width: calc(100% - 205px);
    height: 100%;
    #inner-recent-image-list {
      height: 100%;
      box-sizing: border-box;
      border: solid 1px #a3a3a3;

      #header {
        display: flex;
        height: 30px;
        width: 100%;
        background-color: #a3a3a3;
        align-items: center;
        tt {
          color: #3a3a3a;
          font-weight: bold;
        }
      }

      #image-list {
        height: calc(100% - 30px);
        width: 100%;
        display: flex;
        justify-content: flex-start;
        overflow-x: scroll;

        img {
          width: auto;
          height: 100%;
          object-fit: contain;
        }

      }
    }
  }

</style>
