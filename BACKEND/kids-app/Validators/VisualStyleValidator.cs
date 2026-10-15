using FluentValidation;
using kids_app.Dto.IVisuleStyle;

namespace kids_app.Validators
{
    public class VisualStyleValidator:AbstractValidator<IVisualStyleDto>
    {
        public VisualStyleValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Visual style name is required.")
                .MaximumLength(100)
                .WithMessage("Visual style name cannot exceed 100 characters.");

            RuleFor(x => x.Icon)
                .MaximumLength(255)
                .WithMessage("Icon cannot exceed 255 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Icon));

            RuleFor(x => x.Description)
                .MaximumLength(500)
                .WithMessage("Description cannot exceed 500 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Description));

            RuleFor(x => x.IsActive)
                .NotNull()
                .WithMessage("IsActive is required.");
        }
    }
}
