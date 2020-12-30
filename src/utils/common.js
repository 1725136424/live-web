// 生成UUID

export const uuid = function () {
  let s = []
  let hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}

export class CookieUtil {
  static cookie (name) {
    let cookieArray = document.cookie.split('; ') // 得到分割的cookie名值对

    for (let i = 0; i < cookieArray.length; i++) {
      let arr = cookieArray[i].split('=') // 将名和值分开

      if (arr[0] === name) return unescape(arr[1]) // 如果是指定的cookie，则返回它的值
    }

    return ''
  }

  /*  static delCookie (name) {
    document.cookie = name + '=;expires=' + (new Date(0)).toGMTString()
  } */

  static getCookie (objName) {
    let arrStr = document.cookie.split('; ')

    for (let i = 0; i < arrStr.length; i++) {
      let temp = arrStr[i].split('=')

      if (temp[0] === objName) return unescape(temp[1])
    }
  }

  static addCookie (objName, objValue, objHours) { // 添加cookie
    let str = objName + '=' + escape(objValue)

    if (objHours > 0) { // 为时不设定过期时间，浏览器关闭时cookie自动消失
      let date = new Date()

      let ms = objHours * 3600 * 1000

      date.setTime(date.getTime() + ms)

      str += '; expires=' + date.toGMTString()
    }

    document.cookie = str
  }

  static SetCookie (name, value) {
    let Days = 30 // 此 cookie 将被保存 30 天

    let exp = new Date() // new Date("December 31, 9998");

    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)

    document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString()
  }

  /* static getCookie (name) {
    let arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'))

    if (arr != null) return unescape(arr[2]); return null
  } */

  static delCookie (name) {
    let exp = new Date()
    exp.setTime(exp.getTime() - 1)
    let cval = CookieUtil.getCookie(name)
    if (cval != null) {
      document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString()
    }
  }
}
