using kids_app.Dto.CommonApiDto;
using kids_app.Dto.IVisuleStyle;
using kids_app.Dto.Subject;

namespace kids_app.Services.Interface
{
    public interface IVisualStyleService
    {
        public Task<ResponceDto<List<IVisualStyleDto>>> GetVisualStyle();

        public Task<ResponceDto<IVisualStyleDto>> AddVisualStyle(IVisualStyleDto visualStyleDto);
    }
}
