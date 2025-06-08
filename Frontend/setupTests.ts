import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Estabelecer requisições de API mock antes de todos os testes
beforeAll(() => server.listen())

// Resetar handlers para que não afetem outros testes
afterEach(() => server.resetHandlers())

// Limpar depois que os testes terminarem
afterAll(() => server.close())