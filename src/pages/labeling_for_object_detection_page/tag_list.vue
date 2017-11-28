<template>
  <div id='tag-list'>
    <div id='header'>
      <tt>Tags</tt>
    </div>
    <div id='search-box'>
      <input value='search' type='text'/>
    </div>
    <div id='main-tag-list'>
      <tag-tree :nodes='setTagTree' :label='tree[0].label' :depth='0'>
      </tag-tree>
    </div>
  </div>
</template>

<script>
  import TagTreeItem from './tag_list_parts/tag_tree.vue'
  let tree_data = {
    label: 'root',
    nodes: [
      {
        label: 'animal',
        nodes: [
          {
            label: 'dog'
          },
          {
            label: 'cat'
          }
        ]
      },
      {
        label: 'vehicle'
      }
    ]
  }
  export default {
    name: 'TagList',
    components: {
      'tag-tree': TagTreeItem
    },
    data: function () {
      return {
        tree:[] //tree_data
      }
    },
    computed: {
      setTagTree: function () {
        this.tree = this.$store.getters.get_tag_list
        return this.tree[0]['nodes']
      }
    }
  }
</script>

<style lang='scss'>
  #tag-list {
    #header {
      display: flex;
      align-items: center;
      background-color: #a3a3a3;
      width: 100%;
      height: 30px;
      tt {
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
