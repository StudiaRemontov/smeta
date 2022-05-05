import axios from '../../axios/index.js'
import { uniqBy } from 'lodash'

/*
  outlay model: {
    name,
    rooms: [
      {
        name,
        options: {
          width,
          height,
          length,
          spaces*,
        },
        jobs: [
          {
            id,
            data,
            price
          }
        ]
      }
    ]
    info: {
      address,
      client,
    }
  }
*/

const convertData = (node, selected) => {
  const { key, data } = node
  const children = selected?.filter(n => n.parent === node.key)
  if (children.length > 0) {
    const subChildren = children.map(c => convertData(c, selected))
    return {
      key,
      data,
      children: subChildren,
    }
  }
  return {
    key,
    data,
    children,
  }
}

const treeToList = (node, level, parent) => {
  const { children } = node
  if (parent) {
    node.parent = parent
  }
  if (children && children.length > 0) {
    return [
      {
        ...node,
        level,
      },
      ...node.children.map(c => treeToList(c, level + 1, node.key)),
    ].flat()
  }
  return [
    {
      ...node,
      level,
    },
  ]
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

export default {
  namespaced: true,
  state: {
    outlay: null,
    edition: null,
    selectedRoom: null,
    showOnlyChecked: false,
    keys: [],
    initNodes: null,
    roomsData: {},
    selectedValues: {},
    room: null,
    activeData: null,
    nodeList: null,
    roots: null,
  },
  mutations: {
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
          return {
            ...r,
            ...payload,
          }
        }
        return r
      })
    },
    removeRoom(state, roomId) {
      if (!state.outlay) return
      state.outlay.rooms = state.outlay.rooms.filter(r => r.id !== roomId)
      if (state.room === roomId) {
        state.room = null
      }
      delete state.roomsData[roomId]
      delete state.selectedValues[roomId]
      state.selectedRoom = null
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
    updateJob(state, { roomId, job }) {},
    removeJob(state, job) {
      if (!state.outlay || !state.room) return

      const room = state.outlay.rooms.find(r => r.id === state.room)
      room.jobs = room.jobs.filter(r => r.key !== job.key)
    },
    updateInfo(state, data) {},
    selectJob(state, job) {
      if (!state.selectedRoom) return

      const selectedValues = state.selectedValues[state.selectedRoom.id]
      if (!selectedValues) return
      const isExists = !!selectedValues.find(key => key === job.key)
      if (isExists) return
      selectedValues.push(job.key)
    },
    unselectJob(state, job) {
      if (!state.selectedRoom) return

      const selectedValues = state.selectedValues[state.selectedRoom.id]
      if (!selectedValues) return
      if (job.children && job.children.length > 0) {
        const isEmpty = job.children.find(n =>
          selectedValues.find(key => key === n.key),
        )
        if (isEmpty) return
      }
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
  },
  actions: {
    setOutlay({ state, commit, rootGetters }, payload) {
      state.outlay = JSON.parse(JSON.stringify(payload))
      const edition = rootGetters['edition/editions'].find(
        e => e._id === state.outlay.edition,
      )
      state.edition = edition
      const initData = JSON.parse(JSON.stringify(edition.data.children))

      const initNodes = initData.map(n => treeToList(n, 0)).flat()
      state.initNodes = initNodes
      state.keys = edition.keys
      state.roomsData = state.outlay.rooms.reduce((acc, room) => {
        const nodes = room.jobs.map(r => treeToList(r, 0)).flat()
        const mergedNodes = uniqBy([...initNodes, ...nodes], 'key')
        const parents = mergedNodes.filter(n => !n.parent)
        const mergedTree = parents.map(p => convertData(p, mergedNodes))
        const updatedNodes = mergedTree.map(n => treeToList(n, 0)).flat()
        acc[room.id] = updatedNodes
        return acc
      }, {})
      state.selectedValues = state.outlay.rooms.reduce((acc, room) => {
        const values = room.jobs.map(treeToListOnlyValues).flat()
        acc[room.id] = values
        return acc
      }, {})
      commit('setSelectedRoom', null)
    },
    createRoom({ commit, state }, { name, options }) {
      if (!state.outlay) return
      const room = {
        id: Date.now() + '',
        name,
        options,
        jobs: [],
      }
      state.outlay.rooms.push(room)
      state.roomsData[room.id] = JSON.parse(JSON.stringify(state.initNodes))
      state.selectedValues[room.id] = []
      commit('setSelectedRoom', room)
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
    async update({ state, commit }, data) {
      if (!state.outlay) return
      const { _id } = state.outlay
      try {
        const response = await axios.put(`/outlay/${_id}`, data)
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
      if (!s.selectedRoom) return []
      return s.roomsData[s.selectedRoom.id]
    },
    selectedValues: s => {
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
    activeData: s => s.activeData,
    showOnlySelected: s => s.room?.showOnlySelected,
    nodeList: s => s.nodeList,
  },
}
