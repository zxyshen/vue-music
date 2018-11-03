import { playMode } from '@/assets/js/config'
import { loadSearch, loadPlay, loadFavourite } from '@/assets/js/cache.js'

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
  currentIndex: -1,
  // 歌单
  songSheet: {},
  // 榜单
  topList: {},
  // 搜索记录，默认从本地存储读取
  searchHistory: loadSearch(),
  // 播放记录
  playHistory: loadPlay(),
  favouriteList: loadFavourite()
}
export default state
