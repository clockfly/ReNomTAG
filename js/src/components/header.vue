<template>
  <header>
    <img class="hanburger-menu" :src="Menu" @click='toggleMenuVisible' aria-hidden='true'>
    <div class="tool-name">
      <span class="renom">ReNom</span>
      <span v-if="this.is_admin" class="current-page">TAG &gt; Admin</span>
      <span v-else class="current-page">TAG &gt; Main</span>
    </div>
  </header>
</template>

<script>

import { mapMutations, mapState } from 'vuex'

export default {
  name: "AppHeader",
  data: function() {
    return {
      Menu: require('../assets/images/han.png')
    }
  },
  computed: {
    ...mapState([
      "tag_filter",
      "is_admin"
    ])
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
      this.set_main_menu_visible({ visible: !cur })
    }
  }
};
</script>

<style lang='scss'>
header {
  box-sizing: border-box;
  height: $application-header-hight;
  margin: 0;
  padding: 0;
  background-color: $content-header-color;
  display: flex;
  align-items: center;
  font-family: $header-product-name-font-family;
  font-size: $font-size;

  .hanburger-menu {
    margin-left: $component-inner-horizontal-margin;
    cursor: pointer;
  }


  .tool-name {
    box-sizing: border-box;
    .renom,
    .current-page {
      line-height: $application-header-hight;
      vertical-align: middle;
    }
    .renom {
      margin-left: $content-top-heder-horizonral-margin;
      font-family:$header-product-name-font-family;
      font-size: $header-product-name-font-size;
    }
    .current-page {
      font-family:$header-title-font-family;
      font-size: $header-title-font-size;
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
