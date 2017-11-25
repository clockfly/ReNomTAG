<template>
  <div id='app' class="">
    <app-header></app-header>
    <router-view/>
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
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /*margin-top: 60px;*/
  }
</style>
