import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class ApiService {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5018/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-storage')
        if (token) {
          try {
            const authData = JSON.parse(token)
            if (authData?.state?.token) {
              config.headers.Authorization = `Bearer ${authData.state.token}`
            }
          } catch (error) {
            console.error('Erro ao parsear token:', error)
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        console.error('❌ Erro na resposta da API:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })
        
        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config)
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config)
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    console.log(`🔄 PUT Request:`, {
      url: `${this.instance.defaults.baseURL}${url}`,
      data
    })
    
    const response = await this.instance.put<T>(url, data, config)
    
    console.log(`✅ PUT Response:`, response.data)
    return response
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config)
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config)
  }
}

const api = new ApiService()
export default api