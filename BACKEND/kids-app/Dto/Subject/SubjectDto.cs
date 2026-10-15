using System.ComponentModel.DataAnnotations;

namespace kids_app.Dto.Subject
{
    public class SubjectDto
    {
        [Required]
        public string SubjectName { get; set; } = string.Empty;

        [Required]
        public string slug { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
