
using System.Collections.Generic;
using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations.Easy_Mul_Division_Range
{
    public static class Grade3_Div_Mul_DifficultyConfig
    {
        // ============================================================
        // MULTIPLICATION: THREE-DIGIT NUMBER × ONE-DIGIT NUMBER
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            ThreeDigitByOneDigitFirstFactorByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(100, 299), // Easy
                new DifficultyRange(100, 599), // Medium
                new DifficultyRange(100, 999)  // Hard
            }
            };

        public static readonly Dictionary<int, int[]>
            SingleDigitMultiplierMaxByLevel = new()
            {
                [4] = new[] { 5, 7, 9 }
            };

        // ============================================================
        // MULTIPLICATION: TWO-DIGIT × TWO-DIGIT
        // Used by the partial-products question type.
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            TwoDigitFactorsByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(10, 29), // Easy
                new DifficultyRange(10, 59), // Medium
                new DifficultyRange(10, 99)  // Hard
            }
            };

        // ============================================================
        // MULTIPLICATION: REGROUPING
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            RegroupingFirstFactorByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(100, 399), // Easy
                new DifficultyRange(100, 699), // Medium
                new DifficultyRange(100, 999)  // Hard
            }
            };

        // ============================================================
        // MULTIPLICATION: MULTI-STEP NUMBER EXPRESSIONS
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            MultiStepFirstNumberByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(10, 29), // Easy
                new DifficultyRange(10, 59), // Medium
                new DifficultyRange(10, 99)  // Hard
            }
            };

        public static readonly Dictionary<int, DifficultyRange[]>
            MultiStepAdjustmentByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(10, 30), // Easy
                new DifficultyRange(10, 60), // Medium
                new DifficultyRange(10, 99)  // Hard
            }
            };

        // ============================================================
        // DIVISION: THREE-DIGIT DIVIDEND ÷ ONE-DIGIT DIVISOR
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            ThreeDigitDividendByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(100, 299), // Easy
                new DifficultyRange(100, 599), // Medium
                new DifficultyRange(100, 999)  // Hard
            }
            };

        public static readonly Dictionary<int, int[]>
            SingleDigitDivisorMaxByLevel = new()
            {
                [4] = new[] { 5, 7, 9 }
            };

        // ============================================================
        // DIVISION: TWO-DIGIT DIVISOR LONG DIVISION
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            TwoDigitDivisorByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(10, 19), // Easy
                new DifficultyRange(10, 49), // Medium
                new DifficultyRange(10, 99)  // Hard
            }
            };

        // ============================================================
        // DIVISION: ZERO IN THE QUOTIENT
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            ZeroInQuotientDividendByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(100, 299), // Easy
                new DifficultyRange(100, 599), // Medium
                new DifficultyRange(100, 999)  // Hard
            }
            };

        // ============================================================
        // DIVISION: VERIFY USING MULTIPLICATION
        // ============================================================
        public static readonly Dictionary<int, DifficultyRange[]>
            DivisionVerificationDividendByLevel = new()
            {
                [4] = new[]
            {
                new DifficultyRange(100, 299), // Easy
                new DifficultyRange(100, 599), // Medium
                new DifficultyRange(100, 999)  // Hard
            }
            };
    }
}
