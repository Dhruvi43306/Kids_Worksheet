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
    public partial class Grade3WorksheetGenerationService : WorksheetGenerationBaseService
    {
        public override GeneratedQuestion GenerateQuestion(int questionNumber, QuestionType questionType, int levelId, int difficultyId,
            string? visualStyleName, List<string> visualIcons, HashSet<int> usedNumbers, HashSet<string>? usedGameCombinations = null)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedNumbers == null)
            {
                throw new ArgumentNullException(nameof(usedNumbers));
            }
            //?? -> null-coalescing operator.
            //"If usedGameCombinations or visualicons doesn't exist yet, create a new HashSet. Otherwise, keep the existing one.
            usedGameCombinations ??= new HashSet<string>();
            visualIcons ??= new List<string>();

            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(code))
            {
                return code switch
                {
                    "IDENTIFY" =>
                        GenerateIdentifyOddEven(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualStyleName, usedGameCombinations),

                    "CIRCLE_ODD" =>
                        GenerateCircleOdd(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "CIRCLE_EVEN" =>
                        GenerateCircleEven(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "TRUE_FALSE" =>
                        GenerateTrueFalse(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "OBJECT_COUNT" =>
                        GenerateCountObjects(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualIcons),

                    "MATCH_ODD_EVEN" =>
                        GenerateMatchOddEven(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "SORTING" =>
                        GenerateSorting(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "SORT_ODD_EVEN" =>
                        GenerateSorting(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "PATTERN" =>
                        GeneratePattern(questionNumber, questionType.QuestionTypeId, difficultyId, visualStyleName, visualIcons),

                    "ODD_EVEN_PATTERNS" =>
                        GeneratePattern(questionNumber, questionType.QuestionTypeId, difficultyId, visualStyleName, visualIcons),

                    "MISSING_NUMBER" =>
                        GenerateMissingNumber(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "REASONING" =>
                        GenerateReasoning(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedNumbers),

                    "HOW_MANY_ALTOGETHER" =>
                        GenerateHowManyAltogether(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualIcons),

                    "COUNT_ADD_CHOOSE" =>
                        GenerateAdditionOptions(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualIcons),

                    "MATCH_OBJECTS_NUMBER" =>
                        GenerateMatchObjectsNumber(questionNumber, questionType.QuestionTypeId, difficultyId, visualIcons),

                    "COMPLETE_ADDITION_SENTENCE" =>
                        GenerateCompleteAdditionSentence(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualIcons),

                    "NUMBER_LINE_ADDITION" =>
                        GenratedNumberLineAddition(questionNumber, questionType.QuestionTypeId, difficultyId),

                    "TWO_JUMP_ADDITION" =>
                        GenrateTwoJumpAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId),

                    "CHOOSE_CORRECT_NUMBER_LINE" =>
                        GenerateChooseCorrectNumberLine(questionNumber, questionType.QuestionTypeId, levelId, difficultyId),

                    "BRIDGE_TEN" =>
                        GenerateBridgeTen(questionNumber, questionType.QuestionTypeId, difficultyId, visualStyleName, visualIcons),

                    "NUMBER_BOND_MISSING" =>
                        GenerateMissingNumberBond(questionNumber, questionType.QuestionTypeId, levelId, difficultyId),

                    "TRUE_OR_FALSE" =>
                        GenrateTrueOrFalseAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId),

                    "MAKE_FIVE_TO_FIFTEEN" =>
                        GenerateMakeFiveToFifteen(questionNumber, questionType.QuestionTypeId, difficultyId),

                    "SOLVE_THE_DOUBLE" =>
                        GenerateSolveDouble(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, null, visualIcons),
                    "DOUBLE_PLUS_ONE" =>
                       GenerateSolveDouble(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, 1, visualIcons),

                    "DOUBLE_PLUS_TWO" =>
                        GenerateSolveDouble(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, 2, visualIcons),

                    "DOUBLE_PLUS_THREE" =>
                      GenerateSolveDouble(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, 3, visualIcons),

                    "DICE_GAME_ADDITION" =>
                         GenerateDiceGameAdditionQuestions(questionNumber, questionType.QuestionTypeId, difficultyId, usedGameCombinations),

                    "FINGER_GAME_ADDITION" =>
                        GenerateFingerGameAdditionQuestions(questionNumber, questionType.QuestionTypeId, difficultyId, usedGameCombinations),
                    "NUMBER_GRID_MAZE" =>
                        GenerateNumberGridMaze(questionNumber, questionType.QuestionTypeId, levelId, difficultyId),

                    "ON_PATH_AND_OFF_PATH_ADDITION" =>
                        GeneratePathAndOffPathAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualIcons),

                    "FIXED_RULE_CARD_ADDITION" =>
                        GenerateFixedRuleCardAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId),

                    "DOMINO_CHAIN_ADDITION" =>
                        GenerateDominoChainAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "MOVING_STILL_OBJECTS_ADDITION" =>
                        GenerateMovingStillObjectsAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualIcons),

                    "ADDITION_PYRAMID" =>
                        GenerateAdditionNumberBondTree(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "NUMBER_BOND_SPIDER" =>
                        GenerateNumberBondSpider(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "BALANCING_SEESAW" =>
                        GenerateBalancingSeesaw(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "ADD_TENS_ONES" =>
                        GenerateAddTensAndOnes(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, visualStyleName, visualIcons, usedGameCombinations),

                    "CROSS_GRID_ADDITION" =>
                        GenerateCrossGridAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "MISSING_OPERATION_SWITCH" =>
                         GenerateMissingOperationSwitch(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "ADD_TWO_SINGLE_DIGIT" =>
                        GenerateMentalAdditionTwo(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, missingAddend: false, usedGameCombinations),

                    "ADD_TWO_SINGLE_DIGIT_MISSING" =>
                        GenerateMentalAdditionTwo(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, missingAddend: true, usedGameCombinations),

                    "ADD_THREE_SINGLE_DIGIT" =>
                        GenerateMentalAdditionMultiple(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, numberCount: 3, missingAddend: false, usedGameCombinations),

                    "ADD_THREE_SINGLE_DIGIT_MISSING" =>
                        GenerateMentalAdditionMultiple(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, numberCount: 3, missingAddend: true, usedGameCombinations),

                    "ADD_FOUR_SINGLE_DIGIT" =>
                        GenerateMentalAdditionMultiple(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, numberCount: 4, missingAddend: false, usedGameCombinations),

                    "ADD_FOUR_SINGLE_DIGIT_MISSING" =>
                        GenerateMentalAdditionMultiple(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, numberCount: 4, missingAddend: true, usedGameCombinations),

                    "ADD_WHOLE_TENS" or "ADD_WHOLE_TENS_MISSING" or "ADD_WHOLE_TENS_THREE" or "ADD_WHOLE_TENS_THREE_MISSING" or
                    "ADD_WHOLE_TENS_FOUR" or "ADD_WHOLE_TENS_FOUR_MISSING" or "COMPLETE_NEXT_TEN" or "ADD_BY_COMPLETING_WHOLE_TENS" =>
                        GenerateWholeTensAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "ADD_WHOLE_HUNDREDS" or "ADD_WHOLE_HUNDREDS_THREE" or "ADD_WHOLE_HUNDREDS_MISSING" or "ADD_WHOLE_HUNDREDS_TO_THOUSAND" =>
                        GenerateWholeHundredsAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "VERTICAL_ADD_TWO_CARRY" or "VERTICAL_ADD_TWO_NO_CARRY" or "VERTICAL_ADD_THREE_NO_CARRY" or
                    "VERTICAL_ADD_THREE_CARRY" or "VERTICAL_ADD_FOURE_NO_CARRY" or "VERTICAL_ADD_FOURE_CARRY" =>
                       GenerateVerticalAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "TWIN_CHANNEL_MISSING" or "TWIN_CHANNEL_BALANCE" =>
                      GenerateTwinChannelDataSieve(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "GRID_MYSTERY_COORDINATE_ADDITION" =>
                        GenerateGridMysteryCoordinateAddition(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "THRESHOLD_WALL_SPILLOVER" =>
                       GenerateThresholdWallSpillover(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, usedGameCombinations),

                    "FOLLOW_ADDITION_PATH" =>
                       GenerateAdditionPath(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "OBJECT_SUBTRACTION_RESULT" or "OBJECT_SUBTRACTION_MISSING_TAKEAWAY" or "OBJECT_SUBTRACTION_MISSING_START" or "OBJECT_GROUP_DIFFERENCE" or
                    "OBJECT_SUBTRACTION_EQUALIZE" or "OBJECT_SUBTRACTION_CHOOSE_RESULT" =>
                        GenerateSubtractionWithObjects(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, visualIcons, usedGameCombinations),

                    "NUMBER_LINE_WRONG_LANDING" or "NUMBER_LINE_MISSING_START" or "NUMBER_LINE_MISSING_JUMPS" or
                     "NUMBER_LINE_FIND_DISTANCE" or "NUMBER_LINE_SUBTRACTION_SEQUENCE" =>
                        GenerateSubtractionNumberLine(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "FACT_FAMILY_CHOOSE_CORRECT" or "FACT_FAMILY_ODD_ONE_OUT" or
                    "FACT_FAMILY_TRUE_FALSE" or "FACT_FAMILY_MISSING_EQUATION" =>
                        GenerateSubtractionFactFamily(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "CROSS_OUT_OBJECTS" or "DRAW_AND_CROSS_OUT" or "CHOOSE_TAKE_AWAY" or "MISSING_NUMBER_SUBTRACTION" =>
                        GenerateSubtractionActionQuestion(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, visualIcons, usedGameCombinations),

                    "NUMBER_SUBTRACTION_RESULT" or "NUMBER_SUBTRACTION_MISSING_START" or
                    "NUMBER_SUBTRACTION_CHOOSE_RESULT" or "NUMBER_SUBTRACTION_MISSING_TAKEAWAY" =>
                         GenerateSubtractionWithNumbers(questionNumber, questionType.QuestionTypeId, levelId, difficultyId, questionType, usedGameCombinations),

                    "UNFILLED_LEVEL_SHIFT" or "MYSTERY_STORAGE_CHEST" or "CALENDAR_SUBTRACTION_MISSING_DAYS" =>
                          GenerateVisualSubtractionQuestion(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,visualIcons,usedGameCombinations),

                    "BROKEN_FUSE_COUNTDOWN_TRACK" or "DUAL_EXIT_COUNTDOWN_SPLIT" or "TARGET_LANDMARK_BRAKING_TRACK" or "LOOP_DE_LOOP_PORTAL_WARP" =>
                        GenerateCountdownLoopTrack(questionNumber,questionType.QuestionTypeId,code,levelId,difficultyId,usedGameCombinations),

                     "STORY_GIVE_AWAY_TWICE" or
                        "STORY_BUS_PASSENGERS" or "STORY_SPEND_TWICE" or "STORY_USE_SUPPLIES" =>
                            GenerateTwoStepSubtractionStory(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),

                     "DETECTIVE_MISSING_NUMBER" or "DETECTIVE_FIND_ERROR" or "DETECTIVE_MATCH_EQUATION" or "DETECTIVE_NUMBER_CHAIN" =>
                            GenerateSubtractionDetective(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),
                    "SUBTRACT_WITHIN_ZERO_TEN" or"SUBTRACT_BY_COUNTING_BACK" or"SUBTRACT_BY_COUNTING_UP" or"MISSING_MINUEND_OR_SUBTRAHEND_WITHIN_TEN" or"SUBTRACT_WITHIN_ONE_TWENTY" or
                    "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREDD_NO_REGROUPING" or
                    "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREED_MISSING_NUMBERS" or"SUBTRACT_WHOLE_TENS" or"SUBTRACT_WHOLE_TENS_MISSING_NUMBERS" or"SUBTRACT_FROM_WHOLE_TENS"
                        => GenerateMentalSubtraction(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),
                    "PIXEL_COLOR_BY_DIFFERENCE" or "PIXEL_FIX_BROKEN_SQUARES" or "PIXEL_MATCH_DIFFERENCE" or "PIXEL_MISSING_EQUATION" =>
                            GenerateSubtractionPixelMystery(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),
                    "VAULT_CIPHER_CODE" or "VAULT_SECURITY_FILTER" or "VAULT_LOCK_RANKING" or "VAULT_NUMBER_TILE_KEY" =>
                            GenerateSubtractionEscapeVault(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),
                    "NUMERIC_COMPENSATION_BRIDGE" or "NUMERIC_EQUATION_BALANCER" or "NUMERIC_TARGET_DIFFERENCE_BUILDER" or "NUMERIC_DIFFERENCE_PATTERN_CHECK" =>
                            GenerateSubtractionNumberStrategyLab(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),

                    "NUMERIC_REVERSE_DIGIT_DIFFERENCE" or "NUMERIC_BORROWING_PREDICTOR" or "NUMERIC_DIGIT_CLUE_RECONSTRUCTION" or "NUMERIC_MAXIMUM_DIFFERENCE" =>
                            GenerateSubtractionNumberPropertiesLab(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),

                    "CONSTRAINT_DIFFERENCE_WINDOW" or "CONSTRAINT_OPERAND_CHANGE_IMPACT" or "CONSTRAINT_MINIMUM_ADJUSTMENT" or "CONSTRAINT_COUNT_VALID_PAIRS" =>
                        GenerateSubtractionConstraintEngineering(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),


                    "ALGORITHM_COLUMN_ALIGNMENT" or "ALGORITHM_REGROUP_TRACE" or "ALGORITHM_PARTIAL_DIFFERENCE_ASSEMBLY" or "ALGORITHM_INVERSE_VERIFICATION" =>
                        GenerateSubtractionAlgorithmStudio(questionNumber,questionType.QuestionTypeId,levelId,difficultyId,questionType,usedGameCombinations),

                         "MULTIPLICATION_THREE_DIGIT_BY_ONE_DIGIT" or "MULTIPLICATION_TWO_DIGIT_BY_TWO_DIGIT_PARTIAL_PRODUCTS" or "MULTIPLICATION_THREE_DIGIT_REGROUPING_COLUMNS"
                        or "MULTIPLICATION_MULTI_STEP_NUMBER_EXPRESSION" =>
                          GenerateMultiplicationNumericalByThreeDigit(questionNumber,questionType.QuestionTypeId,code,levelId,difficultyId,usedGameCombinations),

                    "DIVISION_THREE_DIGIT_BY_ONE_DIGIT" or "DIVISION_TWO_DIGIT_DIVISOR_LONG_METHOD" or "DIVISION_ZERO_IN_QUOTIENT" or "DIVISION_MULTIPLICATION_VERIFICATION" =>
                     GenerateDivisionNumericalByThreeDigit(questionNumber,questionType.QuestionTypeId,code,levelId,difficultyId,usedGameCombinations),

                    _ => throw new ArgumentException(
                   $"Question type '{questionType.TypeName}' " +
                   $"with code '{questionType.Code}' " +
                   "is not supported by WorksheetQuestionGenerator.")
                };
            }
            throw new ArgumentException($"Question type '{questionType.TypeName}' has an empty or null code.");

        }
    }
}
