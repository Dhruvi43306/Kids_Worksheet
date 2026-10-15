
using kids_app.Models;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;

namespace kids_app.Services
{

    public partial class Grade2WorksheetGenerationService
    {
        private GeneratedQuestion GenerateDivisionAdvance(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var dividendRange = GetDifficultyRange(Grade2_Div_Mul_DifficultyConfig.DivisionDividendByLevel,levelId,actualDifficulty);

            var multiStepRange = GetDifficultyRange(
                Grade2_Div_Mul_DifficultyConfig.MultiStepTotalByLevel,
                levelId,
                actualDifficulty);

            if (!Grade2_Div_Mul_DifficultyConfig
                    .SingleDigitOperandMaxByLevel.TryGetValue(
                        levelId, out var operandLimits) ||
                actualDifficulty < 1 ||
                actualDifficulty > operandLimits.Length)
            {
                throw new InvalidOperationException(
                    $"No Grade 2 division settings for level {levelId}.");
            }

            int operandMax = operandLimits[actualDifficulty - 1];

            var factors = Enumerable.Range(2, operandMax - 1).ToList();

            switch (code)
            {
                case "DIVISION_QUOTIENT_REMAINDER_EQUATION":
                    {
                        var candidates = (
                            from divisor in factors
                            from quotient in factors
                            from remainder in Enumerable.Range(1, divisor - 1)
                            let dividend = divisor * quotient + remainder
                            where dividend >= dividendRange.Min
                            where dividend <= dividendRange.Max
                            select (
                                Dividend: dividend,
                                Divisor: divisor,
                                Quotient: quotient,
                                Remainder: remainder
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G2_DIVISION_QUOTIENT_REMAINDER_EQUATION",
                            x => $"{x.Dividend}:{x.Divisor}:{x.Remainder}",
                            usedGameCombinations);

                        string equation =
                            $"{selected.Dividend} = " +
                            $"({selected.Divisor} × □) + {selected.Remainder}";

                        string questionText =
                            $"Complete the division relationship: {equation}.";

                        var data = new
                        {
                            renderKey = "DivisionAdvanced",
                            questionType = code,
                            title = "Understand the Remainder",
                            dividend = selected.Dividend,
                            divisor = selected.Divisor,
                            remainder = selected.Remainder,
                            equation,
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Quotient.ToString());
                    }

                case "DIVISION_MULTI_STEP_GROUPING":
                    {
                        var candidates = (
                            from total in Enumerable.Range(
                                multiStepRange.Min,
                                multiStepRange.Max - multiStepRange.Min + 1)
                            from groupCount in factors
                            where total % groupCount == 0
                            let itemsPerGroup = total / groupCount
                            where itemsPerGroup > 1
                            from removedPerGroup in Enumerable.Range(1, 3)
                            where removedPerGroup < itemsPerGroup
                            let remainingPerGroup =
                                itemsPerGroup - removedPerGroup
                            let remainingTotal =
                                remainingPerGroup * groupCount
                            select (
                                Total: total,
                                GroupCount: groupCount,
                                ItemsPerGroup: itemsPerGroup,
                                RemovedPerGroup: removedPerGroup,
                                RemainingPerGroup: remainingPerGroup,
                                RemainingTotal: remainingTotal
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G2_DIVISION_MULTI_STEP_GROUPING",
                            x =>
                                $"{x.Total}:{x.GroupCount}:" +
                                $"{x.RemovedPerGroup}",
                            usedGameCombinations);

                        string questionText =
                            $"There are {selected.Total} crayons shared equally " +
                            $"among {selected.GroupCount} groups. Then " +
                            $"{selected.RemovedPerGroup} crayons are removed " +
                            "from every group. How many crayons remain altogether?";

                        var data = new
                        {
                            renderKey = "DivisionAdvanced",
                            questionType = code,
                            title = "Solve the Grouping Challenge",
                            total = selected.Total,
                            groupCount = selected.GroupCount,
                            itemsPerGroup = selected.ItemsPerGroup,
                            removedPerGroup = selected.RemovedPerGroup,
                            remainingPerGroup = selected.RemainingPerGroup,
                            remainingTotal = selected.RemainingTotal,
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.RemainingTotal.ToString());
                    }

                case "DIVISION_MISSING_DIVISION_DIGIT":
                    {
                        var candidates = (
                            from dividend in Enumerable.Range(
                                dividendRange.Min,
                                dividendRange.Max - dividendRange.Min + 1)
                            from divisor in factors
                            where dividend % divisor == 0
                            let quotient = dividend / divisor
                            where quotient >= 2 && quotient <= 9
                            select (
                                Dividend: dividend,
                                Divisor: divisor,
                                Quotient: quotient,
                                TensDigit: dividend / 10,
                                MissingDigit: dividend % 10
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G2_DIVISION_MISSING_DIVISION_DIGIT",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        string equation =
                            $"{selected.TensDigit}□ ÷ {selected.Divisor} " +
                            $"= {selected.Quotient}";

                        string questionText =
                            $"Find the missing digit in the division equation: " +
                            $"{equation}.";

                        var data = new
                        {
                            renderKey = "DivisionAdvanced",
                            questionType = code,
                            title = "Find the Missing Digit",
                            tensDigit = selected.TensDigit,
                            divisor = selected.Divisor,
                            quotient = selected.Quotient,
                            equation,
                            answerMode = "input",
                            answerType = "digit"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.MissingDigit.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 2 division type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateDivisionAdvancePuzzle(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(Grade2_Div_Mul_DifficultyConfig.DivisionDividendByLevel,levelId,actualDifficulty);

            if (!Grade2_Div_Mul_DifficultyConfig
                    .SingleDigitOperandMaxByLevel.TryGetValue(
                        levelId, out var limits) ||
                actualDifficulty > limits.Length)
            {
                throw new InvalidOperationException(
                    $"Division configuration missing for level {levelId}.");
            }

            int divisorMax = limits[actualDifficulty - 1];
            var divisors = Enumerable.Range(2, divisorMax - 1).ToList();

            switch (code)
            {
                // DIVISION_QUOTIENT_CHAIN_PUZZLE
                case "DIVISION_QUOTIENT_CHAIN_PUZZLE":
                    {
                        var candidates = (
                            from startingNumber in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from firstDivisor in divisors
                            where startingNumber % firstDivisor == 0
                            let intermediate = startingNumber / firstDivisor
                            from secondDivisor in divisors
                            where intermediate % secondDivisor == 0
                            let finalAnswer = intermediate / secondDivisor
                            select (
                                StartingNumber: startingNumber,
                                FirstDivisor: firstDivisor,
                                Intermediate: intermediate,
                                SecondDivisor: secondDivisor,
                                FinalAnswer: finalAnswer
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.StartingNumber}:{x.FirstDivisor}:" +
                                 $"{x.SecondDivisor}",
                            usedGameCombinations);

                        string questionText =
                            $"Start with {selected.StartingNumber}. Divide it by " +
                            $"{selected.FirstDivisor}, then divide the answer by " +
                            $"{selected.SecondDivisor}. What is the final answer?";

                        var data = new
                        {
                            renderKey = "DivisionAdvancedPuzzle",
                            questionType = code,
                            title = "Follow the Division Chain",
                            start = selected.StartingNumber,
                            firstDivisor = selected.FirstDivisor,
                            intermediate = selected.Intermediate,
                            secondDivisor = selected.SecondDivisor,
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.FinalAnswer.ToString());
                    }

                case "DIVISION_REMAINDER_CONTEXT_DECISION":
                    {
                        var candidates = (
                            from students in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)
                            from teamSize in divisors
                            let completeTeams = students / teamSize
                            let remainingStudents = students % teamSize
                            where remainingStudents > 0
                            where completeTeams > 0
                            select (
                                Students: students,
                                TeamSize: teamSize,
                                CompleteTeams: completeTeams,
                                RemainingStudents: remainingStudents
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.Students}:{x.TeamSize}",
                            usedGameCombinations);

                        string questionText =
                            $"A class has {selected.Students} students. " +
                            $"Each team must have exactly {selected.TeamSize} students. " +
                            "How many complete teams can be formed, and how many " +
                            "students remain without a complete team?";

                        var data = new
                        {
                            renderKey = "DivisionAdvancedPuzzle",
                            questionType = code,
                            title = "Make Complete Teams",
                            totalStudents = selected.Students,
                            studentsPerTeam = selected.TeamSize,
                            completeTeams = selected.CompleteTeams,
                            remainingStudents = selected.RemainingStudents,
                            answerMode = "two-number-input",
                            answerType = "teams-and-remainder"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            $"{selected.CompleteTeams},{selected.RemainingStudents}");
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 2 division type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateDivisionMeasurement(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int difficulty = ResolveDifficulty(difficultyId);

            switch (code)
            {
                case "DIVISION_SQUARE_SIDE_FROM_PERIMETER":
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

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => x.Perimeter.ToString(),
                            usedGameCombinations);

                        string questionText =
                            $"A square has a perimeter of {selected.Perimeter} cm. " +
                            "All four sides are equal. Find the length of one side.";

                        var data = new
                        {
                            renderKey = "DivisionMeasurement",
                            questionType = code,
                            title = "Find One Side of the Square",
                            perimeter = selected.Perimeter,
                            sideCount = 4,
                            unit = "cm",
                            equation = $"{selected.Perimeter} ÷ 4 = □",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            selected.SideLength.ToString());
                    }

                // ----------------------------------------------------
                // 2. DIVISION_MEASUREMENT_LENGTH_PER_GROUP
                // Length of each section = total / section count.
                // ----------------------------------------------------
                case "DIVISION_MEASUREMENT_LENGTH_PER_GROUP":
                    {
                        var range = GetDifficultyRange(
                            Grade2_Div_Mul_DifficultyConfig
                                .DivisionMeasurementTotalLengthByLevel,
                            levelId,
                            difficulty);

                        if (!Grade2_Div_Mul_DifficultyConfig
                                .RepeatedMeasurementCountMaxByLevel
                                .TryGetValue(levelId, out var countLimits) ||
                            difficulty > countLimits.Length)
                        {
                            throw new InvalidOperationException(
                                $"Measurement group counts are not configured for level {levelId}.");
                        }

                        int maxGroups = countLimits[difficulty - 1];

                        var candidates = (
                            from totalLength in Enumerable.Range(
                                range.Min,
                                range.Max - range.Min + 1)
                            from groups in Enumerable.Range(2, maxGroups - 1)
                            where totalLength % groups == 0
                            select new
                            {
                                TotalLength = totalLength,
                                GroupCount = groups,
                                LengthPerGroup = totalLength / groups
                            }).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.TotalLength}:{x.GroupCount}",
                            usedGameCombinations);

                        string questionText =
                            $"A ribbon is {selected.TotalLength} cm long. " +
                            $"It is divided into {selected.GroupCount} equal sections. " +
                            "How long is each section?";

                        var data = new
                        {
                            renderKey = "DivisionMeasurement",
                            questionType = code,
                            title = "Find the Length of Each Section",
                            totalLength = selected.TotalLength,
                            sectionCount = selected.GroupCount,
                            unit = "cm",
                            equation =
                                $"{selected.TotalLength} ÷ {selected.GroupCount} = □",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            selected.LengthPerGroup.ToString());
                    }

                // ----------------------------------------------------
                // 3. DIVISION_TIME_PER_ACTIVITY
                // Time per activity = total time / activity count.
                // ----------------------------------------------------
                case "DIVISION_TIME_PER_ACTIVITY":
                    {
                        var range = GetDifficultyRange(
                            Grade2_Div_Mul_DifficultyConfig
                                .DivisionActivityTotalMinutesByLevel,
                            levelId,
                            difficulty);

                        if (!Grade2_Div_Mul_DifficultyConfig
                                .DivisionActivityCountMaxByLevel
                                .TryGetValue(levelId, out var activityLimits) ||
                            difficulty > activityLimits.Length)
                        {
                            throw new InvalidOperationException(
                                $"Activity counts are not configured for level {levelId}.");
                        }

                        int maxActivities = activityLimits[difficulty - 1];

                        var candidates = (
                            from totalMinutes in Enumerable.Range(
                                range.Min,
                                range.Max - range.Min + 1)
                            from activities in Enumerable.Range(2, maxActivities - 1)
                            where totalMinutes % activities == 0
                            select new
                            {
                                TotalMinutes = totalMinutes,
                                ActivityCount = activities,
                                MinutesPerActivity = totalMinutes / activities
                            }).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.TotalMinutes}:{x.ActivityCount}",
                            usedGameCombinations);

                        string questionText =
                            $"A school has {selected.TotalMinutes} minutes for " +
                            $"{selected.ActivityCount} equally long activities. " +
                            "How many minutes can each activity last?";

                        var data = new
                        {
                            renderKey = "DivisionMeasurement",
                            questionType = code,
                            title = "Share the Time Equally",
                            totalMinutes = selected.TotalMinutes,
                            activityCount = selected.ActivityCount,
                            equation =
                                $"{selected.TotalMinutes} ÷ {selected.ActivityCount} = □",
                            unit = "minutes",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            selected.MinutesPerActivity.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 2 division type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateAdvancedDivisionNumericalDigit(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            code = code?.Trim().ToUpperInvariant() ?? string.Empty;

            var random = Random.Shared;

            switch (code)
            {
                case "DIVISION_MISSING_DIVISOR":
                case "DIVISION_MISSING_DIVIDEND":
                case "DIVISION_TWO_DIGIT_QUOTIENT":
                    {
                        var quotientRange = GetDifficultyRange(
                            Grade2_Div_Mul_DifficultyConfig
                                .DivisionQuotientByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from quotient in Enumerable.Range(
                                quotientRange.Min,
                                quotientRange.Max - quotientRange.Min + 1)
                            from divisor in Enumerable.Range(2, 9)
                            let dividend = quotient * divisor
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
                        {
                            throw new InvalidOperationException(
                                $"No unused division questions remain for {code}.");
                        }

                        var selected = candidates[
                            random.Next(candidates.Count)];

                        usedGameCombinations.Add(selected.Key);

                        if (code == "DIVISION_MISSING_DIVISOR")
                        {
                            return CreateQuestion(
                                questionNumber,
                                questionTypeId,
                                $"Find the missing divisor: {selected.Dividend} ÷ □ = {selected.Quotient}.",
                                new
                                {
                                    renderKey = "DivisionNumericalDigit",
                                    questionType = code,
                                    dividend = selected.Dividend,
                                    divisor = (int?)null,
                                    quotient = selected.Quotient,
                                    missingValue = "divisor",
                                    operatorSymbol = "÷",
                                    answerMode = "input",
                                    answerType = "number"
                                },
                                selected.Divisor.ToString());
                        }

                        if (code == "DIVISION_MISSING_DIVIDEND")
                        {
                            return CreateQuestion(
                                questionNumber,
                                questionTypeId,
                                $"Find the missing dividend: □ ÷ {selected.Divisor} = {selected.Quotient}.",
                                new
                                {
                                    renderKey = "DivisionNumericalDigit",
                                    questionType = code,
                                    dividend = (int?)null,
                                    divisor = selected.Divisor,
                                    quotient = selected.Quotient,
                                    missingValue = "dividend",
                                    operatorSymbol = "÷",
                                    answerMode = "input",
                                    answerType = "number"
                                },
                                selected.Dividend.ToString());
                        }

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.Dividend} ÷ {selected.Divisor}.",
                            new
                            {
                                renderKey = "DivisionNumericalDigit",
                                questionType = code,
                                dividend = selected.Dividend,
                                divisor = selected.Divisor,
                                quotient = selected.Quotient,
                                operatorSymbol = "÷",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Quotient.ToString());
                    }

                case "DIVISION_BY_FIVE_TEN_HUNDREED":
                    {
                        var dividendRange = GetDifficultyRange(
                            Grade2_Div_Mul_DifficultyConfig
                                .DivisionFixedDivisorDividendByLevel,
                            levelId,
                            actualDifficulty);

                        int[] divisors = { 5, 10, 100 };

                        var candidates = (
                            from dividend in Enumerable.Range(
                                dividendRange.Min,
                                dividendRange.Max - dividendRange.Min + 1)
                            from divisor in divisors
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
                        {
                            throw new InvalidOperationException(
                                "No unused division-by-5/10/100 questions remain.");
                        }

                        var selected = candidates[
                            random.Next(candidates.Count)];

                        usedGameCombinations.Add(selected.Key);

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            $"Calculate {selected.Dividend} ÷ {selected.Divisor}.",
                            new
                            {
                                renderKey = "DivisionNumericalDigit",
                                questionType = code,
                                dividend = selected.Dividend,
                                divisor = selected.Divisor,
                                quotient = selected.Quotient,
                                operatorSymbol = "÷",
                                answerMode = "input",
                                answerType = "number"
                            },
                            selected.Quotient.ToString());
                    }

                default:
                    throw new InvalidOperationException(
                        $"Unsupported division question type: {code}");
            }
        }


    }
}
