import vnode from './vnode'
import createElm from './createElm'

function isVnode(vnode) {
  return vnode.sel !== undefined
}

function emptyNodeAt(elm) {
  return vnode(elm.tagName.toLowerCase(), {}, [], undefined, elm)
}

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
}

// 生成旧节点指定头到尾的key的map对象
function createKeyToOldIdx(children, beginIdx, endIdx) {
  const map = {}
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i]?.key
    if (key !== undefined) {
      map[key] = i
    }
  }
  return map
}

function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (ch != null) {
      parentElm.insertBefore(createElm(ch), before)
    }
  }

}

function removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx) {
  for (let i = oldStartIdx; i <= oldEndIdx; i++) {
    if (oldCh[i]) {
      parent.removeChild(oldCh[i].elm);
    }
  }
}

/**
 * 双指针双端算法
 */
function updateChildren(parentElm, oldCh, newCh) {
  // 旧节点
  let oldStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]

  // 新节点
  let newStartIdx = 0
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]


  let oldKeyToIdx // 旧节点的key到index的map对象
  let idxInOld // 新节点在旧节点中的位置
  let elmToMove // 要移动的节点
  let before // 插入位置

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (!newStartVnode) {
      newStartVnode = newCh[++newStartIdx];
    } else if (!newEndVnode) {
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      console.log(1)
      // 新旧头相同
      patchVnode(oldStartVnode, newStartVnode)
      // 头指针右移动
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      console.log(2)
      // 新旧尾相同
      patchVnode(oldEndVnode, newEndVnode)
      // 尾指针做左移动
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      console.log(3)
      // 旧头新尾相同
      patchVnode(oldStartVnode, newEndVnode)
      // 将真实dom的当前旧头指针节点插入到旧头尾指针处
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
      // 旧头指针右移,新头指针左移
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      console.log(4)
      // 新头旧尾相同
      patchVnode(oldEndVnode, newStartVnode)
      // 将真实dom的当前旧尾指针节点插入到旧头尾指针处
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm.nextSibling)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      console.log(5)
      // 头头,尾尾,头尾,尾头皆不相同
      if (!oldKeyToIdx) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      }
      idxInOld = oldKeyToIdx[newStartVnode.key]
      if (!idxInOld) {
        // key不存在,则新增
      } else {
        // key存在
        elmToMove = oldCh[idxInOld]
        if (elmToMove.sel !== newStartVnode.sel) {
          // key相同但是 选择器不同
          parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm)
        } else {
          patchVnode(elmToMove, newStartVnode)
          oldCh[idxInOld] = undefined // 将虚拟节点中的移动下标的节点置空
          parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm)
        }
        // key存在,则移动当前idxInOld到旧节点的头部
      }
      // 新节点的头指针右移动
      newStartVnode = newCh[++newStartIdx]
    }
  }

  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      console.log(6)
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm
      // 旧节点已经遍历完毕,新节点还有剩余 则添加剩余节点
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
    } else {
      console.log(7)
      // 新节点已经遍历完毕,旧节点还有剩余 则删除剩余节点
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }
}

/**
 * 挂载dom
 */
function patchVnode(oldVnode, newVnode) {
  if (oldVnode === newVnode) return

  if (
    newVnode.text !== undefined &&
    (newVnode.children === undefined || newVnode.children.length === 0)
  ) {

    // newVnode 有 text 属性
    if (newVnode.text !== oldVnode.text) {

      // 判断 newVnode 与 oldVnode 的 text 属性是否相同
      // 如果newVnode中的text和oldVnode的text不同，那么直接让新text写入旧elm中
      // 如果oldVnode中是children，也会立即消失
      oldVnode.elm.innerText = newVnode.text
    }
  } else {
    // newVnode 没有text属性 有children属性
    if (oldVnode.children !== undefined && oldVnode.children.length > 0) {
      // 新旧节点都有children
      updateChildren(oldVnode.elm, oldVnode.children, newVnode.children)
    } else {
      // oldVnode没有children属性 说明有text  newVnode有children属性
      // 清空oldVnode的内容
      oldVnode.elm.innerHTML = ''
      // 遍历新的vnode的子节点，创建DOM并挂在
      for (let ch of newVnode.children) {
        let chDOM = createElement(ch)
        oldVnode.elm.appendChild(chDOM)
      }
    }
  }
}

export default function (oldVnode, newVnode) {
  if (!isVnode(oldVnode)) {
    oldVnode = emptyNodeAt(oldVnode)
  }

  if (sameVnode(oldVnode, newVnode)) {
    patchVnode(oldVnode, newVnode)
  } else {
    // 非同一个节点,直接覆盖
    let newVnodeElm = createElm(newVnode)
    let oldVnodeElm = oldVnode.elm

    if (newVnodeElm) {
      oldVnodeElm.parentNode.insertBefore(newVnodeElm, oldVnodeElm)
      // 删除旧节点
      oldVnodeElm.parentNode.removeChild(oldVnodeElm)
    }
  }
}
