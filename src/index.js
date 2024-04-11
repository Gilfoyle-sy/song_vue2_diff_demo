import h from './customDiff/h'
import patch from './customDiff/patch'
import _ from 'lodash'

let container = document.getElementById('container')
let containerOld = document.getElementById('container-old')
let containerNew = document.getElementById('container-new')
let btnReset = document.getElementById('btnReset')
let btnRandom = document.getElementById('btnRandom')
let btnDelete = document.getElementById('btnDelete')
let btnAppend = document.getElementById('btnAppend')
let vnode
let arr

let example = [
  { key: 'A', value: 'A' },
  { key: 'B', value: 'B' },
  { key: 'C', value: 'C' },
  { key: 'D', value: 'D' },
  { key: 'E', value: 'E' }
]

let defauleArr = [
  { key: 'A', value: 'A' },
  { key: 'B', value: 'B' },
  { key: 'C', value: 'C' },
  { key: 'D', value: 'D' },
  { key: 'E', value: 'E' }
]

setTimeout(() => {
  init()
}, 800)

function init() {
  vnode = patch(container, arrToVnode(example))
}

btnReset.onclick = () => {
  example = _.cloneDeep(defauleArr)
  vnode = patch(vnode, arrToVnode(defauleArr))
}

btnRandom.onclick = () => {
  example = _.shuffle(example)
  vnode = patch(vnode, arrToVnode(example))
}

btnDelete.onclick = () => {
  let range = example.length - 1
  let target = Math.round(Math.random() * range)
  let targetObj = example.splice(target, 1)

  console.log(`删除元素${targetObj[0].value}`)

  vnode = patch(vnode, arrToVnode(example))
}

btnAppend.onclick = () => {
  let newItem = createNewItem(example)
  let randomIndex = Math.round(Math.random() * example.length)
  example.splice(randomIndex, 0, newItem)

  console.log(`插入元素${newItem.value}`)

  vnode = patch(vnode, arrToVnode(example))
}

function arrToVnode(arr) {
  let map = arr.map(item => {
    return h('p', { key: item.key }, item.value)
  })
  return h('div', { key: 'container', idName: 'container' }, map)
}

function createNewItem(arr) {
  let code = String.fromCharCode(65 + Math.round(Math.random() * 25))
  let newItem
  if (arr.some(item => item.key === code)) {
    return createNewItem(arr)
  }
  return newItem = { key: code, value: code }
}
