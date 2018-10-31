<template>
  <scroll @scrollToEnd="_onSearchMore"
          @beforeScroll="_onBeforeScroll"
          :listenBeforeScroll="true"
          class="suggest"
          :data="result"
          :pullUp="pullUp"
          ref="suggest">
    <ul class="suggest-list">
      <li @click="_onSelectItem(item)"
          class="suggest-item"
          v-for="(item, index) in result"
          :key="index">
        <div class="icon">
          <i :class="iconCls(item)"></i>
        </div>
        <div class="name">
          <div class="text"
               v-html="getDisplayName(item)"></div>
        </div>
      </li>
      <div class="loading-wrapper"
           v-show="hasMore">
        <loading :desc="loadingDesc"></loading>
      </div>
    </ul>
    <div class="no-reasult-wrapper"
         v-show="!hasMore&& (!result || !result.length)">
      <no-result title="抱歉，没有结果噢"></no-result>
    </div>
  </scroll>
</template>

<script>
import Loading from '@/components/loading/loading'
import Scroll from '@/components/scroll/scroll'
import NoResult from '@/components/no-result/no-result'
import { search } from '@/api/search'
import { ERR_OK } from '@/api/config'
import { createSong, _getMusic } from '@/assets/js/Song'
// import { createSong } from '@/assets/js/Song'
import { mapMutations, mapActions } from 'vuex'
import Singer from '@/assets/js/Singer'
// 每次请求的最多条数
const PERPAGE = 20
const TYPE_SINGER = 'singer'

export default {
  props: {
    query: {
      type: String,
      default: ''
    }
  },
  components: {
    Loading,
    Scroll,
    NoResult
  },
  data () {
    return {
      page: 1,
      result: [],
      // 是否上拉加载
      pullUp: true,
      // 是否还有数据
      hasMore: true,
      // 辅助watch
      searchSongs: [],
      // 是否显示歌手，这个必须要传
      showSinger: true,
      // 是否正在上拉加载数据
      onSearchMore: true,
      // loadingDesc
      loadingDesc: '正在努力加载中......'
    }
  },
  computed: {
    // 计算属性不能接收参数，所以这个要写在方法里
    // iconCls (item) {
    //   return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
    // },
  },
  watch: {
    query (q) {
      // 节流
      if (q && q !== '') { this._query() }
    },
    searchSongs (newSongs) {
      // 是否push完成
      if (this.pushOver) {
        this.result = this.result.concat(this._genResult(this.zhida, newSongs))
        // this.result = this.result.concat(newValue)
      }
    },
    onSearchMore (v) {
      if (!this.hasMore && v) {
        this.hasMore = true
        this.loadingDesc = '已经没有数据了哦！'
        clearTimeout(this.searchMoreTimer)
        this.searchMoreTimer = setTimeout(() => {
          this.hasMore = false
          this.loadingDesc = '正在努力加载中......'
        }, 200)
      }
    }
  },
  methods: {
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions({
      insertSong: 'insertSong'
    }),
    _refresh () {
      this.$refs.suggest._refresh()
    },
    // cls
    iconCls (item) {
      return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
    },
    getDisplayName (item) {
      return item.type === TYPE_SINGER ? item.singername : `${item.name}-${item.singer}`
    },
    _onBeforeScroll () {
      this.$emit('beforeScroll')
    },
    _onSelectItem (item) {
      // 如果点的是歌手
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.setSinger(singer)
        this.$router.push({
          path: `/singer/${singer.id}`
        })
      } else {
        // 如果点的是歌曲 触发inserSong action
        this.insertSong(item)
        // 派发select事件，保存搜索历史，
        // suggest只负责显示搜索的结果。保存搜索历史由外部组件来做
        this.$emit('select')
      }
    },
    // 上拉加载
    _onSearchMore (action) {
      this.onSearchMore = true
      if (!this.hasMore) {
        return
      }
      this.page++
      // Singer只显示一次
      this.showSinger = false
      this._search()
    },
    // 首次获取搜索数据
    _query () {
      // 初始化
      // result置空
      this.result = []
      // hasMore showSinger page zhida pushover重置
      this.hasMore = true
      this.showSinger = true
      this.page = 1
      this.pushOver = false
      this.zhida = null
      // 保证一开始是在顶部的
      this.$refs.suggest._scrollTo(0, 0)
      this._search()
    },
    // 主要加载函数
    _search () {
      // 第一层异步
      search(this.query, this.page, this.showSinger, PERPAGE).then(res => {
        if (res.code === ERR_OK) {
          this.zhida = res.data.zhida
          // 第二层异步
          this.searchSongs = this._normalizeResult(res.data)
          this._checkMore(res.data)
        }
      })
    },
    // 检查是否还有数据
    _checkMore (data) {
      const song = data.song
      // 如果songlist为0或者 curnum + curpage * PERPAGE > totalnum (接口自带的)
      if (!song.list || !song.list.length || (song.curnum + song.curpage * PERPAGE) > song.totalnum) {
        this.hasMore = false
        this.onSearchMore = false
      }
    },
    // 有zhida就合并对象到数组中
    _genResult (data, newSongs) {
      let ret = [] // push歌手进空数组
      if (data && data.singerid) {
        ret.push({ ...this.zhida, ...{ type: TYPE_SINGER } })
      }
      if (newSongs) {
        ret = ret.concat(newSongs)
      }
      return ret
    },
    // 格式化数据
    _normalizeResult (data) {
      let ret = []
      // 这个歌手还真不能在这里push，会被异步碰撞替换掉，只能放在watch里了
      // if (data && data.singerid) {
      //   await ret.push({ ...this.zhida, ...{ type: TYPE_SINGER } })
      // }

      let pushIndex = 0 // 判断是否是最最后一次push的标记变量
      let dataLength = 0
      if (data.song) {
        // 空数组不能foreach
        if (!data.song || !data.song.list.length) { return }
        // 错误示范，这个getMusic是个异步请求，这里弄成同步的了，我说速度怎么和
        // 不用async的版本差那么多
        // for (let item of data.song.list) {
        //   if (item.songid && item.albumid) {
        //     let res = await _getMusic(item.songmid)
        //     if (res.code === ERR_OK) {
        //       const svkey = res.data.items
        //       const songvkey = svkey[0].vkey
        //       const _Song = createSong(item, songvkey)
        //       ret.push(_Song)

        //       pushIndex++
        //       this.pushOver = data.song.list.length === pushIndex
        //     }
        //   }
        // }

        // 先把list中有songid和albumid的找出来，因为不是所有song都有singid和albumid
        // 为了防止pushOver永远不为true
        data.song.list.forEach(item => {
          if (item.songid && item.albumid) {
            dataLength++
          }
        })
        data.song.list.forEach(item => {
          if (item.songid && item.albumid) {
            _getMusic(item.songmid).then(res => {
              if (res.code === ERR_OK) {
                pushIndex++
                const svkey = res.data.items
                const songvkey = svkey[0].vkey
                const _Song = createSong(item, songvkey)
                ret.push(_Song)
                this.pushOver = dataLength === pushIndex
              }
            }).catch((err) => {
              console.log(err)
            })
          }
        })
      }
      return ret
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
