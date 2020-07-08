import defaultSettings from '@/settings'
import store from '@/store'
const { http } = defaultSettings
import { getWebSocket } from '@/utils/websocket'

const state = {
  ws: null
}
const mutations = {
  INIT_WEBSOCKET: (state, { role, id }) => {
    state.ws = getWebSocket(http, role, id)
  }
}
const actions = {
  initWebsocket({ commit }, { role, id }) {
    if (store.getters.websocket === null) {
      return new Promise((resolve, reject) => {
        commit('INIT_WEBSOCKET', { role: role, id: id })
        resolve()
      })
    }
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}

