<template>
  <div id="page">
    <app-header class="row"></app-header>
    <div id='main-container'>
      <left-menu></left-menu>
      <image-list class="folder-image" v-if="folder.length !== 0"/>
      <div v-if="active_image_filename === null" class="filler"></div>
      <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
      <div id="no_active_image" v-else></div>
      <tags></tags>
    </div>
    <tagged-images class="row"/>
    <app-footer class="row" ></app-footer>
    <modal-box v-if='error_status'>
      <div slot='contents' class='error-msg'>
        {{error_status}}
      </div>
      <div slot='footer'>
        <button class='error-button' @click='set_error_status({error_status: ""})'>close</button>
      </div>
    </modal-box>

  </div>

</template>

<script>
import AppHeader from "./header.vue";
import LeftMenu from "./leftmenu.vue";
import ImageList from "@/components/imagelist";
import NavArrow from "@/components/navarrow";
import TagCanvas from "./tagcanvas.vue";
import Tags from "./tags.vue";
import TaggedImages from "./taggedimages.vue";
import ModalBox from "@/components/modalbox";
import * as utils from "@/utils";
import { mapState, mapMutations } from "vuex";
import AppFooter from "./footer.vue";
export default {
  components: {
    "app-header": AppHeader,
    "left-menu": LeftMenu,
    "image-list": ImageList,
    tagcanvas: TagCanvas,
    tags: Tags,
    "tagged-images": TaggedImages,
    navarrow: NavArrow,
    "modal-box": ModalBox,
    "app-footer": AppFooter
  },
  computed: {
    ...mapState([
      "folder",
      "folder_list",
      "active_image_filename",
      "error_status"
    ])
  },
  methods: {
    ...mapMutations(["set_error_status"])
  },

  created: function() {
    this.$store.dispatch("load_folder_list").then(() => {
      const foldername = utils.cookies.getItem("tags-foldername");

      if (foldername) {
        if (this.folder_list.indexOf(foldername) !== -1) {
          this.$store.dispatch("set_folder", foldername);
        }
      }
    });
  }
};
</script>
<style lang='scss'>
#page {
  width: 100%;
  height: 100%;
  background: $body-color;
}

#main-container {
  display: flex;
  height: calc(100% - #{$application-header-hight} - 125px - #{$footer-height});
}

#no_active_image {
  flex-grow: 1;
  background: #fff;
}
.left {
  text-align: center;
}
.right {
  text-align: center;
}
.error-msg {
  white-space: pre-line;
  word-wrap: break-word;
  text-align: center;
  font-weight: bold;
  margin-bottom: 0;
}

.error-button {
  margin-bottom: 0;
  text-align: right;
  font-weight: normal;
}
</style>
