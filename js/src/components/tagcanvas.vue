<template>
  <div id='canvasblock' :class="{full_screen_mode : full_screen_mode === true, original : full_screen_mode === false}">
    <div id="canvaspanel" ref="canvaspanel"
        @mousedown.middle='onDownMiddle'
        @mousemove='onMoveMiddle'
        @mouseup.middle='onUpMiddle'
        @mousedown.left.stop='onClick'
        @mousemove.left.stop.prevent='onMousemove'>

      <navarrow class="arrow" dir="back"/>
        <div id="canvas-wrapper" @wheel.ctrl.prevent="zoomImage" ref="wrapper">
          <div id="pad"/>
          <img v-if="hasImage" id="canvas" ref="canvas" :src="imageUrl" :style="canvasStyle"
           @dragstart.left.stop.prevent="onDragStart">
          <div v-if="isCreatingNewbox()" id="newtag" :style="newtagStyle()" />
          <div v-for="(tagstyle, idx) in fileterSelectedBoxes" :key="idx"
              :style='tagstyle'
              class='box-border'
              :data-boxid='idx' @mousedown.left.stop.prevent='onBoxClick'
              @mousemove.left='onBoxMousemove'>
            <div v-if="tagstyle!=null" :class="['box', isActivebox(idx) ? 'box-active':'']">
              <div  class='taglabel'>{{getBoxLabel(idx)}}</div>
            </div>
          </div>
        </div>
        <transition name="fade">
          <div id="zoom-button" >
            <div id="zoom-out-button" @click="onZoomOutButton">
              <i class="fa fa-plus" aria-hidden="true"></i>
            </div>
            <div id="zoom-reset-button" @click="onZoomResetButton">
              <i class="fa fa-expand" aria-hidden="true"></i>
            </div>
            <div id="expand-wide" @click="toFullScreenMode">
              <i class="fa fa-arrows-alt" aria-hidden="true"></i>
            </div>
            <div id="zoom-in-button" @click="onZoomInButton">
              <i class="fa fa-minus" aria-hidden="true"></i>
            </div>
          </div>
        </transition>
      <navarrow class="arrow" dir="forward"/>
    </div>
    <p id="demo"></p>
    <div>
      <div id='imageinfo' class="row">
        <div class="col-md-3 row  clear-padding ">
          <h4 class="shortcut-text-title">【Shortcut keys】</h4>
          <ul class="shortcut-text-list">
            <li class="shortcut-text-item">Ctrl+d: Hide/show unselected boxes</li>
            <li class="shortcut-text-item">Ctrl+w: Full-screen mode</li>
            <li class="shortcut-text-item">Space: Save changes</li>
          </ul>
        </div>
        <div class="col-md-1 row  clear-padding "></div>
        <div class="col-md-5 row  clear-padding comment-wrapper">
          <div class="comment-area col-md-6" :class="{active_textarea: is_admin, inactive_textarea: !is_admin}">
            <span>admin >> </span>
            <textarea class="form-control"  v-model="active_image_comment_admin" :readonly="!is_admin"></textarea>
          </div>
          <div class="comment-area col-md-6" :class="{active_textarea: !is_admin, inactive_textarea: is_admin}">
            <span>user >></span>
            <textarea class="form-control" v-model="active_image_comment_subord" :readonly="is_admin"></textarea>
          </div>
        </div>
        <div class= "col-md-3 row clear-padding">
          <div class="col-md-4 clear-padding toggle-wrapper">
            <div id='toggle' >
              <label class="switch ">
                <input type="checkbox" :class="{checked : show_selected_boxes}">
                <span class="slider" v-on:click="toShowSelectedBoxes"></span>
              </label>
            </div>
          </div>
          <div class="col-md-8 clear-padding">
            <div id='buttons' class="row">
              <p class="imgFilename_wrapper">
              <span class="col-md-10 text-left clear-padding" :class="{imgFilename_long_txt: isLongFileName}" style="margin: 0px;">{{imgFilename}}</span>
              </p>
              <div class="col-md-10 clear-padding" style="margin:10px 0px 0px;">
                  <div v-if="is_admin" class="btn-wrp">
                    <p v-if="canBeSaved && active_image_review_result !== 'ng'"
                          class="img-btn   float-left  ng-button"
                          @click="setReviewResult({result:'ng'})">
                          NG
                    </p>
                    <p v-else-if="canBeSaved && active_image_review_result === 'ng'"
                          class="img-btn   float-left  ng-button ng-button-push"
                          @click="setReviewResult({result:'ng'})">
                      NG
                    </p>
                    <p v-else class="img-btn-disabled   float-left ng-button">
                      NG
                    </p>
                    <p v-if="canBeSaved && active_image_review_result !== 'ok'"
                          class="img-btn   float-right ok-button"
                          :class="{review_checked: active_image_review_result === 'ok'}"
                          @click="setReviewResult({result:'ok'})">
                      OK
                    </p>
                    <p v-else-if="canBeSaved && active_image_review_result === 'ok'"
                          class="img-btn   float-right ok-button ok-button-push"
                          @click="setReviewResult({result:'ok'})">
                      OK
                    </p>
                    <p v-else class="img-btn-disabled   float-right ok-button">
                      OK
                    </p>
                  </div>
              </div>
              <div class="col-md-10 clear-padding" style="margin:3px 0px 0px;">
                <div v-if="canBeSaved" id="save_xml_btn"
                  class="float-left"
                  @click='applyAnnotation'>
                  Save
                </div>
                <div v-else id="save_xml_btn_disabled"
                  class="float-left">
                  Save
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import NavArrow from "@/components/navarrow";
import { mapState, mapMutations, mapActions } from "vuex";
import * as utils from "@/utils";

