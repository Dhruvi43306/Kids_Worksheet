using FluentValidation;
using kids_app.Dto.Subject;

namespace kids_app.Validators
{
    public class SubjectValidator:AbstractValidator<SubjectDto>
    {
        public SubjectValidator()
        {
            RuleFor(x => x.SubjectName)
                .NotEmpty()
                .WithMessage("Subject Name is Required.")
                .MaximumLength(100)
                .WithMessage("Subject name cannot exceed 100 characters.");

            RuleFor(x => x.slug)
                .NotEmpty()
                .WithMessage("Slug is required.")
                .MaximumLength(100)
                .WithMessage("Slug cannot exceed 100 characters.")
                .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")
                .WithMessage("Slug can contain lowercase letters, numbers and hyphens only.");
        }
    }
}
