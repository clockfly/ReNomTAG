<template>
  <div id='canvasblock'>
    <!-- TODO -->
    <div id='toggle'>
      <label class="switch">
        <input type="checkbox">
        <span class="slider" v-on:click="toggle"></span>
      </label>
    </div>
    <div id="canvaspanel" ref="canvaspanel"
        @mousedown.stop='on_click'
        @mousemove.stop.prevent='on_mousemove'>

      <navarrow class="arrow" dir="back"/>
      <img v-if="has_image" id="canvas" ref="canvas" :src="image_url"
       @dragstart.stop.prevent="on_drag_start">
      <div v-if="is_creating()" id="newtag" :style="newtag_style()" />
      <div v-for="(tagstyle, idx) in boxes" :key="idx"
          :style='tagstyle'
          class='box-border'
          :data-boxid='idx' @mousedown.stop.prevent='on_boxclick'
          @mousemove='on_boxmousemove'>
        <div :class="['box', is_active_box(idx) ? 'box-active':'']">
          <div class='taglabel'>{{get_box_label(idx)}}</div>
        </div>
      </div>

      <navarrow class="arrow" dir="forward"/>
    </div>
    <p id="demo"></p>

    <div>
      <div id='imageinfo' class="row">

        <div class="col-md-6 col-md-offset-2">
          <div class="comment-area">
            <textarea class="form-control" :class="{not_admin: !is_admin}" v-model="active_image_review_comment" :readonly="!this.is_admin"></textarea>
          </div>
        </div>
        <div class= "col-md-3 row">
          <div class="col-md-12 row clear-padding">
            <span class="col-md-12 text-right clear-padding"> {{img_file_name}} </span>
            <div class="col-md-12 clear-padding">
              <div v-if="this.is_admin" class="btn-wrp">
                <p v-if="can_be_saved && this.active_image_review_result !== 'ng'"
                      class="img-btn float-right ng-button"
                      @click="set_review_result({result:'ng'})">
                      NG
                </p>
                <p v-else-if="can_be_saved && this.active_image_review_result === 'ng'"
                      class="img-btn float-right ng-button ng-button-push"
                      @click="set_review_result({result:'ng'})">
                  NG
                </p>
                <p v-else class="img-btn-disabled float-right ng-button">
                  NG
                </p>
                <p v-if="can_be_saved && this.active_image_review_result !== 'ok'"
                      class="img-btn float-right ok-button"
                      :class="{review_checked: this.active_image_review_result === 'ok'}"
                      @click="set_review_result({result:'ok'})">
                  OK
                </p>
                <p v-else-if="can_be_saved && this.active_image_review_result === 'ok'"
                      class="img-btn float-right ok-button ok-button-push"
                      @click="set_review_result({result:'ok'})">
                  OK
                </p>
                <p v-else class="img-btn-disabled float-right ok-button">
                  OK
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-12 button-margin-top row clear-padding">
            <div class="col-md-12 clear-padding">
              <div v-if="can_be_saved" id="save_xml_btn"
                class="float-right"
                @click='apply_annotation'>
                Save
              </div>
              <div v-else id="save_xml_btn_disabled"
                class="float-right">
                Save
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
      OK_BUTTON: require("../assets/images/OK_button.png"),
      NG_BUTTON: require("../assets/images/NG_button.png"),
      OK_BUTTON_PUSH: require("../assets/images/OK_push.png"),
      NG_BUTTON_PUSH: require("../assets/images/NG_push.png")
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
    setTimeout(this.arrange_boxes, 20);
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
      for(let tag of this.tagged_images){
        if(tag.filename == this.active_image_filename){
          has_tag = true;
        }
      }
      //tagをもともと持っていた場合はboxesが0でもsaveの対象とする
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
    active_image_review_comment: {
      get() {
        return this.$store.state.active_image_review_comment;
      },
      set(value) {
        this.$store.commit("set_review_comment", { comment: value });
      }
    }
  },
  watch: {
    active_image_tag_boxes: function() {
      this.arrange_boxes();
    }
  },
  methods: {
    ...mapMutations(["set_active_boxid", "set_review_result"]),
    ...mapActions(["save_annotation","delete_xml"]),

    newtag_style: function() {
      let ret = this.to_canvas_rect(this.newbox_rect);
      return this.size_style(ret);
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

    get_box: function(id) {
      return this.active_image_tag_boxes[id];
    },

    get_box_label(id) {
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
    apply_annotation: function(){
      if(this.active_image_tag_boxes.length == 0){
        this.delete_xml();
      }else{
        this.save_annotation();
      }
    },
    on_resize: function() {
      this.arrange_boxes();
      setTimeout(this.arrange_boxes, 10);
    },

    on_keyup: function(event) {
      if (event.target.nodeName === "BODY") {
        if (event.key === " ") {
          if (this.can_be_saved) {
            this.save_annotation();
            event.preventDefault();
            event.stopPropagation();
          }
          return false;
        }
        if (this.has_image && this.active_boxid !== null) {
          if (event.key === "Delete" || event.key === "Backspace") {
            this.$store.commit("remove_tagbox", { boxid: this.active_boxid });
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
      }
    },

    on_keydown: function(event) {
      if (event.target.nodeName === "BODY") {
        if (this.has_image && this.active_boxid !== null) {
          if (!this.has_image) {
            return;
          }

          if((event.key === "ArrowUp") || (event.key === "ArrowDown") || (event.key === "ArrowLeft") || (event.key === "ArrowRight")){
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

          }else{
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
      const left = `${rc[0]}px`;
      const top = `${rc[1]}px`;
      const width = `${rc[2] - rc[0]}px`;
      const height = `${rc[3] - rc[1]}px`;
      return {
        left,
        top,
        width,
        height
      };
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
      const boxes = [];
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
      this.boxes = boxes;
    },

    _clean_boxes: function() {
      const tagboxes = [];
      for (let box of this.active_image_tag_boxes) {
        if (box.label) {
          tagboxes.push(box);
        }
      }
      this.$store.commit("set_tagboxes", { tagboxes });
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
      // TODO
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
      if (this.active_image_review_result === "ok") {
        return "reviewok";
      } else if (this.active_image_review_result === "nh") {
        return "reviewng";
      }
      return "notreviewed";
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
//  TODO:
#toggle {
  height: 30px;
  display: flex;
  position: relative;
  .switch {
    position: absolute;
    display: inline-block;
    width: 55px;
    height: 28px;
    input[type=checkbox]{
      opacity:0;
      width:0;
      height:0;
      &:checked+.slider{
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
    background-color: #ccc;
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
#canvaspanel {
  flex-grow: 1;
  display: flex;
  position: relative;
  height: calc(100% - 150px + calc(#{$component-margin-top}));
  .arrow {
    margin-top: 25%;
  }
  #canvas {
    margin: auto;
    margin-top: $component-margin-top;
    width: 90%;
    max-width: 90%;
    max-height: 95%;
    flex-grow: 0;
    flex-shrink: 0;
    object-fit: contain;
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
  margin-top: $component-margin-top;

  .not_admin {
    border:none;
    background: #fff;
  }
  .form-control.not_admin:focus {
      box-shadow: none;
  }
  .admin {
    cursor: pointer;
  }

  .filename {
    text-align: right;
  }
  .check-button {
    height: $panel-height;
    width: 38px;
    background: #fff;
    border-color: #000;
  }
  .ok-button {
    margin-right: 7px;
    &:hover,
    &-push {
      background: #ff4949!important
    }
  }
  .ng-button {
    margin-left: 7px;
    margin-right: 0px;
    &:hover,&-push {
      background: #000!important
    }
  }
  .ng-button,.ok-button{
    cursor: pointer;
    background: #999;
    padding:10px;
    color: #fff;
    width: 48px;
    font-size:0.8rem;
    text-align: center;
    line-height:5px;
    margin-top: 0;
    margin-bottom: 0;
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

  .comment-area {
    padding-right: 20px;
  }
  .form-control {
    resize: none;
    height: 90px;
    border-radius: 0px;
  }
  .review_checked {
    background-color: #a2c84a;
  }
  .button-margin-top {
    margin-top: calc(#{$content-top-margin} * 0.5);
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
  .btn-wrp {
    margin-top: $content-top-margin;
  }
}
</style>
