import axios from 'axios'
import Cookie from 'js-cookie'

const adminAxios = axios.create({
  baseURL: 'https://backend.lipsempirebyarielle.store/api/v1/',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

adminAxios.interceptors.request.use((config) => {
  const token = Cookie.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default adminAxios
