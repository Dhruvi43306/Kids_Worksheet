
using System.Collections.Generic;
using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations.Easy_Mul_Division_Range
{
    public static class Grade2_Div_Mul_DifficultyConfig
    {
        public static readonly Dictionary<int, DifficultyRange[]>
            MultiplicationNumberByLevel = new()
            {
                [3] = new[]
            {
                new DifficultyRange(10, 29), 
                new DifficultyRange(10, 59), 
                new DifficultyRange(10, 99)  
            }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
            DivisionDividendByLevel = new()
            {
                [3] = new[]
            {
                new DifficultyRange(10, 39), 
                new DifficultyRange(10, 69), 
                new DifficultyRange(10, 99)  
            }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
            MultiStepTotalByLevel = new()
            {
                [3] = new[]
            {
                new DifficultyRange(12, 36), 
                new DifficultyRange(12, 60), 
                new DifficultyRange(12, 99)  
            }
            };

        public static readonly Dictionary<int, int[]>
            SingleDigitOperandMaxByLevel = new()
            {
                [3] = new[] { 5, 7, 9 }
            };


        public static readonly Dictionary<int, DifficultyRange[]>
            SquareSideLengthByLevel = new()
            {
                [3] = new[]
            {
        new DifficultyRange(2, 5),  
        new DifficultyRange(3, 10), 
        new DifficultyRange(5, 20)  
            }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
            RepeatedMeasurementUnitLengthByLevel = new()
            {
                [3] = new[]
            {
        new DifficultyRange(5, 12),  
        new DifficultyRange(5, 20), 
        new DifficultyRange(10, 25) 
            }
            };

        public static readonly Dictionary<int, int[]>
            RepeatedMeasurementCountMaxByLevel = new()
            {
                [3] = new[] { 4, 6, 9 }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
            RepeatedTimeDurationByLevel = new()
            {
                [3] = new[]
            {
        new DifficultyRange(5, 15),  
        new DifficultyRange(10, 25), 
        new DifficultyRange(15, 45)  
            }
            };

        public static readonly Dictionary<int, int[]>
            RepeatedTimeSessionCountMaxByLevel = new()
            {
                [3] = new[] { 3, 4, 6 }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
            DivisionMeasurementTotalLengthByLevel = new()
            {
                [3] = new[]
            {
        new DifficultyRange(12, 48),  
        new DifficultyRange(20, 80),  
        new DifficultyRange(30, 120) 
            }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
            DivisionActivityTotalMinutesByLevel = new()
            {
                [3] = new[]
            {
        new DifficultyRange(20, 60),   
        new DifficultyRange(30, 120),  
        new DifficultyRange(60, 180)   
            }
            };

        public static readonly Dictionary<int, int[]>
            DivisionActivityCountMaxByLevel = new()
            {
                [3] = new[] { 4, 6, 9 }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
       MultiplicationFactorByLevel = new()
       {
           [3] = new[]
       {
            new DifficultyRange(10, 30), 
            new DifficultyRange(10, 60), 
            new DifficultyRange(10, 99) 
       }
       };

        // Division: dividend range when divisor is 5, 10, or 100.
        public static readonly Dictionary<int, DifficultyRange[]>
            DivisionFixedDivisorDividendByLevel = new()
            {
                [3] = new[]
            {
            new DifficultyRange(100, 199), // Easy
            new DifficultyRange(100, 499), // Medium
            new DifficultyRange(100, 999)  // Hard
            }
            };

        // Division: required quotient range.
        public static readonly Dictionary<int, DifficultyRange[]>
            DivisionQuotientByLevel = new()
            {
                [3] = new[]
            {
            new DifficultyRange(10, 19), // Easy
            new DifficultyRange(10, 39), // Medium
            new DifficultyRange(10, 99)  // Hard
            }
            };
    }
}
