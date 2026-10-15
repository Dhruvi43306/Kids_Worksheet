
using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations
{
    public static class SubtractionNumberPropertiesDifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]> ByGrade = new()
        {
            [2] = new[]
            {
                new DifficultyRange(1, 99),
                new DifficultyRange(1, 199),
                new DifficultyRange(1, 999)
            },

            [3] = new[]
            {
                new DifficultyRange(1, 199),
                new DifficultyRange(1, 999),
                new DifficultyRange(1, 9999)
            },

            [4] = new[]
            {
                new DifficultyRange(1, 999),
                new DifficultyRange(1, 9999),
                new DifficultyRange(1, 99999)
            }
        };
    }
}
