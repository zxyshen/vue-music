import { mapGetters } from 'vuex'

export const refreshListHeightMixin = {
  computed: {
    ...mapGetters(['playList'])
  },
  mounted () {
    this._refreshListHeight(this.playList)
  },
  activated () {
    this._refreshListHeight(this.playList)
  },
  watch: {
    playList (newVal) {
      this._refreshListHeight(newVal)
    }
  },
  methods: {
    _refreshListHeight () {
      throw new Error('component must implement _refreshListHeight method')
    }
  }
}
