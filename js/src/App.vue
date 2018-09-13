<template>
  <div id="app" >
      <router-view class="container-fluid"/>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style lang='scss'>
@import "/../node_modules/bootstrap/scss/bootstrap.scss";
@font-face {
  font-family: $header-product-name-font-family;
  src: url("./fonts/OpenSans-Regular.ttf");
}
@font-face {
  font-family: $content-inner-header-font-family;
  src: url("/@/fonts/OpenSans-Light.ttf");
}
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
