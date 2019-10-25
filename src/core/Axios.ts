import { AxiosRequestConfig, AxiosPromise, Method, AxiosResponse, ResolvedFn, RejectedFn } from '../types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './InterceptorManager'
import mergeConfig from './mergeConfig'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

export default class Axios {
  defaults: AxiosRequestConfig
  interceptors: Interceptors
  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      // 请求拦截器
      request: new InterceptorManager<AxiosRequestConfig>(),
      // 响应拦截器
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      // 如果不是字符串，那么应该就是 AxiosRequestConfig 类型
      config = url
    }

    // 合并配置：默认配置，用户配置。 顺序不能错。
    config = mergeConfig(this.defaults, config)
    // 方法强制转换为小写
    config.method = config.method.toLowerCase()

    // 定义链的初始值
    const chain: PromiseChain<any>[] = [{
      resolved: dispatchRequest, // 初始值就是请求
      rejected: undefined
    }]

    // 请求拦截器处理
    this.interceptors.request.forEach(interceptor => {
      // 后添加的先执行，所以使用unshift方法添加到数组的最前面。
      chain.unshift(interceptor)
    })

    // 响应拦截器处理
    this.interceptors.response.forEach(interceptor => {
      // 响应拦截器，先添加的先执行
      chain.push(interceptor)
    })

    // 初始化一个promise, 参数就是请求的配置
    let promise = Promise.resolve(config)

    // 遍历数组
    while (chain.length) {
      // 这里需要类型断言，数组不为空。
      const { resolved, rejected } = chain.shift()! // shift用于把数组的第一个元素从其中删除，并返回第一个元素的值。
      // 每执行完一个promise之后，赋值给promise变量，等待循环执行下一个。
      promise = promise.then(resolved, rejected)
    }

    // 最后返回promise
    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  getUri(config?: AxiosRequestConfig): string {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }

  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
