<template>
  <div id="page">
    <div id="all-elements" v-show="this.all_image_mode === false">
      <app-header class="row"></app-header>
      <div id='main-container'>
        <left-menu></left-menu>
        <image-list class="folder-image" v-if="folder.length !== 0"/>
        <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
        <div v-else id="no_active_image" class="filler">
          <div id='loading' v-if='(this.folder.length != 0) && (this.image_list.length === 0)'>
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
    <div id="all-image"  v-show="this.all_image_mode === true">
      <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
      <div v-else id="no_active_image" class="filler">
        <div id='loading' v-if='(this.folder.length != 0) && (this.image_list.length === 0)'>
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
import { mapState, mapMutations } from "vuex";
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
      "folder",
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
    }
  },
  methods: {
    ...mapMutations(["set_error_status"]),
    ...mapMutations(["set_undef_file_message"]),
    ...mapMutations(["set_dup_file_message"]),
    messageCounter: function() {
      var counter = this.make_dir_message_counter;
      console.log(counter);
      counter = counter + 1;
      this.$store.commit("set_make_dir_message_counter", {
        make_dir_message_counter: counter
      });
    },
    makeDir: function() {
      this.$store.commit("set_make_dir_message", {
        make_dir_message: "message\n\ncreating directories..."
      });
      this.$store.dispatch("make_dir");
    },
    setModal: function() {
      var counter = this.make_dir_message_counter;
      if (counter === 0) {
        this.$store.commit("set_make_dir_message", {
          make_dir_message: "message\n\nInput your username"
        });
        this.messageCounter();
      } else if (counter === 1) {
        this.makeDir();
        this.messageCounter();
      } else if (counter > 1) {
        location.reload();
      }
    },
    cancelModal: function() {
      this.$store.commit("set_make_dir_message", { make_dir_message: "" });
      this.$store.commit("set_make_dir_message_counter", {
        make_dir_message_counter: 0
      });
    },
    on_keyup: function(event){
      if(event.ctrlKey === true && event.key === "w"){
        console.log("hello")
        let shift = !this.all_image_mode
        this.$store.commit("set_all_image_mode", {all_image_mode : shift});
      }
    }
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
    window.addEventListener("keyup", this.on_keyup);
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.on_keyup);
  }
};
</script>

<style lang='scss'>
#page {
  width: 100%;
  height: 100%;
  background: $body-color;
}

#all-elements{
  height: 100%;
}
#all-image{
  height: 100%;
  transition-delay: 2s;
}
#main-container {
  display: flex;
  height: calc(100% - #{$application-header-hight} - #{$footer-height} - 125px);
}

// .fade-enter-active {
//   transition: all  ease;
// }
// .fade-leave-active {
//   transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
// }

// .fade_page-enter, .fade_page-leave-to /* .fade-leave-active below version 2.1.8 */ {
//   opacity: 0;
// }

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
