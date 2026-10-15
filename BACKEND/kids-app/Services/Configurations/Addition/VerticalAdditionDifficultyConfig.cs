namespace kids_app.Services.Configurations.Addition
{
    public static class VerticalAdditionDifficultyConfig
    {
        public static readonly Dictionary<int,Dictionary<int, DifficultyRange[]>> ByLevelAndDigits = new()
        {
            [3] = new()
            {
                [2] = new[]
                {
                    new DifficultyRange(10, 39), // Easy
                    new DifficultyRange(20, 69), // Medium
                    new DifficultyRange(40, 99)  // Hard
                },

                [3] = new[]
                {
                    new DifficultyRange(100, 399), // Easy
                    new DifficultyRange(200, 699), // Medium
                    new DifficultyRange(400, 999)  // Hard
                },
                [4] = new[]
                {
                    new DifficultyRange(1000, 3999), // Easy
                    new DifficultyRange(2000, 6999), // Medium
                    new DifficultyRange(4000, 9999)  // Hard
                }
            },
            [4] = new()
            {
                [2] = new[]
                {
                    new DifficultyRange(20, 49),
                    new DifficultyRange(30, 79),
                    new DifficultyRange(50, 99)
                },

                [3] = new[]
                {
                    new DifficultyRange(100, 499),
                    new DifficultyRange(200, 799),
                    new DifficultyRange(500, 999)
                },

                [4] = new[]
                {
                    new DifficultyRange(1000, 4999),
                    new DifficultyRange(2000, 7999),
                    new DifficultyRange(5000, 9999)
                }
            }
        
    };
    }
}