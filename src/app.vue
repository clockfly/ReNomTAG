<template>
  <div id='app' class='container'>
    <navigation-bar style='flex-grow:0'></navigation-bar>
    <div id='main-container' style='flex-grow:1' v-bind:class='{ open: isShowMenu }'>
      <div id="pusher"></div>
      <app-header></app-header>
      <router-view></router-view>
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
        showNavigationBarFlag: false
      }
    },
    computed: {
      isShowMenu: function () {
        return this.showNavigationBarFlag
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
  #app {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;

    overflow: hidden;
  }

  #main-container {
    left: 0;
    z-index: 99;
    position: relative;
    height: 100%;
    transition: transform 0.5s;

    #pusher {

      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      background: rgba(0, 0, 0, 0.3);
      content: '';
      opacity: 0;
      transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
    }

    &.open  #pusher{
      width: 100%;
      height: 100%;
      opacity: 1;
      transition: opacity 0.5s;
    }

  }

  .container {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;

  }
</style>
