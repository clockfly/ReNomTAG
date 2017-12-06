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
      {{ shortcut_label_dict_list }}
    </div>
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
        this.tree = this.$store.getters.get_tag_list
        return this.tree[0]['nodes']
      },
      shortcut_label_dict () {
        return this.$store.getters.get_shortcut_label_dict
      },
      label_id_dict_list () {
        return this.$store.getters.get_label_id_dict_list
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
