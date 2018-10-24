# vue-music

播放器新添功能
1.完全随机播放（完成）
2.song-list组件显示正在播放歌曲的图标（完成）
3.拉歌词调进度（完成）
    思路
        1.监听touchstart事件，标记将要手动滚动onScroll = true，然后让lyric停止播放。
        2.监听touchmove事件，让手动操作滚动时audio停止播放
        2.再监听touchend事件，标记手动滚动结束onScroll = false，如果audio
        正在播放则让lyric seek到currenttime。否则只记录currenttime，让togglePlay
        去seek

        3.然后监听scroll事件，判断是否是手动滚动(为了防止和自动播放歌词的滚动冲突)，
        根据getBoundingClientRect找到离timeline最近的那一条歌词，
        返回index，记录currenttime

4.调节音量 （完成）
