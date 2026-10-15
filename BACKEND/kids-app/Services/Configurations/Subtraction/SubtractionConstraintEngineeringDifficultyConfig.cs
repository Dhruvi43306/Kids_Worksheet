
using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations
{
    public static class SubtractionConstraintEngineeringDifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]> ByGrade = new()
        {
            [3] = new[]
            {
                new DifficultyRange(100, 999),
                new DifficultyRange(100, 1999),
                new DifficultyRange(100, 9999)
            },

            [4] = new[]
            {
                new DifficultyRange(1000, 9999),
                new DifficultyRange(1000, 99999),
                new DifficultyRange(1000, 999999)
            }
        };
    }
}
