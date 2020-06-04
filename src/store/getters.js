const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  id: state => state.user.id,
  avatar_url: state => state.user.avatar_url,
  password: state => state.user.password,
  workcell_id: state => state.user.workcell_id,
  role: state => state.user.role,
  addRouters: state => state.permission.addRouters,
  routers: state => state.permission.routers
}
export default getters
