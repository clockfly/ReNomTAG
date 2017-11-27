<template>
  <header>
    <div class='header-title'>
      <p id='soft-symbol'>
        <i id='menu-toggle' class='fa fa-bars' aria-hidden='true' @click='toggleMenu' v-bind:class='{ open: isMenuShow }'></i>
        ReNom
      </p>
    </div>
  </header>
</template>


<script>
  export default {
    name: 'AppHeader',
    computed: {
      isMenuShow: function () {
        return this.$store.getters.get_is_menu_show
      }
    },
    methods: {
      toggleMenu: function () {
        this.$store.dispatch('toggle_menu_action')
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
      margin: 0px 0px 0px 0px;
      padding-left: 10px;
      text-align: left;
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: bold;

      #menu-toggle {
        margin-right: 20px;
      }
      #menu-toggle:hover {
        color: #a3a3a3;
      }
    }
  }
</style>
