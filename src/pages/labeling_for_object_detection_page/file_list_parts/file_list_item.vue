<template>
  <div class='file-item' @click="child_click_action">
    <div class='img-box'>
      <img :src='imgData'>
    </div>
    <p> {{ fileName }} </p>
  </div>
</template>

<script>
  export default {
    name: 'FileItem',
    props: [
      'fileName',
      'imgData',
      'click_action'
    ],
    data: function () {
      return {
        selected_index: 0
      }
    },
    methods: {
      child_click_action () {
        this.$emit('click_action')
      }
    },
  }
</script>

<style lang='scss'>
  .file-item {
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #e6e6e6;
    padding-right: 10px;
    box-sizing: border-box;
    margin-bottom: 2px;

    cursor: pointer;

    &.selected {
      border: 2px solid #2d3e50;
    }

    p {
      padding: 0 0 0 0;
      margin: 0 0 0 0;
      font-size: 0.7rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .img-box {
      height: 100%;
      width: 30%;
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
      text-align: left;
    }
  }
</style>
