import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    id: '',
    password: '',
    avatar_url: '',
    role: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_PASSWORD: (state, password) => {
    state.password = password
  },
  SET_AVATAR_URL: (state, avatar_url) => {
    state.avatar_url = avatar_url
  },
  SET_ROLE: (state, role) => {
    state.role = role
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password, workcell_id } = userInfo
    return new Promise((resolve, reject) => {
      login({ id: username.trim(), password: password, workcell_id: workcell_id }).then(response => {
        const { data } = response
        if (data.stateCode === 0) {
          commit('SET_TOKEN', { id: data.data.id, password: data.data.password, workcell_id: data.data.workcell_id })
          setToken({ id: data.data.id, password: data.data.password, workcell_id: data.data.workcell_id })
          resolve()
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const { id, password, avatar_url, type } = data.data
        commit('SET_ID', id)
        commit('SET_PASSWORD', password)
        commit('SET_AVATAR_URL', avatar_url)
        commit('SET_ROLE', type)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

