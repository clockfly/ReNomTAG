<template>

  <tr class="tag-list-item">
    <!--<input type="text"-->
           <!--v-model="label"-->
           <!--class="label-text"-->
    <!--&gt;-->
    <!--<input type="text" v-model="shortcut" class="label-shortcut">-->

    <td class="label-text">{{ label }}</td>
    <td class="label-shortcut">{{ shortcut }}</td>

  </tr>
</template>

<script>
  export default {
    name: 'LabelTreeItem',
    props: [
      'shortcut',
      'label'
    ],
    data () {
      return {
        shortcut_data: this.shortcut,
        label_data: this.label,
        label_id: 0
      }
    },
    computed: {},
    methods: {},
    watch: {

//      shortcut_data: function () {
//        let self = this
//        console.log('fafa')
//        this.$store.dispatch('update_label_candidates_dict_shortcut', {
//          old_shortcut: self.shortcut,
//          new_shortcut: self.shortcut_data
//        })
//      },
//      label_data: function () {
//        let self = this
//        this.$store.dispatch('update_label_candidates_dict_label', {
//          shortcut: self.shortcut_data,
//          new_label: self.label_data
//        })
//      }
    }
  }
</script>

<style lang='scss'>

  .tag-list-item {
    width: 100%;

    .label-text, .label-shortcut {
      padding: 0;
      margin: 0;
      outline: none;
      color: rgba(0, 0, 0, 0.9)
    }


    .label-text {
      flex: 1;
      padding-left: 5px;
      &::-webkit-input-placeholder, &:-ms-input-placeholder, &::-moz-placeholder {
        color: #ccc;
      }
    }
    .label-shortcut {
      width: 50px;
      text-align: center;
    }

  }
</style>
