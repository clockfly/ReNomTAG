<template>
<div id="tags"> 
  <form v-if="this.is_admin" id="add-new-label-form">
    <div v-if='errormsg' class='label_errormsg'>{{errormsg}}</div>
    <div class="add-new-label-input-area">
      <input  type="text"
              class="label-text"
              v-model='label'
              placeholder="tag name...">

      <input  type="text"
              class="label-shortcut"
              v-model='shortcut'
              @keydown='keydown'
              @keyup='setShortcutKey'
              placeholder="key...">

    </div>
    <img v-if="is_valid_label" @click.prevent.stop="addNewLabel" class="add-new-label-btn" :disabled='!is_valid_label' :src="add_new_tag_button">
    <img v-else @click.prevent.stop="addnewlabel" class="add-new-label-btn" :disabled='!is_valid_label' :src="add_new_tag_button_disabled">
  </form>
  <div class="title" :class="{ 'top' : !this.is_admin}">
    <div class="title-text">
      Tag List
    </div>
  </div>
  <div v-if="this.is_admin" id='tag-tree'>
    <ul class='tag-list'>
        <li v-for='(data, index) in labels' v-bind:key='data.id' 
            class='tag-list-item' @click="on_click" :data-label='data.label'>
            <div class="label-color" v-bind:style="{ background: color_list[index % 10]}"></div>
            <input v-if='edit_target[0] === data.label && edit_mode === true' type="text"
                    class="label-text-update"
                    v-model='edit_label' 
                    placeholder="label name...">
            <div v-else class="label-text">{{get_tag_name(data.label)}}</div>
            <input v-if="edit_target[0] === data.label && edit_mode === true" type="text"
                    class="label-shortcut-update"
                    v-model='edit_shortcut'
                    @keydown.stop.prevent.self='update_label'
                    @keyup.stop.prevent.self='updateShortcutKey'
                    placeholder="key...">
            <div v-else-if='data.shortcut' class="label-shortcut">{{data.shortcut}}</div>
            <img v-if="edit_target[0] === data.label && edit_mode === true" @click.stop.prevent="to_edit_mode(index, data.label, data.shortcut), edit_toggle()" class="tag_list_icon" :src="tag_list_icon">
            <img v-else @click.stop.prevent="to_edit_mode(index, data.label, data.shortcut), edit_toggle()" class="tag_list_icon" :src="tag_list_icon"> 
        </li>
        <div v-if='update_errormsg' class='label_errormsg'>{{update_errormsg}}</div>
    </ul>
  </div>
  <div v-else id='tag-tree'>
    <ul class='tag-list'>
        <li v-for='(data, index) in labels' v-bind:key='data.id' 
            class='tag-list-item' @click="on_click" :data-label='data.label'>
            <div class="label-color" v-bind:style="{ background: color_list[index % 10]}"></div>
            <input v-if='edit_target[0] === data.label && edit_mode === true' type="text"
                    class="label-text-update readonly"
                    v-model='edit_label' 
                    placeholder="label name..."
                    readonly>
            <div v-else class="label-text">{{get_tag_name(data.label)}}</div>
            <input v-if="edit_target[0] === data.label && edit_mode === true" type="text"
                    class="label-shortcut-update"
                    v-model='edit_shortcut'
                    @keydown.stop.prevent.self='update_label'
                    @keyup.stop.prevent.self='updateShortcutKey'
                    placeholder="key...">
            <div v-else-if='data.shortcut' class="label-shortcut">{{data.shortcut}}</div>
            <img v-if="edit_target[0] === data.label && edit_mode === true" @click.stop.prevent="to_edit_mode(index, data.label, data.shortcut), edit_toggle()" class="tag_list_icon" :src="tag_list_icon">
            <img v-else @click.stop.prevent="to_edit_mode(index, data.label, data.shortcut), edit_toggle()" class="tag_list_icon" :src="tag_list_icon"> 
        </li>
        <div v-if='update_errormsg' class='label_errormsg'>{{update_errormsg}}</div>
    </ul>
  </div>
  <div v-if="this.is_admin" @click='show_delete_dialog=true' id='remove-button'>Refresh List</div>

  <modal-box v-if='show_delete_dialog'
    @ok='delete_tags'
    @cancel='show_delete_dialog=false' >
    <div class="modal-title"  slot='contents'>
      Are you sure flushing class list?
    </div>
    <span slot="okbutton">
      <button id="delete_labels_button" class="modal-default-button"
        @click="delete_tags">
        Delete
      </button>
    </span>

  </modal-box>
