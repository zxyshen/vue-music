<template>
  <scroll @scroll="_onListenScroll"
          class="listview"
          :data="data"
          ref="listview"
          :listenScroll="listenScroll"
          :probeType="probeType">
    <ul>
      <li v-for="(item, index) in data"
          :key="index"
          class="list-group"
          ref="listGroup">
        <h2 class="list-group-title">{{item.title}}</h2>
        <ul>
          <li @click="_onSelectItem(innerItem)"
              v-for="(innerItem, index) in item.items"
              :key="index"
              class="list-group-item">
            <img class="avatar"
                 v-lazy="innerItem.avatar">
            <span class="name">{{innerItem.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut"
         @touchstart="_onShortcutTouchStart"
         @touchmove.stop.prevent="_onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList"
            :key="index"
            class="item"
            :data-index="index"
            :class="{current : currentIndex === index}">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed"
         v-show="fixedTitle"
         ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length"
         class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from '@/components/scroll/scroll'
import Loading from '@/components/loading/loading'
// 每个字母的高度
const ANCHOR_HEIGHT = 18
// FIXED_TITLE_HEIGHT
const FIXED_TITLE_HEIGHT = 30
export default {
  props: {
    data: {
      type: Array,
      // default: []
      default: () => []
    }
  },
  data () {
    return {
      listenScroll: true,
      probeType: 3,
      scrollY: -1,
      diff: -1,
      currentIndex: 0
    }
  },
  components: {
    Scroll,
    Loading
  },
  created () {
    this.touch = {}
    this.listHeight = []
  },
  computed: {
    shortcutList () {
      var cutList = this.data.map(v => v.title.substring(0, 1))
      return cutList
    },
    fixedTitle () {
      if (this.scrollY > 0) { return '' }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  watch: {
    data () {
      this.$nextTick(() => {
        this._calculateHeight()
      })
    },
    // 根据_onListenScroll变动，better-scroll肯定初始化好了。
    // 也就是说data已经接收到，并且传到better-scroll里了，所以此时的
    // listHeight是已经计算好的
    scrollY (y) {
      const listHeight = this.listHeight
      // 一共有listHeight.length-1个区间
      for (let i = 0; i < listHeight.length; i++) {
        const firstHeight = listHeight[i]
        const endHeight = listHeight[i + 1]
        // 三种滚动情况

        // 1.超出上界，继续向上拉
        if (-y < firstHeight) { break }

        // 2.处于中间/超出下界
        // !endHeight ---> listHeight[i+1]当下标超过数组长度时，此时的值为undefined
        if (!endHeight || (-y > firstHeight && -y < endHeight)) {
          this.currentIndex = i
          if (-y >= firstHeight && -y < endHeight) {
            this.currentIndex = i
            this.diff = endHeight + y
            return
          }
          return
        }
        // 3.超出下界的部分被!endHeight拦截了
      }
    },
    diff (diff) {
      let fixedTop = (diff > 0 && diff < FIXED_TITLE_HEIGHT) ? diff - FIXED_TITLE_HEIGHT : -1
      // 为0 === 0 节流，也就是直接滑动右侧list-shortcut的时候，fixedTop总是0，
      // 这个时候就直接返回
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  methods: {
    _onShortcutTouchStart (e) {
      const index = Number.parseInt(e.target.dataset.index) // String
      this._scrollTouchTo(index)

      // this.touch is undefined  因为要挂载在touch下面，所以这个touch就要先定义。
      // 不然找不到touch对象
      // 如果是挂载在this下面就不需要了，因为this已经定义过了
      this.touch.y1 = e.touches[0].pageY
      this.touch.index = index
    },
    _onShortcutTouchMove (e) {
      this.touch.y2 = e.touches[0].pageY
      const delta = Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
      const index = this.touch.index + delta
      this._scrollTouchTo(index)
    },
    _scrollTouchTo (index) {
      // 处理边界情况
      if (Number.isNaN(index) || index < 0 || index > 22) { return }
      this.$refs.listview._scrollToElement(this.$refs.listGroup[index], 0)
      this.currentIndex = index
    },
    _onListenScroll (pos) {
      this.scrollY = pos.y
    },
    _calculateHeight () {
      // watch data --- data会多次变动，每次变动之前先置空，不然会有重复数据。
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (const item of list) {
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    _onSelectItem (item) {
      this.$emit('select', item)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
