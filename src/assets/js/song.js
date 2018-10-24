// 这个guid还会改变，失效了的时候去http://ustbhuangyi.com/music/#查
import { getLyric } from '@/api/song.js'
import { getMusic } from '@/api/singer.js'
import { ERR_OK } from '@/api/config'
import { Base64 } from 'js-base64'

const GUID = 17025664
export class Song {
  constructor ({ id, mid, singer, name, album, duration, image, url }) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  getLyric () {
    // 如果歌词已经存在，就直接返回一个成功的promise
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    // 如果歌词不存在返回一个完整的promise
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then(res => {
        try {
          if (res.retcode === ERR_OK) {
            // 获取的歌词是base64加密的所以需要解码一下
            this.lyric = Base64.decode(res.lyric)
            resolve(this.lyric)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}

// 工厂模式
export function createSong (musicData, songvkey) {
  const _Song = new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: _normalizeSingerName(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${
      musicData.albummid
    }.jpg?max_age=2592000`,
    url: `http://dl.stream.qqmusic.qq.com/C400${
      musicData.songmid
    }.m4a?guid=${GUID}&vkey=${songvkey}&uin=0&fromtag=38`
    // http://dl.stream.qqmusic.qq.com/C400001Qu4I30eVFYb.m4a?guid=9578987426&vkey=DF946715E91DBD139C4C1309BF0A157FCFF5C94ACF1A8496366B7E701506037D0109004DD60B06E00692DD0B733595B013B8483D632F7536&uin=0&fromtag=66
  })

  return _Song
}

export function _getMusic (songmid, guid = GUID) {
  return getMusic(songmid, guid)
}

// 处理none和多个歌手名的情况
function _normalizeSingerName (singer) {
  let ret = []
  if (!singer) {
    return 'none'
  }
  singer.forEach(element => {
    ret.push(element.name)
  })
  return ret.join('/')
}
