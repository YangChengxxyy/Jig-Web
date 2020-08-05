import router from '@/router'
import { Notification } from 'element-ui'
import thisVue from '../main'
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
  const webSocket = new WebSocket(`ws://${http}/socket/${role}/${id}`)// 建立与服务端的连接
  /**
   * 当服务端打开连接
   */
  webSocket.onopen = function(event) {
    console.log('WebSocket打开连接')
  }

  /**
   * 当服务端发来消息
   */
  webSocket.onmessage = function(event) {
    let { data } = event
    if (data.indexOf('this') === -1) {
      data = JSON.parse(data)
      console.log(data)
      const { path, params, content, title } = data
      const r = {
        path: path,
        query: params
      }
      const notification = Notification({
        message: content,
        title: title,
        duration: 0,
        showClose: false,
        position: 'bottom-right',
        onClick: () => {
          router.push(r)
          notification.close()
        }
      })
    } else {
      thisVue.$children[0].$children[0].$children[1].getMessage()
    }
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

