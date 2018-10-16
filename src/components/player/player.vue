<template>
  <div class="player"
       v-show="playList.length">
    <transition name="normal"
                @enter="_onEnter"
                @after-enter="_onAfterEnter"
                @leave="_onLeave"
                @after-leave="_onAfterLeave">
      <div class="normal-player"
           v-show="fullScreen">
        <div class="background">
          <img width="100%"
               height="100%"
               :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back"
               @click="_onClickBack">
            <i class="icon-back"></i>
          </div>
          <h2 class="title"
              v-html="currentSong.name"></h2>
          <h2 class="subtitle"
              v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper"
                 ref="cdWrapper">
              <div class="cd"
                   :class="cdCls">
                <img class="image"
                     :src="currentSong.image"
                     @load="_onImgLoad">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{_formatInterval(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent"
                            @percentChange="_onPercentChange"></progress-bar>
            </div>
            <span class="time time-r">{{_formatInterval(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left"
                 @click.prevent="_onClickChangeMode">
              <i :class="iconForPlayMode"></i>
            </div>
            <div class="icon i-left"
                 :class="prevCls">
              <i class="icon-prev"
                 @click="_onClickPrev"></i>
            </div>
            <div class="icon i-center"
                 :class="disableCls">
              <i @click="_onClickTogglePlay"
                 :class="playIcon"></i>
            </div>
            <div class="icon i-right"
                 :class="disableCls">
              <i class="icon-next"
                 @click="_onClickNext"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="mini">
      <div @click="_onClickOpen"
           class="mini-player"
           v-show="!fullScreen">
        <div class="icon">
          <img width="40"
               height="40"
               :src="currentSong.image"
               :class="cdCls"
               ref="img">
        </div>
        <div class="text">
          <h2 class="name"
              v-html="currentSong.name"></h2>
          <p class="desc"
             v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :percent="percent">
            <i @click.stop="_onClickTogglePlay"
               :class="playIconMini"
               class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 关于什么时候播放。就是在每次歌曲切换的时候播放
      化作vue就是 watch-currentSong的改变 -->
    <audio ref="audio"
           :src="currentSong.url"
           @canplay="_onCanplay"
           @error="_onErr"
           @timeupdate="_onTimeUpDate"
           @ended="_onAudioEnded"></audio>
    <!-- canply 歌曲加载完毕
           err 歌曲加载失败 -->
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import animations from 'create-keyframe-animation'
import ProgressBar from '@/components/progress-bar/progress-bar'
import ProgressCircle from '@/components/progress-circle/progress-circle'
import { playMode } from '@/assets/js/config.js'
import { shuffle, getRandomInt } from '@/assets/js/util.js'

export default {
  data () {
    return {
      songReady: false,
      imgReady: false,
      currentTime: 0,
      haveLastIndex: false
    }
  },
  components: {
    ProgressBar,
    ProgressCircle
  },
  computed: {
    ...mapGetters(['fullScreen', 'sequenceList', 'playList', 'currentSong', 'playing', 'currentIndex', 'mode']),
    iconForPlayMode () {
      return this.mode === playMode.sequence ? 'icon-sequence'
        : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    prevCls () {
      if (this.mode === playMode.random && !this.haveLastIndex && this.lastIndex !== undefined) { return 'disable' } else { return this.songReady ? '' : 'disable' }
    },
    // 根据playing的三个样式
    // cd旋转
    cdCls () {
      return (this.songReady && this.playing) ? 'play' : 'play pause'
    },
    // 播放暂停按钮
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    playIconMini () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    }
  },
  watch: {
    // 图片超时处理
    // 监听图片加载一开始imgReady就是false，等待1秒后，如果图片还未加载就去重新请求src
    imgReady (v) {
      if (!v) {
        this.timer = setTimeout(() => {
          // 这里是没意义的、需要一个新源才有用
          this.oImg.src = this.currentSong.image
        }, 1000)
      } else {
        this.timer = null
      }
    },
    currentSong (oldSong, currentSong) {
      if (oldSong.id === currentSong.id) { return }

      // 这里是不能直接play的，因为audio还要去请求src。也就是onload/nextTick之后
      this.$nextTick(() => {
        this.audio.play()
      })
    },
    // 通过监听playing状态来控制audio的播放和暂停，下面的方法就负责改状态就行了
    playing (playing) {
      this.$nextTick(() => {
        playing ? this.audio.play() : this.audio.pause()
      })
    }
  },
  created () {
    this.$nextTick(() => {
      this.audio = this.$refs.audio
      this.oImg = this.$refs.img
    })
    // 这个songReady不能写在这里，因为在计算属性里会用到
    // this.songReady = false
  },
  methods: {
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    // 改变播放模式
    _onClickChangeMode () {
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
    // 根据滚动条传过来的percent改变播放进度
    _onPercentChange (percent) {
      this.$refs.audio.currentTime = this.currentSong.duration * percent
      this._play()
    },
    // 为interval补零
    _pad (num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    // 格式化时间戳
    _formatInterval (interval) {
      interval = Math.floor(interval)
      const minute = Math.floor(interval / 60)
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    // 获取audio的当前播放进度的时间戳
    _onTimeUpDate (ev) {
      this.currentTime = ev.target.currentTime
    },
    // 更改歌曲
    _changeSong (action) {
      // if (!this.songReady || !this.imgReady) { return }
      if (!this.songReady) { return }
      let currentIndex = this.currentIndex
      if (action === 'prev') {
        // 判断mode
        // 如果是随机播放，currentIndex = lastIndex
        // 这个lastIndex只可以用一次，然后设置prev为disabled
        if (this.mode === playMode.random && this.haveLastIndex) {
          currentIndex = this.lastIndex
          this.haveLastIndex = false
        } else {
          currentIndex -= 1
        }

        if (currentIndex === -1) {
          currentIndex = this.playList.length - 1
        }
      } else if (action === 'next') {
        // 判断mode
        // 如果是随机播放，这里的currentIndex应该是取一个除了自己之外的随机数
        // 然后保存上一次的currentIndex为lastIndex传给prev
        // 这个lastIndex只可以用一次，然后设置prev为disabled
        if (this.mode === playMode.random) {
          this.lastIndex = currentIndex
          while (currentIndex === this.lastIndex) {
            currentIndex = getRandomInt(0, this.playList.length - 1)
          }
          this.haveLastIndex = true
        } else {
          currentIndex += 1
        }

        if (currentIndex === this.playList.length - 1) {
          currentIndex = 0
        }
      }
      // 通过改变currentIndex来切换歌曲
      // ( currentSong是通过playList[currentIndex]获取的 )
      this.setCurrentIndex(currentIndex)
      this._play()
      this.songReady = false
      this.imgReady = false
    },
    _loop () {
      this.audio.currentTime = 0
      // audio - ended的时候就不会再播放了，所以更改过currentTime之后还要再设置播放
      this.audio.play()
    },
    // audio - ended
    _onAudioEnded () {
      if (this.mode === playMode.loop) {
        // 循环播放
        this._loop()
      } else {
        // 下一首
        this._onClickNext()
      }
    },
    // audio-src-onload-success
    _onCanplay () {
      this.songReady = true
    },
    // audio-src-onload-err
    _onErr () {
      this.songReady = true
    },
    // 专辑封面加载完成
    _onImgLoad () {
      this.imgReady = true
      // 清除timeout
      clearTimeout(this.timer)
      this.timer = null
    },
    _onClickNext () {
      this._changeSong('next')
    },
    _onClickPrev () {
      this._changeSong('prev')
    },
    _onClickTogglePlay () {
      this.setPlayingState(!this.playing)
    },
    _play () {
      if (!this.playing) { this._onClickTogglePlay() }
    },
    _pause () {
      if (this.playing) { this._onClickTogglePlay() }
    },
    _onClickBack () {
      this.setFullScreen(false)
    },
    _onClickOpen () {
      this.setFullScreen(true)
    },
    // el就是执行的元素，done就是下一个函数_onAfterEnter
    _onEnter (el, done) {
      const { x, y, scale } = this._getPosAndScale()
      // 定义animation
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      // 注册animation
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 500,
          easing: 'linear'
        }
      })
      // 执行animation
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    _onAfterEnter (el, done) {
      // 解绑
      animations.unregisterAnimation('move')
    },
    _onLeave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    _onAfterLeave (el, done) {
      // 清空
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style.transform = ''
    },
    // 辅助动画的函数，获取位置
    _getPosAndScale () {
      // mini
      const targetWidth = 40
      const paddingLeft = 40
      const paddingTop = 80

      // normal
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingTop
      return { x, y, scale }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text-ll;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text-d;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 10px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;

            &.play {
              animation: rotate 20s linear infinite;
            }

            &.pause {
              animation-play-state: paused;
            }

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;

          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
            pointer-events:none
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;

      img {
        border-radius: 50%;

        &.play {
          animation: rotate 10s linear infinite;
        }

        &.pause {
          animation-play-state: paused;
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      height: 30px;
      padding: 0 10px;
      line-height: 30px;
      position: relative;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        position: absolute;
        font-size: 30px;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
