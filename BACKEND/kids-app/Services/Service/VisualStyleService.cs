using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.IVisuleStyle;
using kids_app.Dto.Subject;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class VisualStyleService : IVisualStyleService
    {

        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public VisualStyleService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        public async Task<ResponceDto<IVisualStyleDto>> AddVisualStyle(IVisualStyleDto visualStyleDto)
        {
            var style = new VisualStyle
            {
                Name = visualStyleDto.Name,
                Description = visualStyleDto.Description,
                Icon = visualStyleDto.Icon,

            };
            await _context.VisualStyles.AddAsync(style);
            await _context.SaveChangesAsync();

            return new ResponceDto<IVisualStyleDto>
            {
                Success = true,
                Message = "VisualStyle Added SucceFully",
                Data = new IVisualStyleDto
                {
                    Name = visualStyleDto.Name,
                    Description = visualStyleDto.Description,
                    Icon = visualStyleDto.Icon,
                },
                Errors = new List<string>()
            };
        }

        public async Task<ResponceDto<List<IVisualStyleDto>>> GetVisualStyle()
        {
            var styles = await _context.VisualStyles
                           .Select(x => new IVisualStyleDto
                           {
                               VisualStyleId = x.VisualStyleId,
                               Name = x.Name,
                               Description = x.Description,
                               Icon = x.Icon,
                           })
                           .ToListAsync();
            return new ResponceDto<List<IVisualStyleDto>>
            {
                Success = true,
                Message = "VisulaStyle Get all SucceFully",
                Data = styles,
                Errors = new List<string>()
            };

        }
    }
}
