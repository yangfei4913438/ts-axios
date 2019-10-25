import { ResolvedFn, RejectedFn } from '../types'

// 泛型接口
interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn // 错误处理选项可以不使用的，所以是可选属性。
}

// 泛型类，接收不同的参数
export default class InterceptorManager<T> {
  // 私有属性用于存储拦截器，null是删除拦截器的时候，进行的填充。
  private interceptors: Array<Interceptor<T> | null>

  // 构造函数中，进行初始化
  constructor() {
    this.interceptors = []
  }

  // 函数实现
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    // 数组下标作为ID
    return this.interceptors.length - 1
  }

  // 用于遍历拦截器，参数是一个函数，这个函数的参数的拦截器
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      // 如果拦截器不为空，那么就执行这个函数。
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  eject(id: number): void {
    if (this.interceptors[id]) {
      // 不能删除，否则ID的值就会乱掉了。设置为空就行了。
      this.interceptors[id] = null
    }
  }
}
