<template>
  <div id='navigation-bar'>
    <div id='left-side-menu' v-bind:class='{ open: isShowAll }'>

      <div v-if='isShowAll' id='left-large-menu' class='left-menu'>
        <button class='bar-button'>
          <i class="fa fa-object-group" aria-hidden="true"></i>
          Detection Label
        </button>
        <button class='bar-button'>

          <i class="fa fa-cog" aria-hidden="true"></i>
          Settings
        </button>
      </div>

      <div v-else id='left-small-menu' class='left-menu'>
        <button class='bar-button'>

          <i class="fa fa-object-group" aria-hidden="true"></i>

        </button>
        <button class='bar-button'>
          <i class="fa fa-cog" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'NavigationBar',
    data: function () {
      return {
        showAllFlag: true
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
    height: 100%;

    #left-side-menu {
      padding-top: 35px;
      width: 40px;

      transition: 200ms;
      &.open {
        width: 200px;
      }

      #left-large-menu {

      }

      #left-small-menu {

      }

      .bar-button {
        text-align: left;
        width: 100%;
        height: 45px;
        margin: 2px 0 0 0;
        background-color: #2d3e50;
        color: #b7b7b7;
      }

      .bar-button:hover {
        color: #ffffff;
        background-color: #374b60;
      }
    }
  }

</style>
