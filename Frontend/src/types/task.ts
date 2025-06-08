
export interface Task {
  id: string 
  title: string
  description?: string
  dueDate: string
  isCompleted: boolean
  createdAt: string
  updatedAt?: string
  userId: string
}

export interface CreateTaskData {
  title: string
  description?: string
  dueDate: string
}

export interface UpdateTaskData {
  id: string
  title?: string
  description?: string
  dueDate?: string
  isCompleted?: boolean
}

export type TaskFilter = 'all' | 'pending' | 'completed'

export interface TaskState {
  tasks: Task[]
  filter: TaskFilter
  loading: boolean
  error: string | null
  setTasks: (tasks: Task[]) => void
  setFilter: (filter: TaskFilter) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updatedTask: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  getFilteredTasks: () => Task[]
}