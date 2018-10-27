<template>
  <div class="rank"
       ref="rank">
    <scroll class="toplist"
            :data="topList"
            ref="topList">
      <ul>
        <li class="item"
            v-for="(item, index) in topList"
            :key="index"
            @click="_onSelectItem(item)">
          <div class="icon">
            <img width="100"
                 height="100"
                 v-lazy="item.picUrl">
          </div>
          <ul class="songlist">
            <li class="song"
                v-for="(song, index) in item.songList"
                :key="index">
              <span>{{index + 1}}</span>
              <span>{{song | normalize}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container"
           v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import { getRank } from '@/api/rank'
import { ERR_OK } from '@/api/config'
import Scroll from '@/components/scroll/scroll'
import Loading from '@/components/loading/loading'
import { refreshListHeightMixin } from '@/assets/js/mixin.js'
import { mapMutations } from 'vuex'

export default {
  data () {
    return {
      topList: []
    }
  },
  components: {
    Scroll,
    Loading
  },
  mixins: [refreshListHeightMixin],
  filters: {
    normalize (song) {
      return `${song.songname} - ${song.singername}`
    }
  },
  created () {
    this._getRank()
  },
  methods: {
    ...mapMutations({
      setTopList: 'SET_TOPLIST'
    }),
    _onSelectItem (item) {
      this.setTopList(item)
      this.$router.push({
        path: `/rank/${item.id}`
      })
    },
    _getRank () {
      getRank().then(res => {
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    },
    // 当mini播放器出现时(其实也就是playList出现)，改变scroll box的bottom。
    // 然后刷新scroll，重新获取高度
    _refreshListHeight (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.rank.style.bottom = bottom
      this.$refs.topList._refresh()
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .toplist {
    height: 100%;
    overflow: hidden;

    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;

      &:last-child {
        padding-bottom: 20px;
      }

      .icon {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }

      .songlist {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;

        .song {
          no-wrap();
          line-height: 26px;
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
