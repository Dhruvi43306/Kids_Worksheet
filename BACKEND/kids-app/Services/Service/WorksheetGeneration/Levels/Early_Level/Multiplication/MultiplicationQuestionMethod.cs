using kids_app.Models;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;
using System.Text.Json;
namespace kids_app.Services
{
    public partial class EarlyLevelWorksheetGenerationService
    {

        private GeneratedQuestion GenerateEarlyMultiplicationQuestion(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,List<string> visualIcons,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code =
                questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(EarlyMultiplicationDifficultyConfig.ByLevel,levelId,actualDifficulty);

            int min = range.Min;
            int max = range.Max;

            var icons = (visualIcons ?? new List<string>())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToList();

            if (icons.Count == 0)
            {
                throw new InvalidOperationException(
                    "The selected visual style has no usable icons.");
            }

            string keyPrefix =
                $"EARLY_MULTIPLICATION:{code}:L{levelId}:D{actualDifficulty}";


            if (code == "MULTIPLICATION_COUNT_EQUAL_GROUPS")
            {
                var candidates = (
                    from groupCount in Enumerable.Range(2, 4)
                    from perGroup in Enumerable.Range(1, Math.Min(5, max))
                    let total = groupCount * perGroup
                    where total >= min && total <= max
                    from icon in icons
                    select (
                        GroupCount: groupCount,
                        ItemsPerGroup: perGroup,
                        Total: total,
                        Icon: icon
                    )).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.GroupCount}:{x.ItemsPerGroup}:{x.Icon}",
                    usedGameCombinations);

                var groups = Enumerable
                    .Range(1, selected.GroupCount)
                    .Select(group => new
                    {
                        id = $"GROUP_{(char)('A' + group - 1)}",
                        items = Enumerable
                            .Range(1, selected.ItemsPerGroup)
                            .Select(item => new
                            {
                                id = $"G{group}_ITEM_{item}",
                                icon = selected.Icon
                            })
                            .ToArray()
                    })
                    .ToArray();

                string questionText =
                    $"There are {selected.GroupCount} equal groups. " +
                    $"Each group has {selected.ItemsPerGroup} objects. " +
                    "How many objects are there altogether?";

                object data = new
                {
                    renderKey = "MultiplicationCountGroup",
                    questionType = code,
                    puzzleTitle = "Count All the Groups",
                    icon = selected.Icon,
                    groupCount = selected.GroupCount,
                    itemsPerGroup = selected.ItemsPerGroup,
                    groups,
                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Total.ToString());
            }


            if (code == "MULTIPLICATION_COMPLETE_GROUPS")
            {
                var candidates = new List<(int GroupCount,int ItemsPerGroup,int IncompleteGroupIndex,int ExistingItems,int MissingItems,string Icon)>();

                for (int groupCount = 2; groupCount <= 4; groupCount++)
                {
                    for (int perGroup = 1; perGroup <= Math.Min(5, max); perGroup++)
                    {
                        for (int existing = 0; existing < perGroup; existing++)
                        {
                            int totalDisplayed =(groupCount - 1) * perGroup + existing;

                            if (totalDisplayed < min || totalDisplayed > max)
                                continue;

                            for (int missingIndex = 0;missingIndex < groupCount;missingIndex++)
                            {
                                foreach (string icon in icons)
                                {
                                    candidates.Add((groupCount,perGroup,missingIndex,existing,perGroup - existing,icon));
                                }
                            }
                        }
                    }
                }

                var selected = GetUnusedCandidate(candidates,keyPrefix,x =>$"{x.GroupCount}:{x.ItemsPerGroup}:" +$"{x.IncompleteGroupIndex}:{x.ExistingItems}:{x.Icon}",usedGameCombinations);

                var groups = Enumerable
                    .Range(0, selected.GroupCount)
                    .Select(index =>
                    {
                        bool isIncomplete =
                            index == selected.IncompleteGroupIndex;

                        int visibleCount = isIncomplete
                            ? selected.ExistingItems
                            : selected.ItemsPerGroup;

                        return new
                        {
                            id = $"GROUP_{(char)('A' + index)}",
                            items = Enumerable
                                .Range(1, visibleCount)
                                .Select(item => new
                                {
                                    id = $"G{index + 1}_ITEM_{item}",
                                    icon = selected.Icon
                                })
                                .ToArray(),
                            requiredSlots = selected.ItemsPerGroup,
                            isIncomplete
                        };
                    })
                    .ToArray();

                string questionText =
                    $"Every group must contain {selected.ItemsPerGroup} objects. " +
                    "One group is incomplete. How many more objects does it need?";

                object data = new
                {
                    renderKey = "MultiplicationCountGroup",
                    questionType = code,
                    puzzleTitle = "Complete the Equal Groups",
                    icon = selected.Icon,
                    groups,
                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.MissingItems.ToString());
            }
            

