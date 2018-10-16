import {playMode} from '@/assets/js/config'
const state = {
  singer: {},
  // 播放中？
  playing: false,
  // 全屏？
  fullScreen: false,
  // 要播放的歌曲列表
  playList: [],
  // 正常顺序的列表
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放歌曲索引
  currentIndex: -1
}
export default state