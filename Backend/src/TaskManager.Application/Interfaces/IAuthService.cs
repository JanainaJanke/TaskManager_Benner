using TaskManager.Application.DTO;

namespace TaskManager.Application.Interfaces
{
    public interface IAuthService
    {
        Task<string> LoginAsync(UserLoginDto loginDto);
    }
}
