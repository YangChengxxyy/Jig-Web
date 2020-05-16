import { constantRoutes, permissionRouter } from '@/router/index'

// function hasPermission(roles, route) {
//   if (route.meta && route.meta.role) {
//     return roles.some(role => route.meta.role.indexOf(role) >= 0)
//   } else {
//     return true
//   }
// }

const permission = {
  state: {
    routers: constantRoutes,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRoutes.concat(routers)
    },
    RESET_ROUTERS: (state) => {
      state.addRouters = []
      state.routers = constantRoutes
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        const accessedRouters = permissionRouter.filter(v => {
          return v.meta.role.indexOf(roles) >= 0
        })
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    },
    ResetRoutes({ commit }, data) {
      return new Promise(resolve => {
        commit('RESET_ROUTERS')
      })
    }
  }
}

export default permission
