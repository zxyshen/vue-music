<template>
  <div class="song-list">
    <ul v-show="flag">
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
        <div class="content">
          <h2 class="name">{{item.name}}</h2>
          <p class="desc">{{ item | normalize }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      flag: false,
      currentSongIndex: -1
    }
  },
  props: {
    songs: {
      type: Array,
      default: () => []
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['currentSong', 'sequenceList']),
    playCls () {
      return 'icon-currentMusic play'
    }
  },
  filters: {
    normalize (song) {
      return `${song.singer} - ${song.album}`
    }
  },
  methods: {
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
    }
  },
  watch: {
    songs (v) {
      if (v.length > 2) { this.flag = true }
    },
    currentSong (currentSong) {
      // 获取currentSong.id 遍历sequenceList，找到相同的id的item，添加class
      this.currentSongIndex = this.sequenceList.findIndex((v) => {
        return v.id === currentSong.id
      })
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
