// 定义axios接收的联合方法类型，支持大写和小写
export type Method = 'get' | 'GET' | 'post' | 'POST' | 'put' | 'PUT'
  | 'patch' | 'PATCH' | 'delete' | 'DELETE' | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'

export interface AxiosRequestConfig {
  url?: string
  method?: Method
  data?: any
  params?: any
  headers?: any
  responseType?: XMLHttpRequestResponseType // 响应数据类型
  timeout?: number // 单位是毫秒
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  cancelToken?: CancelToken
  withCredentials?: boolean
  xsrfCookieName?: string
  xsrfHeaderName?: string
  auth?: AxiosBasicCredentials
  validateStatus?: (status: number) => boolean
  paramsSerializer?: (params: any) => string
  baseURL?: string

  // xhr 对象提供了一个 progress 事件，我们可以监听此事件对数据的下载进度做监控；
  // 另外，xhr.upload 对象也提供了 progress 事件，我们可以基于此对上传进度做监控。
  onDownloadProgress?: (e: ProgressEvent) => void
  onUploadProgress?: (e: ProgressEvent) => void

  [propName:string]: any // 字符串索引签名，返回值是any。 作用就是允许通过key获取属性的值
}

export interface AxiosBasicCredentials {
  username: string
  password: string
}

export interface AxiosTransformer {
  (data: any, headers?: any): any
}

// 实例类型的接口定义
export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  throwIfRequested(): void
}
// 取消方法的接口定义
export interface Canceler {
  (message?: string): void
}
// CancelToken 类构造函数参数的接口定义
export interface CancelExecutor {
  (cancel: Canceler): void
}
export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}
export interface CancelTokenStatic {
  new(executor: CancelExecutor): CancelToken
  source(): CancelTokenSource
}

// 支持泛型，默认为任意类型
export interface AxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

export interface AxiosError extends Error {
  config: AxiosRequestConfig
  code?: string
  request?: any
  response?: AxiosResponse
  isAxiosError: boolean
}

export interface Axios {
  // 默认配置
  defaults: AxiosRequestConfig

  // 拦截器定义
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
  }

  // 默认请求
  request<T=any>(config: AxiosRequestConfig): AxiosPromise<T>

  get<T=any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  delete<T=any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  head<T=any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  options<T=any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  post<T=any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  put<T=any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  patch<T=any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  getUri(config?: AxiosRequestConfig): string
}

export interface AxiosInstance extends Axios {
  <T=any>(config: AxiosRequestConfig): AxiosPromise<T>
  // 函数重载
  <T=any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

export interface AxiosStatic extends AxiosInstance{
  create(config?: AxiosRequestConfig): AxiosInstance
  CancelToken: CancelTokenStatic
  Cancel: CancelStatic
  isCancel: (value: any) => boolean

  all<T>(promises: Array<T | Promise<T>>): Promise<T[]>

  spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R

  Axios: AxiosClassStatic
}

export interface AxiosClassStatic {
  new (config: AxiosRequestConfig): Axios
}

export interface AxiosInterceptorManager<T> {
  // 用户可以调用这个方法添加拦截器，返回这个拦截器的ID
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number
  // 根据ID，删除拦截器
  eject(id: number): void
}

// 发送的类型和接收的类型是不一样的，所以这里要用泛型
export interface ResolvedFn<T=any> {
  // 返回的类型是两种，可以是传入的类型(发送)，也可以是一个Promise(接收)
  (val: T): T | Promise<T>
}

export interface RejectedFn {
  // 错误的类型是任意的
  (error: any): any
}

export interface Cancel {
  message?: string
}

export interface CancelStatic {
  new(message?: string): Cancel
}
