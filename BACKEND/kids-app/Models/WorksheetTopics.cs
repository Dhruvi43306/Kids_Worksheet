using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class WorksheetTopics
    {
            public int TopicId { get; set; }

            [ForeignKey(nameof(SubjectId))]
            public int SubjectId { get; set; }

            public Subject Subject { get; set; } = null!;

            public string TopicName { get; set; } = string.Empty;

            public string Slug { get; set; }

            public string? Description { get; set; }

            public bool IsActive { get; set; } = true;

            public ICollection<TopicLevelConfiguration> LevelConfigurations { get; set; }
                = new List<TopicLevelConfiguration>();



        }
    }

