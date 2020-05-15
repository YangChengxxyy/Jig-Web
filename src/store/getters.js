const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  id: state => state.user.id,
  avatar_url: state => state.user.avatar_url,
  password: state => state.user.password,
  role: state => state.user.role
}
export default getters
