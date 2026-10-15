using kids_app.Models;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;

namespace kids_app.Services
{
    public partial class EarlyLevelWorksheetGenerationService
    {

        private GeneratedQuestion GenerateEarlyDivisionQuestion(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,List<string> visualIcons,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(Early_Div_Mul_DifficultyConfig.ByLevel,levelId,actualDifficulty);

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
                $"EARLY_DIVISION:{code}:L{levelId}:D{actualDifficulty}";


            if (code == "DIVISION_SHARE_EQUALLY")
            {
                var candidates = (
                    from total in Enumerable.Range(min, max - min + 1)
                    from groupCount in Enumerable.Range(2, 4)
                    where total % groupCount == 0
                    let itemsPerGroup = total / groupCount
                    where itemsPerGroup >= 1
                    from icon in icons
                    select (
                        Total: total,
                        GroupCount: groupCount,
                        ItemsPerGroup: itemsPerGroup,
                        Icon: icon
                    )).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.Total}:{x.GroupCount}:{x.Icon}",
                    usedGameCombinations);

                var objects = Enumerable
                    .Range(1, selected.Total)
                    .Select(i => new
                    {
                        id = $"OBJECT_{i}",
                        icon = selected.Icon
                    })
                    .ToArray();

                var recipients = Enumerable
                    .Range(1, selected.GroupCount)
                    .Select(i => new
                    {
                        id = $"RECIPIENT_{i}",
                        objects = Array.Empty<string>()
                    })
                    .ToArray();

                string questionText =
                    $"Share {selected.Total} objects equally among " +
                    $"{selected.GroupCount} recipients. How many objects " +
                    "should each recipient receive?";

                object data = new
                {
                    renderKey = "DivisionSharing",
                    questionType = code,
                    puzzleTitle = "Share Fairly",
                    icon = selected.Icon,
                    objects,
                    groupCount = selected.GroupCount,
                    recipients,
                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.ItemsPerGroup.ToString());
            }

