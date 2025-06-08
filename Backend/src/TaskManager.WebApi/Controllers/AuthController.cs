using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTO;
using TaskManager.Application.Interfaces;

namespace TaskManager.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            var token = await _authService.LoginAsync(loginDto);

            if (token == null)
            {
                return Unauthorized(new { message = "Credenciais inválidas." });
            }

            return Ok(new { token });
        }
    }
}
