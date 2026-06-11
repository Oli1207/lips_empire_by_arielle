import axios from 'axios'
import Cookie from 'js-cookie'
import { setAuthUser, getRefreshToken, logout } from './auth'

const adminAxios = axios.create({
  baseURL: 'https://backend.lipsempirebyarielle.store/api/v1/',
  timeout: 30000,
  headers: { Accept: 'application/json' },
})

adminAxios.interceptors.request.use((config) => {
  const token = Cookie.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { access } = await getRefreshToken()
        Cookie.set('access_token', access, { expires: 1, secure: true })
        setAuthUser(access, Cookie.get('refresh_token'))
        original.headers.Authorization = `Bearer ${access}`
        return adminAxios(original)
      } catch {
        logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default adminAxios
