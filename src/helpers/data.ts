import { isPlainObject } from './utils'

export function transformRequest(data: any): any {
  // 如果是一个普通对象就返回一个JSON序列化的JSON字符串
  if (isPlainObject(data)) {
    return JSON.stringify(data)
  }
  // 如果不是一个对象，就直接返回
  return data
}

export function transformResponse(data: any): any {
  // 如果是一个字符串类型，就进行处理
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (e) {
      // 如果出错，证明不是一个JSON字符串，直接返回data即可。
      return data
    }
  }
  // 返回data
  return data
}
