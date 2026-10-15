using kids_app.Models;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;
using static Mysqlx.Notice.Warning.Types;

namespace kids_app.Services
{
    public partial class Grade1WorksheetGenerationService
    {
        private GeneratedQuestion GenerateDivisionFacts(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, List<string> visualIcons, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.ByLevel, levelId, actualDifficulty);

            if (!Grade1_Div_Mul_DifficultyConfig.FactorMaxByLevel.TryGetValue(levelId, out var factorLimits) || actualDifficulty < 1 || actualDifficulty > factorLimits.Length)
            {
                throw new InvalidOperationException(
                    $"No factor limits configured for level {levelId}.");
            }

            int factorLimit = factorLimits[actualDifficulty - 1];

            var factors = Enumerable
                .Range(2, factorLimit - 1)
                .ToList();

            switch (code)
            {
                case "DIVISION_QUOTIENT_COMPARE":
                    {
                        var facts = (
                            from divisor in factors
                            from quotient in factors
                            let dividend = divisor * quotient
                            where dividend >= range.Min
                            where dividend <= range.Max
                            select (
                                Dividend: dividend,
                                Divisor: divisor,
                                Quotient: quotient
                            )).ToList();

                        var candidates = (
                            from left in facts
                            from right in facts
                            where left.Dividend != right.Dividend
                                || left.Divisor != right.Divisor
                            select (
                                LeftDividend: left.Dividend,
                                LeftDivisor: left.Divisor,
                                LeftQuotient: left.Quotient,
                                RightDividend: right.Dividend,
                                RightDivisor: right.Divisor,
                                RightQuotient: right.Quotient,
                                Answer: left.Quotient < right.Quotient
                                    ? "<"
                                    : left.Quotient > right.Quotient ? ">" : "="
                            )).ToList();

                        var selected = GetUnusedCandidate(candidates, "G1_DIVISION_QUOTIENT_COMPARE", x => $"{x.LeftDividend}:{x.LeftDivisor}:" + $"{x.RightDividend}:{x.RightDivisor}", usedGameCombinations);

                        string leftExpression = $"{selected.LeftDividend} ÷ {selected.LeftDivisor}";

                        string rightExpression = $"{selected.RightDividend} ÷ {selected.RightDivisor}";

                        string questionText = $"Compare the answers. Write <, >, or =: " + $"{leftExpression} □ {rightExpression}.";

                        var data = new
                        {
                            renderKey = "DivisionFacts",
                            questionType = code,
                            title = "Compare the Quotients",
                            leftExpression,
                            rightExpression,
                            leftQuotient = selected.LeftQuotient,
                            rightQuotient = selected.RightQuotient,
                            choices = new[] { "<", ">", "=" },
                            answerMode = "input",
                            answerType = "symbol"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Answer);
                    }
                case "DIVISION_ERROR_DETECTIVE":
                    {
                        var candidates = (
                            from divisor in factors
                            from quotient in factors
                            let dividend = divisor * quotient
                            where dividend >= range.Min
                            where dividend <= range.Max
                            select (
                                Dividend: dividend,
                                Divisor: divisor,
                                Quotient: quotient,
                                WrongAnswer: quotient + 1
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_DIVISION_ERROR_DETECTIVE",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        string equation = $"{selected.Dividend} ÷ {selected.Divisor} = " + $"{selected.WrongAnswer}";

                        string questionText = $"A student wrote {equation}. " + "Find and correct the mistake.";

                        var data = new
                        {
                            renderKey = "DivisionFacts",
                            questionType = code,
                            title = "Division Mistake Detective",
                            dividend = selected.Dividend,
                            divisor = selected.Divisor,
                            incorrectAnswer = selected.WrongAnswer,
                            equation,
                            instruction = "Write the correct quotient.",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Quotient.ToString());
                    }

                case "DIVISION_PACKING_EXTRA_GROUP":
                    {
                        var packingRange = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.PackingByLevel, levelId, actualDifficulty);

                        var candidates = (
                            from itemCount in Enumerable.Range(
                                packingRange.Min,
                                packingRange.Max - packingRange.Min + 1)
                            from capacity in factors
                            where itemCount > capacity
                            where itemCount % capacity != 0
                            let fullBoxes = itemCount / capacity
                            let remainingItems = itemCount % capacity
                            let boxesNeeded =
                                (itemCount + capacity - 1) / capacity
                            select (
                                ItemCount: itemCount,
                                Capacity: capacity,
                                FullBoxes: fullBoxes,
                                RemainingItems: remainingItems,
                                BoxesNeeded: boxesNeeded
                            )).ToList();

                        var selected = GetUnusedCandidate(candidates, "G1_DIVISION_PACKING_EXTRA_GROUP", x => $"{x.ItemCount}:{x.Capacity}", usedGameCombinations);

                        string icon = GetDatabaseVisualIcon(visualIcons ?? new List<string>(), questionNumber);

                        var items = Enumerable
                            .Range(1, selected.ItemCount)
                            .Select(index => new
                            {
                                id = $"ITEM_{index}",
                                icon
                            })
                            .ToArray();

                        var boxes = Enumerable
                            .Range(1, selected.BoxesNeeded)
                            .Select(boxNumber => new
                            {
                                id = $"BOX_{boxNumber}",
                                itemCount = boxNumber <= selected.FullBoxes
                                    ? selected.Capacity
                                    : selected.RemainingItems,
                                isPartiallyFilled =
                                    boxNumber == selected.BoxesNeeded
                            })
                            .ToArray();

                        string questionText =
                            $"There are {selected.ItemCount} objects. Each box " +
                            $"holds {selected.Capacity} objects. How many boxes " +
                            "are needed to pack all the objects? The last box " +
                            "may not be full.";

                        var data = new
                        {
                            renderKey = "DivisionFacts",
                            questionType = code,
                            title = "Pack Every Object",
                            icon,
                            itemName = "object",
                            itemNamePlural = "objects",
                            itemCount = selected.ItemCount,
                            boxCapacity = selected.Capacity,
                            fullBoxes = selected.FullBoxes,
                            remainingItems = selected.RemainingItems,
                            boxesNeeded = selected.BoxesNeeded,
                            items,
                            boxes,
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.BoxesNeeded.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 1 division type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateDivisionGameFacts(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string>? usedGameCombinations)
        {
            usedGameCombinations ??= new HashSet<string>();

            var range = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.ByLevel, levelId, difficultyId);

            var factors = Enumerable
                .Range(2, Math.Min(10, range.Max) - 1)
                .ToList();

            var facts = (
                from divisor in factors
                from quotient in factors
                let dividend = divisor * quotient
                where dividend >= range.Min
                where dividend <= range.Max
                select (
                    Dividend: dividend,
                    Divisor: divisor,
                    Quotient: quotient
                )
            ).ToList();

            switch (code)
            {
                case "DIVISION_QUOTIENT_TARGET_HUNT":
                    {
                        var candidates = (
                            from target in factors
                            from correctOne in facts
                            where correctOne.Quotient == target
                            from correctTwo in facts
                            where correctTwo.Quotient == target
                            where correctTwo.Divisor > correctOne.Divisor
                            from wrongOne in facts
                            where wrongOne.Quotient != target
                            from wrongTwo in facts
                            where wrongTwo.Quotient != target
                            where wrongTwo.Dividend != wrongOne.Dividend ||
                                  wrongTwo.Divisor != wrongOne.Divisor
                            select (
                                Target: target,
                                CorrectOne: correctOne,
                                CorrectTwo: correctTwo,
                                WrongOne: wrongOne,
                                WrongTwo: wrongTwo
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_DIVISION_QUOTIENT_TARGET_HUNT",
                            x =>
                                $"{x.Target}:" +
                                $"{x.CorrectOne.Dividend}:{x.CorrectOne.Divisor}:" +
                                $"{x.CorrectTwo.Dividend}:{x.CorrectTwo.Divisor}:" +
                                $"{x.WrongOne.Dividend}:{x.WrongOne.Divisor}:" +
                                $"{x.WrongTwo.Dividend}:{x.WrongTwo.Divisor}",
                            usedGameCombinations);

                        var options =
                            new List<(string Id, string Equation, bool Correct)>
                            {
                            (
                                "A",
                                $"{selected.CorrectOne.Dividend} ÷ {selected.CorrectOne.Divisor}",
                                true
                            ),
                            (
                                "B",
                                $"{selected.CorrectTwo.Dividend} ÷ {selected.CorrectTwo.Divisor}",
                                true
                            ),
                            (
                                "C",
                                $"{selected.WrongOne.Dividend} ÷ {selected.WrongOne.Divisor}",
                                false
                            ),
                            (
                                "D",
                                $"{selected.WrongTwo.Dividend} ÷ {selected.WrongTwo.Divisor}",
                                false
                            )
                            };

                        Shuffle(options);

                        string questionText =
                            $"Find all equations with a quotient of {selected.Target}.";

                        var data = new
                        {
                            renderKey = "DivisionFactGames",
                            questionType = code,
                            title = "Quotient Target Hunt",
                            targetQuotient = selected.Target,
                            options = options.Select(x => new
                            {
                                id = x.Id,
                                equation = x.Equation
                            }).ToArray(),
                            answerMode = "multiple-select",
                            answerType = "option-ids"
                        };

                        string answer = string.Join(",", options.Where(x => x.Correct).Select(x => x.Id).OrderBy(x => x));
                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
                    }

                case "DIVISION_REPEATED_SUBTRACTION_TRACE":
                    {
                        var candidates = facts
                            .Where(x => x.Quotient >= 2)
                            .ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_DIVISION_REPEATED_SUBTRACTION_TRACE",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        var steps = Enumerable
                            .Range(0, selected.Quotient + 1)
                            .Select(step =>
                                selected.Dividend - step * selected.Divisor)
                            .ToArray();

                        string questionText =
                            $"Start at {selected.Dividend}. Subtract " +
                            $"{selected.Divisor} repeatedly until you reach zero. " +
                            "How many times do you subtract?";

                        var data = new
                        {
                            renderKey = "DivisionFactGames",
                            questionType = code,
                            title = "Repeated Subtraction",
                            dividend = selected.Dividend,
                            divisor = selected.Divisor,
                            steps,
                            instruction = "Count the subtraction jumps.",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            selected.Quotient.ToString());
                    }
                case "DIVISION_QUOTIENT_PATTERN_GROUPING":
                    {
                        var candidates = (
                            from quotient in factors
                            from divisorOne in factors
                            where divisorOne * quotient >= range.Min
                            where divisorOne * quotient <= range.Max
                            from divisorTwo in factors
                            where divisorTwo > divisorOne
                            where divisorTwo * quotient <= range.Max
                            from divisorThree in factors
                            where divisorThree > divisorTwo
                            where divisorThree * quotient <= range.Max
                            select (
                                Quotient: quotient,
                                DivisorOne: divisorOne,
                                DivisorTwo: divisorTwo,
                                DivisorThree: divisorThree
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_DIVISION_QUOTIENT_PATTERN_GROUPING",
                            x =>
                                $"{x.Quotient}:" +
                                $"{x.DivisorOne}:" +
                                $"{x.DivisorTwo}:" +
                                $"{x.DivisorThree}",
                            usedGameCombinations);

                        var rows = new[]
                        {
                        new
                        {
                            id = "ROW_1",
                            equation =
                                $"{selected.DivisorOne * selected.Quotient} ÷ " +
                                $"{selected.DivisorOne}",
                            quotient = (int?)selected.Quotient
                        },
                        new
                        {
                            id = "ROW_2",
                            equation =
                                $"{selected.DivisorTwo * selected.Quotient} ÷ " +
                                $"{selected.DivisorTwo}",
                            quotient = (int?)selected.Quotient
                        },
                        new
                        {
                            id = "ROW_3",
                            equation =
                                $"{selected.DivisorThree * selected.Quotient} ÷ " +
                                $"{selected.DivisorThree}",
                            quotient = (int?)null
                        }
                    };

                        string questionText =
                            "Complete the quotient pattern. " +
                            "The first two equations have the same answer. " +
                            "What is the missing quotient in the third row?";

                        var data = new
                        {
                            renderKey = "DivisionFactGames",
                            questionType = code,
                            title = "Complete the Quotient Pattern",
                            rows,
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Quotient.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 1 division type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateDivisionRemainder(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.ByLevel, levelId, actualDifficulty);

            int factorMax = actualDifficulty switch
            {
                1 => 5,
                2 => 8,
                _ => 10
            };

            var factors = Enumerable
                .Range(2, factorMax - 1)
                .ToList();

            var facts = (
                from divisor in factors
                from quotient in factors
                let dividend = divisor * quotient
                where dividend >= range.Min && dividend <= range.Max
                select (
                    Dividend: dividend,
                    Divisor: divisor,
                    Quotient: quotient
                )
            ).ToList();

            switch (code)
            {
                case "DIVISION_QUOTIENT_CROSSWORD":
                    {
                        var candidates = (
                            from quotient in factors
                            from across in facts
                            where across.Quotient == quotient
                            from down in facts
                            where down.Quotient == quotient
                            where down.Divisor != across.Divisor
                            select (
                                Quotient: quotient,
                                Across: across,
                                Down: down
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_DIVISION_QUOTIENT_CROSSWORD",
                            x =>
                                $"{x.Quotient}:" +
                                $"{x.Across.Dividend}:{x.Across.Divisor}:" +
                                $"{x.Down.Dividend}:{x.Down.Divisor}",
                            usedGameCombinations);

                        string questionText =
                            "Solve the two crossing division clues. " +
                            "Both clues share the same single-digit answer.";

                        var data = new
                        {
                            renderKey = "DivisionQuotientCrossword",
                            questionType = code,
                            title = "Division Number Crossword",
                            clues = new[]
                            {
                            new
                            {
                                id = "ACROSS",
                                equation =
                                    $"{selected.Across.Dividend} ÷ " +
                                    $"{selected.Across.Divisor}"
                            },
                            new
                            {
                                id = "DOWN",
                                equation =
                                    $"{selected.Down.Dividend} ÷ " +
                                    $"{selected.Down.Divisor}"
                            }
                        },
                            crossingCell = "CENTER",
                            answerMode = "number-input"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Quotient.ToString());
                    }

                case "DIVISION_EXACT_OR_REMAINDER":
                    {
                        var divisions = (
                            from dividend in Enumerable.Range(
                                range.Min,
                                range.Max - range.Min + 1)
                            from divisor in factors
                            where dividend > divisor
                            select (
                                Dividend: dividend,
                                Divisor: divisor,
                                Quotient: dividend / divisor,
                                Remainder: dividend % divisor,
                                Kind: dividend % divisor == 0
                                    ? "Exact"
                                    : "Remainder"
                            )
                        ).ToList();

                        var exactCandidates = divisions
                            .Where(x => x.Remainder == 0)
                            .ToList();

                        var remainderCandidates = divisions
                            .Where(x => x.Remainder != 0)
                            .ToList();

                        var exactOne = GetUnusedCandidate(
                            exactCandidates,
                            "G1_DIVISION_EXACT_OR_REMAINDER_EXACT",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        var exactTwo = GetUnusedCandidate(
                            exactCandidates,
                            "G1_DIVISION_EXACT_OR_REMAINDER_EXACT",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        var remainderOne = GetUnusedCandidate(
                            remainderCandidates,
                            "G1_DIVISION_EXACT_OR_REMAINDER_LEFTOVER",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        var remainderTwo = GetUnusedCandidate(
                            remainderCandidates,
                            "G1_DIVISION_EXACT_OR_REMAINDER_LEFTOVER",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        var options = new List<(string Id, string Equation, string Classification)>
                            {
                            (
                                "A",
                                $"{exactOne.Dividend} ÷ {exactOne.Divisor}",
                                "Exact"
                            ),
                            (
                                "B",
                                $"{exactTwo.Dividend} ÷ {exactTwo.Divisor}",
                                "Exact"
                            ),
                            (
                                "C",
                                $"{remainderOne.Dividend} ÷ {remainderOne.Divisor}",
                                "Remainder"
                            ),
                            (
                                "D",
                                $"{remainderTwo.Dividend} ÷ {remainderTwo.Divisor}",
                                "Remainder"
                            )
                            };

                        Shuffle(options);

                        string questionText =
                            "Label each division calculation as Exact or Remainder.";

                        var data = new
                        {
                            renderKey = "DivisionExactOrRemainder",
                            questionType = code,
                            title = "Exact or Remainder?",
                            options = options.Select(x => new
                            {
                                id = x.Id,
                                equation = x.Equation
                            }).ToArray(),
                            choices = new[] { "Exact", "Remainder" },
                            answerMode = "classify-each"
                        };

                        string answer = string.Join(
                            ",",
                            options.Select(x =>
                                $"{x.Id}:{x.Classification}"));

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
                    }

                case "DIVISION_QUOTIENT_CODE_BREAKER":
                    {
                        var quotients = facts
                            .Select(x => x.Quotient)
                            .Distinct()
                            .ToList();

                        var combinations = (
                            from c in quotients
                            from a in quotients
                            where a != c
                            from t in quotients
                            where t != c && t != a
                            select (
                                CQuotient: c,
                                AQuotient: a,
                                TQuotient: t
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            combinations,
                            "G1_DIVISION_QUOTIENT_CODE_BREAKER",
                            x =>
                                $"{x.CQuotient}:{x.AQuotient}:{x.TQuotient}",
                            usedGameCombinations);

                        var cFacts = facts
                            .Where(x => x.Quotient == selected.CQuotient)
                            .ToList();

                        var aFacts = facts
                            .Where(x => x.Quotient == selected.AQuotient)
                            .ToList();

                        var tFacts = facts
                            .Where(x => x.Quotient == selected.TQuotient)
                            .ToList();

                        var cFact = cFacts[_random.Next(cFacts.Count)];
                        var aFact = aFacts[_random.Next(aFacts.Count)];
                        var tFact = tFacts[_random.Next(tFacts.Count)];

                        string questionText =
                            "Solve the division equations. Use the quotient code " +
                            "to discover the secret word.";

                        var data = new
                        {
                            renderKey = "DivisionQuotientCodeBreaker",
                            questionType = code,
                            title = "Division Code Breaker",
                            codeKey = new[]
                            {
                            new
                            {
                                quotient = selected.CQuotient,
                                letter = "C"
                            },
                            new
                            {
                                quotient = selected.AQuotient,
                                letter = "A"
                            },
                            new
                            {
                                quotient = selected.TQuotient,
                                letter = "T"
                            }
                        },
                            equations = new[]
                            {
                            new
                            {
                                id = "Q1",
                                equation =
                                    $"{cFact.Dividend} ÷ {cFact.Divisor} = □"
                            },
                            new
                            {
                                id = "Q2",
                                equation =
                                    $"{aFact.Dividend} ÷ {aFact.Divisor} = □"
                            },
                            new
                            {
                                id = "Q3",
                                equation =
                                    $"{tFact.Dividend} ÷ {tFact.Divisor} = □"
                            }
                        },
                            answerMode = "decode-word"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, "CAT");
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 1 division type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateDivisionPartialMachine(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.ByLevel, levelId, actualDifficulty);

            switch (code)
            {
                case "DIVISION_INPUT_OUTPUT_MACHINE":
                    {
                        var candidates = (
                            from divisor in Enumerable.Range(2, 8)
                            from quotient in Enumerable.Range(3, 7)
                            let dividend = divisor * quotient
                            where dividend >= range.Min
                            where dividend <= range.Max
                            select (
                                Divisor: divisor,
                                Quotient: quotient,
                                Dividend: dividend
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_DIVISION_INPUT_OUTPUT_MACHINE",
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        string questionText =
                            $"The machine divides by {selected.Divisor}. " +
                            $"Input: {selected.Dividend}. What is the output?";

                        var data = new
                        {
                            renderKey = "DivisionPartialCompletion",
                            questionType = code,
                            title = "Division Machine",
                            rule = $"÷ {selected.Divisor}",
                            input = selected.Dividend,
                            output = (int?)null,
                            knownExamples = new[]
                            {
                    new
                    {
                        input = selected.Divisor,
                        output = 1
                    },
                    new
                    {
                        input = selected.Divisor * 2,
                        output = 2
                    }
                },
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Quotient.ToString());
                    }

                case "DIVISION_PARTIAL_TABLE_COMPLETION":
                    {
                        int maxDivisor = Math.Min(9, range.Max / 4);

                        var candidates = (
                            from divisor in Enumerable.Range(2, maxDivisor - 1)
                            from missingQuotient in new[] { 2, 3, 4 }
                            select (Divisor: divisor, MissingQuotient: missingQuotient)
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_DIVISION_PARTIAL_TABLE_COMPLETION",
                            x => $"{x.Divisor}:{x.MissingQuotient}",
                            usedGameCombinations);

                        int[] quotients = { 2, 3, 4 };

                        var rows = quotients.Select(quotient => new
                        {
                            dividend = selected.Divisor * quotient,
                            divisor = selected.Divisor,
                            quotient = quotient == selected.MissingQuotient
                                ? (int?)null
                                : quotient
                        }).ToArray();

                        string questionText =
                            $"Complete the division table. " +
                            $"Find the missing answer when dividing by {selected.Divisor}.";

                        var data = new
                        {
                            renderKey = "DivisionPartialCompletion",
                            questionType = code,
                            title = "Complete the Division Table",
                            rows,
                            missingQuotient = selected.MissingQuotient,
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.MissingQuotient.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported division question type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateDivisionHorizontalVertical(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.ByLevel, levelId, actualDifficulty);

            switch (code)
            {
                case "DIVISION_TWO_DIGIT_BY_ONE_DIGIT_HORIZONTAL":
                case "DIVISION_TWO_DIGIT_BY_ONE_DIGIT_VERTICAL":
                    {
                        var operandRange = GetDifficultyRange(
                            Grade1_Two_Digit_Operand_DifficultyConfig.TwoDigitOperandByLevel,
                            levelId,
                            actualDifficulty);

                        if (!Grade1_Two_Digit_Operand_DifficultyConfig
                                .SingleDigitOperandMaxByLevel.TryGetValue(
                                    levelId,
                                    out var operandLimits) ||
                            actualDifficulty < 1 ||
                            actualDifficulty > operandLimits.Length)
                        {
                            throw new InvalidOperationException(
                                $"No single-digit operand range configured for " +
                                $"level {levelId}, difficulty {actualDifficulty}.");
                        }

                        int singleDigitMax = Math.Min(9, operandLimits[actualDifficulty - 1]);

                        if (singleDigitMax < 2)
                        {
                            throw new InvalidOperationException(
                                $"Invalid single-digit divisor maximum: {singleDigitMax}.");
                        }

                        var candidates = (
                            from dividend in Enumerable.Range(
                                operandRange.Min,
                                operandRange.Max - operandRange.Min + 1)

                            from divisor in Enumerable.Range(
                                2,
                                singleDigitMax - 1)

                            where dividend % divisor == 0

                            let quotient = dividend / divisor

                            where quotient <= 9

                            select (
                                Dividend: dividend,
                                Divisor: divisor,
                                Quotient: quotient
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        string layout =
                            code == "DIVISION_TWO_DIGIT_BY_ONE_DIGIT_VERTICAL"
                                ? "vertical"
                                : "horizontal";

                        string questionText = layout == "vertical"
                            ? $"Calculate {selected.Dividend} ÷ {selected.Divisor} " +
                              "using the vertical division method."
                            : $"Calculate: {selected.Dividend} ÷ " +
                              $"{selected.Divisor} = ?";

                        var data = new
                        {
                            renderKey = "DivisionTwoDigitByOneDigit",
                            questionType = code,
                            title = "Two-Digit Division",
                            layout,
                            firstNumber = selected.Dividend,
                            secondNumber = selected.Divisor,
                            equation =
                                $"{selected.Dividend} ÷ {selected.Divisor} = □",
                            verticalLayout = new
                            {
                                divisor = selected.Divisor,
                                dividend = selected.Dividend,
                                quotient = "□",
                                notation = "long-division"
                            },
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Quotient.ToString());
                    }
                default:
                    throw new ArgumentException(
                        $"Unsupported division question type: {code}",
                        nameof(code));
            }

        }
    }
}
