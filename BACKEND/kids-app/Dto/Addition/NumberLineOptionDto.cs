namespace kids_app.Dto.Addition
{
    public class NumberLineOptionDto
    {
        public string Label { get; set; } = string.Empty;

        public List<int> Path { get; set; } = new();

        public List<NumberLineJumpDto> Jumps { get; set; } = new();

        public int FinalNumber { get; set; }

        public bool IsCorrect { get; set; }
    }
}
