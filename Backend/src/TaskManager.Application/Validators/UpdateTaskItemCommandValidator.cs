using FluentValidation;
using TaskManager.Application.Commands;
using TaskManager.Application.Utils;

namespace TaskManager.Application.Validators
{
    public class UpdateTaskItemCommandValidator : AbstractValidator<UpdateTaskItemCommand>
    {
        public UpdateTaskItemCommandValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("O título da tarefa é obrigatório.")
                .MinimumLength(3).WithMessage("O título deve ter no mínimo 3 caracteres.")
                .MaximumLength(100).WithMessage("O título não deve exceder 100 caracteres.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("A descrição não deve exceder 500 caracteres.");

            RuleFor(x => x.DueDate)
                .NotEmpty().WithMessage("A data limite é obrigatória.")
                .Must(DateValidation.BeAValidFutureDate).WithMessage("A data limite deve ser uma data válida e futura."); // Ou permitir o dia atual
        }
    }
}