import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import { isFormData } from '../helpers/utils'
import cookie from '../helpers/cookie'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    // 配置参数获取
    const {url, method, data=null, headers={}, responseType, timeout,
      cancelToken, withCredentials, xsrfCookieName, xsrfHeaderName,
      onDownloadProgress, onUploadProgress, auth, validateStatus} = config

    // 创建一个 request 实例
    const request = new XMLHttpRequest()

    // 执行 request.open 方法初始化
    request.open(method!.toUpperCase(), url!, true)

    // 执行 configureRequest 配置 request 对象
    configureRequest()

    // 执行 addEvents 给 request 添加事件处理函数
    addEvents()

    // 执行 processHeaders 处理请求 headers
    processHeaders()

    // 执行 processCancel 处理请求取消逻辑
    processCancel()

    // 执行 request.send 方法发送请求
    request.send(data)

    function configureRequest(): void {
      // 判断用户是否设置了responseType属性
      if (responseType) {
        request.responseType = responseType
      }

      // 判断用户是否设置了超时属性
      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    function addEvents(): void {
      // 监听网络请求状态
      request.onreadystatechange = function handleLoad () {
        // 存有 XMLHttpRequest 的状态。从 0 到 4 发生变化。
        // 0: 请求未初始化
        // 1: 服务器连接已建立
        // 2: 请求已接收
        // 3: 请求处理中
        // 4: 请求已完成，且响应已就绪
        if (request.readyState !== 4) {
          return
        }

        // 当出现网络错误或者超时错误的时候，该值都为 0
        if (request.status === 0) {
          return
        }

        // 获取到头信息
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        // 获取数据，如果是文本就从response获取，否则从responseType中获取
        const responseData = responseType && responseType !== 'text' ? request.response : request.responseText
        // response
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }
        // 返回处理过的response
        handleResponse(response)
      }

      // 网络错误
      request.onerror = function handleError() {
        // 网络错误是没有response的，所以就不传了
        reject(createError('Network Error', config, null, request))
      }

      // 超时错误
      request.ontimeout = function handleTimeout() {
        // 超时也是没有response的
        reject(createError(
          `Timeout of ${timeout} ms exceeded`,
          config,
          'ECONNABORTED', // 表示被终止的请求
          request
        ))
      }

      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    function processHeaders(): void {
      // 如果请求的数据是 FormData 类型，我们应该主动删除请求 headers 中的 Content-Type 字段，
      // 让浏览器自动根据请求数据设置 Content-Type。
      // 比如当我们通过 FormData 上传文件的时候，浏览器会把请求 headers 中的 Content-Type 设置为 multipart/form-data。
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      // 如果开启了跨域cookie支持，或者同源带有cookie名称
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName){
        // 获取当前站点的cookie
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue) {
          headers[xsrfHeaderName!] = xsrfValue
        }
      }

      // 如果用穿度账号密码信息
      if (auth) {
        // 对账号密码进行base64加密
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      // 设置请求头信息
      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          // 数据为空且头部属性是content-type的时候，直接删除数据类型定义
          delete headers[name]
        } else {
          // 其他情况下，直接设置头部信息
          request.setRequestHeader(name, headers[name])
        }
      })
    }

    function processCancel(): void {
      // 如果有值，就进行处理
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          // 取消请求
          request.abort()
          // 返回取消说明
          reject(reason)
        }).catch((err)=>{
          console.log(err)
        })
      }0,
    }

    // 处理response的状态码
    function handleResponse(response: AxiosResponse): void {
      // 状态码校验
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
