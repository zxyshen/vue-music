<template>
  <div class="recommend">
    <scroll class="recommend-content"
            :data="discList"
            ref="scroll">
      <div>
        <div class="slider-wrapper">
          <slider v-if="recommends.length">
            <div v-for="(item, index) in recommends"
                 :key="index">
              <a :href="item.linkUrl">
                <img :src="item.picUrl" @load="loadImg">
            </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list"
             v-if="discList.length">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item, index) in discList"
                :key="index"
                class="item">
              <div class="icon"><img width="60" height="60" v-lazy="item.imgurl"></div>
                <div class="text">
                  <h2 class="name"
                      v-html="item.creator.name"></h2>
                  <p class="desc"
                     v-html="item.dissname"></p>
                </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- v-show !discList 是错误的写法 -->
      <div v-show="!discList.length"
           class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import Scroll from '@/components/scroll/scroll'
import Slider from '@/components/slider/slider'
import Loading from '@/components/loading/loading'
import { getRecommend, getDiscList } from '@/api/recommend.js'
import { ERR_OK } from '@/api/config.js'
export default {
  name: 'Recommend',
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  },
  created () {
    this._getRecommend()
    this._getDiscList()
  },
  methods: {
    _getRecommend () {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList () {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },
    loadImg () {
      // 只作用一次的原因：这个是轮播图，轮播图只要有一张有大小的图就行了啊。
      // 其实还不如直接给img设定宽高呢，就想下面的discList
      if (!this.imgLoad) {
        this.$refs.scroll._refresh()
        this.imgLoad = true
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>