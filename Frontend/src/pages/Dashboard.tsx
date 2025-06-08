import React, { useState, useEffect } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { taskService } from '@/services/taskService'
import Layout from '@/components/Layout'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import toast from 'react-hot-toast'
import type { Task, CreateTaskData, TaskFilter } from '@/types/task'

interface FilterOption {
  value: TaskFilter
  label: string
  count: number
}

const Dashboard: React.FC = () => {
  const {
    tasks,
    filter,
    loading,
    setTasks,
    setFilter,
    setLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getFilteredTasks
  } = useTaskStore()

  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async (): Promise<void> => {
    setLoading(true)
    try {
      const tasks = await taskService.getTasks()  // ← Retorna array direto
      setTasks(tasks)
    } catch (error: any) {
      toast.error('Erro ao carregar tarefas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (data: CreateTaskData): Promise<void> => {
    try {
      const task = await taskService.createTask(data)  // ← Retorna task direto
      addTask(task)
      setShowModal(false)
      toast.success('Tarefa criada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao criar tarefa')
      throw error
    }
  }

  const handleUpdateTask = async (data: CreateTaskData): Promise<void> => {
    if (!editingTask) return

    try {
      const updatedTask = await taskService.updateTask(editingTask.id, {
        id: editingTask.id,
        ...data
      })
      updateTask(editingTask.id, updatedTask)
      setEditingTask(null)
      setShowModal(false)
      toast.success('Tarefa atualizada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao atualizar tarefa')
      throw error
    }
  }

  const handleDeleteTask = async (id: string): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await taskService.deleteTask(id)  // ← Retorna void (204)
        deleteTask(id)
        toast.success('Tarefa excluída com sucesso!')
      } catch (error: any) {
        toast.error('Erro ao excluir tarefa')
      }
    }
  }

// MÉTODO TOGGLE CORRIGIDO - PASSA TAREFA COMPLETA
const handleToggleTask = async (id: string): Promise<void> => {
  try {
    // Encontrar a tarefa atual para saber o status
    const currentTask = tasks.find(task => task.id === id)
    if (!currentTask) {
      toast.error('Tarefa não encontrada')
      return
    }

    console.log(`🔄 Toggling task: ${currentTask.title} from ${currentTask.isCompleted} to ${!currentTask.isCompleted}`)

    // Chamar API com tarefa completa
    const updatedTask = await taskService.toggleTask(currentTask)
    
    // Atualizar store local
    toggleTask(id)
    
    // Mostrar mensagem de sucesso
    toast.success(
      updatedTask.data.isCompleted 
        ? `✅ Tarefa "${currentTask.title}" concluída!` 
        : `🔄 Tarefa "${currentTask.title}" reaberta!`
    )
  } catch (error: any) {
    console.error('❌ Erro ao alterar status da tarefa:', error)
    
    // Mensagens de erro mais específicas
    if (error.response?.status === 404) {
      toast.error('Tarefa não encontrada')
    } else if (error.response?.status === 400) {
      toast.error('Dados inválidos. Verifique os campos obrigatórios.')
    } else if (error.response?.status === 403) {
      toast.error('Você não tem permissão para alterar esta tarefa')
    } else if (error.response?.status === 401) {
      toast.error('Sessão expirada. Faça login novamente')
    } else {
      toast.error('Erro ao alterar status da tarefa. Tente novamente.')
    }
  }
}

  const handleEditTask = (task: Task): void => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingTask(null)
  }

  const filteredTasks = getFilteredTasks()

  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'Todas', count: tasks.length },
    { value: 'pending', label: 'Pendentes', count: tasks.filter(t => !t.isCompleted).length },
    { value: 'completed', label: 'Concluídas', count: tasks.filter(t => t.isCompleted).length }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Tarefas</h1>
            <p className="text-gray-600">Gerencie suas tarefas diárias</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            Nova Tarefa
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex space-x-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <TaskList
            Tasks={filteredTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggle={handleToggleTask}
          />
        </div>

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        >
          <TaskForm
            Task={editingTask || undefined}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </Layout>
  )
}

export default Dashboard