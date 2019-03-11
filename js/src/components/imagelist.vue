<template>
  <div id="imagelistblock">
    <div class="title">
      <div class="title-text row">
        <span class="col-md-8 text">Images</span>
        <span v-if='folder && (file_list.length !== 0)' class="col number">{{$store.state.files.length}}</span>
        <span v-else class="col number">0</span>
      </div>
    </div>
    <div class="content">
      <div class="row clear-margin first-row">
        <div class="col-md-4 fillter-button left">
          <div :class='[{"image_pred_tagbutton_active" : is_selected_filter("All")} ,
            {"off" : !is_selected_filter("All")}]'
              @click='set_filter("All")'>
              ALL
          </div>
        </div>
        <div class="col-md-8 fillter-button right">
          <div :class='[{"image_pred_tagbutton_active": is_selected_filter("NeedReview")},
            { "off" : !is_selected_filter("NeedReview")}]' @click='set_filter("NeedReview")'>
            <img v-if='is_selected_filter("NeedReview")' class="button-icon" :src="NO_REVIEW">
            <img v-else class="button-icon" :src="NO_REVIEW_OFF"> Need Review
          </div>
        </div>
      </div>
      <div class="row clear-margin first-row">
        <div class="col fillter-button Notags-fillter">
          <div :class='[{"image_pred_tagbutton_active" : is_selected_filter("NoTags")} ,
            { "off" : !is_selected_filter("NoTags")}]'
              @click='set_filter("NoTags")'>
              No Tags
          </div>
        </div>
        <div class="col fillter-button OK-fillter">
          <div :class='[{"image_pred_tagbutton_active": is_selected_filter("CHECK_OK") },
            { "off" : !is_selected_filter("CHECK_OK")}]'
            @click='set_filter("CHECK_OK")'>
            <img v-if="is_selected_filter('CHECK_OK')" class="button-icon" :src="CHECK_OK">
            <img v-else class="button-icon" :src="CHECK_OK_OFF"> OK
          </div>
        </div>
        <div class="col fillter-button NG-fillter">
          <div :class='[{"image_pred_tagbutton_active": is_selected_filter("CHECK_NG")},
            { "off" : !is_selected_filter("CHECK_NG")}]'
            @click='set_filter("CHECK_NG")'>
            <img v-if="is_selected_filter('CHECK_NG')" class="ng-button-icon" :src="CHECK_NG">
            <img v-else class="ng-button-icon" :src="CHECK_NG_OFF"> NG
          </div>
        </div>
      </div>
    </div>
    <div id="imagelist" @scroll="on_scroll">
      <div v-for="file in file_list_top" :key="file">
        <div style="position:relative">
          <span class="img-status-wrapper">
            <img v-if="!is_notags(file)">
            <img v-else-if="is_need_review(file)" class="img-status" :src="STATUS_NEED_REVIEW">
            <img v-else-if="is_review_result_ok(file) === true" class="img-status" :src="STATUS_CHECK_OK">
            <img v-else-if="is_review_result_ok(file) === false" class="img-status" :src="STATUS_CHECK_NG">
          </span>
          <img
            class="thumbnail"
           :src='get_image_url(file)'
           :data-file='file'
           :class='{selected: is_selected(file)}'
           @click.stop.prevent="select_image">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import * as utils from "@/utils";
import { has_bndbox, get_reviewresult } from "@/store/mutation";
export default {
  data: function() {
    return {
      IMAGE_RELOAD_MARGIN: 100,
      IMAGE_RELOAD_AMOUNT: 300,
      NO_REVIEW: require("../assets/images/Need_Review_ON.svg"),
      CHECK_OK: require("../assets/images/OK.svg"),
      CHECK_NG: require("../assets/images/NG.svg"),
      NO_REVIEW_OFF: require("../assets/images/Need_Review_Off.svg"),
      CHECK_OK_OFF: require("../assets/images/OK_hover.svg"),
      CHECK_NG_OFF: require("../assets/images/NG_hover.svg"),
      STATUS_NEED_REVIEW: require("../assets/images/Need_Review_icon.svg"),
      STATUS_CHECK_OK: require("../assets/images/P_OK.svg"),
      STATUS_CHECK_NG: require("../assets/images/P_NG.svg")
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
      "review_filter",
      "filter_method"
    ]),

    file_list_top: function() {
      if (!this.files) {
        return [];
      }
      return this.files.slice(0, this.filename_max_display);
    },

    file_list: function() {
      let keys = Object.keys(this.files).sort((l, r) => l - r);
      let ret = [];
      keys.forEach(k => ret.push(this.files[k]));
      this.$store.commit("set_image_list", ret);
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
    ...mapMutations(["set_main_menu_visible"]),
    is_selected_filter: function(filter_name) {
      if (this.filter_method === filter_name) {
        return true;
      }
      return false;
    },
    set_filter: function(filter_name) {
      this.$store.commit("set_active_image", { file: null });
      this.$store.commit("set_filter", filter_name);
    },
    is_review_result_ok(file) {
      const info = this.folder_files[file];
      const review = get_reviewresult(info);
      if (review === "ng") {
        return false;
      }
      return true;
    },
    is_need_review: function(file) {
      const info = this.folder_files[file];
      const review = get_reviewresult(info);
      if (review === "notreviewed") {
        return true;
      }
      return false;
    },
    is_notags(file) {
      const info = this.folder_files[file];
      const review = has_bndbox(info);
      return review;
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
        let loaded_img = this.$el.querySelectorAll(`#imagelist img.thumbnail`);
        if (loaded_img[n] !== null) {
          let img = loaded_img[n];

          let imgrc = img.getBoundingClientRect();
          let wrapper = this.$el.querySelector(`#imagelist`);
          let wrapperrc = wrapper.getBoundingClientRect();

          if (imgrc.top <= wrapperrc.top) {
            this.$store.commit("set_filename_max_display", {
              max_display: this.filename_max_display + this.IMAGE_RELOAD_AMOUNT
            });
          }
        } else if (loaded_img[n] === null) {
        }
      }
    }
  }
};
</script>

