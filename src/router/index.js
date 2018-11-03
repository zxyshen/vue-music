import Vue from 'vue'
import Router from 'vue-router'
import Rank from '@/pages/rank/Rank'
import topList from '@/pages/rank/components/topList'
import Singer from '@/pages/singer/Singer'
import SingerDetail from '@/pages/singer/components/singer-detail'
import Search from '@/pages/search/Search'
import Recommend from '@/pages/recommend/Recommend'
import SongSheet from '@/pages/recommend/components/song-sheet'
import UserCenter from '@/pages/user-center/UserCenter'

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
      component: Recommend,
      children: [
        {
          path: ':id',
          component: SongSheet
        }
      ]
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
      component: Rank,
      children: [
        {
          path: ':id',
          component: topList
        }
      ]
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    },
    {
      path: '/user',
      name: 'User',
      component: UserCenter
    }
  ]
})
