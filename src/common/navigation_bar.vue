<template>
  <div id='navigation-bar' v-bind:class='{ open: isMenuShown }'>
    <button class='bar-button' @click='goToDetectPage'>
      <i class="fa fa-object-group fa-fw" aria-hidden="true"></i>
      <span class='menu-text'>Detection Label</span>
    </button>
    <button class='bar-button' @click='goToSettingPage'>
      <i class="fa fa-cog fa-fw" aria-hidden="true"></i>
      <span class='menu-text'>Settings</span>
    </button>
  </div>
</template>

<script>
  export default {
    name: 'NavigationBar',
    computed: {
      isMenuShown: function () {
        return this.$store.getters.get_is_menu_shown
      }
    },
    methods: {
      goToDetectPage: function () {
        this.$router.push({path: '/'})
        this.$store.commit('toggle_menu')
      },
      goToSettingPage: function () {
        this.$router.push({path: '/setting'})
        this.$store.commit('toggle_menu')
      }
    }
  }
</script>

<style lang='scss'>

  #navigation-bar {
    background-color: #2d3e50;
    position: absolute;
    top: 35px;
    left: 0;
    width: 170px;
    height: 100%;
    transition: all 0.5s;
    padding-top: 80px;
    z-index: 100;

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
      width: 100%;
      height: 45px;
      position: relative;
      $bg_color: #2d3e50;
      text-align: left;
      margin: 0;
      color: #b7b7b7;
      background-color: $bg_color;
      outline: none;

      &:hover {
        color: #fff;
        background-color: lighten($bg_color, 15%);
      }
    }
  }


</style>
