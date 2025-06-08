using Moq;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Text;
using TaskManager.Application.Commands;
using TaskManager.Application.DTO;

namespace TaskManager.Tests.API
{
    public class TasksControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;
        private readonly Guid _testUserId = Guid.NewGuid();
        private readonly string _testUsername = "testuser";
        private readonly string _testToken;

        public TasksControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient(); // Cria um HttpClient para fazer requisições ao servidor de teste

            // Limpa o estado dos mocks antes de cada teste para evitar interferência entre eles.
            // Isso garante que cada teste comece com um mock "limpo".
            _factory.MockTaskItemService.Invocations.Clear();
            _factory.MockAuthService.Invocations.Clear();
            _factory.MockUserRepository.Invocations.Clear();

            // Gere um token de teste válido para usar nas requisições autenticadas.
            // A chave e o issuer/audience devem ser os mesmos configurados no appsettings.json da API
            // e no CustomWebApplicationFactory.GenerateTestJwtToken.
            _testToken = CustomWebApplicationFactory<Program>.GenerateTestJwtToken(_testUserId, _testUsername);

            // Configura o cabeçalho de autorização padrão para todas as requisições deste cliente.
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _testToken);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task GetAllTasks_ReturnsOkResultWithTasks_WhenAuthenticated()
        {
            // Arrange
            var mockTasks = new List<TaskItemDto>
            {
                new TaskItemDto { Id = Guid.NewGuid(), Title = "Task A", IsCompleted = false, DueDate = DateTime.Today },
                new TaskItemDto { Id = Guid.NewGuid(), Title = "Task B", IsCompleted = true, DueDate = DateTime.Today }
            };

            // Configura o mock do serviço para retornar as tarefas simuladas
            _factory.MockTaskItemService
                    .Setup(s => s.GetAllTasksAsync(_testUserId))
                    .ReturnsAsync(mockTasks);

            // Act
            var response = await _client.GetAsync("/api/tasks");

            // Assert
            response.EnsureSuccessStatusCode(); // Verifica se o status é 2xx (e.g., 200 OK)
            var tasks = JsonConvert.DeserializeObject<List<TaskItemDto>>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(tasks);
            Assert.Equal(2, tasks.Count);
            Assert.Contains(tasks, t => t.Title == "Task A");

            // Verifica se o método do serviço foi chamado exatamente uma vez com o UserId correto
            _factory.MockTaskItemService.Verify(s => s.GetAllTasksAsync(_testUserId), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task GetTaskById_ReturnsOkResultWithTask_WhenTaskExistsAndBelongsToUser()
        {
            // Arrange
            var taskId = Guid.NewGuid();
            var mockTask = new TaskItemDto { Id = taskId, Title = "Tarefa teste", IsCompleted = true, DueDate = DateTime.Today };

            _factory.MockTaskItemService
                    .Setup(s => s.GetTaskByIdAsync(taskId, _testUserId))
                    .ReturnsAsync(mockTask);

            // Act
            var response = await _client.GetAsync($"/api/tasks/{taskId}");

            // Assert
            response.EnsureSuccessStatusCode();
            var task = JsonConvert.DeserializeObject<TaskItemDto>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(task);
            Assert.Equal(taskId, task.Id);
            _factory.MockTaskItemService.Verify(s => s.GetTaskByIdAsync(taskId, _testUserId), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task GetTaskById_ReturnsNotFound_WhenTaskDoesNotExistOrDoesNotBelongToUser()
        {
            // Arrange
            var taskId = Guid.NewGuid();
            _factory.MockTaskItemService
                    .Setup(s => s.GetTaskByIdAsync(taskId, _testUserId))
                    .ReturnsAsync((TaskItemDto)null); // Simula que a tarefa não foi encontrada

            // Act
            var response = await _client.GetAsync($"/api/tasks/{taskId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            _factory.MockTaskItemService.Verify(s => s.GetTaskByIdAsync(taskId, _testUserId), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task CreateTask_ReturnsCreatedResult_WhenCommandIsValid()
        {
            // Arrange
            var command = new CreateTaskItemCommand
            {
                Title = "New API Task",
                Description = "Description for new task",
                DueDate = DateTime.Today.AddDays(7)
            };
            var createdTaskDto = new TaskItemDto
            {
                Id = Guid.NewGuid(),
                Title = command.Title,
                Description = command.Description,
                DueDate = command.DueDate,
                IsCompleted = false
            };

            // Configura o mock do serviço para retornar a tarefa criada
            _factory.MockTaskItemService
                    .Setup(s => s.CreateTaskAsync(It.IsAny<CreateTaskItemCommand>()))
                    .ReturnsAsync(createdTaskDto);

            var content = new StringContent(JsonConvert.SerializeObject(command), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/tasks", content);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var resultTask = JsonConvert.DeserializeObject<TaskItemDto>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(resultTask);
            Assert.Equal(command.Title, resultTask.Title);
            Assert.Equal(createdTaskDto.Id, resultTask.Id); // Garante que o ID foi retornado

            // Verifica se o CreateTaskAsync foi chamado com um comando contendo o UserId correto
            _factory.MockTaskItemService.Verify(s => s.CreateTaskAsync(It.Is<CreateTaskItemCommand>(c =>
                c.UserId == _testUserId &&
                c.Title == command.Title &&
                c.Description == command.Description &&
                c.DueDate == command.DueDate
            )), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task CreateTask_ReturnsBadRequest_WhenTitleIsEmpty()
        {
            // Arrange
            var command = new CreateTaskItemCommand { Title = "", Description = "Desc", DueDate = DateTime.Today.AddDays(7) }; // Título vazio
            var content = new StringContent(JsonConvert.SerializeObject(command), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/tasks", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var responseString = await response.Content.ReadAsStringAsync();
            Assert.Contains("O título da tarefa é obrigatório.", responseString);

            // Garante que o serviço de aplicação NÃO foi chamado, pois a validação falhou antes
            _factory.MockTaskItemService.Verify(s => s.CreateTaskAsync(It.IsAny<CreateTaskItemCommand>()), Times.Never);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task CreateTask_ReturnsBadRequest_WhenTitleIsTooShort()
        {
            // Arrange
            var command = new CreateTaskItemCommand { Title = "ab", Description = "Desc", DueDate = DateTime.Today.AddDays(7) }; // Título muito curto
            var content = new StringContent(JsonConvert.SerializeObject(command), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/tasks", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var responseString = await response.Content.ReadAsStringAsync();
            Assert.Contains("O título deve ter no mínimo 3 caracteres.", responseString);

            _factory.MockTaskItemService.Verify(s => s.CreateTaskAsync(It.IsAny<CreateTaskItemCommand>()), Times.Never);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task CreateTask_ReturnsBadRequest_WhenDueDateIsEmpty()
        {
            // Arrange
            var command = new CreateTaskItemCommand { Title = "Valid Title", Description = "Desc", DueDate = default(DateTime) };
            var content = new StringContent(JsonConvert.SerializeObject(command), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/tasks", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var responseString = await response.Content.ReadAsStringAsync();
            Assert.Contains("A data limite é obrigatória.", responseString);

            _factory.MockTaskItemService.Verify(s => s.CreateTaskAsync(It.IsAny<CreateTaskItemCommand>()), Times.Never);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task CreateTask_ReturnsBadRequest_WhenDueDateIsPast()
        {
            // Arrange
            var command = new CreateTaskItemCommand { Title = "Valid Title", Description = "Desc", DueDate = DateTime.Today.AddDays(-1) }; // Data no passado
            var content = new StringContent(JsonConvert.SerializeObject(command), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/tasks", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var responseString = await response.Content.ReadAsStringAsync();
            Assert.Contains("A data limite deve ser uma data válida e futura.", responseString);

            _factory.MockTaskItemService.Verify(s => s.CreateTaskAsync(It.IsAny<CreateTaskItemCommand>()), Times.Never);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task UpdateTask_ReturnsOkResult_WhenTaskExistsAndCommandIsValid()
        {
            // Arrange
            var taskId = Guid.NewGuid();
            var command = new UpdateTaskItemCommand
            {
                Id = taskId,
                Title = "Alteração do título",
                Description = "Alteração da descrição",
                DueDate = DateTime.Today.AddDays(1),
                IsCompleted = true,
                UserId = _testUserId
            };
            var updatedTaskDto = new TaskItemDto { Id = taskId, Title = "Alteração do título", Description = "Alteração da descrição", DueDate = command.DueDate, IsCompleted = command.IsCompleted};

            _factory.MockTaskItemService
                    .Setup(s => s.UpdateTaskAsync(It.IsAny<UpdateTaskItemCommand>()))
                    .ReturnsAsync(updatedTaskDto);

            var content = new StringContent(JsonConvert.SerializeObject(command), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PutAsync($"/api/tasks/{taskId}", content);

            // Assert
            response.EnsureSuccessStatusCode(); // Status 200 OK
            var resultTask = JsonConvert.DeserializeObject<TaskItemDto>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(resultTask);
            Assert.Equal("Alteração do título", resultTask.Title);
            Assert.True(resultTask.IsCompleted);

            _factory.MockTaskItemService.Verify(s => s.UpdateTaskAsync(It.Is<UpdateTaskItemCommand>(c =>
                c.Id == taskId &&
                c.UserId == _testUserId &&
                c.Title == command.Title &&
                c.IsCompleted == command.IsCompleted
            )), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task UpdateTask_ReturnsNotFound_WhenTaskToUpdateDoesNotExist()
        {
            // Arrange
            var taskId = Guid.NewGuid();
            var command = new UpdateTaskItemCommand
            {
                Id = taskId, // Garante que o ID do comando seja igual ao ID da rota
                Title = "Não existente",
                Description = "Alteração de descrição",
                DueDate = DateTime.Today.AddDays(1),
                IsCompleted = false
                // UserId será definido automaticamente no controller
            };

            // Configura o mock para simular que a tarefa não foi encontrada
            _factory.MockTaskItemService
                    .Setup(s => s.UpdateTaskAsync(It.IsAny<UpdateTaskItemCommand>()))
                    .ReturnsAsync((TaskItemDto)null);

            var content = new StringContent(JsonConvert.SerializeObject(command), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PutAsync($"/api/tasks/{taskId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            // Verifica se o serviço foi chamado uma vez
            _factory.MockTaskItemService.Verify(s => s.UpdateTaskAsync(It.Is<UpdateTaskItemCommand>(c =>
                c.Id == taskId &&
                c.UserId == _testUserId &&
                c.Title == command.Title &&
                c.IsCompleted == command.IsCompleted
            )), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task DeleteTask_ReturnsNoContent_WhenTaskExists()
        {
            // Arrange
            var taskId = Guid.NewGuid();
            _factory.MockTaskItemService
                    .Setup(s => s.DeleteTaskAsync(taskId, _testUserId))
                    .Returns(Task.CompletedTask);

            // Act
            var response = await _client.DeleteAsync($"/api/tasks/{taskId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode); // 204 No Content
            _factory.MockTaskItemService.Verify(s => s.DeleteTaskAsync(taskId, _testUserId), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task DeleteTask_ReturnsNotFound_WhenTaskDoesNotExist()
        {
            // Arrange
            var taskId = Guid.NewGuid();
            // Simula a exceção que o serviço lançaria se a tarefa não fosse encontrada
            _factory.MockTaskItemService
                    .Setup(s => s.DeleteTaskAsync(taskId, _testUserId))
                    .ThrowsAsync(new InvalidOperationException("Tarefa não encontrada ou você não tem permissão para acessá-la."));

            // Act
            var response = await _client.DeleteAsync($"/api/tasks/{taskId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            var responseContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("Tarefa não encontrada ou você não tem permissão para acessá-la.", responseContent);
            _factory.MockTaskItemService.Verify(s => s.DeleteTaskAsync(taskId, _testUserId), Times.Once);
        }

        [Fact]
        [Trait("Category", "Integration")]
        public async Task TasksEndpoints_RequireAuthentication_ReturnsUnauthorized()
        {
            // Arrange: Cria um cliente sem o cabeçalho de autenticação
            var unauthenticatedClient = _factory.CreateClient();

            // Act
            var response = await unauthenticatedClient.GetAsync("/api/tasks");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

            // Garante que nenhum método do serviço foi chamado sem autenticação
            _factory.MockTaskItemService.Verify(s => s.GetAllTasksAsync(It.IsAny<Guid>()), Times.Never);
        }
    }
}