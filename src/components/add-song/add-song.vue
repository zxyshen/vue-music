<template>
  <transition name="slide">
    <div class="add-song"
         v-show="showFlag"
         @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close"
             @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox"
                    @query="_onQueryChange"></search-box>
      </div>
      <div class="shortcut"
           v-show="!query">
        <switches @switch="_onSwitch"
                  :switches="switches"
                  :currentIndex="currentIndex"></switches>
        <div class="list-wrapper">
          <scroll v-if="currentIndex === 0"
                  :data="playHistory"
                  class="list-scroll"
                  ref="playHistoryScroll">
            <div class="list-inner">
              <song-list :songs="playHistory"
                         :playIcon="false"
                         @select="_onListenSelect"></song-list>
            </div>
          </scroll>
          <scroll class="list-scroll"
                  v-if="currentIndex===1"
                  :data="searchHistory"
                  ref="searchHistoryHistory"
                  :refreshDelay="100">
            <!-- search-list用了transition所以需要手动设置一下refreshDelay -->
            <div class="list-inner">
              <search-list @delete="_onDeleteOneSearchHistory"
                           @select="_onClickAddQuery"
                           :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result"
           v-show="query">
        <suggest @select="_onSaveSearchHistory"
                 :query="query"
                 :showSinger="false"
                 ref="suggest"
                 @beforeScroll="_onBlurInput"></suggest>
      </div>
      <top-tip class="tip-title"
               ref="topTip">
        <i class="icon-ok"></i>
        <span class="text">1首歌曲已经添加到播放队列</span>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import SearchBox from '@/components/search-box/search-box'
import Suggest from '@/components/suggest/suggest'
import Switches from '@/components/switches/switches'
import Scroll from '@/components/scroll/scroll'
import SongList from '@/components/song-list/song-list'
import SearchList from '@/components/search-list/search-list'
import TopTip from '@/components/top-tip/top-tip'
import { Song } from '@/assets/js/Song'
import { searchMixin } from '@/assets/js/mixin.js'
import { mapGetters, mapActions } from 'vuex'
export default {
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  },
  mixins: [searchMixin],
  data () {
    return {
      showFlag: false,
      // query: ''
      currentIndex: 0,
      switches: [
        { name: '最近播放' },
        { name: '搜索历史' }
      ]
    }
  },
  computed: {
    ...mapGetters(['playHistory'])
  },
  methods: {
    ...mapActions(['insertSong']),
    show () {
      // scroll的子元素或父元素dom结构发生变化时都要refresh一下
      this.showFlag = true
      setTimeout(() => {
        if (this.currentIndex === 1) {
          this.$refs.searchHistoryHistory._refresh()
        } else {
          this.$refs.playHistoryScroll._refresh()
        }
      }, 20)
    },
    hide () {
      this.showFlag = false
    },
    // _onQueryChange (query) {
    //   this.query = query
    // }
    _onSwitch (index) {
      this.currentIndex = index
    },
    // 点击最近播放列表
    _onListenSelect (item, index) {
      // 因为是采用栈的形式，表头就是正在播放的歌曲。
      // 所以当index === 0 的时候，不做任何动作，只有点别的时再插入到表头
      if (index !== 0) {
        this.insertSong(new Song(item))
        this.$refs.topTip.show()
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;

  &.slide-enter-active, &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter, &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

  .header {
    position: relative;
    height: 44px;
    text-align: center;

    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }

    .close {
      position: absolute;
      top: 0;
      right: 8px;

      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;

      .list-scroll {
        height: 100%;
        overflow: hidden;

        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }

  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }

  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;

    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }

    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>