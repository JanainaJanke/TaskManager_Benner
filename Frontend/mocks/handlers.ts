import { rest } from 'msw'
import type { Task } from '@/types/task'
import type { AuthResponse } from '@/types/auth'

const API_BASE_URL = 'http://localhost:3001/api'

export const handlers = [
  // Auth endpoints
  rest.post<{ userName: string; password: string }>(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { userName, password } = req.body
    
    if (userName === 'admin' && password === '123456') {
      const response: AuthResponse = {
        success: true,
        user: {
          id: 1,
          name: 'Administrador',
          userName: 'admin',
        },
        token: 'fake-jwt-token'
      }
      return res(ctx.json(response))
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: 'Credenciais inválidas'
      })
    )
  }),

  // Todos endpoints
  rest.get(`${API_BASE_URL}/todos`, (req, res, ctx) => {
    const todos: Task[] = [
      {
        id: 1,
        title: 'Tarefa de Teste 1',
        description: 'Descrição da tarefa 1',
        completed: false,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        title: 'Tarefa de Teste 2',
        description: 'Descrição da tarefa 2',
        completed: true,
        createdAt: '2024-01-02T00:00:00Z'
      }
    ]

    return res(
      ctx.json({
        success: true,
        todos
      })
    )
  }),

  rest.post<{ title: string; description?: string }>(`${API_BASE_URL}/todos`, (req, res, ctx) => {
    const { title, description } = req.body
    
    const newTodo: Task = {
      id: Date.now(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString()
    }

    return res(
      ctx.json({
        success: true,
        todo: newTodo
      })
    )
  }),

  rest.put<{ title?: string; description?: string }>(`${API_BASE_URL}/todos/:id`, (req, res, ctx) => {
    const { id } = req.params
    const { title, description } = req.body
    
    const updatedTodo: Task = {
      id: parseInt(id as string),
      title: title || 'Tarefa Atualizada',
      description,
      completed: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }

    return res(
      ctx.json({
        success: true,
        todo: updatedTodo
      })
    )
  }),

  rest.delete(`${API_BASE_URL}/todos/:id`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Tarefa excluída com sucesso'
      })
    )
  }),

  rest.patch(`${API_BASE_URL}/todos/:id/toggle`, (req, res, ctx) => {
    const { id } = req.params
    
    const toggledTodo: Task = {
      id: parseInt(id as string),
      title: 'Tarefa Teste',
      description: 'Descrição teste',
      completed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }

    return res(
      ctx.json({
        success: true,
        todo: toggledTodo
      })
    )
  })
]