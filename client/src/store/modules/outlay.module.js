import { uniqBy } from 'lodash'
import idb from '../local/idb'
import OutlayService from '../../api/OutlayService'

import roomParametersMixin from '../../mixins/roomParameters.mixin'

import { InputType } from '../../enum/InputType'
import { outlayViewKeys } from '../../enum/outlayKeys'
import { getAllValues } from '@/helpers/treeMethods'
import { deepEqual } from '@/helpers/deepEqual'

import { filterNodes as actFilter } from './acts.module'

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

export const treeToListOnlyKeys = node => {
  const { children } = node
  return [node.key, ...children.map(treeToListOnlyKeys)].flat()
}

export const treeToListOnlyValues = node => {
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

export const mergeTree = (node, nodes) => {
  const { key, children } = node
  const isExistsInNodes = nodes.find(n => n.key === key)
  if (isExistsInNodes) {
    node.children = uniqBy([...isExistsInNodes.children, ...children], 'key')
    node.children = node.children.map(n => ({
      ...n,
      isEditing: false,
      coef: n.coef || 1,
    }))
    return [node]
  }

  return [
    {
      ...node,
      children: children.map(child => mergeTree(child, nodes)).flat(),
      coef: node.coef || 1,
      isEditing: false,
    },
  ]
}

const setQuantity = (room, data, quantityKey, formulaKey) => {
  const clone = JSON.parse(JSON.stringify(data))
  const { options } = room
  if (!options) {
    return clone
  }
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

const getNameWithNumber = (name, rooms, callback) => {
  const searchRegex = new RegExp(`^${name}\\s[№]\\d+$|^${name}$`)
  const findingRooms = rooms.filter(r => r.name.match(searchRegex))
  if (findingRooms.length === 0) {
    return name
  }
  const maxNumInRooms = findingRooms.reduce((acc, room) => {
    const numRegex = /№\d+/gm
    const cropedName = room.name.replace(name, '')
    const matches = cropedName.match(numRegex)
    if (!matches) {
      callback(room)
      return acc
    }
    const match = matches[0]
    const splitted = match.split('№')
    const num = +splitted[1]
    if (num > acc) {
      return num
    }
    return acc
  }, 0)

  if (!maxNumInRooms) {
    return `${name} №2`
  }
  return `${name} №${maxNumInRooms + 1}`
}

const filterTree = (node, selectedValues) => {
  const { key, children } = node
  if (children && children.length > 0 && !selectedValues.includes(key)) {
    return false
  }
  node.children = children.filter(c => filterTree(c, selectedValues))
  return true
}

const mergeNodes = nodes => {
  const groupped = nodes.reduce((acc, node) => {
    acc[node.key] = acc[node.key] || []
    const { children } = node
    const data = children.length > 0 ? children : node
    acc[node.key].push(data)
    return acc
  }, {})
  return Object.entries(groupped).map(([key, values]) => {
    const node = nodes.find(n => n.key === key)
    const { children } = node
    if (children && children.length > 0) {
      const flatten = values.flat()
      node.children = mergeNodes(flatten)
      return node
    }
    return node
  })
}

export default {
  namespaced: true,
  state: {
    outlay: null,
    edition: null,
    selectedRoom: null,
    showOnlyChecked: false,
    keys: [],
    initNodes: [],
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
    showLeftSide: true,
    showRightSide: true,
  },
  mutations: {
    setOutlay(state) {
      const { selectedValues, roomsData, outlay } = state
      if (!outlay) {
        return
      }
      const outlayClone = JSON.parse(JSON.stringify(outlay))
      const { rooms } = outlayClone
      const roomsClone = JSON.parse(JSON.stringify(rooms))
      const data = roomsClone.map(room => {
        const values = JSON.parse(JSON.stringify(roomsData[room.id]))
        const filtered = values.filter(n =>
          selectedValues[room.id].includes(n.key),
        )
        const nodes = filtered.map(n => filterNodes(n, selectedValues[room.id]))
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
    selectJobs(state, jobs) {
      const { outlay, selectedRoom, selectedValues } = state
      if (!outlay) {
        return
      }
      const selected = selectedValues[selectedRoom.id]
      jobs.forEach(job => {
        const isSelected = selected.includes(job)
        if (isSelected) {
          return
        }
        selectedValues[selectedRoom.id].push(job)
      })
    },
    unSelectJobs(state, jobs) {
      const { outlay, selectedRoom, selectedValues } = state
      if (!outlay) {
        return
      }
      jobs.forEach(job => {
        selectedValues[selectedRoom.id] = selectedValues[
          selectedRoom.id
        ].filter(key => {
          return key !== job
        })
      })
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
    setNodeCoef(_, { node, value }) {
      if (value < 1) {
        value = 1
      }
      node.coef = value
    },
    resetOutlay(state) {
      state.outlay = null
      state.edition = null
      state.quantityKey = null
      state.priceKey = null
      state.formulaKey = null
      state.initData = null
      state.keys = null
      state.roomsData = {}
      state.selectedValues = {}
      state.showResults = false
    },
    setShowLeftSide(state, payload) {
      state.showLeftSide = payload
    },
    setShowRightSide(state, payload) {
      state.showRightSide = payload
    },
    toggleSides(state) {
      const { showLeftSide, showRightSide } = state
      if (showLeftSide === showRightSide) {
        state.showLeftSide = !showLeftSide
        state.showRightSide = !showRightSide
        return
      }
      state.showLeftSide = true
      state.showRightSide = true
    },
  },
  actions: {
    setDefaultQuantity({ state }, room) {
      const { roomsData } = state
      const { id, options } = room
      const dataWorkWith = JSON.parse(JSON.stringify(roomsData[id]))
      if (!options) {
        return
      }
      const data = setQuantity(
        room,
        dataWorkWith,
        state.quantityKey.id,
        state.formulaKey.id,
      )
      return data
    },
    setRoomData({ state, rootGetters }, room) {
      const { initData } = state
      const { jobs, id, dirId } = room
      const nodes = jobs.map(treeToList).flat()
      const initDataClone = JSON.parse(JSON.stringify(initData))
      const roomDirectory = rootGetters['directory/roomDirectory']
      const roomData = roomDirectory.values.find(r => r.id === dirId)
      if (!dirId || !roomData) {
        const { options } = room
        if (options) {
          const { computed } = methods.calculateAllParameters(options)
          initDataClone.forEach(n =>
            getQuantityByFormula(
              n,
              computed,
              state.quantityKey.id,
              state.formulaKey.id,
            ),
          )
        }
        const mergedTree = initDataClone.map(c => mergeTree(c, nodes)).flat()
        state.roomsData[id] = mergedTree
        return
      }
      const { keys } = roomDirectory
      const collectionKey = keys.find(k => k.type === InputType.COLLECTION)
      const roomCollections = roomData.data[collectionKey.id]
      const filteredEdition = initDataClone.filter(c =>
        filterTree(c, roomCollections),
      )
      const { options } = room

      if (!options) {
        const merged = mergeNodes([...filteredEdition, ...jobs])
        const mergedWithReplacedValues = merged
          .map(c => mergeTree(c, nodes))
          .flat()

        state.roomsData[id] = mergedWithReplacedValues
        return
      }
      const { rooms } = options
      if (rooms) {
        const roomsData = options.rooms.map(roomId => {
          return state.outlay.rooms.find(r => r.id === roomId)
        })
        const totalParameters = methods.getTotalParametersOfRooms(roomsData)
        filteredEdition.forEach(n =>
          getQuantityByFormula(
            n,
            totalParameters,
            state.quantityKey.id,
            state.formulaKey.id,
          ),
        )
        const merged = mergeNodes([...filteredEdition, ...jobs])
        const mergedWithReplacedValues = merged
          .map(c => mergeTree(c, nodes))
          .flat()

        state.roomsData[id] = mergedWithReplacedValues
        return
      }
      const { computed } = methods.calculateAllParameters(options)
      filteredEdition.forEach(n =>
        getQuantityByFormula(
          n,
          computed,
          state.quantityKey.id,
          state.formulaKey.id,
        ),
      )
      const merged = mergeNodes([...filteredEdition, ...jobs])
      const mergedWithReplacedValues = merged
        .map(c => mergeTree(c, nodes))
        .flat()

      state.roomsData[id] = mergedWithReplacedValues
    },
    async setOutlay({ state, commit, rootGetters, dispatch }, payload) {
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
      const cloneInitData = JSON.parse(JSON.stringify(initData))
      state.initNodes = cloneInitData.map(getValuesInside).flat()
      state.initData = initData
      const orderedKeys = outlayViewKeys.map(keyType => {
        return directory.keys.find(key => key.type === keyType)
      })
      state.keys = orderedKeys
      const rooms = JSON.parse(JSON.stringify(state.outlay.rooms))
      rooms.map(room => {
        const roomClone = JSON.parse(JSON.stringify(room))
        dispatch('setRoomData', room)
        const { jobs, id } = roomClone
        const values = jobs.map(treeToListOnlyValues).flat()
        state.selectedValues[id] = values
      })
      commit('setSelectedRoom', null)
    },
    updateRooms({ state, dispatch }, payload) {
      const { outlay } = state
      if (!outlay) return
      outlay.rooms = payload
      dispatch('saveLocaly')
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
    unselectArrayOfJobs({ state }, array = []) {
      if (array.length === 0) return
      const { outlay, selectedRoom } = state
      const currentRoom = outlay.rooms.find(r => r.id === selectedRoom.id)
      const roomDataTree = JSON.parse(JSON.stringify(currentRoom.jobs))
      const filteredTree = roomDataTree.filter(t =>
        actFilter(t, n => {
          const { key } = n
          return !array.includes(key)
        }),
      )
      const selectedValues = filteredTree.map(treeToListOnlyKeys).flat()
      state.selectedValues[selectedRoom.id] = selectedValues
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
    async createRoom(
      { commit, state, dispatch },
      { name, options, dirId = null },
    ) {
      if (!state.outlay) return
      const { rooms } = state.outlay
      const newName = getNameWithNumber(name, rooms, room => {
        room.name = `${room.name} №1`
      })
      const room = {
        id: Date.now() + '',
        name: newName,
        options,
        jobs: [],
        newJobs: [],
        dirId,
      }
      state.outlay.rooms.push(room)
      dispatch('setRoomData', room)
      state.selectedValues[room.id] = []
      commit('setSelectedRoom', room)
      return await dispatch('saveLocaly')
    },
    async cloneRoom(
      { getters, state, dispatch, commit },
      { name, options, cloningRoomId, dirId },
    ) {
      const cloningRoomData = getters.rooms.find(r => r.id === cloningRoomId)
      const clone = JSON.parse(JSON.stringify(cloningRoomData))
      const { rooms } = state.outlay
      const newName = getNameWithNumber(name, rooms, room => {
        room.name = `${room.name} №1`
      })
      const { jobs } = clone
      const room = {
        id: Date.now() + '',
        name: newName,
        options,
        jobs,
        dirId,
      }
      const { selectedValues, roomsData, outlay } = state
      outlay.rooms.push(room)
      const clonedRoomsData = JSON.parse(
        JSON.stringify(roomsData[cloningRoomId]),
      )
      const clonedValues = JSON.parse(
        JSON.stringify(selectedValues[cloningRoomId]),
      )
      const { options: oldOptions } = cloningRoomData
      const isOptionsEqual = deepEqual(options || {}, oldOptions || {})
      state.roomsData[room.id] = clonedRoomsData
      state.selectedValues[room.id] = clonedValues
      if (!isOptionsEqual) {
        dispatch('setDefaultQuantity', room)
      }
      commit('setSelectedRoom', room)
      return await dispatch('saveLocaly')
    },
    async updateRoom({ state, dispatch, commit }, payload) {
      if (!state.outlay || !state.selectedRoom) return
      const { rooms } = state.outlay
      state.outlay.rooms = rooms.map(r => {
        if (r.id !== state.selectedRoom.id) {
          return r
        }
        if (r.name !== payload.name) {
          const roomsForNewName = [...rooms].filter(
            r => r.id !== state.selectedRoom.id,
          )
          payload.name = getNameWithNumber(
            payload.name,
            roomsForNewName,
            room => {
              room.name = `${room.name} №1`
            },
          )
        }

        const data = {
          ...r,
          ...payload,
        }
        const { options: newOptions, dirId: newDirId } = data
        const { options: oldOptions, dirId: oldDirId } = r
        const isOptionsEqual = deepEqual(newOptions, oldOptions)

        if (newDirId !== oldDirId) {
          dispatch('setRoomData', data)
          state.selectedValues[data.id] = []
        }

        if (!isOptionsEqual) {
          const { roomsData, quantityKey, formulaKey } = state
          const newRoomsData = setQuantity(
            data,
            roomsData[data.id],
            quantityKey.id,
            formulaKey.id,
          )
          state.roomsData[data.id] = newRoomsData
        }
        commit('setSelectedRoom', data)
        return data
      })
      return await dispatch('saveLocaly')
    },
    async removeRoom({ state, commit, dispatch }, roomId) {
      if (!state.outlay) return
      state.outlay.rooms = state.outlay.rooms.filter(r => r.id !== roomId)
      state.outlay.rooms = state.outlay.rooms.map(room => {
        const { options } = room
        if (!options || (options && !options.rooms)) {
          return room
        }
        options.rooms = options.rooms.filter(id => id !== roomId)
        return room
      })
      if (state.room === roomId) {
        state.room = null
      }
      delete state.roomsData[roomId]
      delete state.selectedValues[roomId]
      commit('setSelectedRoom', null)
      return await dispatch('saveLocaly')
    },
    async update({ state, commit }) {
      if (!state.outlay) return
      const { _id } = state.outlay
      try {
        const response = await OutlayService.update(state.outlay)
        commit(
          'outlays/updateById',
          { id: _id, data: response.data },
          { root: true },
        )
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
        await idb.saveDataInCollection('outlays', {
          ...data,
          updatedAt: new Date(),
        })
        commit('outlays/updateById', { id: outlay._id, data }, { root: true })
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    outlay: s => s.outlay,
    edition: s => s.edition,
    rooms: (state, _, __, rootGetters) => {
      const rooms = state.outlay?.rooms || []
      const roomDirectory = rootGetters['directory/roomDirectory']
      const { values } = roomDirectory
      return rooms.sort((a, b) => {
        const { dirId: aDirId } = a
        const { dirId: bDirId } = b
        if (!aDirId) {
          return 1
        }
        if (!bDirId) {
          return -1
        }
        const aIndex = values.findIndex(r => r.id === aDirId)
        const bIndex = values.findIndex(r => r.id === bDirId)
        return bIndex - aIndex
      })
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
    invalidJobs: s => {
      const { outlay, quantityKey } = s
      if (!outlay) {
        return {}
      }
      const { rooms } = outlay
      return rooms.reduce((acc, room) => {
        const nodes = room.jobs.map(getAllValues).flat()
        const invalid = nodes.filter(n => n.data[quantityKey.id] === 0)
        acc[room.id] = invalid
        return acc
      }, {})
    },
    showLeftSide: s => s.showLeftSide,
    showRightSide: s => s.showRightSide,
    initNodes: s => s.initNodes,
  },
}
