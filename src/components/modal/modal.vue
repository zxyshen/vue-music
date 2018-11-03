<template>
  <div class="modal-wrapper"
      @click="_onClose"
       v-show="showFlag">
    <div class="modal-box">
      <div class="modal-controller">
        <h1 class="title">{{title}}</h1>
      </div>
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showFlag: true
    }
  },
  methods: {
    show () {
      this.showFlag = true
    },
    close () {
      this.showFlag = false
    },
    _onClose () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/stylus/variable';
@import '~@/assets/stylus/mixin';

.modal-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;

  .modal-box {
    width: 300px;
    height: 300px;

    .modal-content {
      display: flex;
      height: 100%;
      justify-content: center;
      align-items: center;
    }

    .modal-controller {
      display: flex;

      .title {
        text-align: center;
        // text-indent: $font-size-large-x;
        font-size: $font-size-large-x;
        color: $color-text-ll;
        flex: 1;
        no-wrap();
      }

      .close-btn {
        .icon-close {
          font-size: $font-size-large-x;
          color: $color-text;
        }
      }
    }
  }
}
</style>
