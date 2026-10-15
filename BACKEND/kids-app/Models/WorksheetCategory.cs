using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class WorksheetCategory
    {
        [Key]
        public int WorksheetCategoryId { get; set; }

        [ForeignKey(nameof(TopicId))]
        public int TopicId { get; set; }

        public WorksheetTopics WorksheetTopics { get; set; } = null!;

        public string categoryName { get; set; }

        public string code { get; set; }

        public string description { get; set; }

        public int displayorder { get; set; }

        public bool isActive { get; set; }

        public ICollection<QuestionType> questionTypes = new List<QuestionType>();
    }
}
