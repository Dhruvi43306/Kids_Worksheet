namespace kids_app.Services.Configurations.Addition
{
    public readonly record struct DifficultyRange(int Min, int Max);

    public static class AdditionDifficultyConfig
    {

        public static readonly Dictionary<int, DifficultyRange[]>  ByGrade = new()
        {
            [1] = new[]
            {
                new DifficultyRange(1,10),
                new DifficultyRange(5,15),
                new DifficultyRange(10,20)

            },
            [2] = new[]
            {
                new DifficultyRange(1,20),
                new DifficultyRange(20,40),
                new DifficultyRange(35,50)
            },
            [3] = new[]
            {
                new DifficultyRange(10, 40),
                new DifficultyRange(15, 60),
                new DifficultyRange(20, 80)
            },

            [4] = new[]
            {
                new DifficultyRange(20, 50),
                new DifficultyRange(40, 80),
                new DifficultyRange(70, 100)
            }
        };
       
    }
}
