<template>
  <header>
    <div class='header-title'>
      <p id='soft-symbol'>
        <i id='menu-toggle' class='fa fa-bars' aria-hidden='true' @click='toggleMenu'></i>
        ReNom
      </p>
    </div>
  </header>
</template>

<script>
  export default {
    name: 'AppHeader',
    data: function () {
      return {
        menuToggle: true
      }
    },
    methods: {
      toggleMenu: function () {
        this.menuToggle = !this.menuToggle
        this.$parent.setShowNavigationBarFlag(this.menuToggle)
      }
    }
  }
</script>


<style lang='scss'>
  header {
    width: 100%;
    height: 35px;
    margin: 0;
    padding: 0;
    background-color: #00ff5a;
    font-family: 'Arial Black';

    #soft-symbol {
      margin: 0px 0px 0px 0px;
      padding-left: 10px;
      text-align: left;
      color: #2d3e50;
      font-size: 1.5rem;
      font-weight: bold;

      #menu-toggle {
        margin-right: 20px;
      }
      #menu-toggle:hover {
        color: #ffffff;
      }
    }
  }
</style>
