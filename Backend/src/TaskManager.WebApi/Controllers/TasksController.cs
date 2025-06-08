using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.Application.Commands;
using TaskManager.Application.Interfaces;

namespace TaskManager.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Todas as rotas neste controller exigem autenticação
    public class TasksController : ControllerBase
    {
        private readonly ITaskItemService _taskService;

        public TasksController(ITaskItemService taskService)
        {
            _taskService = taskService;
        }

        private Guid GetUserId()
        {
            // Extrai o ID do usuário do token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                throw new UnauthorizedAccessException("ID do usuário não encontrado no token informado.");
            }
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var userId = GetUserId();
            var tasks = await _taskService.GetAllTasksAsync(userId);
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(Guid id)
        {
            var userId = GetUserId();
            var task = await _taskService.GetTaskByIdAsync(id, userId);
            if (task == null)
            {
                return NotFound(new { message = "Tarefa não encontrada ou você não tem permissão para acessá-la." });
            }
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskItemCommand command)
        {
            var userId = GetUserId();
            command.UserId = userId;

            var createdTask = await _taskService.CreateTaskAsync(command);
            return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskItemCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("ID da rota não corresponde ao ID da tarefa.");
            }

            var userId = GetUserId();
            command.UserId = userId;

            try
            {
                var updatedTask = await _taskService.UpdateTaskAsync(command);
                if (updatedTask == null)
                {
                    return NotFound(new { message = "Tarefa não encontrada ou você não tem permissão para atualizá-la." });
                }
                return Ok(updatedTask);
            }
            catch (InvalidOperationException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var userId = GetUserId();
            try
            {
                await _taskService.DeleteTaskAsync(id, userId);
                return NoContent(); // 204 No Content para exclusão bem-sucedida
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
