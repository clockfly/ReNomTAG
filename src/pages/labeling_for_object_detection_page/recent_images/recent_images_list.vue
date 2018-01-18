<template>
  <div id='recent-image'>
    <div id='inner-recent-image'>

      <div class="recent-images-text">
        <div class="recent-images-inner-text">
          <p>Labeled</p>
          <p>Images</p>
        </div>
      </div>
      <ul id='recent-images-list'>

        <recentImagesListItem
          v-for='(img_src, index) in recent_raw_images'
          :img_src="img_src"
          :parent_height="parentHeight"
          :file_path="recent_labeled_file_paths[index]"
          :key="img_src"
          :index="recent_labeled_file_paths[index]"
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
          file_paths: self.recent_labeled_img_paths
        })
      },
      load_raw_img: function (index) {
        this.$store.dispatch('load_raw_img', {
          filename_list: this.filename_list,
          index: index
        })
      },
      recent_images_file_name (index) {
        let file_path = this.filename_list[this.recent_labeled_images_id_arr[index]]
        let file_split = file_path.split('/')

        return file_split[file_split.length - 1].split('.')[0]
      },
    },
    computed: {
      filename_list: function () {
        return this.$store.getters.get_filename_list
      },
      recent_labeled_file_paths: function () {
        return this.$store.getters.get_recent_labeled_file_paths
      },
      recent_raw_images: function () {
        return this.$store.getters.get_recent_raw_images
      },
      parentHeight () {
        return document.getElementById('recent-images-list').clientHeight
      },
      current_file_name () {
        return this.$store.getters.get_current_file_name
      }
    }
  }
</script>

<style lang='scss'>

  #recent-image {
    /*width: calc(100% - 270px);*/
    width: 100%;
    height: 100%;

    #inner-recent-image {
      height: 100%;
      box-sizing: border-box;
      background-color: #cccccc;
      display: flex;

      .recent-images-text {

        color: #fff;
        background-color: #2d3e50;
        height: 100%;
        padding: 0 20px 0 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        p {
          margin: 0;
        }

      }

      #recent-images-list {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;

        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        font-size: 0;
        &::-webkit-scrollbar {
          display: none;
        }

      }
    }
  }

</style>
