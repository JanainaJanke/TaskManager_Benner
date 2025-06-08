import { create } from 'zustand'
import type { TaskState, Task, TaskFilter } from '@/types/task'

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: 'all',
  loading: false,
  error: null,
  
  setTasks: (tasks: Task[]): void => set({ tasks }),
  
  setFilter: (filter: TaskFilter): void => set({ filter }),
  
  setLoading: (loading: boolean): void => set({ loading }),
  
  setError: (error: string | null): void => set({ error }),
  
  addTask: (task: Task): void => set(state => ({
    tasks: [...state.tasks, task]
  })),
  
  updateTask: (id: string, updatedTask: Partial<Task>): void => set(state => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    )
  })),
  
  deleteTask: (id: string): void => set(state => ({
    tasks: state.tasks.filter(task => task.id !== id)
  })),
  
  toggleTask: (id: string): void => set(state => ({
    tasks: state.tasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    )
  })),
  
  getFilteredTasks: (): Task[] => {
    const { tasks, filter } = get()
    switch (filter) {
      case 'pending':
        return tasks.filter(task => !task.isCompleted)
      case 'completed':
        return tasks.filter(task => task.isCompleted)
      default:
        return tasks
    }
  }
}))