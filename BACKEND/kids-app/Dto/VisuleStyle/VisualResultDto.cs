namespace kids_app.Dto.VisuleStyle
{
    public class VisualResultDto
    {
        public string StyleName { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public List<string> Icons { get; set; } = new();
    }
}