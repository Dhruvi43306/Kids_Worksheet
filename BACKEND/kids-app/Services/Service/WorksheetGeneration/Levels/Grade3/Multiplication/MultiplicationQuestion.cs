using kids_app.Models;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;

namespace kids_app.Services
{
    public partial class Grade3WorksheetGenerationService
    {
        private GeneratedQuestion GenerateMultiplicationNumericalByThreeDigit(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            code = code?.Trim().ToUpperInvariant() ?? string.Empty;

            var random = Random.Shared;

            switch (code)
            {
                case "MULTIPLICATION_THREE_DIGIT_BY_ONE_DIGIT":
                    {
                        var range = GetDifficultyRange(Grade3_Div_Mul_DifficultyConfig.ThreeDigitByOneDigitFirstFactorByLevel,levelId,actualDifficulty);

                        int multiplierMax = GetDifficultyValue(Grade3_Div_Mul_DifficultyConfig.SingleDigitMultiplierMaxByLevel,levelId,actualDifficulty);

                        var candidates = (
                            from number in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from multiplier in Enumerable.Range(2, multiplierMax - 1)
                            let answer = number * multiplier
                            let key = $"{number}x{multiplier}"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                Number = number,
                                Multiplier = multiplier,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused three-digit multiplication questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.Number} × {selected.Multiplier}.",
                            new
                            {
                                renderKey = "MultiplicationNumericalThreeDigit",
                                questionType = code,
                                firstNumber = selected.Number,
                                secondNumber = selected.Multiplier,
                                operatorSymbol = "×",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Answer.ToString());
                    }

                case "MULTIPLICATION_TWO_DIGIT_BY_TWO_DIGIT_PARTIAL_PRODUCTS":
                    {
                        var range = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .TwoDigitFactorsByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from first in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from second in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            let onesProduct = first * (second % 10)
                            let tensProduct = first * (second / 10) * 10
                            let answer = first * second
                            let key = $"{first}x{second}:PARTIAL"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                First = first,
                                Second = second,
                                OnesProduct = onesProduct,
                                TensProduct = tensProduct,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused partial-products questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.First} × {selected.Second} using partial products.",
                            new
                            {
                                renderKey = "MultiplicationNumericalThreeDigit",
                                questionType = code,
                                firstNumber = selected.First,
                                secondNumber = selected.Second,
                                operatorSymbol = "×",
                                onesPartialProduct = selected.OnesProduct,
                                tensPartialProduct = selected.TensProduct,
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Answer.ToString());
                    }

                case "MULTIPLICATION_THREE_DIGIT_REGROUPING_COLUMNS":
                    {
                        var range = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .RegroupingFirstFactorByLevel,
                            levelId,
                            actualDifficulty);

                        int multiplierMax = GetDifficultyValue(
                            Grade3_Div_Mul_DifficultyConfig
                                .SingleDigitMultiplierMaxByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from number in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from multiplier in Enumerable.Range(2, multiplierMax - 1)
                            let onesCarry = (number % 10) * multiplier >= 10
                            let tensCarry = ((number / 10) % 10) * multiplier
                                + (((number % 10) * multiplier) / 10) >= 10
                            let answer = number * multiplier
                            let key = $"{number}x{multiplier}:REGROUP"
                            where onesCarry
                                && !usedGameCombinations.Contains(key)
                            select new
                            {
                                Number = number,
                                Multiplier = multiplier,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused regrouping multiplication questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Multiply {selected.Number} × {selected.Multiplier}, regrouping where needed.",
                            new
                            {
                                renderKey = "MultiplicationNumericalThreeDigit",
                                questionType = code,
                                firstNumber = selected.Number,
                                secondNumber = selected.Multiplier,
                                operatorSymbol = "×",
                                showColumns = true,
                                allowRegrouping = true,
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Answer.ToString());
                    }

                case "MULTIPLICATION_MULTI_STEP_NUMBER_EXPRESSION":
                    {
                        var firstRange = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .MultiStepFirstNumberByLevel,
                            levelId,
                            actualDifficulty);

                        var adjustmentRange = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .MultiStepAdjustmentByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from first in Enumerable.Range(
                                firstRange.Min, firstRange.Max - firstRange.Min + 1)
                            from multiplier in Enumerable.Range(2, 9)
                            from adjustment in Enumerable.Range(
                                adjustmentRange.Min,
                                adjustmentRange.Max - adjustmentRange.Min + 1)
                            from operation in new[] { "+", "-" }
                            let product = first * multiplier
                            let answer = operation == "+"
                                ? product + adjustment
                                : product - adjustment
                            let key = $"{first}x{multiplier}{operation}{adjustment}"
                            where answer >= 0
                                && !usedGameCombinations.Contains(key)
                            select new
                            {
                                First = first,
                                Multiplier = multiplier,
                                Adjustment = adjustment,
                                Operation = operation,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused multi-step multiplication questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.First} × {selected.Multiplier} {selected.Operation} {selected.Adjustment}.",
                            new
                            {
                                renderKey = "MultiplicationNumericalThreeDigit",
                                questionType = code,
                                firstNumber = selected.First,
                                secondNumber = selected.Multiplier,
                                operatorSymbol = "×",
                                adjustmentOperator = selected.Operation,
                                adjustmentNumber = selected.Adjustment,
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Answer.ToString());
                    }

                default:
                    throw new InvalidOperationException(
                        $"Unsupported Grade 3 multiplication question type: {code}");
            }
        }
    }
}
