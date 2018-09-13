<template>
  <div id="imagelistblock">
    <div v-if='(this.folder.length != 0) && (file_list.length === 0)' id=msg_no_image>
      {{loading_message}}
    </div>
    <div class="title">
      <div class="title-text">
        Images
      </div>
    </div>
    <div class="content">
      <div class="row clear-margin">
        <div class="col fillter-button left">
          <div :class='["image_pred_button", is_tag_selected("hastags")]' @click='toggle_tag_filter({filter:"hastags"})'>has tags</div>
        </div>  
        <div class="col fillter-button right">
         <div :class='["image_pred_button",  is_tag_selected("notags")]' @click='toggle_tag_filter({filter:"notags"})'>no tags</div>
        </div>
        
      </div>
      <div class="row clear-margin">
        <div class="col fillter-button left">
          <div :class='["image_pred_button", is_review_selected("ok")]' @click='toggle_review_filter({filter:"ok"})'>ok</div>
        </div>
        <div class="col fillter-button right">
          <div :class='["image_pred_button", is_review_selected("ng")]' @click='toggle_review_filter({filter:"ng"})'>ng</div>
        </div>
      </div>
      <div class="row clear-margin">
        <div class="col fillter-button left">
          <div :class='["image_pred_button", is_review_selected("notreviewed")]' @click='toggle_review_filter({filter:"notreviewed"})'>not reviewed yet</div>
        </div>
        <div class="col fillter-button right">
          <div class="revised" @click='toggle_review_filter({filter:"notreviewed"})'>Revised</div>
        </div>
      </div>
    </div>
    <div id="imagelist" @scroll="on_scroll">
      <div v-for="file in file_list_top" :key="file">
        <div style="position:relative">
          <img
           :src='get_image_url(file)'
           :data-file='file'
           :class='{selected: is_selected(file)}'
           @click.stop.prevent="select_image">
          <span style="position:absolute;right:0;bottom:0; color:yellow">{{get_marks(file)}}</span>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import * as utils from "@/utils";
import { has_bndbox, get_reviewresult } from "@/store/mutation"
export default {
  data: function() {
    return {
      IMAGE_RELOAD_MARGIN: 100,
      IMAGE_RELOAD_AMOUNT: 300
    };
  },
  computed: {
    ...mapState([
      "folder",
      "folder_list",
      "loading_message",
      "folder_files",
      "files",
      "filename_max_display",
      "active_image_filename",
      "tag_filter",
      "review_filter"
    ]),

    file_list_top: function() {
      if (!this.files) {
        return [];
      }
      return this.files.slice(0, this.filename_max_display)
    },

    file_list: function() {
      let keys = Object.keys(this.files).sort((l, r) => l - r);
      let ret = [];
      keys.forEach(k => ret.push(this.files[k]));
      return ret;
    }
  },
  watch: {
    active_image_filename: function(newvalue, oldvalue) {
      let n = this.files.indexOf(newvalue);
      if (n === -1) {
        return;
      }
      let img = this.$el.querySelector(`#imagelist img:nth-child(${n + 1})`);
      if (!img) {
        return;
      }
      let imgrc = img.getBoundingClientRect();
      let wrapper = this.$el.querySelector(`#imagelist`);
      let wrapperrc = wrapper.getBoundingClientRect();

      if (imgrc.bottom >= wrapperrc.bottom) {
        let dy = imgrc.bottom - wrapperrc.bottom;

        wrapper.scrollBy(0, dy + wrapperrc.height / 4);
      } else if (imgrc.top < wrapperrc.top) {
        let dy = imgrc.top - wrapperrc.top - wrapperrc.height / 4;
        wrapper.scrollBy(0, dy);
      }
    }
  },
  methods: {
    ...mapMutations(['set_main_menu_visible', 'toggle_tag_filter', 'toggle_review_filter']),

    is_tag_selected: function(name) {
      if (this.tag_filter.indexOf(name) != -1) {
        return 'image_pred_tagbutton_active'
      }
      return null
    },
    is_review_selected: function(name) {
      if (this.review_filter.indexOf(name) != -1) {
        return 'image_pred_reviewbutton_active'
      }
      return null
    },
    toggleMenuVisible: function() {
      let cur = this.$store.state.main_menu_visible;
      this.set_main_menu_visible({ visible: !cur })
    },
    get_marks(file) {
      const info = this.folder_files[file]
      let s = ''
      const review = get_reviewresult(info)
      if (review === 'ng') {
        s = s + '👎 '
      }
      return s
    },
    get_image_url(file) {
      return utils.build_api_url("/t/" + this.folder + "/" + file);
    },
    is_selected(filename) {
      return filename === this.active_image_filename;
    },
    select_image(event) {
      if (event.target.dataset.file !== this.active_image_filename) {
        this.$store.dispatch("load_current_image", event.target.dataset.file);
      }
    },
    on_scroll: function(event) {
      if (this.filename_max_display < this.files.length) {
        let n = this.filename_max_display - this.IMAGE_RELOAD_MARGIN;
        if (n <= 0) {
          n = 1;
        }
        let img = this.$el.querySelector(`#imagelist img:nth-child(${n})`);
        if (img === null) {
          return;
        }

        let imgrc = img.getBoundingClientRect();
        let wrapper = this.$el.querySelector(`#imagelist`);
        let wrapperrc = wrapper.getBoundingClientRect();

        if (imgrc.top <= wrapperrc.top) {
          this.$store.commit("set_filename_max_display", {
            max_display: this.filename_max_display + this.IMAGE_RELOAD_AMOUNT
          });
        }
      }
    }
  }
};
</script>

<style scoped lang='scss'>
#imagelistblock {
  width: 270px;
  //box-sizing: border-box;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  padding-left: $content-top-heder-horizonral-margin;
  font-family: $content-top-header-font-family;
  margin-top: $component-margin-top;
}

#msg_no_image {
  position: absolute;
  font-weight: bold;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 200px;
  height: 100px;
  margin: auto;
}

.title {
  background: $content-header-color;
  height: $content-top-header-hight;
  .title-text {
    font-size: $content-top-header-font-size;
    line-height: $content-top-header-hight;
    margin-left: $content-top-heder-horizonral-margin;
  }
}
.image_pred_tagbutton_active {
  background-color: red;
}
.image_pred_reviewbutton_active {
  background-color: green;
}

.clear-margin {
  margin-right: 0;
  margin-left: 0;
}
.fillter-button {
  margin-top: $content-top-margin;
  height: calc(#{$content-top-header-hight} -2px);
  text-align: center;
  cursor: pointer;
}

.revised {
  height: calc(#{$content-top-header-hight} -2px);
  line-height: calc(#{$content-top-header-hight} -2px);
  color: black;
}

.left {
  padding-right: 5px;
}
.right {
  padding-left: 5px;
}

#imagelist {
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  box-sizing: border-box;
  height: calc(100% - #{$component-margin-top} - (#{$content-top-margin} * 6) - #{$content-top-header-hight} - (calc(#{$content-top-header-hight} -2px) * 2 ) );
  margin-top: calc(#{$content-top-margin} * 2);
  align-content: flex-start;
  justify-content: space-evenly;

  img {
    box-sizing: border-box;
    align-self: baseline;
    margin: 1px;
    flex-grow: 0;
    flex-shrink: 0;

    &.selected {
      box-sizing: border-box;
      outline: 4px solid #e73;
      outline-offset: -4px;
    }
  }

}
</style>
