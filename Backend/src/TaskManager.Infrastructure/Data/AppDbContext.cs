using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<TaskItem> TaskItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração para User
            modelBuilder.Entity<User>().HasKey(u => u.Id);
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique(); // Garante username único
            modelBuilder.Entity<User>().Property(u => u.Username).IsRequired().HasMaxLength(50);
            modelBuilder.Entity<User>().Property(u => u.PasswordHash).IsRequired();

            // Configuração para TaskItem
            modelBuilder.Entity<TaskItem>().HasKey(t => t.Id);
            modelBuilder.Entity<TaskItem>().Property(t => t.Title).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<TaskItem>().Property(t => t.Description).HasMaxLength(500); // Opcional
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.User) // Uma TaskItem pertence a um User
                .WithMany() // Um User pode ter muitas TaskItems
                .HasForeignKey(t => t.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade); // Excluir tarefas se o usuário for excluído
        }
    }
}