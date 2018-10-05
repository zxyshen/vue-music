import originJsonp from 'jsonp'

// * Options:
// *  - param 对方网站定义的callback函数名。
// *  - timeout {Number} how long after a timeout error is emitted (`60000`)

export default function jsonp (url, data, options) {
  url += (url.includes('?') ? '&' : '?') + param(data)
  return new Promise((resolve, reject) => {
    originJsonp(url, options, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

function param (data) {
  let url = ''
  for (var key in data) {
    let value = data[key] === undefined ? '' : data[key]
    url += `&${key}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''
}
