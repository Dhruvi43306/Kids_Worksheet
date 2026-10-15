using FluentValidation;
using kids_app.Dto.WorksheetTopic;

namespace kids_app.Validators
{
    public class WorksheetTopicValidator:AbstractValidator<WorksheetTopicDto>
    {
       public WorksheetTopicValidator()
        {
            RuleFor(x => x.SubjectId)
               .GreaterThan(0)
               .WithMessage("SubjectId is required.");

            RuleFor(x => x.TopicName)
                 .NotNull()
                .WithMessage("TopicName is required.")
                .NotEmpty()
                .WithMessage("TopicName cannot be empty or whitespace.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("TopicName cannot contain only whitespace.")
                .MaximumLength(100)
                .WithMessage("TopicName cannot exceed 100 characters.")
                .MinimumLength(2)
                .WithMessage("TopicName must contain at least 2 characters.");

            RuleFor(x => x.Slug)
                .NotNull()
                .WithMessage("Slug is required.")
                .NotEmpty()
                .WithMessage("Slug cannot be empty.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Slug cannot contain only whitespace.")
                .MinimumLength(2)
                .WithMessage("Slug must contain at least 2 characters.")
                .MaximumLength(150)
                .WithMessage("Slug cannot exceed 150 characters.")
                .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")
                .WithMessage(
                    "Slug can contain only lowercase letters, numbers, and single hyphens."
                );

            RuleFor(x => x.Description)
                .MaximumLength(500)
                .WithMessage("Description cannot exceed 500 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Description));

        }
            
    }
}
