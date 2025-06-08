using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Interfaces;
using TaskManager.Application.Services;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;
using TaskManager.Infrastructure.Repositories;

namespace TaskManager.Infrastructure.Configuration
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Configurar DbContext (SQLite)
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

            // Adicionar Repositórios
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ITaskItemRepository, TaskItemRepository>();

            // Adicionar Serviços de Aplicação
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITaskItemService, TaskItemService>();

            return services;
        }
    }
}
