export interface User {
  id: number
  name: string
  userName: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  userName: string
  password: string
}

export interface RegisterData {
  name: string
  userName: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
  message?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (userData: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}