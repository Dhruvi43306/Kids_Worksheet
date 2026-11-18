using FluentValidation;
using kids_app.Data;
using kids_app.Interfaces;
using kids_app.Services;
using kids_app.Services.Interface;
using kids_app.Services.PrintableWorksheet;
using kids_app.Services.Service;
using kids_app.Validators;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

namespace kids_app
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var connectionString = builder.Configuration
                .GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseMySQL(connectionString));

            builder.Services.AddValidatorsFromAssemblyContaining<SubjectValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<WorksheetTopicValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<DifficultyValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<LearningLevelValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<QuestionTypeValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<VisualStyleValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<TopicLevelConfigValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<TopicDifficultyValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<TopicLevelVisualStyleValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<QuestionTypeValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<QuestionCountOptionValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<GeneratedWorksheetValidator>();
            builder.Services.AddScoped<IWorksheetGeneratorOptionsService,WorksheetGeneratorOptionsService>();

            builder.Services.AddScoped<ISubjectService, SubjectService>();
            builder.Services.AddScoped<IWorkSheetService, WorkSheetTopic>();
            builder.Services.AddScoped<IDifficultyService, DifficultyService>();
            builder.Services.AddScoped<ILearningLevel, LearningLevelService>();
            builder.Services.AddScoped<IQuestionTypeService, QuestionTypeService>();
            builder.Services.AddScoped<ITopicLevelConfiguration, TopicLevelConfigService>();
            builder.Services.AddScoped<ITopicLevelDifficultyService,TopicLevelDifficultyService>();
            builder.Services.AddScoped<ITopicLevelVisualStyleService,TopicLevelVisualStyleService>();
            builder.Services.AddScoped<ITopicLevelQuestionTypeService, TopicLevelQuestionTypeService>();
            builder.Services.AddScoped<IQuestionCountOptionService, QuestionCountOptionService>();
            builder.Services.AddScoped<IGeneratedWorksheetService,GeneratedWorksheetService>();
            builder.Services.AddScoped<IWorksheetCategory, WorksheetCategoryService>();
            builder.Services.AddScoped<IPreGeneratedWorksheetService,PreGeneratedWorksheetService>();            
            builder.Services.AddScoped<WorksheetQuestionGenerator>();


            builder.Services.AddScoped<EarlyLevelWorksheetGenerationService>();
            builder.Services.AddScoped<Grade1WorksheetGenerationService>();
            builder.Services.AddScoped<Grade2WorksheetGenerationService>();
            builder.Services.AddScoped<Grade3WorksheetGenerationService>();


            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowNextJs", policy =>
                {
                    policy
                        .WithOrigins(
                            "http://localhost:3000",
                            "https://kids-worksheet-ten.vercel.app"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference("/");
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowNextJs");

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
