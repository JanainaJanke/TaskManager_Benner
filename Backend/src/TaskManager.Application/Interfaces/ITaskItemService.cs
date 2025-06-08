using TaskManager.Application.Commands;
using TaskManager.Application.DTO;

namespace TaskManager.Application.Interfaces
{
    public interface ITaskItemService
    {
        Task<IEnumerable<TaskItemDto>> GetAllTasksAsync(Guid userId);
        Task<TaskItemDto> GetTaskByIdAsync(Guid taskId, Guid userId);
        Task<TaskItemDto> CreateTaskAsync(CreateTaskItemCommand command);
        Task<TaskItemDto> UpdateTaskAsync(UpdateTaskItemCommand command);
        Task DeleteTaskAsync(Guid taskId, Guid userId);
    }
}
