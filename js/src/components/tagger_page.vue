<template>
  <div id="page">
    <app-header></app-header>
    <div id='main-container'>
      <left-menu></left-menu>
      <image-list/>
      <navarrow dir="back"/>
      <div v-if="active_image_filename == null" class="filler"></div>
      <tagcanvas v-if="active_image_filename != null" ></tagcanvas>
      <navarrow dir="forward"/>
      <tags></tags>
    </div>
    <tagged-images/>

    <modal-box v-if='error_status'>
      <div slot='contents' class='error-msg'>
        {{error_status}}
      </div>
      <div slot='footer'>
        <button class='error-button' @click='set_error_status({error_status: ""})'>close</button>
      </div>
    </modal-box>
    
  </div>

</template>

<script>
import AppHeader from './header.vue'
import LeftMenu from './left_menu.vue'
import ImageList from '@/components/image_list'
import NavArrow from '@/components/navarrow'
import TagCanvas from './tagcanvas.vue'
import Tags from './tags.vue'
import TaggedImages from './taggedimages.vue'
import ModalBox from '@/components/modalbox'

import { mapState, mapMutations } from 'vuex'

export default {
  components: {
    'app-header': AppHeader,
    'left-menu': LeftMenu,
    'image-list': ImageList,
    'tagcanvas': TagCanvas,
    'tags': Tags,
    'tagged-images': TaggedImages,
    'navarrow': NavArrow,
    'modal-box': ModalBox,
  },
  computed: {
    ...mapState([
      'active_image_filename', 'error_status'
    ]),
  },
  methods: {
    ...mapMutations(['set_error_status']),
  }
}
</script>
<style lang='scss'>

#page {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}

#main-container {
    box-sizing: border-box;
    display: flex;
    height: calc(100% - 50px - 200px);
    align-items: stretch;
    width: 100%;

    .filler {
      flex-grow: 1;
    }
}

.error-msg {
  text-align: center;
  font-weight: bold;
  margin-bottom: 0;
}

.error-button {
  margin-bottom: 0;
  text-align: right;
  font-weight: normal;
}
</style>
