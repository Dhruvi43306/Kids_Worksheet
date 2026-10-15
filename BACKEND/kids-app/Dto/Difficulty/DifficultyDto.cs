namespace kids_app.Dto.Difficulty
{
    public class DifficultyDto
    {
        public int DifficultyId { get; set; }
        public string Name { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

    }
}
