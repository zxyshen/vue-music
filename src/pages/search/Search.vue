<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox"
                  @query="_onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper"
         v-show="!query"
         ref="shortcutWrapper">
      <scroll class="shortcut"
              :data="shortcut"
              ref="shortcut">
        <!--
                  这里面hot-key和search-history都是异步获取的，单独传哪一个给
                  scroll都不合适
                  解决办法：利用computed把这两个concat起来
            -->
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="_onClickAddQuery(item.k)"
                  class="item"
                  v-for="(item, index) in hotKey"
                  :key="index">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history"
               v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear"
                    @click="_onShowDeleteAllSearchHistoryConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @select="_onClickAddQuery"
                         @delete="_onDeleteOneSearchHistory"
                         :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result"
         ref="searchResult"
         v-show="query">
      <suggest @select="_onSaveSearchHistory"
               :query="query"
               ref="suggest"
               @beforeScroll="_onBlurInput"></suggest>
    </div>
    <confirm ref="confirm"
             @confirm="_onDeleteAllSearchHistory"
             text="是否清空所有搜索历史?"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from '@/components/search-box/search-box'
import Suggest from '@/components/suggest/suggest'
import SearchList from '@/components/search-list/search-list'
import Confirm from '@/components/confirm/confirm'
import Scroll from '@/components/scroll/scroll'
import { refreshListHeightMixin } from '@/assets/js/mixin.js'
import { getHotKey } from '@/api/search'
import { ERR_OK } from '@/api/config'
import { mapActions, mapGetters } from 'vuex'
export default {
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  mixins: [refreshListHeightMixin],
  data () {
    return {
      hotKey: [],
      query: ''
    }
  },
  computed: {
    ...mapGetters(['searchHistory']),
    shortcut () {
      return this.hotKey.concat(this.searchHistory)
    }
  },
  watch: {
    query (q) {
      if (!q) {
        setTimeout(() => {
          // 页面突然不能滚动了，不知道为什么就刷新一下...
          this.$refs.shortcut._refresh()
        }, 20)
      }
    }
  },
  created () {
    this._getHotKey()
  },
  methods: {
    ...mapActions(['saveSearch', 'deleteSearch', 'clearSearch']),
    _onShowDeleteAllSearchHistoryConfirm () {
      this.$refs.confirm.show()
    },
    // 当mini播放器出现时(其实也就是playList出现)，改变scroll box的bottom。
    // 然后刷新scroll，重新获取高度
    _refreshListHeight (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut._refresh()
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest._refresh()
    },
    _onDeleteAllSearchHistory () {
      this.clearSearch()
    },
    // 监听search-list里派发的删除事件
    _onDeleteOneSearchHistory (query) {
      this.deleteSearch(query)
    },
    // 保存suggest传过来的搜索历史
    _onSaveSearchHistory () {
      this.saveSearch(this.query)
    },
    // 滚动suggest时让input失去焦点
    _onBlurInput () {
      this.$refs.searchBox.blur()
    },
    // 监听search-box的input-value然后改变query
    _onQueryChange (query) {
      this.query = query
    },
    // 点击热门搜索或者搜索历史，让k传到search-box里做input-value
    _onClickAddQuery (k) {
      this.$refs.searchBox._setQuery(k)
    },
    _getHotKey () {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10)
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.search {
  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 10px 14px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
          }

          .clear {
            extend-click();

            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>
