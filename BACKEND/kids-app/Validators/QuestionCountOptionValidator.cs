using FluentValidation;
using kids_app.Dto.QuestionCountOption;

namespace kids_app.Validators
{
    public class QuestionCountOptionValidator: AbstractValidator<QuestionCountOptionDto>
    {
        public QuestionCountOptionValidator()
        {
            RuleFor(x => x.TopicLevelConfigurationId)
                .GreaterThan(0)
                .WithMessage("TopicLevelConfigurationId must be greater than 0.");

            RuleFor(x => x.QuestionCount)
                .GreaterThan(0)
                .WithMessage("QuestionCount must be greater than 0.");

            RuleFor(x => x.QuestionCount)
                .LessThanOrEqualTo(100)
                .WithMessage("QuestionCount cannot be greater than 100.");
        }
    }
}