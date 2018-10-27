<template>
  <transition name="slide">
    <song-wrapper :title="title"
                  :bg-image="bgImage"
                  :songs="songs"
                  :rank="true"></song-wrapper>
  </transition>
</template>

<script>
import SongWrapper from '@/components/song-wrapper/song-wrapper'
import { mapGetters } from 'vuex'
import { ERR_OK } from '@/api/config'
import { createSong, _getMusic } from '@/assets/js/Song'
import { getTopList } from '@/api/rank.js'

export default {
  data () {
    return {
      songs: []
    }
  },
  components: {
    SongWrapper
  },
  computed: {
    // 接收更新后的state
    ...mapGetters(['topList']),
    title () {
      return this.topList.topTitle
    },
    bgImage () {
      return this.songs.length ? this.songs[0].image : ''
    }
  },
  created () {
    this._getTopList()
  },
  methods: {
    // 格式化传过来的数据
    _normalizeTopList (list) {
      let ret = []
      // 空数组不能foreach
      if (!ret) { return }

      list.forEach(item => {
        let _item = item.data
        if (_item.songid && _item.albumid) {
          _getMusic(_item.songmid).then(res => {
            if (res.code === ERR_OK) {
              const svkey = res.data.items
              const songvkey = svkey[0].vkey
              const _Song = createSong(_item, songvkey)
              ret.push(_Song)
            }
          }).catch((err) => {
            console.log(err)
          })
        }
      })
      return ret
    },
    _getTopList () {
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }

      getTopList(this.topList.id).then(res => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeTopList(res.songlist)
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';

.singer-detail {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-background;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  // translate3d(x,y,z)
  transform: translate3d(100%, 0, 0);
}
</style>