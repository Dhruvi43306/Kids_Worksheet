using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations.Easy_Mul_Division_Range
{
    public class Early_Div_Mul_DifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]> ByLevel = new()
        {
            [1] = new[]
            {
                new DifficultyRange(2, 5),  
                new DifficultyRange(2, 8),  
                new DifficultyRange(2, 10) 
            }
        };
    }

    public class EarlyMultiplicationDifficultyConfig : Early_Div_Mul_DifficultyConfig
    {
    }
}
