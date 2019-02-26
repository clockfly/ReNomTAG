<template>
<div class='navarrow' @click="on_click">
  <div v-if='next_file' :class="['arrow', dir+'_arrow']"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "NavArrow",
  props: ["dir"],
  created(){
    window.addEventListener("keydown", this.on_keydown);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.on_keydown);
  },
  computed: {
    ...mapState(["files", "active_image_filename","active_boxid"]),
    next_file: function() {
      if (this.dir === "back") {
        return this.get_back_name();
      } else {
        return this.get_fore_name();
      }
    }
  },
  methods: {
    get_back_name() {
      const idx = this.files.indexOf(this.active_image_filename);
      if (idx > 0) {
        return this.files[idx - 1];
      }
    },

    get_fore_name() {
      const idx = this.files.indexOf(this.active_image_filename);
      if (idx !== -1 && idx < this.files.length - 1) {
        return this.files[idx + 1];
      }
    },

    on_click: function(event) {
      const next = this.next_file;
      if (next) {
        this.$store.dispatch("load_current_image", next);
      }
    },
    on_keydown: function(event){
      if (this.active_boxid===null) {
        switch(event.key){
          case "ArrowLeft":
            const back = this.get_back_name();
            if (back) {
              this.$store.dispatch("load_current_image", back);
            }
            break;
          case "ArrowRight":
            const fore = this.get_fore_name();
            if (fore) {
              this.$store.dispatch("load_current_image", fore);
            }
            break;
        }
      }
    }
  }
};
</script>

<style lang='scss'>
.navarrow {
  position: relative;
  width: 30px;
  height: 60px;
  flex-grow: 0;
  flex-shrink: 0;

  cursor: pointer;

  .arrow {
    position: relative;
    display: inline-block;
    padding-left: 0px;
    bottom: 0;

    &:before {
      content: "";
      width: 25px;
      height: 25px;
      border: 0;

      position: absolute;
      top: 50%;
      left: 0px;
      margin-top: -4px;
    }
  }

  .forward_arrow::before {
    border-top: solid 2px #c2c2c2;
    border-right: solid 2px #c2c2c2;
    -ms-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    left: -10px;
  }

  .back_arrow::before {
    margin-left: 10px;

    border-top: solid 2px #c2c2c2;
    border-left: solid 2px #c2c2c2;
    -ms-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
}
</style>
border
