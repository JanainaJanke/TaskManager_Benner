# Gerenciamento de tarefas com API .NET Core e Frontend React

.NET 8
React 18
TypeScript 5
SQLite 3

## 📋 Índice
Sobre o Projeto
Pré-requisitos
Estrutura do Projeto
Instalação e Configuração
Executando a Aplicação
API Documentation
Testes
Docker
Próximos passos

## 🎯 Sobre o Projeto
Sistema de gerenciamento de tarefas (Task Manager) desenvolvido com:

- Backend: API RESTful em .NET 8 com Clean Architecture
- Frontend: Interface React com Vite, TypeScript e Tailwind CSS
- Banco: SQLite com Entity Framework Core
- Autenticação: JWT (JSON Web Tokens)

### ✨ Funcionalidades
🔐 Autenticação JWT
➕ Criar, editar e excluir tarefas
✅ Marcar tarefas como concluídas
🔍 Filtrar tarefas (todas, pendentes, concluídas)
📅 Gerenciar datas de vencimento
📱 Interface responsiva

## Escolhas da estrutura:
### Backend
- Clean Architecture - permite a estruturação de códigos em camadas, onde a mais interna é independente de frameworks e das demais. Facilita os testes, isolando regras de negócio, fluxo de dados, ect.
- Para validação de senhas é usado Argon2 (algoritmo de hash de senha mais moderno e robusto) através da biblioteca Isopoh.Cryptography.Argon2 (esta facilita o gerenciamento do salt e do hash).

### Frontend
- React com Vite - permite uma rápida inicialização, gerando uma performance diferenciada
- Tailwind CSS - facilidade para uso de estilização

### Banco
- SQLite com Entity Framework Core - pela facilidade de uso no atual caso, não sendo necessário efetuar instalações extras com o banco de dados em arquivo único.

### Autenticação
- JWT (JSON Web Tokens) - permite o uso de diversas configurações no token incluindo data de expiração, aumentando a camada de segurança

## 📋 Pré-requisitos
Antes de começar, certifique-se de ter instalado:

.NET 8 SDK - Runtime e SDK
Node.js 18+ - Runtime JavaScript
Git - Controle de versão
Docker Desktop (opcional)

### Verificar Instalações

```bash
# Verificar .NET
dotnet --version
# Deve mostrar: 8.x.x

# Verificar Node.js
node --version
# Deve mostrar: v18.x.x ou superior

# Verificar npm
npm --version
# Deve mostrar: 9.x.x ou superior
```

## 🏗️ Estrutura do Projeto
TaskManager/
├── backend/ # API .NET Core
│ ├── src/
│ │ ├── TaskManager.Domain/ # Entidades e interfaces
│ │ ├── TaskManager.Application/ # Casos de uso e DTOs
│ │ ├── TaskManager.Infrastructure/ # Banco de dados e repositories
│ │ └── TaskManager.WebApi/ # Controllers e configuração
│ ├── tests/ # Testes automatizados
│ ├── TaskManager.sln # Solution file
│ └── docker-compose.yml # Docker configuration
├── frontend/ # React Application
│ ├── public/ # Arquivos públicos
│ ├── src/ # Código fonte
│ │ ├── components/ # Componentes React
│ │ ├── pages/ # Páginas da aplicação
│ │ ├── services/ # Integração com API
│ │ ├── store/ # Gerenciamento de estado
│ │ └── types/ # Definições TypeScript
│ ├── tests/ # Testes do frontend
│ └── package.json # Dependências Node.js
└── README.md # Este arquivo

## 🚀 Instalação e Configuração
1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/task-manager.git
cd task-manager
```

2. Configurar Backend (.NET)
```bash
cd backend
```

2.1. Restaurar Dependências
```bash
dotnet restore
```

2.2. Configurar Banco de Dados
```bash
# Criar migrations (se necessário)
dotnet ef migrations add InitialCreate --project src/TaskManager.Infrastructure --startup-project src/TaskManager.WebApi

# Aplicar migrations
dotnet ef database update --project src/TaskManager.Infrastructure --startup-project src/TaskManager.WebApi
```

2.3. Configurar appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=taskmanager.db"
  },
  "JwtSettings": {
    "SecretKey": "sua-chave-super-secreta-de-pelo-menos-32-caracteres",
    "Issuer": "TaskManager",
    "Audience": "TaskManager",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
  }
}
```

3. Configurar Frontend (React)
```bash
cd ../frontend
```

