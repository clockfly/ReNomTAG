<template>
<div id="tags">
  <div id='tag-list-header'>
    Class List
  </div>
  <form id="add-new-label-form">
    <div class="add-new-label-input-area">
      <input  type="text"
              class="label-text"
              v-model='label'
              placeholder="label name...">

      <input  type="text"
              class="label-shortcut"
              v-model='shortcut'
              @keydown='keydown'
              @keyup='setShortcutKey'
              placeholder="key...">

    </div>
    <div v-if='errormsg' class='label_errormsg'>{{errormsg}}</div>
    <button @click.prevent.stop="addNewLabel" type="button" class="add-new-label-btn" :disabled='!is_valid_label'>Add New Label</button>
  </form>

  <div id='tag-tree'>
    <ul class='tag-list'>
        <li v-for='{label, shortcut} in labels' :key='label'
            class='tag-list-item' @click="on_click" :data-label='label'>
            <!-- this area is dirty. fix it after -->
            <form id="add-new-label-form">
              <div class="add-new-label-input-area">
                <input v-if='edit_mode[0] === label' type="text"
                        class="label-text-update"
                        v-model='edit_label'
                        placeholder="label name...">
                <div v-else class="label-text">{{label}}</div>
                <input v-if="edit_mode[0] === label" type="text"
                        class="label-shortcut-update"
                        v-model='edit_shortcut'
                        @keydown='update_label'
                        @keyup='updateShortcutKey'
                        placeholder="key...">
                <div v-else-if='shortcut' class="label-shortcut">{{shortcut}}</div>
                <i v-if="edit_mode[0] === label" @click.stop.prevent="to_edit_mode" class="fa fa-edit"></i>
                <i v-else @click.stop.prevent="to_edit_mode" class="fa fa-edit"></i>
              </div>
            </form>
            <!-- this area is dirty. fix it after -->
        </li>
        <!-- this area is dirty. fix it after -->
        <div v-if='test_method' class='label_errormsg'>{{test_method}}</div>
        <!-- this area is dirty. fix it after -->
    </ul>

  </div>
  <button @click='show_delete_dialog=true' id='remove-button'>Refresh list</button>

  <modal-box v-if='show_delete_dialog'
    @ok='delete_tags'
    @cancel='show_delete_dialog=false' >
    <div slot='contents'>
      Are you sure flushing class list?
    </div>
    <span slot="okbutton">
      <button id="delete_labels_button" class="modal-default-button"
        @click="delete_tags">
        Delete labels
      </button>
    </span>

  </modal-box>
</div>

</template>

<script>
import { mapState } from "vuex";
import ModalBox from "@/components/modalbox";

export default {
  components: {
    "modal-box": ModalBox
  },

  data: function() {
    return {
      label: "", //add label
      shortcut: "", // add shortcut
      edit_label:"",  // for update labels
      edit_shortcut:"", // for update shortcut
      edit_mode:"", //flags
      show_delete_dialog: false
    };
  },

  computed: {
    ...mapState(["labels"]),

    errormsg: function() {
      if (this.label.length) {
        if (!this.label.match("^[0-9a-z-A-Z]+$")) {
          return "Class name must be alphanumeric single-byte.";
        }
      }
      for (let { label, shortcut } of this.labels) {
        if (label === this.label) {
          return "Please set unique label.";
        }
        if (this.shortcut && shortcut === this.shortcut) {
          return "Shortcut is already exists.";
        }
      }
      return "";
    },

    is_valid_label: function() {
      if (!this.label.length) {
        return false;
      }
      return this.errormsg === "";
    },

    test_method: function(){
      if(this.edit_label.length){
        if (!this.edit_label.match("^[0-9a-z-A-Z]+$")) {
          return "Class name must be alphanumeric single-byte.";
        }
      }

      for (let { label, shortcut } of this.labels) {
        if (label === this.edit_label) {
          return "Please set unique label.";
        }
        if (this.edit_shortcut && shortcut === this.edit_shortcut) {
          return "Shortcut is already exists.";
        }
      }

      return "";
    }
  },

  methods: {
    addNewLabel: function() {
      this.$store.dispatch("add_label", {
        label: this.label,
        shortcut: this.shortcut
      });
      this.label = this.shortcut = "";
      document.body.focus();
    },

    is_control_key(k) {
      const keys = [
        13, // Enter(ten key)
        32, // Space
        8, // BackSpace
        9, // Tab
        46, // Delete
        37, // ←
        38, // →
        39, // ↑
        40 // ↓
      ];
      if (keys.indexOf(k) >= 0) {
        return true;
      } else {
        return false;
      }
    },

    keydown(event) {
      if (event.keyCode === 46 || event.keyCode === 8) {
        // delete or backspace
        this.shortcut = "";
        event.preventDefault();
        return;
      }
      if (!this.is_control_key(event.keyCode)) {
        event.preventDefault();
      }
    },

    setShortcutKey(event) {
      if (this.is_control_key(event.keyCode)) {
        return;
      }

      this.shortcut = event.key;
    },

    on_click(event) {
      const label = event.currentTarget.dataset.label;
      this.$store.commit("set_activebox_label", { label });
    },

    to_edit_mode(event){
      let children = event.currentTarget.parentNode.children;
      let label = children[0].innerText;
      let shortcut = children[1].innerText;
      let mode = [label,shortcut,true];
      //console.log("mode",mode[0]);
      //console.log("label",label);

      this.edit_mode=mode;
      //set flag if shortcut key is not set up
      if (children.length===2){
        mode[2]=false;
      }
    },

    update_label(event){
      let src_label = this.label;
      let src_shortcut = this.shortcut;
      let edit_label = this.edit_label;
      let edit_shortcut = this.edit_shortcut;

      //check flag shortcut is empty
      if(this.edit_mode[2]===true){
        this.edit_shortcut = edit_shortcut;
      }

      if(event.keyCode===13){
        console.log("edit_label:",this.edit_label);
        console.log("edit_shortcut:",this.edit_shortcut);
      }

    },

    updateShortcutKey(event){
      if(this.is_control_key(event.keyCode)){
        return;
      }
      this.edit_shortcut = event.key;
    },

    delete_tags(event) {
      this.$store.commit("set_labels", []);
      this.show_delete_dialog = false;
    }
  }
};
</script>

