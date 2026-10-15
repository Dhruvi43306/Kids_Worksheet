
using System.Collections.Generic;
using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations.Easy_Mul_Division_Range
{
    public class Grade1_Div_Mul_DifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]> ByLevel = new()
        {
            [2] = new[]
            {
                new DifficultyRange(2, 20), 
                new DifficultyRange(2, 40), 
                new DifficultyRange(2, 60)  
            }
        };

        public static readonly Dictionary<int, int[]> FactorMaxByLevel = new()
        {
            [2] = new[] { 5, 8, 10 }
        };

        public static readonly Dictionary<int, DifficultyRange[]> PackingByLevel = new()
        {
            [2] = new[]
            {
                new DifficultyRange(6, 15),  
                new DifficultyRange(10, 25), 
                new DifficultyRange(15, 40)  
            }
        };
    }
}
