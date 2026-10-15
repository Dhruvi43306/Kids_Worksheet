using kids_app.Dto.Addition;
using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;
using kids_app.Services.Configurations;
using kids_app.Services.Configurations.Addition;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1.Cmp;
using System.Configuration;
using System.Text.Json;

namespace kids_app.Services
{
    public partial class Grade3WorksheetGenerationService
    {
        private AdditionVisualDto CreateAdditionVisual(List<string> visualIcons, int questionNumber, int firstCount, int secondCount)
        {
            string icon = GetDatabaseVisualIcon(visualIcons, questionNumber);

            return new AdditionVisualDto
            {
                VisualType = "database",
                FirstGroup = Enumerable.Repeat(icon, firstCount).ToList(),
                SecondGroup = Enumerable.Repeat(icon, secondCount).ToList()

            };
        }
        private GeneratedQuestion GenerateHowManyAltogether(int questionNumber, int questionTypeId, int levelId, int difficultyId, List<string> visualIcons)
        {
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var values = GenrateAdditionValues(levelId, actualDifficulty);
            var visual = CreateAdditionVisual(visualIcons, questionNumber, values.first, values.second);

            var data = new
            {
                QuestionType = "howManyAltogether",
                visualType = visual.VisualType,
                firstGroup = visual.FirstGroup,
                secondGroup = visual.SecondGroup,
                selectionMode = "input"
            };
            return CreateQuestion(questionNumber, questionTypeId, "How many objects are there altogether?", data, values.total.ToString());

        }
        private List<int> CreateAdditionOptions(int answer, int max)
        {
            var option = new HashSet<int> { answer };
            option.Add(Math.Max(1, answer - 1));
            option.Add(answer + 1);
            option.Add(answer + 2);
            while (option.Count < 4)
            {
                int value = _random.Next(1, max + 1);
                option.Add(value);
            }
            var result = option.ToList();
            Shuffle(result);
            return result;

        }
        private GeneratedQuestion GenerateAdditionOptions(int questionNumber, int questionTypeId, int levelId, int difficultyId, List<string> visualIcon)
        {
            var values = GenrateAdditionValues(levelId, difficultyId);
            var visual = CreateAdditionVisual(visualIcon, questionNumber, values.first, values.second);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            var options = CreateAdditionOptions(values.total, range.Max);
            var data = new
            {
                QuestionType = "countAndAddChoose",
                visualType = visual.VisualType,
                firstGroup = visual.FirstGroup,
                secondGroup = visual.SecondGroup,
                firstcount = values.first,
                secondcount = values.second,
                operatorSymbol = "+",
                options = options,
                selectionMode = "single"
            };

            Console.WriteLine($"Options: {string.Join(", ", options)}");
            return CreateQuestion(questionNumber, questionTypeId, $"Count the objects and choose the correct answer.", data, values.total.ToString());

        }
        private GeneratedQuestion GenerateMatchObjectsNumber(int questionNumber, int questionTypeId, int difficultyId, List<string> visualIcons)
        {
            int max = Math.Min(GetMaximumNumber(difficultyId), 10);
            int count = _random.Next(1, max + 1);
            var visual = CreateAdditionVisual(visualIcons, questionNumber, count, 0);
            var option = new List<int> { count };

            while (option.Count < 4)
            {
                int candidate = _random.Next(1, max + 1);
                if (!option.Contains(candidate))
                {
                    option.Add(candidate);
                }
            }
            Shuffle(option);
            var data = new
            {
                QuestionType = "matchObjectsNumber",
                firstGroup = visual.FirstGroup,
                count,
                option,
                selectionMode = "input"
            };
            return CreateQuestion(questionNumber, questionTypeId, $"How many objects are there?", data, count.ToString());
        }
        private GeneratedQuestion GenerateCompleteAdditionSentence(int questionNumber, int questionTypeId, int levelId, int difficultyId, List<string> visualIcons)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);

