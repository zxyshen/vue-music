import * as types from './mutation-types'
import { playMode } from '@/assets/js/config.js'
import { shuffle } from '@/assets/js/util.js'
import { saveSearchHistory, deleteSearchHistory,
  clearSearchHistory, savePlay, saveFavourite,
  deleteFavourite, deleteAllFavourite, deletePlay, deleteAllPlay } from '@/assets/js/cache.js'

// 清空搜索历史
export const clearSearch = function ({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearchHistory())
}

// 删除搜索历史
export const deleteSearch = function ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearchHistory(query))
}

// 保存搜索记录
export const saveSearch = function ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearchHistory(query))
}

function _resetIndex (list, song) {
  let index = list.findIndex(item => item.id === song.id)
  return index
}

// 插入歌曲，用于搜索/历史页面生成playList
export const insertSong = function ({ commit, state }, song) {
  let playList = [...state.playList]
  let sequenceList = [...state.sequenceList]
  let currentIndex = state.currentIndex

  // 记录当前歌曲
  let currentSong = playList[currentIndex]
  // 查找在当前列表是否本就存在要插入的歌曲，并返回其索引
  let fpIndex = _resetIndex(playList, song)

  // 先默认在当前索引的后面插入歌曲,然后再判断
  currentIndex++
  playList.splice(currentIndex, 0, song)

  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    // 如果当前索引大于这首歌的序号
    if (currentIndex > fpIndex) {
      // 把这首歌删了，然后索引回到以前。
      playList.splice(fpIndex, 1)
      currentIndex--
      // 这一些列操作就等于是把数组中原本存在的元素拿到当前索引的后面
    } else {
      // 如果当前索引小于这首歌的序号那就直接把这首歌删了
      // 这里为什么要用fpindex+1呢，因为当前索引小于这首歌的序号，当前索引++
      // 这首歌的序号又在当前索引的前面，自然要+1
      playList.splice(fpIndex + 1, 1)
    }
  }

  // 查找当前歌曲在sequenceList里的位置
  let currentSIndex = _resetIndex(sequenceList, currentSong) + 1
  // 查找在当前列表是否本就存在要插入的歌曲，并返回其索引
  let fsIndex = _resetIndex(sequenceList, song)

  // 下面的逻辑跟上面的一样
  sequenceList.splice(currentIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 正常点击播放
export const selectPlay = function ({ commit, state }, { list, index }) {
  let playList = [...list]
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    playList = shuffle(playList)
    index = _resetIndex(playList, list[index])
  }
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 随机播放
export const randomPlay = function ({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, shuffle(list))
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const deleteSong = function ({commit, state}, song) {
  let playList = [...state.playList]
  let sequenceList = [...state.sequenceList]
  let currentIndex = state.currentIndex
  let pIndex = _resetIndex(playList, song)
  playList.splice(pIndex, 1)
  let sIndex = _resetIndex(sequenceList, song)

  sequenceList.splice(sIndex, 1)
  if (currentIndex > pIndex || currentIndex === playList.length) {
    currentIndex--
  }

  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  if (!playList.length) {
    commit(types.SET_PLAYING_STATE, false)
  }
}

export const deleteAllSong = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
}

export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const deletePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, deletePlay(song))
}

export const deleteAllPlayHistory = function ({commit}) {
  commit(types.SET_PLAY_HISTORY, deleteAllPlay())
}

export const saveFavouriteList = function ({commit}, song) {
  commit(types.SET_FAVOURITE_LIST, saveFavourite(song))
}

// 清空之后要注意清空Songlist
export const deleteFavouriteList = function ({commit}, song) {
  commit(types.SET_FAVOURITE_LIST, deleteFavourite(song))
}

// 清空之后要注意清空Songlist
export const deleteAllFavouriteList = function ({commit}) {
  commit(types.SET_FAVOURITE_LIST, deleteAllFavourite())
}
