import api from './api'
import type { Task, CreateTaskData, UpdateTaskData } from '@/types/task'
import type { TaskResponse, TasksResponse } from '@/types/api'

export class TaskServiceClass {
  async getTasks(): Promise<TasksResponse> {
    // Sua API retorna array direto
    const response = await api.get<TasksResponse>('/tasks')
    return response.data
  }
  
  async getTaskById(id: string): Promise<TaskResponse> {
    const response = await api.get<TaskResponse>(`/tasks/${id}`)
    return response.data
  }
  
  async createTask(taskData: CreateTaskData): Promise<TaskResponse> {
    // Sua API espera CreateTaskItemCommand
    const response = await api.post<TaskResponse>('/tasks', taskData)
    return response.data
  }
  
  async updateTask(id: string, taskData: UpdateTaskData): Promise<TaskResponse> {
    // Sua API espera UpdateTaskItemCommand com ID na rota e no body
    const updateCommand = {
      id,
      ...taskData
    }
    const response = await api.put<TaskResponse>(`/tasks/${id}`, updateCommand)
    return response.data
  }
  
  async deleteTask(id: string): Promise<void> {
    // Sua API retorna 204 No Content
    await api.delete(`/tasks/${id}`)
  }
  
  async toggleTask(currentTask: Task): Promise<TaskResponse> {
    
    try {
      // Criar objeto completo para enviar à API
      const completeTaskData = {
        id: currentTask.id,
        title: currentTask.title,
        description: currentTask.description || '',
        dueDate: currentTask.dueDate || null,
        isCompleted: !currentTask.isCompleted,  // Inverter status
        userId: currentTask.userId
      }
      
      const response = await api.put<TaskResponse>(`/tasks/${currentTask.id}`, completeTaskData)
      return response
    } catch (error) {
      console.error('❌ Error toggling task:', error)
      throw error
    }
  }
}

export const taskService = new TaskServiceClass()