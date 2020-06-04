import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import store from '@/store'

const getDefaultState = () => {
  return {
    token: getToken(),
    id: '',
    password: '',
    workcell_id: '',
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
  SET_WORKCELLID: (state, workcell_id) => {
    state.workcell_id = workcell_id
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
        console.log(response)
        const { data } = response
        if (data.stateCode === 0) {
          commit('SET_TOKEN', { token: data.token, role: data.user.type })
          commit('SET_ID', data.user.id)
          commit('SET_PASSWORD', data.user.password)
          commit('SET_WORKCELLID', data.user.workcell_id)
          commit('SET_AVATAR_URL', data.user.avatar_url)
          commit('SET_ROLE', data.user.type)
          setToken(data.token)
          resolve()
        } else {
          reject()
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      console.log('state')
      console.log(state)
      getInfo({ id: state.id, password: state.password, workcell_id: state.workcell_id }).then(response => {
        console.log('data')
        const { data } = response
        console.log(data)
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        commit('SET_TOKEN', { token: data.token, role: data.user.type })
        commit('SET_ID', data.user.id)
        commit('SET_PASSWORD', data.user.password)
        commit('SET_WORKCELLID', data.user.workcell_id)
        commit('SET_AVATAR_URL', data.user.avatar_url)
        commit('SET_ROLE', data.user.type)
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
        store.dispatch('ResetRoutes')
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

