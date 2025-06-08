import api from './api'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  nameid: string
  unique_name: string
  given_name?: string
  email?: string
  exp: number
  iat: number
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user: User; token: string; message?: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      
      const { token } = response.data
      
      // Decodificar JWT para extrair dados do usuário
      const decoded = jwtDecode<JwtPayload>(token)
      
      const user: User = {
        id: decoded.nameid,
        name: decoded.given_name || decoded.unique_name,
        userName: decoded.unique_name,
        email: decoded.email
      }
      
      return {
        success: true,
        user,
        token,
        message: 'Login realizado com sucesso'
      }
    } catch (error: any) {
      console.error('❌ Erro no authService.login:', error)
      
      // NÃO fazer redirecionamento aqui
      // Apenas lançar o erro para ser tratado no componente
      throw error
    }
  }
  
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData)
    return response.data
  }
  
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile')
    return response.data
  }
  
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh')
    return response.data
  }
}

export const authService = new AuthService()