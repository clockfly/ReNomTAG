<template>
  <header>
    <div class='header-title'>
      <p id='soft-symbol'>
        <i id='toggle-menu' class='fa fa-bars' aria-hidden='true' @click='toggleMenu' v-bind:class='{ open: isMenuShown }'></i>
        ReNom
      </p>
    </div>
  </header>
</template>


<script>
  export default {
    name: 'AppHeader',
    computed: {
      isMenuShown: function () {
        return this.$store.getters.get_is_menu_shown
      }
    },
    methods: {
      toggleMenu: function () {
        this.$store.commit('toggle_menu')
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
    background-color: #2d3e50;
    font-family: 'Arial Black';

    #soft-symbol {
      margin: 0 0 0 0;
      padding-left: 10px;
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: bold;
      text-align: left;

      #toggle-menu {
        margin-right: 20px;
      }
      #toggle-menu:hover {
        color: #a3a3a3;
      }
    }
  }
</style>
