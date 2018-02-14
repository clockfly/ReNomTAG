<template>
  <div id='left-sidebar'>
    <div class="file-list-header">Images</div>
    <div id='file-list-wrapper' @scroll="on_scroll">
      <div id="file-list-inner">
        <img class="file-item" v-for='idx in filename_max_display'
            :key='filename_list[idx-1]' @click="click_action(filename_list[idx-1])"
            :class="{selected: current_file_path === filename_list[idx-1]}" :src="'./t/'+filename_list[idx-1]">
      </div>
    </div>
  </div>
</template>
<script>
  import { mapState } from 'vuex'

  export default {
    name: 'ImageList',
    data: () => ({}),
    created(){
      this.$store.dispatch('load_filename_list')
    },
    computed: mapState({
      filename_list: 'filename_list',
      current_file_path: 'current_file_path',
      filename_max_display: function (state) {
        let ret = state.filename_max_display
        if (ret >= this.filename_list.length) {
          ret = this.filename_list.length
        }
        return ret
      }
    }),
    watch: {
      current_file_path: function(newvalue, oldvalue) {
        let n = this.filename_list.indexOf(newvalue)
        if (n == -1) {
          return
        }
        let img = this.$el.querySelector(
            `#file-list-inner img:nth-child(${n+1})`);
        if (img === null) {
          return
        }
        let imgrc = img.getBoundingClientRect()

        let wrapper = this.$el.querySelector(
          `#file-list-wrapper`);
        let wrapperrc = wrapper.getBoundingClientRect()
        if (imgrc.bottom >=  wrapperrc.bottom) {
          let dy = imgrc.bottom - wrapperrc.bottom

          wrapper.scrollBy(0, dy+(wrapperrc.height / 4))
        }
        else if (imgrc.top <  wrapperrc.top) {
          let dy = imgrc.top - wrapperrc.top- (wrapperrc.height / 4)
          wrapper.scrollBy(0, dy)
        }
      }
    },
    methods: {
      click_action: function(filename) {
        this.$store.dispatch('load_raw_img_from_path', 
          {file_path: filename})
      },
      on_scroll: function(event) {
        let MARGIN = 50
        if (this.filename_max_display < this.filename_list.length) {
          let n = this.filename_max_display - MARGIN
          if (n <= 0) {
            n = 1
          }
          let img = this.$el.querySelector(
             `#file-list-inner img:nth-child(${n})`);
          if (img === null) {
            return
          }

          let imgrc = img.getBoundingClientRect()
          let wrapper = this.$el.querySelector(
            `#file-list-wrapper`);
          let wrapperrc = wrapper.getBoundingClientRect()

          if (imgrc.top <  wrapperrc.top) {
            this.$store.commit("set_filename_max_display",
              {filename_max_display: this.filename_max_display +100})
          }
        }
      }
    },
  }
</script>

<style lang='scss'>

  #left-sidebar {
    width: 350px;
    padding: 0 5px;
    border-right: 1px solid #666666;
      background-color: #f4f4f2;

    .file-list-header {
      font-size: 18px;
      font-weight: bold;
      width: 350px;
      margin: 0 auto;
      padding: 20px 0 5px 0;

    }
    #file-list-wrapper {
      background-color: #f4f4f2;
      height: calc(100% - 70px);
      overflow: auto;
      width: 350px;
      margin: 0 auto;
      #file-list-inner {

        width: 330px;
        height: auto;
        overflow: auto;



        line-height: 0;
 
        margin: 0;

        display: flex;
        flex-wrap: wrap;
       
        .file-item {
          display: block;
          align-self: flex-end;
          background: #FEFEFE;
          margin: 1px;
          box-sizing: border-box;
          &.selected {
            background: #2d3e50;
            color: #fff;
            outline:2px ridge red;
          }
          &:hover {
            cursor: pointer;
          }
        }
      }
    }

    #select_page_step {
      width: 100%;
      padding-top: 0;
      padding-bottom: 0;
      margin: 0 0 5px 0;
    }

    #file-list-page-nation {
      list-style: none;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0;
      height: 10%;

      li {
        padding: 2px 0;
        width: 20px;
        text-align: center;
        border: 1px solid #0c0c0c;
        box-sizing: border-box;
        margin: 0 4px;
        transition: 150ms;

        &.active {
          background: #2d3e50;
          color: #fff;
        }
        &:hover {
          cursor: pointer;
          background: #2d3e50;
          color: #fff;
        }
        &.arrow {
          letter-spacing: -1px;
        }
      }
    }
  }

</style>
