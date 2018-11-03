<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    listenScrollEnd: {
      type: Boolean,
      default: false
    },
    listenBeforeScroll: {
      type: Boolean,
      default: false
    },
    pullUp: {
      type: Boolean,
      default: false
    },
    pullDown: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted () {
    // 这个nextTick是可以等待被slot勾住的dom挂载以后再执行的，
    // 但是如果有transition或者替换元素，那么会出现获取不到高度的现象。
    this.$nextTick(() => {
      this._initScroll()
    })
  },
  methods: {
    _initScroll () {
      if (!this.$refs.wrapper) { return }

      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })
      // 派发滚动事件 (better-scroll自己派发的scroll事件)
      // pos 位置信息
      this.listenScroll && this.scroll.on('scroll', pos => this.$emit('scroll', pos))
      this.listenScrollEnd && this.scroll.on('scrollEnd', pos => this.$emit('scrollEnd', pos))
      // 坑：上拉加载是会和下拉加载碰撞的，因为maxScrollY是最大的滚动距离。
      // 下来加载更新数据时，如果当时数据为空，那么maxScrollY就是0，肯定会触发
      // 上拉加载。

      // 解决办法：设置标志变量，上拉加载和下拉加载不能同时使用
      // movingDirectionY

      // 上拉加载
      this.pullUp && this.scroll.on('scrollEnd', pos => {
        if (pos.y <= this.scroll.maxScrollY + 10 && this.scroll.movingDirectionY === 1) {
          console.log('end')
          this.$emit('scrollToEnd')
        }
      })
      // 下拉加载
      this.pullDown && this.scroll.on('touchEnd', pos => {
        if (pos.y >= 30 && this.scroll.movingDirectionY === -1) {
          console.log('top')
          this.$emit('scrollToTop')
        }
      })

      // 派发beforeScrool事件
      this.listenBeforeScroll && this.scroll.on('beforeScrollStart', () => {
        this.$emit('beforeScroll')
      })
    },
    _refresh () {
      this.scroll && this.scroll.refresh()
    },
    // scrollTo(x, y, time, easing)
    _scrollTo (...config) {
      this.scroll && this.scroll.scrollTo(...config)
    },
    // scrollToElement(el, time, offsetX, offsetY, easing)
    _scrollToElement (...config) {
      this.scroll && this.scroll.scrollToElement(...config)
    }
  },
  watch: {
    // 用于监视数据的，如果数据长度有变，这里要刷新一下
    data () {
      // 如果有transition或者替换元素
      // 还需要在父组件中使用after-enter钩子或者监听例如img-onload的函数
      // 然后在里面再用一次this.scroll.refresh
      // 或者在父组件中就定好高度再或者顶一个一个refreshDelay props
      setTimeout(() => {
        this._refresh()
      }, this.refreshDelay)
    }
  }
}
</script>
