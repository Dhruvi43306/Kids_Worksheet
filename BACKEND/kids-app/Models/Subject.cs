namespace kids_app.Models
{
    public class Subject
    {
        public int SubjectId { get; set; }

        public string SubjectName { get; set; } = string.Empty;

        public string slug { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public ICollection<WorksheetTopics> Topics { get; set; } = new List<WorksheetTopics>();
    }
}
