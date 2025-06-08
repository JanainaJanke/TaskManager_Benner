using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Security.Claims;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Interfaces; // Para o mock do repositório de usuário se precisar para AuthController

namespace TaskManager.Tests
{
    // CustomWebApplicationFactory para configurar o ambiente de teste
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
    {
        // Mock de serviços que você quer controlar nos testes
        public Mock<ITaskItemService> MockTaskItemService { get; }
        public Mock<IAuthService> MockAuthService { get; }
        public Mock<IUserRepository> MockUserRepository { get; } // Para configurar um usuário de teste para Auth

        public CustomWebApplicationFactory()
        {
            MockTaskItemService = new Mock<ITaskItemService>();
            MockAuthService = new Mock<IAuthService>();
            MockUserRepository = new Mock<IUserRepository>();
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove os serviços reais para substituí-los pelos mocks
                var taskServiceDescriptor = services.FirstOrDefault(d => d.ServiceType == typeof(ITaskItemService));
                if (taskServiceDescriptor != null) services.Remove(taskServiceDescriptor);

                var authServiceDescriptor = services.FirstOrDefault(d => d.ServiceType == typeof(IAuthService));
                if (authServiceDescriptor != null) services.Remove(authServiceDescriptor);

                var userRepoDescriptor = services.FirstOrDefault(d => d.ServiceType == typeof(IUserRepository));
                if (userRepoDescriptor != null) services.Remove(userRepoDescriptor);

                // Adiciona os mocks como singletons (para que todos os testes recebam a mesma instância)
                services.AddSingleton(MockTaskItemService.Object);
                services.AddSingleton(MockAuthService.Object);
                services.AddSingleton(MockUserRepository.Object);
            });
        }

        // Método auxiliar para gerar um token JWT válido para testes
        public static string GenerateTestJwtToken(Guid userId, string username)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username)
            };

            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            // Use uma chave e configurações de JWT fixas para testes
            var key = System.Text.Encoding.ASCII.GetBytes("N2I-F4t6<<G{1jLl£wJtDJ{,sy0#c;O24N5Dhv&bFq0G5<=8Cw"); // Mesma chave do appsettings.json
            var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(5), // Token de curta duração para teste
                SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key), Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature),
                Issuer = "TaskManagerIssuer",
                Audience = "TaskManagerAudience"
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}