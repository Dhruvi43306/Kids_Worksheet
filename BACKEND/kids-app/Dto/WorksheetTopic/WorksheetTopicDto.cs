using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Dto.WorksheetTopic
{
    public class WorksheetTopicDto
    {
        public int TopicId { get; set; }
        public int SubjectId { get; set; }

        public string TopicName { get; set; } = string.Empty;

        public string Slug { get; set; }

        public string? Description { get; set; }
    }
}
