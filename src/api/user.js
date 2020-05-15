import request from '@/utils/request'
import axios from 'axios'
export function login(data) {
  return axios.get('/login_check', {
    params: data
  })
}

export function getInfo(token) {
  const { id, password, workcell_id } = token
  return axios.get('/login_check', {
    params: {
      id: id,
      password: password,
      workcell_id: workcell_id
    }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
