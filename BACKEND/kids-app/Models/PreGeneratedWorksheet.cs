
using System.ComponentModel.DataAnnotations;

namespace kids_app.Models
{
    public class PreGeneratedWorksheet
    {
        [Key]
        public int PreGeneratedWorksheetId { get; set; }

        // Composite FK to TopicLevelDifficulty
        public int TopicLevelConfigurationId { get; set; }

        public int DifficultyId { get; set; }

        // Navigation property
        public TopicLevelDifficulty TopicLevelDifficulty { get; set; } = null!;
        public int? WorksheetCategoryId { get; set; }

        public WorksheetCategory? WorksheetCategory { get; set; }

        [Required]
        [MaxLength(200)]
        public string WorksheetTitle { get; set; } = null!;

        [Required]
        [MaxLength(2000)]
        public string WorksheetUrl { get; set; } = null!;

        [MaxLength(2000)]
        public string? ThumbnailUrl { get; set; }

        [Required]
        [MaxLength(10)]
        public string FileType { get; set; } = null!;

        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
