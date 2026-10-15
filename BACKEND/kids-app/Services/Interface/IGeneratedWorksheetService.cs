using kids_app.Dto.CommonApiDto;
using kids_app.Dto.GenratedWorkSheet;

namespace kids_app.Services.Interface
{
    public interface IGeneratedWorksheetService
    {
        Task<ResponceDto<List<GeneratedWorksheetResponseDto>>>GetAllAsync();

        Task<ResponceDto<GeneratedWorksheetResponseDto?>>GetByIdAsync(long id);

        Task<ResponceDto<GeneratedWorksheetResponseDto>>AddAsync(GeneratedWorksheetDto dto);

        Task<ResponceDto<GeneratedWorksheetResponseDto?>>UpdateAsync(long id,GeneratedWorksheetDto dto);

        Task<ResponceDto<bool>>DeleteAsync(long id);
    }
}
