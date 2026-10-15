namespace kids_app.Services.Configurations.Addition
{
    public class WholeHundredsAdditionDifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]> ByLevel = new()
        {
            [3] = new[]
            {
                 new DifficultyRange(100,500),
                 new DifficultyRange(100,700),
                 new DifficultyRange(100,900)
            },
            [4] = new[]
            {
                new DifficultyRange(100, 900),   
                new DifficultyRange(200, 1500),  
                new DifficultyRange(300, 2500)   
            }
        };

    }
}
