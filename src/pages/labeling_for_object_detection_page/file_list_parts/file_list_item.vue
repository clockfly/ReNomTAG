<template>
  <div id='file-item'>
    <div id='img-box'>
      <img :src='a'>
    </div>
    <p> {{ fileName }} </p>
  </div>
</template>

<script>
  export default {
    name: 'FileItem',
    props: [
      'fileName'
    ]
  }
</script>

<style lang='scss'>
  #file-item {
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: #e6e6e6;
    margin-bottom: 2px;

    #img-box {
      height: 100%;
      width: 35%;
      position: relative;
    }

    img {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      position: absolute;
      margin: auto;
      align: left;
    }
  }
</style>
