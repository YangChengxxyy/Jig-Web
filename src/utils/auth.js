import Cookies from 'js-cookie'

const TokenKey = 'jig_web'

export function getToken() {
  const token = Cookies.get(TokenKey)
  return JSON.parse((token == null || false) ? null : token)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
