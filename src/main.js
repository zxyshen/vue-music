import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

import '@/assets/stylus/index.styl'

Vue.config.productionTip = false
fastclick.attach(document.body)
Vue.use(VueLazyLoad, {
  loading: require('@/assets/image/Rolling-1s-60px.svg')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
  // == components : {App}, template : "<App/>"
})
