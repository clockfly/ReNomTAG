<template>
  <header>

    <i id='toggle-menu' class='fa fa-bars' aria-hidden='true'
     @click='toggleMenuVisible'></i>
    <div class="tool-name"><span class="bold">ReNom</span> TAG</div>
    <div class='header-buttons'>
      <div :class='["image_pred_button", is_tag_selected("hastags")]' @click='toggle_tag_filter({filter:"hastags"})'>has tags</div>

      <div :class='["image_pred_button",  is_tag_selected("notags")]' @click='toggle_tag_filter({filter:"notags"})'>no tags</div>

      <div :class='["image_pred_button", is_review_selected("ok")]' @click='toggle_review_filter({filter:"ok"})'>ok</div>

      <div :class='["image_pred_button", is_review_selected("ng")]' @click='toggle_review_filter({filter:"ng"})'>ng</div>
      <div :class='["image_pred_button", is_review_selected("notreviewed")]' @click='toggle_review_filter({filter:"notreviewed"})'>not reviewed yet</div>
    </div>
  </header>
</template>

<script>

import { mapMutations, mapState } from 'vuex'

export default {
  name: "AppHeader",

  computed: {
    ...mapState([
      "tag_filter",
      "review_filter"])
  },

  methods: {
    ...mapMutations(['set_main_menu_visible', 'toggle_tag_filter', 'toggle_review_filter']),

    is_tag_selected: function(name) {
      if (this.tag_filter.indexOf(name) != -1) {
        return 'image_pred_tagbutton_active'
      }
      return null
    },
    is_review_selected: function(name) {
      if (this.review_filter.indexOf(name) != -1) {
        return 'image_pred_reviewbutton_active'
      }
      return null
    },
    toggleMenuVisible: function() {
      let cur = this.$store.state.main_menu_visible;
      this.set_main_menu_visible({ visible: !cur });
    }
  }
};
</script>

<style lang='scss'>
header {
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  margin: 0;
  padding: 0;
  background-color: #1e264d;
  display: flex;
  align-items: center;
  font-size: 24px;

  .tool-name {
    box-sizing: border-box;
    font-size: 18px;
    .bold {
      font-size: 18px;
      font-weight: bold;
    }
  }
  .header-buttons {
    display: flex;

    .image_pred_button {
      margin: 5px;
      padding: 3px;
      font-size: 12px;
      border: solid 1px;
    }

    .image_pred_tagbutton_active {
      background-color: red;
    }
    .image_pred_reviewbutton_active {
      background-color: green;
    }
  }
  #toggle-menu {
    box-sizing: border-box;
    margin: 0 20px;
  }
  #toggle-menu:hover {
    box-sizing: border-box;
    cursor: pointer;
  }
}
</style>
