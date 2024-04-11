import { create } from "lodash"
import {
  isVnode,
  emptyNodeAt,
  sameVnode,
  isUndef,
  isDef
} from "./utils"

// 创建真实dom
function createElm(vnode) {
  let domNode = document.createElement(vnode.sel)
  if (vnode.data && vnode.data.idName) {
    domNode.setAttribute('id', vnode.data.idName)
  }

  if (vnode.children && vnode.children.length > 0) {
    vnode.children.forEach((child) => {
      let childDom = createElm(child)
      domNode.appendChild(childDom)
    })
  } else {
    domNode.textContent = vnode.text
  }

  vnode.elm = domNode

  return domNode
}

// 添加Vnodes
function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
  // i++:先引用,后增加; ++i:先增加,后引用
  // 但是在for循环的i改变效果是放在循环体之后执行的
  // 所以for循环中 ++i和i++是相同的
  // 在Java 中i++语句是需要一个临时变量，存储自增前的值，而 ++i 是不需要的
  // 所以循环次数很大的情况下, ++i能提升效率
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (ch != null) {
      const elm = createElm(ch)
      parentElm.insertBefore(elm, before)
    }
  }
}

function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (ch != null) {
      parentElm.removeChild(ch.elm)
    }
  }
}

// 创建旧节点的key到index的映射
function createKeyToOldIdx(children, beginIdx, endIdx) {
  const map = {}
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}

function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]

  let newStartIdx = 0
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]

  let oldKeyToIdx
  let idxInOld
  let elmToMove
  let before

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx]
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx]
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // console.log('1->旧头新头相同');
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // console.log('2->旧尾新尾相同');
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // console.log('3->旧头新尾相同');
      patchVnode(oldStartVnode, newEndVnode)
      // 真实节点移动到当前旧尾的后面
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // console.log('4->旧尾新头相同');
      patchVnode(oldEndVnode, newStartVnode)
      // 真实节点移动到当前旧头的前面
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      // console.log('5->复杂情况');
      if (isUndef(oldKeyToIdx)) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      }

      idxInOld = oldKeyToIdx[newStartVnode.key]

      if (isUndef(idxInOld)) {
        // 新节点的头元素不在旧节点剩余元素时, 则操作真实dom,插入新节点头元素到真实dom的头元素前面
        parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm)
      } else {
        // 如果存在,则移动旧节点的真实dom到当前旧头的前面
        elmToMove = oldCh[idxInOld]
        patchVnode(elmToMove, newStartVnode)
        // 并将当前旧节点上的idxInOld位置的元素置空
        oldCh[idxInOld] = undefined
        parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm)
      }
      // 因为此时是对比的新节点的头
      // 所以要将新节点的头部右移动
      newStartVnode = newCh[++newStartIdx]
    }
  }

  // 循环完毕后,还有删除和新增的情况
  // console.table({
  //   old: {
  //     start: oldStartIdx,
  //     end: oldEndIdx
  //   },
  //   new: {
  //     start: newStartIdx,
  //     end: newEndIdx
  //   }
  // })

  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      // 新增

      // 如果newCh剩余的元素后面是null,则意味着直接插入到末尾
      // 若果不为null, 则插入到该元素前面
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm
      // console.log('6->新增剩余');
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
    } else {
      // 删除
      // console.log('7->删除多余');
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }

}

// 挂载dom
function patchVnode(oldVnode, newVnode) {
  // 两节点完全相同 直接返回
  if (oldVnode === newVnode) return

  let elm = newVnode.elm = oldVnode.elm
  let oldCh = oldVnode.children
  let newCh = newVnode.children

  if (isUndef(newVnode.text)) {
    if (isDef(oldCh) && isDef(newCh)) {
      // 新旧节点的都有children属性,且新旧子节点不相同 执行双端指针算法比对
      if (oldCh !== newCh) {
        updateChildren(elm, oldCh, newCh)
      }
    } else if (isDef(newCh)) {
      // 如果旧节点有text属性, 清空text属性
      if (isDef(oldVnode.text)) elm.textContent = ''
      // 旧节点没有子节点 新节点有子节点 新增子节点
      addVnodes(elm, null, newCh, 0, newCh.length - 1)
    } else if (isDef(oldCh)) {
      // 旧节点有子节点 新节点text为undifined 删除子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      // 旧节点有text属性 新节点text为undifined 清空text属性
      elm.textContent = ''
    }
  } else if (oldVnode.text !== newVnode.text) {
    if (isDef(oldCh)) {
      // 如果旧节点有子节点 则先清空子节点
      // 这里一定先执行清空子元素的操作
      // 因为真实框架中,销毁元素的时候,还需要触发一系列的销毁的hook
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    }
    // 新旧节点的text属性不同 直接更新text属性
    elm.textContent = newVnode.text
  }

  return newVnode
}

export default function (oldVnode, newVnode) {
  // oldVnode不是虚拟节点 则把oldVnode变成虚拟节点
  if (!isVnode(oldVnode)) {
    oldVnode = emptyNodeAt(oldVnode)
  }

  // 判断是否是同一个节点
  if (sameVnode(oldVnode, newVnode)) {
    // 节点相同
    let backVnode = patchVnode(oldVnode, newVnode)
    return backVnode
  } else {
    // 注意 此处一定确定当前oldVnode是存在的真实dom节点的虚拟节点
    // 即, 传入的oldVnode 要么是一个真实节点,要么是真实节点转换的虚拟节点
    if (!oldVnode.elm) {
      throw new Error('旧节点没有elm属性')
    }

    // 节点不同 直接替换
    let oldElm = oldVnode.elm // 当前旧真实dom
    let parentElm = oldVnode.elm.parentNode // 当前旧真实dom的父节点
    let newElm = createElm(newVnode) // 生成新真实dom

    parentElm.insertBefore(newElm, oldElm) // 新真实dom插入到旧真实dom前
    parentElm.removeChild(oldElm) // 删除旧真实dom

    return newVnode
  }
}
