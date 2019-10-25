// 这里就是一些工具辅助方法。

// 定义一个常量，便于下面函数的简化
const toString = Object.prototype.toString

// 判断一个值是否为日期类型, 返回类型谓词
export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

// // 判断一个值是否为object类型, 返回类型谓词
// export function isObject(val: any): val is Object {
//   return val !== null && typeof val === 'object'
// }

// 判断是否为一个普通对象, 返回类型谓词
export function isPlainObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

// 混合函数，将axios对象和包含axios一些方法的对象，混合到一起
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    // to需要断言为 T & U 类型，否则无法赋值
    // 对象去属性的时候，前面有小括号，就要加上分号
    // 值必须是any类型
    ;(to as T & U)[key] = from[key] as any
  }
  // to需要断言为 T & U 类型
  return to as T & U
}

// 深拷贝
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)

  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        // 判断值是否为一个对象
        if (isPlainObject(val)) {
          // 判断之前是否有重复的属性是一个对象
          if (isPlainObject(result[key])) {
            // 如果有重复的属性，那么就先进行合并
            result[key] = deepMerge(result[key], val)
          } else {
            // 如果没有重复的属性，那么就直接递归赋值
            result[key] = deepMerge(val)
          }
        } else {
          // 普通情况，直接赋值
          result[key] = val
        }
      })
    }
  })

  return result
}

export function isFormData(val: any): val is FormData {
  return typeof val !== 'undefined' && val instanceof FormData
}

export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams
}
