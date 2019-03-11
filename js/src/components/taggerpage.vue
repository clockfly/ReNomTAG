<template>
  <div id="page">
    <div id="all-elements" v-if="!this.isAllImageMode">
      <app-header class="row"></app-header>
      <div id='main-container'>
        <left-menu></left-menu>
        <image-list class="folder-image" v-if="folder"/>
        <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
        <div v-else id="no_active_image" class="filler">
          <div id='loading' v-if='!folder || !image_list || image_list.length === 0'>
            <div v-if='img_status.code!= IMG_STATUS.LOADING.code' class="msg_no_image">
              {{img_status.message}}
            </div>
            <div v-else-if='img_status.code == IMG_STATUS.LOADING.code' class="msg_no_image">
              <div class="sk-wave">
                <div class="sk-rect sk-rect1"></div>
                <div class="sk-rect sk-rect2"></div>
                <div class="sk-rect sk-rect3"></div>
                <div class="sk-rect sk-rect4"></div>
                <div class="sk-rect sk-rect5"></div>
              </div>
            </div>
          </div>
        </div>
        <tags></tags>
      </div>
      <tagged-images class="row"/>
      <app-footer class="row" ></app-footer>
    </div>

    <transition name="fade">
      <div id="all-image"  v-if="this.isAllImageMode">
        <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
        <div v-else id="no_active_image" class="filler">
          <div id='loading' v-if='!folder || !image_list || image_list.length === 0'>
            <div v-if='img_status.code!= IMG_STATUS.LOADING.code' class="msg_no_image">
              {{img_status.message}}
            </div>
            <div v-else-if='img_status.code == IMG_STATUS.LOADING.code' class="msg_no_image">
              <div class="sk-wave">
                <div class="sk-rect sk-rect1"></div>
                <div class="sk-rect sk-rect2"></div>
                <div class="sk-rect sk-rect3"></div>
                <div class="sk-rect sk-rect4"></div>
                <div class="sk-rect sk-rect5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>




    <modal-box v-if='notice_status.message'>
      <div slot='contents' class='mkdir-msg' >
        {{notice_status.message}}
        <input v-model="setUsername" v-if='make_dir_message_counter===1' class="modal__contents__input" type="text">
      </div>
      <div slot='okbutton'>
        <button v-if='make_dir_message_counter <= 1' @click='setNoticeStatus()' class="ok-button">
          OK
        </button>
        <button v-if='make_dir_message_counter > 1' @click='setNoticeStatus()' class="load-button">
          Load
        </button>
      </div>
      <div slot='cancelbutton'>
        <button v-if='make_dir_message_counter <= 1' @click='clearNoticeStatus()' class="cancel-button">
          Cancel
        </button>
      </div>
    </modal-box>

    <modal-box v-if='error_status.message'>
      <div slot='contents' class='error-msg'>
        {{error_status.message}}
      </div>
      <div slot='footer'>
        <button class='error-button' @click='clearErrorStatus()'>close</button>
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
import { mapActions, mapState, mapMutations } from "vuex";
import AppFooter from "./footer.vue";
import {ERROR, IMG_STATUS, NOTICE} from '@/const.js'

export default {
  data: function(){
    return {
      make_dir_message_counter: 0,
      ERROR,
      IMG_STATUS,
      NOTICE
    };
  },
  components: {
    "modal-box": ModalBox,
    "app-header": AppHeader,
    "left-menu": LeftMenu,
    "image-list": ImageList,
    tagcanvas: TagCanvas,
    tags: Tags,
    "tagged-images": TaggedImages,
    navarrow: NavArrow,
    "app-footer": AppFooter
  },
  computed: {
    ...mapState([
      "all_image_mode",
      "folder_list",
      "active_image_filename",
      "error_status",
      "notice_status",
      "working_dir",
      "username",
      "folder",
      "img_status",
      "image_list"
    ]),
    setUsername: {
      get() {
        return this.$store.state.username;
      },
      set(e) {
        this.$store.commit("set_username", { username: e });
      }
    },
    isAllImageMode: function() {
      return (
         ![null, undefined].includes(this.active_image_filename) &&
        this.all_image_mode
      );
    }
  },
  methods: {
    ...mapMutations([
      "set_error_status",
      "set_notice_status"
    ]),
    ...mapActions(["init_client", "make_dir", "load_folder_list"]),
    messageCounter: function() {
      let counter = this.make_dir_message_counter;
      counter = counter + 1;
      this.make_dir_message_counter = counter;
    },
    mkdir: function() {
      this.set_notice_status({
        code: 115,
        message: "Message\n\nCreating directories..."
      });
      this.make_dir();
    },
    setNoticeStatus: function() {
      let counter = this.make_dir_message_counter;
      if (counter === 0) {
        this.set_notice_status({
          code: 115,
          message: "Message\n\nInput your username"
        });
        this.messageCounter();
      } else if (counter === 1) {
        this.mkdir();
        this.messageCounter();
      }else if (counter > 1) {
        location.reload();
      }
    },
    clearNoticeStatus: function() {
      this.set_notice_status({ code:null, message:""})
      this.make_dir_message_counter = 0;
    },
    clearErrorStatus: function(){
      this.set_error_status({ code:null, message:"" });
    }
  },
  created: function() {
    this.init_client();
  }
};
</script>

<style lang='scss'>
#page {
  width: 100%;
  height: 100%;
  background: #2e2f30;
}

#all-elements {
  height: 100%;
  background: $body-color;
}
#all-image {
  height: 100%;
  background: #2e2f30;
}
#main-container {
  display: flex;
  height: calc(100% - #{$application-header-hight} - #{$footer-height} - 125px);
}

.fade-enter-active {
  transition: all 0.4s ease-out;
}
.fade-leave-active {
  transition: all 0.4s ease;
}

#no_active_image {
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
  background: #fff;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  #loading {
    .msg_no_image {
      display: inline-block;
      width: 50px;
      height: 40px;
    }
  }
}

.left {
  text-align: center;
}
.right {
  text-align: center;
}
.modal__contents__input {
  display: block;
  margin: auto;
  text-align: center;
  width: 150px;
  height: 25px;
  margin-top: 8px;
}
.error-msg,
.mkdir-msg {
  white-space: pre-line;
  word-wrap: break-word;
  text-align: center;
  font-weight: bold;
  margin-bottom: 0;
}
.error-button,
.ok-button,
.load-button,
.cancel-button {
  margin-bottom: 0;
  text-align: right;
  font-weight: normal;
}
</style>
