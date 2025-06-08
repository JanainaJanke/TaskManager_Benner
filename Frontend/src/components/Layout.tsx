import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Button from './common/Button'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = (): void => {
    logout()
    toast.success('Logout realizado com sucesso!')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Tarefas
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-700">
                  Olá, {user.name}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout