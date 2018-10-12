import Vue from 'vue'
import Router from 'vue-router'
import Rank from '@/pages/rank/Rank'
import Singer from '@/pages/singer/Singer'
import Search from '@/pages/search/Search'
import Recommend from '@/pages/recommend/Recommend'
import SingerDetail from '@/pages/singer-detail/SingerDetail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      // 转发到recommend
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      name: 'Recommend',
      component: Recommend
    },
    {
      path: '/singer',
      name: 'Singer',
      component: Singer,
      children: [
        {
          // singer/:id
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      name: 'Rank',
      component: Rank
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    }
  ]
})
