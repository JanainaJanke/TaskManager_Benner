import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from '@/components/TaskForm'
import type { Task } from '@/types/Task'

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  test('renders form fields correctly', () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    )

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar tarefa/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  test('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    )

    const submitButton = screen.getByRole('button', { name: /criar tarefa/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    })
  })

  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    )

    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descrição/i)
    const submitButton = screen.getByRole('button', { name: /criar tarefa/i })

    await user.type(titleInput, 'Test Task')
    await user.type(descriptionInput, 'Test Description')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description'
      })
    })
  })

  test('populates form when editing Task', () => {
    const Task: Task = {
      id: 1,
      title: 'Existing Task',
      description: 'Existing Description',
      completed: false,
      createdAt: '2024-01-01T00:00:00Z'
    }

    render(
      <TaskForm Task={Task} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    )

    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    )

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })
})