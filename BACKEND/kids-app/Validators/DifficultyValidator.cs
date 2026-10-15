using FluentValidation;
using kids_app.Dto.Difficulty;
using kids_app.Models;

namespace kids_app.Validators
{
    public class DifficultyValidator : AbstractValidator<DifficultyDto>
    {
        public DifficultyValidator()
        {
            RuleFor(x => x.Name)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .WithMessage("Difficulty name is required.")
                .MinimumLength(2)
                .WithMessage("Difficulty name must contain at least 2 characters.")
                .MaximumLength(50)
                .WithMessage("Difficulty name cannot exceed 50 characters.");


            RuleFor(x => x.DisplayOrder)
                .GreaterThan(0)
                .WithMessage("DisplayOrder must be greater than 0.");

           
        }
    }
}