            if (code == "DIVISION_MAKE_EQUAL_GROUPS")
            {
                var candidates = (
                    from total in Enumerable.Range(min, max - min + 1)
                    from itemsPerGroup in Enumerable.Range(2, Math.Min(4, max - 1))
                    where total % itemsPerGroup == 0
                    let groupCount = total / itemsPerGroup
                    where groupCount >= 2 && groupCount <= 5
                    from icon in icons
                    select (
                        Total: total,
                        ItemsPerGroup: itemsPerGroup,
                        GroupCount: groupCount,
                        Icon: icon
                    )).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.Total}:{x.ItemsPerGroup}:{x.Icon}",
                    usedGameCombinations);

                var objects = Enumerable
                    .Range(1, selected.Total)
                    .Select(i => new
                    {
                        id = $"OBJECT_{i}",
                        icon = selected.Icon
                    })
                    .ToArray();

                string questionText =
                    $"There are {selected.Total} objects. Put exactly " +
                    $"{selected.ItemsPerGroup} objects in each group. " +
                    "How many complete groups can you make?";

                object data = new
                {
                    renderKey = "DivisionSharing",
                    questionType = code,
                    puzzleTitle = "Make Equal Groups",
                    icon = selected.Icon,
                    totalItems = selected.Total,
                    itemsPerGroup = selected.ItemsPerGroup,
                    objects,
                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.GroupCount.ToString());
            }


            if (code == "DIVISION_FIX_UNFAIR_SHARE")
            {
                var candidates = (
                    from firstCount in Enumerable.Range(1, max)
                    from secondCount in Enumerable.Range(1, max)
                    let total = firstCount + secondCount
                    let difference = Math.Abs(firstCount - secondCount)
                    where total >= min
                    where total <= max
                    where difference >= 2 && difference % 2 == 0
                    from icon in icons
                    select (
                        FirstCount: firstCount,
                        SecondCount: secondCount,
                        Total: total,
                        MoveCount: difference / 2,
                        Icon: icon
                    )).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x =>
                        $"{x.FirstCount}:{x.SecondCount}:{x.Icon}",
                    usedGameCombinations);

                string fromGroup =
                    selected.FirstCount > selected.SecondCount
                        ? "GROUP_A"
                        : "GROUP_B";

                string toGroup =
                    selected.FirstCount > selected.SecondCount
                        ? "GROUP_B"
                        : "GROUP_A";

                var groups = new[]
                {
            new
            {
                id = "GROUP_A",
                childLabel = "Child A",
                objects = Enumerable
                    .Range(1, selected.FirstCount)
                    .Select(i => new
                    {
                        id = $"A_{i}",
                        icon = selected.Icon
                    })
                    .ToArray()
            },
            new
            {
                id = "GROUP_B",
                childLabel = "Child B",
                objects = Enumerable
                    .Range(1, selected.SecondCount)
                    .Select(i => new
                    {
                        id = $"B_{i}",
                        icon = selected.Icon
                    })
                    .ToArray()
            }
        };

                string questionText =
                    $"Child A has {selected.FirstCount} objects and Child B " +
                    $"has {selected.SecondCount}. Move objects from the larger " +
                    "group to the smaller group until both have equal shares. " +
                    "How many objects must be moved?";

                object data = new
                {
                    renderKey = "DivisionSharing",
                    questionType = code,
                    puzzleTitle = "Fix the Unfair Share",
                    icon = selected.Icon,
                    groups,
                    moveFrom = fromGroup,
                    moveTo = toGroup,
                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.MoveCount.ToString());
            }


            if (code == "DIVISION_FIND_LEFTOVER")
            {
                var candidates = (
                    from total in Enumerable.Range(min, max - min + 1)
                    from groupSize in Enumerable.Range(2, Math.Min(4, max - 1))
                    where total / groupSize >= 1
                    where total % groupSize != 0
                    from icon in icons
                    select (
                        Total: total,
                        GroupSize: groupSize,
                        CompleteGroups: total / groupSize,
                        Remainder: total % groupSize,
                        Icon: icon
                    )).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.Total}:{x.GroupSize}:{x.Icon}",
                    usedGameCombinations);

                var objects = Enumerable
                    .Range(1, selected.Total)
                    .Select(i => new
                    {
                        id = $"OBJECT_{i}",
                        icon = selected.Icon
                    })
                    .ToArray();

                string questionText =
                    $"Make groups of {selected.GroupSize} using " +
                    $"{selected.Total} objects. How many objects will be " +
                    "left over when every complete group has been made?";

                object data = new
                {
                    renderKey = "DivisionSharing",
                    questionType = code,
                    puzzleTitle = "Find the Leftover",
                    icon = selected.Icon,
                    totalItems = selected.Total,
                    groupSize = selected.GroupSize,
                    objects,
                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Remainder.ToString());
            }

            throw new ArgumentException(
                $"Unsupported Early Learner division type: {code}");
        }

        private GeneratedQuestion GenerateDivisionNumericalQuestion(int questionNumber,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
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
        "DIVISION_MISSING_QUOTIENT",
        "DIVISION_MISSING_DIVIDEND_OR_DIVISOR",
        "DIVISION_QUOTIENT_SELECTION",
        "DIVISION_EQUATION_CHECK",
        "DIVISION_RELATED_MULTIPLICATION"
    };

            if (!supportedCodes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported division question type: {code}");
            }

            DifficultyRange range = GetDifficultyRange(
                AdditionDifficultyConfig.ByGrade,
                levelId,
                difficultyId);

            var facts = BuildDivisionFacts(range);

            switch (code)
            {
               
                case "DIVISION_MISSING_QUOTIENT":
                    {
                        var selected = GetUnusedCandidate(
                            facts,
                            code,
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        string equation =
                            $"{selected.Dividend} ÷ {selected.Divisor} = ?";

                        var data = new
                        {
                            questionType = code,
                            dividend = selected.Dividend,
                            divisor = selected.Divisor,
                            quotient = (int?)null,
                            operatorSymbol = "÷",
                            equation,
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionType.QuestionTypeId,"Calculate the missing quotient.",data,selected.Quotient.ToString());
                    }
                case "DIVISION_MISSING_DIVIDEND_OR_DIVISOR":
                    {
                        var candidates = new List<(int Divisor,int Quotient, int Dividend, string MissingPosition )>();

                        foreach (var fact in facts)
                        {
                            candidates.Add((fact.Divisor,fact.Quotient,fact.Dividend,"dividend"));

                            if (fact.Quotient >= 2)
                            {
                                candidates.Add((fact.Divisor,fact.Quotient,fact.Dividend,"divisor"));
                            }
                        }

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x =>
                                $"{x.Dividend}:{x.Divisor}:" +
                                $"{x.MissingPosition}",
                            usedGameCombinations);

                        int? dividend =
                            selected.MissingPosition == "dividend"
                                ? null
                                : selected.Dividend;

                        int? divisor =
                            selected.MissingPosition == "divisor"
                                ? null
                                : selected.Divisor;

                        string dividendText = dividend?.ToString() ?? "?";
                        string divisorText = divisor?.ToString() ?? "?";

                        string equation =
                            $"{dividendText} ÷ {divisorText} = {selected.Quotient}";

                        string answer = selected.MissingPosition switch
                        {
                            "dividend" => selected.Dividend.ToString(),
                            "divisor" => selected.Divisor.ToString(),
                            _ => throw new InvalidOperationException()
                        };

                        var data = new
                        {
                            questionType = code,
                            dividend,
                            divisor,
                            quotient = selected.Quotient,
                            operatorSymbol = "÷",
                            missingPosition = selected.MissingPosition,
                            equation,
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber,questionType.QuestionTypeId,"Find the missing dividend or divisor.",data,answer);
                    }

                case "DIVISION_QUOTIENT_SELECTION":
                    {
                        var selected = GetUnusedCandidate(
                            facts,
                            code,
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        var options = BuildNumericalOptions(
                            selected.Quotient,
                            1,
                            range.Max);

                        var data = new
                        {
                            questionType = code,
                            dividend = selected.Dividend,
                            divisor = selected.Divisor,
                            quotient = (int?)null,
                            operatorSymbol = "÷",
                            equation =
                                $"{selected.Dividend} ÷ {selected.Divisor} = ?",
                            options,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        return CreateQuestion(questionNumber,questionType.QuestionTypeId,"Choose the correct quotient.",data,selected.Quotient.ToString());
                    }

                case "DIVISION_EQUATION_CHECK":
                    {
                        var candidates =
                            new List<(
                                int Divisor,
                                int Quotient,
                                int Dividend,
                                int WrongQuotient
                            )>();

                        foreach (var fact in facts)
                        {
                            var wrongQuotients = GetNearbyNumericalValues(
                                fact.Quotient,
                                1,
                                range.Max,
                                6);

                            foreach (int wrongQuotient in wrongQuotients)
                            {
                                candidates.Add((fact.Divisor,fact.Quotient,fact.Dividend,wrongQuotient));
                            }
                        }

                        var selected = GetUnusedCandidate(
                            candidates,
                            code,
                            x =>
                                $"{x.Dividend}:{x.Divisor}:" +
                                $"{x.WrongQuotient}",
                            usedGameCombinations);

                        string incorrectEquation =
                            $"{selected.Dividend} ÷ {selected.Divisor} = {selected.WrongQuotient}";

                        var correctEquations = facts
                            .Select(f =>
                                $"{f.Dividend} ÷ {f.Divisor} = {f.Quotient}")
                            .Where(equation =>
                                equation != incorrectEquation)
                            .Distinct()
                            .ToList();

                        var options = BuildTextOptions(
                            incorrectEquation,
                            correctEquations);

                        var data = new
                        {
                            questionType = code,
                            options,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        return CreateQuestion(questionNumber,questionType.QuestionTypeId,"Which division equation is incorrect?",data,incorrectEquation);
                    }

                case "DIVISION_RELATED_MULTIPLICATION":
                    {
                        var selected = GetUnusedCandidate(
                            facts,
                            code,
                            x => $"{x.Dividend}:{x.Divisor}",
                            usedGameCombinations);

                        string correctMultiplication =
                            $"{selected.Divisor} × {selected.Quotient} = {selected.Dividend}";
                        var wrongMultiplications = BuildMultiplicationFacts(
                                range,
                                ordered: true)
                            .Where(f => f.Product != selected.Dividend)
                            .Select(f =>
                                $"{f.First} × {f.Second} = {f.Product}")
                            .Distinct()
                            .ToList();

                        var options = BuildTextOptions(
                            correctMultiplication,
                            wrongMultiplications);

                        var data = new
                        {
                            questionType = code,
                            dividend = selected.Dividend,
                            divisor = selected.Divisor,
                            equation =
                                $"{selected.Dividend} ÷ {selected.Divisor} = ?",
                            options,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        return CreateQuestion(questionNumber,questionType.QuestionTypeId,"Which multiplication equation can verify this division?",data,correctMultiplication);
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported division question type: {code}");
            }
        }

    }
}
