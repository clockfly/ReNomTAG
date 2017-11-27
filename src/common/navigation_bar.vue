<template>
  <div id='navigation-bar' v-bind:class='{ open: isShowAll }'>

    <button class='bar-button'>
      <i class="fa fa-object-group" aria-hidden="true"></i>
      <span class='menu-text'>Detection Label</span>
    </button>
    <button class='bar-button'>
      <i class="fa fa-cog" aria-hidden="true"></i>
      <span class='menu-text'>Settings</span>
    </button>
  </div>
</template>

<script>
  export default {
    name: 'NavigationBar',
    data: function () {
      return {
        showAllFlag: false
      }
    },
    computed: {
      isShowAll: function () {
        return this.showAllFlag
      }
    },
    methods: {
      setShowFlag: function (flag) {
        this.showAllFlag = flag
      }
    }
  }
</script>

<style lang='scss'>

  #navigation-bar {
    background-color: #2d3e50;

    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    width: 300px;
    height: 100%;
    transition: all 0.5s;

    visibility: visible;
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);

    &.open {
      visibility: visible;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    &:after {
      display: none;
    }

    .bar-button {
      $bg_color: #2d3e50;

      text-align: left;
      width: 100%;
      height: 45px;
      margin: 0;
      background-color: $bg_color;
      color: #b7b7b7;
      outline: none;

      position: relative;

      &:hover {
        color: #fff;
        background-color: lighten($bg_color, 15%);
      }

    }
  }


</style>
