import * as types from './mutation-types'

const mutations = {
  // 注意所有引用类型的state，如果传进来的值(假设为list)也是一个引用类型
  // 那么此时的state就绑定了list的地址
  // 而vuex的说明是不允许mutate以外的任何地方修改state
  // 这下就会报 Do not mutate vuex store state outside mutation handlers. 错误
  // 原因是此时的state是浅克隆，外部如果直接修改list，也就直接修改了state
  // 这就违背了vuex的原则
  // 解决办法：
  //      1.state.list = Object.assign([], list)
  //      2.state.list = JSON.parse(JSON.stringify(list))
  // 比较推荐方法2，方法1的话如果传进来的是数组，那么assign后是一个类数组，
  // 类数组没有length属性
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
    state.playList = JSON.parse(JSON.stringify(list))
  },
  [types.SET_SEQUENCE_LIST] (state, list) {
    state.sequenceList = JSON.parse(JSON.stringify(list))
  },
  [types.SET_PLAY_MODE] (state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX] (state, index) {
    state.currentIndex = index
  }
}

export default mutations