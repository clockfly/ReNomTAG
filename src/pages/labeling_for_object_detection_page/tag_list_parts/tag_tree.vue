<template>
  <div class='tag-tree'>
    <div class='tag-list'>
      <div class='list-item'>
        <p :style='indent' v-if='label'>
          <i v-if='showChildrenFlag' class="fa fa-compress fa-fw"
             @click='toggleChildren' aria-hidden="true"></i>
          <i v-else class="fa fa-expand fa-fw"
             @click='toggleChildren' aria-hidden="true"></i>
          {{ label }}
        </p>
        <span v-if='shortcut'>{{ shortcut }}</span>
        <div id='add-child' @click='setAddTagFlag(!addingTagFlag)'>
          <i class="fa fa-plus-square-o" aria-hidden="true"></i>
        </div>
      </div>
      <div id='tag-input-form' v-if='addingTagFlag'>
        <input id='new-label-form' type='text' v-model='newLabelText'
               @keyup.enter='addNewTag'>
        <input id='shortcut-form' type='text' v-model='newLabelShortcut'
               @keyup.enter.stop='addNewTag' @keyup='setShortcutKey'>
      </div>
    </div>
    <tag-tree-item v-if='showChildrenFlag'
                   v-for='(node, index) in nodes'
                   :shortcut='node.shortcut'
                   :key='index' :nodes='node.nodes'
                   :label='node.label' :depth='depth + 1'>
    </tag-tree-item>
  </div>
</template>

<script>
  export default {
    name: 'TagTreeItem',
    props: [
      'label',
      'nodes',
      'depth',
      'shortcut'
    ],
    data () {
      return {
        newLabelText: '',
        newLabelShortcut: '',
        showChildrenFlag: false,
        addingTagFlag: false,
        tag_id: 0
      }
    },
    computed: {
      indent () {
        return {paddingLeft: `${this.depth * 10}px`}
      },
      shortcut_label_dict () {
        return this.$store.getters.get_shortcut_label_dict
      },
    },
    methods: {
      toggleChildren () {
        this.showChildrenFlag = !this.showChildrenFlag
      },
      setAddTagFlag (flag) {
        this.addingTagFlag = flag
      },
      addNewTag () {
        this.setAddTagFlag(false)
        if (!this.newLabelText) {
          alert('Please set label')
//          this.newLabelText = ''
//          this.newLabelShortcut = ''
          return
        } else if (!this.newLabelShortcut) {
          alert('Please set shortcut')
          return
        } else if (this.shortcut_label_dict[this.newLabelShortcut]) {
          alert('Shortcut is already exists.')
          return
        }

        this.$store.commit('add_tag', {
          parent_node: this.label,
          label: this.newLabelText,
          id: this.tag_id,
          shortcut: this.newLabelShortcut
        })
        this.newLabelText = ''
        this.newLabelShortcut = ''
        this.showChildrenFlag = true
        this.tag_id += 1
      },
      setShortcutKey (event) {
        this.newLabelShortcut = event.key
      }
    }
  }
</script>

<style lang='scss'>
  .tag-tree {
    left: 0px;
    width: 200px;
    .tag-list {
      width: 100%;
      height: 100%;
      font-size: 1.0rem;
      font-weight: bold;
      box-sizing: border-box;
      border: solid 1px #a3a3a3;
      .list-item {
        width: 100%;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        p {
          width: 70%;
          padding: 0 0 0 0;
          margin: 0 5px 0 5px;
        }
        span {
          text-align: center;
          padding-right: 3px;
          font-size: 0.7rem;
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
        justify-content: space-between;
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
    }
  }
</style>
