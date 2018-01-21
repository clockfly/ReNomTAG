<template>

  <li class="tag-list-item">
    <div class="label-text">{{ label }}</div>
    <div class="label-shortcut">{{ shortcut }}</div>
    <!--<div class="label-count count-10">1</div>-->
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
        shortcut_data: this.shortcut,
        label_data: this.label,
        label_id: 0
      }
    },
    computed: {},
    methods: {},
  }
</script>

<style lang='scss'>

  .tag-list-item {
    width: 100%;
    border-top: 1px solid #797979;
    padding: 5px 10px 5px 10px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;

    &:last-child {
      border-bottom: 1px solid #797979;
    }

    .label-text, .label-shortcut {
      padding: 0;
      margin: 0;
      outline: none;
      color: #777777;
    }

    .label-text {
      flex: 1;
    }
    .label-shortcut {
      width: 25px;
      text-align: center;
      color: #3c3c3c;
      background: #fff;
      border: 1px solid #3c3c3c;
      border-radius: 5px;
      margin-right: 5px;
      justify-content: center;
      align-items: center;
    }
    .label-count {
      border-radius: 5px;
      width: 50px;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .count-10 {
      background-color: #e7009a;
    }
    .count-50 {
      background-color: #9f13c1;
    }
    .count-100 {
      background-color: #3f9aaf;
    }
    .count-200 {
      background-color: #0920c4;
    }
    .count-10 {
      background-color: #ea4b34;
    }

  }
</style>
