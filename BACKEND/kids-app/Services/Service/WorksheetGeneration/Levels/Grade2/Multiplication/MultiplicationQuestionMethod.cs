
using kids_app.Models;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;


namespace kids_app.Services
{
    public partial class Grade2WorksheetGenerationService
    {
        private GeneratedQuestion GenerateMultiplicationAdvance(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(
                Grade2_Div_Mul_DifficultyConfig.MultiplicationNumberByLevel,
                levelId,
                actualDifficulty);

            if (!Grade2_Div_Mul_DifficultyConfig
                    .SingleDigitOperandMaxByLevel.TryGetValue(
                        levelId, out var operandLimits) ||
                actualDifficulty < 1 ||
                actualDifficulty > operandLimits.Length)
            {
                throw new InvalidOperationException(
                    $"No Grade 2 multiplication settings for level {levelId}.");
            }

            int multiplierMax = operandLimits[actualDifficulty - 1];

            var candidates = (
                from number in Enumerable.Range(
                    range.Min, range.Max - range.Min + 1)
                from multiplier in Enumerable.Range(2, multiplierMax - 1)
                let product = number * multiplier
                select (
                    Number: number,
                    Multiplier: multiplier,
                    Product: product,
                    OnesProduct: (number % 10) * multiplier,
                    Carry: ((number % 10) * multiplier) / 10,
                    TensValue: (number / 10) * 10
                )).ToList();

            switch (code) { 
                case "MULTIPLICATION_REGROUPING_WORKED_STEPS":
                    {
                        var regroupingCandidates = candidates
                            .Where(x => x.OnesProduct >= 10)
                            .ToList();

                        var selected = GetUnusedCandidate(regroupingCandidates,"G2_MULTIPLICATION_REGROUPING_WORKED_STEPS",x => $"{x.Number}:{x.Multiplier}",usedGameCombinations);

                        int onesDigit = selected.OnesProduct % 10;
                        int tensCalculation = (selected.Number / 10) * selected.Multiplier + selected.Carry;

                        string questionText =
                            $"Calculate {selected.Number} × {selected.Multiplier}. " +
                            "Use the carrying method and show both steps.";

                        var data = new
                        {
                            renderKey = "MultiplicationAdvanced",
                            questionType = code,
                            title = "Multiply with Regrouping",
                            firstNumber = selected.Number,
                            secondNumber = selected.Multiplier,
                            onesCalculation =
                                $"{selected.Number % 10} × {selected.Multiplier} " +
                                $"= {selected.OnesProduct}",
                            carry = selected.Carry,
                            onesDigit,
                            tensCalculation =
                                $"{selected.Number / 10} × {selected.Multiplier} " +
                                $"+ {selected.Carry} = {tensCalculation}",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            selected.Product.ToString());
                    }

                case "MULTIPLICATION_EXPANDED_FORM_DECOMPOSITION":
                    {
                        var selected = GetUnusedCandidate(
                            candidates,
                            "G2_MULTIPLICATION_EXPANDED_FORM_DECOMPOSITION",
                            x => $"{x.Number}:{x.Multiplier}",
                            usedGameCombinations);

                        int tensProduct =
                            selected.TensValue * selected.Multiplier;

                        int onesProduct =
                            (selected.Number % 10) * selected.Multiplier;

                        string questionText =
                            $"Break {selected.Number} into tens and ones, " +
                            $"then calculate {selected.Number} × " +
                            $"{selected.Multiplier}.";

                        var data = new
                        {
                            renderKey = "MultiplicationAdvanced",
                            questionType = code,
                            title = "Multiply Using Expanded Form",
                            firstNumber = selected.Number,
                            secondNumber = selected.Multiplier,
                            tensValue = selected.TensValue,
                            onesValue = selected.Number % 10,
                            tensCalculation =
                                $"{selected.TensValue} × {selected.Multiplier}",
                            onesCalculation =
                                $"{selected.Number % 10} × {selected.Multiplier}",
                            partialTensProduct = tensProduct,
                            partialOnesProduct = onesProduct,
                            expandedEquation =
                                $"({selected.TensValue} × {selected.Multiplier}) + " +
                                $"({selected.Number % 10} × {selected.Multiplier})",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Product.ToString());
                    }

                case "MULTIPLICATION_MISSING_DIGIT_COLUMN":
                    {
                        var selected = GetUnusedCandidate(
                            candidates,
                            "G2_MULTIPLICATION_MISSING_DIGIT_COLUMN",
                            x => $"{x.Number}:{x.Multiplier}",
                            usedGameCombinations);

                        int missingDigit = selected.Number / 10;
                        int visibleOnesDigit = selected.Number % 10;

                        string questionText =
                            $"Find the missing digit: □{visibleOnesDigit} × " +
                            $"{selected.Multiplier} = {selected.Product}.";

                        var data = new
                        {
                            renderKey = "MultiplicationAdvanced",
                            questionType = code,
                            title = "Find the Missing Digit",
                            visibleOnesDigit,
                            multiplier = selected.Multiplier,
                            product = selected.Product,
                            equation =
                                $"□{visibleOnesDigit} × " +
                                $"{selected.Multiplier} = {selected.Product}",
                            answerMode = "input",
                            answerType = "digit"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,missingDigit.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 2 multiplication type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateMultiplicationAdvancePuzzle(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(Grade2_Div_Mul_DifficultyConfig.MultiplicationNumberByLevel,levelId,actualDifficulty);

            if (!Grade2_Div_Mul_DifficultyConfig
                    .SingleDigitOperandMaxByLevel.TryGetValue(
                        levelId, out var limits) ||
                actualDifficulty > limits.Length)
            {
                throw new InvalidOperationException(
                    $"Multiplication configuration missing for level {levelId}.");
            }

            int factorMax = limits[actualDifficulty - 1];
            var factors = Enumerable.Range(2, factorMax - 1).ToList();

            switch (code)
            {
               case "MULTIPLICATION_TWO_STAGE_BUNDLE_PUZZLE":
                    {
                        var candidates = (
                            from redGroups in factors
                            from redPerGroup in factors
                            from blueGroups in factors
                            from bluePerGroup in factors
                            let redTotal = redGroups * redPerGroup
                            let blueTotal = blueGroups * bluePerGroup
                            let total = redTotal + blueTotal
                            where total >= range.Min && total <= range.Max
                            select (
                                RedGroups: redGroups,
                                RedPerGroup: redPerGroup,
                                BlueGroups: blueGroups,
                                BluePerGroup: bluePerGroup,
                                RedTotal: redTotal,
                                BlueTotal: blueTotal,
                                Total: total
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.RedGroups}:{x.RedPerGroup}:" +
                                 $"{x.BlueGroups}:{x.BluePerGroup}",
                            usedGameCombinations);

                        string questionText =
                            $"{selected.RedGroups} boxes contain " +
                            $"{selected.RedPerGroup} red balls each. " +
                            $"{selected.BlueGroups} boxes contain " +
                            $"{selected.BluePerGroup} blue balls each. " +
                            "How many balls are there altogether?";

                        var data = new
                        {
                            renderKey = "MultiplicationAdvancedPuzzle",
                            questionType = code,
                            title = "Count Both Bundles",
                            red = new
                            {
                                groups = selected.RedGroups,
                                itemsPerGroup = selected.RedPerGroup,
                                total = selected.RedTotal
                            },
                            blue = new
                            {
                                groups = selected.BlueGroups,
                                itemsPerGroup = selected.BluePerGroup,
                                total = selected.BlueTotal
                            },
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Total.ToString());
                    }

                case "MULTIPLICATION_CONSTRAINT_SATISFACTION":
                    {
                        int productMin = Math.Max(20, range.Min);
                        int productMax = Math.Min(50, range.Max);

                        var oddDigits = new[] { 3, 5, 7, 9 };

                        var candidates = (
                            from fixedFactor in Enumerable.Range(
                                3, Math.Min(6, factorMax) - 2)
                            from firstOdd in oddDigits
                            let firstProduct = fixedFactor * firstOdd
                            where firstProduct >= productMin
                                && firstProduct <= productMax
                            from secondOdd in oddDigits
                            where secondOdd > firstOdd
                            let secondProduct = fixedFactor * secondOdd
                            where secondProduct >= productMin
                                && secondProduct <= productMax
                            select (
                                FixedFactor: fixedFactor,
                                FirstOdd: firstOdd,
                                SecondOdd: secondOdd
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.FixedFactor}:{x.FirstOdd}:{x.SecondOdd}",
                            usedGameCombinations);

                        var decoys = (
                            from a in Enumerable.Range(2, 8)
                            from b in Enumerable.Range(a, 10 - a)
                            let product = a * b
                            where product >= productMin && product <= productMax
                            where !(
                                (a == selected.FixedFactor && b % 2 != 0) ||
                                (b == selected.FixedFactor && a % 2 != 0))
                            select (A: a, B: b)
                        ).Distinct().ToList();

                        Shuffle(decoys);

                        if (decoys.Count < 2)
                        {
                            throw new InvalidOperationException(
                                "Not enough multiplication options for this difficulty.");
                        }

                        var options = new List<(
                            string Id, int A, int B, bool Correct)>
            {
                ("A", selected.FixedFactor, selected.FirstOdd, true),
                ("B", selected.FixedFactor, selected.SecondOdd, true),
                ("C", decoys[0].A, decoys[0].B, false),
                ("D", decoys[1].A, decoys[1].B, false)
            };

                        Shuffle(options);

                        string questionText =
                            $"Choose all equations where one factor is " +
                            $"{selected.FixedFactor}, the other factor is odd, " +
                            $"and the product is between {productMin} and {productMax}.";

                        var data = new
                        {
                            renderKey = "MultiplicationAdvancedPuzzle",
                            questionType = code,
                            title = "Solve the Multiplication Clues",
                            fixedFactor = selected.FixedFactor,
                            minimumProduct = productMin,
                            maximumProduct = productMax,
                            instruction = "Select all correct equations.",
                            options = options.Select(x => new
                            {
                                id = x.Id,
                                equation = $"{x.A} × {x.B}"
                            }).ToArray(),
                            answerMode = "multiple-select",
                            answerType = "option-ids"
                        };

                        string answer = string.Join(
                            ",",
                            options.Where(x => x.Correct)
                                   .Select(x => x.Id)
                                   .OrderBy(x => x));

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 2 multiplication type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateMultiplicationMeasurement(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int difficulty = ResolveDifficulty(difficultyId);

            switch (code)
            {
                case "MULTIPLICATION_SQUARE_PERIMETER":
                    {
                        var range = GetDifficultyRange(
                            Grade2_Div_Mul_DifficultyConfig.SquareSideLengthByLevel,
                            levelId,
                            difficulty);

                        var candidates = Enumerable
                            .Range(range.Min, range.Max - range.Min + 1)
                            .Select(side => new
                            {
                                SideLength = side,
                                Perimeter = side * 4
                            })
                            .ToList();

                        var selected = GetUnusedCandidate(candidates,code,x => x.SideLength.ToString(),usedGameCombinations);

                        string questionText =
                            $"A square has sides of {selected.SideLength} cm. " +
                            "What is its perimeter?";

                        var data = new
                        {
                            renderKey = "MultiplicationMeasurement",
                            questionType = code,
                            title = "Find the Square's Perimeter",
                            sideLength = selected.SideLength,
                            sideCount = 4,
                            unit = "cm",
                            equation = $"{selected.SideLength} × 4 = □",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Perimeter.ToString());
                    }

                case "MULTIPLICATION_REPEATED_MEASUREMENT_TOTAL":
                    {
                        var lengthRange = GetDifficultyRange(Grade2_Div_Mul_DifficultyConfig.RepeatedMeasurementUnitLengthByLevel,levelId,difficulty);

                        if (!Grade2_Div_Mul_DifficultyConfig
                                .RepeatedMeasurementCountMaxByLevel
                                .TryGetValue(levelId, out var countLimits) ||
                            difficulty > countLimits.Length)
                        {
                            throw new InvalidOperationException(
                                $"Measurement counts are not configured for level {levelId}.");
                        }

                        int maxCount = countLimits[difficulty - 1];

                        var candidates = (
                            from length in Enumerable.Range(
                                lengthRange.Min,
                                lengthRange.Max - lengthRange.Min + 1)
                            from count in Enumerable.Range(2, maxCount - 1)
                            select new
                            {
                                UnitLength = length,
                                Count = count,
                                TotalLength = length * count
                            }).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.UnitLength}:{x.Count}",
                            usedGameCombinations);

                        string questionText =
                            $"A craft project uses {selected.Count} ribbons. " +
                            $"Each ribbon is {selected.UnitLength} cm long. " +
                            "What is the total length of ribbon used?";

                        var data = new
                        {
                            renderKey = "MultiplicationMeasurement",
                            questionType = code,
                            title = "Calculate the Total Length",
                            unitLength = selected.UnitLength,
                            itemCount = selected.Count,
                            unit = "cm",
                            equation =
                                $"{selected.Count} × {selected.UnitLength} = □",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.TotalLength.ToString());
                    }

                case "MULTIPLICATION_REPEATED_TIME_BLOCKS":
                    {
                        var durationRange = GetDifficultyRange(
                            Grade2_Div_Mul_DifficultyConfig.RepeatedTimeDurationByLevel,
                            levelId,
                            difficulty);

                        if (!Grade2_Div_Mul_DifficultyConfig
                                .RepeatedTimeSessionCountMaxByLevel
                                .TryGetValue(levelId, out var sessionLimits) ||
                            difficulty > sessionLimits.Length)
                        {
                            throw new InvalidOperationException(
                                $"Session counts are not configured for level {levelId}.");
                        }

                        int maxSessions = sessionLimits[difficulty - 1];

                        var candidates = (
                            from duration in Enumerable.Range(
                                durationRange.Min,
                                durationRange.Max - durationRange.Min + 1)
                            from sessions in Enumerable.Range(2, maxSessions - 1)
                            select new
                            {
                                Duration = duration,
                                Sessions = sessions,
                                TotalMinutes = duration * sessions
                            }).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.Duration}:{x.Sessions}",
                            usedGameCombinations);

                        string questionText =
                            $"A school holds {selected.Sessions} activity sessions. " +
                            $"Each session lasts {selected.Duration} minutes. " +
                            "How many minutes do all the sessions take altogether?";

                        var data = new
                        {
                            renderKey = "MultiplicationMeasurement",
                            questionType = code,
                            title = "Calculate Total Activity Time",
                            sessionCount = selected.Sessions,
                            minutesPerSession = selected.Duration,
                            equation =
                                $"{selected.Sessions} × {selected.Duration} = □",
                            unit = "minutes",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.TotalMinutes.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 2 multiplication type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateAdvancedMultiplicationNumericalDigit(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(
                Grade2_Div_Mul_DifficultyConfig
                    .MultiplicationFactorByLevel,
                levelId,
                actualDifficulty);

            code = code?.Trim().ToUpperInvariant() ?? string.Empty;

            var random = Random.Shared;

            switch (code)
            {
                case "MULTIPLICATION_TWO_DIGIT_BY_TWO_DIGIT":
                    {
                        var candidates = (
                            from first in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from second in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            let answer = first * second
                            let key = $"{first}x{second}"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                First = first,
                                Second = second,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused two-digit multiplication questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.First} × {selected.Second}.",
                            new
                            {
                                renderKey = "MultiplicationNumericalDigit",
                                questionType = code,
                                firstNumber = selected.First,
                                secondNumber = selected.Second,
                                operatorSymbol = "×",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Answer.ToString());
                    }

                case "MULTIPLICATION_MISSING_SECOND_FACTOR":
                    {
                        var candidates = (
                            from first in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from second in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            let answer = first * second
                            let key = $"{first}x{second}=?"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                First = first,
                                Second = second,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused missing-second-factor questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Find the missing number: {selected.First} × □ = {selected.Answer}.",
                            new
                            {
                                renderKey = "MultiplicationNumericalDigit",
                                questionType = code,
                                firstNumber = selected.First,
                                secondNumber = (int?)null,
                                result = selected.Answer,
                                missingFactor = "second",
                                operatorSymbol = "×",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Second.ToString());
                    }

                case "MULTIPLICATION_MISSING_FIRST_FACTOR":
                    {
                        var candidates = (
                            from first in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from second in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            let answer = first * second
                            let key = $"?x{second}={answer}"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                First = first,
                                Second = second,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused missing-first-factor questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Find the missing number: □ × {selected.Second} = {selected.Answer}.",
                            new
                            {
                                renderKey = "MultiplicationNumericalDigit",
                                questionType = code,
                                firstNumber = (int?)null,
                                secondNumber = selected.Second,
                                result = selected.Answer,
                                missingFactor = "first",
                                operatorSymbol = "×",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.First.ToString());
                    }

                case "MULTIPLICATION_BY_FIVE_TEN_HUNDREED":
                    {
                        int[] multipliers = { 5, 10, 100 };

                        var candidates = (
                            from number in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from multiplier in multipliers
                            let answer = number * multiplier
                            let key = $"{number}x{multiplier}"
                            where !usedGameCombinations.Contains(key)
                            select new
                            {
                                First = number,
                                Second = multiplier,
                                Answer = answer,
                                Key = key
                            }
                        ).ToList();

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No unused multiplication-by-5/10/100 questions remain.");

                        var selected = candidates[random.Next(candidates.Count)];
                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.First} × {selected.Second}.",
                            new
                            {
                                renderKey = "MultiplicationNumericalDigit",
                                questionType = code,
                                firstNumber = selected.First,
                                secondNumber = selected.Second,
                                operatorSymbol = "×",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Answer.ToString());
                    }

                default:
                    throw new InvalidOperationException(
                        $"Unsupported multiplication question type: {code}");
            }
        }




    }
}
