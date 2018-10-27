<template>
  <div class="recommend"
       ref="recommend">
    <scroll class="recommend-content"
            :data="discList"
            ref="scroll">
      <div>
        <div class="slider-wrapper">
          <slider v-if="recommends.length">
            <div v-for="(item, index) in recommends"
                 :key="index">
              <a :href="item.linkUrl">
                <img :src="item.picUrl"
                     alt="加载失败"
                     @load="_onLoadImg">
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
                class="item"
                @click="_onSelectItem(item)">
              <div class="icon"><img width="60"
                     height="60"
                     v-lazy="item.imgurl"></div>
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
    <router-view></router-view>
  </div>
</template>

<script>
import Scroll from '@/components/scroll/scroll'
import Slider from '@/components/slider/slider'
import Loading from '@/components/loading/loading'
import { getRecommend, getDiscList } from '@/api/recommend.js'
import { ERR_OK } from '@/api/config.js'
import { refreshListHeightMixin } from '@/assets/js/mixin.js'
import { mapMutations } from 'vuex'

export default {
  name: 'Recommend',
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  mixins: [refreshListHeightMixin],
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
    ...mapMutations({
      setSongSheet: 'SET_SONG_SHEET'
    }),
    // 当mini播放器出现时(其实也就是playList出现)，改变scroll box的bottom。
    // 然后刷新scroll，重新获取高度
    _refreshListHeight (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll._refresh()
    },
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
    _onSelectItem (item) {
      this.setSongSheet(item)
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
    },
    _onLoadImg () {
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
