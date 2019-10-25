import { AxiosTransformer } from '../types'

export default function transform(data: any, headers: any, fns?: AxiosTransformer | AxiosTransformer[]): any {
  if (!fns) {
    // 如果转换函数为空，那么就不处理，直接返回
    return data
  }
  // 判断是否为数组，不是数组，就转换成数组
  if (!Array.isArray(fns)) {
    fns = [fns]
  }
  // 遍历转换
  fns.forEach(fn => {
    data = fn(data, headers)
  })
  // 返回最终数据
  return data
}
