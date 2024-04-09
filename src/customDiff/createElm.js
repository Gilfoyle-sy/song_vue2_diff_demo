/**
 * 由虚拟节点生成真实节点
 * 此操作仅生成节点,但还未挂载到dom
 */
export default function createElm(vnode) {

  let domNode = document.createElement(vnode.sel)
  domNode.setAttribute('id', vnode.data.idName || '')

  if (vnode.text !== '' && (vnode.children === undefined || vnode.children.length === 0)) {
    // 有text， 无children时
    domNode.innerText = vnode.text
  } else if (Array.isArray(vnode.children) && vnode.children.length > 0) {
    // 无text， 有children时，递归插入子节点
    vnode.children.forEach((ch) => {
      let chDom = createElm(ch)
      domNode.appendChild(chDom)
    })
  }

  vnode.elm = domNode

  return vnode.elm
}
