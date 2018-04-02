<template>
  <div id="app">
      <router-view/>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style lang='scss'>
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #fff !important;
}

#app {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