</div>

</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import * as utils from "@/utils";
import ModalBox from "@/components/modalbox";

export default {
  components: {
    "modal-box": ModalBox
  },

  data: function() {
    return {
      label: "", // add label
      shortcut: "", // add shortcut
      edit_label: "", // for update label
      edit_shortcut: "", // for update shortcut
      edit_target: "", // flags
      edit_mode: false,
      show_delete_dialog: false,
      add_new_tag_button: require("../assets/images/addnewtag.png"),
      add_new_tag_button_disabled: require("../assets/images/addnewtag_disabled.png"),
      tag_list_icon: require("../assets/images/taglistIcon.svg"),
      color_list: [
        "#E7009A",
        "#9F14C1",
        "#582396",
        "#0A20C4",
        "#3E9AAF",
        "#13894B",
        "#8BAA1A",
        "#FFCC33",
        "#EF8200",
        "#E94C33"
      ]
    };
  },

  computed: {
    ...mapState(["labels", "is_admin"]),

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

    update_errormsg: function() {
      if (this.edit_label.length) {
        if (!this.edit_label.match("^[0-9a-z-A-Z]+$")) {
          return "Class name must be alphanumeric single-byte.";
        }
      }

      for (let i = 0; i < this.labels.length; i++) {
        if (this.edit_target[0] !== this.edit_label) {
          if (this.edit_label === this.labels[i].label) {
            if (this.edit_target !== "") {
              return "Please set unique label.";
            }
          }
        }

        if (this.edit_target[1] !== this.edit_shortcut) {
          if (this.edit_shortcut === this.labels[i].shortcut) {
            if (this.edit_shortcut !== "" && this.edit_target !== "") {
              return "Shortcut is already exists.";
            }
          }
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
      if (event.keyCode === 13) {
        if (this.errormsg === "") {
          this.addNewLabel();
        }
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
    edit_toggle() {
      this.edit_mode = !this.edit_mode;
    },
    to_edit_mode(index, tag, tag_shortcut) {
      let label = tag;
      let shortcut = tag_shortcut;
      let target = [label, shortcut, true];

      this.edit_label = label;
      this.edit_shortcut = shortcut;
      this.edit_target = target;
    },

    update_label(event) {
      if (event.keyCode === 13) {
        if (this.update_errormsg === "") {
          if (this.edit_label === "") {
            this.edit_label = this.edit_target[0];
          }
          this.$store.dispatch("update_label", {
            labels: this.labels,
            src: this.edit_target,
            dist_label: this.edit_label,
            dist_shortcut: this.edit_shortcut
          });
          this.edit_target = "";
        }
        document.body.focus();
      }
    },

    updateShortcutKey(event) {
      if (event.keyCode === 46 || event.keyCode === 8) {
        // delete or backspace
        this.shortcut = "";
        event.preventDefault();
        return;
      }
      if (this.is_control_key(event.keyCode)) {
        return;
      }
      this.edit_shortcut = event.key;
    },

    delete_tags(event) {
      this.$store.dispatch("delete_taglist");
      this.show_delete_dialog = false;
    },
    get_tag_name: function(tag_name) {
      let name_length = 12;
      if (tag_name.length > name_length) {
        return tag_name.slice(0, name_length) + "...";
      }
      return tag_name;
    }
  }
};
</script>

<style lang='scss' scoped>
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: $body-color;
  border: none;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #aaa;
  border-radius: 4px;
  box-shadow: none;
}
#tags {
  box-sizing: border-box;
  width: 275px;
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  color: $font-color;
  padding: 0 25px;
  background-color: $body-color;

  .title {
    margin-top: $content-top-margin;
    height: calc(#{$panel-height} - 7px);
    background: $content-header-color;
    line-height: calc(#{$panel-height} - 7px);
    .title-text {
      margin-left: $content-margin;
      font-family: $content-top-header-font-family;
      font-size: $content-modellist-font-size;
    }
  }

  .top {
    margin-top: $component-margin-top;
    height: calc(#{$panel-height} - 7px);
    background: $content-header-color;
    line-height: calc(#{$panel-height} - 7px);
    .title-text {
      margin-left: $content-margin;
      font-family: $content-top-header-font-family;
      font-size: $content-modellist-font-size;
    }
  }

  #add-new-label-form {
    padding: 0;
    margin: 0;
    margin-top: $component-margin-top;
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
      border-radius: 0;
    }
    input.label-shortcut {
      width: 62.5px;
      border-radius: 0;
    }
  }

  .add-new-label-btn {
    margin: 10px 0 0 0;
    cursor: pointer;
    &:focus {
      outline: none;
    }
    &:hover {
      background-color: $panel-bg-color-hover;
    }
  }

  .add-new-label-btn:disabled {
    background-color: $disabled-color;
  }

  #tag-tree {
    height: calc(100% - 220px);
    overflow-y: auto;
    .tag-list {
      width: 100%;
      height: 100%;
      font-family: $content-inner-header-font-family;
      font-size: $content-modellist-font-size;
      box-sizing: border-box;
      list-style: none;
      padding: 0;
      margin: 0;
      border-style: none;
      padding-right: 10px;
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

  }

  .tag-list-item {
    width: 100%;
    padding-right: 10px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    background-color: #fff;
    &:hover {
      background-color: $table-hover-color;
      cursor: pointer;
    }
    &:not(fast-child) {
      margin-top: 5px;
    }
    .label-color {
      width: 5px;
    }
    .label-text,
    .label-shortcut {
      padding: 0;
      margin: 0;
      outline: none;
      color: $font-color-label;
      line-height: $panel-height;
    }

    .label-text {
      flex: 1;
      margin-left: 10px;
    }
    .label-shortcut {
      text-align: center;
      margin-right: 5px;
    }

    input.label-text-update {
      width: 130px;
      height: 35px;
      border-radius: 0;
    }


    input.label-shortcut-update {
      width: 31.125px;
      height: 35px;
      border-radius: 0;
    }

    .tag_list_icon {
      margin-top: calc(18px * 0.5);
      height: 15px;
    }
  }

  #remove-button {
    height: calc(#{$panel-height} * 0.8);
    line-height: calc(#{$panel-height} * 0.8);
    width: 60%;
    margin-top: calc(#{$component-margin-top} * 2);
    text-align: center;
    font-family: $content-top-header-font-family;
    font-size: $content-modellist-font-size;
    cursor: pointer;
    border: none;
    background-color: #fff;
    color: $font-color-label;

    &:focus {
      outline: none;
    }
    &:hover {
      background-color: lighten(#ff1616, 10%);
      color: #fff;
    }
  }
  .label_errormsg {
    display: block;
    position: absolute;
    font-weight: bold;
    color: #ff1616;
    font-size: 10pt;
    z-index: 9999;
    background-color: $table-hover-color;
    margin: -5px;
    right: 20px;
    top: 42px;
  }
  #delete_labels_button {
    background-color: lighten(#ff1616, 10%);
  }

  .modal-title {
    color: #000;
  }
}
</style>
