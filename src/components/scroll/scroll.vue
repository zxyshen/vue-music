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
      // 监听滚动事件 (better-scroll自己派发的scroll事件)
      // pos 位置信息
      this.listenScroll && this.scroll.on('scroll', pos => this.$emit('scroll', pos))
      this.listenScrollEnd && this.scroll.on('scrollEnd', pos => this.$emit('scrollEnd', pos))
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
      // 或者在父组件中就定好高度
      this.$nextTick(() => {
        if (this.scroll) {
          this.scroll.refresh()
        }
      })
    }
  }
}
</script>
