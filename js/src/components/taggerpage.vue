<template>
  <div id="page">
    <div id="all-elements" v-if="!this.isAllImageMode">
      <app-header class="row"></app-header>
      <div id='main-container'>
        <left-menu></left-menu>
        <image-list class="folder-image" v-if="folder"/>
        <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
        <div v-else id="no_active_image" class="filler">
          <div id='loading' v-if='(this.folder != (null||undefined)) && (this.image_list.length === 0)'>
            <div v-if='this.loading_message!= "Loading images..."' class="msg_no_image">
              {{loading_message}}
            </div>
            <div v-else-if='this.loading_message==="Loading images..."' class="msg_no_image">
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
          <div id='loading' v-if='(this.folder != (null||undefined)) && (this.image_list.length === 0)'>
            <div v-if='this.loading_message!= "Loading images..."' class="msg_no_image">
              {{loading_message}}
            </div>
            <div v-else-if='this.loading_message==="Loading images..."' class="msg_no_image">
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




    <modal-box v-if='make_dir_message'>
      <div slot='contents' class='mkdir-msg' >
        {{make_dir_message}}
        <input v-model="setUsername" v-if='make_dir_message_counter===1' class="modal__contents__input" type="text">
      </div>
      <div slot='okbutton'>
        <button v-if='make_dir_message_counter <= 1' @click='setModal()' class="ok-button">
          OK
        </button>
        <button v-if='make_dir_message_counter > 1' @click='setModal()' class="load-button">
          Load
        </button>
      </div>
      <div slot='cancelbutton'>
        <button v-if='make_dir_message_counter <= 1' @click='cancelModal()' class="cancel-button">
          Cancel
        </button>
      </div>
    </modal-box>

    <modal-box v-if='undef_file_message'>
      <div slot='contents' class='error-msg'>
        {{undef_file_message}}
      </div>
      <div slot='footer'>
        <button class='error-button' @click='set_undef_file_message({dundef_file_message: ""})'>close</button>
      </div>
    </modal-box>

    <modal-box v-if='dup_file_message'>
      <div slot='contents' class='error-msg'>
        {{dup_file_message}}
      </div>
      <div slot='footer'>
        <button class='error-button' @click='set_dup_file_message({dup_file_message: ""})'>close</button>
      </div>
    </modal-box>

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
import { mapActions, mapState, mapMutations } from "vuex";
import AppFooter from "./footer.vue";

export default {
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
      "make_dir_message",
      "make_dir_message_counter",
      "undef_file_message",
      "dup_file_message",
      "working_dir",
      "username",
      "folder",
      "loading_message",
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
      "set_undef_file_message",
      "set_dup_file_message",
      "set_make_dir_message_counter"
    ]),
    ...mapActions(["init_client", "make_dir", "load_folder_list"]),
    messageCounter: function() {
      let counter = this.make_dir_message_counter;
      counter = counter + 1;
      this.set_make_dir_message_counter({
        make_dir_message_counter: counter
      });
    },
    mkdir: function() {
      this.set_make_dir_message({
        make_dir_message: "Message\n\nCreating directories..."
      });
      this.make_dir();
    },
    setModal: function() {
      let counter = this.make_dir_message_counter;
      if (counter === 0) {
        this.set_make_dir_message({
          make_dir_message: "Message\n\nInput your username"
        });
        this.messageCounter();
      } else if (counter === 1) {
        this.mkdir();
        this.messageCounter();
      } else if (counter > 1) {
        location.reload();
      }
    },
    cancelModal: function() {
      this.set_make_dir_message({ make_dir_message: "" });
      this.set_make_dir_message_counter({
        make_dir_message_counter: 0
      });
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
