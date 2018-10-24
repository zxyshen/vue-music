<template>
  <div class="singer" ref="singer">
    <listview @select="_onSelectSinger"
              :data="singers" ref="list"></listview>
    <!-- 路由出口 -->
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from '@/api/singer.js'
import { ERR_OK } from '@/api/config.js'
import Singer from '@/assets/js/Singer.js'
import Listview from './components/listview'
import { mapMutations } from 'vuex'
import { refreshListHeightMixin } from '@/assets/js/mixin.js'

const HOT_SINGER_LEN = 10
const HOT_NAME = '热门'
export default {
  name: 'singer',
  data () {
    return {
      singers: []
    }
  },
  mixins: [refreshListHeightMixin],
  components: {
    Listview
  },
  created () {
    this._getSingerList()
  },
  methods: {
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    // 当mini播放器出现时(其实也就是playList出现)，改变scroll box的bottom。
    // 然后刷新scroll，重新获取高度
    _refreshListHeight (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list._refresh()
    },
    // 监听listview click事件
    _onSelectSinger (singer) {
      const id = singer.id
      this.$router.push({
        path: `/singer/${id}`
      })
      // mutation commit 改变state-singer
      this.setSinger(singer)
    },
    _getSingerList () {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          // _normalizeSingerList再传入
          this.singers = this._normalizeSingerList(res.data.list)
        }
      })
    },
    _normalizeSingerList (list) {
      // 不能用数组存，不然没有标志位。
      // 想要要的数据形式是 hot : {title,items} a: {title,items} c: {title,items} d : {title,items}
      // 所以必须要有一个key。因此只能先用map

      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      // 遍历获取到的数据
      list.forEach((item, index) => {
        // 把前十个数据放到map[hot].items里
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        }

        // list->item.Findex就是hot/a/b/c/d
        const key = item.Findex
        // 如果没有这个key就创建map[key]
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          name: item.Fsinger_name,
          id: item.Fsinger_mid
        }))
      })

      // 准备两个数组，用于把map拆分成[hot]和[a/b/c/d]
      let hot = []
      let ret = []
      for (let k in map) {
        let val = map[k]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0))
      // 注意：arr.sort()默认情况下，都是以字符串的规则排序的，即使参数是数字类型。
      // 但是，如果数组成员是个对象，并且要根据对象的一个属性排序。
      // 就需要自己定义了，这时候如果还像以字符串的规则排序，就要这么写。

      // 连接数组
      return hot.concat(ret)
    }
  }
}
</script>

<style lang="stylus" scoped>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
