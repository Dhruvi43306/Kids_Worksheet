
using kids_app.Dto.PrintableWorksheet;

namespace kids_app.Services.PrintableWorksheet
{
    public interface IPrintableWorksheetService
    {
        Task<List<PrintableSubjectDto>> GetSubjectsAsync();

        Task<PrintableWorksheetFiltersDto?> GetFiltersAsync(
            string subjectSlug);

        Task<List<PrintableWorksheetDto>?> GetWorksheetsAsync(
            string subjectSlug,
            int? categoryId,
            int? levelId,
            int? difficultyId);
    }
}
