using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class DifficultyService : IDifficultyService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public DifficultyService(
            AppDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<ResponceDto<DifficultyDto>> AddDifficulty(
            DifficultyDto difficultyDto)
        {
            var difficulty = new Difficulty
            {
                DisplayOrder = difficultyDto.DisplayOrder,
                Name = difficultyDto.Name
            };

            await _context.Difficulties.AddAsync(difficulty);
            await _context.SaveChangesAsync();

            return new ResponceDto<DifficultyDto>
            {
                Success = true,
                Message = "Difficulty added successfully",
                Data = new DifficultyDto
                {
                    DisplayOrder = difficulty.DisplayOrder,
                    Name = difficulty.Name
                },
                Errors = new List<string>()
            };
        }

        public async Task<ResponceDto<List<DifficultyDto>>> GetDifficulty()
        {
            var difficulty = await _context.Difficulties
                .Select(x => new DifficultyDto
                {
                    DifficultyId = x.DifficultyId,
                    DisplayOrder = x.DisplayOrder,
                    Name = x.Name
                })
                .ToListAsync();

            return new ResponceDto<List<DifficultyDto>>
            {
                Success = true,
                Message = "Difficulty fetched successfully",
                Data = difficulty,
                Errors = new List<string>()
            };
        }
    }
}