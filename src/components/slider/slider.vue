<template>
  <div class="slider"
       ref="slider">
    <div class="slider-group"
         ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots"
         v-if="showDot">
      <span class="dot"
            v-for="(item, index) in dots"
            :key="index"
            :class="{active: currentItemIndex === index}"></span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
export default {
  name: 'Slider',
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    // autoPlay间隔
    interval: {
      type: Number,
      default: 4000
    },
    showDot: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      dots: [],
      currentItemIndex: 0
    }
  },
  mounted () {
    // 因为设置了keep-alive，所以这个init只执行一次
    this.$nextTick(() => { this.init() })
  },
  activated () {
    // 启动slider
    this.slider.enable()
    // 刷新
    this._refresh()
    // 滚动
    this._onScroll()
  },
  deactivated () {
    // 暂时停用
    this._destroyed()
  },
  // keep-alive时不触发这个而触发deactivated
  beforeDestroy () {
    this._destroyed()
  },
  methods: {
    _setSliderWidth (isResize) {
      // 这个this.children换成var children是否一样？不一样
      // 那为什么不放在data里呢？
      // 因为它不用上template
      this.children = this.$refs.sliderGroup.children
      // 5 console.log(this.children.length)
      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        child.classList.add('slider-item')
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }

      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots () {
      this.dots = new Array(this.children.length)
    },
    _initSlider () {
      // 这里感觉弄个swiper.config比较好
      this.slider = new BScroll(this.$refs.slider, {
        // 允许横向滚动
        scrollX: true,
        // 不允许纵向滚动
        scrollY: false,
        // 弹性
        momentum: false,
        // 配置轮播项
        snap: {
          loop: this.loop, // 是否支持无缝滚动
          threshold: 0.3,
          speed: 400 // 轮播间隔
        },
        // 这里会和fastclick冲突
        click: true
      })
      // 7 console.log(this.children.length)

      // 每张图片轮播结束时触发
      this.slider.on('scrollEnd', this._onScroll)
    },
    _play () {
      this.timer = setTimeout(() => {
        // 跳转到下一页
        this.slider.next()
      }, this.interval)
    },
    _onScroll () {
      if (!this.slider || !this.slider.enabled) { return }

      // 获取当前页
      this.currentItemIndex = this.slider.getCurrentPage().pageX
      if (this.autoPlay) {
        clearTimeout(this.timer)
        this._play()
      }
    },
    _refresh () {
      window.addEventListener('resize', this._onResize)
      this._setSliderWidth(true)
      this.slider.refresh()
    },
    _onResize () {
      if (!this.slider) { return }
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        // 刷新
        this._refresh()
        // 继续滚动
        this._onScroll()
      }, 60)
    },
    _destroyed () {
      this.slider.disable()
      window.removeEventListener('resize', this._onResize)
      clearTimeout(this.timer)
      clearTimeout(this.resizeTimer)
    },
    init () {
      this._setSliderWidth()
      // initDots必须要在initSlider之前
      // 因为如果slider设置了无缝滚动，initSlider时
      // 就会在sliderGroup一前一后克隆一个子节点
      // 这时候 this.$refs.sliderGroup.children.length 就会多出来2
      if (this.showDot) { this._initDots() }
      this._initSlider()
      if (this.autoPlay) { this._play() }
      window.addEventListener('resize', this._onResize)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';

.slider {
  min-height: 1px;

  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-d;

      &.active {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>