            if (code == "MULTIPLICATION_FIND_UNEQUAL_GROUP")
            {
                var candidates = new List<(int GroupCount,int CommonCount,int DifferentCount,int DifferentIndex,int Total,string Icon)>();

                for (int groupCount = 3; groupCount <= 4; groupCount++)
                {
                    for (int common = 1; common <= max; common++)
                    {
                        for (int different = 1; different <= max; different++)
                        {
                            if (different == common)
                                continue;

                            int total = (groupCount - 1) * common + different;

                            if (total < min || total > max)
                                continue;

                            for (int differentIndex = 0;differentIndex < groupCount;differentIndex++)
                            {
                                foreach (string icon in icons)
                                {
                                    candidates.Add((groupCount,common,different,differentIndex,total,icon));
                                }
                            }
                        }
                    }
                }

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x =>
                        $"{x.GroupCount}:{x.CommonCount}:{x.DifferentCount}:" +
                        $"{x.DifferentIndex}:{x.Icon}",
                    usedGameCombinations);

                var groups = Enumerable
                    .Range(0, selected.GroupCount)
                    .Select(index =>
                    {
                        bool isDifferent =
                            index == selected.DifferentIndex;

                        int itemCount = isDifferent
                            ? selected.DifferentCount
                            : selected.CommonCount;

                        return new
                        {
                            id = $"GROUP_{(char)('A' + index)}",
                            items = Enumerable
                                .Range(1, itemCount)
                                .Select(item => new
                                {
                                    id = $"G{index + 1}_ITEM_{item}",
                                    icon = selected.Icon
                                })
                                .ToArray()
                        };
                    })
                    .ToArray();

                string correctGroupId =
                    $"GROUP_{(char)('A' + selected.DifferentIndex)}";

                string questionText =
                    "Most groups contain the same number of objects. " +
                    "Find the group that has a different number.";

