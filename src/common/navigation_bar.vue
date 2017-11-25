<template>
  <div id='navigation-bar'>
    <transition>
      <div id='large-menu' v-if='isShowAll' key='large'>
        <button class='bar-button'>
          <tt>
            <i class="fa fa-object-group" aria-hidden="true"></i>
            Detection Label
          </tt>
        </button>
        <button class='bar-button'>
          <tt>
            <i class="fa fa-cog" aria-hidden="true"></i>
            Settings
          </tt>
        </button>
      </div>
  
      <div id='small-menu' v-else key='small'>
        <button class='bar-button'>
          <tt>
            <i class="fa fa-object-group" aria-hidden="true"></i>
          </tt>
        </button>
        <button class='bar-button'>
          <tt>
            <i class="fa fa-cog" aria-hidden="true"></i>
          </tt>
        </button>
      </div>
    </transition>
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

    #large-menu {
      padding-top: 35px;
      width: 200px;  
    }
    #small-menu {
      tt {
        font-size: 1rem;
      }
      padding-top: 35px;
      width: 40px; 
    }

    .bar-button {
      text-align: left;
      width: 100%;
      height: 45px;
      margin: 2px 0px 0px 0px;
      background-color: #2d3e50;
      color: #b7b7b7;
    }
  
    .bar-button:hover {
      color: #ffffff;
      background-color: #374b60;
    }

  }

</style>
