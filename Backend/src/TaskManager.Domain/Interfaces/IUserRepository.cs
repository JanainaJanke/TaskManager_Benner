using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces
{
    //VERIFICAR NECESSIDADE DE OUTROS MÉTODOS

    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);

        Task AddAsync(User user);
    }
}
