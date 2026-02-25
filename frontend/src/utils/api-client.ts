import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { useNotificationStore } from '../store'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// API 端点集中管理
export const API_ENDPOINTS = {
  BOOKS: '/api/v1/books',
  PAPERS: '/api/v1/papers',
  QUOTES: '/api/v1/quotes',
  PROBLEMS: '/api/v1/problems',
  POMODORO: '/api/v1/pomodoro',
  RELAXATION_CHAT: '/api/v1/relaxation-chat',
  DOCUMENTS: '/api/v1/documents',
  RESOURCES: '/api/v1/resources',
  BRAINSTORM: '/api/v1/brainstorm',
  ERROR_QUESTIONS: '/api/v1/error-questions',
  ESSAYS: '/api/v1/essays',
} as const

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    })
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: AxiosError) {
    const { addNotification } = useNotificationStore.getState()

    if (error.response) {
      const status = error.response.status
      const data = error.response.data as Record<string, string>
      const messages: Record<number, string> = {
        400: data?.message || '请求无效',
        401: '请先登录',
        403: '没有权限执行此操作',
        404: data?.message || '资源未找到',
        429: '请求过于频繁，请稍后再试',
      }
      const message = messages[status] || (status >= 500 ? '服务器错误，请稍后再试' : data?.message || '发生未知错误')
      addNotification({ type: status === 429 ? 'warning' : 'error', message })

      if (status === 401) {
        localStorage.removeItem('auth_token')
      }
    } else if (error.request) {
      addNotification({ type: 'error', message: '网络错误，请检查网络连接' })
    } else {
      addNotification({ type: 'error', message: error.message || '发生未知错误' })
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new APIClient()
export default apiClient
