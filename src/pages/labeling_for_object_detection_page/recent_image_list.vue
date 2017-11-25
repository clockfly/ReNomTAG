<template>
  <div id='recent-image-list'>
    <div id='header'>
      <tt>Resent Labeled Images</tt>
    </div>
    <div id='image-list'>
      <img v-for='im in labeledImageList' :src='im'>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'RecentImageList',
    data: function () {
      return {
        labeledImageList: [
          'http://moka-suyasuya.c.blog.so-net.ne.jp/_images/blog/_cd5/moka-suyasuya/gazou2044-fc29e.jpg',
          'http://moka-suyasuya.c.blog.so-net.ne.jp/_images/blog/_cd5/moka-suyasuya/gazou2044-fc29e.jpg',
          'http://moka-suyasuya.c.blog.so-net.ne.jp/_images/blog/_cd5/moka-suyasuya/gazou2044-fc29e.jpg'
        ]
      }
    }
  }
</script>

<style lang='scss'>

  #recent-image-list {
    width: 400px;
    height: 180px;
    box-sizing: border-box;
    border: solid 1px #a3a3a3;

    #header {
      display: flex;
      height: 30px;
      width: 100%;
      background-color: #a3a3a3;
      align-items: center;
      tt {
        color: #3a3a3a;
        font-weight: bold;
      }
    }

    #image-list {
      height: calc(100% - 30px);
      width: 100%;
      display: flex;
      align-items: center;
      img {
        margin-left: 2px;
        margin-right: 2px;
        object-fit: contain;
      }
    }
  }

</style>
