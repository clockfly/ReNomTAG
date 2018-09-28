<template>
  <div id="imagelistblock">
    <div v-if='(this.folder.length != 0) && (file_list.length === 0)' id=msg_no_image>
      {{loading_message}}
    </div>
    <div class="title">
      <div class="title-text">
        Images (number)
      </div>
    </div>
    <div class="content">
      <div class="row clear-margin first-row">
        <div class="col-md-4 fillter-button left">
          <div :class='[{"image_pred_tagbutton_active" : is_tag_selected("hastags") !== null} ,
            {"off" : is_tag_selected("hastags") === null}]'
              @click='toggle_tag_filter({filter:"hastags"})'>
              <span class="no-icon">ALL</span>
          </div>
        </div>
        <div class="col-md-8 fillter-button right">
          <div :class='[{"image_pred_tagbutton_active": is_review_selected("notreviewed") !== null}, { "off" : is_review_selected("notreviewed") === null}]' @click='toggle_review_filter({filter:"notreviewed"})'>
            <img v-if="is_review_selected('notreviewed')" class="button-icon" :src="NO_REVIEW">
            <img v-else class="button-icon" :src="NO_REVIEW_OFF"> Need Review
            <span class="number"></span>
          </div>
        </div>
        
      </div>
      <div class="row clear-margin first-row">
        <div class="col fillter-button">
          <div :class='[{"image_pred_tagbutton_active" : is_tag_selected("hastags") !== null} ,
            {"off" : is_tag_selected("hastags") === null}]'
              @click='toggle_tag_filter({filter:"hastags"})'>
              <span class="no-icon">has tags</span>
          </div>
        </div>  
        <div class="col fillter-button">
          <div :class='[{"image_pred_tagbutton_active" : is_tag_selected("notags") !== null} ,
            { "off" : is_tag_selected("notags") === null}]'
              @click='toggle_tag_filter({filter:"notags"})'>
            <img v-if="is_tag_selected('notags')" class="button-icon" :src="NO_Tags">
            <img v-else class="button-icon" :src="NO_Tags_OFF"> No Tags
            <span class="number"></span>
          </div>
        </div>
        
      </div>
      <div class="row clear-margin first-row">
        <div class="col fillter-button left">
          <div :class='[{"image_pred_tagbutton_active": is_review_selected("ok") !==null },
            { "off" : is_review_selected("ok") === null}]' 
            @click='toggle_review_filter({filter:"ok"})'>
            <img v-if="is_review_selected('ok')" class="button-icon" :src="CHECK_OK">
            <img v-else class="button-icon" :src="CHECK_OK_OFF"> OK
            <span class="number"></span>
          </div>
      </div>
        <div class="col fillter-button right">
          <div :class='[{"image_pred_tagbutton_active": is_review_selected("ng") !==null},
            { "off" : is_review_selected("ng") === null}]'
            @click='toggle_review_filter({filter:"ng"})'>
            <img v-if="is_review_selected('ng')" class="ng-button-icon" :src="CHECK_NG">
            <img v-else class="ng-button-icon" :src="CHECK_NG_OFF"> NG
            <span class="number"></span>
          </div>
        </div>
      </div>
      <div class="row clear-margin first-row">
        <div class="col fillter-button left">
          <div :class='[{"image_pred_tagbutton_active": is_review_selected("notreviewed") !== null}, { "off" : is_review_selected("notreviewed") === null}]' @click='toggle_review_filter({filter:"notreviewed"})'>
            <img v-if="is_review_selected('notreviewed')" class="button-icon" :src="NO_REVIEW">
            <img v-else class="button-icon" :src="NO_REVIEW_OFF"> Need Review
            <span class="number"></span>
          </div>
        </div>
        <div class="col fillter-button right">
          <div :class='[{"image_pred_tagbutton_active": is_review_selected("notreviewed") !== null}, { "off" : is_review_selected("notreviewed") === null}]' @click='toggle_review_filter({filter:"notreviewed"})'>
            <img v-if="is_review_selected('notreviewed')" class="button-icon" :src="Revised">
            <img v-else class="button-icon" :src="Revised_OFF"> Revised
            <span class="number"></span>
          </div>
        </div>
      </div>
    </div>
    <div id="imagelist" @scroll="on_scroll">
      <div v-for="file in file_list_top" :key="file">
        <div style="position:relative">
          <span class="img-status-wrapper">
            <img v-if="is_review_result_ok(file)" class="img-status" :src="STATUS_CHECK_OK">
            <img v-else class="img-status" :src="STATUS_CHECK_NG">
          </span>
          <img
           :src='get_image_url(file)'
           :data-file='file'
           :class='{selected: is_selected(file)}'
           @click.stop.prevent="select_image">
          <!-- <span style="position:absolute;right:0;bottom:0; color:yellow">{{get_marks(file)}}</span>-->
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
      IMAGE_RELOAD_AMOUNT: 300,
      NO_REVIEW: require('../assets/images/NOreview.svg'),
      NO_Tags: require('../assets/images/NOtag.svg'),
      Revised: require('../assets/images/Revised.svg'),
      CHECK_OK:require('../assets/images/OK.svg'),
      CHECK_NG:require('../assets/images/NG.svg'),
      NO_REVIEW_OFF: require('../assets/images/NOreview_hover.svg'),
      NO_Tags_OFF: require('../assets/images/NOtag_hover.svg'),
      Revised_OFF: require('../assets/images/Revised_hover.svg'),
      CHECK_OK_OFF: require('../assets/images/OK_hover.svg'),
      CHECK_NG_OFF: require('../assets/images/NG_hover.svg'),
      STATUS_CHECK_OK: require('../assets/images/P_OK.svg'),
      STATUS_CHECK_NG: require('../assets/images/P_NG.svg')
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
    is_review_result_ok(file) {
      const info = this.folder_files[file]
      const review = get_reviewresult(info)
      if (review === 'ng') {
        return false;
      }
      return true;
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

#msg_no_image {
  position: absolute;
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
  height: calc(#{$panel-height} - 7px);
  .title-text {
    font-size: $content-top-header-font-size;
    line-height: calc(#{$panel-height} - 7px);
    margin-left: $content-top-heder-horizonral-margin;
  }
}

.no-icon {
  padding-left: calc(21.97px + 5px);
}

.button-icon {
  height: calc(15px * 0.8);
  padding-left: 2px;
}

.ng-button-icon{
  height: calc(15px * 0.75);
  padding-left: 5px;
  margin-bottom:2px;
}


.image_pred_tagbutton_active {
  background-color: $panel-bg-color;
  color: $font-color;
}
.image_pred_reviewbutton_active {
  background-color: $panel-bg-color;
  color: $font-color;
}

.clear-margin {
  margin-right: 0;
  margin-left: 0;
  height:20px;
}
.first-row{
  margin-top:10px;
}

.not-first {
  margin-top: 5px;
}

.fillter-button {
  color: black;
  height: 20px; //calc(#{$content-top-header-hight} - 2px);
  text-align: left;
  cursor: pointer;
  font-family: $content-top-header-font-family;
  font-size: calc(#{$content-inner-header-font-size} - 2pt);
}

.number{
  font-size: calc(#{$content-inner-header-font-size} - 5pt);
}

.off {
  height: calc(#{$content-top-header-hight} -2px);
  line-height: calc(#{$content-top-header-hight} -2px);
  color: black;
  background: #fff;
  &:hover{
    background: #CCCCCC;
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

.dot-ok {
  color: $tooltips-color;
}

.dot-ng {
  color: #dc3545;
}


#imagelist {
  display: flex;
  padding-right:6px;
  flex-wrap: wrap;
  overflow: auto;
  box-sizing: border-box;
  height: calc(100% - #{$component-margin-top} - (#{$content-top-margin} * 3) - #{$content-top-header-hight} - (calc(#{$content-top-header-hight} -2px) * 2 ) );
  margin-top: calc(#{$content-top-margin} * 2);
  align-content: flex-start;
  justify-content: space-evenly;
  background:#fff;

  img {
    box-sizing: border-box;
    align-self: baseline;
    margin: 1px;
    flex-grow: 0;
    flex-shrink: 0;

    &.selected {
      box-sizing: border-box;
      outline: 2px solid #EE7B33;
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
</style>
