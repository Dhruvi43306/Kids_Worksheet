namespace kids_app.Dto.VisuleStyle
{
    public class PatternResultDto
    {
        public string StyleName { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public List<string> Icons { get; set; } = new();

        public int MissingIndex { get; set; }

        public string Answer { get; set; } = string.Empty;

        public List<string> Options { get; set; } = new();
    }
}