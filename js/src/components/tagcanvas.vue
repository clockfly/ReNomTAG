<template>
  <div id='canvasblock'>
    <div id="canvaspanel" ref="canvaspanel"
        @mousedown.middle='on_down_middle'
        @mousemove='on_move_middle'
        @mouseup.middle='on_up_middle'
        @mousedown.left.stop='on_click'
        @mousemove.left.stop.prevent='on_mousemove'>

      <navarrow class="arrow" dir="back"/>
        <div id="canvas-wrapper" @wheel.ctrl.prevent="zoom_image" ref="wrapper">
          <div id="pad"/>
          <img v-if="has_image" id="canvas" ref="canvas" :src="image_url" :style="canvas_style"
           @dragstart.left.stop.prevent="on_drag_start">
          <div v-if="is_creating()" id="newtag" :style="newtag_style()" />
          <div v-for="(tagstyle, idx) in fileter_selected_boxes" :key="idx"
              :style='tagstyle'
              class='box-border'
              :data-boxid='idx' @mousedown.left.stop.prevent='on_boxclick'
              @mousemove.left='on_boxmousemove'>
            <div v-if="tagstyle!=null" :class="['box', is_active_box(idx) ? 'box-active':'']">
              <div  class='taglabel'>{{get_box_label(idx)}}</div>
            </div>
          </div>
        </div>
        <transition name="fade">
          <div id="zoom-button" v-if="zoom_scale!=1.0 || zoom_x != 0 || zoom_y != 0">
            <div id="zoom-out-button" @click="on_zoom_out_button">
              <i class="fa fa-plus" aria-hidden="true"></i>
            </div>
            <div id="zoom-reset-button" @click="on_zoom_reset_button">
              <i class="fa fa-expand" aria-hidden="true"></i>
            </div>
            <div id="zoom-in-button" @click="on_zoom_in_button">
              <i class="fa fa-minus" aria-hidden="true"></i>
            </div>
          </div>
        </transition>
      <navarrow class="arrow" dir="forward"/>
    </div>
    <p id="demo"></p>
    <div>
      <div id='imageinfo' class="row  clear-padding">
        <div class="col-md-8 row  clear-padding comment-wrapper">
          <div class="col-sm-6 ">
            <div class="comment-area ">
              <textarea class="form-control" :class="{admin: is_admin}" v-model="active_image_comment_admin" :readonly="!this.is_admin"></textarea>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="comment-area">
              <textarea class="form-control" :class="{not_admin: !is_admin}" v-model="active_image_comment_subord" :readonly="this.is_admin"></textarea>
            </div>
          </div>
        </div>
        <div class= "col-md-4 row clear-padding">
          <div class="col-sm-3 clear-padding" style="position:relative; display:inline-block;">
            <div id='toggle' >
              <label class="switch ">
                <input type="checkbox" :class="{checked : show_selected_boxes}">
                <span class="slider" v-on:click="show_selected_boxes_toggle"></span>
              </label>
            </div>
          </div>
          <div class="col-sm-6 clear-padding">
            <div id='buttons' class="row">
              <span class="col-md-10 text-left clear-padding" style="margin: 0px;"> {{img_file_name}} </span>
              <div class="col-md-10 clear-padding" style="margin:10px 0px 0px;">
                  <div v-if="this.is_admin" class="btn-wrp">
                    <p v-if="can_be_saved && this.active_image_review_result !== 'ng'"
                          class="img-btn   float-left  ng-button"
                          @click="set_review_result({result:'ng'})">
                          NG
                    </p>
                    <p v-else-if="can_be_saved && this.active_image_review_result === 'ng'"
                          class="img-btn   float-left  ng-button ng-button-push"
                          @click="set_review_result({result:'ng'})">
                      NG
                    </p>
                    <p v-else class="img-btn-disabled   float-left ng-button">
                      NG
                    </p>
                    <p v-if="can_be_saved && this.active_image_review_result !== 'ok'"
                          class="img-btn   float-right ok-button"
                          :class="{review_checked: this.active_image_review_result === 'ok'}"
                          @click="set_review_result({result:'ok'})">
                      OK
                    </p>
                    <p v-else-if="can_be_saved && this.active_image_review_result === 'ok'"
                          class="img-btn   float-right ok-button ok-button-push"
                          @click="set_review_result({result:'ok'})">
                      OK
                    </p>
                    <p v-else class="img-btn-disabled   float-right ok-button">
                      OK
                    </p>
                  </div>
              </div>
              <div class="col-md-10 clear-padding" style="margin:3px 0px 0px;">
                <div v-if="can_be_saved" id="save_xml_btn"
                  class="float-left"
                  @click='apply_annotation'>
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
      OK_BUTTON: require("../assets/images/OK_button.png"),
      NG_BUTTON: require("../assets/images/NG_button.png"),
      OK_BUTTON_PUSH: require("../assets/images/OK_push.png"),
      NG_BUTTON_PUSH: require("../assets/images/NG_push.png"),

      zoom_x: 0, // The coordinate x the image
      zoom_y: 0,
      zoom_scale: 1.0,
      image_drag_status: false,
      image_dragform_x: 0,
      image_dragform_y: 0
    };
  },
  created: function() {
    window.addEventListener("resize", this.on_resize);
    window.addEventListener("keyup", this.on_keyup);
    window.addEventListener("keydown", this.on_keydown);
  },

  beforeDestroy: function() {
    window.removeEventListener("resize", this.on_resize);
    window.removeEventListener("keyup", this.on_keyup);
    window.removeEventListener("keydown", this.on_keydown);
  },
  mounted: function() {
    setTimeout(this.arrange_boxes, 10);
  },
  computed: {
    ...mapState([
      "is_admin",
      "active_image_filename",
      "active_image",
      "active_image_height",
      "active_image_width",
      "active_image_tag_boxes",
      "active_image_review_result",
      "active_boxid",
      "labels",
      "tagged_images"
      // "selected_boxes"
    ]),
    image_url: function() {
      return this.active_image;
    },
    has_image: function() {
      return Boolean(this.active_image_filename);
    },
    img_file_name: function() {
      let idx = this.active_image_filename.search(/[/\\]/);
      return this.active_image_filename.slice(idx + 1);
    },
    can_be_saved: function() {
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
    fileter_selected_boxes: function(){
      if ((this.boxes === null) || (this.boxes === undefined)){
        return false;
      }

      var size_style_boxes = [];
      switch(this.show_selected_boxes){
        case true:
          var id = 0;
          for (let box of this.boxes){
            if (box.selected === true){
              size_style_boxes[`${id}`] = box.size_style;
            }else{
              size_style_boxes[`${id}`] = null;
            }
            id = id + 1;
          }
          return size_style_boxes

        case false:
          var id = 0;
          for (let box of this.boxes){
            size_style_boxes[`${id}`] = box.size_style;
            id = id + 1;
          }
          return size_style_boxes
      }

    },
    active_image_comment_admin: {
      get() {
        return this.$store.state.active_image_comment_admin;
      },
      set(value) {
        if(value){
          this.$store.commit("set_comment_admin", { comment: value });

        }else{
          this.$store.commit("set_comment_admin", { comment: "" });
        }
      }
    },
    active_image_comment_subord: {
      get() {
        return this.$store.state.active_image_comment_subord;
      },
      set(value) {
        if(value){
          this.$store.commit("set_comment_subord", { comment: value });
        }else{
          this.$store.commit("set_comment_subord", { comment: "" });
        }
      }
    },
    canvas_style: function() {
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
    }
  },
  watch: {
    active_image_tag_boxes: function() {
      this.$nextTick(() => {
        this.arrange_boxes();
      });
    }
  },
  methods: {
    ...mapMutations(["set_active_boxid", "set_review_result"]),
    ...mapActions(["save_annotation", "delete_xml"]),

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
      const [_, rect] = this.calc_image_rect();
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
        this.arrange_boxes();
      });
    },

    on_zoom_out_button: function() {
      const rect = this.$refs.canvaspanel.getBoundingClientRect();
      this._zoom(rect.right / 2, rect.bottom / 2, 0.05, false);
    },

    on_zoom_reset_button: function() {
      this.zoom_y = 0;
      this.zoom_x = 0;
      this.zoom_scale = 1.0;
      this.$nextTick(() => {
        this.arrange_boxes();
      });
    },

    on_zoom_in_button: function() {
      const rect = this.$refs.canvaspanel.getBoundingClientRect();
      this._zoom(rect.right / 2, rect.bottom / 2, 0.05, true);
    },

    newtag_style: function() {
      let ret = this.to_canvas_rect(this.newbox_rect);
      return this.size_style(ret).size_style;
    },

    on_drag_start: function(idx) {
      // does nothing
      return false;
    },

    is_creating: function() {
      return this.status === "new";
    },

    is_active_box: function(idx) {
      return this.active_boxid === idx;
    },

    show_selected_boxes_toggle: function (){
      this.show_selected_boxes = !this.show_selected_boxes;
      this.$nextTick(() => {
       this.arrange_boxes();
      });
    },
    set_selected_flag: function(boxes){
      for (let box of boxes){
        box.selected =false;
      }
      return boxes
    },
    _clean_boxes_in_selected_mode:function(nolabel_idx){
      let pri = this.boxes.slice(0, nolabel_idx);
      let follow = this.boxes.slice(nolabel_idx + 1);
      this.boxes =  [...pri, ...follow];

    },
    // delete box : modify this.boxes when key.event happen ( in on_keyup: )
    delete_boxes_in_selected_mode:function(active_boxid){
      let pri = this.boxes.slice(0, active_boxid);
      let follow = this.boxes.slice(active_boxid + 1);
      this.boxes =  [...pri, ...follow];
    },
    // when(selected-mode) once the box became "active" store the id sothat fefer as "selected : true"
    select_flag_when_selected_mode: function(active_boxid, boxes){
       // new box
       if(active_boxid!=null){
         if(active_boxid === this.boxes.length){
           boxes[active_boxid].selected = true;
         }
       }
      // refer privious state of this.box.selected
      for (var i=0; i<this.boxes.length; i++){
        boxes[`${i}`].selected = this.boxes[`${i}`].selected;
      }
      return boxes
    },
    // when(original-mode to selected-mode) toggle is one to chatch thi function.
    select_flag_from_original: function(active_boxid, boxes){
      if (boxes[active_boxid]){
        for (let box of boxes){
          box.selected =false;
          if (box === boxes[active_boxid]){
            box.selected = true;
          }
        }
      }
      return boxes
    },

    get_box: function(id) {
      return this.active_image_tag_boxes[id];
    },
    get_box_label: function(id) {
      if(!this.boxes[id]){
        return false;
      }
      return this.get_box(id).label;
    },

    to_canvas_rect: function(rc) {
      let [l, t, r, b] = utils.normalize_rect(rc);

      [[l, t], [r, b]] = utils.client_to_node(this.$refs.canvaspanel, [
        [l, t],
        [r, b]
      ]);
      return [l, t, r, b];
    },
    apply_annotation: function() {
      if (this.active_image_tag_boxes.length == 0) {
        this.delete_xml();
      } else {
        this.save_annotation();
      }
    },
    on_resize: function() {
      setTimeout(this.arrange_boxes, 10);
    },

    on_keyup: function(event) {
      if (event.target.nodeName === "BODY") {
        if (event.key === " ") {
          if (this.can_be_saved) {
            this.apply_annotation();
            event.preventDefault();
            event.stopPropagation();
          }
          return false;
        }
        if (this.has_image && this.active_boxid !== null) {
          if (event.key === "Delete" || event.key === "Backspace") {
            this.delete_boxes_in_selected_mode(this.active_boxid);

            this.$store.commit("remove_tagbox", { boxid: this.active_boxid });
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
        if(event.ctrlKey === true && event.key === "d"){
          this.show_selected_boxes_toggle();
        }
      }
    },

    on_keydown: function(event) {
      if (event.target.nodeName === "BODY") {
        if (this.has_image && this.active_boxid !== null) {
          if (!this.has_image) {
            return;
          }

          if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
          ) {
            let [ratio, imgrc] = this.calc_image_rect();

            let boxid = this.active_boxid;
            let box = this.get_box(boxid);

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
            this.$store.commit("set_tagbox", {
              boxid: boxid,
              box: box
            });
          } else {
            for (let label of this.labels) {
              if (label.shortcut === event.key) {
                this.$store.commit("set_activebox_label", label);
                event.preventDefault();
                event.stopPropagation();
                return false;
              }
            }
          }
        }
      }
    },

    size_style: function(rc) {
      const size_style = {};
      size_style.left = `${rc[0]}px`;
      size_style.top = `${rc[1]}px`;
      size_style.width = `${rc[2] - rc[0]}px`;
      size_style.height = `${rc[3] - rc[1]}px`;
      return {size_style}
    },

    calc_image_rect: function() {
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

    box_to_client: function(box) {
      let [ratio, imgrc] = this.calc_image_rect();
      const l = Math.floor(box.left * ratio + imgrc[0]);
      const t = Math.floor(box.top * ratio + imgrc[1]);
      const r = Math.floor(box.right * ratio + imgrc[0]);
      const b = Math.floor(box.bottom * ratio + imgrc[1]);
      return [l, t, r, b];
    },
    client_to_box: function(rect) {
      let [left, top, right, bottom] = utils.normalize_rect(rect);
      let [ratio, imgrc] = this.calc_image_rect();
      left = Math.floor((left - imgrc[0]) / ratio);
      top = Math.floor((top - imgrc[1]) / ratio);
      right = Math.floor((right - imgrc[0]) / ratio);
      bottom = Math.floor((bottom - imgrc[1]) / ratio);

      return { left, top, right, bottom };
    },
    arrange_boxes: function() {
      let boxes = [];
      if (!this.$refs.canvas || !this.active_image_tag_boxes) {
        return;
      }
      for (let box of this.active_image_tag_boxes) {
        const rc = this.to_canvas_rect(this.box_to_client(box));
        boxes.push(
          this.size_style([
            rc[0] - this.BOX_MARGIN,
            rc[1] - this.BOX_MARGIN,
            rc[2] + this.BOX_MARGIN,
            rc[3] + this.BOX_MARGIN
          ])
        );
      }
      if (this.boxes===null){
        boxes=this.set_selected_flag(boxes);
        this.boxes = boxes;
      }else{
        if (this.show_selected_boxes===true){
          boxes = this.select_flag_when_selected_mode(this.active_boxid, boxes);
          this.boxes = boxes;
        }else{
          if (this.active_boxid!=null) {
            boxes = this.select_flag_from_original(this.active_boxid,boxes);
          }else{
            boxes=this.set_selected_flag(boxes);
          }
          this.boxes = boxes;

        }
      }
    },
    _clean_boxes: function() {
      const tagboxes = [];
      for (const [i, box] of this.active_image_tag_boxes.entries()){
        if(box.label){
          tagboxes.push(box);
        }else{
          this._clean_boxes_in_selected_mode(i);
        }
      }
      this.$store.commit("set_tagboxes", { tagboxes });
    },
    on_down_middle: function(e) {
      this.image_drag_status = true;
      this.image_dragform_x = e.clientX;
      this.image_dragform_y = e.clientY;
    },
    on_move_middle: function(e) {
      if (this.image_drag_status) {
        const [ratio, rect] = this.calc_image_rect();
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
          this.arrange_boxes();
        });
      }
    },
    on_up_middle: function(e) {
      this.image_drag_status = false;
    },

    on_click: function(event) {
      if (!this.has_image) {
        return;
      }

      const [, rc] = this.calc_image_rect();
      rc[2] = rc[2] - 1;
      if (!utils.pt_in_rect(rc, event.clientX, event.clientY)) {
        return;
      }
      this._clean_boxes();

      if (this.active_boxid!=null){
        this.set_active_boxid({
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
      utils.addEventListenerOnce(document, "mouseup", this.end_drag, true);
    },

    box_getcursor_type: function(box_border, x, y) {
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
    on_boxclick: function(event) {
      const boxid = event.currentTarget.dataset.boxid;
      if (boxid !== this.active_boxid) {
        this._clean_boxes();
      }
      const tag = this.get_box(boxid);
      if (!tag) {
        return;
      }
      const resize = this.box_getcursor_type(
        event.currentTarget,
        event.clientX,
        event.clientY
      );
      if (resize === "") {
        this.status = "dragging";
      } else {
        this.status = resize;
      }
      this.set_active_boxid({ boxid: parseInt(boxid) });
      const box = this.get_box(this.active_boxid);
      this.org_boxrc = this.box_to_client(box);
      [this.dragfrom_x, this.dragfrom_y] = [event.clientX, event.clientY];

      utils.addEventListenerOnce(document, "mouseup", this.end_drag, true);
    },

    dir_to_cursor(dir) {
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

    on_boxmousemove: function(event) {
      let status = this.status;
      if (!status) {
        status = this.box_getcursor_type(
          event.currentTarget,
          event.clientX,
          event.clientY
        );
      }
      let cursor = this.dir_to_cursor(status);
      if (!cursor) {
        cursor = "move";
      }
      event.target.style.cursor = cursor;
    },
    on_mousemove: function(event) {
      if (!this.has_image) {
        return;
      }
      let [, imgrc] = this.calc_image_rect();
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
        const curbox = this.get_box(this.active_boxid);
        const newbox = { ...curbox, ...this.client_to_box(rc) };
        this.$store.commit("set_tagbox", {
          boxid: this.active_boxid,
          box: newbox
        });
      }
    },
    end_drag: function() {
      if (this.status === "new") {
        const box = this.client_to_box(this.newbox_rect);
        if (box.left !== box.right && box.top !== box.bottom) {
          this.$store.commit("new_tagbox", { box });
          this.set_active_boxid({
            boxid: this.active_image_tag_boxes.length - 1
          });
        } else {
          this.set_active_boxid({
            boxid: null
          });
        }
      }

      this.status = "";
    },

    get_reviewstatus: function() {
      const prior_scale = this.zoom_scale;
      if (this.active_image_review_result === "ok") {
        return "reviewok";
      } else if (this.active_image_review_result === "nh") {
        return "reviewng";
      }
      return "notreviewed";
    },
    zoom_image: function(e) {
      this._zoom(e.clientX, e.clientY, 0.05, e.deltaY > 0);
    }
  }
};
</script>

<style lang='scss' scoped>
#canvasblock {
  flex-grow: 1;
  background: #fff;
}
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
      width: 33.33%;
      i-align: center;
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
  // display: flex;
  color: #666;
  justify-content: center;
  align-items: center;
  width: 100%;
  // margin-top: $component-margin-top;

  .check-button {
    height: $panel-height;
    width: 38px;
    background: #fff;
    border-color: #000;
  }

  .form-control.not_admin:focus {
      box-shadow: none;
  }
  .admin,.not_admin {
    cursor: pointer;
  }
  .not_admin {
    // border:none;
    // background: #fff;
  }
  .comment-wrapper{
    padding: 0 50px;
    width: 70%;
    .comment-area {
      width: 100%;
    }
  }

  .form-control {
    resize: none;
    height: 90px;
    border-radius: 0px;
  }
  .review_checked {
    background-color: #a2c84a;
  }
  .align-bottom{
    display: inline-block;
    vertical-align: bottom;
  }
  #toggle {
    display: inline-block;
    height: calc(#{$panel-height} * 0.8);
    position: absolute;
    bottom: 0;
    right: 10px;
    .switch {
      height: calc(#{$panel-height} * 0.8);
      width: 55px;
      input[type=checkbox]{
        line-height: calc(#{$panel-height} * 0.8);
        opacity:0;
        width:0;
        height:0;
        &.checked+.slider{
          background-color:#006ea1;
          &:before{
            transform: translateX(26px);
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
      transition: .4s;

      &:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
      }
    }

  }
  #buttons{
    margin: auto;
    .filename {
      text-align: right;
    }
    .btn-wrp {
      display: inline-block;
      width: calc(55px * 2);

    }
    .btn-wrp > p{
        display: inline-block;
        margin: 0px;
    }
    .ok-button {
      &:hover,
      &-push {
        background: #ff4949!important
      }
    }
    .ng-button {
      &:hover,&-push {
        background: #000!important
      }
    }
    .ng-button,.ok-button{
      cursor: pointer;
      background: #999;
      padding:10px;
      color: #fff;
      width: 53px;
      font-size:0.8rem;
      text-align: center;
      line-height:5px;
    }

    .img-btn {
      height: 23px;
      cursor: pointer;
    }
    .img-btn-disabled {
      height: 23px;

      &:hover {
        cursor: not-allowed;
        background: #999!important;
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

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}
</style>
