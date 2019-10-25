import { deepMerge, isPlainObject } from './utils'
import { Method } from '../types'

function normalizeHeaderName (headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  // 遍历头部信息
  Object.keys(headers).forEach(name => {
    // 值不相等，且大写一致，才进行处理
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      // 使用我们指定的名称
      headers[normalizedName] = headers[name]
      // 删除用户指定的名称对象
      delete headers[name]
    }
  })
}

export function processHeaders (headers: any, data: any): any {
  // 处理头部属性
  normalizeHeaderName(headers, 'Content-Type')

  // 处理data
  if (isPlainObject(data)) {
    // 如果用户没有指定 Content-Type 属性，那么我们给用户添加上这个属性。
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }

  // 返回
  return headers
}

export function parseHeaders(headers: string): any {
  // 创建一个空对象
  let parsed = Object.create(null)
  // 如果参数为空，则直接返回空对象
  if (!headers) {
    return parsed
  }
  // 使用回车符和换行符进行分割成数组
  headers.split('\r\n').forEach(line => {
    // 通过：进行分割，前面的值是key, 后面的值是value
    // 后面的值也可能带有 : 的，所以是一个解构操作。
    let [key, ...val] = line.split(':')
    // 将key去掉前后的空格，然后转换为小写
    key = key.trim().toLowerCase()
    // 不存在就跳过当前循环
    if (!key) {
      return
    }
    // 将key和value添加到前面创建的空对象中。
    parsed[key] = val.join(':').trim()
  })
  // 返回这个对象
  return parsed
}

export function flattenHeaders(headers: any, method: Method): any {
  // 如果不存在，就直接返回
  if (!headers) {
    return headers
  }

  // 合并配置
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)

  // 定义要删除的属性
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

  // 遍历删除
  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  // 返回处理后的头对象
  return headers
}
