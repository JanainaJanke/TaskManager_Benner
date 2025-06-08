import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login'

// Mock do hook de navegação
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

// Mock do toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}))

const LoginWrapper: React.FC = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
)

describe('Login Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  test('renders login form correctly', () => {
    render(<LoginWrapper />)

    expect(screen.getByText(/faça login em sua conta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/userName/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  test('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    
    render(<LoginWrapper />)

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/usuário é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
    })
  })

  test('shows validation error for invalid userName', async () => {
    const user = userEvent.setup()
    
    render(<LoginWrapper />)

    const userNameInput = screen.getByLabelText(/usuário/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(userNameInput, 'invalid-userName')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/usuário inválido/i)).toBeInTheDocument()
    })
  })

  test('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    
    render(<LoginWrapper />)

    const userNameInput = screen.getByLabelText(/usuário/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(userNameInput, 'test')
    await user.type(passwordInput, '123456')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})