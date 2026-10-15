using FluentValidation;
using kids_app.Dto.QuestionType;

namespace kids_app.Validators
{
    public class QuestionTypeValidator:AbstractValidator<QuestionTypeDto>
    {
        public QuestionTypeValidator()
        {
            RuleFor(x => x.TypeName)
               .Cascade(CascadeMode.Stop)
               .NotEmpty()
               .WithMessage("Question type name is required.")
               .MaximumLength(100)
               .WithMessage("Question type name cannot exceed 100 characters.");

            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Question type code is required.")
                .MaximumLength(100)
                .WithMessage("Question type code cannot exceed 50 characters.")
                .Matches("^[A-Z_]+$")
                .WithMessage("Code must contain only uppercase letters and underscores.");

            RuleFor(x => x.Description)
                .MaximumLength(300)
                .WithMessage("Description cannot exceed 300 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Description));
        }
    }
}
