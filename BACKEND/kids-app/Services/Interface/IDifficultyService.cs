using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;

namespace kids_app.Services.Interface
{
    public interface IDifficultyService
    {
        public Task<ResponceDto<List<DifficultyDto>>> GetDifficulty();

        public Task<ResponceDto<DifficultyDto>> AddDifficulty(DifficultyDto difficultyDto);
    }
}
