using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskManager.Infrastructure.Configuration;
using TaskManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models; // Para Swagger/OpenAPI
using FluentValidation.AspNetCore;
using System.Reflection; // Para Assembly

var builder = WebApplication.CreateBuilder(args);

// Adiciona serviços à Injeção de Dependência
builder.Services.AddControllers()
    .AddFluentValidation(fv => fv.RegisterValidatorsFromAssembly(Assembly.GetExecutingAssembly())); // Adiciona FluentValidation e registra validadores

builder.Services.AddFluentValidation(fv =>
{
    fv.RegisterValidatorsFromAssemblyContaining<TaskManager.Application.Validators.CreateTaskItemCommandValidator>();
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TaskManager API", Version = "v1" });
    // Adicionar suporte a JWT no Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT no formato: `Bearer {token}`",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer" // Refere-se ao ID definido acima
                },
                Scheme = "oauth2", // Ou "Bearer" - "oauth2" é comum para JWT
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>() // Escopos vazios, pois a autorização é baseada na presença do token
        }
    });
});

// Configura o CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000") // URL do seu front-end React
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

// Adiciona a Injeção de Dependência da camada de Infraestrutura
builder.Services.AddInfrastructure(builder.Configuration);

//Validação efetuada antes de efetuar autenticação
string JWT_Key = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(JWT_Key))
{
    throw new Exception("Chave JWT não informada.");
}

// Configuração JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(JWT_Key)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero // Remove o tempo de tolerância de 5 minutos
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configura o pipeline de requisições HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        // O caminho para o endpoint do Swagger JSON
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskManager v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply migrations on startup (for development/testing)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    // Adicionar um usuário de teste inicial (apenas para o primeiro run)
    if (!dbContext.Users.Any())
    {
        dbContext.Users.Add(new TaskManager.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            PasswordHash = TaskManager.Application.Utils.PasswordHasher.HashPassword("testpassword") // Geração de hash
        });
        dbContext.SaveChanges();
    }
}

app.Run();

//Linha adicionada para que seja possível rodar os testes automatizados
public partial class Program { }