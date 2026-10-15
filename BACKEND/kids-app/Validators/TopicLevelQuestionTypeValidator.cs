using FluentValidation;
using kids_app.Dto.QuestionType;

namespace kids_app.Validators
{
    public class TopicLevelQuestionTypeValidator
        : AbstractValidator<TopicLevelQuestionTypeDto>
    {
        public TopicLevelQuestionTypeValidator()
        {
            RuleFor(x => x.TopicLevelConfigurationId)
                .GreaterThan(0)
                .WithMessage(
                    "TopicLevelConfigurationId must be greater than 0.");

            RuleFor(x => x.QuestionTypeId)
                .GreaterThan(0)
                .WithMessage(
                    "QuestionTypeId must be greater than 0.");
        }
    }
}