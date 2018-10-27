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
import { getSingerDetail } from '@/api/singer.js'
import { ERR_OK } from '@/api/config.js'
import { createSong, _getMusic } from '@/assets/js/Song.js'
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
    // 接收更新后的state-singer
    ...mapGetters(['singer']),
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.avatar
    }
  },
  created () {
    this._getDetail()
  },
  methods: {
    _getDetail () {
      // 处理边界情况
      // 解释：vuex里的数据在页面unload的时候会清空，就是说页面刷新过后，vuex里的数据
      // 已经不存在了，这时候this.singer.id为空是取不到数据的
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      // 根据singer.id获取歌手详细数据
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          // 分配data，渲染dom
          this.songs = this._normalizeSongList(res.data.list)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    _normalizeSongList (list) {
      let ret = []
      // 空数组不能foreach
      if (!ret) { return }
      list.forEach(item => {
        // 解构赋值，只获取item中的musicData
        let { musicData } = item
        // 这两个id是必须的
        if (musicData.songid && musicData.albummid) {
          _getMusic(musicData.songmid).then(res => {
            if (res.code === ERR_OK) {
              const svkey = res.data.items
              const songvkey = svkey[0].vkey
              const _Song = createSong(musicData, songvkey)
              ret.push(_Song)
            }
          })
        }
      })
      return ret
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