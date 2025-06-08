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

// Adiciona servi�os � Inje��o de Depend�ncia
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
                Scheme = "oauth2", // Ou "Bearer" - "oauth2" � comum para JWT
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>() // Escopos vazios, pois a autoriza��o � baseada na presen�a do token
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

// Adiciona a Inje��o de Depend�ncia da camada de Infraestrutura
builder.Services.AddInfrastructure(builder.Configuration);

//Valida��o efetuada antes de efetuar autentica��o
string JWT_Key = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(JWT_Key))
{
    throw new Exception("Chave JWT n�o informada.");
}

// Configura��o JWT
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
            ClockSkew = TimeSpan.Zero // Remove o tempo de toler�ncia de 5 minutos
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configura o pipeline de requisi��es HTTP
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

    // Adicionar um usu�rio de teste inicial (apenas para o primeiro run)
    if (!dbContext.Users.Any())
    {
        dbContext.Users.Add(new TaskManager.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            PasswordHash = TaskManager.Application.Utils.PasswordHasher.HashPassword("testpassword") // Gera��o de hash
        });
        dbContext.SaveChanges();
    }
}

app.Run();

//Linha adicionada para que seja poss�vel rodar os testes automatizados
public partial class Program { }