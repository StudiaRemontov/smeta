// import axios from '../../axios/index.js'

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
    outlay: {},
    room: null,
    activeData: null,
  },
  mutations: {
    setOutlay(state, payload) {
      state.outlay = JSON.parse(JSON.stringify(payload))
    },
    setActiveData(state, payload) {
      state.activeData = payload
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
    selectRoom(state, roomId) {
      if (!state.outlay) return
      state.room = roomId
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

      const room = state.outlay.rooms.find(r => r.id === state.room)
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
  },
  actions: {},
  getters: {
    outlay: s => s.outlay,
    room: s => {
      if (!s.outlay || !s.room) return null
      return s.outlay.rooms.find(r => r.id === s.room)
    },
    activeData: s => s.activeData,
  },
}
