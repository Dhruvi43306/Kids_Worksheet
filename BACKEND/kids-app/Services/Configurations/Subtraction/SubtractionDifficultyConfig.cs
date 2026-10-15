using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations
{
    public static class SubtractionDifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]> ByGrade = new()
        {
            [1] = new[]
            {
                new DifficultyRange(1, 10),  
                new DifficultyRange(1, 15),  
                new DifficultyRange(1, 20)   
            },

            [2] = new[]
            {
                new DifficultyRange(1, 20),  
                new DifficultyRange(1, 30),  
                new DifficultyRange(1, 40)   
            },

            [3] = new[]
            {
                new DifficultyRange(10, 40), 
                new DifficultyRange(10, 60), 
                new DifficultyRange(20, 80)  
            },

            [4] = new[]
            {
                new DifficultyRange(20, 60),  
                new DifficultyRange(30, 100), 
                new DifficultyRange(50, 150)  
            }
        };
    }
}