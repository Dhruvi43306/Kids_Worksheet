using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations.Easy_Mul_Division_Range
{
    public class Grade1_Two_Digit_Operand_DifficultyConfig
    {

        public static readonly Dictionary<int, DifficultyRange[]>
            TwoDigitOperandByLevel = new()
            {
                [2] = new[]
            {
        new DifficultyRange(10, 19), 
        new DifficultyRange(10, 39), 
        new DifficultyRange(10, 99)  
            }
            };

        public static readonly Dictionary<int, int[]>
            SingleDigitOperandMaxByLevel = new()
            {
                [2] = new[] { 3, 5, 9 }
            };

    }
}
