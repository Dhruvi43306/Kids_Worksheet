using FluentValidation;
using kids_app.Dto.Difficulty;
using kids_app.Dto.TopicLevelConfiguration;

namespace kids_app.Validators
{
    public class TopicDifficultyValidator:AbstractValidator<TopicLevelDifficultyDto>
    {
        public TopicDifficultyValidator()
        {
            RuleFor(x => x.DifficultyId)
                .GreaterThan(0)
                .WithMessage("Difficulty Id Must be Grater then Zero.");

            RuleFor(x => x.TopicLevelConfigurationId)
                 .GreaterThan(0)
                .WithMessage("TopicLevelConfigerationId Must be Grater then Zero.");
        }
    }
}
