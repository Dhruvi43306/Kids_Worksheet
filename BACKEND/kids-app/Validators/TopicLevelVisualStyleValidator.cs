using FluentValidation;
using kids_app.Dto.VisuleStyle;

namespace kids_app.Validators
{
    public class TopicLevelVisualStyleValidator
        : AbstractValidator<TopicLevelVisualStyleDto>
    {
        public TopicLevelVisualStyleValidator()
        {
            RuleFor(x => x.TopicLevelConfigurationId)
                .GreaterThan(0)
                .WithMessage("TopicLevelConfigurationId must be greater than 0.");

            RuleFor(x => x.VisualStyleId)
                .GreaterThan(0)
                .WithMessage("VisualStyleId must be greater than 0.");
        }
    }
}