            int total = _random.Next(range.Min, range.Max + 1);
            int knowncount = _random.Next(1, total);
            int missingcount = total - knowncount;
            string icon = GetDatabaseVisualIcon(visualIcons, questionNumber);
            var objects = Enumerable.Repeat(icon, total).ToList();
            var data = new
            {
                questionType = "completeAdditionSentence",
                knowncount,
                totalcount = total,
                missingcount,
                objects,
                operatorSymbol = "+",
                selectionMode = "color",
                sentence = $"{knowncount} + ___ = {total}"
            };
            return CreateQuestion(questionNumber, questionTypeId, $"Color the remaining objects and complete the addition sentence.", data, missingcount.ToString());

        }
        private (int first, int second, int total) GenrateNumberLineAdditionValues()
        {
            const int min = 1;
            const int max = 10;
            int first;
            int second;
            int total;
            do
            {
                first = _random.Next(min, max);
                second = _random.Next(1, max - first + 1);
                total = first + second;
            } while (total > max);
            return (first, second, total);
        }
        private GeneratedQuestion GenratedNumberLineAddition(int questionNumber, int questionTypeId, int difficultyId)
        {
            var values = GenrateNumberLineAdditionValues();
            int first = values.first;
            int second = values.second;
            int total = values.total;

            string questionText;
            string answer;
            string questionMode;
            switch (difficultyId)
            {
                case 1:
                    questionMode = "findTotal";
                    questionText = $"{first} + {second} = ___________";
                    answer = total.ToString();
                    break;
                case 2:
                    questionMode = "findStart";
                    questionText = $"________ + {second} = {total}";
                    answer = first.ToString();
                    break;
                case 3:
                    questionMode = "findHops";
                    questionText = $"{first} + ____________ = {total}";
                    answer = second.ToString();
                    break;
                case 4:
                    int mixedType = _random.Next(1, 4);
                    if (mixedType == 1)
                    {
                        questionMode = "findTotal";
                        questionText = $"{first} + {second} = ___________";
                        answer = total.ToString();

                    }
                    else if (mixedType == 2)
                    {
                        questionMode = "findStart";
                        questionText = $"________ + {second} = {total}";
                        answer = first.ToString();
                    }
                    else
                    {
                        questionMode = "findHops";
                        questionText = $"{first} + ____________ = {total}";
                        answer = second.ToString();
                    }
                    break;
                default:
                    questionMode = "findTotal";
                    questionText = $"{first} + {second} = ___________";
                    answer = total.ToString();
                    break;
            }
            bool isExampleQuestion = questionNumber == 1;
            var data = new
            {
                questionType = "numberLineAddition",
                numberLine = new
                {
                    min = 1,
                    max = 10
                },
                firstNumber = first,
                secondNumber = second,
                total,
                questionMode = questionMode,
                showPath = isExampleQuestion,
                allowDrawing = !isExampleQuestion,
                drawingType = "hops",
                selectionMode = "input",
                answerType = "number"
            };
            string question;

            if (isExampleQuestion)
            {
                question =
                    "Look at the example path and solve the addition.";
            }
            else
            {
                question =
                    "Draw the hops on the number line and write the answer.";
            }
            return CreateQuestion(questionNumber, questionTypeId, question, data, answer);

        }
        private GeneratedQuestion GenrateTwoJumpAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            int min = range.Min;
            int max = range.Max;
            int firstNumber;
            int firstJump;
            int secondJump = 0;
            int intermediate;
            int total = 0;
            int attempts = 0;
            do
            {
                attempts++;
                firstNumber = _random.Next(1, max - 2);
                firstJump = _random.Next(1, Math.Min(5, max - firstNumber) + 1);
                intermediate = firstNumber + firstJump;
                if (intermediate >= max)
                {
                    continue;
                }
                secondJump = _random.Next(1, Math.Min(5, max - intermediate) + 1);
                total = intermediate + secondJump;

            } while (total > max);

            var data = new
            {
                questionType = "twoJumpAddition",
                numberLine = new
                {
                    min = min,
                    max = max
                },
                firstNumber,
                firstJump,
                intermediate,
                secondJump,
                total,
                jumps = new[]
                {
                    new
                    {
                        start = firstNumber,
                        end = intermediate,
                        size = firstJump
                    },
                    new
                    {
                        start = intermediate,
                        end = total,
                        size = secondJump
                    }
                },
                operatorSymbol = "+",

                selectionMode = "input",

                answerType = "number"
            };

            string questionText = $"Start at {firstNumber}. " +
                                 $"Jump +{firstJump}, then jump +{secondJump}. " +
                                "Where do you land?";
            return CreateQuestion(questionNumber, questionTypeId, questionText, data, total.ToString());

        }
        private GeneratedQuestion GenerateChooseCorrectNumberLine(int questionNumber, int questionTypeId, int levelId, int difficultyId)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            int max = range.Max;

            int min = range.Min;
            int firstNumber;
            int secondNumber;
            int total;
            do
            {
                firstNumber = _random.Next(1, max - 2);
                secondNumber = _random.Next(1, Math.Min(5, max - firstNumber) + 1);
                total = firstNumber + secondNumber;

            } while (total > max);

            var correctPath = new List<int> { firstNumber };
            for (int i = 1; i <= secondNumber; i++)
            {
                correctPath.Add(firstNumber + i);
            }
            var correctJumps = new List<NumberLineJumpDto>();
            for (int i = 0; i < secondNumber; i++)
            {
                int start = firstNumber + i;
                int end = start + 1;
                correctJumps.Add(new NumberLineJumpDto
                {
                    Start = start,
                    End = end,
                    Size = 1
                });
            }


            int optionB = Math.Min(total + 1, max);
            if (optionB == total)
            {
                optionB = total - 1;
            }
            var optionBPath = new List<int> { firstNumber };
            for (int i = firstNumber + 1; i < optionB; i++)
            {
                optionBPath.Add(i);
            }
            optionBPath.Add(optionB);
            var optionBjump = new List<NumberLineJumpDto>();
            for (int i = 0; i < optionBPath.Count - 1; i++)
            {
                int start = optionBPath[i];
                int end = optionBPath[i + 1];
                optionBjump.Add(new NumberLineJumpDto
                {
                    Start = start,
                    End = end,
                    Size = end - start
                });
            }

            int optionC;
            var possibleWrongAnswer = Enumerable.Range(firstNumber + 1, max - firstNumber)
                                                .Where(x => x != total && x != optionB)
                                                .ToList();

            if (possibleWrongAnswer.Count == 0)
            {
                throw new InvalidOperationException(
          "Could not generate a third number-line option.");

            }
            int optionCFinal = possibleWrongAnswer[_random.Next(possibleWrongAnswer.Count)];

            var optionCPath = new List<int> { firstNumber };
            for (int i = firstNumber + 1; i <= optionCFinal; i++)
            {
                optionCPath.Add(i);
            }

            var optionCJump = new List<NumberLineJumpDto>();
            for (int i = 0; i < optionCPath.Count - 1; i++)
            {
                int start = optionCPath[i];
                int end = optionCPath[i + 1];
                optionCJump.Add(new NumberLineJumpDto
                {
                    Start = start,
                    End = end,
                    Size = 1
                });
            }

            var options = new List<NumberLineOptionDto>
            {
                new NumberLineOptionDto
                {
                    Label = "A",
                    Path = correctPath,
                    Jumps = correctJumps,
                    FinalNumber = total,
                    IsCorrect = true
                },
                new NumberLineOptionDto
                {
                    Label = "B",
                    Path = optionBPath,
                    Jumps = optionBjump,
                    FinalNumber = optionB,
                    IsCorrect = false
                },
                new NumberLineOptionDto
                {
                    Label = "C",
                    Path = optionCPath,
                    Jumps = optionCJump,
                    FinalNumber = optionCFinal,
                    IsCorrect = false

                }
            };

            ShuffleLineOption(options);
            string[] labels = { "A", "B", "C" };
            for (int i = 0; i < options.Count; i++)
            {
                options[i].Label = labels[i];
            }
            string correctAnswer = options
                                        .First(x => x.IsCorrect)
                                        .Label;
            var data = new
            {
                questionType = "chooseCorrectNumberLine",
                numberLine = new
                {
                    min = min,
                    max = max
                },
                firstNumber,
                secondNumber,
                total,
                equation = $"{firstNumber}+{secondNumber} = {total}",
                options,
                selectionMode = "single",
                answerType = "option"
            };
            return CreateQuestion(questionNumber, questionTypeId, $"Which number line correctly shows {firstNumber} + {secondNumber} = ?", data, correctAnswer);

        }
        private void ShuffleLineOption(List<NumberLineOptionDto> optionDtos)
        {
            for (int i = optionDtos.Count - 1; i > 0; i--)
            {
                int j = _random.Next(i + 1);
                (optionDtos[i], optionDtos[j]) = (optionDtos[j], optionDtos[i]);
            }
        }
        private GeneratedQuestion GenerateBridgeTen(int questionNumber, int questionTypeId, int difficultyId, string? visualStyleName, List<string> visualIcons)
        {
            int first;
            int second;
            int bridgeAmount;
            int reaminingAmmount;
            int total;
            switch (difficultyId)
            {
                case 1:
                    first = _random.Next(4, 9);
                    bridgeAmount = 10 - first;
                    reaminingAmmount = _random.Next(1, 3);
                    second = bridgeAmount + reaminingAmmount;
                    total = first + second;
                    break;
                case 2:
                    first = _random.Next(6, 10);
                    bridgeAmount = 10 - first;
                    reaminingAmmount = _random.Next(1, 4);
                    second = bridgeAmount + reaminingAmmount;
                    total = first + second;
                    break;

                case 3:
                    first = _random.Next(6, 10);
                    bridgeAmount = 10 - first;
                    reaminingAmmount = _random.Next(2, 5);
                    second = bridgeAmount + reaminingAmmount;
                    total = first + second;
                    break;

                case 4:
                    {
                        int selectedDifficulty = _random.Next(1, 4);
                        if (selectedDifficulty == 1)
                        {
                            first = _random.Next(4, 9);
                            bridgeAmount = 10 - first;
                            reaminingAmmount = _random.Next(1, 3);
                        }
                        else if (selectedDifficulty == 2)
                        {
                            first = _random.Next(6, 10);
                            bridgeAmount = 10 - first;
                            reaminingAmmount = _random.Next(1, 4);
                        }
                        else
                        {
                            first = _random.Next(6, 10);
                            bridgeAmount = 10 - first;
                            reaminingAmmount = _random.Next(2, 5);
                        }
                        second = bridgeAmount + reaminingAmmount;
                        total = first + second;
                        break;
                    }
                default:
                    first = 8;
                    bridgeAmount = 2;
                    reaminingAmmount = 3;
                    second = 5;
                    total = 13;
                    break;

            }
            string normalizedVisualStyle = visualStyleName;
            if (string.IsNullOrWhiteSpace(normalizedVisualStyle))
            {
                normalizedVisualStyle = "shapes";
            }
            string icon = GetDatabaseVisualIcon(visualIcons, questionNumber);
            var tenFrame = Enumerable.Range(1, 10)
                                     .Select(index => new
                                     {
                                         index,
                                         filled = index <= first,
                                         group = index <= first ? "first" : "empty"
                                     })
                                     .ToList();

            var firstGroup = Enumerable.Repeat(icon, first).ToList();
            var bridgeGroup = Enumerable.Repeat(icon, bridgeAmount).ToList();
            var reaminingGroup = Enumerable.Repeat(icon, reaminingAmmount).ToList();

            var data = new
            {
                questionType = "bridgeTen",
                visualType = "tenFrame",
                visualStyle = normalizedVisualStyle,
                icon,
                firstNumber = first,
                secondNumber = second,
                bridgeAmount,
                reaminingAmmount,
                total,
                equation = $"{first} + {bridgeAmount} = 10",
                secondStep = $"10 + {reaminingAmmount} = {total}",
                hint =
            $"Break {second} into {bridgeAmount} + {reaminingAmmount}. " +
            $"Make 10 first, then add the rest.",
                explanation =
            $"{first} + {bridgeAmount} = 10, " +
            $"then 10 + {reaminingAmmount} = {total}.",
                tenFrame,
                firstGroup,
                bridgeGroup,
                reaminingGroup,
                selectionMode = "input",
                answerType = "number"

            };

            return CreateQuestion(questionNumber, questionTypeId, $"Use the ten-frame to solve {first} + {second}.", data, total.ToString());

        }
        private GeneratedQuestion GenerateMissingNumberBond(int questionNumber, int questionTypeId, int levelId, int difficultyId)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);

            int whole = _random.Next(range.Min, range.Max + 1);
            int leftPart = _random.Next(1, whole);
            int rightPart = whole - leftPart;
            bool missingLeft = _random.Next(2) == 0;
            int missingAnswer = missingLeft ? leftPart : rightPart;


            var options = Enumerable.Range(1, whole - 1)
                                    .OrderBy(_ => _random.Next())
                                    .Take(4)
                                    .ToList();
            if (!options.Contains(missingAnswer))
            {
                options[0] = missingAnswer;
            }
            Shuffle(options);
            int? showLeft = missingLeft ? null : leftPart;
            int? showRight = missingLeft ? rightPart : null;
            string equation = missingLeft ? $" ? + {rightPart} = {whole}" : $"{leftPart} + ? = {whole}";

            var data = new
            {
                questionType = "numberBondMissing",
                visualType = "numberBond",
                whole,
                leftPart = showLeft,
                rightPart = showRight,
                missingPosition = missingLeft ? "left" : "right",
                options,
                equation,
                selectionMode = "single",
                answerType = "option"
            };
            return CreateQuestion(questionNumber, questionTypeId, "Find the missing number in the number bond.", data, missingAnswer.ToString());
        }
        private GeneratedQuestion GenrateTrueOrFalseAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            int firstNumber = _random.Next(range.Min, range.Max);
            int secondNumber = _random.Next(1, (range.Max - firstNumber) + 1);
            int correctTotal = firstNumber + secondNumber;
            bool isTrue = _random.Next(2) == 0;
            int displayTotal;
            if (isTrue)
            {
                displayTotal = correctTotal;
            }
            else
            {
                do
                {
                    displayTotal = _random.Next(1, range.Max + 1);

                } while (displayTotal == correctTotal);
            }
            string equation = $"{firstNumber} + {secondNumber} = {displayTotal}";
            string answer = isTrue ? "True" : "False";
            var data = new
            {
                questionType = "trueOrFalseAddition",
                firstNumber,
                secondNumber,
                correctTotal,
                displayTotal,
                equation,
                options = new[] { "True", "False" },
                selectionMode = "single",
                answerType = "option"
            };
            return CreateQuestion(questionNumber, questionTypeId, "Is the addition equation true or false?", data, answer);

        }
        private GeneratedQuestion GenerateMakeFiveToFifteen(int questionNumber, int questionTypeId, int difficultyId)
        {
            int target;
            switch (difficultyId)
            {
                case 1:
                    target = 5;
                    break;

                case 2:
                    target = 10;
                    break;
                case 3:
                    target = 15;
                    break;
                case 4:
                    int mixedDifficulty = _random.Next(1, 4);
                    target = mixedDifficulty switch
                    {
                        1 => 5,
                        2 => 10,
                        3 => 15,
                        _ => 5
                    };
                    break;
                default:
                    target = 5;
                    break;
            }

            int currentNumber = _random.Next(1, target);
            int missingAmount = target - currentNumber;
            var options = new HashSet<int> { missingAmount };
            if (missingAmount > 1)
            {
                options.Add(missingAmount - 1);
            }
            if (missingAmount < target)
            {
                options.Add(missingAmount + 1);
            }
            while (options.Count < 3)
            {
                int candidate = _random.Next(1, target);
                options.Add(candidate);
            }
            var optionList = options.ToList();
            Shuffle(optionList);
            string questionText = $"I have {currentNumber}. " + $"How many more do I need to make {target}?";
            var data = new
            {
                questionType = "makeFiveTofifteen",
                currentNumber = currentNumber,
                target,
                missingAmount,
                options = optionList,
                selectionMode = "single",
                answerType = "option"
            };
            return CreateQuestion(questionNumber, questionTypeId, questionText, data, missingAmount.ToString());
        }
        private GeneratedQuestion GenerateDiceGameAdditionQuestions(int questionNumber, int questionTypeId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            var combinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: 6, secondMin: 1, secondMax: 6, difficultyId,
                (difficulty, first, second) =>
            {
                int total = first + second;
                return difficulty switch
                {
                    1 => total >= 2 && total <= 7,
                    2 => total >= 4 && total <= 9,
                    3 => total >= 4 && total <= 12,
                    4 => true,
                    _ => false
                };
            });
            var item = GetUnusedCandidate(combinations, "DICE", x => $"{x.first}:{x.second}", usedGameCombinations);
            var data = new
            {
                questionType = "diceGameAddition",
                firstDice = item.first,
                secondDice = item.second,
                total = item.total,
                operationSymbol = "+",
                selectionMode = "input",
                answerType = "number"
            };
            return CreateQuestion(questionNumber, questionTypeId, $"{item.first} + {item.second} = ____", data, item.total.ToString());

        }
        private GeneratedQuestion GenerateFingerGameAdditionQuestions(int questionNumber, int questionTypeId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            var combinations = GenerateUniqueGameCombinations(firstMin: 0, firstMax: 5, secondMin: 1, secondMax: 5, difficultyId,
                (difficulty, first, second) =>
                {
                    int total = first + second;
                    return difficulty switch
                    {
                        1 => total >= 0 && total <= 5,
                        2 => total >= 5 && total <= 10,
                        3 => first > 0 && second > 0,
                        _ => false
                    };
                });
            var item = GetUnusedCandidate(combinations, "FINGER", x => $"{x.first}:{x.second}", usedGameCombinations);

            var data = new
            {
                questionType = "fingerGameAddition",
                firstHand = item.first,
                secondHand = item.second,
                total = item.total,
                operatorSymbol = "+",
                selectionMode = "input",
                answerType = "number"
            };
            return CreateQuestion(questionNumber, questionTypeId, $"{item.first} + {item.second} = ____", data, item.total.ToString());


        }
        private GeneratedQuestion GenerateNumberGridMaze(int questionNumber, int questionTypeId, int levelId, int difficultyId)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);

            while (true)
            {
                int stepCount = _random.Next(2, 6);
                int startNumber = _random.Next(range.Min, range.Max + 1);
                int currentNumber = startNumber;
                var steps = new List<int>();
                var numbers = new List<int> { startNumber };
                bool isvalid = true;
                for (int i = 0; i < stepCount; i++)
                {
                    int remaining = range.Max - currentNumber;
                    if (remaining < 1)
                    {
                        isvalid = false;
                        break;
                    }
                    int maxstep = Math.Min(5, remaining);
                    int step = _random.Next(1, maxstep + 1);
                    currentNumber += step;
                    steps.Add(step);
                    numbers.Add(currentNumber);
                }
                if (!isvalid || steps.Count != stepCount)
                {
                    continue;
                }
                int answer = currentNumber;
                var data = new
                {
                    questionType = "numberGridMaze",
                    startNumber,
                    steps,
                    numbers,
                    stepCount,
                    answer,
                    operatorSymbol = "+",
                    selectionMode = "input",
                    answerType = "number"
                };
                string path = startNumber.ToString();
                foreach (int step in steps)
                {
                    path += $" → +{step}";
                }
                path += " → ?";
                string questionText = $"Start at {startNumber} and follow the steps: {path}. What number comes next?";
                return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer.ToString());

            }
        }
        private GeneratedQuestion GenerateFixedRuleCardAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            while (true)
            {

                int fixedRule = _random.Next(2, 10);
                int cardcount = _random.Next(3, 6);
                var cards = new List<int>();
                var answers = new List<int>();
                bool isvalid = true;
                int maxcardNumber = range.Max - fixedRule;
                if (maxcardNumber < range.Min)
                {
                    continue;
                }
                int finalTotal = 0;
                for (int i = 0; i < cardcount; i++)
                {


                    int cardNumber = _random.Next(range.Min, maxcardNumber + 1);
                    int answer = cardNumber + fixedRule;
                    cards.Add(cardNumber);
                    answers.Add(answer);

                    finalTotal += answer;
                }

                if (!isvalid || cards.Count != cardcount)
                {
                    continue;
                }
                var data = new
                {
                    questionType = "fixedRuleCardAddition",
                    fixedRule,
                    cards,
                    answers,
                    cardcount,
                    finalTotal,
                    operatorSymbol = "+",
                    selectionMode = "input",
                    answerType = "number"

                };

                string questionText =
                    $"Add {fixedRule} to each card and find the final basket total.";

                return CreateQuestion(questionNumber, questionTypeId, questionText, data, finalTotal.ToString());
            }
        }
        private GeneratedQuestion GeneratePathAndOffPathAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, List<string> visualicons)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            string icon = GetDatabaseVisualIcon(visualicons, questionNumber);
            int minTotal = Math.Min(2, range.Min);
            if (range.Max < minTotal)
            {
                throw new InvalidOperationException("Difficulty range is too small for path addition question.");
            }
            int total = _random.Next(minTotal, range.Max + 1);
            int onPathCount = _random.Next(1, total);
            int offPathCount = total - onPathCount;
            var onPathobjects = Enumerable.Repeat(icon, onPathCount);
            var offPathobjects = Enumerable.Repeat(icon, offPathCount);
            bool isExampleQuestion = questionNumber == 1;
            var data = new
            {
                questionType = "pathAndOffPathAddition",
                icon,
                onPathCount,
                offPathCount,
                total,
                onPathobjects,
                offPathobjects,
                equation = $"{onPathCount} + {offPathCount} = ?",
                finalEquation = $"{onPathCount} + {offPathCount} = {total}",
                example = isExampleQuestion ? new
                {
                    show = true,
                    title = "Example",
                    instruction =
                    "Count the objects on the path. " +
                    "Then count the objects off the path. " +
                    "Add the two numbers.",
                    onPath = onPathCount,
                    offPath = offPathCount,
                    equation = $"{onPathCount} + {offPathCount} = {total}",
                    answer = total
                } : null,
                selectionMode = "input",
                answerType = "number"
            };
            string questionText;
            if (isExampleQuestion)
            {
                questionText =
                    "Example: Count the stars on the path and off the path. " +
                    "Add both numbers to find the total.";
            }
            else
            {
                questionText =
                    "Count the objects on the path and off the path. " +
                    "Add them to find the total.";
            }
            return CreateQuestion(questionNumber, questionTypeId, questionText, data, total.ToString());
        }
        private GeneratedQuestion GenerateMovingStillObjectsAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, List<string> visualIcons)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            var icons = GetDatabaseVisualIcon(visualIcons, questionNumber);
            int mintotal = Math.Max(1, range.Min);
            if (range.Max < mintotal)
            {
                throw new InvalidOperationException("");
            }
            int total = _random.Next(mintotal, range.Max + 1);
            int movingcount = _random.Next(1, total);
            int stillcount = total - movingcount;
            var movingObject = Enumerable.Repeat(icons, movingcount).ToList();
            var stillObject = Enumerable.Repeat(icons, stillcount).ToList();

            bool isExampleQuestion = questionNumber == 1;
            var data = new
            {
                questionType = "movingStillObjectsAddition",
                icons,
                movingcount,
                stillcount,
                movingObject,
                stillObject,
                total,
                movingHasMotionLines = true,
                stillHasMotionLines = false,
                equation = $"{movingcount} + {stillcount} = ?",
                finalEquation = $"{movingcount} + {stillcount} = {total}",
                example = isExampleQuestion ? new
                {
                    show = true,
                    title = "Example",
                    instruction =
                    "Count the moving objects first. " +
                    "Then count the still objects. " +
                    "Add both groups to find the total.",
                    movingcount,
                    stillcount,
                    equation = $"{movingcount} + {stillcount} = {total}",
                    total

                } : null,
                selectionMode = "input",
                answerType = "number"
            };
            string questionText;
            if (isExampleQuestion)
            {
                questionText =
                    "Example: Count the moving objects and the still objects. " +
            "Add both groups to find the total.";
            }
            else
            {
                questionText =
                    "Count the moving objects and the still objects. " +
            "Add them to find the total.";
            }
            return CreateQuestion(questionNumber, questionTypeId, questionText, data, total.ToString());

        }

        //chnage need below function inside
        private GeneratedQuestion GenerateDominoChainAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            const int dominationCount = 4;
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            var combinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: range.Max - 1, secondMin: 1, secondMax: range.Max - 1, difficultyId,
                isvalid: (difficultyId, first, second) =>
                {
                    int total = first + second;
                    return total >= range.Min && total <= range.Max;
                });
            var chain = new List<(int first, int second, int total)>();
            for (int i = 0; i < dominationCount; i++)
            {
                var item = GetUnusedCandidate(combinations, "DOMINO", x => $"{x.first}:{x.second}", usedGameCombinations);
                chain.Add(item);
            }
            int startingDots = _random.Next(1, 6);
            var dominoes = new List<object>();
            int previousValue = startingDots;
            for (int i = 0; i < chain.Count; i++)
            {
                var item = chain[i];
                bool isFirst = i == 0;
                dominoes.Add(new
                {
                    dominoNumber = i + 1,
                    leftDots = isFirst ? previousValue : (int?)null,
                    expectedLeftDots = previousValue,
                    isBlankLeft = !isFirst,
                    firstNumber = item.first,
                    secondNumber = item.second,
                    total = item.total,
                    equation = $"{item.first} + {item.second}",
                    operatorSymbol = "+",
                    interactionType = isFirst ? "givenDots" : "drawDots"
                });
                previousValue = item.total;
            }
            var answer = chain.Take(chain.Count - 1)
                               .Select(x => x.total)
                               .ToList();
            var data = new
            {
                questionType = "dominoChainAddition",
                chainLength = dominationCount,
                startingDots,
                dominoes,
                selectionMode = "drawDots",
                answerType = "dominoChain",
                instruction =
            "Solve each addition and draw the answer " +
            "as dots in the blank half of the next domino."
            };
            return CreateQuestion(questionNumber, questionTypeId, "Solve each addition and complete the domino chain.", data, JsonSerializer.Serialize(answer));
        }
        private GeneratedQuestion GenerateAdditionNumberBondTree(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            var rootcombinations = GenerateUniqueGameCombinations(firstMin: 2, firstMax: Math.Max(2, range.Max - 2),
                secondMin: 2, secondMax: Math.Max(2, range.Max - 2), difficultyId, isvalid: (difficulty, first, second) =>
                {
                    int whole = first + second;
                    return whole >= range.Min && whole <= range.Max;
                });
            Shuffle(rootcombinations);

            foreach (var root in rootcombinations)
            {
                int leftPart = root.first;
                int rightPart = root.second;
                int whole = root.total;

                var leftsplits = GenerateUniqueGameCombinations(firstMin: 1, firstMax: leftPart - 1, secondMin: 1
                    , secondMax: leftPart - 1, difficultyId, isvalid: (difficulty, first, second) =>
                    {
                        return first + second == leftPart;
                    });
                var rightsplits = GenerateUniqueGameCombinations(firstMin: 1, firstMax: rightPart - 1, secondMin: 1,
                    secondMax: rightPart - 1, difficultyId, isvalid: (difficulty, first, second) =>
                    {
                        return first + second == rightPart;
                    });
                Shuffle(leftsplits);
                Shuffle(rightsplits);

                foreach (var leftsplit in leftsplits)
                {
                    foreach (var rightsplit in rightsplits)
                    {
                        string treeKey = $"ADDITION_TREE:" + $"{whole}:" + $"{leftPart}:" + $"{rightPart}:" +
                   $"{leftsplit.first}:" + $"{leftsplit.second}:" + $"{rightsplit.first}:" + $"{rightsplit.second}";

                        if (!usedGameCombinations.Add(treeKey))
                        {
                            continue;
                        }
                        string missingNods;
                        int actualDifficulty = difficultyId == 4 ? _random.Next(1, 4) : difficultyId;
                        if (actualDifficulty == 1)
                        {
                            string[] easyNodes =
                            {
                                 "leftBottom1",
                                 "leftBottom2",
                                 "rightBottom1",
                                 "rightBottom2"
                            };
                            missingNods = easyNodes[_random.Next(easyNodes.Length)];
                        }
                        else if (actualDifficulty == 2)
                        {
                            string[] mediumNodes = {
                            "leftMiddle",
                            "rightMiddle"
                        };
                            missingNods = mediumNodes[_random.Next(mediumNodes.Length)];
                        }
                        else
                        {
                            missingNods = "root";
                        }
                        int correctAnswer;
                        switch (missingNods)
                        {
                            case "root":
                                correctAnswer = whole;
                                break;
                            case "leftMiddle":
                                correctAnswer = leftPart;
                                break;
                            case "rightMiddle":
                                correctAnswer = rightPart;
                                break;
                            case "leftBottom1":
                                correctAnswer = leftsplit.first;
                                break;
                            case "leftBottom2":
                                correctAnswer = leftsplit.second;
                                break;
                            case "rightBottom1":
                                correctAnswer = rightsplit.first;
                                break;
                            case "rightBottom2":
                                correctAnswer = rightsplit.second;
                                break;
                            default:
                                throw new InvalidOperationException($"Unknown missing node: {missingNods}");
                        }

                        var data = new
                        {
                            questionType = "additionNumberBondTree",
                            whole = missingNods == "root" ? (int?)null : whole,
                            leftPart = missingNods == "leftMiddle" ? (int?)null : leftPart,
                            rightPart = missingNods == "rightMiddle" ? (int?)null : rightPart,
                            leftBottom = new
                            {
                                first = missingNods == "leftBottom1" ? (int?)null : leftsplit.first,
                                second = missingNods == "leftBottom2" ? (int?)null : leftsplit.second
                            },
                            rightBottom = new
                            {
                                first = missingNods == "rightBottom1" ? (int?)null : rightsplit.first,
                                second = missingNods == "rightBottom2" ? (int?)null : rightsplit.second
                            },
                            completeTree = new
                            {
                                whole,
                                leftPart,
                                rightPart,
                                leftBottom = new
                                {
                                    first = leftsplit.first,
                                    second = leftsplit.second
                                },
                                rightBottom = new
                                {
                                    first = rightsplit.first,
                                    second = rightsplit.second
                                }
                            },
                            missingNods,
                            selectionMode = "input",
                            answerType = "number",
                            explanation = $"{leftsplit.first} + " + $"{leftsplit.second} = " + $"{leftPart}; " + $"{rightsplit.first} " +
                            $"+ " + $"{rightsplit.second} = " + $"{rightPart}; " + $"{leftPart} + " + $"{rightPart} = " + $"{whole}"


                        };
                        return CreateQuestion(questionNumber, questionTypeId, "Complete the addition number-bond tree.", data, correctAnswer.ToString());
                    }
                }
            }

            throw new InvalidOperationException("No unused addition number-bond tree remains " + "for the selected level and difficulty.");

        }
        private string GetMissingPosition(int difficultyId)
        {
            int actualDifficulty = difficultyId == 4 ? _random.Next(1, 4) : difficultyId;

            if (actualDifficulty == 1 || actualDifficulty == 2)
            {
                string[] positions =
                {
                    "topLeft",
                    "topRight",
                    "bottomLeft",
                    "bottomRight"
                };

                return positions[_random.Next(positions.Length)];
            }

            return "body";
        }
        private int missingAnswer(string missingPosition, int firstValue, int secondValue, int thirdValue, int fourthValue, int totalValue)
        {
            return missingPosition switch
            {
                "topLeft" => firstValue,
                "topRight" => secondValue,
                "bottomLeft" => thirdValue,
                "bottomRight" => fourthValue,
                "body" => totalValue,
                "total" => totalValue,
                _ => throw new InvalidOperationException($"Unknown missing position: {missingPosition}")
            };
        }
        private GeneratedQuestion GenerateNumberBondSpider(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            var rootCombinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: range.Max - 1, secondMin: 1, secondMax: range.Max - 1, difficultyId,
                isvalid: (difficulty, first, second) =>
                {
                    int body = first + second;
                    return body >= range.Min && body <= range.Max;
                });
            Shuffle(rootCombinations);
            foreach (var firstBond in rootCombinations)
            {
                int body = firstBond.total;
                int firstPartA = firstBond.first;
                int firstPartB = firstBond.second;

                var secondBondCombinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: body - 1, secondMin: 1, secondMax: body - 1, difficultyId,
                    isvalid: (difficulty, first, second) =>
                    {
                        if (first + second != body)
                        {
                            return false;
                        }
                        if (first == firstPartA || first == firstPartB || second == firstPartA || second == firstPartB)
                        {
                            return false;
                        }

                        if (first == second)
                        {
                            return false;
                        }

                        return true;
                    });
                Shuffle(secondBondCombinations);
                foreach (var secondBond in secondBondCombinations)
                {


                    int secondPartA = secondBond.first;
                    int secondPartB = secondBond.second;

                    string spiderKey = $"NUMBER_BOND_SPIDER:" + $"{body}:" + $"{firstPartA}:" + $"{firstPartB}:" + $"{secondPartA}:" + $"{secondPartB}";
                    if (!usedGameCombinations.Add(spiderKey))
                    {
                        continue;
                    }
                    string missingPosition = GetMissingPosition(difficultyId);
                    int correctAnswer = missingAnswer(missingPosition, firstPartA, firstPartB, secondPartA, secondPartB, body);
                    var data = new
                    {
                        questionType = "numberBondSpider",
                        topLeft = missingPosition == "topLeft" ? (int?)null : firstPartA,
                        topRight = missingPosition == "topRight" ? (int?)null : firstPartB,
                        bottomLeft = missingPosition == "bottomLeft" ? (int?)null : secondPartA,
                        bottomRight = missingPosition == "bottomRight" ? (int?)null : secondPartB,
                        completeSpider = new
                        {
                            body,
                            topLeft = firstPartA,
                            topRight = firstPartB,
                            bottomLeft = secondPartA,
                            bottomRight = secondPartB
                        },
                        missingPosition,
                        selectionMode = "input",
                        answerType = "number",
                        explanation = $"{firstPartA} + {firstPartB} = {body}; " + $"{secondPartA} + {secondPartB} = {body}"

                    };
                    return CreateQuestion(questionNumber, questionTypeId, "Complete the number-bond spider.", data, correctAnswer.ToString());
                }
            }
            throw new InvalidOperationException("No unused number-bond spider remains " + "for the selected level and difficulty.");
        }
        private GeneratedQuestion GenerateBalancingSeesaw(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            var leftCombinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: range.Max - 1, secondMin: 1, secondMax: range.Max - 1, difficultyId,
                isvalid: (difficulty, first, second) =>
                {
                    int leftTotal = first + second;
                    return leftTotal >= range.Min && leftTotal <= range.Max;
                });
            Shuffle(leftCombinations);
            foreach (var leftCombination in leftCombinations)
            {
                int total = leftCombination.total;
                int topLeft = leftCombination.first;
                int bottomLeft = leftCombination.second;

                var rightCombinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: total - 1, secondMin: 1, secondMax: total - 1, difficultyId,
                    isvalid: (difficulty, first, second) =>
                    {
                        return first + second == total;
                    });
                Shuffle(rightCombinations);
                foreach (var rightCombination in rightCombinations)
                {
                    int topRight = rightCombination.first;
                    int bottomRight = rightCombination.second;
                    if (topLeft == topRight || topLeft == bottomRight || bottomLeft == topRight || bottomLeft == bottomRight)
                    {
                        continue;
                    }
                    string seesawKey = $"BALANCING_SEESAW:" + $"{topLeft}:" + $"{bottomLeft}:" + $"{topRight}:" + $"{bottomRight}";

                    if (!usedGameCombinations.Add(seesawKey))
                    {
                        continue;
                    }
                    string missingPosition = GetMissingPosition(difficultyId);
                    int correctAnswer = missingAnswer(missingPosition, topLeft, bottomLeft, topRight, bottomRight, total);
                    var data = new
                    {
                        questionType = "balancingSeesaw",
                        left = new
                        {
                            topBlocks = missingPosition == "topLeft" ? (int?)null : topLeft,

                            bottomBlocks = missingPosition == "bottomLeft" ? (int?)null : bottomLeft,

                            total = missingPosition == "total" ? (int?)null : total
                        },
                        right = new
                        {
                            topBlocks = missingPosition == "topRight" ? (int?)null : topRight,

                            bottomBlocks = missingPosition == "bottomRight" ? (int?)null : bottomRight,

                            total = missingPosition == "total" ? (int?)null : total
                        },
                        completeSeesaw = new
                        {
                            topLeft,
                            bottomLeft,
                            total,
                            topRight,
                            bottomRight,
                        },
                        missingPosition,
                        answerType = "number",
                        explanation = $"{topLeft} + {bottomLeft} = {total}; " + $"{topRight} + {bottomRight} = {total}. " + "Both sides are balanced."
                    };
                    return CreateQuestion(questionNumber, questionTypeId, "Complete the balancing seesaw.", data, correctAnswer.ToString());
                }

            }
            throw new InvalidOperationException("No unused balancing seesaw remains " + "for the selected level and difficulty.");

        }
        private GeneratedQuestion GenerateSolveDouble(int questionNumber, int questionTypeId, int levelId, int difficultyId, int? extraValue, List<string> visualIcons)
        {

            int actualDifficulty = difficultyId == 4 ? _random.Next(1, 4) : difficultyId;
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            int extra = extraValue ?? 0;
            int minNumber = Math.Max(1, (int)Math.Ceiling((range.Min - extra) / 2.0));
            int maxNumber = (range.Max - extra) / 2;
            if (maxNumber < minNumber)
            {
                throw new InvalidOperationException($"No valid Double + {extra} question can be generated for level {levelId} and difficulty {actualDifficulty}. " +
            $"Range: {range.Min}-{range.Max}.");
            }
            int number = _random.Next(minNumber, maxNumber + 1);


            int doubleValue = number * 2;
            int total = extraValue.HasValue ? doubleValue + extraValue.Value : doubleValue;
            string icon = GetDatabaseVisualIcon(visualIcons, questionNumber);
            if (actualDifficulty == 1 || actualDifficulty == 2)
            {

                var firstGroup = Enumerable.Repeat(icon, number).ToList();
                var secondGroup = Enumerable.Repeat(icon, number).ToList();
                var extraGroup = extraValue.HasValue ? Enumerable.Repeat(icon, extraValue.Value).ToList() : new List<string>();
                var data = new
                {
                    questionType = extraValue.HasValue ? $"DOUBLE_PLUS_{extraValue.Value}" : "SOLVE_THE_DOUBLE",
                    firstNumber = number,
                    secondNumber = number,
                    doubleValue,
                    extraValue,
                    total,
                    firstGroup,
                    secondGroup,
                    extraGroup,
                    equation = extraValue.HasValue ? $"{number} + {number} + {extraValue.Value} = ?" : $"{number} + {number} = ?",
                    options = CreateAdditionOptions(total, range.Max),
                    selectMode = "single",
                    answerType = "options"

                };
                return CreateQuestion(questionNumber, questionTypeId, extraValue.HasValue ? $"Double the number first, then add  + {extraValue.Value}"
                : "Count the two equal groups. What is the double?", data, total.ToString());
            }

            if (actualDifficulty == 3)
            {
                var options = new List<int>
              {
                  number,
                  Math.Max(1,number-1),
                  number+1,
                  number+2
              };
                Shuffle(options);

                var data = new
                {
                    questionType = extraValue.HasValue ? $"DOUBLE_PLUS_{extraValue.Value}" : "SOLVE_THE_DOUBLE",
                    total,
                    extraValue,
                    equation = extraValue.HasValue ? $"? + ? + {extraValue.Value} = {total}" : $"? + ? = {total}",
                    correctDouble = number,
                    options,
                    selectMode = "single",
                    answerType = "number"
                };
                return CreateQuestion(questionNumber, questionTypeId, extraValue.HasValue ? $"Which double makes {total}?" : $"Which double makes {total}?", data, number.ToString());
            }
            throw new ArgumentException(nameof(difficultyId), "Invalid DifficultyId");

        }
        private GeneratedQuestion GenerateAddTensAndOnes(int questionNumber, int questionTypeId, int levelId, int difficultyId, string? visualStyleName, List<string> visualIcons, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            var combinations = GenerateUniqueGameCombinations(firstMin: 10, firstMax: 99, secondMin: 10, secondMax: 99, difficultyId: actualDifficulty,
                isvalid: (difficulty, first, second) =>
                {
                    int firstTens = first / 10;
                    int firstOnes = first % 10;

                    int secondTens = second / 10;
                    int secondOnes = second % 10;

                    int total = first + second;

                    return
                        total >= range.Min &&
                        total <= range.Max &&
                        firstOnes + secondOnes <= 9 &&
                        firstTens + secondTens <= 9;
                });

            var item = GetUnusedCandidate(combinations, "ADD_TENS_ONES", x => $"{x.first}:{x.second}", usedGameCombinations);

            int firstNumber = item.first;
            int secondNumber = item.second;
            int total = item.total;
            int firstTens = firstNumber / 10;
            int firstOnes = firstNumber % 10;
            int secondTens = secondNumber / 10;
            int secondOnes = secondNumber % 10;
            int tensAnswer = firstTens + secondTens;
            int onesAnswer = firstOnes + secondOnes;
            bool useVisual = actualDifficulty == 1 || actualDifficulty == 2;
            string? icon = null;

            List<string>? firstTensGroup = null;
            List<string>? firstOnesGroup = null;
            List<string>? secondTensGroup = null;
            List<string>? secondOnesGroup = null;

            if (useVisual)
            {
                icon = GetDatabaseVisualIcon(
                    visualIcons,
                    questionNumber);

                firstTensGroup = Enumerable
                    .Repeat(icon, firstTens)
                    .ToList();

                firstOnesGroup = Enumerable
                    .Repeat(icon, firstOnes)
                    .ToList();

                secondTensGroup = Enumerable
                    .Repeat(icon, secondTens)
                    .ToList();

                secondOnesGroup = Enumerable
                    .Repeat(icon, secondOnes)
                    .ToList();
            }

            var data = new
            {
                questionType = "ADD_TENS_ONES",

                visualStyle = useVisual ? visualStyleName : null,

                icon,
                firstNumber,
                secondNumber,
                firstTens,
                firstOnes,
                secondTens,
                secondOnes,
                firstTensGroup,
                firstOnesGroup,
                secondTensGroup,
                secondOnesGroup,
                tens = new
                {
                    first = firstTens,
                    second = secondTens,
                    answer = tensAnswer
                },
                ones = new
                {
                    first = firstOnes,
                    second = secondOnes,
                    answer = onesAnswer
                },
                total,
                equation = $"{firstNumber} + {secondNumber} = ?",
                columnEquation = new
                {
                    tens = $"{firstTens} + {secondTens} = ?",
                    ones = $"{firstOnes} + {secondOnes} = ?"
                },
                selectMode = "input",
                answerType = "number"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Add the Ones first, then add the Tens to find the total cargo.", data, total.ToString());
        }
        private GeneratedQuestion GenerateCrossGridAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);

            Console.WriteLine($"CROSS GRID FIRST ROW => " + $"Level: {levelId}, " + $"Difficulty: {difficultyId}, " + $"ActualDifficulty: {actualDifficulty}, " + $"Range: {range.Min}-{range.Max}");

            var firstRowCombinatation = GenerateUniqueGameCombinations(firstMin: range.Min, firstMax: range.Max, secondMin: range.Min,
                 secondMax: range.Max, difficultyId: actualDifficulty, isvalid: (difficulty, first, second) =>
                {
                    int total = first + second;
                    return total >= range.Min && total <= range.Max;
                });
            Shuffle(firstRowCombinatation);
            Console.WriteLine($"CROSS GRID FIRST ROW COUNT => {firstRowCombinatation.Count}");
            foreach (var firstRow in firstRowCombinatation)
            {
                int topLeft = firstRow.first;
                int topRight = firstRow.second;
                int topRowTotal = firstRow.total;
                var secondRowCombinatation = GenerateUniqueGameCombinations(firstMin: range.Min, firstMax: range.Max, secondMin: range.Min,
                    secondMax: range.Max, difficultyId: actualDifficulty, isvalid: (difficulty, first, second) =>
                    {
                        int bottomRowTotal = first + second;
                        if (bottomRowTotal < range.Min || bottomRowTotal > range.Max)
                        {
                            return false;
                        }
                        int leftColumnTotal = topLeft + first;
                        int rightColumnTotal = topRight + second;
                        if (leftColumnTotal < range.Min || leftColumnTotal > range.Max)
                        {
                            return false;
                        }

                        if (rightColumnTotal < range.Min || rightColumnTotal > range.Max)
                        {
                            return false;
                        }
                        if (first == topLeft || first == topRight || second == topLeft || second == topRight || first == second)
                        {
                            return false;
                        }
                        return true;
                    });
                Shuffle(secondRowCombinatation);

                foreach (var secondRow in secondRowCombinatation)
                {
                    int bottomLeft = secondRow.first;
                    int bottomRight = secondRow.second;
                    int bottomRowTotal = bottomLeft + bottomRight;
                    int leftColumnTotal = topLeft + bottomLeft;
                    int rightColumnTotal = topRight + bottomRight;
                    int grandTotal = topRowTotal + bottomRowTotal;
                    int columnGrandTotal = leftColumnTotal + rightColumnTotal;
                    if (grandTotal != columnGrandTotal)
                    {
                        continue;
                    }
                    string key = $"CROSS_GRID_ADDITION:" + $"{topLeft}:" + $"{topRight}:" + $"{bottomLeft}4:" + $"{bottomRight}";
                    if (!usedGameCombinations.Add(key))
                    {
                        continue;
                    }
                    var data = new
                    {
                        questionType = "CROSS_GRID_ADDITION",
                        grid = new
                        {
                            topLeft,
                            topRight,
                            bottomLeft,
                            bottomRight
                        },
                        rows = new
                        {
                            top = new
                            {
                                first = topLeft,
                                second = topRight,
                                total = topRowTotal,
                                equation = $"{topLeft} + {topRight} = ?"
                            },
                            bottom = new
                            {
                                first = bottomLeft,
                                second = bottomRight,
                                total = bottomRowTotal,
                                equation = $"{bottomLeft} + {bottomRight} = ?"
                            },

                        },
                        columns = new
                        {
                            left = new
                            {
                                first = topLeft,
                                second = bottomLeft,
                                total = leftColumnTotal,
                                equation = $"{topLeft} + {bottomLeft} = ?"
                            },
                            right = new
                            {
                                first = topRight,
                                second = bottomRight,
                                total = rightColumnTotal,
                                equation = $"{topRight} + {bottomRight} = ?"
                            },

                        },
                        grandTotal = new
                        {
                            rowTotal = topRowTotal + bottomRowTotal,
                            columnTotal = leftColumnTotal + rightColumnTotal,
                            answer = grandTotal,
                            equation = $"{topRowTotal} + {bottomRowTotal} = ?",
                            verification = $"{leftColumnTotal} + {rightColumnTotal} = ?"
                        },

                        verification = new
                        {
                            rowsEqualColumns = grandTotal == columnGrandTotal,
                            rowGrandTotal = grandTotal,
                            columnGrandTotal,
                            equation = $"{topRowTotal} + {bottomRowTotal} = " + $"{leftColumnTotal} + {rightColumnTotal}"
                        },
                        selectionMode = "input",
                        answerType = "number"
                    };
                    return CreateQuestion(questionNumber, questionTypeId, "Add across the rows and down the columns.\r\nWrite each row and column total, then find the grand total.", data, grandTotal.ToString());
                }

            }

            throw new InvalidOperationException("No unused cross-grid addition question remains " + "for the selected level and difficulty.");


        }
        private GeneratedQuestion GenerateMissingOperationSwitch(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            string operation = _random.Next(0, 2) == 0 ? "+" : "-";

            var combinations = GenerateUniqueGameCombinations(firstMin: 10, firstMax: 99, secondMin: 10, secondMax: 99, difficultyId: actualDifficulty,
                isvalid: (difficulty, first, second) =>
                {

                    if (operation == "+")
                    {
                        int result = first + second;

                        return result >= range.Min &&
                               result <= range.Max;
                    }

                    int subtractionResult = first - second;

                    if (subtractionResult < 0)
                    {
                        return false;
                    }

                    return subtractionResult >= range.Min &&
                           subtractionResult <= range.Max;
                });


            var item = GetUnusedCandidate(
                combinations,
                "MISSING_OPERATION_SWITCH",
                x => $"{operation}:{x.first}:{x.second}",
                usedGameCombinations
            );

            int firstNumber = item.first;
            int secondNumber = item.second;


            int answer =
                operation == "+"
                    ? firstNumber + secondNumber
                    : firstNumber - secondNumber;

            if (answer < range.Min ||
                answer > range.Max)
            {
                throw new InvalidOperationException(
                    $"Invalid MISSING_OPERATION_SWITCH answer {answer} " +
                    $"for range {range.Min}-{range.Max}."
                );
            }

            var options = new List<string>
    {
        "+",
        "-"
    };

            Shuffle(options);

            var data = new
            {
                questionType = "MISSING_OPERATION_SWITCH",
                difficulty = actualDifficulty,
                firstNumber,
                secondNumber,
                operation,
                operationSymbol = operation,
                completedEquation = $"{firstNumber} {operation} {secondNumber} = {answer}",
                equation = $"{firstNumber} ◯ {secondNumber} = {answer}",
                result = answer,
                options,
                selectionMode = "single",
                answerType = "option"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Look at the starting number and final number. Choose + or - to complete the number sentence.", data, operation
            );
        }
        private GeneratedQuestion GenerateMentalAdditionTwo(int questionNumber, int questionTypeId, int levelId, int difficultyId, bool missingAddend, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            int minTotal = Math.Max(10, range.Min);
            int maxTotal = Math.Min(18, range.Max);

            if (minTotal > maxTotal)
            {
                minTotal = 10;
                maxTotal = 18;
            }

            var combinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: 9, secondMin: 1, secondMax: 9, difficultyId: actualDifficulty,
                    isvalid: (difficulty, first, second) =>
                    {
                        int total = first + second;

                        if (total < 10)
                        {
                            return false;
                        }

                        return total >= minTotal && total <= maxTotal;
                    });


            var item = GetUnusedCandidate(combinations, missingAddend ? "MENTAL_ADDITION_TWO_MISSING" : "MENTAL_ADDITION_TWO", x => $"{x.first}:{x.second}", usedGameCombinations);

            int first = item.first;
            int second = item.second;
            int total = item.total;

            int missingIndex = -1;
            int answer;

            string equation;

            if (missingAddend)
            {
                missingIndex = _random.Next(0, 2);
                answer = missingIndex == 0 ? first : second;
                equation = missingIndex == 0 ? $"__ + {second} = {total}" : $"{first} + __ = {total}";
            }
            else
            {
                answer = total;
                equation = $"{first} + {second} = ?";
            }

            var data = new
            {
                questionType = missingAddend ? "ADD_TWO_SINGLE_DIGIT_MISSING" : "ADD_TWO_SINGLE_DIGIT",
                difficulty = actualDifficulty,
                numbers = new[] { first, second },
                firstNumber = first,
                secondNumber = second,
                total,
                missingAddend,
                missingIndex,
                equation,
                operatorSymbol = "+",
                selectionMode = "input",
                answerType = "number"
            };

            string questionText = missingAddend ? "Find the missing addend." : "Add the two numbers.";

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer.ToString());
        }
        private GeneratedQuestion GenerateMentalAdditionMultiple(int questionNumber, int questionTypeId, int levelId, int difficultyId, int numberCount, bool missingAddend, HashSet<string> usedGameCombinations)
        {
            if (numberCount != 3 && numberCount != 4)
            {
                throw new ArgumentException(
                    "Mental addition multiple generator supports only 3 or 4 numbers.",
                    nameof(numberCount)
                );
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            int naturalMax = numberCount * 9;
            int naturalMin = 10;
            int minTotal = Math.Max(naturalMin, range.Min);
            int maxTotal = Math.Min(naturalMax, range.Max);

            if (minTotal > maxTotal)
            {
                minTotal = naturalMin;
                maxTotal = naturalMax;
            }

            IEnumerable<int[]> candidates;

            if (numberCount == 3)
            {
                candidates =
                    //Take each value from this collection and use that value as a while evaluating the query.
                    from a in Enumerable.Range(1, 9)
                    from b in Enumerable.Range(1, 9)
                    from c in Enumerable.Range(1, 9)
                    let numbers = new[] { a, b, c }
                    let total = numbers.Sum()
                    where total >= minTotal
                    where total <= maxTotal
                    where total >= 10
                    select numbers;
            }
            else
            {
                candidates =
                    from a in Enumerable.Range(1, 9)
                    from b in Enumerable.Range(1, 9)
                    from c in Enumerable.Range(1, 9)
                    from d in Enumerable.Range(1, 9)
                    let numbers = new[] { a, b, c, d }
                    let total = numbers.Sum()
                    where total >= minTotal
                    where total <= maxTotal
                    where total >= 10
                    select numbers;
            }


            var candidateList = candidates.ToList();

            Shuffle(candidateList);

            var selected = GetUnusedCandidate(
                    candidateList,
                    missingAddend
                        ? $"MENTAL_ADDITION_{numberCount}_MISSING"
                        : $"MENTAL_ADDITION_{numberCount}",
                    numbers => string.Join(":", numbers),
                    usedGameCombinations
                );

            int totalValue = selected.Sum();
            int missingIndex = -1;
            int answer;
            string equation;

            if (missingAddend)
            {
                missingIndex = _random.Next(0, numberCount);
                answer = selected[missingIndex];
                var displayParts = selected.Select((number, index) => index == missingIndex ? "__" : number.ToString()).ToList();
                equation = string.Join(" + ", displayParts) + $" = {totalValue}";
            }
            else
            {
                answer = totalValue;
                equation = string.Join(" + ", selected) + " = ?";
            }


            string questionType = (numberCount, missingAddend) switch
            {
                (3, false) =>
                    "ADD_THREE_SINGLE_DIGIT",

                (3, true) =>
                    "ADD_THREE_SINGLE_DIGIT_MISSING",

                (4, false) =>
                    "ADD_FOUR_SINGLE_DIGIT",

                (4, true) =>
                    "ADD_FOUR_SINGLE_DIGIT_MISSING",

                _ =>
                    "MENTAL_ADDITION"
            };
            var data = new
            {
                questionType,
                difficulty = actualDifficulty,
                numberCount,
                numbers = selected,
                total = totalValue,
                missingAddend,
                missingIndex,
                equation,
                operatorSymbol = "+",
                selectionMode = "input",
                answerType = "number"
            };

            string questionText = missingAddend
                    ? $"Find the missing addend in the {numberCount}-number addition."
                    : $"Add the {numberCount} numbers.";

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer.ToString()
            );
        }
        private GeneratedQuestion GenerateWholeTensAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            int actualDifficulty =
                ResolveDifficulty(difficultyId);

            var range =
                GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            string code =
                questionType.Code?
                    .Trim()
                    .ToUpperInvariant()
                ?? string.Empty;

            bool isTwoAddends =
                code == "ADD_WHOLE_TENS" ||
                code == "ADD_WHOLE_TENS_MISSING";

            bool isThreeAddends =
                code == "ADD_WHOLE_TENS_THREE" ||
                code == "ADD_WHOLE_TENS_THREE_MISSING";

            bool isFourAddends =
                code == "ADD_WHOLE_TENS_FOUR" ||
                code == "ADD_WHOLE_TENS_FOUR_MISSING";

            bool isMissingAddend =
                code == "ADD_WHOLE_TENS_MISSING" ||
                code == "ADD_WHOLE_TENS_THREE_MISSING" ||
                code == "ADD_WHOLE_TENS_FOUR_MISSING";

            if (!isTwoAddends &&
                !isThreeAddends &&
                !isFourAddends &&
                code != "COMPLETE_NEXT_TEN" &&
                code != "ADD_BY_COMPLETING_WHOLE_TENS")
            {
                throw new ArgumentException(
                    $"Unsupported Whole Tens question type: {code}");
            }

            if (isTwoAddends ||
                isThreeAddends ||
                isFourAddends)
            {
                int numberCount =
                    isTwoAddends
                        ? 2
                        : isThreeAddends
                            ? 3
                            : 4;

                int maxPossibleOperand =
                    Math.Min(
                        90,
                        range.Max -
                        ((numberCount - 1) * 10));

                if (maxPossibleOperand < 10)
                {
                    throw new InvalidOperationException(
                        $"The range {range.Min}-{range.Max} is too small " +
                        $"for {numberCount} whole-tens addends.");
                }

                var wholeTens =
                    Enumerable
                        .Range(
                            1,
                            maxPossibleOperand / 10)
                        .Select(
                            x => x * 10)
                        .ToList();

                if (wholeTens.Count == 0)
                {
                    throw new InvalidOperationException(
                        $"No whole-tens values are available for " +
                        $"level {levelId}, difficulty {actualDifficulty}.");
                }

                int minTotal =
                    Math.Max(
                        range.Min,
                        numberCount *
                        wholeTens.Min());

                int maxTotal =
                    Math.Min(
                        range.Max,
                        numberCount *
                        wholeTens.Max());

                if (minTotal > maxTotal)
                {
                    throw new InvalidOperationException(
                        $"No valid whole-tens total exists for " +
                        $"level {levelId}, difficulty {actualDifficulty}.");
                }

                Func<int[], bool>? specialValidation =
                    null;

                if (code == "ADD_WHOLE_TENS_THREE")
                {
                    specialValidation =
                        numbers =>
                            numbers[0] + numbers[1] == 100 ||
                            numbers[0] + numbers[2] == 100 ||
                            numbers[1] + numbers[2] == 100;
                }
                if (code == "ADD_WHOLE_TENS_FOUR")
                {
                    if (levelId <= 3)
                    {
                        bool IsFriendlyPair(
                            int first,
                            int second)
                        {
                            int pairTotal =
                                first + second;

                            return pairTotal == 50 ||
                                   pairTotal == 100;
                        }

                        specialValidation =
                            numbers =>
                                IsFriendlyPair(
                                    numbers[0],
                                    numbers[1])
                                &&
                                IsFriendlyPair(
                                    numbers[2],
                                    numbers[3]);
                    }
                    else
                    {
                        specialValidation = null;
                    }
                }

                var candidateList =
                    GenerateUniqueGameCombinations(
                        wholeTens,
                        numberCount,
                        minTotal,
                        maxTotal,
                        specialValidation);

                string keyPrefix =
                    isMissingAddend
                        ? $"WHOLE_TENS_{numberCount}_MISSING"
                        : $"WHOLE_TENS_{numberCount}";

                int selectedMissingIndex = -1;

                int[] selected;

                if (isMissingAddend)
                {
                    var missingCandidates =
                        candidateList
                            .SelectMany(
                                numbers =>
                                    Enumerable
                                        .Range(
                                            0,
                                            numberCount)
                                        .Select(
                                            missingIndex =>
                                                new
                                                {
                                                    Numbers = numbers,
                                                    MissingIndex =
                                                        missingIndex
                                                }))
                            .ToList();

                    if (missingCandidates.Count == 0)
                    {
                        throw new InvalidOperationException(
                            $"No valid missing whole-tens combinations remain " +
                            $"for level {levelId}, difficulty {actualDifficulty}.");
                    }

                    var selectedCandidate =
                        GetUnusedCandidate(
                            missingCandidates,
                            keyPrefix,
                            item =>
                                $"{item.MissingIndex}:" +
                                string.Join(
                                    ":",
                                    item.Numbers.OrderBy(x => x)),
                            usedGameCombinations);

                    selected =
                        selectedCandidate.Numbers;

                    selectedMissingIndex =
                        selectedCandidate.MissingIndex;
                }
                else
                {
                    selected =
                        GetUnusedCandidate(
                            candidateList,
                            keyPrefix,
                            numbers =>
                                string.Join(
                                    ":",
                                    numbers.OrderBy(value => value)),
                            usedGameCombinations);
                }

                int total =
                    selected.Sum();

                if (code == "ADD_WHOLE_TENS")
                {
                    bool useUnitNotation =
                        _random.Next(2) == 0;

                    int first =
                        selected[0];

                    int second =
                        selected[1];

                    int firstTens =
                        first / 10;

                    int secondTens =
                        second / 10;

                    int totalTens =
                        total / 10;

                    if (useUnitNotation)
                    {
                        var data = new
                        {
                            questionType = code,
                            format = "unitNotation",
                            firstNumber = first,
                            secondNumber = second,
                            firstTens,
                            secondTens,
                            totalTens,
                            total,
                            equation =
                                $"{firstTens} tens + " +
                                $"{secondTens} tens = " +
                                "___ tens = ___",
                            unitNotation = new
                            {
                                firstTens,
                                secondTens,
                                totalTens,
                                total
                            },
                            selectionMode = "input",
                            answerType = "number-array"
                        };

                        string answer =
                            JsonSerializer.Serialize(
                                new[]
                                {
                            totalTens,
                            total
                                });

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            "Add the whole tens and complete the unit notation.",
                            data,
                            answer);
                    }

                    var verticalData = new
                    {
                        questionType = code,
                        format = "vertical",
                        firstNumber = first,
                        secondNumber = second,
                        total,
                        vertical = new
                        {
                            top = first,
                            bottom = second,
                            answer = (int?)null
                        },
                        equation =
                            $"{first}\n" +
                            $"+ {second}\n" +
                            "────\n" +
                            "___",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Add the whole tens using vertical alignment.",
                        verticalData,
                        total.ToString());
                }

                if (code == "ADD_WHOLE_TENS_MISSING")
                {
                    int missingIndex =
                        selectedMissingIndex >= 0
                            ? selectedMissingIndex
                            : _random.Next(0, 2);

                    int missing =
                        selected[missingIndex];

                    int known =
                        selected[
                            missingIndex == 0
                                ? 1
                                : 0];

                    int rightFirst =
                        _random.Next(
                            1,
                            total / 10) *
                        10;

                    int rightSecond =
                        total -
                        rightFirst;

                    bool useBalance =
                        _random.Next(2) == 0;

                    if (useBalance)
                    {
                        var data = new
                        {
                            questionType = code,
                            format = "balanceScale",
                            missingNumber = missing,
                            knownPart = known,
                            total,
                            equation =
                                $"___ + {known} = " +
                                $"{rightFirst} + {rightSecond}",
                            balanceScale = new
                            {
                                left = new
                                {
                                    missing = true,
                                    known
                                },
                                right = new
                                {
                                    first = rightFirst,
                                    second = rightSecond,
                                    total
                                }
                            },
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            "Complete the balanced whole-tens equation.",
                            data,
                            missing.ToString());
                    }

                    var partWholeData = new
                    {
                        questionType = code,
                        format = "partWhole",
                        total,
                        knownPart = known,
                        missingPart = missing,
                        equation =
                            $"Total = {total}. " +
                            $"Known Part = {known}. " +
                            "Missing Part = ___",
                        partWhole = new
                        {
                            total,
                            knownPart = known,
                            missingPart = (int?)null
                        },
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Find the missing whole-tens part.",
                        partWholeData,
                        missing.ToString());
                }

                if (code == "ADD_WHOLE_TENS_THREE")
                {
                    int first =
                        selected[0];

                    int second =
                        selected[1];

                    int third =
                        selected[2];

                    bool useGroup =
                        _random.Next(2) == 0;

                    int pairFirst = 0;
                    int pairSecond = 0;
                    int remaining = 0;

                    if (first + second == 100)
                    {
                        pairFirst = first;
                        pairSecond = second;
                        remaining = third;
                    }
                    else if (first + third == 100)
                    {
                        pairFirst = first;
                        pairSecond = third;
                        remaining = second;
                    }
                    else
                    {
                        pairFirst = second;
                        pairSecond = third;
                        remaining = first;
                    }

                    if (useGroup)
                    {
                        var data = new
                        {
                            questionType = code,
                            format = "groupTo100",
                            numbers = selected,
                            groupTo100 = new
                            {
                                first = pairFirst,
                                second = pairSecond,
                                pairTotal = 100,
                                remaining,
                                equation =
                                    $"({pairFirst} + {pairSecond}) + " +
                                    $"{remaining} = ?"
                            },
                            total,
                            equation =
                                $"({pairFirst} + {pairSecond}) + " +
                                $"{remaining} = ?",
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            "Group the friendly pair to make 100, then add the remaining tens.",
                            data,
                            total.ToString());
                    }

                    int intermediate =
                        first + second;

                    var sequentialData = new
                    {
                        questionType = code,
                        format = "sequentialJumps",
                        numbers = selected,
                        sequentialJumps = new[]
                        {
                    new
                    {
                        start = first,
                        jump = second,
                        end = intermediate
                    },
                    new
                    {
                        start = intermediate,
                        jump = third,
                        end = total
                    }
                },
                        firstNumber = first,
                        secondNumber = second,
                        thirdNumber = third,
                        intermediate,
                        total,
                        equation =
                            $"Start at {first} " +
                            $"→ +{second} → ___ " +
                            $"→ +{third} → ___",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string sequentialAnswer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        intermediate,
                        total
                            });

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Follow the sequential whole-tens jumps.",
                        sequentialData,
                        sequentialAnswer);
                }

                if (code == "ADD_WHOLE_TENS_THREE_MISSING")
                {
                    int missingIndex =
                        selectedMissingIndex >= 0
                            ? selectedMissingIndex
                            : _random.Next(0, 3);

                    int missing =
                        selected[missingIndex];

                    var knownNumbers =
                        selected
                            .Where(
                                (value, index) =>
                                    index != missingIndex)
                            .ToArray();

                    int knownSum =
                        knownNumbers.Sum();

                    bool useSubTotal =
                        _random.Next(2) == 0;

                    if (useSubTotal)
                    {
                        var data = new
                        {
                            questionType = code,
                            format = "subTotalStep",
                            numbers = selected,
                            missingIndex,
                            missingNumber = missing,
                            knownNumbers,
                            knownSum,
                            total,
                            equation =
                                $"{knownNumbers[0]} + ___ + " +
                                $"{knownNumbers[1]} = {total}",
                            subTotalEquation =
                                $"{knownSum} + ___ = {total}",
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            "Combine the known tens first, then find the missing tens.",
                            data,
                            missing.ToString());
                    }

                    var targetData = new
                    {
                        questionType = code,
                        format = "targetSum",
                        target = total,
                        knownNumbers,
                        knownSum,
                        missingNumber = missing,
                        missingIndex,
                        equation =
                            $"Target = {total}. " +
                            $"You have {knownNumbers[0]} " +
                            $"and {knownNumbers[1]}. " +
                            "You need ___ more.",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Find how many more whole tens are needed to reach the target.",
                        targetData,
                        missing.ToString());
                }

                if (code == "ADD_WHOLE_TENS_FOUR")
                {
                    int first =
                        selected[0];

                    int second =
                        selected[1];

                    int third =
                        selected[2];

                    int fourth =
                        selected[3];

                    int pairOneTotal =
                        first + second;

                    int pairTwoTotal =
                        third + fourth;

                    bool useFriendlyPairs =
                        _random.Next(2) == 0;

                    if (useFriendlyPairs)
                    {
                        var data = new
                        {
                            questionType = code,
                            format = "friendlyPairs",
                            numbers = selected,
                            friendlyPairs = new
                            {
                                firstPair = new
                                {
                                    first,
                                    second,
                                    total = pairOneTotal
                                },
                                secondPair = new
                                {
                                    first = third,
                                    second = fourth,
                                    total = pairTwoTotal
                                },
                                equation =
                                    $"({first} + {second}) + " +
                                    $"({third} + {fourth}) = " +
                                    $"___ + ___ = ___",
                                total
                            },
                            selectionMode = "input",
                            answerType = "number-array"
                        };

                        string answer =
                            JsonSerializer.Serialize(
                                new[]
                                {
                            pairOneTotal,
                            pairTwoTotal,
                            total
                                });

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            "Group the whole tens into friendly pairs and find the total.",
                            data,
                            answer);
                    }

                    var chainData = new
                    {
                        questionType = code,
                        format = "chainAddition",
                        numbers = selected,
                        total,
                        equation =
                            $"{first} + {second} + " +
                            $"{third} + {fourth} = ?",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Add the four whole tens.",
                        chainData,
                        total.ToString());
                }

                if (code == "ADD_WHOLE_TENS_FOUR_MISSING")
                {
                    int missingIndex =
                        selectedMissingIndex >= 0
                            ? selectedMissingIndex
                            : _random.Next(0, 4);

                    int missing =
                        selected[missingIndex];

                    var knownNumbers =
                        selected
                            .Where(
                                (value, index) =>
                                    index != missingIndex)
                            .ToArray();

                    int knownSum =
                        knownNumbers.Sum();

                    int rightFirst =
                        _random.Next(
                            1,
                            total / 10) *
                        10;

                    int rightSecond =
                        total -
                        rightFirst;

                    bool useSimplified =
                        _random.Next(2) == 0;

                    if (useSimplified)
                    {
                        var data = new
                        {
                            questionType = code,
                            format = "simplifiedEquation",
                            numbers = selected,
                            missingIndex,
                            missingNumber = missing,
                            knownNumbers,
                            knownSum,
                            total,
                            equation =
                                $"Combine knowns " +
                                $"({string.Join(" + ", knownNumbers)} = {knownSum}) " +
                                $"→ {knownSum} + ___ = {total}",
                            simplifiedEquation =
                                $"{knownSum} + ___ = {total}",
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            "Combine the known whole tens, then find the missing tens.",
                            data,
                            missing.ToString());
                    }

                    var displayParts =
                        selected
                            .Select(
                                (value, index) =>
                                    index == missingIndex
                                        ? "___"
                                        : value.ToString())
                            .ToArray();

                    var balanceData = new
                    {
                        questionType = code,
                        format = "balanceEquation",
                        numbers = selected,
                        missingIndex,
                        missingNumber = missing,
                        total,
                        rightSide = new
                        {
                            first = rightFirst,
                            second = rightSecond,
                            total
                        },
                        equation =
                            $"{displayParts[0]} + " +
                            $"{displayParts[1]} + " +
                            $"{displayParts[2]} + " +
                            $"{displayParts[3]} = " +
                            $"{rightFirst} + {rightSecond}",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Complete the balanced whole-tens equation.",
                        balanceData,
                        missing.ToString());
                }
            }

            if (code == "COMPLETE_NEXT_TEN")
            {
                var candidates =
                    (
                        from number in Enumerable.Range(11, 88)
                        let nextTen =
                            ((number / 10) + 1) * 10
                        let gap =
                            nextTen - number
                        where number % 10 != 0
                        where nextTen <= range.Max
                        where number >= range.Min
                        where gap >= 1
                        where gap <= 9
                        select new
                        {
                            number,
                            nextTen,
                            gap
                        }
                    ).ToList();

                if (candidates.Count == 0)
                {
                    throw new InvalidOperationException(
                        $"No Complete Next Ten questions are available " +
                        $"for range {range.Min}-{range.Max}.");
                }

                Shuffle(candidates);

                var selected =
                    GetUnusedCandidate(
                        candidates,
                        "COMPLETE_NEXT_TEN",
                        x =>
                            $"{x.number}:{x.nextTen}",
                        usedGameCombinations);

                bool useDistanceFormat =
                    _random.Next(2) == 0;

                if (useDistanceFormat)
                {
                    var data = new
                    {
                        questionType = code,
                        format = "distanceToBenchmark",
                        currentNumber = selected.number,
                        benchmark = selected.nextTen,
                        gap = selected.gap,
                        equation =
                            $"How far is {selected.number} " +
                            $"from {selected.nextTen}? " +
                            $"{selected.number} + ___ = {selected.nextTen}",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Complete the next ten.",
                        data,
                        selected.gap.ToString());
                }

                var tenFrameData = new
                {
                    questionType = code,
                    format = "tenFrameGap",
                    currentNumber = selected.number,
                    target = selected.nextTen,
                    gap = selected.gap,
                    unitsNeeded = selected.gap,
                    equation =
                        $"You have {selected.number}. " +
                        $"To reach {selected.nextTen}, " +
                        "add ___ units.",
                    selectionMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    "Find the gap to the next ten.",
                    tenFrameData,
                    selected.gap.ToString());
            }

            if (code == "ADD_BY_COMPLETING_WHOLE_TENS")
            {
                var candidates =
                    (
                        from first in Enumerable.Range(11, 88)
                        from second in Enumerable.Range(2, 8)
                        let nextTen =
                            ((first / 10) + 1) * 10
                        let bridgeAmount =
                            nextTen - first
                        let remainingAmount =
                            second - bridgeAmount
                        let total =
                            first + second
                        where first % 10 != 0
                        where bridgeAmount > 0
                        where remainingAmount > 0
                        where total >= range.Min
                        where total <= range.Max
                        select new
                        {
                            first,
                            second,
                            nextTen,
                            bridgeAmount,
                            remainingAmount,
                            total
                        }
                    ).ToList();

                if (candidates.Count == 0)
                {
                    throw new InvalidOperationException(
                        $"No Add By Completing Whole Tens questions are " +
                        $"available for range {range.Min}-{range.Max}.");
                }

                Shuffle(candidates);

                var selected =
                    GetUnusedCandidate(
                        candidates,
                        "ADD_BY_COMPLETING_WHOLE_TENS",
                        x =>
                            $"{x.first}:{x.second}",
                        usedGameCombinations);

                bool useDecomposition =
                    _random.Next(2) == 0;

                if (useDecomposition)
                {
                    var data = new
                    {
                        questionType = code,
                        format = "decomposition",
                        firstNumber = selected.first,
                        secondNumber = selected.second,
                        nextTen = selected.nextTen,
                        bridgeAmount = selected.bridgeAmount,
                        remainingAmount = selected.remainingAmount,
                        total = selected.total,
                        split = new
                        {
                            original = selected.second,
                            first = selected.bridgeAmount,
                            second = selected.remainingAmount,
                            equation =
                                $"{selected.second} = " +
                                $"{selected.bridgeAmount} + " +
                                $"{selected.remainingAmount}"
                        },
                        steps = new[]
                        {
                    new
                    {
                        step = 1,
                        equation =
                            $"{selected.first} + " +
                            $"{selected.bridgeAmount} = " +
                            $"{selected.nextTen}"
                    },
                    new
                    {
                        step = 2,
                        equation =
                            $"{selected.nextTen} + " +
                            $"{selected.remainingAmount} = ___"
                    }
                },
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        $"Break {selected.second} into two parts, make {selected.nextTen}, then finish the addition.",
                        data,
                        selected.total.ToString());
                }

                var fillData = new
                {
                    questionType = code,
                    format = "fillInSteps",
                    firstNumber = selected.first,
                    secondNumber = selected.second,
                    nextTen = selected.nextTen,
                    bridgeAmount = selected.bridgeAmount,
                    remainingAmount = selected.remainingAmount,
                    total = selected.total,
                    equation =
                        $"{selected.first} + {selected.second} = " +
                        $"{selected.first} + ___ + ___ = " +
                        $"{selected.nextTen} + {selected.remainingAmount} = ___",
                    splitEquation =
                        $"{selected.second} = ___ + ___",
                    step1 =
                        $"{selected.first} + ___ = " +
                        $"{selected.nextTen}",
                    step2 =
                        $"{selected.nextTen} + " +
                        $"{selected.remainingAmount} = ___",
                    selectionMode = "input",
                    answerType = "number-array"
                };

                string fillAnswer =
                    JsonSerializer.Serialize(
                        new[]
                        {
                    selected.bridgeAmount,
                    selected.remainingAmount,
                    selected.total
                        });

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    "Fill in each step of the whole-tens addition.",
                    fillData,
                    fillAnswer);
            }

            throw new ArgumentException(
                $"Unsupported Whole Tens question type: {code}");
        }
        private GeneratedQuestion GenerateWholeHundredsAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            string code =
                questionType.Code?
                    .Trim()
                    .ToUpperInvariant()
                ?? string.Empty;

            if (code != "ADD_WHOLE_HUNDREDS" &&
                code != "ADD_WHOLE_HUNDREDS_THREE" &&
                code != "ADD_WHOLE_HUNDREDS_MISSING" &&
                code != "ADD_WHOLE_HUNDREDS_TO_THOUSAND")
            {
                throw new ArgumentException(
                    $"Unsupported whole-hundreds question type: {code}");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!WholeHundredsAdditionDifficultyConfig.ByLevel.TryGetValue(levelId, out var difficultyRanges))
            {
                throw new ArgumentException($"Whole-hundreds difficulty is not configured for level {levelId}.");

            }
            if (actualDifficulty < 1 || actualDifficulty > difficultyRanges.Length)
            {
                throw new ArgumentException($"Difficulty {difficultyId} is not configured " + $"for level {levelId}.");
            }
            DifficultyRange range = difficultyRanges[actualDifficulty - 1];
            int firstWholeHundred = ((range.Min + 99) / 100) * 100;
            int lastWholeHunndred = (range.Max / 100) * 100;

            var wholeHundreds = Enumerable.Range(firstWholeHundred / 100, (lastWholeHunndred / 100) - (firstWholeHundred / 100) + 1).Select(x => x * 100).ToList();
            if (wholeHundreds.Count == 0)
            {
                throw new InvalidOperationException($"Difficulty {difficultyId} is not configured " + $"for level {levelId}.");
            }

            bool isTwoAddends = code == "ADD_WHOLE_HUNDREDS";

            bool isThreeAddends = code == "ADD_WHOLE_HUNDREDS_THREE";

            bool isMissingAddend = code == "ADD_WHOLE_HUNDREDS_MISSING";

            bool isCompleteThousand = code == "ADD_WHOLE_HUNDREDS_TO_THOUSAND";

            int numberCount = isThreeAddends ? 3 : 2;

            int minTotal;
            int maxTotal;

            if (isCompleteThousand)
            {
                minTotal = 1000;
                maxTotal = 1000;
            }

            else
            {
                minTotal = wholeHundreds.Min() * numberCount;
                maxTotal = wholeHundreds.Max() * numberCount;

            }

            Func<int[], bool>? specialValidation =
                null;

            if (isThreeAddends)
            {
                specialValidation =
                    numbers =>
                        numbers[0] + numbers[1] == 1000 ||
                        numbers[0] + numbers[2] == 1000 ||
                        numbers[1] + numbers[2] == 1000;
            }

            if (isCompleteThousand)
            {
                specialValidation =
                    numbers =>
                        numbers.Length == 2 &&
                        numbers[0] + numbers[1] == 1000;
            }

            var candidateList = GenerateUniqueGameCombinations(wholeHundreds, numberCount, minTotal, maxTotal, specialValidation);

            string keyPrefix = isMissingAddend ? "WHOLE_HUNDREDS_MISSING" : code;

            var selected = GetUnusedCandidate(candidateList, keyPrefix, numbers => isCompleteThousand ? string.Join(":", numbers) : string.Join(":", numbers.OrderBy(x => x)), usedGameCombinations);

            int total = selected.Sum();

            if (code == "ADD_WHOLE_HUNDREDS")
            {
                int first = selected[0];
                int second = selected[1];
                int firstHundreds = first / 100;
                int secondHundreds = second / 100;
                int totalHundreds = total / 100;
                int format = _random.Next(4);

                if (format == 0)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "unitNotation",
                        firstNumber = first,
                        secondNumber = second,
                        firstHundreds,
                        secondHundreds,
                        totalHundreds,
                        total,
                        equation =
                            $"{firstHundreds} hundreds + " +
                            $"{secondHundreds} hundreds = " +
                            "___ hundreds = ___",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string answer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        totalHundreds,
                        total
                            });

                    return CreateQuestion(questionNumber, questionTypeId, "Add the whole hundreds and complete the unit notation.", data, answer);
                }

                if (format == 1)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "placeValueBlocks",
                        firstNumber = first,
                        secondNumber = second,
                        firstHundreds,
                        secondHundreds,
                        totalHundreds,
                        total,
                        equation =
                            $"{firstHundreds} hundred-flats + " +
                            $"{secondHundreds} hundred-flats = " +
                            "___ total flats",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string answer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        totalHundreds,
                        total
                            });

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Stack the hundred blocks and find the total value.",
                        data,
                        answer);
                }

                if (format == 2)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "currencyVault",
                        firstNumber = first,
                        secondNumber = second,
                        total,
                        firstBills = first / 100,
                        secondBills = second / 100,
                        equation =
                            $"Stack A: {first / 100} $100 bills | " +
                            $"Stack B: {second / 100} $100 bills",
                        question =
                            "What is the total money in the vault?",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(questionNumber, questionTypeId, "Add the two stacks of $100 bills.", data, total.ToString());
                }

                var storyData = new
                {
                    questionType = code,
                    difficulty = actualDifficulty,
                    format = "mysteryChest",
                    story =
                        $"Chest A contains {first} gold coins. " +
                        $"Chest B contains {second} gold coins.",
                    firstNumber = first,
                    secondNumber = second,
                    total,
                    equation =
                        $"Chest A ({first}) + Chest B ({second}) = ___",
                    question =
                        "What is the total loot inside the vault?",
                    selectionMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber, questionTypeId, "Open the Mystery Chest and find the total loot.", storyData, total.ToString());
            }

            if (code == "ADD_WHOLE_HUNDREDS_THREE")
            {
                int first = selected[0];
                int second = selected[1];
                int third = selected[2];
                int format = _random.Next(4);

                int friendlyFirst = 0;
                int friendlySecond = 0;
                int friendlyRemaining = 0;

                if (first + second == 1000)
                {
                    friendlyFirst = first;
                    friendlySecond = second;
                    friendlyRemaining = third;
                }
                else if (first + third == 1000)
                {
                    friendlyFirst = first;
                    friendlySecond = third;
                    friendlyRemaining = second;
                }
                else
                {
                    friendlyFirst = second;
                    friendlySecond = third;
                    friendlyRemaining = first;
                }

                if (format == 0)
                {
                    int friendlyTotal =
                        friendlyFirst + friendlySecond;

                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "friendlyThousandBridge",
                        numbers = selected,
                        firstPair = new
                        {
                            first = friendlyFirst,
                            second = friendlySecond,
                            total = friendlyTotal
                        },
                        remaining = friendlyRemaining,
                        total,
                        equation =
                            $"({friendlyFirst} + {friendlySecond}) + " +
                            $"{friendlyRemaining} = ___ + " +
                            $"{friendlyRemaining} = ___",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string answer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        friendlyTotal,
                        total
                            });

                    return CreateQuestion(questionNumber, questionTypeId, "Group friendly hundreds to make 1,000, then add the remaining hundreds.", data, answer);
                }

                if (format == 1)
                {
                    int stepOne =
                        first + second;

                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "sequentialStepMap",
                        numbers = selected,
                        first,
                        second,
                        third,
                        stepOne,
                        total,
                        equation =
                            $"{first} → +{second} → ___ → +{third} → ___",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string answer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        stepOne,
                        total
                            });

                    return CreateQuestion(questionNumber, questionTypeId, "Follow the hundreds step by step and find the final total.", data, answer);
                }

                if (format == 2)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "targetScoreboard",
                        levels = new[]
                        {
                    first,
                    second,
                    third
                },
                        total,
                        equation =
                            $"{first} + {second} + {third} = ___",
                        question =
                            "Can you combine all three power boosters to hit the target?",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(questionNumber, questionTypeId, "Combine all three hundreds and find the grand total score.", data, total.ToString());
                }

                var storyData = new
                {
                    questionType = code,
                    difficulty = actualDifficulty,
                    format = "spaceRocketMission",
                    fuelLevelOne = first,
                    fuelLevelTwo = second,
                    boosterPower = third,
                    total,
                    story =
                        $"Fuel Level 1 gives {first} km. " +
                        $"Fuel Level 2 gives {second} km. " +
                        $"The booster adds {third} km.",
                    equation =
                        $"({first} + {third}) + {second} = ___",
                    question =
                        "Can you combine all three power boosters to hit the galaxy target?",
                    selectionMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber, questionTypeId, "Combine the three rocket power sources.", storyData, total.ToString());
            }

            if (code == "ADD_WHOLE_HUNDREDS_MISSING")
            {
                int missingIndex = _random.Next(0, 2);
                int missing = selected[missingIndex];
                int known = selected[missingIndex == 0 ? 1 : 0];
                int format = _random.Next(4);

                if (format == 0)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "balanceScale",
                        knownNumber = known,
                        missingNumber = missing,
                        total,
                        equation =
                            $"{known} + ___ = {total}",
                        question =
                            "What weight is needed to balance the scale?",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(questionNumber, questionTypeId, "Find the missing hundreds needed to balance the scale.", data, missing.ToString());
                }

                if (format == 1)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "digitalProgressMeter",
                        currentProgress = known,
                        goal = total,
                        missingNumber = missing,
                        equation =
                            $"{known} + ___ = {total}",
                        question =
                            "How many more points are needed to reach the goal?",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Find the remaining points needed to reach the goal.",
                        data,
                        missing.ToString());
                }

                if (format == 2)
                {
                    int knownHundreds = known / 100;
                    int totalHundreds = total / 100;
                    int missingHundreds = missing / 100;

                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "hundredsCountGap",
                        known,
                        total,
                        knownHundreds,
                        totalHundreds,
                        missingHundreds,
                        equation =
                            $"{knownHundreds} hundreds + ___ hundreds = " +
                            $"{totalHundreds} hundreds",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string answer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        missingHundreds,
                        missing
                            });

                    return CreateQuestion(questionNumber, questionTypeId, "Count the missing hundreds needed to reach the target.", data, answer);
                }

                var storyData = new
                {
                    questionType = code,
                    difficulty = actualDifficulty,
                    format = "secretCodeLock",
                    currentEnergy = known,
                    targetEnergy = total,
                    missingEnergy = missing,
                    story =
                        $"The door needs {total} energy points. " +
                        $"The generator already has {known} points.",
                    equation =
                        $"{known} + ___ = {total}",
                    question =
                        "How many more energy points must you inject to escape?",
                    selectionMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    "Find the missing energy needed to unlock the secret code.",
                    storyData,
                    missing.ToString());
            }

            if (code == "ADD_WHOLE_HUNDREDS_TO_THOUSAND")
            {
                int current = selected[0];
                int missing = selected[1];
                int currentHundreds = current / 100;
                int missingHundreds = missing / 100;
                int format = _random.Next(4);

                if (format == 0)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "thousandMilestoneBridge",
                        current,
                        target = 1000,
                        missing,
                        currentHundreds,
                        missingHundreds,
                        equation =
                            $"{current} + ___ = 1000",
                        hundredsEquation =
                            $"({currentHundreds} + ___) hundreds = 10 hundreds",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string answer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        missingHundreds,
                        missing
                            });

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Build the 1,000 milestone by completing the missing hundreds.",
                        data,
                        answer);
                }

                if (format == 1)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "thousandPointGauge",
                        score = current,
                        target = 1000,
                        distance = missing,
                        equation =
                            $"{current} + ___ = 1000",
                        question =
                            "How far are you from the 1,000-point target?",
                        selectionMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Find the distance needed to reach 1,000.",
                        data,
                        missing.ToString());
                }

                if (format == 2)
                {
                    var data = new
                    {
                        questionType = code,
                        difficulty = actualDifficulty,
                        format = "tenFrameHundreds",
                        totalBlocks = 10,
                        filledBlocks = currentHundreds,
                        emptyBlocks = missingHundreds,
                        blockValue = 100,
                        current,
                        target = 1000,
                        missing,
                        equation =
                            $"{currentHundreds} blocks + ___ blocks = 10 blocks",
                        selectionMode = "input",
                        answerType = "number-array"
                    };

                    string answer =
                        JsonSerializer.Serialize(
                            new[]
                            {
                        missingHundreds,
                        missing
                            });

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        "Fill the empty hundred blocks until the frame reaches 1,000.",
                        data,
                        answer);
                }

                var storyData = new
                {
                    questionType = code,
                    difficulty = actualDifficulty,
                    format = "bossLevel1000",
                    currentHP = current,
                    targetHP = 1000,
                    missingPower = missing,
                    story =
                        $"The Final Dragon Boss requires 1,000 HP. " +
                        $"Your magic shield currently has {current} HP.",
                    equation =
                        $"{current} + ___ = 1000",
                    question =
                        "How much power mana must you absorb to trigger the 1,000 HP Super Shield?",
                    selectionMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    "Complete the magic shield to reach 1,000 HP.",
                    storyData,
                    missing.ToString());
            }

            throw new InvalidOperationException(
                $"Unsupported whole-hundreds question code: {code}");
        }
        private GeneratedQuestion GenerateVerticalAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            int digitCount = code.Contains("VERTICAL_ADD_TWO") ? 2 : code.Contains("VERTICAL_ADD_THREE") ? 3 : code.Contains("VERTICAL_ADD_FOURE")
                            ? 4 : throw new ArgumentException($"Unsupported vertical addition type: {code}");

            bool requireCarry = code.EndsWith("_WITH_CARRY") || code.EndsWith("_CARRY");

            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!VerticalAdditionDifficultyConfig
                    .ByLevelAndDigits
                    .TryGetValue(levelId, out var digitRanges))
            {
                throw new ArgumentException(
                    $"Vertical addition is not configured for level {levelId}.");
            }

            if (!digitRanges.TryGetValue(
                    digitCount,
                    out var difficultyRanges))
            {
                throw new ArgumentException(
                    $"Vertical addition with {digitCount} digits " +
                    $"is not configured for level {levelId}.");
            }

            if (actualDifficulty < 1 ||
                actualDifficulty > difficultyRanges.Length)
            {
                throw new ArgumentException(
                    $"Difficulty {actualDifficulty} is not configured " +
                    $"for {digitCount}-digit addition at level {levelId}.");
            }

            DifficultyRange range = difficultyRanges[actualDifficulty - 1];

            var result = GenerateVerticalOperands(range, digitCount, requireCarry, code, usedGameCombinations);

            var data = new
            {
                questionType = "verticalAddition",
                digitCount,
                carryMode = requireCarry ? "withCarry" : "withoutCarry",
                firstNumber = result.first,
                secondNumber = result.second,
                total = result.total,
                carryCount = result.carryCount,
                operatorSymbol = "+",
                vertical = new
                {
                    top = result.first.ToString(),
                    bottom = result.second.ToString(),
                    answer = (int?)null
                },

                equation = $"{result.first} + {result.second} = ?",
                selectionMode = "input",
                answerType = "number"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Add the numbers vertically and write the total.", data, result.total.ToString());
        }
        private GeneratedQuestion GenerateTwinChannelDataSieve(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            if (code != "TWIN_CHANNEL_MISSING" &&
                code != "TWIN_CHANNEL_BALANCE")
            {
                throw new ArgumentException(
                    $"Unsupported twin-channel question type: {code}");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            const int maxAttempts = 5000;

            for (int attempt = 0; attempt < maxAttempts; attempt++)
            {
                int alphaFirst = _random.Next(range.Min, range.Max + 1);

                int alphaSecond = _random.Next(range.Min, range.Max + 1);

                int betaFirst;
                int betaSecond;
                int missingNumber;
                int alphaSubtotal;
                int betaSubtotal;
                int target;

                if (code == "TWIN_CHANNEL_MISSING")
                {
                    betaFirst = _random.Next(range.Min, range.Max + 1);
                    betaSecond = _random.Next(range.Min, range.Max + 1);
                    missingNumber = _random.Next(range.Min, range.Max + 1);
                    alphaSubtotal = alphaFirst + missingNumber;
                    betaSubtotal = betaFirst + betaSecond;
                    target = alphaSubtotal + betaSubtotal;
                }
                else
                {
                    alphaSubtotal = alphaFirst + alphaSecond;
                    target = alphaSubtotal;
                    int minimumBetaFirst = range.Min;
                    int maximumBetaFirst = Math.Min(range.Max, target - range.Min);
                    if (maximumBetaFirst < minimumBetaFirst)
                    {
                        continue;
                    }
                    betaFirst = _random.Next(minimumBetaFirst, maximumBetaFirst + 1);

                    missingNumber = target - betaFirst;

                    if (missingNumber < range.Min ||
                        missingNumber > range.Max)
                    {
                        continue;
                    }

                    betaSecond = missingNumber;

                    betaSubtotal = betaFirst + betaSecond;

                    if (betaSubtotal != alphaSubtotal)
                    {
                        continue;
                    }
                }

                string uniqueKey = $"{code}:" + $"{levelId}:" + $"{actualDifficulty}:" + $"{alphaFirst}:" + $"{alphaSecond}:" + $"{betaFirst}:" + $"{betaSecond}:" + $"{missingNumber}:" + $"{target}";

                if (!usedGameCombinations.Add(uniqueKey))
                {
                    continue;
                }

                if (code == "TWIN_CHANNEL_MISSING")
                {
                    var data = new
                    {
                        questionType = "twinChannelMissing",
                        difficulty = actualDifficulty,
                        channelAlpha = new
                        {
                            name = "Alpha",
                            symbol = "α",
                            numbers = new int?[]
                           {
                                alphaFirst,
                                null
                           },
                            subtotal = (int?)null
                        },

                        channelBeta = new
                        {
                            name = "Beta",
                            symbol = "β",
                            numbers = new int?[]
                            {
                                betaFirst,
                                betaSecond
                            },
                            subtotal = (int?)null
                        },

                        mergeHub = new
                        {
                            label = "MERGE HUB",
                            icon = "🔗"
                        },

                        systemLog = new
                        {
                            label = "SYSTEM LOG LOCK",
                            target
                        },

                        missingPosition = "channelAlpha",
                        missingIndex = 1,

                        equation =
                            $"({alphaFirst} + ?) + " +
                            $"({betaFirst} + {betaSecond}) = {target}",

                        selectionMode = "input",
                        answerType = "number",

                        hint =
                            $"First calculate the Beta subtotal: " +
                            $"{betaFirst} + {betaSecond}. " +
                            $"Then use {target} to find the missing Alpha number.",

                        explanation =
                            $"{alphaFirst} + {missingNumber} = {alphaSubtotal}; " +
                            $"{betaFirst} + {betaSecond} = {betaSubtotal}; " +
                            $"{alphaSubtotal} + {betaSubtotal} = {target}."
                    };

                    return CreateQuestion(questionNumber, questionTypeId, "Find the missing number and unlock the system.", data, missingNumber.ToString());
                }

                var balanceData = new
                {
                    questionType = "twinChannelBalance",

                    difficulty = actualDifficulty,

                    channelAlpha = new
                    {
                        name = "Alpha",
                        symbol = "α",
                        numbers = new[]
                        {
                    alphaFirst,
                    alphaSecond
                },
                        subtotal = (int?)null
                    },

                    channelBeta = new int?[]
                    {
                betaFirst,
                null
                    },

                    mergeHub = new
                    {
                        label = "BALANCE HUB",
                        icon = "⚖️"
                    },

                    systemLog = new
                    {
                        label = "BALANCE TARGET",
                        target
                    },

                    missingPosition = "channelBeta",
                    missingIndex = 1,

                    equation =
                        $"{alphaFirst} + {alphaSecond} = " +
                        $"{betaFirst} + ?",

                    selectionMode = "input",
                    answerType = "number",

                    hint =
                        $"Alpha subtotal is {alphaSubtotal}. " +
                        $"Find the missing Beta value so both channels are equal.",

                    explanation =
                        $"{alphaFirst} + {alphaSecond} = {alphaSubtotal}; " +
                        $"{betaFirst} + {missingNumber} = {betaSubtotal}. " +
                        "Both channels are balanced."
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    "Balance both data channels and unlock the system.",
                    balanceData,
                    missingNumber.ToString());
            }

            throw new InvalidOperationException(
                $"Unable to generate enough unique Twin-Channel " +
                $"questions for level {levelId}, difficulty {actualDifficulty}, " +
                $"range {range.Min}-{range.Max}. " +
                $"Requested question count may exceed the available unique combinations.");
        }
        private GeneratedQuestion GenerateGridMysteryCoordinateAddition(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            const int maxAttempts = 5000;

            for (int attempt = 0; attempt < maxAttempts; attempt++)
            {
                int rowXCol1 = _random.Next(range.Min, range.Max + 1);
                int rowXCol2 = _random.Next(range.Min, range.Max + 1);
                int rowYCol1 = _random.Next(range.Min, range.Max + 1);
                int rowYCol2 = _random.Next(range.Min, range.Max + 1);

                var cells = new[]
                {
            new
            {
                row = "X",
                column = 1,
                value = rowXCol1
            },

            new
            {
                row = "X",
                column = 2,
                value = rowXCol2
            },

            new
            {
                row = "Y",
                column = 1,
                value = rowYCol1
            },

            new
            {
                row = "Y",
                column = 2,
                value = rowYCol2
            }
        }.ToList();

                Shuffle(cells);

                var firstClue = cells[0];

                var secondClue = cells[1];

                var mysteryCell = cells[2];

                int target = firstClue.value + mysteryCell.value + secondClue.value;

                string uniqueKey =
                    $"GRID_MYSTERY_COORDINATE_ADDITION:" +
                    $"{levelId}:" +
                    $"{actualDifficulty}:" +
                    $"{rowXCol1}:" +
                    $"{rowXCol2}:" +
                    $"{rowYCol1}:" +
                    $"{rowYCol2}:" +
                    $"FIRST:{firstClue.row}:{firstClue.column}:" +
                    $"SECOND:{secondClue.row}:{secondClue.column}:" +
                    $"MYSTERY:{mysteryCell.row}:{mysteryCell.column}";

                if (!usedGameCombinations.Add(uniqueKey))
                {
                    continue;
                }

                string mysteryCoordinate =
                    $"ROW {mysteryCell.row}, COL {mysteryCell.column}";

                var data = new
                {
                    questionType = "gridMysteryCoordinateAddition",

                    difficulty = actualDifficulty,

                    grid = new
                    {
                        columns = new[]
                        {
                        "COLUMN 1",
                        "COLUMN 2"
                        },

                        rows = new[]{ new
                    {
                        label = "ROW X",
                        values = new[]
                        {
                            rowXCol1,
                            rowXCol2
                        }
                    },

                    new
                    {
                        label = "ROW Y",
                        values = new[]
                        {
                            rowYCol1,
                            rowYCol2
                        }
                    }
                }
                    },

                    masterRegistryClue =
                        $"[ ROW {firstClue.row}, COL {firstClue.column} ] + " +
                        $"[ MYSTERY ] + " +
                        $"[ ROW {secondClue.row}, COL {secondClue.column} ] = " +
                        $"{target}",

                    clue = new
                    {
                        first = new
                        {
                            row = firstClue.row,
                            column = firstClue.column,
                            value = firstClue.value
                        },

                        mystery = new
                        {
                            row = mysteryCell.row,
                            column = mysteryCell.column,
                            value = (int?)null
                        },

                        second = new
                        {
                            row = secondClue.row,
                            column = secondClue.column,
                            value = secondClue.value
                        },

                        target
                    },

                    tasks = new
                    {
                        task1 =
                            $"{firstClue.value} + ? + " +
                            $"{secondClue.value} = {target}",

                        task2 =
                            "Solve the missing value.",

                        task3 =
                            "Write the missing coordinate address key."
                    },

                    missingValue = (int?)null,

                    missingPosition = new
                    {
                        row = mysteryCell.row,
                        column = mysteryCell.column
                    },

                    correctCoordinate = mysteryCoordinate,

                    selectionMode = "input",

                    answerType = "number-and-coordinate"
                };

                string answer =
                    JsonSerializer.Serialize(
                        new
                        {
                            value = mysteryCell.value,
                            coordinate = mysteryCoordinate
                        });

                return CreateQuestion(questionNumber, questionTypeId, "Decode the registry, solve the mystery value, and find its coordinate.", data, answer);
            }

            throw new InvalidOperationException(
                $"Unable to generate a unique grid mystery " +
                $"coordinate addition question for level {levelId}, " +
                $"difficulty {actualDifficulty}, " +
                $"range {range.Min}-{range.Max}.");
        }
        private GeneratedQuestion GenerateThresholdWallSpillover(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            const int maxAttempts = 5000;

            for (int attempt = 0; attempt < maxAttempts; attempt++)
            {
                int startValue = _random.Next(range.Min, range.Max + 1);

                int maximumAddValue = range.Max - startValue + 1;

                if (maximumAddValue < 2)
                    continue;

                int addValue = _random.Next(2, maximumAddValue + 1);

                int threshold;

                int possibleThresholdStep = _random.Next(1, addValue);

                threshold = startValue + possibleThresholdStep;

                int distanceToWall = threshold - startValue;

                int spilloverValue = addValue - distanceToWall;

                if (distanceToWall <= 0)
                    continue;

                if (spilloverValue <= 0)
                    continue;

                int finalValue = threshold + spilloverValue;

                string uniqueKey =
                    $"THRESHOLD_WALL_SPILLOVER:" +
                    $"{levelId}:" +
                    $"{actualDifficulty}:" +
                    $"{startValue}:" +
                    $"{addValue}:" +
                    $"{threshold}";

                if (!usedGameCombinations.Add(uniqueKey))
                    continue;

                var path = new List<object>();

                for (int step = 1; step <= distanceToWall; step++)
                {
                    path.Add(new
                    {
                        step,
                        value = startValue + step,
                        zone = "path",
                        collected = true,
                        coinValue = 1
                    });
                }

                for (int step = 1; step <= spilloverValue; step++)
                {
                    path.Add(new
                    {
                        step = distanceToWall + step,
                        value = threshold + step,
                        zone = "spillover",
                        collected = true,
                        coinValue = 1
                    });
                }

                string equation =
                    $"{startValue} + {addValue} = " +
                    $"({startValue} + [ {distanceToWall} ]) + {spilloverValue} = " +
                    $"{threshold} + {spilloverValue}";

                var data = new
                {
                    questionType = "thresholdWallSpillover",
                    difficulty = actualDifficulty,

                    startingValue = startValue,

                    thresholdWall = new
                    {
                        value = threshold,
                        label = "THRESHOLD WALL"
                    },

                    addition = new
                    {
                        total = addValue,
                        distanceToWall,
                        spillover = spilloverValue
                    },

                    remainderDeflection = new
                    {
                        value = spilloverValue,
                        label = "Remainder Deflection"
                    },

                    terminalSpilloverZone = new
                    {
                        value = finalValue,
                        label = "TERMINAL SPILLOVER ZONE"
                    },

                    equation,

                    strategy = new
                    {
                        firstStep = $"{threshold} - {startValue}",
                        distanceToWall,
                        secondStep = $"{addValue} - {distanceToWall}",
                        spilloverValue
                    },

                    path,

                    animation = new
                    {
                        enabled = true,
                        startValue,
                        threshold,
                        finalValue,

                        movement = new
                        {
                            direction = "forward",
                            moveAutomatically = true,
                            collectCoins = true,
                            coinValue = 1,
                            pauseAtWall = true,
                            pauseAtWallMilliseconds = 700
                        },

                        phases = new[]
                        {
                    new
                    {
                        phase = 1,
                        name = "MOVE_TO_WALL",
                        steps = distanceToWall,
                        from = startValue,
                        to = threshold
                    },
                    new
                    {
                        phase = 2,
                        name = "SPILLOVER",
                        steps = spilloverValue,
                        from = threshold,
                        to = finalValue
                    }
                }
                    },

                    task1 = new
                    {
                        label = "Distance to Wall",
                        question = $"How many steps does the kid need to reach {threshold}?",
                        answerType = "number"
                    },

                    task2 = new
                    {
                        label = "Missing Number",
                        question = $"Find the missing number in {equation}.",
                        answerType = "number"
                    },

                    selectionMode = "input",
                    answerType = "number",

                    hint =
                        $"First find the distance from {startValue} to {threshold}. " +
                        $"Then find how much of {addValue} remains after reaching the wall."
                };

                int missingNumber = distanceToWall;

                var answer = JsonSerializer.Serialize(new
                {
                    distanceToWall,
                    missingNumber,
                    spilloverValue,
                    finalValue
                });

                return CreateQuestion(questionNumber, questionTypeId, "Help the kid reach the threshold wall, collect the coins, and find the missing number.", data, answer);
            }

            throw new InvalidOperationException($"Unable to generate a unique threshold wall spillover " + $"question for level {levelId}, " + $"difficulty {actualDifficulty}, " + $"range {range.Min}-{range.Max}.");
        }
        private GeneratedQuestion GenerateAdditionPath(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {

            if (!AdditionDifficultyConfig.ByGrade.TryGetValue(levelId, out var difficultyRanges))
            {
                throw new ArgumentException($"Addition path is not configured for level {levelId}.");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (actualDifficulty < 1 || actualDifficulty > difficultyRanges.Length)
            {
                throw new ArgumentException(
                    $"Difficulty {difficultyId} is not configured " +
                    $"for level {levelId}.");
            }

            DifficultyRange range = difficultyRanges[actualDifficulty - 1];

            const int nodeCount = 6;
            const int operationCount = 6;
            const int maxAttempts = 100;

            var values = new List<int>();
            var operations = new List<int>();
            int finishValue = 0;
            bool generated = false;

            for (int attempt = 0; attempt < maxAttempts; attempt++)
            {
                values.Clear();
                operations.Clear();

                int startValue = _random.Next(range.Min, range.Max + 1);

                values.Add(startValue);

                for (int i = 1; i < nodeCount; i++)
                {
                    int nextValue;

                    do
                    {
                        nextValue = _random.Next(range.Min, range.Max + 1);
                    }
                    while (nextValue == values[^1]);

                    values.Add(nextValue);
                }


                do
                {
                    finishValue = _random.Next(range.Min, range.Max + 1);
                }
                while (finishValue == values[^1]);


                for (int i = 0; i < nodeCount - 1; i++)
                {
                    operations.Add(values[i + 1] - values[i]);
                }

                operations.Add(finishValue - values[^1]);
                if (operations.Any(x => x == 0))
                {
                    continue;
                }

                string key =
                    $"{questionType.Code}:" +
                    $"{string.Join(",", values)}:" +
                    $"{finishValue}";

                if (usedGameCombinations.Contains(key))
                {
                    continue;
                }

                usedGameCombinations.Add(key);
                generated = true;
                break;
            }

            if (!generated)
            {
                throw new InvalidOperationException(
                    $"Unable to generate a unique addition path " +
                    $"for level {levelId}, " +
                    $"difficulty {actualDifficulty}, " +
                    $"range {range.Min}-{range.Max}.");
            }

            var nodes = new List<object>();

            for (int i = 0; i < nodeCount; i++)
            {
                char letter = (char)('A' + i);

                bool isStart = i == 0;

                nodes.Add(new
                {
                    id = $"node-{letter}",
                    label = $"Node {letter}",
                    value = isStart ? values[i].ToString() : "?",
                    actualValue = values[i],
                    isStart,
                    isMissing = !isStart
                });
            }


            var finish = new
            {
                id = "finish",
                label = "Finish",
                value = "?",
                actualValue = finishValue,
                isFinish = true,
                isMissing = true
            };


            var paths = new List<object>();

            for (int i = 0; i < operationCount; i++)
            {
                int operation = operations[i];
                string from = $"node-{(char)('A' + i)}";
                string to = i < nodeCount - 1 ? $"node-{(char)('A' + i + 1)}" : "finish";
                bool isAddition = operation > 0;

                paths.Add(new
                {
                    from,
                    to,
                    operation = isAddition ? $"+{operation}" : operation.ToString(),
                    operationValue = Math.Abs(operation),
                    operationType = isAddition ? "add" : "subtract",
                    fromValue = i < nodeCount ? values[i] : finishValue,
                    toValue = i < nodeCount - 1 ? values[i + 1] : finishValue
                });
            }

            var answers = new List<object>();

            for (int i = 1; i < nodeCount; i++)
            {
                char letter = (char)('A' + i);

                answers.Add(new
                {
                    nodeId = $"node-{letter}",
                    answer = values[i]
                });
            }
            answers.Add(new
            {
                nodeId = "finish",
                answer = finishValue
            });
            var data = new
            {
                questionType = "additionPath",
                startNode = "node-A",
                finishNode = "finish",
                nodeCount,
                operationCount,
                nodes,
                finish,
                paths,
                startValue = values[0],
                finalValue = finishValue,
                range = new
                {
                    min = range.Min,
                    max = range.Max
                },
                difficulty = actualDifficulty,
                selectionMode = "input",
                answerType = "number",
                answers
            };
            return CreateQuestion(questionNumber, questionTypeId, "Follow the path and complete the missing numbers.", data, finishValue.ToString());
        }
    }
}
