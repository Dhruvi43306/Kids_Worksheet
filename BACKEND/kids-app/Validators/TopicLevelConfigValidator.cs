using FluentValidation;
using kids_app.Dto.TopicLevelConfiguration;

namespace kids_app.Validators
{
    public class TopicLevelConfigValidator : AbstractValidator<TopicLevelConfigurationDto>
    {
        public TopicLevelConfigValidator()
        {
            RuleFor(x => x.TopicId)
                    .GreaterThan(0)
                    .WithMessage("TopicId must be greater than 0.");

            RuleFor(x => x.LevelId)
                    .GreaterThan(0)
                    .WithMessage("LevelId must be greater than 0.");

            RuleFor(x => x.MinNumber)
                    .GreaterThanOrEqualTo(0)
                    .When(x => x.MinNumber.HasValue)
                    .WithMessage("MinNumber cannot be negative.");

            RuleFor(x => x.MaxNumber)
                    .GreaterThanOrEqualTo(0)
                    .When(x => x.MaxNumber.HasValue)
                    .WithMessage("MaxNumber cannot be negative.");

            RuleFor(x => x)
                    .Must(x =>
                        !x.MinNumber.HasValue ||
                        !x.MaxNumber.HasValue ||
                        x.MinNumber <= x.MaxNumber)
                    .WithMessage("MinNumber must be less than or equal to MaxNumber.");
        }
    }
}
