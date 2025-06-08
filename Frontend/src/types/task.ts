
export interface Task {
  id: string  // ← Mudado para string (Guid)
  title: string
  description?: string
  dueDate: string  // ← Nova propriedade para data de vencimento  
  isCompleted: boolean  // ← Pode ser que sua API use isCompleted
  createdAt: string
  updatedAt?: string
  userId: string  // ← Guid como string
}

export interface CreateTaskData {
  title: string
  description?: string
  dueDate: string  // ← Nova propriedade
  // userId será adicionado automaticamente no backend
}

export interface UpdateTaskData {
  id: string  // ← Necessário para o comando
  title?: string
  description?: string
  dueDate?: string  // ← Nova propriedade
  isCompleted?: boolean
  // userId será adicionado automaticamente no backend
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