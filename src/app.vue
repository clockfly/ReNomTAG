<template>
  <div id='app' class='container'>
    <div id='main-container' style='display:flex; width:100%; height:100%;'>
      <navigation-bar style='flex-grow:0'></navigation-bar>
      <div style='flex-grow:1'>
        <app-header></app-header>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from './common/header.vue'
import NavigationBar from './common/navigation_bar.vue'

export default {
  name: 'App',
  components: {
    'app-header': AppHeader,
    'navigation-bar': NavigationBar
  },
  data: function () {
    return {
      showNavigationBarFlag: true
    }
  },
  methods: {
    setShowNavigationBarFlag: function (flag) {
      this.showNavigationBarFlag = flag

      // ///////////////
      // Darty code. Be careful when you change components order.
      this.$children[0].setShowFlag(flag)
      // //////////////
      this.$forceUpdate()
    }
  }
}
</script>

<style lang='scss'>
  .container {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
