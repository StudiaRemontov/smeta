import axios from '../../modules/axios'
import { getValuesInside, treeToListOnlyKeys } from './outlay.module'
import ActService from '../../api/ActService'
import idb from '../local/idb'

const getNameWithNumber = acts => {
  const number = acts.reduce((acc, act) => {
    const numRegex = /№\d+/gm
    const cropedName = act.name.replace('Акт', '')
    const matches = cropedName.match(numRegex)
    if (!matches) {
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
  return `Акт №${number + 1}`
}

export const setDefaultQuantityExcept = (node, except) => {
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

export const filterTreeByQuantity = node => {
  const { children, data } = node
  if (children && children.length > 0) {
    node.children = children.filter(filterTreeByQuantity)
    return node.children.length > 0
  }
  return data.quantity > 0
}

const prepareData = (actsData, outlay, act) => {
  const actsDataClone = JSON.parse(JSON.stringify(actsData))

  const rooms = outlay.rooms.map(room => {
    const { id } = room
    const jobs = actsDataClone[act._id][id].filter(filterTreeByQuantity)
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

  return data
}

export default {
  namespaced: true,
  state: {
    loading: false,
    acts: [],
    activeTab: null,
    activeRoom: null,
    act: null,
    contentLoaded: false,
    outlay: null,
    roomsData: {},
    showOnlyCompleted: false,
    actsData: {},
    changeView: false,
    maximized: false,
    hoveredItem: null,
    selectedItem: null,
    showLeftQuantity: false,
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
    removeById(state, id) {
      state.acts = state.acts.filter(a => a._id !== id)
    },
    setActiveTab(state, payload) {
      state.activeTab = payload
      if (payload !== 'room') {
        state.activeRoom = null
      }
    },
    setActiveRoom(state, payload) {
      state.activeRoom = payload
      const tabBefore = state.activeTab
      if (tabBefore !== 'room') {
        state.showOnlyCompleted = false
      }
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
      const { act, actsData, outlay } = state
      if (!act) return

      const actsDataClone = JSON.parse(JSON.stringify(actsData))
      const rooms = outlay.rooms.map(room => {
        const { id } = room
        const jobs = actsDataClone[act._id][id].filter(filterTreeByQuantity)
        return {
          id,
          jobs,
        }
      })

      const filteredRooms = rooms.filter(r => r.jobs.length > 0)
      state.act.rooms = filteredRooms
    },
    setChangeView(state, payload) {
      state.changeView = payload
    },
    setMaximized(state, payload) {
      state.maximized = payload
    },
    setHoveredItem(state, payload) {
      state.hoveredItem = payload
    },
    setSelectedItem(state, payload) {
      state.selectedItem = payload
    },
    setShowLeftQuantity(state, payload) {
      state.showLeftQuantity = payload
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
      const { outlay: currentOutlay, acts } = state
      state.act = acts.find(act => act._id === payload._id)
      const clone = JSON.parse(JSON.stringify(currentOutlay.rooms))
      const actsData = acts.reduce((acc, act) => {
        const actRooms = clone.reduce((rooms, room) => {
          const roomClone = JSON.parse(JSON.stringify(room))
          const foundRoom = act.rooms.find(r => r.id === room.id)
          let jobs = []
          if (foundRoom) {
            jobs = foundRoom.jobs.map(getValuesInside).flat()
          }
          const data = roomClone.jobs.map(n =>
            setDefaultQuantityExcept(n, jobs),
          )
          rooms[room.id] = data
          return rooms
        }, {})
        acc[act._id] = actRooms
        return acc
      }, {})
      state.actsData = actsData
    },
    async fetchAll({ state, commit, dispatch }) {
      const { contentLoaded, loading } = state
      if (contentLoaded || loading) {
        return
      }
      state.loading = true
      try {
        const data = await ActService.getAll()
        commit('setActs', data)
        const localData = await idb.getCollectionData('acts')
        const { updated, created, removed } = ActService.getLocalDifference(
          data,
          localData,
        )
        await idb.setArrayToCollection('acts', data)
        await Promise.all(
          updated.map(async a => {
            const { _id: id, ...data } = a
            return await dispatch('updateLocalData', { id, data })
          }),
          created.map(async a => {
            return await dispatch('createLocalData', a)
          }),
          removed.map(async a => {
            return await dispatch('remove', a._id)
          }),
        )
        commit('setContentLoaded', true)
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        state.loading = false
      }
    },
    async create({ commit, state, dispatch }) {
      try {
        const { acts, outlay } = state
        const filteredActs = acts.filter(a => a.outlay === outlay._id)
        const nameWithNumber = getNameWithNumber(filteredActs)
        const response = await ActService.create(nameWithNumber, outlay._id)
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
        const { act, actsData, outlay } = state
        if (!act) {
          return
        }
        const data = prepareData(actsData, outlay, act)
        // отправка на сервер
        const response = await ActService.update(data)
        commit('updateById', { id: act._id, data: response.data })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async saveLocaly({ state, commit }) {
      try {
        // формирование данных
        const { act, actsData, outlay } = state
        if (!act) {
          return
        }
        const data = prepareData(actsData, outlay, act)
        await idb.saveDataInCollection('acts', {
          ...data,
          updatedAt: new Date(),
        })
        commit('updateById', { id: act._id, data })
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async update({ state, commit }, { id, data }) {
      try {
        const { actsData, outlay } = state
        if (!data) {
          return
        }
        const saveData = prepareData(actsData, outlay, data)
        const response = await ActService.update(saveData)
        commit('updateById', { id, data: response.data })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async updateLocalData({ commit }, { id, data }) {
      try {
        const response = await ActService.update({ _id: id, ...data })
        commit('updateById', { id, data: response.data })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async createLocalData({ commit }, act) {
      try {
        const response = await axios.post('/act', act)
        commit('pushAct', response.data)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async remove({ commit, dispatch, state }, payload) {
      try {
        const { acts } = state
        const act = acts.find(a => a._id === payload)
        const response = await ActService.remove(act)
        if (state.act && state.act._id === payload) {
          dispatch('setAct', null)
        }
        commit('removeById', payload)
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
  },
  getters: {
    acts: state => {
      const { outlay, acts } = state
      if (!outlay) {
        return []
      }
      return acts.filter(act => act.outlay === outlay._id)
    },
    activeTab: s => s.activeTab,
    activeRoom: s => s.activeRoom,
    act: s => s.act,
    outlay: s => s.outlay,
    roomsData: s => s.roomsData,
    showOnlyCompleted: s => s.showOnlyCompleted,
    completedValues: s => {
      const { acts, outlay, actsData } = s
      if (!outlay) {
        return {}
      }
      const { rooms } = outlay
      const actsDataTransformed = Object.entries(actsData).map(
        ([key, value]) => {
          const act = acts.find(act => act._id === key)
          const rooms = act.rooms.map(room => {
            return {
              ...room,
              jobs: value[room.id],
            }
          })
          return {
            ...act,
            rooms,
          }
        },
      )
      return actsDataTransformed.reduce((acc, act) => {
        const roomsData = rooms.reduce((acc, room) => {
          const found = act.rooms.find(r => r.id === room.id)
          const jobs = found ? found.jobs : []
          const clone = JSON.parse(JSON.stringify(jobs))
          const filtered = clone.filter(filterTreeByQuantity)
          const keys = filtered.map(treeToListOnlyKeys).flat()
          acc[room.id] = keys
          return acc
        }, {})
        acc[act._id] = roomsData
        return acc
      }, {})
    },
    actsData: s => s.actsData,
    changeView: s => s.changeView,
    maximized: s => s.maximized,
    hoveredItem: s => s.hoveredItem,
    selectedItem: s => s.selectedItem,
    showLeftQuantity: s => s.showLeftQuantity,
  },
}
