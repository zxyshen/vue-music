<template>
  <div class="music-list">
    <router-link to="/singer"
                 tag="div"
                 class="back">
      <i class="icon-back"></i>
    </router-link>
    <h1 class="title"
        v-html="title"></h1>
    <div class="bg-image"
         :style="bgStyle"
         ref="bimg">
      <div class="play-wrapper">
        <div class="play"
             v-show="songs.length>0"
             ref="play">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
    </div>
    <!-- <div class="bg-layer"
         ref="layer"></div> -->
    <!-- list pos-top 高度只能用js计算 -->
    <!-- 因为img的高度是用百分比padding-bottom弄出来的 -->
    <scroll @scroll="_onListenScroll"
            :data="songs"
            :probeType="probeType"
            :listenScroll="listenScroll"
            class="list"
            ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import SongList from '@/components/song-list/song-list'
import Scroll from '@/components/scroll/scroll'
import Loading from '@/components/loading/loading'
import { prefixStyle } from '@/assets/js/dom'
const RESERVED_HEIGHT = 40

const transform = prefixStyle('transform')
export default {
  data () {
    return {
      probeType: 3,
      listenScroll: true,
      scrollY: -1
    }
  },
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },
  components: {
    SongList,
    Scroll,
    Loading
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    }
  },
  watch: {
    scrollY (y) {
      // 设置translateY最小值为this.minTranslateY
      // let translateY = Math.max(this.minTranslateY, y)
      let zIndex = 0
      let scale = 1
      // this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
      // this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translateY}px,0)`

      // bimg下拉放大比例
      const percent = Math.abs(y / this.imageHeight)
      // 下拉操作
      if (y > 0) {
        // height * scale = height * (1 + y/height) = height + y
        scale = 1 + percent
        zIndex = 10
      }
      if (y < this.minTranslateY) {
        zIndex = 10
        this.$refs.bimg.style.paddingTop = 0
        this.$refs.bimg.style.height = `${RESERVED_HEIGHT}px`
        this.$refs.play.style.display = 'none'
      } else {
        this.$refs.bimg.style.paddingTop = '70%'
        this.$refs.bimg.style.height = 0
        this.$refs.play.style.display = ''
      }
      this.$refs.bimg.style.zIndex = zIndex
      this.$refs.bimg.style[transform] = `scale(${scale})`
    }
  },
  mounted () {
    // 计算img高度
    // 注意这里的$el，因为list是scroll组件，要操作它的dom还需要指定获取$el
    this.$refs.list.$el.style.top = `${this.$refs.bimg.clientHeight}px`
    this.imageHeight = this.$refs.bimg.clientHeight
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
  },
  methods: {
    // 捕获scroll传来的scroll事件
    _onListenScroll (pos) {
      this.scrollY = pos.y
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;

  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;

    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }

  .title {
    position: absolute;
    top: 0;
    left: 10%;
    z-index: 40;
    width: 80%;
    no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;

    .play-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;

      .play {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;

        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }

        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
    }
  }

  // .bg-layer {
  // position: relative;
  // height: 100%;
  // background: $color-background;
  // }
  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;

    .song-list-wrapper {
      padding: 20px 30px;
      background: $color-background;
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
