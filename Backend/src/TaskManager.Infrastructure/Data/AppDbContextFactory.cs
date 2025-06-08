using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using SQLitePCL;

namespace TaskManager.Infrastructure.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            // Classe criada para forçar a inicialização do provedor SQLite.raw antes de criar o DbContext.
            Batteries.Init();
            
            // Configurar a forma como o EF Core vai encontrar a string de conexão.
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory()) // Pega o diretório onde o comando dotnet ef está sendo executado
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}.json", optional: true)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            optionsBuilder.UseSqlite(configuration.GetConnectionString("DefaultConnection"));            

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}