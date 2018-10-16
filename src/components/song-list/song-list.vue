<template>
  <div class="song-list">
    <ul v-show="flag">
      <li @click="_onSelectItem(item,index)"
          v-for="(item, index) in songs"
          :key="index"
          class="item">
        <div class="content">
          <h2 class="name">{{item.name}}</h2>
          <p class="desc">{{ item | normalize }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      flag: false
    }
  },
  props: {
    songs: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    normalize (song) {
      return `${song.singer} - ${song.album}`
    }
  },
  methods: {
    _onSelectItem (item, index) {
      this.$emit('select', item, index)
    }
  },
  watch: {
    songs (v) {
      if (v.length > 2) { this.flag = true }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.song-list {
  .item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 64px;
    font-size: $font-size-medium;

    .content {
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        no-wrap();
        color: $color-text;
      }

      .desc {
        no-wrap();
        margin-top: 4px;
        color: $color-text-d;
      }
    }
  }
}
</style>
