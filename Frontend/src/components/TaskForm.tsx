import React, { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Button from './common/Button'
import Input from './common/Input'
import DatePicker from './common/DatePicker'
import type { Task, CreateTaskData } from '@/types/task'

interface TaskFormData {
  title: string
  description: string
  dueDate: string
}

interface TaskFormProps {
  Task?: Task
  onSubmit: (data: CreateTaskData) => Promise<void>
  onCancel: () => void
}

const TaskForm: React.FC<TaskFormProps> = ({ Task, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<TaskFormData>()

  const watchedDueDate = watch('dueDate')

  // Função para converter data local para string de data (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Função para criar data local sem problemas de timezone
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day) // month é 0-indexed
  }

  // Função para converter data local para ISO string (sem alterar timezone)
  const formatDateForAPI = (dateString: string): string => {
    const localDate = createLocalDate(dateString)
    // Criar ISO string mantendo a data local (sem conversão de timezone)
    const year = localDate.getFullYear()
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0')
    const day = localDate.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}T00:00:00.000Z`
  }

  useEffect(() => {
    if (Task) {
      setValue('title', Task.title)
      setValue('description', Task.description || '')
      
      if (Task.dueDate) {
        // Extrair apenas a parte da data (YYYY-MM-DD) do ISO string
        const dateOnly = Task.dueDate.split('T')[0]
        setValue('dueDate', dateOnly)
      }
    } else {
      reset()
    }
  }, [Task, setValue, reset])

  const onFormSubmit: SubmitHandler<TaskFormData> = async (data) => {
    try {
      const submitData: CreateTaskData = {
        title: data.title,
        description: data.description || undefined,
        dueDate: formatDateForAPI(data.dueDate)
      }
      
      await onSubmit(submitData)
      
      if (!Task) {
        reset()
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
    }
  }

  // Validar se a data não é no passado
  const validateDate = (value: string) => {
    if (!value || value.trim() === '') {
      return 'Data de vencimento é obrigatória'
    }
    
    const selectedDate = createLocalDate(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      return 'A data de vencimento não pode ser no passado'
    }
    
    return true
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Título"
        placeholder="Digite o título da tarefa"
        {...register('title', { 
          required: 'Título é obrigatório',
          minLength: { value: 3, message: 'Título deve ter pelo menos 3 caracteres' }
        })}
        error={errors.title?.message}
        required
      />

      <div className="flex flex-col">
        <label className="mb-2 text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          placeholder="Digite a descrição da tarefa (opcional)"
          {...register('description')}
          className="input-field resize-none h-24"
          rows={3}
        />
        {errors.description && (
          <span className="mt-1 text-sm text-red-600">{errors.description.message}</span>
        )}
      </div>

      <DatePicker
        label="Data de Vencimento"
        {...register('dueDate', {
          required: 'Data de vencimento é obrigatória',
          validate: validateDate
        })}
        error={errors.dueDate?.message}
        placeholder="Selecione uma data"
        required
      />

      {/* Preview da data selecionada - CORRIGIDO */}
      {watchedDueDate && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            📅 <strong>Data de vencimento:</strong> {' '}
            {createLocalDate(watchedDueDate).toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : Task ? 'Atualizar' : 'Criar Tarefa'}
        </Button>
      </div>
    </form>
  )
}

export default TaskForm