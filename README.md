## 播放器新添功能
   + ### 完全随机播放，保留一次记录。
   + ### 显示正在播放歌曲的图标
   + ### 调节音量 
   + ### 拉歌词调进度
>思路<br/>
  1.监听touchstart事件，标记将要手动滚动onScroll = true，然后让lyric停止播放。<br/>
  2.监听touchmove事件，让手动操作滚动时audio停止播放。<br/>
  2.再监听touchend事件，标记手动滚动结束onScroll = false，如果audio
  正在播放则让lyric seek到currenttime。否则只记录currenttime，让togglePlay去seek。<br/>
  3.然后监听scroll事件，判断是否是手动滚动(为了防止和自动播放歌词的滚动冲突)，根据getBoundingClientRect找到离timeline最近的那一条歌词，返回index，记录currenttime。

## 用户界面优化
> 滑动删除歌曲，全选删除喜欢歌曲等。并且在刚进入时，附送一个提示滑动删除的模层。

## 其它优化
+ ### 添加、删除喜欢歌曲时候tip提示
+ ### 喜欢歌曲时的动画
+ ### 点击搜索结果不设置fullscreen
+ ### ~~换肤~~（不想写了...）
<br/>
<br/>
<br/>


> 结束的比较仓促 如果发现什么问题请联系我修改哦<br/>
**联系方式(QQ)：363902773**