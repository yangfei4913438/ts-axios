import { AxiosRequestConfig, AxiosStatic } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/utils'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

function createInstance(config: AxiosRequestConfig): AxiosStatic {
  // 实例化类型
  const context = new Axios(config)

  // 因为Axios内部有成员函数的调用，所以必须绑定this到实例对象上。
  // 这里的 instance 就是 Axios.prototype.request 方法，后面的bind只是this绑定到另一个实例对象上。
  const instance = Axios.prototype.request.bind(context)

  // 将实例对象，混合进实例里面。
  extend(instance, context)

  // 返回的时候，进行类型断言
  return instance as AxiosStatic
}

const axios = createInstance(defaults)

axios.create = function create(config) {
  return createInstance(mergeConfig(defaults, config))
}
axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

axios.all = function all(promises) {
  return Promise.all(promises)
}

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}

axios.Axios = Axios

export default axios
