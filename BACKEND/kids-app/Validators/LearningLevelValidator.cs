using FluentValidation;
using kids_app.Dto.LearningLevel;

namespace kids_app.Validators
{
    public class LearningLevelValidator:AbstractValidator<LearningLevelDto>
    {

        public LearningLevelValidator()
        {
            RuleFor(x => x.LevelName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty()
                .WithMessage("Level name is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Level name cannot contain only whitespace.")
                .MinimumLength(2)
                .WithMessage("Level name must contain at least 2 characters.")
                .MaximumLength(100)
                .WithMessage("Level name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
               .MaximumLength(500)
               .WithMessage("Description cannot exceed 500 characters.")
               .When(x => !string.IsNullOrWhiteSpace(x.Description));

            RuleFor(x => x.MinAge)
                .GreaterThan(0)
                .WithMessage("Minimum age cannot be negative.")
                .When(x => x.MinAge.HasValue);

            RuleFor(x => x.MaxAge)
                .GreaterThan(0)
                .WithMessage("Maximum age cannot be negative.")
                .When(x => x.MaxAge.HasValue);

            RuleFor(x => x)
                .Must(x =>
                    !x.MinAge.HasValue ||
                    !x.MaxAge.HasValue ||
                    x.MaxAge.Value >= x.MinAge.Value)
                .WithMessage("Maximum age must be greater than or equal to minimum age.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThan(0)
                .WithMessage("DisplayOrder must be greater than 0.");


        }
    }

}
