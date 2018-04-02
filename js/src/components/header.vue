<template>
  <header>

    <i id='toggle-menu' class='fa fa-bars' aria-hidden='true' 
     @click='toggleMenuVisible'></i>
    <div class="tool-name"><span class="bold">ReNom</span> TAG</div>

  </header>
</template>

<script>
export default {
  name: "AppHeader",
  methods: {
    toggleMenuVisible: function() {
      let cur = this.$store.state.main_menu_visible;
      this.$store.commit("set_main_menu_visible", { visible: !cur });
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
