import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from '@/assets/js/config'
import { shuffle } from '@/assets/js/util.js'

export const refreshListHeightMixin = {
  computed: {
    ...mapGetters(['playList'])
  },
  mounted () {
    this._refreshListHeight(this.playList)
  },
  activated () {
    this._refreshListHeight(this.playList)
  },
  watch: {
    playList (newVal) {
      this._refreshListHeight(newVal)
    }
  },
  methods: {
    _refreshListHeight () {
      throw new Error('component must implement _refreshListHeight method')
    }
  }
}

export const playerMixin = {
  data () {
    return {
      tipText: ''
    }
  },
  computed: {
    ...mapGetters([
      'sequenceList',
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'favouriteList'
    ]),
    iconForPlayMode () {
      return this.mode === playMode.sequence
        ? 'icon-sequence'
        : this.mode === playMode.loop
          ? 'icon-loop'
          : 'icon-random'
    }
  },
  methods: {
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions(['deleteSong', 'deleteAllSong', 'deleteFavouriteList', 'saveFavouriteList']),
    // 改变播放模式
    _onClickChangeMode () {
      // 给个标志位，防止改变播放模式时，currentSong接收到相同的id会执行loop方法
      this.changeMode = true
      // 每次点击都会 + 1 % 3 也就是依次取到 1 2 3
      const mode = (this.mode + 1) % 3
      // 改变播放模式
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        // 打乱列表
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // 改变列表，当前播放的歌曲不能变，所以在改变歌曲列表之前先保存
      // 当前歌曲在对应列表中的index
      this._resetCurrentIndex(list)
      this.setPlayList(list)
    },
    _resetCurrentIndex (list) {
      let index = list.findIndex(item => item.id === this.currentSong.id)
      this.setCurrentIndex(index)
    },
    _onToggleFavourite (song) {
      if (this._isFavourite(song)) {
        this.deleteFavouriteList(song)
        this.tipText = '取消收藏'
        this.$refs.topTip.show()
      } else {
        this.saveFavouriteList(song)
        this.tipText = '添加收藏'
        this.$refs.topTip.show()
      }
    },
    getFavouriteIcon (song) {
      return this._isFavourite(song) ? 'icon-favorite' : 'icon-not-favorite'
    },
    _isFavourite (song) {
      const index = this.favouriteList.findIndex(item => item.id === song.id)
      return index > -1
    }
  }
}

export const searchMixin = {
  computed: {
    ...mapGetters(['searchHistory'])
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    ...mapActions(['saveSearch', 'deleteSearch']),
    _onBlurInput () {
      this.$refs.searchBox.blur()
    },
    _onQueryChange (query) {
      this.query = query
    },
    _onDeleteOneSearchHistory (query) {
      this.deleteSearch(query)
    },
    _onClickAddQuery (k) {
      this.$refs.searchBox._setQuery(k)
    },
    _onSaveSearchHistory () {
      this.saveSearch(this.query)
      this.$refs.topTip.show()
    }
  }
}
