<template>

  <li class="tag-list-item">
    <input type="text"
           v-model="label"
           class="label-text"
    >
    <input type="text" v-model="shortcut" class="label-shortcut">
  </li>
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
        newLabelText: '',
        newLabelShortcut: '',
        addingLabelFlag: false,
        label_id: 0
      }
    },
    computed: {
//      indent () {
//        return {paddingLeft: `${this.depth * 10}px`}
//      },

//      shortcut_label_dict () {
//        return this.$store.getters.get_shortcut_label_dict
//      },
    },
    methods: {
      toggleChildren () {
        this.showChildrenFlag = !this.showChildrenFlag
      },
      setAddLabelFlag (flag) {
        this.addingLabelFlag = flag
      },
      addNewLabel () {
        this.setAddLabelFlag(false)
        if (!this.newLabelText) {
          alert('Please set label')
          return
        } else if (!this.newLabelShortcut) {
          alert('Please set shortcut')
          return
        } else if (this.shortcut_label_dict[this.newLabelShortcut]) {
          alert('Shortcut is already exists.')
          return
        }

        this.$store.commit('add_new_label', {
//          parent_node: this.label,
          label_text: this.newLabelText,
          id: this.label_id,
          shortcut: this.newLabelShortcut
        })
        this.newLabelText = ''
        this.newLabelShortcut = ''
        this.showChildrenFlag = true
        this.label_id += 1
      },
      setShortcutKey (event) {
        this.newLabelShortcut = event.key
      }
    }
  }
</script>

<style lang='scss'>

  .tag-list-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .label-text, .label-shortcut {
      padding: 0;
      margin: 0;
      outline: none;
      color: rgba(0, 0, 0, 0.9)
    }
    .label-text {
      flex: 1;
      width: 1px;
      &::-webkit-input-placeholder, &:-ms-input-placeholder, &::-moz-placeholder {
        color: #ccc;
      }
    }
    .label-shortcut {
      width: 50px;
      text-align: center;
    }

    #add-child {
      text-align: center;
      font-size: 1.1rem;
      padding-right: 10px;
    }
  }

  #tag-input-form {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    #new-label-form {
      height: 25px;
      width: 70%;
      padding: 0 0 0 0;
      margin: 0 0 0 0;
    }
    #shortcut-form {
      height: 25px;
      width: 30%;
      padding: 0 0 0 0;
      margin: 0 0 0 0;
      text-align: center;
      font-size: 0.7rem;
    }
  }
</style>
