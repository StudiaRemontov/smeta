import axios from '../../modules/axios'
import { getValuesInside, treeToListOnlyKeys } from './outlay.module'
// import idb from '../local/idb'

const setDefaultQuantityExcept = (node, except) => {
  const { key, children, data } = node
  if (children && children.length > 0) {
    node.children = node.children.map(n => setDefaultQuantityExcept(n, except))
    return node
  }
  const exceptNode = except.find(n => n.key === key)
  if (exceptNode) {
    return exceptNode
  }
  const updatedData = { ...data, quantity: 0 }
  return { ...node, data: updatedData }
}

const getNodeFromTree = (node, nodeKey) => {
  const { key, children } = node
  if (key === nodeKey) {
    return node
  }
  return children.map(c => getNodeFromTree(c, nodeKey)).flat()
}

const filterTreeByQuantity = node => {
  const { children, data } = node
  if (children && children.length > 0) {
    node.children = children.filter(filterTreeByQuantity)
    return node.children.length > 0
  }
  return data.quantity > 0
}

export default {
  namespaced: true,
  state: {
    acts: [],
    activeTab: null,
    activeRoom: null,
    act: null,
    contentLoaded: false,
    outlay: null,
    roomsData: {},
    showOnlyCompleted: false,
  },
  mutations: {
    setActs(state, payload) {
      state.acts = payload
    },
    pushAct(state, payload) {
      state.acts.push(payload)
    },
    updateById(state, { id, data }) {
      state.acts = state.acts.map(act => {
        if (act._id === id) {
          return data
        }
        return act
      })
    },
    setActiveTab(state, payload) {
      state.activeTab = payload
      if (payload !== 'room') {
        state.activeRoom = null
      }
    },
    setActiveRoom(state, payload) {
      state.activeRoom = payload
      state.activeTab = 'room'
    },
    setContentLoaded(state, payload) {
      state.contentLoaded = payload
    },
    resetAct(state) {
      state.act = null
      state.roomsData = {}
    },
    updateQuantity(state, { node, value }) {
      const { activeRoom, roomsData } = state
      if (!activeRoom) {
        return
      }
      const { key } = node
      const found = roomsData[activeRoom.id]
        .map(n => getNodeFromTree(n, key))
        .flat()
      if (found.length > 0) {
        found[0].quantity = value
      }
    },
    setShowOnlyCompleted(state, payload) {
      state.showOnlyCompleted = payload
      if (!payload) return

      const { act, roomsData, outlay } = state
      if (!act) return

      const roomsDataClone = JSON.parse(JSON.stringify(roomsData))
      const rooms = outlay.rooms.map(room => {
        const { id } = room
        const jobs = roomsDataClone[id].filter(filterTreeByQuantity)
        return {
          id,
          jobs,
        }
      })

      const filteredRooms = rooms.filter(r => r.jobs.length > 0)
      state.act.rooms = filteredRooms
    },
  },
  actions: {
    setOutlay({ state }, payload) {
      state.outlay = payload
    },
    setAct({ state, commit }, payload) {
      if (!payload) {
        return commit('resetAct')
      }
      if (state.act) {
        commit('resetAct')
      }
      state.act = payload
      const { outlay: currentOutlay } = state
      const clone = JSON.parse(JSON.stringify(currentOutlay.rooms))
      state.roomsData = clone.reduce((acc, room) => {
        const actRoom = state.act.rooms.find(r => r.id === room.id)
        let jobs = []
        if (actRoom) {
          jobs = actRoom.jobs.map(getValuesInside).flat()
        }
        const data = room.jobs.map(n => setDefaultQuantityExcept(n, jobs))
        acc[room.id] = data
        return acc
      }, {})
    },
    async fetchAll({ state, commit }) {
      const { contentLoaded } = state
      if (contentLoaded) {
        return
      }
      try {
        const response = await axios.get('/act')
        commit('setActs', response.data)
        commit('setContentLoaded', true)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async create({ commit, state, dispatch }) {
      try {
        const { acts, outlay } = state
        const actsLengths = acts.length
        const nameWithNumber = `Акт №${actsLengths + 1}`
        const response = await axios.post('/act', {
          name: nameWithNumber,
          outlay: outlay._id,
        })
        commit('pushAct', response.data)
        dispatch('setAct', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async save({ state, commit }) {
      try {
        // формирование данных
        const { act, roomsData, outlay } = state
        if (!act) {
          return
        }
        const roomsDataClone = JSON.parse(JSON.stringify(roomsData))

        const rooms = outlay.rooms.map(room => {
          const { id } = room
          const jobs = roomsDataClone[id].filter(filterTreeByQuantity)
          return {
            id,
            jobs,
          }
        })

        const filteredRooms = rooms.filter(r => r.jobs.length > 0)
        const data = {
          ...act,
          rooms: filteredRooms,
        }
        // отправка на сервер
        const response = await axios.put(`/act/${act._id}`, data)
        commit('updateById', { id: act._id, data: response.data })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    acts: s => s.acts,
    activeTab: s => s.activeTab,
    activeRoom: s => s.activeRoom,
    act: s => s.act,
    outlay: s => s.outlay,
    roomsData: s => s.roomsData,
    showOnlyCompleted: s => s.showOnlyCompleted,
    completedValues: s => {
      const { act, outlay } = s
      if (!act || !outlay) {
        return {}
      }
      const { rooms } = outlay
      return rooms.reduce((acc, room) => {
        const found = act.rooms.find(r => r.id === room.id)
        const jobs = found ? found.jobs.map(treeToListOnlyKeys).flat() : []
        acc[room.id] = jobs
        return acc
      }, {})
    },
  },
}
