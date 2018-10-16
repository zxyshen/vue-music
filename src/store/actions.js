import * as types from './mutation-types'
import { playMode } from '@/assets/js/config.js'
import { shuffle } from '@/assets/js/util.js'

function _resetIndex (list, song) {
  let index = list.findIndex(item => item.id === song.id)
  return index
}

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

export const randomPlay = function ({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, shuffle(list))
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