export default {
  components: {
    navarrow: NavArrow
  },
  data: function() {
    return {
      BOX_MARGIN: 2, // margin between box and box-border
      BOX_BORDER: 3, // width of border of box
      status: "", // one of 'new', 'moving', 'n', 'nw', ...

      dragfrom_x: null, // x pos in client coord
      dragfrom_y: null, // y pos in client coord

      newbox_rect: null, // rect of new box in client coord
      org_boxrc: null,
      boxes: null,
      show_selected_boxes: false,
      zoom_x: 0, // The coordinate x the image
      zoom_y: 0,
      zoom_scale: 1.0,
      image_drag_status: false,
      image_dragform_x: 0,
      image_dragform_y: 0,
      pre_boxes_state:[],
      copy_target_box: null
    };
  },
  created: function() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("keyup", this.onKeyup);
    window.addEventListener("keydown", this.onKeydown);
  },

  beforeDestroy: function() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keyup", this.onKeyup);
    window.removeEventListener("keydown", this.onKeydown);
  },
  mounted: function() {
    setTimeout(this.arrangeBoxes, 10);
  },
  computed: {
    ...mapState([
      "full_screen_mode",
      "is_admin",
      "active_image_filename",
      "active_image",
      "active_image_height",
      "active_image_width",
      "active_image_tag_boxes",
      "active_image_review_result",
      "active_boxid",
      "labels",
      "tagged_images",
      "saved_pre_tag_boxes"
    ]),
    imageUrl: function() {
      return this.active_image;
    },
    hasImage: function() {
      return Boolean(this.active_image_filename);
    },
    imgFilename: function() {
      let idx = this.active_image_filename.search(/[/\\]/);
      return this.active_image_filename.slice(idx + 1);
    },
    canBeSaved: function() {
      let has_tag = false;
      for (let tag of this.tagged_images) {
        if (tag.filename == this.active_image_filename) {
          has_tag = true;
        }
      }
      // tagをもともと持っていた場合はboxesが0でもsaveの対象とする
      if (this.active_image_tag_boxes.length === 0 && !has_tag) {
        return false;
      }
      for (let box of this.active_image_tag_boxes) {
        if (!box.label) {
          return false;
        }
      }
      return true;
    },
    fileterSelectedBoxes: function() {
      if (!this.boxes) {
        return false;
      }

      var size_style_boxes = [];
      switch (this.show_selected_boxes) {
        case true:
          var id = 0;
          for (let box of this.boxes) {
            if (box.selected === true) {
              size_style_boxes[`${id}`] = box.size_style;
            } else {
              size_style_boxes[`${id}`] = null;
            }
            id = id + 1;
          }
          return size_style_boxes;

        case false:
          var id = 0;
          for (let box of this.boxes) {
            size_style_boxes[`${id}`] = box.size_style;
            id = id + 1;
          }
          return size_style_boxes;
      }
    },
    active_image_comment_admin: {
      get() {
        return this.$store.state.active_image_comment_admin;
      },
      set(value) {
        if (value) {
          this.setCommentAdmin({ comment: value });
        } else {
          this.setCommentAdmin({ comment: value });
        }
      }
    },
    active_image_comment_subord: {
      get() {
        return this.$store.state.active_image_comment_subord;
      },
      set(value) {
        if (value) {
          this.setCommentSubord( { comment: value });
        } else {
          this.setCommentSubord( { comment: value });
        }
      }
    },
    canvasStyle: function() {
      const imgrc = this.$refs.wrapper;
      let parent_top = 0;
      let parent_left = 0;
      if (imgrc) {
        const rect = imgrc.getBoundingClientRect();
        parent_top = rect.top;
        parent_left = rect.left;
      }
      const z = this.zoom_scale;
      return {
        width: 100.0 * z + "%",
        height: 100.0 * z + "%",
        top: this.zoom_y + "px",
        left: this.zoom_x + "px"
      };
    },
    isFullScreenMode: function() {
      return (
        this.full_screen_mode &&
        ![null, undefined].inculudes(this.active_image_filename)
      );
    },
    isLongFileName:function(){
      // 10なのは暫定的な数値です
      return this.active_image_filename.length > 10 ? true:false;
    }
  },
  watch: {
    active_image_tag_boxes: function() {
      this.$nextTick(() => {
        this.arrangeBoxes();
      });
    }
  },
  methods: {
    ...mapMutations([
      "setActiveBoxid",
      "setReviewResult",
      "setCommentAdmin",
      "setCommentSubord",
      "setFullScreenMode",
      "removeTagbox",
      "updateTagbox",
      "setActiveboxLabel",
      "setTagboxes",
      "addNewTagbox",
      "setCopyBoxes",
      "applyPreBoxes"
    ]),
    ...mapActions(["saveAnnotation", "deleteXml"]),

    toFullScreenMode: function() {
      let shift = !this.full_screen_mode;
      this.setFullScreenMode({ full_screen_mode: shift });
    },

    _zoom: function(x, y, scale_delt, in_out) {
      let z = 0;
      if (in_out > 0) {
        this.zoom_scale -= scale_delt;
        if (this.zoom_scale >= 0.5) {
          z = -scale_delt;
        } else {
          this.zoom_scale = 0.5;
        }
      } else {
        this.zoom_scale += scale_delt;
        if (this.zoom_scale <= 1.5) {
          z = scale_delt;
        } else {
          this.zoom_scale = 1.5;
        }
      }
      let candidate_x = this.zoom_x;
      let candidate_y = this.zoom_y;
      const [_, rect] = this.calcImageRect();
      const imgrc = this.$refs.canvas.getBoundingClientRect();
      const wrapper = this.$refs.wrapper.getBoundingClientRect();

      let deltX =
        (x - imgrc.left) /
        (imgrc.right - imgrc.left) *
        (wrapper.right - wrapper.left);
      let deltY =
        (y - imgrc.top) /
        (imgrc.bottom - imgrc.top) *
        (wrapper.bottom - wrapper.top);
      candidate_x -= deltX * z;
      candidate_y -= deltY * z;
      this.zoom_y = candidate_y;
      this.zoom_x = candidate_x;

      this.$nextTick(() => {
        this.arrangeBoxes();
      });
    },

    onZoomOutButton: function() {
      const rect = this.$refs.canvaspanel.getBoundingClientRect();
      this._zoom(rect.right / 2, rect.bottom / 2, 0.05, false);
    },

    onZoomResetButton: function() {
      this.zoom_y = 0;
      this.zoom_x = 0;
      this.zoom_scale = 1.0;
      this.$nextTick(() => {
        this.arrangeBoxes();
      });
    },

    onZoomInButton: function() {
      const rect = this.$refs.canvaspanel.getBoundingClientRect();
      this._zoom(rect.right / 2, rect.bottom / 2, 0.05, true);
    },

    zoomImage: function(e) {
      this._zoom(e.clientX, e.clientY, 0.05, e.deltaY > 0);
    },

    newtagStyle: function() {
      let ret = this.toCanvasRect(this.newbox_rect);
      return this.sizeStyle(ret).size_style;
    },

    onDragStart: function(idx) {
      // does nothing
      return false;
    },

    isCreatingNewbox: function() {
      return this.status === "new";
    },

    isActivebox: function(idx) {
      return this.active_boxid === idx;
    },

    toShowSelectedBoxes: function() {
      this.show_selected_boxes = !this.show_selected_boxes;
      this.$nextTick(() => {
        this.arrangeBoxes();
      });
    },
    initSelectedFlag: function(boxes) {
      for (let box of boxes) {
        box.selected = false;
      }
      return boxes;
    },
    _cleanBoxesInSelectedMode: function(nolabel_idx) {
      let pri = this.boxes.slice(0, nolabel_idx);
      let follow = this.boxes.slice(nolabel_idx + 1);
      this.boxes = [...pri, ...follow];
    },
    _deleteBoxesInSelectedMode: function(active_boxid) {
      let pri = this.boxes.slice(0, active_boxid);
      let follow = this.boxes.slice(active_boxid + 1);
      this.boxes = [...pri, ...follow];
    },
    // when(selected-mode) once the box became "active" store the id sothat fefer as "selected : true"
    _setFlagInSelectedMode: function(active_boxid, boxes) {
      // new box
      if (active_boxid != null) {
        if (active_boxid === this.boxes.length) {
          boxes[active_boxid].selected = true;
        }
      }
      // refer privious state of this.box.selected
      for (var i = 0; i < this.boxes.length; i++) {
        boxes[`${i}`].selected = this.boxes[`${i}`].selected;
      }
      return boxes;
    },
    // when(original-mode to selected-mode) toggle is one to chatch thi function.
    _setFlagInOriginalMode: function(active_boxid, boxes) {
      if (boxes[active_boxid]) {
        for (let box of boxes) {
          box.selected = false;
          if (box === boxes[active_boxid]) {
            box.selected = true;
          }
        }
      }
      return boxes;
    },
    getBoxObj: function(id) {
      if (!this.active_image_tag_boxes[id] || !this.boxes[id]) {
        return false;
      }
      return this.active_image_tag_boxes[id];
    },
    getBoxLabel: function(id) {
      if (!this.active_image_tag_boxes[id] || !this.boxes[id]) {
        return false;
      }
      return this.getBoxObj(id).label;
    },

    toCanvasRect: function(rc) {
      let [l, t, r, b] = utils.normalizeRect(rc);

      [[l, t], [r, b]] = utils.clientToNode(this.$refs.canvaspanel, [
        [l, t],
        [r, b]
      ]);
      return [l, t, r, b];
    },
    applyAnnotation: function() {
      if (this.active_image_tag_boxes.length == 0) {
        this.deleteXml();
      } else {
        let saved_pre_tag_boxes_set = this.active_image_tag_boxes.map((box) => {
            let {bottom, top, left, right,label} = {...box};
            // 座標は比率で保存する
            // (100,200,100,50) => (0.4, 0.1, 0.4, 0.8)という風に
            let normed_bottom = bottom/this.active_image_height;
            let normed_top = top/this.active_image_height;
            let normed_left = left/this.active_image_width;
            let normed_right = right/this.active_image_width;
            return [normed_bottom, normed_top, normed_left, normed_right,label]
        });
        this.setCopyBoxes(saved_pre_tag_boxes_set);
        this.saveAnnotation();
      }
    },
    onResize: function() {
      setTimeout(this.arrangeBoxes, 10);
    },

    onKeyup: function(event) {
      if (event.target.nodeName === "BODY") {
        if (event.ctrlKey === true && event.key === "w") {
          this.toFullScreenMode();
        }
        if (event.key === " ") {
          if (this.canBeSaved) {
            this.applyAnnotation();
            event.preventDefault();
            event.stopPropagation();
          }
          return false;
        }
        if (this.hasImage && this.active_boxid !== null) {
          if (event.key === "Delete" || event.key === "Backspace") {
            this._deleteBoxesInSelectedMode(this.active_boxid);

            this.removeTagbox({ boxid: this.active_boxid });
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
        // ショートカット系のイベントの記載
        if (event.ctrlKey) {
          switch(event.key){
            case "b":
              if(this.saved_pre_tag_boxes == 0){
                alert("There is no target image to copy");
              }
              let saved_boxes = this.saved_pre_tag_boxes.map((norm_box) => {
                  let bottom,top,left,right,label;
                  [bottom,top,left,right,label] = [...norm_box];
                  let normed_bottom = bottom * this.active_image_height;
                  let normed_top = top * this.active_image_height;
                  let normed_left = left * this.active_image_width;
                  let normed_right = right * this.active_image_width;
                  return {bottom:normed_bottom, top:normed_top, left:normed_left, right:normed_right,label:label}
              });
              let box_dataset = [...this.active_image_tag_boxes, ...saved_boxes]
              this.applyPreBoxes(box_dataset);
            break;
            case "d":
              this.toShowSelectedBoxes();
            break;
            case "z":
              this.applyPreBoxes(this.pre_boxes_state);
            break;
            case "c":
            const boxid = this.active_boxid;
            this.copy_target_box = this.pre_box_data[boxid];
            break;
            case "v":
              //　0.02なのは感覚的なものです、深い意味はないです
              let height_diff = 
              this.copy_target_box.top > 0?
              this.active_image_height * 0.02:
              this.active_image_height * -0.02;
              let width_diff =
              // 左端ではみ出しそうならば、右側にずらす処理のための三項演算子
              (this.copy_target_box.left - this.active_image_width * 0.02) < 0 ?
               - this.active_image_width * 0.02:
              this.active_image_width * 0.02;
              let box　= {
                label: this.copy_target_box.label,
                bottom: this.copy_target_box.bottom - height_diff,
                left: this.copy_target_box.left - width_diff,
                right: this.copy_target_box.right - width_diff,
                top: this.copy_target_box.top - height_diff
              }
              if(box){
                this.$store.commit("addNewTagbox", {box} );
              }
            break;
          }
        }
      }
    },

    onKeydown: function(event) {
      if (event.target.nodeName === "BODY") {
        if (this.hasImage && this.active_boxid !== null) {
          if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
          ) {
            let [ratio, imgrc] = this.calcImageRect();

            let boxid = this.active_boxid;
            let box = this.getBoxObj(boxid);
            box.top = parseInt(box.top);
            box.bottom = parseInt(box.bottom);
            box.right = parseInt(box.right);
            box.left = parseInt(box.left);

            switch (event.key) {
              case "ArrowUp":
                if (box.top > 0) {
                  box.top -= 1;
                  box.bottom -= 1;
                }
                break;
              case "ArrowDown":
                if (this.active_image_height > box.bottom) {
                  box.top += 1;
                  box.bottom += 1;
                }
                break;
              case "ArrowLeft":
                if (box.left > 0) {
                  box.left -= 1;
                  box.right -= 1;
                }
                break;
              case "ArrowRight":
                if (box.right < this.active_image_width) {
                  box.left += 1;
                  box.right += 1;
                }
                break;
              default:
                return;
            }
            this.updateTagbox({
              boxid: boxid,
              box: box
            });
          } else {
            for (let label of this.labels) {
              if (label.shortcut === event.key) {
                this.setActiveboxLabel(label);
                event.preventDefault();
                event.stopPropagation();
                return false;
              }
            }
          }
        }
      }
    },

    sizeStyle: function(rc) {
      const size_style = {};
      size_style.left = `${rc[0]}px`;
      size_style.top = `${rc[1]}px`;
      size_style.width = `${rc[2] - rc[0]}px`;
      size_style.height = `${rc[3] - rc[1]}px`;
      return { size_style };
    },

    calcImageRect: function() {
      const imgrc = this.$refs.canvas.getBoundingClientRect();
      const orgwidth = this.active_image_width;
      const orgheight = this.active_image_height;

      const ratio1 = imgrc.width / orgwidth;
      const ratio2 = imgrc.height / orgheight;

      const ratio = utils.min(ratio1, ratio2);
      const margin = utils.max(0, (imgrc.width - orgwidth * ratio) / 2);

      const left = imgrc.left + margin;
      const right = Math.floor(left + orgwidth * ratio);
      const top = imgrc.top;
      const bottom = Math.floor(imgrc.top + orgheight * ratio);
      return [ratio, [left, top, right, bottom]];
    },

    boxToClient: function(box) {
      let [ratio, imgrc] = this.calcImageRect();
      const l = Math.floor(box.left * ratio + imgrc[0]);
      const t = Math.floor(box.top * ratio + imgrc[1]);
      const r = Math.floor(box.right * ratio + imgrc[0]);
      const b = Math.floor(box.bottom * ratio + imgrc[1]);
      return [l, t, r, b];
    },
    clientToBox: function(rect) {
      let [left, top, right, bottom] = utils.normalizeRect(rect);
      let [ratio, imgrc] = this.calcImageRect();
      left = Math.floor((left - imgrc[0]) / ratio);
      top = Math.floor((top - imgrc[1]) / ratio);
      right = Math.floor((right - imgrc[0]) / ratio);
      bottom = Math.floor((bottom - imgrc[1]) / ratio);

      return { left, top, right, bottom };
    },
    arrangeBoxes: function() {
      let boxes = [];
      if (!this.$refs.canvas || !this.active_image_tag_boxes) {
        return;
      }
      for (let box of this.active_image_tag_boxes) {
        const rc = this.toCanvasRect(this.boxToClient(box));
        boxes.push(
          this.sizeStyle([
            rc[0] - this.BOX_MARGIN,
            rc[1] - this.BOX_MARGIN,
            rc[2] + this.BOX_MARGIN,
            rc[3] + this.BOX_MARGIN
          ])
        );
      }
      if (this.boxes === null) {
        boxes = this.initSelectedFlag(boxes);
        this.boxes = boxes;
      } else {
        if (this.show_selected_boxes === true) {
          boxes = this._setFlagInSelectedMode(this.active_boxid, boxes);
          this.boxes = boxes;
        } else {
          if (this.active_boxid != null) {
            boxes = this._setFlagInOriginalMode(this.active_boxid, boxes);
          } else {
            boxes = this.initSelectedFlag(boxes);
          }
          this.boxes = boxes;
        }
      }
    },
    _cleanBoxes: function() {
      const tagboxes = [];
      for (const [i, box] of this.active_image_tag_boxes.entries()) {
        if (box.label) {
          tagboxes.push(box);
        } else {
          this._cleanBoxesInSelectedMode(i);
        }
      }
      this.setTagboxes({ tagboxes });
    },
    onDownMiddle: function(e) {
      this.image_drag_status = true;
      this.image_dragform_x = e.clientX;
      this.image_dragform_y = e.clientY;
    },
    onMoveMiddle: function(e) {
      if (this.image_drag_status) {
        const [ratio, rect] = this.calcImageRect();
        const imgrc = this.$refs.canvas.getBoundingClientRect();
        const wrapper = this.$refs.wrapper.getBoundingClientRect();
        const candidate_x = this.zoom_x + (e.clientX - this.image_dragform_x);
        const candidate_y = this.zoom_y + (e.clientY - this.image_dragform_y);
        const candidate_imgrc_x = rect[0] + (e.clientX - this.image_dragform_x);
        const candidate_imgrc_y = rect[1] + (e.clientY - this.image_dragform_y);
        const movable = 300;
        const will_out_side_left = candidate_imgrc_x + movable > wrapper.right;
        const will_out_side_right =
          candidate_imgrc_x + rect[2] - rect[0] - movable < wrapper.left;
        const will_out_side_top = candidate_imgrc_y + movable > wrapper.bottom;
        const will_out_side_bottom =
          candidate_imgrc_y + rect[3] - rect[1] - movable < wrapper.top;
        this.image_dragform_x = e.clientX;
        this.image_dragform_y = e.clientY;

        if (will_out_side_left || will_out_side_right) {
          this.zoom_y = candidate_y;
        } else if (will_out_side_top || will_out_side_bottom) {
          this.zoom_x = candidate_x;
        } else {
          this.zoom_y = candidate_y;
          this.zoom_x = candidate_x;
        }
        this.$nextTick(() => {
          this.arrangeBoxes();
        });
      }
    },
    onUpMiddle: function(e) {
      this.image_drag_status = false;
    },

    onClick: function(event) {
      if (!this.hasImage) {
        return;
      }

      const [, rc] = this.calcImageRect();
      rc[2] = rc[2] - 1;
      if (!utils.ptInRect(rc, event.clientX, event.clientY)) {
        return;
      }
      this._cleanBoxes();

      if (this.active_boxid != null) {
        this.setActiveBoxid({
          boxid: null
        });
      }
      [this.dragfrom_x, this.dragfrom_y] = [event.clientX, event.clientY];
      this.status = "new";

      // creating new box
      this.newbox_rect = [
        this.dragfrom_x,
        this.dragfrom_y,
        this.dragfrom_x,
        this.dragfrom_y
      ];
      utils.addEventListenerOnce(document, "mouseup", this.endDrag, true);
    },

    boxGetCursorType: function(box_border, x, y) {
      const rect = box_border.getBoundingClientRect();
      const margin = this.BOX_MARGIN * 2 + this.BOX_BORDER;
      if (x - rect.left <= margin) {
        if (y - rect.top <= margin) {
          return "nw";
        } else if (rect.bottom - y <= margin) {
          return "sw";
        }
        return "w";
      }

      if (rect.right - x <= margin) {
        if (y - rect.top <= margin) {
          return "ne";
        } else if (rect.bottom - y <= margin) {
          return "se";
        }
        return "e";
      }
      if (y - rect.top <= margin) {
        return "n";
      }
      if (rect.bottom - y <= margin) {
        return "s";
      }
      return "";
    },
    onBoxClick: function(event) {
      // ctrl+z用のための処理
      this.pre_boxes_state = this.active_image_tag_boxes;
      const boxid = event.currentTarget.dataset.boxid;
      if (boxid !== this.active_boxid) {
        this._cleanBoxes();
      }
      const tag = this.getBoxObj(boxid);
      if (!tag) {
        return;
      }
      const resize = this.boxGetCursorType(
        event.currentTarget,
        event.clientX,
        event.clientY
      );
      if (resize === "") {
        this.status = "dragging";
      } else {
        this.status = resize;
      }
      this.setActiveBoxid({ boxid: parseInt(boxid) });
      const box = this.getBoxObj(this.active_boxid);
      this.org_boxrc = this.boxToClient(box);
      [this.dragfrom_x, this.dragfrom_y] = [event.clientX, event.clientY];

      utils.addEventListenerOnce(document, "mouseup", this.endDrag, true);
    },

    dirToCursor(dir) {
      const cursor_map = {
        n: "ns-resize",
        nw: "nwse-resize",
        ne: "nesw-resize",
        w: "ew-resize",
        e: "ew-resize",
        s: "ns-resize",
        sw: "nesw-resize",
        se: "nwse-resize"
      };
      return cursor_map[dir];
    },

    onBoxMousemove: function(event) {
      let status = this.status;
      if (!status) {
        status = this.boxGetCursorType(
          event.currentTarget,
          event.clientX,
          event.clientY
        );
      }
      let cursor = this.dirToCursor(status);
      if (!cursor) {
        cursor = "move";
      }
      event.target.style.cursor = cursor;
    },
    onMousemove: function(event) {
      if (!this.hasImage) {
        return;
      }
      let [, imgrc] = this.calcImageRect();
      let x = utils.min(utils.max(imgrc[0], event.clientX), imgrc[2]);
      let y = utils.min(utils.max(imgrc[1], event.clientY), imgrc[3]);

      if (this.status === "new") {
        // resize newly created box
        let [l, t] = this.newbox_rect;
        this.newbox_rect = [l, t, x, y];

      } else if (this.status) {

        const rc = this.org_boxrc.slice();

        let diff_x = x - this.dragfrom_x;
        let diff_y = y - this.dragfrom_y;
        if (this.status === "dragging") {
          // move box
          // check if the box going out of bounds
          if (rc[0] - imgrc[0] + diff_x < 0) {
            diff_x = (rc[0] - imgrc[0]) * -1;
          }
          if (rc[2] + diff_x > imgrc[2]) {
            diff_x = imgrc[2] - rc[2];
          }
          if (rc[1] - imgrc[1] + diff_y < 0) {
            diff_y = (rc[1] - imgrc[1]) * -1;
          }
          if (rc[3] + diff_y > imgrc[3]) {
            diff_y = imgrc[3] - rc[3];
          }
          rc[0] += diff_x;
          rc[2] += diff_x;
          rc[1] += diff_y;
          rc[3] += diff_y;

        } else {
          if (this.status.indexOf("n") !== -1) {
            rc[1] = utils.min(utils.max(imgrc[1], rc[1] + diff_y), rc[3] - 1);
          }
          if (this.status.indexOf("s") !== -1) {
            rc[3] = utils.min(utils.max(rc[1], rc[3] + diff_y), imgrc[3]);
          }
          if (this.status.indexOf("w") !== -1) {
            rc[0] = utils.min(utils.max(imgrc[0], rc[0] + diff_x), rc[2] - 1);
          }
          if (this.status.indexOf("e") !== -1) {
            rc[2] = utils.min(utils.max(rc[0], rc[2] + diff_x), imgrc[2] - 1);
          }
        }
        const curbox = this.getBoxObj(this.active_boxid);
        const newbox = { ...curbox, ...this.clientToBox(rc) };
        // ctrl+z用、コピペのための処理
        this.pre_box_data = this.active_image_tag_boxes;
        this.updateTagbox( {
          boxid: this.active_boxid,
          box: newbox
        });
      }
    },
    endDrag: function() {
      if (this.status === "new") {
        const box = this.clientToBox(this.newbox_rect);
        if (box.left !== box.right && box.top !== box.bottom) {
          this.addNewTagbox({ box });
          this.setActiveBoxid({
            boxid: this.active_image_tag_boxes.length - 1
          });
        } else {
          this.setActiveBoxid({
            boxid: null
          });
        }
      }

      this.status = "";
    }

    // 0) Not useing currently but maight use sometime
    //
    // getReviewStatus: function() {
    //   const prior_scale = this.zoom_scale;
    //   if (this.active_image_review_result === "ok") {
    //     return "reviewok";
    //   } else if (this.active_image_review_result === "nh") {
    //     return "reviewng";
    //   }
    //   return "notreviewed";
    // }
  }
};
</script>

