/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * WebSocket客户端
 *
 * 使用说明：
 * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
 * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
 */
export function getWebSocket(http, role, id) {
  /**
   * WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
   */
  var webSocket = new WebSocket(`ws://${http}/socket/${role}/${id}`)// 建立与服务端的连接
  /**
   * 当服务端打开连接
   */
  webSocket.onopen = function(event) {
    console.log('WebSocket打开连接')
  }

  /**
   * 当服务端发来消息：1.广播消息 2.更新在线人数
   */
  webSocket.onmessage = function(event) {
    console.log(event)
    console.log('WebSocket收到消息：%c' + event.data, 'color:green')
    // 获取服务端消息
    var message = JSON.parse(event.data) || {}
    console.log(message)//
  }

  /**
   * 关闭连接
   */
  webSocket.onclose = function(event) {
    console.log('WebSocket关闭连接')
  }

  /**
   * 通信失败
   */
  webSocket.onerror = function(event) {
    console.log('WebSocket发生异常')
  }
  return webSocket
}
export function getUrl(obj) {
  let str = ''
  let length = 0
  Object.keys(obj).forEach(function(key) {
    length++
  })
  let count = 0
  Object.keys(obj).forEach(function(key) {
    if (count < length - 1) {
      str += key + '=' + obj[key] + '&'
    } else {
      str += key + '=' + obj[key]
    }
    count++
  })
  return str
}

export function contain(arr, item) {
  if (arr instanceof Array) {
    return arr.indexOf(item)
  }
  return false
}
