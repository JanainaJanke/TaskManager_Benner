import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import toast from 'react-hot-toast'
import type { LoginCredentials } from '@/types/auth'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginCredentials>()

  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    try {
      const response = await authService.login(data)
      
      if (response.success) {
        login(response.token)
        toast.success('Login realizado com sucesso!')
        
        // Aguardar um pouco para o estado ser atualizado
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 100)
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      
      // Tratar diferentes tipos de erro SEM redirecionar
      if (error.response) {
        // Erro da API
        const status = error.response.status
        const message = error.response.data?.message || 'Erro no servidor'
        
        switch (status) {
          case 401:
            toast.error('Credenciais inválidas')
            break
          case 404:
            toast.error('Servidor não encontrado')
            break
          case 500:
            toast.error('Erro interno do servidor')
            break
          default:
            toast.error(message)
        }
      } else if (error.request) {
        // Erro de rede
        toast.error('Erro de conexão. Verifique se a API está rodando.')
      } else {
        // Outro erro
        toast.error('Erro inesperado')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça login em sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesse o sistema de gerenciamento de tarefas
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Usuário"
              type="text"
              placeholder="Digite seu usuário"
              {...register('userName', {
                required: 'Usuário é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Usuário deve ter pelo menos 3 caracteres'
                }
              })}
              error={errors.userName?.message}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres'
                }
              })}
              error={errors.password?.message}
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login