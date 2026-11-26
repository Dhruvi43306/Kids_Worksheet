using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations.Reading
{
    public static class ReadingDifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]>
            ReadingFundamentalsAlphabetByLevel = new()
        {
            {
                1,
                new[]
                {
                    new DifficultyRange('A', 'J'),  // Easy
                    new DifficultyRange('A', 'N'),  // Medium
                    new DifficultyRange('A', 'R')   // Hard
                }
            },
            {
                2,
                new[]
                {
                    new DifficultyRange('A', 'J'),
                    new DifficultyRange('A', 'R'),
                    new DifficultyRange('A', 'V')
                }
            },
            {
                3,
                new[]
                {
                    new DifficultyRange('A', 'N'),
                    new DifficultyRange('A', 'V'),
                    new DifficultyRange('A', 'Z')
                }
            },
            {
                4,
                new[]
                {
                    new DifficultyRange('A', 'R'),
                    new DifficultyRange('A', 'Z'),
                    new DifficultyRange('A', 'Z')
                }
            }
        };

        // Keep your existing property name working.
        public static readonly Dictionary<int, DifficultyRange[]>
            IdentifyUpperLowerCaseByLevel =
                ReadingFundamentalsAlphabetByLevel;
    }
}