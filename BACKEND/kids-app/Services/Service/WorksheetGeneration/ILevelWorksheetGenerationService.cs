using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;

namespace kids_app.Services
{
    public interface ILevelWorksheetGenerationService
    {
        GeneratedQuestion GenerateQuestion(
            int questionNumber,
            QuestionType questionType,
            int levelId,
            int difficultyId,
            string? visualStyleName,
            List<string> visualIcons,
            HashSet<int> usedNumbers,
            HashSet<string>? usedGameCombinations = null);
    }
}
