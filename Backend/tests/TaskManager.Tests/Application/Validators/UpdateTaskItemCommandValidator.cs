using FluentValidation.TestHelper; // Para usar ShouldHaveValidationErrorFor e ShouldNotHaveValidationErrorFor
using TaskManager.Application.Commands;
using TaskManager.Application.Validators;

namespace TaskManager.Tests.Application.Validators
{
    public class UpdateTaskItemCommandValidatorTests
    {
        private readonly UpdateTaskItemCommandValidator _validator;

        public UpdateTaskItemCommandValidatorTests()
        {
            _validator = new UpdateTaskItemCommandValidator();
        }

        [Fact]
        public void ShouldHaveError_WhenTitleIsEmpty()
        {
            var command = new UpdateTaskItemCommand { Title = "", Description = "Desc", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Title)
                  .WithErrorMessage("O título da tarefa é obrigatório.");
        }

        [Fact]
        public void ShouldHaveError_WhenTitleIsTooShort()
        {
            var command = new UpdateTaskItemCommand { Title = "ab", Description = "Desc", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Title)
                  .WithErrorMessage("O título deve ter no mínimo 3 caracteres.");
        }

        [Fact]
        public void ShouldHaveError_WhenTitleIsTooLong()
        {
            var command = new UpdateTaskItemCommand { Title = new string('A', 101), Description = "Desc", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Title)
                  .WithErrorMessage("O título não deve exceder 100 caracteres.");
        }

        [Fact]
        public void ShouldHaveError_WhenDueDateIsEmpty()
        {
            var command = new UpdateTaskItemCommand { Title = "Título válido", Description = "Desc", DueDate = DateTime.MinValue, UserId = Guid.NewGuid() }; // DateTime.MinValue para simular vazio/inválido
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.DueDate)
                  .WithErrorMessage("A data limite é obrigatória.");
        }

        [Fact]
        public void ShouldHaveError_WhenDueDateIsPast()
        {
            var command = new UpdateTaskItemCommand { Title = "Título válido", Description = "Desc", DueDate = DateTime.Today.AddDays(-1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.DueDate)
                  .WithErrorMessage("A data limite deve ser uma data válida e futura.");
        }

        [Fact]
        public void ShouldNotHaveError_WhenCommandIsValid()
        {
            var command = new UpdateTaskItemCommand { Title = "Tarefa válida", Description = "Descrição válida", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}