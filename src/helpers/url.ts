import { isDate, isPlainObject, isURLSearchParams } from './utils'

function encode (val: string): string {
  return encodeURIComponent(val)
  .replace(/%40/g, '@')
  .replace(/%3A/gi, ':')
  .replace(/%24/g, '$')
  .replace(/%2C/gi, ',')
  .replace(/%20/g, '+')
  .replace(/%5B/gi, '[')
  .replace(/%5D/gi, ']')
}

// url 是 string 类型的
export function buildURL(url: string, params?: any, paramsSerializer?: (params: any) => string): string {
  // 如果不存在参数，那么直接返回url
  if (!params) {
    return url
  }

  let serializedParams
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString()
  } else {
    // 声明一个数组，用于存放URL参数
    const parts: string[] = []
    // 遍历参数
    Object.keys(params).forEach(key => {
      const val = params[key]
      // 无效的值就跳过这次循环，进入下一次。
      if (val === null || val === undefined) {
        // foreach是不会被中断的，只会跳出当前循环，进入下一次循环。
        return
      }
      let values = []
      if (Array.isArray(val)) {
        // 如果值是数组类型，就赋值给变量
        values = val
        // url中的key,数组属性要加上[]
        key += '[]'
      } else {
        // 如果不是数组，就生成数组复制给变量
        values = [val]
      }

      // 遍历数组
      values.forEach(val => {
        if (isDate(val)) {
          val = val.toISOString()
        } else if (isPlainObject(val)) {
          val = JSON.stringify(val)
        }
        parts.push(`${encode(key)}=${encode(val)}`)
      })
    })

    // 数组转换成字符串
    serializedParams = parts.join('&')
  }

  if (serializedParams) {
    // 去掉哈希内容
    const markIndex = url.indexOf('#')
    // 不等于-1表示有哈希内容
    if (markIndex !== -1) {
      // 删掉从0-查询位置的字符
      url = url.slice(0, markIndex)
    }
    // 判断原来有url上有没有？没有就加上？表示从这里开始就是参数部分，有就加上 & 表示追加参数
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}

interface URLOrigin {
  protocol: string
  host: string
}

// 判断解析URL和当前页URL的Origin信息，得出两个URL是否同域
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

// 当前页面的Origin
const currentOrigin = resolveURL(window.location.href)

// 根据url获取Origin信息
function resolveURL(url: string): URLOrigin {
  // 创建DOM对象
  const urlParsingNode = document.createElement('a')
  // 设置超链接属性
  urlParsingNode.setAttribute('href', url)
  // 解析DOM对象获取需要的属性
  const { protocol, host } = urlParsingNode
  // 返回
  return { protocol, host }
}

// 是否为绝对地址
export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}
// URL拼接
export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}
