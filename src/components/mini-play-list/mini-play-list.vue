<template>
  <transition name="list-fade">
    <div class="playlist"
         v-show="showFlag"
         @click="hide">
      <div class="list-wrapper"
           @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon"
               :class="iconForPlayMode"
               @click="_onClickChangeMode"></i>
            <span class="text">{{playModeText}}</span>
            <span class="clear"
                  @click="_onShowDeleteAllMiniPlayListConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll class="list-content"
                ref="listContent"
                :data="sequenceList"
                :refreshDelay="100">
          <transition-group name="list"
                            tag="ul">
            <!-- 这个li的key如果设置成默认的index会让transition-group无效，
                因为这个默认的index不一定唯一，或者说可能会发生碰撞 -->
            <li ref="listItem"
                @click="_onSelectItem(item,index)"
                class="item"
                v-for="(item, index) in sequenceList"
                :key="item.id">
              <i class="current"
                 :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name + '---' + item.singer}}</span>
              <span @click.stop="_onToggleFavourite(item)"
                    class="like">
                <i :class="getFavouriteIcon(item)"
                   class="favourite-i"></i>
              </span>
              <span class="delete"
                    @click.stop="_onDeleteItem(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add"
               @click="_onAddSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close"
             @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm"
               @confirm="_onDeleteAllMiniPlayList"
               text="是否清空播放列表?"></confirm>
      <add-song ref="addSong"></add-song>
      <top-tip class="tip-title"
               ref="topTip">
        <i class="icon-ok"></i>
        <span class="text">{{tipText}}</span>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import { playMode } from '@/assets/js/config'
import { playerMixin } from '@/assets/js/mixin'
import Scroll from '@/components/scroll/scroll'
import Confirm from '@/components/confirm/confirm'
import addSong from '@/components/add-song/add-song'
import TopTip from '@/components/top-tip/top-tip'
export default {
  components: {
    Scroll,
    Confirm,
    addSong,
    TopTip
  },
  mixins: [playerMixin],
  data () {
    return {
      showFlag: false
    }
  },
  computed: {
    // ...mapGetters(['sequenceList', 'currentSong', 'mode', 'playList', 'playing'])
    playModeText () {
      return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
    }
  },
  watch: {
    currentSong (newSong, oldSong) {
      if (!this.showFlag || newSong.id === oldSong.id) { return }
      this._scrollToCurrent(newSong)
    }
  },
  methods: {
    // ...mapMutations({
    //   'setCurrentIndex': 'SET_CURRENT_INDEX',
    //   'setPlayingState': 'SET_PLAYING_STATE'
    // }),
    // ...mapActions(['deleteSong', 'deleteAllSong']),

    _onAddSong () {
      this.$refs.addSong.show()
    },
    _onShowDeleteAllMiniPlayListConfirm () {
      this.$refs.confirm.show()
    },
    _onDeleteAllMiniPlayList () {
      this.deleteAllSong()
      this.hide()
    },
    getCurrentIcon (item) {
      return this.currentSong.id === item.id ? 'icon-play' : ''
    },
    _onDeleteItem (item) {
      this.deleteSong(item)
    },
    _onSelectItem (item, index) {
      if (this.mode === playMode.random) {
        index = this.playList.findIndex(song => song.id === item.id)
      }
      this.setCurrentIndex(index)
      !this.playing && this.setPlayingState(true)
    },
    show () {
      this.showFlag = true
      // # scroll的子元素或父元素dom结构发生变化时都要refresh一下
      // # 这里的 scroll 子元素第一次从none变为show之后，scrolldom结构发生变化
      // # 就要刷新一下
      setTimeout(() => {
        this.$refs.listContent._refresh()
      }, 20)

      // 列表为空就隐藏list
      if (!this.playList.length) {
        this.hide()
      }
    },
    hide () {
      this.showFlag = false
    },
    _scrollToCurrent (current) {
      const index = this.sequenceList.findIndex(song => song.id === current.id)
      this.$refs.listContent._scrollToElement(this.$refs.listItem[index], 300)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;

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

  &.list-fade-enter-active, &.list-fade-leave-active {
    transition: opacity 0.3s;

    .list-wrapper {
      transition: all 0.3s;
    }
  }

  &.list-fade-enter, &.list-fade-leave-to {
    opacity: 0;

    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }

  &.list-fade-enter, .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;

    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;

      .title {
        display: flex;
        align-items: center;

        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .clear {
          extend-click();

          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }

    .list-content {
      max-height: 240px;
      overflow: hidden;

      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;

        &.list-enter-active, &.list-leave-active {
          transition: all 0.1s;
        }

        &.list-enter, &.list-leave-to {
          height: 0;
        }

        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }

        .like {
          extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;

          .favourite-i {
            transition: 0.3s;
          }

          .icon-favorite {
            color: $color-sub-theme;
          }
        }

        .delete {
          extend-click();
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
    }

    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;

      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;

        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }

        .text {
          font-size: $font-size-small;
        }
      }
    }

    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>