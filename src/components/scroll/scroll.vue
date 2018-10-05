<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
export default {
  props: {
    probetype: {
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
        probetype: this.probetype,
        click: this.click
      })
    },
    _refresh () {
      this.scroll && this.scroll.refresh()
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
