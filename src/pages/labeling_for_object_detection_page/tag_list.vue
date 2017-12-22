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
      <tag-tree :nodes='setTagTree' :label='tree[0].label' :depth='0'>
      </tag-tree>
      {{ tag_candidates_dict }}
    </div>
    <button @click="save_tag_dict">Save Tag Dict</button>
    <button @click="load_tag_dict">Load Tag</button>
  </div>
</template>

<script>
  import TagTreeItem from './tag_list_parts/tag_tree.vue'

  export default {
    name: 'TagList',
    components: {
      'tag-tree': TagTreeItem
    },
    data: function () {
      return {
        tree: []
      }
    },
    computed: {
      setTagTree: function () {
        this.tree = this.tag_candidates_dict
        return this.tree[0]['nodes']
      },
      shortcut_label_dict () {
        return this.$store.getters.get_shortcut_label_dict
      },
      label_id_dict_list () {
        return this.$store.getters.get_label_id_dict_list
      },
      tag_candidates_dict () {
        return this.$store.getters.get_tag_candidates_dict
      }
    },
    methods: {
      save_tag_dict () {
        this.$store.dispatch('save_tag_dict', {
          save_json_file_path: 'tag_candidates.json',
          tag_candidates_dict: this.tag_candidates_dict
        })
      },
      load_tag_dict () {
        this.$store.dispatch('load_tag_candidates_dict', {
          load_json_file_path: 'tag_candidates.json'
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
