<template>
  <div id='left-menu'  v-bind:class='{ open: main_menu_visible }' @click='closeMenu'>
    <div class='left-menu-bar'>
      <button class='bar-button'>
        <i class="fa fa-object-group fa-fw" aria-hidden="true"></i>
        <span class='menu-text'>Detection Label</span>
      </button>

      <button class='bar-button'>
        <i class="fa fa-cog fa-fw" aria-hidden="true"></i>
        <span class='menu-text'>Settings</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState(["main_menu_visible"]),
  methods: {
    closeMenu: function() {
      this.$store.commit("set_main_menu_visible", { visible: false });
    }
  }
};
</script>

<style lang='scss'>
#left-menu {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  display: None;
  width: 100%;
  height: calc(100% - 50px);
  z-index: 9999;
  &.open {
    width: 100%;
    display: block;
  }
  .left-menu-bar {
    background-color: #2d3e50;
    width: 170px;
    height: 100%;
  }
  .bar-button {
    width: 100%;
    height: 45px;
    position: relative;
    $bg_color: #2d3e50;
    text-align: left;
    margin: 0;
    color: #b7b7b7;
    background-color: $bg_color;
    outline: none;

    &:hover {
      color: #fff;
      background-color: lighten($bg_color, 15%);
    }
  }
}
</style>
