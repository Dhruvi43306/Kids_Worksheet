using kids_app.Dto.QuestionType;
using kids_app.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Dto.WorksheetCategory
{
    public class WorksheetCategoryDto
    {
        public int WorksheetCategoryId { get; set; }
         public int TopicId { get; set; }

        public string categoryName { get; set; }

        public string code { get; set; }

        public string description { get; set; }

        public int displayorder { get; set; }

        public bool isActive { get; set; }

        public List<QuestionTypeDto> questionTypes { get; set; }
           = new List<QuestionTypeDto>();
    }
}
