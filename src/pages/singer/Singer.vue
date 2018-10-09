<template>
  <div class="singer">
    <listview :data="singers"></listview>
  </div>
</template>

<script>
import { getSingerList } from '@/api/singer.js'
import { ERR_OK } from '@/api/config.js'
import Singer from '@/assets/js/Singer.js'
import Listview from './components/listview/listview'
const HOT_SINGER_LEN = 10
const HOT_NAME = '热门'
export default {
  name: 'singer',
  data () {
    return {
      singers: []
    }
  },
  components: {
    Listview
  },
  created () {
    this._getSingerList()
  },
  methods: {
    _getSingerList () {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
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
