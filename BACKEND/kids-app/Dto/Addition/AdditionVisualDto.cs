namespace kids_app.Dto.Addition
{
    public class AdditionVisualDto
    {
        public string VisualType { get; set; } = null!;

        public List<string> FirstGroup { get; set; } = new();

        public List<string> SecondGroup { get; set; } = new();
    }
}
