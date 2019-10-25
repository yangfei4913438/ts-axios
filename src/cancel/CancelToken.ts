import { CancelExecutor, CancelTokenSource, Canceler } from '../types'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    // 临时变量
    let resolvePromise: ResolvePromise

    // 把resolve赋值给临时变量，那么调用整个临时变量，就相当于执行了resolve
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    //
    executor(message => {
      // 有值了就直接返回
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }

  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