<style lang='scss'>
#tags {
  box-sizing: border-box;
  width: 250px;
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;

  padding: 0 25px;
  background-color: #f4f4f2;

  #tag-list-header {
    font-size: 18px;
    font-weight: bold;
    width: 200px;
    margin: 0 auto;
    padding: 20px 0 5px 0;
  }

  #add-new-label-form {
    padding: 0;
    margin: 0;
    background: none;
    border: none;
  }

  .add-new-label-input-area {
    display: flex;
    justify-content: space-between;
    border-color: #7d7d7d;
    margin: 0;

    &::-webkit-input-placeholder {
      color: #a6a6a6;
      font-size: 13px;
    }

    input {
      padding: 3px 7px;
      border-color: #7d7d7d;
      margin: 0;
      &::-webkit-input-placeholder {
        color: #a6a6a6;
        font-size: 13px;
      }
    }
    input.label-text {
      width: 130px;
    }
    input.label-shortcut {
      width: 62.5px;
    }
  }

  .add-new-label-btn {
    width: 100%;
    text-align: center;
    padding: 10px 0;
    margin: 10px 0 0 0;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    background-color: #326699;
    color: #fff;
    &:focus {
      outline: none;
    }
    &:hover {
      background-color: lighten(#326699, 10%);
    }
  }

  .add-new-label-btn:disabled {
    background-color: #adadad;
  }

  #tag-tree {
    padding-top: 15px;
    height: calc(100% - 240px);
    overflow-y: auto;
    .tag-list {
      width: 100%;
      height: 100%;
      font-weight: bold;
      box-sizing: border-box;
      list-style: none;
      padding: 0;
      margin: 0;
      border-style: none;
    }
    input {
      padding: 3px 7px;
      border-color: #7d7d7d;
      margin: 0;
      &::-webkit-input-placeholder {
        color: #a6a6a6;
        font-size: 13px;
      }
    }
    input.label-text-update {
      width: 130px;
    }
    input.label-shortcut-update {
      width: 31.125px;
    }

  }

  .tag-list-item {
    width: 100%;
    border-top: 1px solid #797979;
    padding: 5px 10px 5px 10px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;

    &:last-child {
      border-bottom: 1px solid #797979;
    }

    &:hover {
      background-color: #d3d3d3;
    }

    .label-text,
    .label-shortcut {
      padding: 0;
      margin: 0;
      outline: none;
      color: #777777;
    }

    .label-text {
      flex: 1;
    }
    .label-shortcut {
      width: 25px;
      text-align: center;
      color: #3c3c3c;
      background: #fff;
      border: 1px solid #3c3c3c;
      border-radius: 5px;
      margin-right: 5px;
      justify-content: center;
      align-items: center;
    }
  }

  #remove-button {
    width: 60%;
    text-align: center;
    padding: 10px 0;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    background-color: #adadad;
    color: #fff;
    margin-left: auto;

    &:focus {
      outline: none;
    }
    &:hover {
      background-color: lighten(#ff1616, 10%);
    }
  }
  .label_errormsg {
    display: block;
    position: absolute;
    font-weight: bold;
    color: #ff1616;
    font-size: 10pt;
    z-index: 9999;
    background-color: #f2ee63;
    margin: 5px;
    padding: 5px;
    border-radius: 5px;
    right: 20px;
  }
  #delete_labels_button {
    background-color: lighten(#ff1616, 10%);
  }
}
</style>