                object data = new
                {
                    renderKey = "MultiplicationCountGroup",
                    questionType = code,
                    puzzleTitle = "Find the Unequal Group",
                    icon = selected.Icon,
                    groups,
                    answerMode = "single-choice"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,correctGroupId);
            }

            if (code == "MULTIPLICATION_SAME_TOTAL_GROUPS")
            {
                var layouts = (
                    from groupCount in Enumerable.Range(2, 4)
                    from perGroup in Enumerable.Range(1, Math.Min(5, max))
                    let total = groupCount * perGroup
                    where total >= min && total <= max
                    select (
                        GroupCount: groupCount,
                        ItemsPerGroup: perGroup,
                        Total: total
                    )).ToList();

                var candidates = new List<(
                    int Target,
                    int G1, int S1,
                    int G2, int S2,
                    int WG1, int WS1,
                    int WG2, int WS2,
                    string Icon)>();

                foreach (var targetGroup in layouts.GroupBy(x => x.Total))
                {
                    var correctLayouts = targetGroup.ToList();

                    var wrongLayouts = layouts
                        .Where(x => x.Total != targetGroup.Key)
                        .ToList();

                    for (int i = 0; i < correctLayouts.Count; i++)
                    {
                        for (int j = i + 1; j < correctLayouts.Count; j++)
                        {
                            for (int w1 = 0; w1 < wrongLayouts.Count; w1++)
                            {
                                for (int w2 = w1 + 1;
                                     w2 < wrongLayouts.Count;
                                     w2++)
                                {
                                    foreach (string icon in icons)
                                    {
                                        candidates.Add((
                                            targetGroup.Key,
                                            correctLayouts[i].GroupCount,
                                            correctLayouts[i].ItemsPerGroup,
                                            correctLayouts[j].GroupCount,
                                            correctLayouts[j].ItemsPerGroup,
                                            wrongLayouts[w1].GroupCount,
                                            wrongLayouts[w1].ItemsPerGroup,
                                            wrongLayouts[w2].GroupCount,
                                            wrongLayouts[w2].ItemsPerGroup,
                                            icon));
                                    }
                                }
                            }
                        }
                    }
                }

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x =>
                        $"{x.Target}:{x.G1}x{x.S1}:{x.G2}x{x.S2}:" +
                        $"{x.WG1}x{x.WS1}:{x.WG2}x{x.WS2}:{x.Icon}",
                    usedGameCombinations);

                var options = new List<(
                    string Id,
                    int GroupCount,
                    int ItemsPerGroup,
                    bool IsCorrect)>
        {
            ("A", selected.G1, selected.S1, true),
            ("B", selected.G2, selected.S2, true),
            ("C", selected.WG1, selected.WS1, false),
            ("D", selected.WG2, selected.WS2, false)
        };

                Shuffle(options);

                var visibleOptions = options
                    .Select(option => new
                    {
                        id = $"OPTION_{option.Id}",
                        groupCount = option.GroupCount,
                        itemsPerGroup = option.ItemsPerGroup,
                        groups = Enumerable
                            .Range(1, option.GroupCount)
                            .Select(group => new
                            {
                                id = $"GROUP_{group}",
                                items = Enumerable
                                    .Range(1, option.ItemsPerGroup)
                                    .Select(item => new
                                    {
                                        icon = selected.Icon
                                    })
                                    .ToArray()
                            })
                            .ToArray()
                    })
                    .ToArray();

                var correctIds = options
                    .Where(option => option.IsCorrect)
                    .Select(option => $"OPTION_{option.Id}")
                    .ToArray();

                string questionText =
                    $"Choose the two different group arrangements that each " +
                    $"contain exactly {selected.Target} objects.";

                object data = new
                {
                    renderKey = "MultiplicationCountGroup",
                    questionType = code,
                    puzzleTitle = "Make the Same Total",
                    icon = selected.Icon,
                    targetTotal = selected.Target,
                    options = visibleOptions,
                    requiredSelections = 2,
                    answerMode = "multi-select"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,JsonSerializer.Serialize(correctIds));
            }

            throw new ArgumentException(
                $"Unsupported Early Learner multiplication type: {code}");
        }

        private GeneratedQuestion GenerateMultiplicationNumericalQuestion(int questionNumber, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code = questionType.Code?
                .Trim()
                .ToUpperInvariant() ?? string.Empty;

            string[] supportedCodes =
            {
        "MULTIPLICATION_MISSING_NUMBER",
        "MULTIPLICATION_PRODUCT_SELECTION",
        "MULTIPLICATION_EQUATION_CHECK",
        "MULTIPLICATION_NUMBER_PATTERN",
        "MULTIPLICATION_EQUIVALENT_FACT"
    };

            if (!supportedCodes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported multiplication question type: {code}");
            }

            DifficultyRange range = GetDifficultyRange(Early_Div_Mul_DifficultyConfig.ByLevel,levelId,difficultyId);

            var facts = BuildMultiplicationFacts(range, ordered: false);

            var orderedFacts = BuildMultiplicationFacts(range, ordered: true);

            switch (code)
            {
                case "MULTIPLICATION_MISSING_NUMBER":
                    {
                        var candidates = facts.SelectMany(f => new[]
                        {
                (
                    First: f.First,
                    Second: f.Second,
                    Product: f.Product,
                    Position: "product"
                ),
                (
                    First: f.First,
                    Second: f.Second,
                    Product: f.Product,
                    Position: "firstFactor"
                ),
                (
                    First: f.First,
                    Second: f.Second,
                    Product: f.Product,
                    Position: "secondFactor"
                )
            }).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.First}:{x.Second}:{x.Position}",
                            usedGameCombinations);

                        int? firstNumber =
                            selected.Position == "firstFactor"
                                ? null
                                : selected.First;

                        int? secondNumber =
                            selected.Position == "secondFactor"
                                ? null
                                : selected.Second;

                        int? product =
                            selected.Position == "product"
                                ? null
                                : selected.Product;

                        string answer = selected.Position switch
                        {
                            "product" => selected.Product.ToString(),
                            "firstFactor" => selected.First.ToString(),
                            "secondFactor" => selected.Second.ToString(),
                            _ => throw new InvalidOperationException()
                        };

                        string firstText = firstNumber?.ToString() ?? "?";
                        string secondText = secondNumber?.ToString() ?? "?";
                        string productText = product?.ToString() ?? "?";

                        string equation =
                            $"{firstText} × {secondText} = {productText}";

                        var data = new
                        {
                            questionType = code,
                            firstNumber,
                            secondNumber,
                            product,
                            operatorSymbol = "×",
                            missingPosition = selected.Position,
                            equation,
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionType.QuestionTypeId, "Complete the missing number in the multiplication equation.", data, answer);
                    }

                case "MULTIPLICATION_PRODUCT_SELECTION":
                    {
                        var selected = GetUnusedCandidate(
                            orderedFacts,
                            code,
                            x => $"{x.First}:{x.Second}",
                            usedGameCombinations);

                        var options = BuildNumericalOptions(
                            selected.Product,
                            range.Min,
                            range.Max);

                        var data = new
                        {
                            questionType = code,
                            firstNumber = selected.First,
                            secondNumber = selected.Second,
                            product = (int?)null,
                            operatorSymbol = "×",
                            equation =
                                $"{selected.First} × {selected.Second} = ?",
                            options,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        return CreateQuestion(questionNumber, questionType.QuestionTypeId, "Choose the correct product.", data, selected.Product.ToString());
                    }
                case "MULTIPLICATION_EQUATION_CHECK":
                    {
                        var candidates = new List<(int First, int Second, int Product, int WrongProduct)>();

                        foreach (var fact in orderedFacts)
                        {
                            var wrongProducts = GetNearbyNumericalValues(fact.Product,range.Min,range.Max,6);

                            foreach (int wrongProduct in wrongProducts)
                            {
                                candidates.Add((fact.First, fact.Second, fact.Product, wrongProduct));
                            }
                        }

                        var selected = GetUnusedCandidate(candidates,code,x => $"{x.First}:{x.Second}:{x.WrongProduct}",usedGameCombinations);

                        string incorrectEquation =
                            $"{selected.First} × {selected.Second} = {selected.WrongProduct}";

                        var correctEquations = orderedFacts
                            .Where(f =>
                                f.Product == f.First * f.Second)
                            .Select(f =>
                                $"{f.First} × {f.Second} = {f.Product}")
                            .Where(equation =>
                                equation != incorrectEquation)
                            .Distinct()
                            .ToList();

                        var options = BuildTextOptions(incorrectEquation, correctEquations);

                        var data = new
                        {
                            questionType = code,
                            options,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        return CreateQuestion(questionNumber, questionType.QuestionTypeId, "Which multiplication equation is incorrect?", data, incorrectEquation);
                    }


                case "MULTIPLICATION_NUMBER_PATTERN":
                    {
                        var candidates =
                            new List<(int Start, int Step, int Length, int MissingIndex)>();

                        int minStart = Math.Max(1, range.Min);
                        int maxNumber = range.Max;

                        // Generate normal multiplication/skip-counting patterns first.
                        for (int length = 3; length <= 5; length++)
                        {
                            for (int step = 2; step <= maxNumber - minStart; step++)
                            {
                                int largestStart = maxNumber - step * (length - 1);

                                for (int start = minStart; start <= largestStart; start++)
                                {
                                    // Preserve your existing skip-counting rule.
                                    if (start % step != 0)
                                        continue;

                                    for (int missingIndex = 0;
                                         missingIndex < length;
                                         missingIndex++)
                                    {
                                        candidates.Add(
                                            (start, step, length, missingIndex));
                                    }
                                }
                            }
                        }

                        // Fallback for small ranges such as 2-5.
                        // A step of 1 ensures that a valid sequence can still be generated.
                        if (candidates.Count == 0)
                        {
                            for (int length = 3; length <= 5; length++)
                            {
                                int largestStart = maxNumber - (length - 1);

                                for (int start = minStart;
                                     start <= largestStart;
                                     start++)
                                {
                                    for (int missingIndex = 0;
                                         missingIndex < length;
                                         missingIndex++)
                                    {
                                        candidates.Add(
                                            (start, 1, length, missingIndex));
                                    }
                                }
                            }
                        }

                        if (candidates.Count == 0)
                        {
                            throw new InvalidOperationException(
                                $"Cannot generate a number pattern for range " +
                                $"{range.Min}-{range.Max}. " +
                                "The range must contain at least three consecutive numbers.");
                        }

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x => $"{x.Start}:{x.Step}:{x.Length}:{x.MissingIndex}",
                            usedGameCombinations);

                        int[] completeSequence = Enumerable
                            .Range(0, selected.Length)
                            .Select(i => selected.Start + i * selected.Step)
                            .ToArray();

                        int answer = completeSequence[selected.MissingIndex];

                        int?[] visibleSequence = completeSequence
                            .Select((value, index) =>
                                index == selected.MissingIndex
                                    ? (int?)null
                                    : value)
                            .ToArray();

                        string patternText = string.Join(
                            ", ",
                            visibleSequence.Select(value =>
                                value?.ToString() ?? "?"));

                        var data = new
                        {
                            questionType = code,
                            sequence = visibleSequence,
                            missingIndex = selected.MissingIndex,
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionType.QuestionTypeId,
                            $"Complete the multiplication number pattern: {patternText}",
                            data,
                            answer.ToString());
                    }
                case "MULTIPLICATION_EQUIVALENT_FACT":
                    {
                        var candidates = new List<(int First, int Second, int Product, int MatchFirst, int MatchSecond)>();
                        foreach (var group in orderedFacts.GroupBy(f => f.Product))
                        {
                            foreach (var source in group)
                            {
                                foreach (var match in group)
                                {
                                    if (source.First == match.First &&
                                        source.Second == match.Second)
                                    {
                                        continue;
                                    }

                                    candidates.Add((source.First, source.Second, source.Product, match.First, match.Second));
                                }
                            }
                        }

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x =>
                                $"{x.First}:{x.Second}:" +
                                $"{x.MatchFirst}:{x.MatchSecond}",
                            usedGameCombinations);

                        string correctMatch =
                            $"{selected.MatchFirst} × {selected.MatchSecond} = {selected.Product}";

                        var wrongMatches = orderedFacts
                            .Where(f => f.Product != selected.Product)
                            .Select(f =>
                                $"{f.First} × {f.Second} = {f.Product}")
                            .Distinct()
                            .ToList();

                        var options = BuildTextOptions(correctMatch, wrongMatches);

                        var data = new
                        {
                            questionType = code,
                            firstNumber = selected.First,
                            secondNumber = selected.Second,
                            targetProduct = selected.Product,
                            equation =
                                $"{selected.First} × {selected.Second} = {selected.Product}",
                            options,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        return CreateQuestion(questionNumber, questionType.QuestionTypeId, "Choose the multiplication equation with the same product.", data, correctMatch);
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported multiplication question type: {code}");
            }
        }


    }
}
