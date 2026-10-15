using FluentValidation;
using kids_app.Dto.GenratedWorkSheet;

namespace kids_app.Validators
{
    public class GeneratedWorksheetValidator
        : AbstractValidator<GeneratedWorksheetDto>
    {
        public GeneratedWorksheetValidator()
        {
            RuleFor(x => x.TopicId)
                .GreaterThan(0)
                .WithMessage(
                    "TopicId must be greater than 0.");

            RuleFor(x => x.LevelId)
                .GreaterThan(0)
                .WithMessage(
                    "LevelId must be greater than 0.");

            RuleFor(x => x.DifficultyId)
                .GreaterThan(0)
                .WithMessage(
                    "DifficultyId must be greater than 0.");

            RuleFor(x => x.VisualStyleId)
                .GreaterThan(0)
                .When(x => x.VisualStyleId.HasValue)
                .WithMessage(
                    "VisualStyleId must be greater than 0.");

            RuleFor(x => x.QuestionCount)
                .GreaterThan(0)
                .WithMessage(
                    "QuestionCount must be greater than 0.");

            RuleFor(x => x.QuestionCount)
                .LessThanOrEqualTo(100)
                .WithMessage(
                    "QuestionCount cannot be greater than 100.");

            RuleFor(x => x.WorksheetTitle)
                .NotEmpty()
                .WithMessage(
                    "WorksheetTitle is required.");

            RuleFor(x => x.WorksheetTitle)
                .MaximumLength(200)
                .WithMessage(
                    "WorksheetTitle cannot exceed 200 characters.");

            RuleFor(x => x.SchoolName)
                .MaximumLength(150)
                .When(x => !string.IsNullOrWhiteSpace(x.SchoolName))
                .WithMessage(
                    "SchoolName cannot exceed 150 characters.");

            RuleFor(x => x.StudentName)
                .MaximumLength(100)
                .When(x => !string.IsNullOrWhiteSpace(x.StudentName))
                .WithMessage(
                    "StudentName cannot exceed 100 characters.");

            RuleFor(x => x.GradeName)
                .MaximumLength(50)
                .When(x => !string.IsNullOrWhiteSpace(x.GradeName))
                .WithMessage(
                    "GradeName cannot exceed 50 characters.");

            RuleFor(x => x.Section)
                .MaximumLength(50)
                .When(x => !string.IsNullOrWhiteSpace(x.Section))
                .WithMessage(
                    "Section cannot exceed 50 characters.");

            RuleFor(x => x.TeacherName)
                .MaximumLength(100)
                .When(x => !string.IsNullOrWhiteSpace(x.TeacherName))
                .WithMessage(
                    "TeacherName cannot exceed 100 characters.");
        }
    }
}