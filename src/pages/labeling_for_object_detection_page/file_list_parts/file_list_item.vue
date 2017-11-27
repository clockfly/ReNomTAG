<template>
  <div id='file-item' v-bind:class='{selected: isSelected}'>
    <div id='img-box'>
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
      'imgData'
    ],
    methods: {
      isSelected: function () {
        let filename = this.$store.getters.get_raw_img['filename']
        return filename === this.fileName
      },
      selectFile: function () { 
      }
    }
  }
</script>

<style lang='scss'>
  #file-item {
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #e6e6e6;
    margin-bottom: 2px;

    p {
      padding: 0 0 0 0;
      margin: 0 0 0 0;
      font-size: 0.7rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #img-box {
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
      align: left;
    }
  }

  #file-item .selected {
    background-color: #343434;
  }
</style>
