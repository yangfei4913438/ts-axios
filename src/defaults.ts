import { AxiosRequestConfig } from './types'
import { processHeaders } from './helpers/headers'
import { transformRequest, transformResponse } from './helpers/data'

const defaults: AxiosRequestConfig = {
  // 默认方法
  method: 'get',
  // 默认不超时
  timeout: 0,
  // 默认头部信息
  headers: {
    // 所有请求都添加的属性
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },

  xsrfCookieName: 'XSRF-TOKEN',

  xsrfHeaderName: 'X-XSRF-TOKEN',

  transformRequest: [
    function(data: any, headers: any): any {
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],

  transformResponse: [
    function(data: any): any {
      return transformResponse(data)
    }
  ],

  validateStatus(status: number): boolean {
    return status >= 200 && status < 300
  }
}
// 没有数据的方法
const methodsNoData = ['delete', 'get', 'head', 'options']
// 遍历添加默认值到头部
methodsNoData.forEach(method => {
  defaults.headers[method] = {}
})

// 有数据的方法
const methodsWithData = ['post', 'put', 'patch']
// 遍历添加头部属性
methodsWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults
