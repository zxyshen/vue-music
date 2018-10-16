<template>
  <div class="progress-bar"
       ref="progressBar"
       @click.prevent="_onClickProgress">
    <div class="bar-inner">
      <div class="progress"
           ref="progress"></div>
      <div class="progress-btn-wrapper"
           ref="progressBtn"
           @touchstart.prevent="_onTouchStartProgress"
           @touchmove.prevent="_onTouchMoveProgress"
           @touchend="_onTouchEndProgress"
           @click.stop.prevent="">
           <!-- 这个 click.stop.prevent ="" 是为了防止这里的点击事件冒泡到
           progressBar的click上 -->
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
const PROGRESS_BTN_WIDTH = 16
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent (percent) {
      if (percent >= 0 && !this.touch.init) {
        const barWidth = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
        const offsetWidth = percent * barWidth
        this._offset(offsetWidth)
      }
    }
  },
  created () {
    this.touch = {}
  },
  methods: {
    _onClickProgress (ev) {
      this._offset(ev.offsetX)
      this._triggerPercent()
    },
    _offset (offsetWidth) {
      this.$refs.progress.style.width = offsetWidth + 'px'
      this.$refs.progressBtn.style.transform = `translate3d(${offsetWidth}px,0,0)`
    },
    _onTouchStartProgress (ev) {
      this.touch.init = true
      this.touch.startX = ev.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },
    _onTouchMoveProgress (ev) {
      if (!this.touch.init) { return }
      const deltaX = ev.touches[0].pageX - this.touch.startX
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetWidth)
    },
    _onTouchEndProgress (ev) {
      this.touch.init = false
      this._triggerPercent()
    },
    _triggerPercent () {
      const barWidth = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~@/assets/stylus/variable';

.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>