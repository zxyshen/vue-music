import storage from 'good-storage'

const SEARCH_KEY = '_search_'
const SEARCH_MAX_LENGTH = 15

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

export function saveSearchHistory (query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, item => item === query, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
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