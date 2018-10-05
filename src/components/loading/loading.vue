<template>
  <div class="loading">
    <img src="@/assets/image/Rolling-1s-60px.svg" width="24" height="24">
    <p class="desc">{{desc}}</p>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    desc: {
      type: String,
      default: '正在载入...'
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';

.loading {
  width: 100%;
  text-align: center;
}

.desc {
  line-height: 20px;
  font-size: $font-size-small;
  color: $color-text-l;
}
</style>
