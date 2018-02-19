<template>
  <div id='tag-list'>
    <div id='tag-list-header'>
      Class List
    </div>
    <form id="add-new-label-form">
      <div class="add-new-label-input-area">
        <input type="text"
               class="label-text"
               v-model='newLabelText'
               placeholder="label name...">
        <input type="text"
               class="label-shortcut"
               v-model='newLabelShortcut'
               @keyup='setShortcutKey'
               placeholder="key...">
      </div>
      <button @click="addNewLabel" class="add-new-label-btn">Add New Label</button>
    </form>

    <div id='tag-tree'>
      <ul class='tag-list'>
        <label-tree v-for="key in Object.keys(label_candidates_dict)" :shortcut="key"
                    :label="label_candidates_dict[key]['label']"></label-tree>
      </ul>

    </div>
    <button @click='removeAllClassName' id='remove-button'>Refresh list</button>
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
      addNewLabel (event) {
        this.setAddLabelFlag(false)
        let new_text_enable_flag = true
        for (let attr in this.label_candidates_dict) {
          let text = this.label_candidates_dict[attr]['label']
          if(this.newLabelText===text){
            new_text_enable_flag = false
            break
          }
        }

        if (!this.newLabelText) {
          alert('Please set label')
          return
        } else if(!new_text_enable_flag){
          alert('Please set unique label')
          return
        } else if (!this.newLabelShortcut) {
          let dict_size = Object.keys(this.label_candidates_dict).length
          this.newLabelShortcut = String("no_shortcut"+dict_size)

        } else if (this.label_candidates_dict[this.newLabelShortcut]) {
          alert('Shortcut is already exists.')
          return
        }

        if ((this.newLabelText.match(/^[0-9a-zA-Z]+$/)) ? false : true) {
          alert("Class name must be alphanumeric single-byte.");
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

        this.save_label_candidates_dict()
      },
      setShortcutKey (event) {
        let not_allowed_key_list = [
          13, // Enter(ten key)
          32, // Space
          8, // BackSpace
          9, // Tab
          46, // Delete
        ]
        if(not_allowed_key_list.indexOf(event.keyCode) >= 0){
          return
        }
        this.newLabelShortcut = event.key
      },
      removeAllClassName () {
        let ret = confirm("Are you sure flushing class list?");
        if(ret==true){
          this.$store.dispatch('flush_label_candidates_dict',{
            save_json_file_path: 'label_candidates.json'
          })
          this.load_label_candidates_dict()
        } else {
          return
        }
      }
    },
    created: function () {
      this.load_label_candidates_dict()
    }
  }
</script>

<style lang='scss'>
  #tag-list {
    height: 100%;
    width: 200px;
    display: flex;
    justify-content: flex-start;
    background-color: #f4f4f2;
    padding: 0 25px;

    #tag-list-header {
      font-size: 18px;
      font-weight: bold;
      width: 200px;
      margin: 0 auto;
      padding: 20px 0 5px 0;
    }

    #add-new-label-form {
      padding: 0;
      margin: 0;
      background: none;
      border: none;

      .add-new-label-input-area {
        display: flex;
        justify-content: space-between;
        padding-bottom: 10px;

        input {
          padding: 3px 7px;
          outline: none;
          border-color: #7d7d7d;
          margin: 0;
          &::-webkit-input-placeholder {
            color: #a6a6a6;
            font-size: 13px;
          }

        }
        input.label-text {
          width: 132.5px;

        }
        input.label-shortcut {
          width: 62.5px;

        }
      }
      .add-new-label-btn {
        width: 100%;
        text-align: center;
        padding: 10px 0;
        margin: 0;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        background-color: #326699;
        color: #fff;
        &:focus {
          outline: none;
        }
        &:hover {
          background-color: lighten(#326699, 10%);
        }
      }
    }
    #tag-tree {
      padding-top: 15px;
      height: calc(100% - 220px);
      overflow-y: auto;
      .tag-list {
        width: 100%;
        height: 100%;
        font-weight: bold;
        box-sizing: border-box;
        list-style: none;
        padding: 0;
        margin: 0;
        border-style: none;

      }
    }
    #remove-button{
      width: 60%;
      text-align: center;
      padding: 10px 0;
      cursor: pointer;
      border: none;
      border-radius: 5px;
      background-color: #adadad;
      color: #fff;
      margin-left: auto;

      &:focus {
        outline: none;
      }
      &:hover {
        background-color: lighten(#ff1616, 10%);
      }
    }
  }

</style>
