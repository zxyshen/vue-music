import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 100

const FAVOURITE_KEY = '__favourite_'
const FAVOURITE_MAX_LENGTH = 200

// 保证每次插入都在数组的最前面
function insertArray (arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  // 第一条数据
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 删除数据
function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// FAVOURITE
export function saveFavourite (song) {
  let songs = storage.get(FAVOURITE_KEY, [])
  insertArray(songs, song, item => song.id === item.id, FAVOURITE_MAX_LENGTH)
  storage.set(FAVOURITE_KEY, songs)
  return songs
}

export function deleteFavourite (song) {
  let songs = storage.get(FAVOURITE_KEY, [])
  deleteFromArray(songs, item => song.id === item.id)
  storage.set(FAVOURITE_KEY, songs)
  return songs
}

export function deleteAllFavourite () {
  storage.set(FAVOURITE_KEY, [])
}

export function loadFavourite () {
  let songs = storage.get(FAVOURITE_KEY, [])
  return songs
}

// SEARCH_HISTORY
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}

export function saveSearchHistory (query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, item => item === query, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function deleteSearchHistory (query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, item => item === query)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearchHistory () {
  storage.remove(SEARCH_KEY)
  return []
}

// PLAY_HISTORY
export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function deletePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  deleteFromArray(songs, item => song.id === item.id)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function deleteAllPlay () {
  storage.set(PLAY_KEY, [])
}

export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}