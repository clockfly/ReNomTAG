<template>
  <div id='canvasblock'>
    <div id="canvaspanel" ref="canvaspanel"
        @mousedown.stop='on_click'
        @mousemove.stop.prevent='on_mousemove'>

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
    </div>

    <div id='imageinfo'>
      <div>{{img_file_name}}</div>
      <button id="save_xml_btn"
        :disabled="!canbesaved"
        @click='save_tags'>
        Save <span class="save_xml_btn_arrow">&gt;&gt;</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import * as utils from "@/utils";

export default {
  data: function() {
    return {
      BOX_MARGIN: 2, // margin between box and box-border
      BOX_BORDER: 3, // width of border of box
      status: "", // one of 'new', 'moving', 'n', 'nw', ...

      dragfrom_x: null, // x pos in client coord
      dragfrom_y: null, // y pos in client coord

      newbox_rect: null, // rect of new box in client coord
      org_boxrc: null,
      boxes: null
    };
  },

  created: function() {
    window.addEventListener("resize", this.on_resize);
    window.addEventListener("keyup", this.on_keyup);
    window.addEventListener("keydown", this.on_keydown);
  },

  beforeDestroy: function() {
    window.removeEventListener("resize", this.on_resize);
    window.removeEventListener("keydown", this.on_keydown);
  },
  mounted: function() {
    setTimeout(this.arrange_boxes, 20);
  },
  computed: {
    ...mapState([
      "active_image_filename",
      "active_image",
      "active_image_height",
      "active_image_width",
      "active_image_tag_boxes",
      "active_boxid",
      "labels"
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
    canbesaved: function() {
      if (this.active_image_tag_boxes.length === 0) {
        return false;
      }
      for (let box of this.active_image_tag_boxes) {
        if (!box.label) {
          return false;
        }
      }
      return true;
    }
  },
  watch: {
    active_image_tag_boxes: function() {
      this.arrange_boxes();
    }
  },
  methods: {
    ...mapMutations(["set_active_boxid"]),

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

    on_resize: function() {
      this.arrange_boxes();
      setTimeout(this.arrange_boxes, 10);
    },

    on_keyup: function(event) {
      if (event.target.nodeName === "BODY") {
        if (event.key === " ") {
          if (this.canbesaved) {
            this.save_tags();
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
        if (this.has_image && this.active_boxid !== null) {
          if (event.key === "Delete" || event.key === "Backspace") {
            this.$store.commit("remove_tagbox", { boxid: this.active_boxid });
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
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
    },
    on_keydown: function(event){
      if (this.has_image && this.active_boxid !== null) {
        if (!this.has_image) {
            return;
          }
          let [ratio, imgrc] = this.calc_image_rect();

          let boxid = this.active_boxid;

          let box = this.get_box(boxid);

          switch (event.key) {
            case "ArrowUp":
              if(box.top > 0){
                box.top -= 1
                box.bottom -= 1;
              }
              break;
            case "ArrowDown":
              if (this.active_image_height > box.bottom){
                box.top += 1
                box.bottom += 1;
              }
              break;
            case "ArrowLeft":
              if(box.left > 0){
                box.left -= 1;
                box.right -= 1;
              }
              break;
            case "ArrowRight":
                if(box.right < this.active_image_width){
                  box.left += 1;
                  box.right += 1;
                }
              break;
            default:
                break;
          }

          this.$store.commit("set_tagbox", {
            boxid: boxid,
            box: box
          });
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
        }
      }

      this.status = "";
    },

    save_tags: function() {
      this.$store.dispatch("save_annotation");
    }
  }
};
</script>

<style lang='scss' scoped>
#canvasblock {
  flex-grow: 1;
}

#canvaspanel {
  flex-grow: 1;
  display: flex;
  position: relative;
  height: calc(100% - 100px);

  #canvas {
    margin: auto;
    width: 90%;
    max-width: 90%;
    max-height: 90%;
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
      border: solid #73dd00 3px;
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
    border: solid red 3px;
  }
}

#imageinfo {
  display: flex;
  color: #666;
  justify-content: center;
  align-items: center;

  #save_xml_btn {
    background-color: #326699;
    border-radius: 5px;
    color: #fff;
    padding: 3px 15px;
    margin-left: 10px;
    .save_xml_btn_arrow {
      margin-left: 5px;
    }

    &:hover {
      background-color: lighten(#326699, 10%);
      cursor: pointer;
    }

    &:disabled {
      background-color: #adadad;
    }
  }
}
</style>