3.1. Instalar Dependências
```bash
npm install
```

3.2. Configurar Variáveis de Ambiente
Crie um arquivo .env na pasta frontend:
```env
# API Backend URL
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
```

## 🚀 Executando a Aplicação
Opção 1: Execução Manual (Recomendado para Desenvolvimento)
Terminal 1 - Backend API
```bash
cd backend
dotnet run --project src/TaskManager.WebApi
```

✅ API rodando em: http://localhost:5000
📖 Swagger UI: http://localhost:5000/swagger

Terminal 2 - Frontend React
```bash
cd frontend
npm run dev
```
✅ App rodando em: http://localhost:5173

Opção 2: Docker Compose (Ambiente Completo)
```bash
# Na raiz do projeto
docker-compose up --build
```
Serviços disponíveis:

Frontend: http://localhost:3000
Backend: http://localhost:5000
Swagger: http://localhost:5000/swagger

✅ Verificação da Instalação
Backend: Acesse http://localhost:5000/swagger
Frontend: Acesse http://localhost:5173
Saúde da API: GET http://localhost:5000/health

##📚 API Documentation
Base URL
http://localhost:5000/api

** Autenticação
Todas as rotas protegidas requerem header:

Authorization: Bearer

** Endpoints
🔐 Autenticação
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpassword"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

📝 Tarefas
Listar Tarefas
```http
GET /api/tasks
Authorization: Bearer <token>

Response:
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Estudar .NET Core",
    "description": "Revisar conceitos de Clean Architecture",
    "dueDate": "2025-12-31T23:59:59",
    "isCompleted": false
  }
]
```

Obter Tarefa por ID
```http
GET /api/tasks/{id}
Authorization: Bearer <token>
```

Criar Tarefa
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nova tarefa",
  "description": "Descrição da tarefa",
  "dueDate": "2025-12-31T23:59:59"
}
```

Atualizar Tarefa
```http
PUT /api/tasks/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tarefa atualizada",
  "description": "Nova descrição",
  "dueDate": "2025-12-31T23:59:59",
  "isCompleted": true
}
```

Excluir Tarefa
```http

DELETE /api/tasks/{id}
Authorization: Bearer <token>
```

Modelo de Dados
TaskItem
```csharp
public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; }            // Obrigatório, máx 200 chars
    public string Description { get; set; }      // Opcional, máx 1000 chars
    public DateTime DueDate { get; set; }        // Obrigatório
    public bool IsCompleted { get; set; }        // Default: false
}
```

Códigos de Status
*200 - OK
*201 - Created
*204 - No Content
*400 - Bad Request
*401 - Unauthorized
*404 - Not Found
*422 - Validation Error
*500 - Internal Server Error

## 🧪 Testes
Backend Tests
```bash

cd backend

# Executar todos os testes
dotnet test

# Executar com coverage
dotnet test --collect:"XPlat Code Coverage"

# Executar testes específicos
dotnet test --filter "Category=Unit"
dotnet test --filter "Category=Integration"
```

Estrutura de Testes:
tests/
├── TaskManager.UnitTests/ # Testes unitários
│ ├── Application/ # Testes de serviços
│ ├── Domain/ # Testes de entidades
│ └── WebApi/ # Testes de controllers
├── TaskManager.IntegrationTests/ # Testes de integração
└── TaskManager.TestHelpers/ # Utilitários para testes

Frontend Tests
```bash
cd frontend

# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com coverage
npm run test:coverage

# Executar testes E2E
npm run test:e2e
```

Tipos de Testes:
*Unit Tests - Componentes isolados
*Integration Tests - Fluxos completos
*API Mocks - Simulação de chamadas HTTP

Executar Todos os Testes
```bash
# Script para executar testes completos
./run-tests.sh

# Ou manualmente:
# Terminal 1
cd backend && dotnet test

# Terminal 2
cd frontend && npm test
```

## 🐳Docker
docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/taskmanager.db
    volumes:
      - ./data:/app/data
    networks:
      - taskmanager-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:5000/api
    depends_on:
      - backend
    networks:
      - taskmanager-network

networks:
  taskmanager-network:
    driver: bridge

volumes:
  taskmanager-data:
```
  
Comandos Docker
```bash
# Construir e executar
docker-compose up --build

# Executar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Limpar volumes
docker-compose down -v
```

## Próximos Passos
1. Login com testuser/testpassword
2. Teste o CRUD de tarefas
3. Explore a API no Swagger
4. Execute os testes