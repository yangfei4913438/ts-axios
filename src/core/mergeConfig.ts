import { AxiosRequestConfig } from '../types'
import { deepMerge, isPlainObject } from '../helpers/utils'

const strats = Object.create(null)

// 默认合并
function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}
// 忽略默认值
function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}

function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    // 深拷贝
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else {
    return val1
  }
}

const stratKeysFromVal2 = ['url', 'params', 'data']
// url, 请求参数和 数据部分的合并方法就是直接忽略默认值
stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

const stratKeysDeepMerge = ['headers', 'auth']
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

export default function mergeConfig(config1: AxiosRequestConfig, config2?: AxiosRequestConfig): AxiosRequestConfig {
  // config2 可能为空，所以为空的时候，赋值一个空对象
  if (!config2) {
    config2 = {}
  }
  // 创建一个空对象
  const config = Object.create(null)

  for (let key in config2) {
    mergeField(key)
  }

  for (let key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    // 根据属性，得到相应的合并方法，没有就使用默认的合并方法
    const strat = strats[key] || defaultStrat
    // 使用合并方法对两个配置进行合并。
    config[key] = strat(config1[key], config2![key])
  }

  return config
}
