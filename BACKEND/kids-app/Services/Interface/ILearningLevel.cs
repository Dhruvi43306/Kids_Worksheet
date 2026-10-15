using kids_app.Dto.CommonApiDto;
using kids_app.Dto.LearningLevel;

namespace kids_app.Services.Interface
{
    public interface ILearningLevel
    {
        public Task<ResponceDto<LearningLevelDto>> AddLearningLevel(LearningLevelDto learningLevelDto);

        public Task<ResponceDto<List<LearningLevelDto>>> GetLearningLevel();
    }
}