<style lang='scss' scoped>
.original {
  // #canvasblock
  flex-grow: 1;
  background: #fff;
  padding: 5px 15px;

  .clear-padding {
    padding-left: 0;
    padding-right: 0;
  }
  #canvaspanel {
    flex-grow: 1;
    display: flex;
    position: relative;
    height: calc(100% - 150px + calc(#{$component-margin-top}));
    .arrow {
      margin-top: 25%;
    }
    #canvas-wrapper {
      width: calc(100% - 60px);
      height: 100%;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      #pad {
        width: 100%;
        height: $component-margin-top;
      }
      #canvas {
        position: relative;
        margin: auto;
        flex-grow: 0;
        flex-shrink: 0;
        object-fit: contain;
        max-width: none;
      }
    }
    #zoom-button {
      display: flex;
      flex-wrap: wrap;
      position: absolute;
      width: 120px;
      height: 30px;
      top: calc(100% - 30px);
      left: calc(50% - 60px);
      #zoom-out-button {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
      #zoom-in-button {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }
      div {
        display: flex;
        width: 25%;
        justify-content: center;
        align-items: center;
        color: white;
        background-color: #00000088;
        &:hover {
          cursor: pointer;
          background-color: #00000033;
        }
      }
    }

    .box-border {
      box-sizing: border-box;
      position: absolute;

      $BOX_MARGIN: 2px;

      .taglabel {
        position: absolute;
        right: 0;
        top: 0;
        color: white;
        background-color: #73dd00;
      }
      .box {
        position: absolute;
        border: solid #73dd00 1px;
        left: $BOX_MARGIN;
        top: $BOX_MARGIN;
        right: $BOX_MARGIN;
        bottom: $BOX_MARGIN;
      }
      .box-active {
        border-color: red;
        background-color: rgba(255, 255, 255, 0.7);

        .taglabel {
          background-color: red;
        }
      }
    }

    #newtag {
      box-sizing: border-box;
      position: absolute;
      border: solid red 1px;
    }
  }

  #imageinfo {
    display: flex;
    color: #666;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: $component-margin-top 0 0;
    .shortcut-text-title {
      font-size: 0.75rem;
      color: #aaa;
      margin-bottom: 0;
    }
    .shortcut-text-list {
      font-size: 0.6rem;
      color: #aaa;
      list-style-type: disc;
    }

    .check-button {
      height: $panel-height;
      width: 38px;
      background: #fff;
      border-color: #000;
    }
    .comment-wrapper {
      margin: 0 5px;
      display: flex;
      font-size: 95%;
      position: relative;

      .comment-area {
        width: 100%;
        padding-right: 8px;
        padding-left: 0;
        .form-control {
          width: 100%;
          height: 80px;
          padding: 0 5px;
          margin: 3px 0 0;
          font-size: 90%;
          resize: none;
          border-radius: 0px;
          overflow-y: scroll;
        }
      }
      .active_textarea {
        order: 2;
        .form-control {
          cursor: pointer;
        }
      }
      .inactive_textarea {
        order: 1;
        .form-control {
          // border:none;
          background: #fff;
        }
        & :focus {
          box-shadow: none;
        }
      }
    }

    .review_checked {
      background-color: #a2c84a;
    }
    .align-bottom {
      display: inline-block;
      vertical-align: bottom;
    }
    .toggle-wrapper {
      position: relative;
      display: inline-block;
      #toggle {
        display: inline-block;
        height: calc(#{$panel-height} * 0.8);
        position: absolute;
        bottom: 0;
        right: 5px;
        .switch {
          height: calc(#{$panel-height} * 0.8);
          width: 55px;
          input[type="checkbox"] {
            line-height: calc(#{$panel-height} * 0.8);
            opacity: 0;
            width: 0;
            height: 0;
            &.checked + .slider {
              background-color: #006ea1;
              &:before {
                transform: translateX(26px);
              }
            }
          }
        }
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #999;
        transition: 0.4s;

        &:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
        }
      }
    }
    #buttons {
      width: 100%;
      margin: auto;
      .filename {
        text-align: right;
      }
      .btn-wrp {
        display: inline-block;
        width: calc(55px * 2);
      }
      .btn-wrp > p {
        display: inline-block;
        margin: 0px;
      }
      .ok-button {
        &:hover,
        &-push {
          background: #ff4949 !important;
        }
      }
      .ng-button {
        &:hover,
        &-push {
          background: #000 !important;
        }
      }
      .ng-button,
      .ok-button {
        cursor: pointer;
        background: #999;
        padding: 10px;
        color: #fff;
        width: 53px;
        font-size: 0.8rem;
        text-align: center;
        line-height: 5px;
      }

      .img-btn {
        height: 23px;
        cursor: pointer;
      }
      .img-btn-disabled {
        height: 23px;

        &:hover {
          cursor: not-allowed;
          background: #999 !important;
        }
      }
      #save_xml_btn {
        background-color: $panel-bg-color;
        color: #fff;
        height: calc(#{$panel-height} * 0.8);
        width: calc(55px * 2);
        line-height: calc(#{$panel-height} * 0.8);
        text-align: center;
        font-family: $content-top-header-font-family;
        font-size: $content-modellist-font-size;
        &:hover {
          background-color: $panel-bg-color-hover;
          cursor: pointer;
        }
      }
      #save_xml_btn_disabled {
        color: #fff;
        height: calc(#{$panel-height} * 0.8);
        width: calc(55px * 2);
        line-height: calc(#{$panel-height} * 0.8);
        text-align: center;
        background-color: $disabled-color;
        font-family: $content-top-header-font-family;
        font-size: $content-modellist-font-size;
        cursor: not-allowed;
      }
    }
    .imgFilename_wrapper{
      width: 6rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding:0;
      font-size: 95%;
      .imgFilename_long_txt:hover{
        display:block;
        width: 100%;
        padding-right: 100%;
        overflow: show;
        animation: scrollAnime 5s linear infinite;
      }
      @keyframes scrollAnime{
        0% { transform: translateX(0)}
        //20remは暫定的な値です
        100% { transform: translateX(-20rem)}
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}
.full_screen_mode {
  // #canvasblock
  flex-grow: 1;
  background: #2e2f30;
  height: 100%;
  padding: 15px 30px;

  .clear-padding {
    padding-left: 0;
    padding-right: 0;
  }
  #canvaspanel {
    flex-grow: 1;
    display: flex;
    position: relative;
    height: 100%;
    .arrow {
      margin-top: 25%;
    }
    #canvas-wrapper {
      display: inline-block;
      width: calc(100% - 60px);
      height: 100%;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);

      .pad {
        width: 100%;
        height: $component-margin-top;
      }
      #canvas {
        position: relative;
        margin: auto;
        flex-grow: 0;
        flex-shrink: 0;
        object-fit: contain;
        max-width: none;
      }
    }
    #zoom-button {
      display: flex;
      flex-wrap: wrap;
      position: absolute;
      width: 120px;
      height: 30px;
      top: calc(100% - 30px);
      left: calc(50% - 60px);
      #zoom-out-button {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
      #zoom-in-button {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }
      div {
        display: flex;
        width: 25%;
        justify-content: center;
        align-items: center;
        color: white;
        background-color: #00000088;
        &:hover {
          cursor: pointer;
          background-color: #00000033;
        }
      }
    }
    .box-border {
      box-sizing: border-box;
      position: absolute;

      $BOX_MARGIN: 2px;

      .taglabel {
        position: absolute;
        right: 0;
        top: 0;
        color: white;
        background-color: #73dd00;
      }
      .box {
        position: absolute;
        border: solid #73dd00 1px;
        left: $BOX_MARGIN;
        top: $BOX_MARGIN;
        right: $BOX_MARGIN;
        bottom: $BOX_MARGIN;
      }
      .box-active {
        border-color: red;
        background-color: rgba(255, 255, 255, 0.7);

        .taglabel {
          background-color: red;
        }
      }
    }

    #newtag {
      box-sizing: border-box;
      position: absolute;
      border: solid red 1px;
    }
  }
}
</style>
