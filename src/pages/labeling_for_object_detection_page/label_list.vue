<template>
  <div id='tag-list'>
    <!--{{ shortcut_label_dict_list }}-->
    <div id='header'>
      <span>Labels</span>
    </div>
    <div id='search-box'>
      <input value='search' type='text'/>
    </div>
    <div id='main-tag-list'>
      <label-tree :nodes='setTagTree' :label='tree[0].label' :depth='0'>
      </label-tree>
      {{ shortcut_label_dict }}
    </div>
    <button @click="save_label_dict">Save Tag Dict</button>
    <button @click="load_label_dict">Load Tag</button>

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
        tree: []
      }
    },
    computed: {
      setTagTree: function () {
        this.tree = this.label_candidates_dict
        return this.tree[0]['nodes']
      },
      shortcut_label_dict () {
        return this.$store.getters.get_shortcut_label_dict
      },
      label_id_dict_list () {
        return this.$store.getters.get_label_id_dict_list
      },
      label_candidates_dict () {
        return this.$store.getters.get_label_candidates_dict
      }
    },
    methods: {
      save_label_dict () {
        this.$store.dispatch('save_label_dict', {
          save_json_file_path: 'label_candidates.json',
          label_candidates_dict: this.label_candidates_dict
        })
      },
      load_label_dict () {
        this.$store.dispatch('load_label_candidates_dict', {
          load_json_file_path: 'label_candidates.json'
        })
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
      input {
        width: 100%;
        padding: 0 0 0 0;
        margin: 0 0 0 0;
      }
    }

    #main-tag-list {
      height: 100%;
      overflow: auto;
    }
  }

</style>