<style scoped lang='scss'>
#imagelistblock {
  width: 330px;
  //box-sizing: border-box;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  padding-left: $content-top-heder-horizonral-margin;
  padding-right: $content-top-heder-horizonral-margin;
  font-family: $content-top-header-font-family;
  margin-top: $component-margin-top;
}
.title {
  background: $content-header-color;
  height: calc(#{$panel-height} - 7px);
  .title-text {
    padding: 0;
    font-size: $content-top-header-font-size;
    line-height: calc(#{$panel-height} - 7px);
    padding-left: $content-top-heder-horizonral-margin;
    color: $font-color;
  }
}

.no-icon {
  padding-left: calc(21.97px + 5px);
}

.button-icon {
  height: calc(15px * 0.8);
  padding-left: 2px;
}

.ng-button-icon {
  height: calc(15px * 0.75);
  padding-left: 5px;
  margin-bottom: 2px;
}

.image_pred_tagbutton_active {
  background-color: $panel-bg-color;
  color: $font-color;
  height: calc(#{$content-top-header-hight} - 12px);
  line-height: calc(#{$content-top-header-hight} - 12px);
}
.image_pred_reviewbutton_active {
  background-color: $panel-bg-color;
  color: $font-color;
  height: calc(#{$content-top-header-hight} - 12px);
  line-height: calc(#{$content-top-header-hight} - 12px);
}

.clear-margin {
  margin-right: 0;
  margin-left: 0;
  height: 20px;
}
.first-row {
  margin-top: 10px;
}

.not-first {
  margin-top: 5px;
}

.fillter-button {
  color: black;
  height: 20px;
  text-align: center;
  cursor: pointer;
  font-family: $content-top-header-font-family;
  font-size: calc(#{$content-inner-header-font-size} - 2pt);
}

.number {
  font-size: calc(#{$content-inner-header-font-size} - 3pt);
  margin-top: calc((#{$content-inner-header-font-size} - 2pt) * 0.15);
}

.off {
  height: calc(#{$content-top-header-hight} - 12px);
  line-height: calc(#{$content-top-header-hight} - 12px);
  color: black;
  background: #fff;
  &:hover {
    background: #cccccc;
  }
}

.left {
  padding: 0;
  padding-right: 2.5px;
}

.right {
  padding: 0;
  padding-left: 2.5px;
}

.Notags-fillter {
  padding: 0;
  padding-right: 2.5px;
}
.OK-fillter {
  padding: 0;
  padding-left: 2.5px;
  padding-right: 2.5px;
}

.NG-fillter {
  padding: 0;
  padding-left: 2.5px;
}

.dot-ok {
  color: $tooltips-color;
}

.dot-ng {
  color: #dc3545;
}

#imagelist {
  display: flex;
  padding-right: 6px;
  flex-wrap: wrap;
  overflow: auto;
  box-sizing: border-box;
  height: calc(
    100% - #{$component-margin-top} - (#{$content-top-margin} * 3) - #{$content-top-header-hight} -
      (calc(#{$content-top-header-hight} -2px) * 2)
  );
  margin-top: calc(#{$content-top-margin} * 2);
  align-content: flex-start;
  justify-content: space-evenly;
  background: #fff;

  .thumbnail {
    cursor: pointer;
  }

  img {
    box-sizing: border-box;
    align-self: baseline;
    margin: 1px;
    flex-grow: 0;
    flex-shrink: 0;

    &.selected {
      box-sizing: border-box;
      outline: 2px solid #ee7b33;
      outline-offset: -2px;
    }
  }
  .img-status {
    position: absolute;
    left: -3px;
    top: 1px;
    margin: 0;
    padding: 0;
    height: 18px;
  }
}

@function calc_button_size($base_size, $adjustment_size) {
  @return calc($base_size - $adjustment_size);
}
</style>
