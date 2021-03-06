import * as types from './mutation-types'

const mutations = {
  // 注意所有引用类型的state，如果传进来的值(假设为list)也是一个引用类型
  // 那么此时的state就绑定了list的地址
  // 而vuex的说明是不允许mutate以外的任何地方修改state
  // 这下就会报 Do not mutate vuex store state outside mutation handlers. 错误
  // 原因是此时的state是浅克隆，外部如果直接修改list，也就直接修改了state
  // 这就违背了vuex的原则
  // 解决办法：
  //      1.state.list = Object.assign([],list);
  //      (这里解释一下为什么直接Object.assign([],list)就可以了
  //        因为此时list是对象数组，proto已经不需要获取了)
  //        正常情况是Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);

  //      2.state.list = JSON.parse(JSON.stringify(list))
  // 比较推荐方法2，方法1的话如果传进来的是数组，那么assign后是一个类数组，
  // 类数组没有length属性

  // ***修正：推荐方法1，方法2弄过之后，对象的proto属性被弄没了。
  // 至于方法1返回的是一个类数组的问题可以用Array.from解决

  [types.SET_SINGER] (state, singer) {
    state.singer = JSON.parse(JSON.stringify(singer))
  },
  [types.SET_PLAYING_STATE] (state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN] (state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST] (state, list) {
    // 看来JSON.parse(JSON.stringify(list))只能克隆属性，不能克隆proto
    // state.playList = JSON.parse(JSON.stringify(list))
    // 这里的state.playList _proto_ 中已经没有了getLyric
    // console.log(JSON.stringify(list))

    state.playList = Array.from(Object.assign([], list))
  },
  [types.SET_SEQUENCE_LIST] (state, list) {
    state.sequenceList = Array.from(Object.assign([], list))
  },
  [types.SET_PLAY_MODE] (state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX] (state, index) {
    state.currentIndex = index
  },
  [types.SET_SONG_SHEET] (state, sheet) {
    state.songSheet = Object.assign(Object.create(Object.getPrototypeOf(sheet)), sheet)
  },
  [types.SET_TOPLIST] (state, topList) {
    state.topList = Object.assign(Object.create(Object.getPrototypeOf(topList)), topList)
  },
  [types.SET_SEARCH_HISTORY] (state, history) {
    state.searchHistory = Array.from(Object.assign([], history))
  },
  [types.SET_PLAY_HISTORY] (state, history) {
    state.playHistory = Array.from(Object.assign([], history))
  },
  [types.SET_FAVOURITE_LIST] (state, list) {
    state.favouriteList = Array.from(Object.assign([], list))
  }
}

export default mutations
