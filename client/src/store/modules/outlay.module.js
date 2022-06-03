import axios from '../../modules/axios'
import { uniqBy } from 'lodash'
import idb from '../local/idb'

import roomParametersMixin from '../../mixins/roomParameters.mixin'

import { InputType } from '../../enum/InputType'

const { methods } = roomParametersMixin

export const treeToList = node => {
  const { children } = node
  if (children && children.length > 0) {
    if (children[0].children.length === 0) {
      return [node]
    }
    return node.children.map(treeToList).flat()
  }
  return []
}

const treeToListOnlyKeys = node => {
  const { children } = node
  return [node.key, ...children.map(treeToListOnlyKeys)].flat()
}

const treeToListOnlyValues = node => {
  const { children } = node
  if (children && children.length > 0) {
    return [node.key, ...node.children.map(treeToListOnlyValues)].flat()
  }
  return [node.key]
}

export const getValuesInside = node => {
  const { children } = node
  if (children && children.length > 0) {
    return children.map(getValuesInside).flat()
  }
  return [node]
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
    node.children = node.children.map(n => ({ ...n, isEditing: false }))
    return [node]
  }

  return [
    {
      ...node,
      children: children.map(child => mergeTree(child, nodes)).flat(),
    },
  ]
}

const setQuantity = (room, data, quantityKey, formulaKey) => {
  const clone = JSON.parse(JSON.stringify(data))
  const { options } = room
  const { computed } = methods.calculateAllParameters(options)
  clone.forEach(n => getQuantityByFormula(n, computed, quantityKey, formulaKey))
  return clone
}

export const filterNodes = (node, selectedValues) => {
  const { children } = node
  node.children = children.filter(n => selectedValues.includes(n.key))
  if (node.children.length > 0) {
    node.children.map(c => filterNodes(c, selectedValues))
    return node
  }
  return []
}

