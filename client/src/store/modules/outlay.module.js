import axios from '../../axios/index.js'

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

export default {
  namespaced: true,
  state: {
    outlay: null,
    room: null,
    activeData: null,
    nodeList: null,
    roots: null,
  },
  mutations: {
    setOutlay(state, payload) {
      state.outlay = JSON.parse(JSON.stringify(payload))
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
      state.room = room.id
    },
    selectRoom(state, { id, showOnlySelected = false }) {
      if (!state.outlay) return
      state.room = {
        id,
        showOnlySelected,
      }
    },
    updateRoom(state, payload) {
      if (!state.outlay || !state.room) return
      state.outlay.rooms = state.outlay.rooms.map(r => {
        if (r.id === state.room) {
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
      if (!state.room) return

      const room = state.outlay.rooms.find(r => r.id === state.room.id)
      if (!room) return
      const isExists = !!room.jobs.find(key => key === job.key)
      if (isExists) return
      room.jobs.push(job.key)
    },
    unselectJob(state, job) {
      if (!state.room) return

      const room = state.outlay.rooms.find(r => r.id === state.room.id)
      if (!room) return
      if (job.children && job.children.length > 0) {
        const isEmpty = job.children.find(n =>
          room.jobs.find(key => key === n.key),
        )
        if (isEmpty) return
      }
      room.jobs = room.jobs.filter(key => key !== job.key)
    },
    pushNodeAfter(state, { node, index }) {
      const newArr = [
        ...state.nodeList.slice(0, index),
        {
          ...node,
          key: Date.now() + '',
        },
        ...state.nodeList.slice(index),
      ]
      state.nodeList = newArr
    },
  },
  actions: {
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
  },
  getters: {
    outlay: s => s.outlay,
    room: s => {
      if (!s.outlay || !s.room) return null
      return s.outlay.rooms.find(r => r.id === s.room.id)
    },
    activeData: s => s.activeData,
    showOnlySelected: s => s.room?.showOnlySelected,
    nodeList: s => s.nodeList,
    roots: s => s.roots,
  },
}
