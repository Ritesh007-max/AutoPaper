import axios from 'axios'

import { clearAuthSession, getStoredAuth } from '../utils/auth'

const getAuthHeaders = () => {
  const storedAuth = getStoredAuth()

  if (!storedAuth?.token) {
    return {}
  }

  return {
    Authorization: `Bearer ${storedAuth.token}`,
  }
}

export const createApiClient = (baseURL) => {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    config.headers = {
      ...config.headers,
      ...getAuthHeaders(),
    }

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuthSession()
      }

      return Promise.reject(error)
    },
  )

  return client
}
