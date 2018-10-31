<template>
  <transition name="slide">
    <song-wrapper :title="title"
                  :bg-image="bgImage"
                  :songs="songs"></song-wrapper>
  </transition>
</template>

<script>
import SongWrapper from '@/components/song-wrapper/song-wrapper'
import { mapGetters } from 'vuex'
import { getSongSheetList } from '@/api/recommend.js'
import { ERR_OK } from '@/api/config'
import { createSong, _getMusic } from '@/assets/js/Song'

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
    ...mapGetters(['songSheet']),
    title () {
      return this.songSheet.dissname
    },
    bgImage () {
      return this.songSheet.imgurl
    }
  },
  created () {
    this._getSongSheetList()
  },
  methods: {
    // 格式化传过来的数据
    _normalizeSongSheet (list) {
      let ret = []
      // 空数组不能foreach
      if (!list) { return }

      list.forEach(item => {
        if (item.songid && item.albumid) {
          _getMusic(item.songmid).then(res => {
            if (res.code === ERR_OK) {
              const svkey = res.data.items
              const songvkey = svkey[0].vkey
              const _Song = createSong(item, songvkey)
              ret.push(_Song)
            }
          }).catch((err) => {
            console.log(err)
          })
        }
      })
      return ret
    },
    _getSongSheetList () {
      // 处理边界情况
      if (!this.songSheet.dissid) {
        this.$router.push('/recommend')
        return
      }

      getSongSheetList(this.songSheet.dissid).then((result) => {
        if (result.code === ERR_OK) {
          this.songs = this._normalizeSongSheet(result.cdlist[0].songlist)
        }
      }).catch((err) => {
        console.log(err)
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