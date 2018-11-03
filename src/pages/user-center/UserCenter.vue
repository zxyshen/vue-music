<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back"
           @click="_onBack">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches @switch="_onSwitchItem"
                  :switches="switches"
                  :currentIndex="currentIndex"></switches>
      </div>
      <div class="play-btn"
           ref="playBtn"
           @click="_onRandomPlay"
           :class="playBtnCls">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper"
           ref="listWrapper">
        <div class="clear-btn"
             ref="clearBtn"
             v-show="showClear"
             @click="_onShowDeleteAllConfirm">
          <i class="icon-clear"></i>
        </div>
        <scroll v-if="currentIndex === 0"
                :data="favouriteList"
                class="list-scroll"
                ref="favouriteListScroll">
          <div class="list-inner">
            <song-list :songs="favouriteList"
                       :playIcon="false"
                       :onTouch="true"
                       @delete="_onListenDelete"
                       @select="_onListenSelect"></song-list>
          </div>
        </scroll>
        <scroll class="list-scroll"
                v-if="currentIndex===1"
                :data="playHistory"
                ref="playHistoryScroll">
          <!-- search-list用了transition所以需要手动设置一下refreshDelay -->
          <div class="list-inner">
            <song-list :songs="playHistory"
                       :playIcon="false"
                       :onTouch="true"
                       @delete="_onListenDelete"
                       @select="_onListenSelect"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper"
           v-show="unNoResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
      <confirm ref="confirm"
               @confirm="_onDeleteAllList"
               :text="confirmText"></confirm>
      <modal ref="modal"
             title="滑动删除歌曲"
             @close="_onCloseModal">
        <img v-lazy="modalImgSrc">
      </modal>
    </div>
  </transition>
</template>

<script>
import Switches from '@/components/switches/switches'
import Scroll from '@/components/scroll/scroll'
import SongList from '@/components/song-list/song-list'
import NoResult from '@/components/no-result/no-result'
import Confirm from '@/components/confirm/confirm'
import Modal from '@/components/modal/modal'
import { mapGetters, mapActions } from 'vuex'
import { refreshListHeightMixin } from '@/assets/js/mixin.js'
import { Song } from '@/assets/js/Song'
export default {
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult,
    Confirm,
    Modal
  },
  mixins: [refreshListHeightMixin],
  data () {
    return {
      currentIndex: 0,
      switches: [{ name: '我收藏的' }, { name: '播放记录' }],
      modalImgSrc: require('@/assets/image/finger.png')
    }
  },
  watch: {

  },
  computed: {
    ...mapGetters(['favouriteList', 'playHistory']),
    playBtnCls () {
      return (this.currentIndex === 0 && !this.favouriteList.length) ||
        (this.currentIndex === 1 && !this.playHistory.length) ? '' : 'active'
    },
    unNoResult () {
      if (this.currentIndex === 0) {
        return !this.favouriteList.length
      } else {
        return !this.playHistory.length
      }
    },
    noResultDesc () {
      if (this.currentIndex === 0) {
        return '还没有喜欢的歌曲哦!'
      } else {
        return '还没有听过歌曲哦!'
      }
    },
    confirmText () {
      if (this.currentIndex === 0) {
        return '是否清空收藏列表?'
      } else {
        return '是否清空搜索历史?'
      }
    },
    showClear () {
      if ((this.currentIndex === 0 && this.favouriteList.length) || (this.currentIndex === 1 && this.playHistory.length)) {
        return true
      }
      return false
    }
  },
  created () {
  },
  methods: {
    ...mapActions(['insertSong', 'deletePlayHistory', 'deleteFavouriteList', 'randomPlay', 'selectPlay', 'deleteAllFavouriteList', 'deleteAllPlayHistory']),
    _onRandomPlay () {
      let list = this.currentIndex === 0 ? this.favouriteList : this.playHistory
      if (list.length === 0) { return }
      list = list.map(song => new Song(song))
      // this.deleteAllSong()
      this.randomPlay({ list })
    },
    _onShowDeleteAllConfirm () {
      this.$refs.confirm.show()
    },
    _onDeleteAllList () {
      // 判断然后清空对应记录
      if (this.currentIndex === 0) {
        this.deleteAllFavouriteList()
      } else {
        this.deleteAllPlayHistory()
      }
    },
    _onBack () {
      this.$router.back()
    },
    _onSwitchItem (index) {
      this.currentIndex = index
    },
    _onListenDelete (id) {
      if (this.currentIndex === 0) {
        console.log(1)
        const index = this.favouriteList.findIndex(item => item.id === id)
        this.deleteFavouriteList(this.favouriteList[index])
      } else {
        const index = this.playHistory.findIndex(item => item.id === id)
        this.deletePlayHistory(this.playHistory[index])
      }
    },
    // 点击收藏或者播放记录列表里的歌曲
    _onListenSelect (item, index) {
      let list = []
      // 先清空原始播放列表；这里是多此一举了，因为本来采用的就是替换列表而不是
      // 插入的形式
      // this.deleteAllSong()
      if (this.currentIndex === 0) {
        list = this.favouriteList
      } else {
        list = this.playHistory
      }
      list = list.map(song => new Song(song))
      this.selectPlay({
        list,
        index
      })
    },
    _onCloseModal () {
      this.$refs.modal.close()
    },
    _refreshListHeight (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      this.$refs.favouriteListScroll && this.$refs.favouriteListScroll._refresh()
      this.$refs.playHistoryScroll && this.$refs.playHistoryScroll._refresh()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~@/assets/stylus/variable';

.user-center {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
  background: $color-background;

  .clear-btn {
    box-sizing: border-box;
    width: 60px;
    padding: 7px 0;
    margin: 10px auto 20px;
    overflow: hidden;
    text-align: center;
    border: 1px solid $color-sub-theme;
    color: $color-sub-theme;
    background: $color-sub-theme;
    border-radius: 100px;
    font-size: 0;
    transition: 0.3s;
    extend-click();

    .icon-clear {
      font-size: $font-size-medium;
      color: $color-theme;
      vertical-align: middle;
    }
  }

  &.slide-enter-active, &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter, &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

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

  .switches-wrapper {
    margin: 10px 0 30px 0;
  }

  .play-btn {
    box-sizing: border-box;
    width: 135px;
    padding: 7px 0;
    margin: 0 auto;
    text-align: center;
    border-radius: 100px;
    font-size: 0;
    transition: 0.3s;
    border: 1px solid $color-text-d;
    color: $color-text-d;

    &.active {
      border: 1px solid $color-theme;
      color: $color-theme;
    }

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

  .list-wrapper {
    position: absolute;
    top: 110px;
    bottom: 0;
    width: 100%;

    .list-scroll {
      height: 90%;
      overflow: hidden;

      .list-inner {
        padding: 10px 0px;
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>