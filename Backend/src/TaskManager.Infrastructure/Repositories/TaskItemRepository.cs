using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories
{
    public class TaskItemRepository : ITaskItemRepository
    {
        private readonly AppDbContext _context;

        public TaskItemRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskItem>> GetAllByUserIdAsync(Guid userId)
        {
            //Retorno de tarefas vinculadas ao usuário
            return await _context.TaskItems
                                 .Where(t => t.UserId == userId)
                                 .OrderBy(t => t.DueDate)
                                 .ToListAsync();
        }

        public async Task<TaskItem> GetByIdAsync(Guid id, Guid userId)
        {
            //Retorno de tarefa específica quando vinculada ao usuário
            return await _context.TaskItems
                                 .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        }

        public async Task AddAsync(TaskItem task)
        {
            //Criação de tarefa
            await _context.TaskItems.AddAsync(task);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TaskItem task)
        {
            //Alteração de tarefa
            _context.TaskItems.Update(task);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TaskItem task)
        {
            //Exclusão de tarefa
            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();
        }
    }
}
