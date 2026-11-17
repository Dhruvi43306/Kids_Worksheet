
using kids_app.Models;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.OddEven;
using static kids_app.Services.Configurations.OddEven.OddEvenDifficultyConfig;


namespace kids_app.Services
{
    public partial class Grade3WorksheetGenerationService
    {
        private GeneratedQuestion GenerateOddEvenGridParity(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(
                    nameof(usedGameCombinations));
            }

            code = (code ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            if (levelId != 4)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    "These Odd/Even question types support Level 4 only.");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            Dictionary<int, DifficultyRange[]> ranges = code switch
            {
                "ODD_EVEN_GRID_PATH_LENGTH" =>
                    OddEvenDifficultyConfig.GridPathLengthByLevel,

                "ODD_EVEN_DIGIT_PRODUCT_PARITY" =>
                    OddEvenDifficultyConfig.DigitProductParityByLevel,

                "ODD_EVEN_AREA_TILE_PARITY" =>
                    OddEvenDifficultyConfig.AreaTileParityByLevel,

                "ODD_EVEN_DOUBLE_MINUS_ONE" =>
                    OddEvenDifficultyConfig.DoubleMinusOneByLevel,

                _ => throw new ArgumentException(
                    $"Unsupported Odd/Even question type: {code}",
                    nameof(code))
            };

            DifficultyRange range = GetDifficultyRange(ranges,levelId,actualDifficulty);

            string keyPrefix =
                $"{code}:L{levelId}:D{actualDifficulty}";

            if (code == "ODD_EVEN_GRID_PATH_LENGTH")
            {
                var candidates = (
                    from totalMoves in Enumerable.Range(
                        range.Min,
                        range.Max - range.Min + 1)

                    from rightMoves in Enumerable.Range(
                        1,
                        totalMoves - 1)

                    let upMoves = totalMoves - rightMoves

                    select new
                    {
                        RightMoves = rightMoves,
                        UpMoves = upMoves,
                        TotalMoves = totalMoves,
                        Parity = totalMoves % 2 == 0
                            ? "Even"
                            : "Odd"
                    }
                ).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.RightMoves}:{x.UpMoves}",
                    usedGameCombinations);

                string questionText =
                    $"A robot moves {selected.RightMoves} squares right " +
                    $"and {selected.UpMoves} squares up. " +
                    "Is the total number of moves odd or even?";

