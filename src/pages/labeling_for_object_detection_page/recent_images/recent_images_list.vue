<template>
  <div id='recent-image'>
    <div id='inner-recent-image'>
      <div class='recent-image-header'>
        <span>Recent Labeled Images</span>
      </div>

      <ul id='recent-images-list'>

        <recentImagesListItem
          v-for='(img_src, index) in recent_raw_images'
          :img_src="img_src"
          :parent_height="parentHeight"
          :file_name="recent_images_file_name(index)"
          :key="img_src"
        >
        </recentImagesListItem>
      </ul>
    </div>
  </div>
</template>

<script>
  import RecentImagesListItem from './recent_images_list_item.vue'
  export default {
    name: 'RecentImageList',
    components: {
      'recentImagesListItem': RecentImagesListItem
    },
    data: function () {
      return {
        labeledImageList: []
      }
    },
    methods: {
      load_recent_raw_images: function () {
        let self = this
        this.$store.dispatch('load_recent_images', {
          file_indices: self.recent_labeled_images_id_arr
        })
      },
      load_raw_img: function (index) {
        this.$store.dispatch('load_raw_img', {index: index})
      },
      recent_images_file_name (index) {
        let file_path = this.filename_list[this.recent_labeled_images_id_arr[index]]
        let file_split = file_path.split('/')

        return file_split[file_split.length - 1].split('.')[0]
      }
    },
    computed: {
      filename_list: function () {
        return this.$store.getters.get_filename_list
      },
      recent_labeled_images_id_arr: function () {
        return this.$store.getters.get_recent_labeled_images_id_arr
      },
      recent_raw_images: function () {
        return this.$store.getters.get_recent_raw_images
      },
      parentHeight () {
        return document.getElementById('recent-images-list').clientHeight
      }
    }
  }
</script>

<style lang='scss'>

  #recent-image {
    width: calc(100% - 260px);
    height: 100%;

    #inner-recent-image {
      height: 100%;
      box-sizing: border-box;
      border: solid 1px #a3a3a3;

      .recent-image-header {
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

      #recent-images-list {
        height: calc(100% - 30px);
        width: 100%;
        display: flex;
        justify-content: flex-start;
        overflow-x: scroll;
        overflow-y: hidden;
        margin: 0;
        padding: 0;

      }
    }
  }

</style>
