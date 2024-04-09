import h from './customDiff/h'
import createElm from './customDiff/createElm'
import patch from './customDiff/patch'
import _ from 'lodash'

// let vnode1 = h('div', { key: 1 }, '你好1-1')
// let vnode1_1 = h('div', { key: 1 }, [
//   h('div', {}, 'hello'),
//   h('div', {}, 'world')
// ])
// let vnode2 = h('div', {}, [
//   h('div', {}, 'hello'),
//   h('div', {}, 'world')
// ])
// let vnode3 = h('div', {}, h('div', {}, '单个子节点'))

// console.log('vnode1', vnode1)
// console.log('vnode2', vnode2)
// console.log('vnode3', vnode3)

// let domNode1 = createElm(vnode1)
// let domNode2 = createElm(vnode2)
// let domNode3 = createElm(vnode3)

// console.dir(domNode1)
// console.dir(domNode2)
// console.dir(domNode3)

const btn = document.getElementById('btn')

let arr = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
  h('p', { key: 'H' }, 'H'),
]

setTimeout(() => {
  const container = document.getElementById('container')
  let vnode = h('div', { key: 'father', idName: 'container' }, arr)
  patch(container, vnode)
}, 1000)

btn.onclick = () => {
  const a = document.getElementById('container')
  let newVnode = h('div', { key: 'father', idName: 'container' }, getRandomArr(arr))
  patch(a, newVnode)
}

function getRandomArr(arr) {
  let len = arr.length
  let randomArr = []
  let randomLen = _.random(1, len)
  for (let i = 0; i < randomLen; i++) {
    let randomIndex = _.random(0, len - 1)
    randomArr.push(arr[randomIndex])
  }
  return randomArr
}

