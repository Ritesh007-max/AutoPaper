import axios from 'axios'

import { clearAuthSession, getStoredAuth } from '../utils/auth'

export const getApiBaseUrl = () => {
  const configuredBaseUrl = String(
    import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_ORIGIN ||
      '',
  ).trim()

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '')
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }

  return window.location.origin
}

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
  const client = axios.create({
    baseURL: new URL(baseURL, `${getApiBaseUrl()}/`).toString().replace(/\/+$/, ''),
  })

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
