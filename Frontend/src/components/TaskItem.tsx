import React from 'react'
import Button from './common/Button'
import type { Task } from '@/types/task'

interface TaskItemProps {
  Task: Task
  onEdit: (Task: Task) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

const TaskItem: React.FC<TaskItemProps> = ({ Task, onEdit, onDelete, onToggle }) => {
  const handleToggle = (): void => {
    onToggle(Task.id)
  }

  const handleEdit = (): void => {
    onEdit(Task)
  }

  const handleDelete = (): void => {
    onDelete(Task.id)
  }

  // Função para criar data local sem problemas de timezone
  const createLocalDateFromISO = (isoString: string): Date => {
    // Extrair apenas a parte da data (YYYY-MM-DD)
    const dateOnly = isoString.split('T')[0]
    const [year, month, day] = dateOnly.split('-').map(Number)
    return new Date(year, month - 1, day) // month é 0-indexed
  }

  // Função para verificar se a tarefa está atrasada
  const isOverdue = (): boolean => {
    if (!Task.dueDate || Task.isCompleted) return false
    
    const dueDate = createLocalDateFromISO(Task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetar horas para comparar apenas data
    
    return dueDate < today
  }

  // Função para verificar se vence hoje
  const isDueToday = (): boolean => {
    if (!Task.dueDate) return false
    
    const dueDate = createLocalDateFromISO(Task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return dueDate.getTime() === today.getTime()
  }

  // Formatar data para exibição
  const formatDate = (isoString: string): string => {
    const date = createLocalDateFromISO(isoString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={`bg-white p-4 rounded-lg border ${
      Task.isCompleted ? 'opacity-75' : ''
    } ${
      isOverdue() ? 'border-red-300 bg-red-50' : ''
    } ${
      isDueToday() && !Task.isCompleted ? 'border-yellow-300 bg-yellow-50' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={Task.isCompleted}
            onChange={handleToggle}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <h3 className={`font-medium ${Task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {Task.title}
            </h3>
            
            {Task.description && (
              <p className={`mt-1 text-sm ${Task.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                {Task.description}
              </p>
            )}
            
            {/* Data de vencimento - CORRIGIDA */}
            {Task.dueDate && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  Task.isCompleted 
                    ? 'bg-gray-100 text-gray-500'
                    : isOverdue()
                    ? 'bg-red-100 text-red-800'
                    : isDueToday()
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  📅 {formatDate(Task.dueDate)}
                  {isOverdue() && !Task.isCompleted && ' (Atrasada)'}
                  {isDueToday() && !Task.isCompleted && ' (Vence hoje)'}
                </span>
              </div>
            )}
            
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                Task.isCompleted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {Task.isCompleted ? 'Concluída' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            disabled={Task.isCompleted}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem