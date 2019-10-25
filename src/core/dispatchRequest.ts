import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 发送请求前检查一下配置的 cancelToken 是否已经使用过了，如果已经被用过则不用发送请求，直接抛异常。
  throwIfCancellationRequested(config)
  // 先处理一下URL
  processConfig(config)
  // 再执行http请求
  return xhr(config).then((res) => {
    // 对data进行处理
    return transformResponseData(res)
  }, err => {
    if (err && err.response) {
      err.response = transformResponseData(err.response)
    }
    return Promise.reject(err)
  })
}

function processConfig (config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!) // 最后统一处理一下头部信息
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  // 处理一下数据
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}

export function transformURL(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  // 这里告诉编译器，这个URL是肯定存在的
  return buildURL(url!, params, paramsSerializer)
}
