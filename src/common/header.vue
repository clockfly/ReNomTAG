<template>
  <header>

    <i id='toggle-menu' class='fa fa-bars' aria-hidden='true' @click='toggleMenu'
       v-bind:class='{ open: isMenuShown }'></i>
    <div class="tool-name"><span class="bold">ReNom</span> TAG</div>

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
    height: 50px;
    margin: 0;
    padding: 0;
    background-color: #1e264d;
    display: flex;
    align-items: center;
    font-size: 24px;

    .tool-name {
      font-size: 18px;
      .bold {
        font-size: 18px;
        font-weight: bold;
      }
    }

    #toggle-menu {
      margiN: 0 20px;
    }
    #toggle-menu:hover {
      cursor: pointer;
    }

  }
</style>
