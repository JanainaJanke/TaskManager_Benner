import { TaskService } from '@/services/TaskService'
import type { CreateTaskData, UpdateTaskData } from '@/types/Task'

// Mock do api
jest.mock('@/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn()
}))

import api from '@/services/api'

const mockApi = api as jest.Mocked<typeof api>

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTasks', () => {
    test('should fetch Tasks successfully', async () => {
      const mockTasks = [
        { id: 1, title: 'Test Task 1', completed: false, createdAt: '2024-01-01T00:00:00Z' },
        { id: 2, title: 'Test Task 2', completed: true, createdAt: '2024-01-02T00:00:00Z' }
      ]

      mockApi.get.mockResolvedValue({ data: { Tasks: mockTasks } })

      const result = await TaskService.getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/Tasks')
      expect(result).toEqual({ Tasks: mockTasks })
    })

    test('should handle error when fetching Tasks', async () => {
      const errorMessage = 'Network Error'
      mockApi.get.mockRejectedValue(new Error(errorMessage))

      await expect(TaskService.getTasks()).rejects.toThrow(errorMessage)
    })
  })

  describe('createTask', () => {
    test('should create Task successfully', async () => {
      const TaskData: CreateTaskData = { title: 'New Task', description: 'Description' }
      const mockResponse = { Task: { id: 1, ...TaskData, completed: false, createdAt: '2024-01-01T00:00:00Z' } }

      mockApi.post.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.createTask(TaskData)

      expect(mockApi.post).toHaveBeenCalledWith('/Tasks', TaskData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateTask', () => {
    test('should update Task successfully', async () => {
      const TaskId = 1
      const TaskData: UpdateTaskData = { title: 'Updated Task' }
      const mockResponse = { Task: { id: TaskId, ...TaskData, completed: false, createdAt: '2024-01-01T00:00:00Z' } }

      mockApi.put.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.updateTask(TaskId, TaskData)

      expect(mockApi.put).toHaveBeenCalledWith(`/Tasks/${TaskId}`, TaskData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteTask', () => {
    test('should delete Task successfully', async () => {
      const TaskId = 1
      const mockResponse = { success: true, message: 'Task deleted successfully' }

      mockApi.delete.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.deleteTask(TaskId)

      expect(mockApi.delete).toHaveBeenCalledWith(`/Tasks/${TaskId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('toggleTask', () => {
    test('should toggle Task status successfully', async () => {
      const TaskId = 1
      const mockResponse = { 
        Task: { 
          id: TaskId, 
          title: 'Test Task',
          completed: true, 
          createdAt: '2024-01-01T00:00:00Z'
        } 
      }

      mockApi.patch.mockResolvedValue({ data: mockResponse })

      const result = await TaskService.toggleTask(TaskId)

      expect(mockApi.patch).toHaveBeenCalledWith(`/Tasks/${TaskId}/toggle`)
      expect(result).toEqual(mockResponse)
    })
  })
})
})