import vnode from './vnode'

/**
 * h函数的作用就是返回一个vnode
 * 常见形式如下
 * h('div', {}, '文字')
 *
 * h('div', {}, [
 *  h('div', {}, 'hello'),
 *  h('div', {}, 'world')
 * ])
 *
 * h('div', {}, h())
 *
 */
export default function (sel, data, c) {
  // 本例子不处理其他参数情况
  if (arguments.length !== 3) throw new Error('params error')

  if (typeof c === 'string' || typeof c === 'number' || typeof c === 'undefined') {
    // 如果是文本形式,直接返回虚拟节点
    return vnode(sel, data, undefined, c, undefined)
  } else if (Array.isArray(c)) {
    // 如果是数组形式 返回数组形式的虚拟节点
    let children = c.map((item) => item)
    return vnode(sel, data, children, undefined, undefined)
  } else if (typeof c === 'object' && c.hasOwnProperty('sel')) {
    // 如果是h() 则意味着是当前单个子节点，放出children数组中
    return vnode(sel, data, [c], undefined, undefined)
  } else {
    throw new Error('param type error')
  }
}
