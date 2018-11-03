<template>
  <div class="song-list">
    <ul>
      <li @click="_onSelectItem(item,index)"
          v-for="(item, index) in songs"
          :key="index"
          class="item">
        <i v-show="!rank"
           :class="index === currentSongIndex ? playCls:''"></i>
        <div class="rank"
             v-show="rank">
          <!-- 这个rankCls只用响应一次，所以不需要计算属性 -->
          <span :class="getRankCls(index)">{{getRankText(index)}}</span>
        </div>
        <!-- vue好像不可以根据条件再选择是否绑定事件($mount应该可以
        不过原理和这个一样)，所以没办法了，只能用比较蠢的方法，直接渲染两种DOM -->
        <div class="content"
             v-show="!onTouch">
          <h2 class="name">{{item.name}}</h2>
          <p class="desc">{{ item | normalize }}</p>
        </div>
        <div ref="songItem"
             class="content pos"
             v-show="onTouch"
             @touchstart.prevent="_onTouchStart"
             @touchmove.prevent="_onTouchMove(index,$event)"
             @touchend="_onTouchEnd(index,item.id,$event)">
          <h2 class="name">{{item.name}}</h2>
          <p class="desc">{{ item | normalize }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  props: {
    songs: {
      type: Array,
      default: () => []
    },
    rank: {
      type: Boolean,
      default: false
    },
    playIcon: {
      type: Boolean,
      default: true
    },
    onTouch: {
      type: Boolean,
      default: false
    }
  },
  filters: {
    normalize (song) {
      return `${song.singer} - ${song.album}`
    }
  },
  data () {
    return {
      currentSongIndex: -1
    }
  },
  computed: {
    ...mapGetters(['currentSong', 'sequenceList']),
    playCls () {
      return 'icon-currentMusic play'
    }
  },
  watch: {
    // currentSong (currentSong) {
    //   // 获取currentSong.id 遍历sequenceList，找到相同的id的item，添加class
    //   this.currentSongIndex = this.sequenceList.findIndex((v) => {
    //     return v.id === currentSong.id
    //   })
    // }
  },
  created () {
    this.touch = {}
    // 这就是在created里写watch的作用，可以根据条件选择是否watch
    // 根据props的playIcon决定是否开启监听器
    this.playIcon && this.$watch('currentSong', (currentSong) => {
      // 获取currentSong.id 遍历sequenceList，找到相同的id的item，添加class
      this.currentSongIndex = this.sequenceList.findIndex((v) => {
        return v.id === currentSong.id
      })
    })
  },
  methods: {
    ...mapActions(['deletePlayHistory']),
    _onSelectItem (item, index) {
      this.$emit('select', item, index)
    },
    getRankCls (index) {
      if (index <= 2) {
        return `icon icon${index}`
      } else {
        return 'text'
      }
    },
    getRankText (index) {
      if (index > 2) {
        return index + 1
      }
    },
    _onTouchStart (e) {
      this.touch.init = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    _onTouchMove (index, e) {
      if (!this.touch.init) { return }

      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      // const deltaY = touch.pageY - this.touch.startY

      // // 纵向滚动
      // if (Math.abs(deltaY) > Math.abs(deltaX)) {
      //   this.touch.init = false
      //   return
      // }
      this.touch.percent = deltaX / window.innerWidth
      this.$refs.songItem[index].style.transform = `translate3d(${deltaX}px,0,0)`
      this.$refs.songItem[index].style.opacity = 1 - this.touch.percent
      this.$refs.songItem[index].style.transitionDuration = 0
    },
    _onTouchEnd (index, id, e) {
      if (!this.touch.init || !this.touch.percent) { return }
      this.touch.init = false
      let offsetWidth = 0
      let opacity = 1
      if (this.touch.percent < -0.2) {
        offsetWidth = -window.innerWidth
        opacity = 0
      }
      if (this.touch.percent > 0.4) {
        offsetWidth = window.innerWidth
        opacity = 0
      }
      const time = 200
      // 这里是要删除的song
      this.$refs.songItem[index].style.transform = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.songItem[index].style.transitionDuration = `${time}ms`
      this.$refs.songItem[index].style.opacity = opacity

      if (!opacity) {
        // 删除song
        this.$emit('delete', id)
      }

      // index没变，但这个song已经变成了被删除的song的下一首了，所以要调回去
      this.$refs.songItem[index].style.transform = `translate3d(0,0,0)`
      this.$refs.songItem[index].style.opacity = 1
      this.$refs.songItem[index].style.transitionDuration = 0

      this.touch.percent = 0
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.song-list {
  .item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 64px;
    font-size: $font-size-medium;
    transition: 1s;
    position: relative;

    .play {
      display: inline-block;
      width: 32px;
      height: 32px;
      font-size: 20px;
      color: $color-theme;
      transition: 0.3s;
    }

    .rank {
      flex: 0 0 25px;
      width: 25px;
      margin-right: 30px;
      text-align: center;

      .icon {
        display: inline-block;
        width: 25px;
        height: 24px;
        background-size: 25px 24px;

        &.icon0 {
          bg-image('first');
        }

        &.icon1 {
          bg-image('second');
        }

        &.icon2 {
          bg-image('third');
        }
      }

      .text {
        color: $color-t;
        font-size: $font-size-large;
      }
    }

    .pos {
      // width: 150%;
      padding: 0 20px;
      transition: 0.1;
    }

    .content {
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        no-wrap();
        color: $color-text;
      }

      .desc {
        no-wrap();
        margin-top: 4px;
        color: $color-text-d;
      }
    }
  }
}
</style>
