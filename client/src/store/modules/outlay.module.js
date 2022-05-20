import axios from '../../modules/axios'
import { uniqBy } from 'lodash'
import idb from '../local/idb'

import roomParametersMixin from '../../mixins/roomParameters.mixin'

import { roomOptions } from '../../enum/roomOptions'
import { InputType } from '../../enum/InputType'

const { methods } = roomParametersMixin

const treeToList = node => {
  const { children } = node
  if (children && children.length > 0) {
    if (children[0].children.length === 0) {
      return [node]
    }
    return node.children.map(treeToList).flat()
  }
  return []
}

const treeToListOnlyValues = node => {
  const { children } = node
  if (children && children.length > 0) {
    return [node.key, ...node.children.map(treeToListOnlyValues)].flat()
  }
  return [node.key]
}

const isObjectId = id => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

const getQuantityByFormula = (
  node,
  calculatedProperties,
  quantityKey,
  formulaKey,
) => {
  const { children } = node
  if (children.length === 0) {
    const formula = node.data[formulaKey]
    node.data[quantityKey] = calculatedProperties[formula] || 0
    return
  }
  children.forEach(c =>
    getQuantityByFormula(c, calculatedProperties, quantityKey, formulaKey),
  )
}

const updateNodeInTree = (node, key, children) => {
  if (node.key == key) {
    node.children = children
  } else if (node.children.length > 0) {
    node.children.forEach(child => {
      updateNodeInTree(child, key, children)
    })
  }
}

const mergeTree = (node, nodes) => {
  const { key, children } = node
  const isExistsInNodes = nodes.find(n => n.key === key)

  if (isExistsInNodes) {
    node.children = uniqBy([...isExistsInNodes.children, ...children], 'key')
    return [node]
  }

  return [
    {
      ...node,
      children: children.map(child => mergeTree(child, nodes)).flat(),
    },
  ]
}

export const filterNodes = (node, selectedValues) => {
  const { children } = node
  node.children = children.filter(n => selectedValues.includes(n.key))
  if (node.children.length > 0) {
    node.children.map(c => filterNodes(c, selectedValues))
  }
  return node
}

