<template>
  <div id='tag-list'>
    <div id='tag-list-header'>
      <span>Labels</span>
    </div>
    <div id='tag-list-search-box'>
      <input value='search' type='text'/>
    </div>
    <form id="add-new-label-form">

      <p class="add-new-label-header">Add New Label</p>
      <div class="add-new-label-input-area">
        <input type="text"
               class="label-text"
               v-model='newLabelText'
               @keyup.enter='addNewLabel'
               placeholder="Input New Label">
        <input type="text"
               class="label-shortcut"
               v-model='newLabelShortcut'
               @keyup.enter.stop='addNewLabel'
               @keyup='setShortcutKey'
               placeholder="Input New Shortcut">
      </div>

      <button @click="addNewLabel" class="add-new-label-btn">Add New Label</button>

    </form>
    <div id='main-tag-list'>

      <div class='tag-tree'>
        <table class='tag-list'>
          <tr>
            <th>
              Label
            </th>
            <th>
              Shortcut
            </th>
          </tr>
          <label-tree v-for="key in Object.keys(label_candidates_dict)" :shortcut="key"
                      :label="label_candidates_dict[key]['label']"></label-tree>

        </table>

      </div>
    </div>

    <div class="save-load-label-btn">
      <!--<button @click="save_label_candidates_dict" class="save-label-btn">Save Label</button>-->
      <button @click="load_label_candidates_dict" class="load-label-btn">Load label</button>
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
    },
    created: function () {
      this.load_label_candidates_dict()
    }
  }
</script>

<style lang='scss'>
  #tag-list {
    width: 250px;
    display: flex;
    justify-content: flex-start;
    #tag-list-header {
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
    #tag-list-search-box {
      width: 100%;
      margin: 5px 0;
      input {
        width: 100%;
        padding: 0 0 0 0;
        margin: 0 0 0 0;
      }
    }

    #main-tag-list {
      overflow-y: scroll;
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
        th {
          padding: 0;
          font-size: 12px;
        }

        tr {
          padding: 0;
        }
      }
    }

    #add-new-label-form {
      padding: 0;
      margin: 0;
      background: none;
      border: none;

      .add-new-label-header {
        margin: 0;
        padding: 10px 0 5px 0;
      }
      .add-new-label-input-area {

        input {
          margin: 0 0 5px 0;
          padding: 2px 5px;
          outline: none;

        }
        input.label-text {

        }
        input.label-shortcut {

        }
      }
      .add-new-label-btn {
        margin: 5px 0 10px 0;
        width: 100%;
        text-align: center;
        padding: 5px 0;

        cursor: pointer;
        border: none;
        border-radius: 0.1875rem;
        background-color: tomato;
        color: #fff;

      }
    }
    .save-load-label-btn {

      display: flex;
      justify-content: space-between;

      .save-label-btn, .load-label-btn {
        font-size: 12px;
        width: 45%;
        cursor: pointer;
        border: none;
        border-radius: 0.1875rem;
        outline: none;
        transition: all 150ms ease-out;

        &:focus, &:hover {

          opacity: 0.8;
        }

      }
      .save-label-btn {
        margin-left: 0;
        background-color: tomato;
        color: #ffffff;

      }
      .load-label-btn {
        margin-right: 0;

        background-color: #12171a;
        color: #fff;
      }

    }
  }

</style>
