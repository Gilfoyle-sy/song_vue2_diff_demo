import vnode from "./vnode"

// 判断是否是虚拟节点
export function isVnode(node) {
  return node.sel !== undefined
}

// 创建空节点
export function emptyNodeAt(elm) {
  return vnode(elm.tagName.toLowerCase(), {}, [], undefined, elm)
}

// 判断是否是同一个节点
export function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
}

// 未定义
export function isUndef(s) {
  return s === undefined
}

// 定义
export function isDef(s) {
  return s !== undefined
}