export default {
  namespaced: true,
  state: {
    outlay: null,
    edition: null,
    selectedRoom: null,
    showOnlyChecked: false,
    keys: [],
    initNodes: null,
    initData: null,
    roomsData: {},
    selectedValues: {},
    room: null,
    quantityKey: null,
    priceKey: null,
    formulaKey: null,
    striped: false,
    activeData: null,
    nodeList: null,
    roots: null,
  },
  mutations: {
    setOutlay(state) {
      const { selectedValues, roomsData, outlay } = state
      if (!outlay) {
        return
      }
      const outlayClone = JSON.parse(JSON.stringify(outlay))
      const roomsClone = JSON.parse(JSON.stringify(Object.entries(roomsData)))
      const data = roomsClone.map(([roomId, values]) => {
        const room = outlayClone.rooms.find(r => r.id === roomId)
        const filtered = values.filter(n =>
          selectedValues[roomId].includes(n.key),
        )
        const nodes = filtered.map(n => filterNodes(n, selectedValues[roomId]))
        return {
          ...room,
          jobs: nodes,
        }
      })
      const newData = {
        ...outlayClone,
        rooms: data,
      }
      Object.assign(state.outlay, newData)
    },
    setSale(state, payload) {
      const value = parseInt(payload)
      if (isNaN(value) || value < 0) {
        return (state.outlay.sale = 0)
      }
      if (value > 20) {
        return (state.outlay.sale = 20)
      }
      state.outlay.sale = value
    },
    setSelectedRoom(state, payload) {
      state.selectedRoom = payload
    },
    setShowOnlyChecked(state, payload) {
      state.showOnlyChecked = payload
    },
    setActiveData(state, payload) {
      state.activeData = payload
    },
    setRoots(state, payload) {
      state.roots = payload
    },
    setNodeList(state, payload) {
      state.nodeList = payload
    },
    createRoom(state, { name, options }) {
      if (!state.outlay) return
      const room = {
        id: Date.now() + '',
        name,
        options,
        jobs: [],
      }
      state.outlay.rooms.push(room)
      state.selectedRoom = room
    },
    selectRoom(state, { id, showOnlySelected = false }) {
      if (!state.outlay) return
      state.room = {
        id,
        showOnlySelected,
      }
    },
    updateRoom(state, payload) {
      if (!state.outlay || !state.selectedRoom) return
      state.outlay.rooms = state.outlay.rooms.map(r => {
        if (r.id === state.selectedRoom.id) {
          const data = {
            ...r,
            ...payload,
          }
          state.selectedRoom = data
          return data
        }
        return r
      })
    },
    addJob(state, job) {
      if (!state.outlay || !state.room) return

      const room = state.outlay.rooms.find(r => r.id === state.room.id)
      const isExists = room.jobs.find(j => j.key === job.key)
      if (isExists) {
        return
      }
      room.jobs.push(job)
    },
    setStriped(state, payload) {
      state.striped = payload
    },
    removeJob(state, job) {
      if (!state.outlay || !state.room) return

      const room = state.outlay.rooms.find(r => r.id === state.room)
      room.jobs = room.jobs.filter(r => r.key !== job.key)
    },
    selectJob(state, job) {
      if (!state.selectedRoom) return
      const selectedValues = state.selectedValues[state.selectedRoom.id]
      if (!selectedValues) return
      if (!selectedValues.includes(job.key)) {
        selectedValues.push(job.key)
      }
    },
    unselectJob(state, job) {
      if (!state.selectedRoom) return
      const selectedValues = state.selectedValues[state.selectedRoom.id]
      if (!selectedValues) return
      state.selectedValues[state.selectedRoom.id] = selectedValues.filter(
        key => key !== job.key,
      )
    },
    pushNodeAfter(state, { node, index }) {
      if (!state.selectedRoom) return

      const nodeList = state.roomsData[state.selectedRoom.id]

      if (!nodeList) return
      const newArr = [
        ...nodeList.slice(0, index),
        {
          ...node,
          key: Date.now() + '',
        },
        ...nodeList.slice(index),
      ]

      state.roomsData[state.selectedRoom.id] = newArr
    },
    updateNodeChildren(state, { node, children }) {
      state.roomsData[state.selectedRoom.id].forEach(root => {
        updateNodeInTree(root, node.key, children)
      })
    },
    removeNode(state, nodeKey) {
      if (!state.selectedRoom) return
      state.roomsData[state.selectedRoom.id] = state.roomsData[
        state.selectedRoom.id
      ].filter(n => n.key !== nodeKey)
    },
    resetOutlay(state) {
      state.outlay = null
      state.edition = null
      state.quantityKey = null
      state.priceKey = null
      state.formulaKey = null
      state.initData = null
      state.keys = null
      state.roomsData = null
      state.selectedValues = null
    },
  },
  actions: {
    setOutlay({ state, commit, rootGetters }, payload) {
      if (!payload) {
        return commit('resetOutlay')
      }
      state.outlay = JSON.parse(JSON.stringify(payload))
      const edition = rootGetters['edition/editions'].find(
        e => e._id === state.outlay.edition,
      )
      state.edition = edition
      const directory = rootGetters['directory/directories'].find(
        d => d._id === edition.dirId,
      )
      state.quantityKey = directory.keys.find(
        k => k.type === InputType.QUANTITY,
      )
      state.priceKey = directory.keys.find(k => k.type === InputType.PRICE)
      state.formulaKey = directory.keys.find(k => k.type === InputType.FORMULA)
      const initData = JSON.parse(JSON.stringify(edition.data.children))
      state.initData = initData
      state.keys = edition.keys
      const rooms = JSON.parse(JSON.stringify(state.outlay.rooms))
      state.roomsData = rooms.reduce((acc, room) => {
        const nodes = room.jobs.map(treeToList).flat()
        const clone = JSON.parse(JSON.stringify(initData))
        const { options } = room
        const spaces = methods.getSpaces(options.spaces)
        const perimeter = methods.getPerimeter(options.width, options.length)
        const calculatedProperties = {
          [roomOptions.perimeter]: perimeter,
          [roomOptions.floorArea]: methods.getFloorArea(
            options.width,
            options.length,
          ),
          [roomOptions.wallArea]: methods.getWallArea(
            perimeter,
            options.height,
            spaces,
          ),
        }
        clone.forEach(n =>
          getQuantityByFormula(
            n,
            calculatedProperties,
            state.quantityKey.id,
            state.formulaKey.id,
          ),
        )
        const mergedTree = clone.map(c => mergeTree(c, nodes)).flat()

        acc[room.id] = mergedTree
        return acc
      }, {})
      state.selectedValues = state.outlay.rooms.reduce((acc, room) => {
        const values = room.jobs.map(treeToListOnlyValues).flat()
        acc[room.id] = values
        return acc
      }, {})
      commit('setSelectedRoom', null)
    },
    async createRoom({ commit, state, dispatch }, { name, options }) {
      if (!state.outlay) return
      const room = {
        id: Date.now() + '',
        name,
        options,
        jobs: [],
      }
      state.outlay.rooms.push(room)
      const clone = JSON.parse(JSON.stringify(state.initData))
      const spaces = methods.getSpaces(options.spaces)
      const perimeter = methods.getPerimeter(options.width, options.length)
      const calculatedProperties = {
        [roomOptions.perimeter]: perimeter,
        [roomOptions.floorArea]: methods.getFloorArea(
          options.width,
          options.length,
        ),
        [roomOptions.wallArea]: methods.getWallArea(
          perimeter,
          options.height,
          spaces,
        ),
      }
      clone.forEach(n =>
        getQuantityByFormula(
          n,
          calculatedProperties,
          state.quantityKey.id,
          state.formulaKey.id,
        ),
      )
      state.roomsData[room.id] = clone
      state.selectedValues[room.id] = []
      commit('setSelectedRoom', room)
      return await dispatch('saveLocaly')
    },
    async removeRoom({ state, dispatch }, roomId) {
      if (!state.outlay) return
      state.outlay.rooms = state.outlay.rooms.filter(r => r.id !== roomId)
      if (state.room === roomId) {
        state.room = null
      }
      delete state.roomsData[roomId]
      delete state.selectedValues[roomId]
      state.selectedRoom = null
      return await dispatch('saveLocaly')
    },
    async create({ rootGetters }, data) {
      try {
        const response = await axios.post('/outlay', {
          ...data,
          edition: rootGetters['edition/active']._id,
        })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async update({ state, commit }) {
      if (!state.outlay) return
      const { _id } = state.outlay
      try {
        const response = await axios.put(`/outlay/${_id}`, state.outlay)
        commit(
          'outlays/updateById',
          { id: _id, data: response.data },
          { root: true },
        )
        await idb.removeOutlay(_id)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async saveLocaly({ state, commit }) {
      try {
        commit('setOutlay')
        const { outlay } = state
        if (!outlay) {
          return
        }
        const data = JSON.parse(JSON.stringify(outlay))
        await idb.saveOutlay(data)
        commit('outlays/updateById', { id: outlay._id, data }, { root: true })
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    outlay: s => s.outlay,
    edition: s => s.edition,
    rooms: s => {
      return s.outlay?.rooms || []
    },
    selectedRoom: s => s.selectedRoom,
    roomsData: s => s.roomsData,
    currentRoomData: s => {
      if (!s.selectedRoom || !s.outlay) {
        return []
      }
      return s.roomsData[s.selectedRoom.id]
    },
    selectedValues: s => {
      if (!s.outlay) return []
      if (!s.selectedRoom) {
        return Object.entries(s.selectedValues).reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})
      }
      return s.selectedValues[s.selectedRoom.id] || []
    },
    roots: s => {
      if (!s.selectedRoom || !s.roomsData[s.selectedRoom.id]) return []
      return s.roomsData[s.selectedRoom.id].filter(n => isObjectId(n.key))
    },
    keys: s => s.keys,
    showOnlyChecked: s => s.showOnlyChecked,
    quantityKey: s => s.quantityKey,
    priceKey: s => s.priceKey,
    striped: s => s.striped,
    sale: s => s.outlay.sale,
    activeData: s => s.activeData,
    showOnlySelected: s => s.room?.showOnlySelected,
    nodeList: s => s.nodeList,
  },
}
