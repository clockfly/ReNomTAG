<template>
  <div id='tag-list'>
    <div id='header'>
      <span>Labels</span>
    </div>
    <div id='search-box'>
      <input value='search' type='text'/>
    </div>
    <div id='main-tag-list'>

      <div class='tag-tree'>
        <ul class='tag-list'>
          <label-tree v-for="key in Object.keys(label_candidates_dict)" :shortcut="key"
                      :label="label_candidates_dict[key]['label']"></label-tree>

          <li class="tag-list-item">
            <input type="text"
                   class="label-text"
                   v-model='newLabelText'
                   @keyup.enter='addNewLabel'
                   placeholder="+Add New Label">
            <input type="text"
                   class="label-shortcut"
                   v-model='newLabelShortcut'
                   @keyup.enter.stop='addNewLabel'
                   @keyup='setShortcutKey'>

          </li>
        </ul>

        <button @click="save_label_candidates_dict">Save Label</button>
        <button @click="load_label_candidates_dict">Load label</button>
      </div>
    </div>

  </div>
</template>

<script>
  import LabelTreeItem from './label_list_parts/label_tree.vue'

  export default {
    name: 'LabelList',
    components: {
      'label-tree': LabelTreeItem
    },
    data: function () {
      return {
        newLabelText: '',
        newLabelShortcut: '',
        addingLabelFlag: false,
        label_id: 0
      }
    },
    computed: {
      setTagTree: function () {
        this.tree = this.label_candidates_dict
        return this.tree[0]['nodes']
      },

//      shortcut_label_dict () {
//        return this.$store.getters.get_shortcut_label_dict
//      },

//      label_id_dict_list () {
//        return this.$store.getters.get_label_id_dict_list
//      },
      label_candidates_dict () {
        return this.$store.getters.get_label_candidates_dict
      }
    },
    methods: {
      save_label_candidates_dict () {
        this.$store.dispatch('save_label_candidates_dict', {
          save_json_file_path: 'label_candidates.json',
          label_candidates_dict: this.label_candidates_dict
        })
      },
      load_label_candidates_dict () {
        this.$store.dispatch('load_label_candidates_dict', {
          load_json_file_path: 'label_candidates.json'
        })
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
        } else if (this.label_candidates_dict[this.newLabelShortcut]) {
          alert('Shortcut is already exists.')
          return
        }

        this.$store.commit('add_new_label', {
          label_text: this.newLabelText,
          id: this.label_id,
          shortcut: this.newLabelShortcut
        })
        this.newLabelText = ''
        this.newLabelShortcut = ''
        this.label_id += 1
      },
      setShortcutKey (event) {
        this.newLabelShortcut = event.key
      }
    }
  }
</script>

<style lang='scss'>
  #tag-list {
    width: 200px;
    #header {
      display: flex;
      align-items: center;
      background-color: #a3a3a3;
      width: 100%;
      height: 30px;
      span {
        margin-left: 5px;
        color: #3a3a3a;
        font-weight: bold;
      }
    }
    #search-box {
      width: 100%;
      margin: 5px 0;
      input {
        width: 100%;
        padding: 0 0 0 0;
        margin: 0 0 0 0;
      }
    }

    #main-tag-list {
      height: 100%;
      overflow: auto;

      .tag-tree {
        left: 0px;
        width: 200px;
      }

      .tag-list {
        width: 100%;
        height: 100%;
        font-size: 1.0rem;
        font-weight: bold;
        box-sizing: border-box;
        border: solid 1px #a3a3a3;
        list-style: none;
        padding: 0;
        margin: 0;

        .add-new-label-text {
          &::-webkit-input-placeholder {
            color: #dadada;
            font-weight: normal;
          }
        }
      }
    }
  }

</style>
