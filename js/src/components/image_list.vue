<template>
  <div id="imagelistblock">
    <div v-if='file_list.length == 0' id=msg_no_image>
      {{loading_message}}
    </div>
    <div id="imagelist" @scroll="on_scroll">
      <img v-for="file in file_list_top" :key="file"
           :src='get_image_url(file)'
           :data-file='file'
           :class='{selected: is_selected(file)}'
           @click.stop.prevent="select_image">
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as utils from "@/utils";

export default {
  created: function() {
    this.$store.dispatch("load_imagefile_list");
  },
  computed: {
    ...mapState(["loading_message", "files", "filename_max_display", "active_image_filename"]),

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
      return ret;
    }
  },
  watch: {
    active_image_filename: function(newvalue, oldvalue) {
      let n = this.files.indexOf(newvalue);
      if (n == -1) {
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
    get_image_url(file) {
      return utils.build_api_url("/t/" + file);
    },
    is_selected(filename) {
      return filename == this.active_image_filename;
    },
    select_image(event) {
      if (event.target.dataset.file !== this.active_image_filename) {
        this.$store.dispatch("load_current_image", event.target.dataset.file);
      }
    },
    on_scroll: function(event) {
      let MARGIN = 100;
      if (this.filename_max_display < this.files.length) {
        let n = this.filename_max_display - MARGIN;
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

        if (imgrc.top < wrapperrc.top) {
          this.$store.commit("set_filename_max_display", {
            max_display: this.filename_max_display + 300
          });
        }
      }
    }
  }
};
</script>

<style scoped lang='scss'>
#imagelistblock {
  width: 400px;
  box-sizing: border-box;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  padding: 3px;
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

#imagelist {
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  box-sizing: border-box;
  height: 100%;
  align-content: flex-start;
  justify-content: space-between;

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
