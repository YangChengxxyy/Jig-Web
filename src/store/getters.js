const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  id: state => state.user.token.user.id,
  avatar_url: state => state.user.token.user.avatar_url,
  password: state => state.user.token.user.password,
  workcell_id: state => state.user.token.user.workcell_id,
  role: state => state.user.token.user.type,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers
}
export default getters