const getParentsOfNode = (node, nodeKey, parents) => {
  const { key, children } = node
  if (key === nodeKey) {
    return parents
  }
  return children
    .map(c => getParentsOfNode(c, nodeKey, [node, ...parents]))
    .flat()
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
    currentNode: null,
    showResults: false,
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
      if (!state.outlay) return
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
      state.showResults = false
      state.selectedRoom = payload
      state.showOnlyChecked = false
    },
    setShowResults(state, payload) {
      state.selectedRoom = null
      state.showResults = payload
    },
    setShowOnlyChecked(state, payload) {
      state.showOnlyChecked = payload
    },
    setCurrentNode(state, payload) {
      state.currentNode = payload
    },
    setStriped(state, payload) {
      state.striped = payload
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
    toggleNodeEditing(_, node) {
      node.isEditing = !node.isEditing
    },
    setNodeEditing(_, { node, value }) {
      node.isEditing = value
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
      state.showResults = false
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
        const { computed } = methods.calculateAllParameters(options)
        clone.forEach(n =>
          getQuantityByFormula(
            n,
            computed,
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
    selectJob({ state, dispatch }, job) {
      const { roomsData, selectedRoom, selectedValues } = state
      const isSelected = selectedValues[selectedRoom.id].includes(job.key)
      if (isSelected) {
        return dispatch('unSelectJob', job)
      }
      const tree = JSON.parse(JSON.stringify(roomsData[selectedRoom.id]))
      const parents = tree.map(n => getParentsOfNode(n, job.key, [])).flat()
      const nodesToSelect = [job, ...parents]
      nodesToSelect.forEach(n => {
        if (selectedValues[selectedRoom.id].includes(n.key)) {
          return
        }
        selectedValues[selectedRoom.id].push(n.key)
      })
    },
    unSelectJob({ state, dispatch }, job) {
      const { roomsData, selectedRoom, selectedValues } = state
      const isSelected = selectedValues[selectedRoom.id].includes(job.key)
      if (!isSelected) {
        return dispatch('selectJob', job)
      }
      const tree = JSON.parse(JSON.stringify(roomsData[selectedRoom.id]))
      const parents = tree.map(n => getParentsOfNode(n, job.key, [])).flat()
      selectedValues[selectedRoom.id] = selectedValues[selectedRoom.id].filter(
        key => key !== job.key,
      )
      parents.forEach(p => {
        const { children } = p
        const hasSelectedValues = children.find(c =>
          selectedValues[selectedRoom.id].includes(c.key),
        )
        if (hasSelectedValues) {
          return
        }
        selectedValues[selectedRoom.id] = selectedValues[
          selectedRoom.id
        ].filter(key => key !== p.key)
      })
    },
    toggleCategoryJobs({ state, dispatch }, node) {
      const { selectedValues, selectedRoom } = state
      const selectedNodes = selectedValues[selectedRoom.id]
      const { children } = node
      const nodesInside = children.map(treeToListOnlyKeys).flat()
      const selectedChildren = children.filter(node =>
        selectedNodes.includes(node.key),
      )
      if (selectedChildren.length === children.length) {
        selectedValues[selectedRoom.id] = selectedValues[
          selectedRoom.id
        ].filter(key => !nodesInside.includes(key))
        return dispatch('selectJob', node)
      }
      const newValues = [...selectedValues[selectedRoom.id], ...nodesInside]
      const unique = [...new Set(newValues)]
      selectedValues[selectedRoom.id] = unique
      const isSelectedCategory = selectedValues[selectedRoom.id].includes(
        node.key,
      )
      if (isSelectedCategory) return
      return dispatch('selectJob', node)
    },
    async createRoom({ commit, state, dispatch }, { name, options }) {
      if (!state.outlay) return
      const nameRegex = new RegExp(`^${name}[\\s][\\d]*$|^${name}$`, 'gmi')
      const roomsWithSameName = state.outlay.rooms.filter(r =>
        r.name.match(nameRegex),
      )
      if (roomsWithSameName.length > 0) {
        const maxNum = roomsWithSameName.reduce((acc, r) => {
          const numInName = r.name.split(' ')[1] || 0
          const num = +numInName
          if (num > acc) {
            return num
          }
          return acc
        }, 0)
        name = `${name} ${maxNum + 1}`
      }
      const room = {
        id: Date.now() + '',
        name,
        options,
        jobs: [],
      }
      state.outlay.rooms.push(room)
      const clone = setQuantity(
        room,
        state.initData,
        state.quantityKey.id,
        state.formulaKey.id,
      )
      state.roomsData[room.id] = clone
      state.selectedValues[room.id] = []
      commit('setSelectedRoom', room)
      return await dispatch('saveLocaly')
    },
    async cloneRoom(
      { getters, state, dispatch, commit },
      { name, options, cloningRoomId },
    ) {
      const cloningRoomData = getters.rooms.find(r => r.id === cloningRoomId)
      const clone = JSON.parse(JSON.stringify(cloningRoomData))
      const nameRegex = new RegExp(`^${name}[\\s][\\d]*$|^${name}$`, 'gmi')
      const roomsWithSameName = state.outlay.rooms.filter(r =>
        r.name.match(nameRegex),
      )
      if (roomsWithSameName.length > 0) {
        const maxNum = roomsWithSameName.reduce((acc, r) => {
          const numInName = r.name.split(' ')[1] || 0
          const num = +numInName
          if (num > acc) {
            return num
          }
          return acc
        }, 0)
        name = `${name} ${maxNum + 1}`
      }
      const { jobs } = clone
      const room = {
        id: Date.now() + '',
        name,
        options,
        jobs,
      }
      const { selectedValues, roomsData, outlay, quantityKey, formulaKey } =
        state
      outlay.rooms.push(room)
      const clonedRoomsData = JSON.parse(
        JSON.stringify(roomsData[cloningRoomId]),
      )
      const clonedValues = JSON.parse(
        JSON.stringify(selectedValues[cloningRoomId]),
      )

      const cloneData = setQuantity(
        room,
        clonedRoomsData,
        quantityKey.id,
        formulaKey.id,
      )
      state.roomsData[room.id] = cloneData
      state.selectedValues[room.id] = clonedValues
      commit('setSelectedRoom', room)
      return await dispatch('saveLocaly')
    },
    async updateRoom({ state, dispatch, commit }, payload) {
      if (!state.outlay || !state.selectedRoom) return
      state.outlay.rooms = state.outlay.rooms.map(r => {
        if (r.id === state.selectedRoom.id) {
          const data = {
            ...r,
            ...payload,
          }
          commit('setSelectedRoom', data)
          const clone = setQuantity(
            data,
            state.roomsData[state.selectedRoom.id],
            state.quantityKey.id,
            state.formulaKey.id,
          )
          state.roomsData[r.id] = clone
          return data
        }
        return r
      })
      return await dispatch('saveLocaly')
    },
    async removeRoom({ state, commit, dispatch }, roomId) {
      if (!state.outlay) return
      state.outlay.rooms = state.outlay.rooms.filter(r => r.id !== roomId)
      if (state.room === roomId) {
        state.room = null
      }
      delete state.roomsData[roomId]
      delete state.selectedValues[roomId]
      commit('setSelectedRoom', null)
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
    currentNode: s => s.currentNode,
    showResults: s => s.showResults,
  },
}
