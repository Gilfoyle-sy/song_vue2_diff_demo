/**
 * vnode的作用就是把一个真实的dom节点用js对象的形式表达出来
 */

/**
 *
 * @param {选择器} sel
 * @param {属性} data
 * @param {子元素} children
 * @param {文本} text
 * @param {真实dom节点} elm
 */
export default function (sel, data, children, text, elm) {
  let key = data === undefined ? undefined : data.key
  return {
    sel,
    data,
    children,
    text,
    elm,
    key
  }
}