                var data = new
                {
                    renderKey = "OddEvenGridParity",
                    questionType = code,
                    title = "Odd/Even Grid Path Length",
                    questionText,

                    rightMoves = selected.RightMoves,
                    upMoves = selected.UpMoves,
                    totalMoves = selected.TotalMoves,

                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Parity);
            }
            if (code == "ODD_EVEN_DIGIT_PRODUCT_PARITY")
            {
                var candidates = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                    .Select(number => new
                    {
                        Number = number,
                        TensDigit = number / 10,
                        OnesDigit = number % 10,
                        Product = (number / 10) * (number % 10),
                        Parity =
                            ((number / 10) * (number % 10)) % 2 == 0
                                ? "Even"
                                : "Odd"
                    })
                    .ToList();

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => x.Number.ToString(),usedGameCombinations);

                string questionText =
                    $"Find the product of the digits in {selected.Number}. " +
                    "Is the product odd or even?";

                var data = new
                {
                    renderKey = "OddEvenGridParity",
                    questionType = code,
                    title = "Digit Product Parity",
                    questionText,

                    number = selected.Number,
                    tensDigit = selected.TensDigit,
                    onesDigit = selected.OnesDigit,

                    equation =
                        $"{selected.TensDigit} × {selected.OnesDigit} = ?",

                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Parity);
            }

            if (code == "ODD_EVEN_AREA_TILE_PARITY")
            {
                var dimensions = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1).ToList();

                var candidates = (
                    from rows in dimensions
                    from columns in dimensions

                    let totalTiles = rows * columns

                    select new
                    {
                        Rows = rows,
                        Columns = columns,
                        TotalTiles = totalTiles,
                        Parity = totalTiles % 2 == 0
                            ? "Even"
                            : "Odd"
                    }
                ).ToList();

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => $"{x.Rows}:{x.Columns}",usedGameCombinations);

                string questionText =
                    $"A rectangular floor contains {selected.Rows} rows " +
                    $"and {selected.Columns} columns of tiles. " +
                    "Is the total number of tiles odd or even?";

                var data = new
                {
                    renderKey = "OddEvenGridParity",
                    questionType = code,
                    title = "Rectangular Tile Count Parity",
                    questionText,

                    rows = selected.Rows,
                    columns = selected.Columns,
                    tilesPerRow = selected.Columns,
                    totalTiles = selected.TotalTiles,

                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Parity);
            }

            if (code == "ODD_EVEN_DOUBLE_MINUS_ONE")
            {
                var candidates = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                    .Select(startingNumber => new
                    {
                        StartingNumber = startingNumber,
                        DoubledNumber = startingNumber * 2,
                        Result = startingNumber * 2 - 1,
                        Parity = (startingNumber * 2 - 1) % 2 == 0
                            ? "Even"
                            : "Odd"
                    })
                    .ToList();

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => x.StartingNumber.ToString(),usedGameCombinations);

                string questionText =
                    $"Start with {selected.StartingNumber}. Double it and " +
                    "then subtract 1. Is the result odd or even?";

                var data = new
                {
                    renderKey = "OddEvenGridParity",
                    questionType = code,
                    title = "Double and Subtract One",
                    questionText,

                    startingNumber = selected.StartingNumber,
                    multiplier = 2,
                    subtractValue = 1,

                    equation =
                        $"{selected.StartingNumber} × 2 - 1 = ?",

                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Parity);
            }

            throw new ArgumentException(
                $"Unsupported Odd/Even question type: {code}",
                nameof(code));
        }

        //Unable to display this question. Please check the backend QuestionDataJson.
        private GeneratedQuestion GenerateOddEvenMultiplePattern(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(
                    nameof(usedGameCombinations));
            }

            code = (code ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            if (levelId != 4)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    "These question types support Level 4 only.");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            Dictionary<int, DifficultyRange[]> ranges = code switch
            {
                "ODD_EVEN_TRIANGULAR_DOT_PARITY" =>
                    OddEvenDifficultyConfig.TriangularDotParityByLevel,

                "ODD_EVEN_TOURNAMENT_BYE" =>
                    OddEvenDifficultyConfig.TournamentByeByLevel,

                "ODD_EVEN_REPEATED_PATTERN_PARITY" =>
                    OddEvenDifficultyConfig.RepeatedPatternParityByLevel,

                "ODD_EVEN_THREED_SHAPE_EDGE_PARITY" =>
                    OddEvenDifficultyConfig.ShapeEdgeParityByLevel,

                _ => throw new ArgumentException(
                    $"Unsupported Odd/Even question type: {code}",
                    nameof(code))
            };

            DifficultyRange range = GetDifficultyRange(ranges,levelId,actualDifficulty);

            string keyPrefix =
                $"{code}:L{levelId}:D{actualDifficulty}";

            if (code == "ODD_EVEN_TRIANGULAR_DOT_PARITY")
            {
                var candidates = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                    .Select(rows => new
                    {
                        Rows = rows
                    })
                    .ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => x.Rows.ToString(),
                    usedGameCombinations);

                int totalDots =
                    selected.Rows * (selected.Rows + 1) / 2;

                string answer =
                    totalDots % 2 == 0 ? "Even" : "Odd";

                string questionText =
                    $"A triangular pattern contains {selected.Rows} rows " +
                    "of dots. Is the total number of dots odd or even?";

                var data = new
                {
                    renderKey = "OddEvenMultiplePattern",
                    questionType = code,
                    title = "Triangular Dot Pattern",
                    questionText,

                    rowCount = selected.Rows,
                    patternType = "triangle",
                    dotIcon = "🔵",

                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
            }

            if (code == "ODD_EVEN_TOURNAMENT_BYE")
            {
                var candidates = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                    .Select(playerCount => new
                    {
                        PlayerCount = playerCount
                    })
                    .ToList();

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => x.PlayerCount.ToString(),usedGameCombinations);
                string answer =
                    selected.PlayerCount % 2 == 0 ? "No" : "Yes";

                string questionText =
                    $"{selected.PlayerCount} players enter a tournament. " +
                    "Players are paired for matches, with one unpaired " +
                    "player receiving a bye. Will anyone receive a bye?";

                var data = new
                {
                    renderKey = "OddEvenMultiplePattern",
                    questionType = code,
                    title = "Tournament Bye Challenge",
                    questionText,

                    playerCount = selected.PlayerCount,
                    playersPerMatch = 2,

                    options = new[] { "Yes", "No" },
                    answerMode = "choice",
                    answerType = "boolean"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
            }
            if (code == "ODD_EVEN_REPEATED_PATTERN_PARITY")
            {
                var patterns = new[]
                {
            new
            {
                Id = "RED_BLUE_CARS",
                FirstObjectName = "red cars",
                FirstObjectCount = 2,
                FirstObjectIcon = "🔴",
                SecondObjectName = "blue cars",
                SecondObjectCount = 1,
                SecondObjectIcon = "🔵",
                TargetObjectName = "blue cars",
                TargetCountPerBatch = 1
            },
            new
            {
                Id = "YELLOW_PURPLE_STARS",
                FirstObjectName = "yellow stars",
                FirstObjectCount = 1,
                FirstObjectIcon = "⭐",
                SecondObjectName = "purple stars",
                SecondObjectCount = 2,
                SecondObjectIcon = "💜",
                TargetObjectName = "purple stars",
                TargetCountPerBatch = 2
            },
            new
            {
                Id = "GREEN_ORANGE_BLOCKS",
                FirstObjectName = "green blocks",
                FirstObjectCount = 3,
                FirstObjectIcon = "🟩",
                SecondObjectName = "orange blocks",
                SecondObjectCount = 1,
                SecondObjectIcon = "🟧",
                TargetObjectName = "green blocks",
                TargetCountPerBatch = 3
            },
            new
            {
                Id = "CATS_DOGS",
                FirstObjectName = "cats",
                FirstObjectCount = 2,
                FirstObjectIcon = "🐱",
                SecondObjectName = "dogs",
                SecondObjectCount = 4,
                SecondObjectIcon = "🐶",
                TargetObjectName = "dogs",
                TargetCountPerBatch = 4
            }
        };

                var candidates = (
                    from pattern in patterns
                    from batchCount in Enumerable.Range(
                        range.Min,
                        range.Max - range.Min + 1)
                    select new
                    {
                        Pattern = pattern,
                        BatchCount = batchCount
                    }
                ).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.Pattern.Id}:{x.BatchCount}",
                    usedGameCombinations);

                int totalTargetObjects =
                    selected.Pattern.TargetCountPerBatch *
                    selected.BatchCount;

                string answer =
                    totalTargetObjects % 2 == 0 ? "Even" : "Odd";

                string questionText =
                    $"A repeated pattern contains " +
                    $"{selected.Pattern.FirstObjectCount} " +
                    $"{selected.Pattern.FirstObjectName} and " +
                    $"{selected.Pattern.SecondObjectCount} " +
                    $"{selected.Pattern.SecondObjectName} in each batch. " +
                    $"If there are {selected.BatchCount} batches, " +
                    $"is the total number of {selected.Pattern.TargetObjectName} " +
                    "odd or even?";

                var data = new
                {
                    renderKey = "OddEvenMultiplePattern",
                    questionType = code,
                    title = "Repeated Pattern Parity",
                    questionText,

                    patternId = selected.Pattern.Id,

                    firstObjectName = selected.Pattern.FirstObjectName,
                    firstObjectCount = selected.Pattern.FirstObjectCount,
                    firstObjectIcon = selected.Pattern.FirstObjectIcon,

                    secondObjectName = selected.Pattern.SecondObjectName,
                    secondObjectCount = selected.Pattern.SecondObjectCount,
                    secondObjectIcon = selected.Pattern.SecondObjectIcon,

                    targetObjectName = selected.Pattern.TargetObjectName,
                    batchCount = selected.BatchCount,

                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
            }
            if (code == "ODD_EVEN_THREED_SHAPE_EDGE_PARITY")
            {
                var shapes = new[]
                {
            new
            {
                Key = "TETRAHEDRON",
                Name = "Tetrahedron",
                EdgeCount = 6
            },
            new
            {
                Key = "SQUARE_PYRAMID",
                Name = "Square pyramid",
                EdgeCount = 8
            },
            new
            {
                Key = "TRIANGULAR_PRISM",
                Name = "Triangular prism",
                EdgeCount = 9
            },
            new
            {
                Key = "PENTAGONAL_PYRAMID",
                Name = "Pentagonal pyramid",
                EdgeCount = 10
            },
            new
            {
                Key = "CUBE",
                Name = "Cube",
                EdgeCount = 12
            },
            new
            {
                Key = "PENTAGONAL_PRISM",
                Name = "Pentagonal prism",
                EdgeCount = 15
            },
            new
            {
                Key = "HEXAGONAL_PRISM",
                Name = "Hexagonal prism",
                EdgeCount = 18
            },
            new
            {
                Key = "HEPTAGONAL_PRISM",
                Name = "Heptagonal prism",
                EdgeCount = 21
            },
            new
            {
                Key = "OCTAGONAL_PRISM",
                Name = "Octagonal prism",
                EdgeCount = 24
            }
        };

                var availableShapes = shapes
                    .Where(x =>
                        x.EdgeCount >= range.Min &&
                        x.EdgeCount <= range.Max)
                    .ToList();

                var oddShapes = availableShapes
                    .Where(x => x.EdgeCount % 2 != 0)
                    .ToList();

                var evenShapes = availableShapes
                    .Where(x => x.EdgeCount % 2 == 0)
                    .ToList();

                // Each question contains exactly one odd-edge shape
                // and three different even-edge shapes.
                var candidates = (
                    from correct in oddShapes
                    from even1 in evenShapes
                    from even2 in evenShapes
                        .Where(x => x.EdgeCount > even1.EdgeCount)
                    from even3 in evenShapes
                        .Where(x => x.EdgeCount > even2.EdgeCount)
                    select new
                    {
                        Correct = correct,
                        Distractor1 = even1,
                        Distractor2 = even2,
                        Distractor3 = even3
                    }
                ).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x =>
                        $"{x.Correct.Key}:" +
                        $"{x.Distractor1.Key}:" +
                        $"{x.Distractor2.Key}:" +
                        $"{x.Distractor3.Key}",
                    usedGameCombinations);

                var shapeOptions = new[]
                {
            selected.Correct,
            selected.Distractor1,
            selected.Distractor2,
            selected.Distractor3
        }
                .OrderBy(_ => _random.Next())
                .Select(x => new
                {
                    shapeKey = x.Key,
                    label = x.Name
                })
                .ToArray();

                string questionText =
                    "Which solid shape has an odd number of edges?";

                var data = new
                {
                    renderKey = "OddEvenMultiplePattern",
                    questionType = code,
                    title = "Three-Dimensional Shape Parity",
                    questionText,

                    shapeOptions,
                    answerMode = "choice",
                    answerType = "shape"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Correct.Name);
            }

            throw new ArgumentException(
                $"Unsupported Odd/Even question type: {code}",
                nameof(code));
        }

        private GeneratedQuestion GenerateOddEvenParityPuzzleBoard(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(
                    nameof(usedGameCombinations));
            }

            code = (code ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            if (levelId != 4)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    "These question types support Level 4 only.");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            Dictionary<int, DifficultyRange[]> ranges = code switch
            {
                "ODD_EVEN_RECTANGLE_PERIMETER_REASONING" =>
                    OddEvenDifficultyConfig.RectanglePerimeterByLevel,

                "ODD_EVEN_DOMINO_BOARD_COVERABILITY" =>
                    OddEvenDifficultyConfig.DominoBoardByLevel,

                "ODD_EVEN_HANDSHAKE_COUNT" =>
                    OddEvenDifficultyConfig.HandshakeCountByLevel,

                "ODD_EVEN_PRIME_EXCEPTION" =>
                    OddEvenDifficultyConfig.PrimeExceptionByLevel,

                _ => throw new ArgumentException(
                    $"Unsupported Odd/Even question type: {code}",
                    nameof(code))
            };

            DifficultyRange range = GetDifficultyRange(ranges,levelId,actualDifficulty);
            string keyPrefix =
                $"{code}:L{levelId}:D{actualDifficulty}";
            if (code == "ODD_EVEN_RECTANGLE_PERIMETER_REASONING")
            {
                var lengths = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1).ToList();

                var candidates = (
                    from sideA in lengths
                    from sideB in lengths
                    where sideA <= sideB
                    select new
                    {
                        SideA = sideA,
                        SideB = sideB,
                        Perimeter = 2 * (sideA + sideB)
                    }
                ).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.SideA}:{x.SideB}",
                    usedGameCombinations);

                string questionText =
                    $"A rectangle has side lengths {selected.SideA} cm " +
                    $"and {selected.SideB} cm. Is its perimeter odd or even?";

                var data = new
                {
                    renderKey = "OddEvenParityPuzzleBoard",
                    questionType = code,
                    title = "Rectangle Perimeter Parity",
                    questionText,

                    length = selected.SideA,
                    width = selected.SideB,
                    perimeterFormula = "2 × (length + width)",

                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,"Even");
            }

            if (code == "ODD_EVEN_DOMINO_BOARD_COVERABILITY")
            {
                var dimensions = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1).ToList();

                var candidates = (
                    from rows in dimensions
                    from columns in dimensions
                    let totalSquares = rows * columns
                    select new
                    {
                        Rows = rows,
                        Columns = columns,
                        TotalSquares = totalSquares,
                        CanCover = totalSquares % 2 == 0
                    }
                ).ToList();

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => $"{x.Rows}:{x.Columns}",usedGameCombinations);

                string questionText =
                    $"A board has {selected.Rows} rows and " +
                    $"{selected.Columns} columns of squares. " +
                    "Each domino covers exactly two squares. " +
                    "Can the whole board be covered without gaps or overlaps?";

                string answer = selected.CanCover ? "Yes" : "No";

                var data = new
                {
                    renderKey = "OddEvenParityPuzzleBoard",
                    questionType = code,
                    title = "Domino Board Coverability",
                    questionText,

                    rowCount = selected.Rows,
                    columnCount = selected.Columns,
                    squaresPerDomino = 2,

                    options = new[] { "Yes", "No" },
                    answerMode = "choice",
                    answerType = "boolean"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
            }

            if (code == "ODD_EVEN_HANDSHAKE_COUNT")
            {
                var candidates = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                    .Select(childCount => new
                    {
                        ChildCount = childCount,
                        HandshakeCount =
                            childCount * (childCount - 1) / 2
                    })
                    .ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => x.ChildCount.ToString(),
                    usedGameCombinations);

                string parity =
                    selected.HandshakeCount % 2 == 0
                        ? "Even"
                        : "Odd";

                string questionText =
                    $"{selected.ChildCount} children each shake hands " +
                    "with every other child exactly once. " +
                    "How many handshakes happen altogether, " +
                    "and is the total odd or even?";

                var data = new
                {
                    renderKey = "OddEvenParityPuzzleBoard",
                    questionType = code,
                    title = "Handshake Count Challenge",
                    questionText,

                    childCount = selected.ChildCount,

                    answerMode = "numberAndParity",
                    answerType = "countAndParity"
                };

                string answer = $"{selected.HandshakeCount} ({parity})";

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
            }
            if (code == "ODD_EVEN_PRIME_EXCEPTION")
            {
                var numbers = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1).ToList();
                var candidates = (
                    from first in numbers
                    from second in numbers
                    where first < second
                    from third in numbers
                    where second < third
                    select new
                    {
                        First = first,
                        Second = second,
                        Third = third
                    }
                ).ToList();

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => $"{x.First}:{x.Second}:{x.Third}",usedGameCombinations);

                var options = new List<int>
        {
            2,
            selected.First,
            selected.Second,
            selected.Third
        }
                .OrderBy(_ => _random.Next())
                .ToArray();

                string questionText =
                    "Which number is the only even prime number?";

                var data = new
                {
                    renderKey = "OddEvenParityPuzzleBoard",
                    questionType = code,
                    title = "The Even Prime Mystery",
                    questionText,

                    options,
                    answerMode = "choice",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,"2");
            }

            throw new ArgumentException(
                $"Unsupported Odd/Even question type: {code}",
                nameof(code));
        }

        private GeneratedQuestion GenerateOddEvenContextQuestion(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(
                    nameof(usedGameCombinations));
            }

            code = (code ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            if (levelId != 4)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    "These question types support Level 3 only.");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            Dictionary<int, DifficultyRange[]> ranges = code switch
            {
                "ODD_EVEN_LIGHT_TOGGLE_STATE" =>
                    OddEvenContextDifficultyConfig.LightToggleByLevel,

                "ODD_EVEN_ELEVATOR_FLOOR_PARITY" =>
                    OddEvenContextDifficultyConfig.ElevatorFloorByLevel,

                "ODD_EVEN_TOY_COPY_MACHINE" =>
                    OddEvenContextDifficultyConfig.ToyCopyMachineByLevel,

                _ => throw new ArgumentException(
                    $"Unsupported Odd/Even question type: {code}",
                    nameof(code))
            };

            DifficultyRange range = GetDifficultyRange(
                ranges,
                levelId,
                actualDifficulty);

            string keyPrefix =
                $"{code}:L{levelId}:D{actualDifficulty}";

            // =========================================================
            // 1. LIGHT SWITCH PARITY CHALLENGE
            // =========================================================
            if (code == "ODD_EVEN_LIGHT_TOGGLE_STATE")
            {
                var candidates = (
                    from toggleCount in Enumerable.Range(
                        range.Min,
                        range.Max - range.Min + 1)

                    from initialState in new[] { "ON", "OFF" }

                    select new
                    {
                        ToggleCount = toggleCount,
                        InitialState = initialState
                    }
                ).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.ToggleCount}:{x.InitialState}",
                    usedGameCombinations);

                // An even number of toggles preserves the initial state.
                // An odd number of toggles changes it.
                string finalState = selected.ToggleCount % 2 == 0
                    ? selected.InitialState
                    : selected.InitialState == "ON" ? "OFF" : "ON";

                string questionText =
                    $"A lamp starts {selected.InitialState}. " +
                    $"Its switch is pressed {selected.ToggleCount} times. " +
                    "What will be its final state?";

                var data = new
                {
                    renderKey = "OddEvenLightObjectWithParity",
                    questionType = code,
                    title = "Light Switch Parity Challenge",

                    questionText,

                    objectName = "Light Bulb",
                    objectIcon = "💡",

                    initialState = selected.InitialState,
                    toggleCount = selected.ToggleCount,
                    finalState = finalState,

                    options = new[] { "ON", "OFF" },

                    answerMode = "choice",
                    answerType = "state"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    questionText,
                    data,
                    finalState);
            }

            // =========================================================
            // 2. ELEVATOR FLOOR PARITY
            // =========================================================
            if (code == "ODD_EVEN_ELEVATOR_FLOOR_PARITY")
            {
                var candidates = (
                    from startingFloor in Enumerable.Range(
                        range.Min,
                        range.Max - range.Min + 1)

                    from floorsMoved in Enumerable.Range(1, range.Max)

                    let destinationFloor =
                        startingFloor + floorsMoved

                    select new
                    {
                        StartingFloor = startingFloor,
                        FloorsMoved = floorsMoved,
                        DestinationFloor = destinationFloor,

                        Parity = destinationFloor % 2 == 0
                            ? "Even"
                            : "Odd"
                    }
                ).ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.StartingFloor}:{x.FloorsMoved}",
                    usedGameCombinations);

                string questionText =
                    $"An elevator starts on floor {selected.StartingFloor} " +
                    $"and moves up {selected.FloorsMoved} floors. " +
                    "Is the destination floor odd or even?";

                var data = new
                {
                    renderKey = "OddEvenLightObjectWithParity",
                    questionType = code,
                    title = "Elevator Floor Parity",

                    questionText,

                    objectName = "Elevator",
                    objectIcon = "🛗",

                    startingFloor = selected.StartingFloor,
                    floorsMoved = selected.FloorsMoved,
                    direction = "UP",
                    destinationFloor = selected.DestinationFloor,

                    options = new[] { "Odd", "Even" },

                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    questionText,
                    data,
                    selected.Parity);
            }

            if (code == "ODD_EVEN_TOY_COPY_MACHINE")
            {
                var candidates = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                    .Select(initialToyCount => new
                    {
                        InitialToyCount = initialToyCount,
                        CopiesMade = initialToyCount,
                        TotalToyCount = initialToyCount * 2
                    })
                    .ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => x.InitialToyCount.ToString(),
                    usedGameCombinations);

                string parity =
                    selected.TotalToyCount % 2 == 0
                        ? "Even"
                        : "Odd";

                string correctAnswer =
                    $"{selected.TotalToyCount} ({parity})";

                // Generate distinct number-and-parity options.
                var options = new List<string>
        {
            $"{selected.TotalToyCount - 2} (Even)",
            $"{selected.TotalToyCount - 1} (Odd)",
            $"{selected.TotalToyCount} (Even)",
            $"{selected.TotalToyCount + 1} (Odd)"
        }
                .OrderBy(_ => _random.Next())
                .ToArray();

                string questionText =
                    $"A toy-copying machine makes one extra copy " +
                    "of every original toy. " +
                    $"{selected.InitialToyCount} toy cars enter the machine. " +
                    "How many cars are there altogether, and is the total odd or even?";

                var data = new
                {
                    renderKey = "OddEvenLightObjectWithParity",
                    questionType = code,
                    title = "Toy Copy Machine",

                    questionText,

                    objectName = "Toy Car",
                    objectIcon = "🚗",
                    machineIcon = "🖨️",

                    initialToyCount = selected.InitialToyCount,
                    copiesMade = selected.CopiesMade,
                    totalToyCount = selected.TotalToyCount,

                    options,

                    answerMode = "choice",
                    answerType = "numberAndParity"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    questionText,
                    data,
                    correctAnswer);
            }

            throw new ArgumentException(
                $"Unsupported Odd/Even question type: {code}",
                nameof(code));
        }
    }
}
