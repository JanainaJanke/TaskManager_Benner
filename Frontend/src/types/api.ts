import type { Task } from './task'

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

export interface TaskResponse extends Task {}

export interface TasksResponse extends Array<Task> {}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}