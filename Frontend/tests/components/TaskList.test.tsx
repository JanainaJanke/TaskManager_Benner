import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskList from '@/components/TaskList'
import type { Task } from '@/types/Task'

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Test Task 1',
      description: 'Test Description 1',
      completed: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Test Description 2',
      completed: true,
      createdAt: '2024-01-02T00:00:00Z'
    }
  ]

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onToggle: jest.fn()
  }

  beforeEach(() => {
    Object.values(mockHandlers).forEach(mock => mock.mockClear())
  })

  test('renders Task items correctly', () => {
    render(
      <TaskList Tasks={mockTasks} {...mockHandlers} />
    )

    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    expect(screen.getByText('Test Task 2')).toBeInTheDocument()
    expect(screen.getByText('Test Description 1')).toBeInTheDocument()
    expect(screen.getByText('Test Description 2')).toBeInTheDocument()
  })

  test('shows empty state when no Tasks', () => {
    render(
      <TaskList Tasks={[]} {...mockHandlers} />
    )

    expect(screen.getByText(/nenhuma tarefa encontrada/i)).toBeInTheDocument()
  })

  test('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskList Tasks={mockTasks} {...mockHandlers} />
    )

    const editButtons = screen.getAllByText(/editar/i)
    await user.click(editButtons[0])

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTasks[0])
  })

  test('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskList Tasks={mockTasks} {...mockHandlers} />
    )

    const deleteButtons = screen.getAllByText(/excluir/i)
    await user.click(deleteButtons[0])

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(1)
  })

  test('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TaskList Tasks={mockTasks} {...mockHandlers} />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(mockHandlers.onToggle).toHaveBeenCalledWith(1)
  })
})