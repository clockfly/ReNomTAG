<template>
  <div id='recent-image-list'>
    <div id='inner-recent-image-list'>
      <div id='header'>
        <span>Recent Labeled Images</span>
      </div>
      <div id='image-list'>
        <div v-for='im in labeledImageList' class='img-panel'>
          <img :src='im'/>
        </div>
      </div>
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
          'http://moka-suyasuya.c.blog.so-net.ne.jp/_images/blog/_cd5/moka-suyasuya/gazou2044-fc29e.jpg',
          'http://moka-suyasuya.c.blog.so-net.ne.jp/_images/blog/_cd5/moka-suyasuya/gazou2044-fc29e.jpg',
          'https://camo.qiitausercontent.com/7ddf8c55ae27d9ed6fe71b2af5b1213d517e023e/68747470733a2f2f71696974612d696d6167652d73746f72652e73332e616d617a6f6e6177732e636f6d2f302f3838392f39663662353338622d386332332d396263652d386433652d3739656363313837613164392e6a706567'
        ]
      }
    }
  }
</script>

<style lang='scss'>

  #recent-image-list {
    width: calc(100% - 205px);
    height: 100%;
    #inner-recent-image-list {
      height: 100%;
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
        justify-content: space-around;
        align-items: center;

        .img-panel {
          height: 100%;
          width: 100%;
          padding-left: 4px;
          padding-right: 4px;
          display: flex;
          align-items: center;
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
      }
    }
  }

</style>
