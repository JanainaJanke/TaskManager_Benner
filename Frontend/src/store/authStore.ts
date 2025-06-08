import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '@/types/auth'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  nameid: string
  unique_name: string
  given_name?: string
  email?: string
  exp: number
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (token: string): void => {
        try {
          console.log('🔑 Recebendo token:', token)
          
          // Decodificar token para extrair dados do usuário
          const decoded = jwtDecode<JwtPayload>(token)
          console.log('🔍 Token decodificado:', decoded)
          
          const user: User = {
            id: decoded.nameid,
            name: decoded.given_name || decoded.unique_name,
            userName: decoded.unique_name,
            email: decoded.email
          }
          
          console.log('👤 Usuário extraído:', user)
          
          set({
            user,
            token,
            isAuthenticated: true
          })
          
          console.log('✅ Estado atualizado:', get())
        } catch (error) {
          console.error('❌ Erro ao decodificar token:', error)
        }
      },
      
      logout: (): void => {
        console.log('🚪 Logout realizado')
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },
      
      updateUser: (userData: Partial<User>): void => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null
        }))
      }
    }),
    {
      name: 'auth-storage',
      // Debug do storage
      onRehydrateStorage: (state) => {
        console.log('💾 Recuperando estado do localStorage:', state)
        return (state, error) => {
          if (error) {
            console.log('❌ Erro ao recuperar estado:', error)
          } else {
            console.log('✅ Estado recuperado com sucesso:', state)
          }
        }
      }
    }
  )
)