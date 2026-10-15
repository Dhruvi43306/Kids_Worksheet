
using kids_app.Models;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;


namespace kids_app.Services
{
    public partial class Grade1WorksheetGenerationService
    {

        private GeneratedQuestion GenerateMultiplicationFacts(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(
                Grade1_Div_Mul_DifficultyConfig.ByLevel,
                levelId,
                actualDifficulty);

            if (!Grade1_Div_Mul_DifficultyConfig.ByLevel
                    .TryGetValue(levelId, out var factorLimits) ||
                actualDifficulty < 1 ||
                actualDifficulty > factorLimits.Length)
            {
                throw new InvalidOperationException(
                    $"No factor limits configured for level {levelId}.");
            }

            DifficultyRange factorRange = factorLimits[actualDifficulty - 1];

            int factorMin = Math.Max(2, factorRange.Min);
            int factorMax = factorRange.Max;

            if (factorMin > factorMax)
            {
                throw new InvalidOperationException(
                    $"Invalid factor range: {factorMin}-{factorMax}.");
            }

            var factors = Enumerable
                .Range(factorMin, factorMax - factorMin + 1)
                .ToList();

            switch (code)
            {
                case "MULTIPLICATION_PRODUCT_COMPARE":
                    {
                        var candidates = (
                            from a in factors
                            from b in factors
                            from c in factors
                            from d in factors
                            let leftProduct = a * b
                            let rightProduct = c * d
                            where leftProduct >= range.Min &&
                                  leftProduct <= range.Max &&
                                  rightProduct >= range.Min &&
                                  rightProduct <= range.Max
                            where a != c || b != d
                            select (
                                A: a,
                                B: b,
                                C: c,
                                D: d,
                                LeftProduct: leftProduct,
                                RightProduct: rightProduct,
                                Answer: leftProduct < rightProduct
                                    ? "<"
                                    : leftProduct > rightProduct ? ">" : "="
                            )).ToList();

                        var selected = GetUnusedCandidate(candidates, "G1_MULTIPLICATION_PRODUCT_COMPARE", x => $"{x.A}:{x.B}:{x.C}:{x.D}", usedGameCombinations);

                        string leftExpression = $"{selected.A} × {selected.B}";
                        string rightExpression = $"{selected.C} × {selected.D}";

                        string questionText =
                            $"Compare the products. Write <, >, or =: " +
                            $"{leftExpression} □ {rightExpression}.";

                        var data = new
                        {
                            renderKey = "MultiplicationFacts",
                            questionType = code,
                            title = "Compare the Products",
                            leftExpression,
                            rightExpression,
                            leftProduct = selected.LeftProduct,
                            rightProduct = selected.RightProduct,
                            choices = new[] { "<", ">", "=" },
                            answerMode = "input",
                            answerType = "symbol"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Answer);
                    }

                case "MULTIPLICATION_ERROR_DETECTIVE":
                    {
                        var candidates = (
                            from a in factors
                            from b in factors
                            let product = a * b
                            where product >= range.Min &&
                                  product <= range.Max
                            let wrongAnswer = product % 2 == 0
                                ? product + 1
                                : product - 1
                            select (
                                A: a,
                                B: b,
                                Product: product,
                                WrongAnswer: wrongAnswer
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_MULTIPLICATION_ERROR_DETECTIVE",
                            x => $"{x.A}:{x.B}",
                            usedGameCombinations);

                        string equation =
                            $"{selected.A} × {selected.B} = {selected.WrongAnswer}";

                        string questionText =
                            $"A student wrote {equation}. Find and correct the mistake.";

                        var data = new
                        {
                            renderKey = "MultiplicationFacts",
                            questionType = code,
                            title = "Math Mistake Detective",
                            firstFactor = selected.A,
                            secondFactor = selected.B,
                            incorrectAnswer = selected.WrongAnswer,
                            equation,
                            instruction = "Write the correct product.",
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Product.ToString());
                    }

                case "MULTIPLICATION_BALANCE_EQUATION":
                    {
                        var candidates = (
                            from a in factors
                            from b in factors
                            from c in factors
                            let product = a * b
                            where product >= range.Min &&
                                  product <= range.Max
                            where product % c == 0
                            let missingFactor = product / c
                            where factors.Contains(missingFactor)
                            where a != c || b != missingFactor
                            select (
                                A: a,
                                B: b,
                                C: c,
                                MissingFactor: missingFactor,
                                Product: product
                            )).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_MULTIPLICATION_BALANCE_EQUATION",
                            x => $"{x.A}:{x.B}:{x.C}",
                            usedGameCombinations);

                        string equation =
                            $"{selected.A} × {selected.B} = {selected.C} × □";

                        string questionText =
                            $"Balance both sides: {equation}. Find the missing number.";

                        var data = new
                        {
                            renderKey = "MultiplicationFacts",
                            questionType = code,
                            title = "Balance the Equation",
                            leftFactorA = selected.A,
                            leftFactorB = selected.B,
                            rightKnownFactor = selected.C,
                            missingFactor = selected.MissingFactor,
                            product = selected.Product,
                            equation,
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.MissingFactor.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 1 multiplication type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateMultiplicationGameFacts(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string>? usedGameCombinations)
        {
            usedGameCombinations ??= new HashSet<string>();

            var range = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.ByLevel, levelId, difficultyId);

            var factors = Enumerable
                .Range(2, Math.Min(10, range.Max) - 1)
                .ToList();

            var factorPairs = (
                from a in factors
                from b in factors
                let product = a * b
                where a <= b
                where product >= range.Min
                where product <= range.Max
                select (A: a, B: b, Product: product)
            ).ToList();

            switch (code)
            {
                case "MULTIPLICATION_TURNAROUND_FACT_MATCH":
                    {
                        var candidates = (
                            from a in factors
                            from b in factors
                            let product = a * b
                            where a != b
                            where product >= range.Min
                            where product <= range.Max
                            select (A: a, B: b, Product: product)
                        ).ToList();

                        var selected = GetUnusedCandidate(candidates, "G1_MULTIPLICATION_TURNAROUND_FACT_MATCH", x => $"{Math.Min(x.A, x.B)}:{Math.Max(x.A, x.B)}", usedGameCombinations);

                        string questionText = $"Write the turnaround fact for " + $"{selected.A} × {selected.B}.";

                        var data = new
                        {
                            renderKey = "MultiplicationFactGames",
                            questionType = code,
                            title = "Turnaround Facts",
                            firstFactor = selected.A,
                            secondFactor = selected.B,
                            product = selected.Product,
                            originalEquation =
                                $"{selected.A} × {selected.B} = {selected.Product}",
                            instruction = "Swap the factors.",
                            answerMode = "input",
                            answerType = "equation"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, $"{selected.B} × {selected.A}");
                    }

                case "MULTIPLICATION_TARGET_PRODUCT_PAIRS":
                    {
                        var targetGroups = factorPairs
                            .GroupBy(x => x.Product)
                            .Where(g => g.Count() >= 2)
                            .ToList();

                        var candidates = (
                            from targetGroup in targetGroups
                            from correctOne in targetGroup
                            from correctTwo in targetGroup
                            where correctOne.A < correctTwo.A ||
                                (correctOne.A == correctTwo.A &&
                                 correctOne.B < correctTwo.B)
                            from wrongOne in factorPairs
                            where wrongOne.Product != targetGroup.Key
                            from wrongTwo in factorPairs
                            where wrongTwo.Product != targetGroup.Key
                            where wrongTwo.A != wrongOne.A ||
                                  wrongTwo.B != wrongOne.B
                            select (
                                Target: targetGroup.Key,
                                CorrectOne: correctOne,
                                CorrectTwo: correctTwo,
                                WrongOne: wrongOne,
                                WrongTwo: wrongTwo
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_MULTIPLICATION_TARGET_PRODUCT_PAIRS",
                            x =>
                                $"{x.Target}:" +
                                $"{x.CorrectOne.A}:{x.CorrectOne.B}:" +
                                $"{x.CorrectTwo.A}:{x.CorrectTwo.B}:" +
                                $"{x.WrongOne.A}:{x.WrongOne.B}:" +
                                $"{x.WrongTwo.A}:{x.WrongTwo.B}",
                            usedGameCombinations);

                        var options =
                            new List<(string Id, string Expression, bool Correct)>
                            {
                            (
                                "A",
                                $"{selected.CorrectOne.A} × {selected.CorrectOne.B}",
                                true
                            ),
                            (
                                "B",
                                $"{selected.CorrectTwo.A} × {selected.CorrectTwo.B}",
                                true
                            ),
                            (
                                "C",
                                $"{selected.WrongOne.A} × {selected.WrongOne.B}",
                                false
                            ),
                            (
                                "D",
                                $"{selected.WrongTwo.A} × {selected.WrongTwo.B}",
                                false
                            )
                            };

                        Shuffle(options);

                        string questionText =
                            $"The target product is {selected.Target}. " +
                            "Select both multiplication pairs that make this product.";

                        var data = new
                        {
                            renderKey = "MultiplicationFactGames",
                            questionType = code,
                            title = "Find the Target Product",
                            targetProduct = selected.Target,
                            options = options.Select(x => new
                            {
                                id = x.Id,
                                expression = x.Expression
                            }).ToArray(),
                            answerMode = "multiple-select",
                            answerType = "option-ids"
                        };

                        string answer = string.Join(",", options.Where(x => x.Correct).Select(x => x.Id).OrderBy(x => x));

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
                    }

                case "MULTIPLICATION_PRODUCT_SORTING":
                    {
                        var products = factorPairs
                            .GroupBy(x => x.Product)
                            .Select(g => g.First())
                            .OrderBy(x => x.Product)
                            .ToList();

                        var candidates = (
                            from one in products
                            from two in products
                            where one.Product < two.Product
                            from three in products
                            where two.Product < three.Product
                            from four in products
                            where three.Product < four.Product
                            select (
                                One: one,
                                Two: two,
                                Three: three,
                                Four: four
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_MULTIPLICATION_PRODUCT_SORTING",
                            x =>
                                $"{x.One.Product}:" +
                                $"{x.Two.Product}:" +
                                $"{x.Three.Product}:" +
                                $"{x.Four.Product}",
                            usedGameCombinations);

                        var options =
                            new List<(string Id, string Equation, int Product)>
                            {
                            (
                                "A",
                                $"{selected.One.A} × {selected.One.B}",
                                selected.One.Product
                            ),
                            (
                                "B",
                                $"{selected.Two.A} × {selected.Two.B}",
                                selected.Two.Product
                            ),
                            (
                                "C",
                                $"{selected.Three.A} × {selected.Three.B}",
                                selected.Three.Product
                            ),
                            (
                                "D",
                                $"{selected.Four.A} × {selected.Four.B}",
                                selected.Four.Product
                            )
                            };

                        Shuffle(options);

                        string questionText =
                            "Arrange the multiplication equations " +
                            "from the smallest product to the largest product.";

                        var data = new
                        {
                            renderKey = "MultiplicationFactGames",
                            questionType = code,
                            title = "Sort the Products",
                            options = options.Select(x => new
                            {
                                id = x.Id,
                                equation = x.Equation
                            }).ToArray(),
                            instruction = "Place the equations in ascending order.",
                            answerMode = "ordered-option-ids",
                            answerType = "option-order"
                        };

                        string answer = string.Join(",", options.OrderBy(x => x.Product).Select(x => x.Id));

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 1 multiplication type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateMultiplicationProductMaze(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
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

            var pairs = (
                from a in factors
                from b in factors
                let product = a * b
                where product >= range.Min && product <= range.Max
                select (A: a, B: b, Product: product)
            ).ToList();

            switch (code)
            {
                case "MULTIPLICATION_PRODUCT_TABLE":
                    {
                        var selected = GetUnusedCandidate(pairs, "G1_MULTIPLICATION_PRODUCT_TABLE", x => $"{x.A}:{x.B}", usedGameCombinations);

                        var decoys = pairs
                            .Where(x => x.Product != selected.Product)
                            .ToList();

                        Shuffle(decoys);

                        if (decoys.Count < 6)
                        {
                            throw new InvalidOperationException(
                                "Not enough multiplication maze options.");
                        }

                        var cells = new[]
                        {
                        new
                        {
                            id = "A",
                            equation = $"{selected.A} × {selected.B}"
                        },
                        new
                        {
                            id = "B",
                            equation = $"{selected.B} × {selected.A}"
                        },
                        new
                        {
                            id = "C",
                            equation = $"{decoys[0].A} × {decoys[0].B}"
                        },
                        new
                        {
                            id = "D",
                            equation = $"{decoys[1].A} × {decoys[1].B}"
                        },
                        new
                        {
                            id = "E",
                            equation = $"{selected.A} × {selected.B}"
                        },
                        new
                        {
                            id = "F",
                            equation = $"{decoys[2].A} × {decoys[2].B}"
                        },
                        new
                        {
                            id = "G",
                            equation = $"{decoys[3].A} × {decoys[3].B}"
                        },
                        new
                        {
                            id = "H",
                            equation = $"{decoys[4].A} × {decoys[4].B}"
                        },
                        new
                        {
                            id = "I",
                            equation = $"{decoys[5].A} × {decoys[5].B}"
                        }
                    };

                        string questionText =
                            $"Find the path from A to E. " +
                            $"Move through neighboring cells whose product is " +
                            $"{selected.Product}.";

                        var data = new
                        {
                            renderKey = "MultiplicationProductMaze",
                            questionType = code,
                            title = "Multiplication Product Maze",
                            targetProduct = selected.Product,
                            startCell = "A",
                            finishCell = "E",
                            rows = 3,
                            columns = 3,
                            cells
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, "A,B,E");
                    }


                case "MULTIPLICATION_ZERO_ONE_RULE":
                    {
                        var numbers = Enumerable
                            .Range(2, range.Max - 1)
                            .ToList();

                        int number = GetUnusedCandidate(
                            numbers,
                            "G1_MULTIPLICATION_ZERO_ONE_RULE",
                            x => x.ToString(),
                            usedGameCombinations);

                        string questionText =
                            "Complete both multiplication rules: " +
                            $"{number} × 1 = □ and " +
                            $"{number} × 0 = □.";

                        var data = new
                        {
                            renderKey = "MultiplicationZeroOneRule",
                            questionType = code,
                            title = "Multiply by Zero and One",
                            equations = new[]
                            {
                            $"{number} × 1 = □",
                            $"{number} × 0 = □"
                        },
                            answerMode = "two-number-input"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, $"{number},0");
                    }

                case "MULTIPLICATION_PRODUCT_CODE_BREAKER":
                    {
                        var products = pairs
                            .Select(x => x.Product)
                            .Distinct()
                            .ToList();

                        var combinations = (
                            from c in products
                            from a in products
                            where a != c
                            from t in products
                            where t != c && t != a
                            select (
                                CProduct: c,
                                AProduct: a,
                                TProduct: t
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            combinations,
                            "G1_MULTIPLICATION_PRODUCT_CODE_BREAKER",
                            x =>
                                $"{x.CProduct}:{x.AProduct}:{x.TProduct}",
                            usedGameCombinations);

                        var cPairs = pairs
                            .Where(x => x.Product == selected.CProduct)
                            .ToList();

                        var aPairs = pairs
                            .Where(x => x.Product == selected.AProduct)
                            .ToList();

                        var tPairs = pairs
                            .Where(x => x.Product == selected.TProduct)
                            .ToList();

                        var cPair = cPairs[_random.Next(cPairs.Count)];
                        var aPair = aPairs[_random.Next(aPairs.Count)];
                        var tPair = tPairs[_random.Next(tPairs.Count)];

                        string questionText =
                            "Solve each multiplication equation. Use the product " +
                            "code to discover the secret word.";

                        var data = new
                        {
                            renderKey = "MultiplicationProductCodeBreaker",
                            questionType = code,
                            title = "Product Code Breaker",
                            codeKey = new[]
                            {
                            new
                            {
                                product = selected.CProduct,
                                letter = "C"
                            },
                            new
                            {
                                product = selected.AProduct,
                                letter = "A"
                            },
                            new
                            {
                                product = selected.TProduct,
                                letter = "T"
                            }
                        },
                            equations = new[]
                            {
                            new
                            {
                                id = "Q1",
                                equation = $"{cPair.A} × {cPair.B} = □"
                            },
                            new
                            {
                                id = "Q2",
                                equation = $"{aPair.A} × {aPair.B} = □"
                            },
                            new
                            {
                                id = "Q3",
                                equation = $"{tPair.A} × {tPair.B} = □"
                            }
                        },
                            answerMode = "decode-word"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, "CAT");
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported Grade 1 multiplication type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateMultiplicationPartialMachine(int questionNumber, int questionTypeId, string code, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(Grade1_Div_Mul_DifficultyConfig.ByLevel, levelId, actualDifficulty);

            switch (code)
            {
                case "MULTIPLICATION_INPUT_OUTPUT_MACHINE":
                    {
                        var candidates = (
                            from input in Enumerable.Range(3, 7)
                            from multiplier in Enumerable.Range(2, 8)
                            let output = input * multiplier
                            where output <= range.Max
                            select (Input: input, Multiplier: multiplier, Output: output)
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_MULTIPLICATION_INPUT_OUTPUT_MACHINE",
                            x => $"{x.Input}:{x.Multiplier}",
                            usedGameCombinations);

                        string questionText =
                            $"The machine multiplies by {selected.Multiplier}. " +
                            $"Input: {selected.Input}. What is the output?";

                        var data = new
                        {
                            renderKey = "MultiplicationPartialCompletion",
                            questionType = code,
                            title = "Multiplication Machine",
                            rule = $"× {selected.Multiplier}",
                            input = selected.Input,
                            output = (int?)null,
                            knownExamples = new[]
                            {
                    new
                    {
                        input = 1,
                        output = selected.Multiplier
                    },
                    new
                    {
                        input = 2,
                        output = selected.Multiplier * 2
                    }
                },
                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, selected.Output.ToString());
                    }

                case "MULTIPLICATION_TABLE_COMPLETION":
                    {
                        int maxRowFactor = Math.Min(9, range.Max / 4);

                        var candidates = (
                            from rowFactor in Enumerable.Range(1, maxRowFactor)
                            from missingColumn in new[] { 2, 3, 4 }
                            select (RowFactor: rowFactor, MissingColumn: missingColumn)
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            "G1_MULTIPLICATION_PARTIAL_TABLE_COMPLETION",
                            x => $"{x.RowFactor}:{x.MissingColumn}",
                            usedGameCombinations);

                        int?[] cells =
                        {
                            selected.RowFactor * 2,
                            selected.RowFactor * 3,
                            selected.RowFactor * 4
                        };

                        cells[selected.MissingColumn - 2] = null;

                        string questionText =
                            $"Complete the multiplication table for row " +
                            $"{selected.RowFactor}. Find the missing product.";

                        var data = new
                        {
                            renderKey = "MultiplicationPartialCompletion",
                            questionType = code,
                            title = "Complete the Multiplication Table",
                            rowFactor = selected.RowFactor,
                            columnHeaders = new[] { 2, 3, 4 },
                            cells,
                            missingColumn = selected.MissingColumn,
                            answerMode = "input",
                            answerType = "number"
                        };

                        int answer = selected.RowFactor * selected.MissingColumn;

                        return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported multiplication question type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateMultiplicationHorizontalVertical(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            switch (code)
            {
                case "MULTIPLICATION_TWO_DIGIT_BY_ONE_DIGIT_HORIZONTAL":
                case "MULTIPLICATION_TWO_DIGIT_BY_ONE_DIGIT_VERTICAL":
                    {
                        var operandConfig =
                            Grade1_Two_Digit_Operand_DifficultyConfig
                                .TwoDigitOperandByLevel;

                        if (!operandConfig.TryGetValue(
                                levelId,
                                out var operandLimits) ||
                            actualDifficulty < 1 ||
                            actualDifficulty > operandLimits.Length)
                        {
                            throw new InvalidOperationException(
                                $"No two-digit operand range is configured " +
                                $"for level {levelId}, difficulty {actualDifficulty}.");
                        }

                        DifficultyRange operandRange = operandLimits[actualDifficulty - 1];

                        int singleDigitMax = Math.Min(9, operandRange.Max);

                        if (singleDigitMax < 2)
                        {
                            throw new InvalidOperationException(
                                $"Invalid single-digit operand maximum: {singleDigitMax}.");
                        }

                        var candidates = (
                            from firstNumber in Enumerable.Range(
                                operandRange.Min,
                                operandRange.Max - operandRange.Min + 1)

                            from secondNumber in Enumerable.Range(
                                2,
                                singleDigitMax - 1)

                            select (
                                FirstNumber: firstNumber,
                                SecondNumber: secondNumber,
                                Product: firstNumber * secondNumber
                            )
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.FirstNumber}:{x.SecondNumber}",
                            usedGameCombinations);

                        string layout =
                            code == "MULTIPLICATION_TWO_DIGIT_BY_ONE_DIGIT_VERTICAL"
                                ? "vertical"
                                : "horizontal";

                        string questionText = layout == "vertical"
                            ? $"Calculate {selected.FirstNumber} × " +
                              $"{selected.SecondNumber} using the vertical method."
                            : $"Calculate: {selected.FirstNumber} × " +
                              $"{selected.SecondNumber} = ?";

                        var data = new
                        {
                            renderKey = "MultiplicationTwoDigitByOneDigitHorizontalOrVertical",
                            questionType = code,
                            title = "Two-Digit Multiplication",
                            layout,
                            firstNumber = selected.FirstNumber,
                            secondNumber = selected.SecondNumber,
                            equation =
                                $"{selected.FirstNumber} × " +
                                $"{selected.SecondNumber} = □",
                            verticalLayout = new
                            {
                                topLine = selected.FirstNumber.ToString(),
                                operatorLine = $"× {selected.SecondNumber}",
                                separatorLine = "─────",
                                answerLine = "□"
                            },
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

                default:
                    throw new ArgumentException(
                        $"Unsupported multiplication question type: {code}",
                        nameof(code));
            }
        }
    }
}
