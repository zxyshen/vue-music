<template>
  <div class="search-box"
       ref="searchBox">
    <i class="icon-search"></i>
    <input type="text"
           class="box"
           :placeholder="placeholder"
           v-model="query"
           ref="inp">
    <i @click="_onClickClear"
       class="icon-dismiss"
       v-show="query"></i>
  </div>
</template>

<script>
import { debounce } from '@/assets/js/util'
export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  created () {
    // 为什么这个watch写在这里，不写在watch里？
    // 因为写在watch里就不能用节流函数了
    this.$watch('query', debounce((q) => {
      this.$emit('query', q)
    }, 40))
  },
  watch: {
    query (q) {
      this.$refs.searchBox.style.borderColor = '#fff'
      if (q === '') { this.$refs.searchBox.style.borderColor = '' }
    }
  },
  methods: {
    _onClickClear () {
      this.query = ''
    },
    _setQuery (q) {
      this.query = q
    },
    blur () {
      this.$refs.inp.blur()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~@/assets/stylus/variable';

.search-box {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;
  transition: 0.5s;
  border: 1px solid $color-highlight-background;

  .icon-search {
    font-size: 24px;
    color: $color-background;
  }

  .box {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline: none;

    &::placeholder {
      color: $color-text-d;
    }
  }

  .icon-dismiss {
    font-size: 16px;
    color: $color-background;
  }
}
</style>
