using FluentValidation.TestHelper; // Para usar ShouldHaveValidationErrorFor e ShouldNotHaveValidationErrorFor
using TaskManager.Application.Commands;
using TaskManager.Application.Validators;

namespace TaskManager.Tests.Application.Validators
{
    public class CreateTaskItemCommandValidatorTests
    {
        private readonly CreateTaskItemCommandValidator _validator;

        public CreateTaskItemCommandValidatorTests()
        {
            _validator = new CreateTaskItemCommandValidator();
        }

        [Fact]
        public void ShouldHaveError_WhenTitleIsEmpty()
        {
            var command = new CreateTaskItemCommand { Title = "", Description = "Desc", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Title)
                  .WithErrorMessage("O título da tarefa é obrigatório.");
        }

        [Fact]
        public void ShouldHaveError_WhenTitleIsTooShort()
        {
            var command = new CreateTaskItemCommand { Title = "ab", Description = "Desc", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Title)
                  .WithErrorMessage("O título deve ter no mínimo 3 caracteres.");
        }

        [Fact]
        public void ShouldHaveError_WhenTitleIsTooLong()
        {
            var command = new CreateTaskItemCommand { Title = new string('A', 101), Description = "Desc", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Title)
                  .WithErrorMessage("O título não deve exceder 100 caracteres.");
        }

        [Fact]
        public void ShouldHaveError_WhenDueDateIsEmpty()
        {
            var command = new CreateTaskItemCommand { Title = "Valid Title", Description = "Desc", DueDate = DateTime.MinValue, UserId = Guid.NewGuid() }; // DateTime.MinValue para simular vazio/inválido
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.DueDate)
                  .WithErrorMessage("A data limite é obrigatória.");
        }

        [Fact]
        public void ShouldHaveError_WhenDueDateIsPast()
        {
            var command = new CreateTaskItemCommand { Title = "Valid Title", Description = "Desc", DueDate = DateTime.Today.AddDays(-1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.DueDate)
                  .WithErrorMessage("A data limite deve ser uma data válida e futura.");
        }

        [Fact]
        public void ShouldNotHaveError_WhenCommandIsValid()
        {
            var command = new CreateTaskItemCommand { Title = "Valid Task", Description = "Valid Description", DueDate = DateTime.Today.AddDays(1), UserId = Guid.NewGuid() };
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}