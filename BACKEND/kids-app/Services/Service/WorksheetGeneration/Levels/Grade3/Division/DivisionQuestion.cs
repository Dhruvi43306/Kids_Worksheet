using kids_app.Models;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;

namespace kids_app.Services
{
    public partial class Grade3WorksheetGenerationService
    {
        private GeneratedQuestion GenerateDivisionNumericalByThreeDigit(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            code = code?.Trim().ToUpperInvariant() ?? string.Empty;

            var random = Random.Shared;

            switch (code)
            {
                case "DIVISION_THREE_DIGIT_BY_ONE_DIGIT":
                    {
                        var range = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .ThreeDigitDividendByLevel,
                            levelId,
                            actualDifficulty);

                        int divisorMax = GetDifficultyValue(
                            Grade3_Div_Mul_DifficultyConfig.SingleDigitMultiplierMaxByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from dividend in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from divisor in Enumerable.Range(2, divisorMax - 1)
                            where dividend % divisor == 0
                            let quotient = dividend / divisor
                            let key = $"{dividend}/{divisor}"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                Dividend = dividend,
                                Divisor = divisor,
                                Quotient = quotient,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused exact three-digit division questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.Dividend} ÷ {selected.Divisor}.",
                            new
                            {
                                renderKey = "DivisionNumericalThreeDigit",
                                questionType = code,
                                dividend = selected.Dividend,
                                divisor = selected.Divisor,
                                operatorSymbol = "÷",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Quotient.ToString());
                    }

                case "DIVISION_TWO_DIGIT_DIVISOR_LONG_METHOD":
                    {
                        var divisorRange = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .TwoDigitDivisorByLevel,
                            levelId,
                            actualDifficulty);

                        var dividendRange = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .ThreeDigitDividendByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from divisor in Enumerable.Range(
                                divisorRange.Min,
                                divisorRange.Max - divisorRange.Min + 1)
                            from quotient in Enumerable.Range(2, 99)
                            let dividend = divisor * quotient
                            let key = $"{dividend}/{divisor}:LONG"
                            where dividend >= dividendRange.Min
                                && dividend <= dividendRange.Max
                                && !usedGameCombinations.Contains(key)
                            select new
                            {
                                Dividend = dividend,
                                Divisor = divisor,
                                Quotient = quotient,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused two-digit-divisor long-division questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.Dividend} ÷ {selected.Divisor} using long division.",
                            new
                            {
                                renderKey = "DivisionNumericalThreeDigit",
                                questionType = code,
                                dividend = selected.Dividend,
                                divisor = selected.Divisor,
                                operatorSymbol = "÷",
                                showLongDivision = true,
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Quotient.ToString());
                    }

                case "DIVISION_ZERO_IN_QUOTIENT":
                    {
                        var range = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .ZeroInQuotientDividendByLevel,
                            levelId,
                            actualDifficulty);

                        int divisorMax = GetDifficultyValue(
                            Grade3_Div_Mul_DifficultyConfig
                                .SingleDigitDivisorMaxByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from dividend in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from divisor in Enumerable.Range(2, divisorMax - 1)
                            where dividend % divisor == 0
                            let quotient = dividend / divisor
                            where quotient >= 100
                                && quotient % 10 == 0
                            let key = $"{dividend}/{divisor}:ZERO"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                Dividend = dividend,
                                Divisor = divisor,
                                Quotient = quotient,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused division questions with a zero in the quotient remain for this range.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.Dividend} ÷ {selected.Divisor}. Pay attention to the zero in the quotient.",
                            new
                            {
                                renderKey = "DivisionNumericalThreeDigit",
                                questionType = code,
                                dividend = selected.Dividend,
                                divisor = selected.Divisor,
                                operatorSymbol = "÷",
                                highlightZeroInQuotient = true,
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Quotient.ToString());
                    }

                case "DIVISION_MULTIPLICATION_VERIFICATION":
                    {
                        var range = GetDifficultyRange(
                            Grade3_Div_Mul_DifficultyConfig
                                .DivisionVerificationDividendByLevel,
                            levelId,
                            actualDifficulty);

                        int divisorMax = GetDifficultyValue(
                            Grade3_Div_Mul_DifficultyConfig
                                .SingleDigitDivisorMaxByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from dividend in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from divisor in Enumerable.Range(2, divisorMax - 1)
                            where dividend % divisor == 0
                            let quotient = dividend / divisor
                            let key = $"{dividend}/{divisor}:VERIFY"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                Dividend = dividend,
                                Divisor = divisor,
                                Quotient = quotient,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused division-verification questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        bool isCorrect = random.Next(2) == 0;
                        int proposedQuotient = isCorrect
                            ? selected.Quotient
                            : selected.Quotient + random.Next(1, 4);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Check whether {selected.Dividend} ÷ {selected.Divisor} = {proposedQuotient} is correct using multiplication.",
                            new
                            {
                                renderKey = "DivisionNumericalThreeDigit",
                                questionType = code,
                                dividend = selected.Dividend,
                                divisor = selected.Divisor,
                                proposedQuotient,
                                operatorSymbol = "÷",
                                verificationOperator = "×",
                                answerMode = "choice",
                                answerType = "boolean",
                                options = new[] { "Correct", "Incorrect" }
                            },
                            isCorrect ? "Correct" : "Incorrect");
                    }

                default:
                    throw new InvalidOperationException(
                        $"Unsupported Grade 3 division question type: {code}");
            }
        }
    }
}
