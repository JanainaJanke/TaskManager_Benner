import React from 'react'
import TaskItem from './TaskItem'
import type { Task } from '@/types/task'

interface TaskListProps {
  Tasks: Task[]
  onEdit: (Task: Task) => void
  onDelete: (id: number) => void
  onToggle: (id: number) => void
}

const TaskList: React.FC<TaskListProps> = ({ Tasks, onEdit, onDelete, onToggle }) => {
  if (Tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma tarefa encontrada</h3>
        <p className="text-gray-500">Crie sua primeira tarefa para começar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Tasks.map((Task: Task) => (
        <TaskItem
          key={Task.id}
          Task={Task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

export default TaskList