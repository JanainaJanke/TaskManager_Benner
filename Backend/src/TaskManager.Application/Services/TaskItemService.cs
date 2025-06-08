using TaskManager.Application.Commands;
using TaskManager.Application.DTO;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Services
{
    public class TaskItemService : ITaskItemService
    {
        private readonly ITaskItemRepository _taskItemRepository;

        public TaskItemService(ITaskItemRepository taskItemRepository)
        {
            _taskItemRepository = taskItemRepository;
        }

        public async Task<IEnumerable<TaskItemDto>> GetAllTasksAsync(Guid userId)
        {
            //Recuperação de todas as tarefas cadastradas para o usuário logado
            var tasks = await _taskItemRepository.GetAllByUserIdAsync(userId);
            return tasks.Select(t => new TaskItemDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                IsCompleted = t.IsCompleted
            });
        }

        public async Task<TaskItemDto> GetTaskByIdAsync(Guid taskId, Guid userId)
        {
            //Recuperação de tarefa específica
            var task = await _taskItemRepository.GetByIdAsync(taskId, userId);
            if (task == null) return null;

            return new TaskItemDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                IsCompleted = task.IsCompleted
            };
        }

        public async Task<TaskItemDto> CreateTaskAsync(CreateTaskItemCommand command)
        {
            //Criação de tarefa vinculada ao usuário logado
            var task = new TaskItem
            {
                Title = command.Title,
                Description = command.Description,
                DueDate = command.DueDate,
                UserId = command.UserId,
                IsCompleted = false
            };

            await _taskItemRepository.AddAsync(task);

            return new TaskItemDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                IsCompleted = task.IsCompleted
            };
        }

        public async Task<TaskItemDto> UpdateTaskAsync(UpdateTaskItemCommand command)
        {
            //Alteração de tarefa
            var task = await _taskItemRepository.GetByIdAsync(command.Id, command.UserId);
            if (task == null)
            {
                // Lançar exceção ou retornar erro específico se a tarefa não for encontrada ou não pertencer ao usuário
                throw new InvalidOperationException("Tarefa não encontrada/autorizada para o usuário corrente.");
            }

            // Atualiza propriedades da entidade
            task.Title = command.Title;
            task.Description = command.Description;
            task.DueDate = command.DueDate;
            task.IsCompleted = command.IsCompleted;

            await _taskItemRepository.UpdateAsync(task);

            return new TaskItemDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                IsCompleted = task.IsCompleted
            };
        }

        public async Task DeleteTaskAsync(Guid taskId, Guid userId)
        {
            //Exclusão de tarefa
            var task = await _taskItemRepository.GetByIdAsync(taskId, userId);
            if (task == null)
            {
                // Lançar exceção ou retornar erro específico se a tarefa não for encontrada ou não pertencer ao usuário
                throw new InvalidOperationException("Tarefa não encontrada/autorizada para o usuário corrente.");
            }
            await _taskItemRepository.DeleteAsync(task);
        }
    }
}