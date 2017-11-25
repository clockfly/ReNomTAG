<template>
  <div class='tag-tree'>
    <div class='list-item' @click='toggleChildren'>
      <tt :style='indent'>{{ label }}</tt>
    </div>
    <tag-tree-item v-if='showChildrenFlag'
      v-for='(node, index) in nodes'
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
      'depth'
    ],
    data () {
      return {
        showChildrenFlag: false
      }
    },
    computed: {
      indent () {
        return {padding: `${this.depth * 10}px`}
      }
    },
    methods: {
      toggleChildren () {
        this.showChildrenFlag = !this.showChildrenFlag
      }
    }
  }
</script>

<style lang='scss'>
  .tag-tree {
    position: relative;
    left: 0px;
    width: 200px;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
    .list-item {
      width: 100%;
      height: 100%;
      text-align: left;
      box-sizing: border-box;
      border: solid 1px #a3a3a3;
    }
  }
</style>
