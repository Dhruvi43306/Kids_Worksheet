namespace kids_app.Dto.IVisuleStyle
{
    public class IVisualStyleDto
    {
        public int VisualStyleId { get; set; }

        public string Name { get; set; } = null!;

        public string? Icon { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
