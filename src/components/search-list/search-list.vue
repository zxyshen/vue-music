<template>
  <div class="search-list"
       v-show="searches.length">
    <transition-group name="list" tag="ul">
      <li @click="_onSelectItem(item)"
          class="search-item"
          v-for="item in searches"
          :key="item">
        <span class="text">{{item}}</span>
        <span class="icon"
              @click.stop="_onDeleteItem(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    searches: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 和suggest一样，这个组件只是负责显示列表。至于选择和删除的逻辑
    // 交由外部处理，这样做的目的就是颗粒化解耦，增加可复用性。
    _onSelectItem (item) {
      this.$emit('select', item)
    },
    _onDeleteItem (item) {
      this.$emit('delete', item)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~@/assets/stylus/variable';

.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;
    &.list-enter-active, &.list-leave-active {
      transition: all 0.1s;
    }

    &.list-enter, &.list-leave-to {
      height: 0;
    }

    .text {
      flex: 1;
      color: $color-text-d;
      font-size: $font-size-medium;
    }

    .icon {
      extend-click();

      .icon-delete {
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
  }
}
</style>