using Isopoh.Cryptography.Argon2;
using System.Text;

namespace TaskManager.Application.Utils
{
    public class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            // Argon2.Hash() gera o hash no formato MCF, incluindo salt e parâmetros.
            // Você pode passar um Argon2Config para personalizar os parâmetros.
            // O padrão é Argon2id com parâmetros razoáveis.
            return Argon2.Hash(password);
        }

        public static bool VerifyPassword(string password, string storedHashedPassword)
        {
            // Argon2.Verify() automaticamente extrai os parâmetros e o salt do hash MCF
            // para fazer a verificação.
            return Argon2.Verify(storedHashedPassword, password);
        }
    }
}
