import type { Task } from './task'

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

// Sua API retorna task diretamente, não em objeto wrapper
export interface TaskResponse extends Task {}

// Sua API retorna array de tasks diretamente
export interface TasksResponse extends Array<Task> {}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}