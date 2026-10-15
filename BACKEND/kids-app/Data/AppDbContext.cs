using kids_app.Models;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Data
{
    public class AppDbContext:DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options):base(options) { }

        public DbSet<Subject> Subjects { get; set; }
        public DbSet<WorksheetTopics> WorksheetTopics { get; set; }
        public DbSet<LearningLevel> LearningLevels { get; set; }
        public DbSet<TopicLevelConfiguration> TopicLevelConfigurations { get; set; }
        public DbSet<Difficulty> Difficulties { get; set; }
        public DbSet<TopicLevelDifficulty> TopicLevelDifficulties { get; set; }
        public DbSet<VisualStyle> VisualStyles { get; set; }
        public DbSet<TopicLevelVisualStyle> TopicLevelVisualStyles { get; set; }
        public DbSet<QuestionType> QuestionTypes { get; set; }
        public DbSet<TopicLevelQuestionType> TopicLevelQuestionTypes { get; set; }
        public DbSet<QuestionCountOption> QuestionCountOptions { get; set; }
        public DbSet<QuestionTemplate> QuestionTemplates { get; set; }
        public DbSet<GeneratedWorksheet> GeneratedWorksheets { get; set; }
        public DbSet<GeneratedQuestion> GeneratedQuestions { get; set; }

        public DbSet<WorksheetCategory> worksheetCategories { get; set; }

        public DbSet<VisualStyleItem> VisualStyleItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<Subject>(entity =>
            {
                entity.HasKey(x => x.SubjectId);
          
                entity.HasIndex(x => x.slug).IsUnique();

                

            });

            modelBuilder.Entity<WorksheetTopics>(entity =>
            {
                entity.HasKey(x => x.TopicId);
                entity.HasOne(s => s.Subject)
                
               .WithMany(x => x.Topics)
               .HasForeignKey(s => s.SubjectId)
               .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new
                {
                    x.SubjectId,
                    x.Slug
                })
                .IsUnique();
            });


            modelBuilder.Entity<LearningLevel>(entity =>
            {
                entity.HasKey(x => x.LevelId);

                entity.HasIndex(x => x.LevelName).IsUnique();

            });

            modelBuilder.Entity<TopicLevelConfiguration>(entity =>
            {
                entity.HasKey(x => x.TopicLevelConfigurationId);

                entity.HasOne(x => x.Level)
                       .WithMany(x => x.LevelConfigurations)
                       .HasForeignKey(x => x.LevelId)
                       .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Topic)
                        .WithMany(x => x.LevelConfigurations)
                        .HasForeignKey(x => x.TopicId)
                        .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new
                {
                    x.TopicId,
                    x.LevelId
                }).IsUnique();


            });

            modelBuilder.Entity<Difficulty>(entity =>
            {
                entity.HasKey(x => x.DifficultyId);

                entity.HasIndex(x => x.Name)
                    .IsUnique();
            });

            modelBuilder.Entity<TopicLevelDifficulty>(entity =>
            {
                entity.HasKey(x => new
                {
                    x.TopicLevelConfigurationId,
                    x.DifficultyId
                });

                entity.HasOne(x => x.Difficulty)
                      .WithMany(x => x.TopicLevelDifficulties)
                      .HasForeignKey(x => x.DifficultyId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Configuration)
                      .WithMany(x => x.Difficulties)
                      .HasForeignKey(x => x.TopicLevelConfigurationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<VisualStyle>(entity =>
            {
                entity.HasKey(x => x.VisualStyleId);

                entity.HasIndex(x => x.Name)
                    .IsUnique();
            });

            modelBuilder.Entity<TopicLevelVisualStyle>(entity =>
            {
                entity.HasKey(x => new
                {
                    x.TopicLevelConfigurationId,
                    x.VisualStyleId
                });

                entity.HasOne(x => x.Configuration)
                    .WithMany(x => x.VisualStyles)
                    .HasForeignKey(x => x.TopicLevelConfigurationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.VisualStyle)
                    .WithMany(x => x.TopicLevelVisualStyles)
                    .HasForeignKey(x => x.VisualStyleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<QuestionType>(entity =>
            {
                entity.HasKey(x => x.QuestionTypeId);

                entity.HasIndex(x => x.Code)
                    .IsUnique();

                entity.HasOne(x => x.WorksheetCategory)
                      .WithMany()
                      .HasForeignKey(x => x.WorksheetCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<TopicLevelQuestionType>(entity =>
            {
                entity.HasKey(x => new
                {
                    x.TopicLevelConfigurationId,
                    x.QuestionTypeId
                });

                entity.HasOne(x => x.Configuration)
                    .WithMany(x => x.QuestionTypes)
                    .HasForeignKey(x => x.TopicLevelConfigurationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.QuestionType)
                    .WithMany(x => x.TopicLevelQuestionTypes)
                    .HasForeignKey(x => x.QuestionTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<QuestionCountOption>(entity =>
            {
                entity.HasKey(x => x.QuestionCountOptionId);

                entity.HasOne(x => x.Configuration)
                    .WithMany(x => x.QuestionCounts)
                    .HasForeignKey(x => x.TopicLevelConfigurationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new
                {
                    x.TopicLevelConfigurationId,
                    x.QuestionCount
                })
                .IsUnique();
            });

            modelBuilder.Entity<WorksheetCategory>(entity =>
            {
                entity.HasKey(x => x.WorksheetCategoryId);

                entity.HasOne(x => x.WorksheetTopics)
                    .WithMany()
                    .HasForeignKey(x => x.TopicId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new
                {
                    x.TopicId,
                    x.code
                })
                .IsUnique();
            });


            modelBuilder.Entity<VisualStyleItem>(entity =>
            {
                entity.HasKey(x => x.VisualStyleItemId);

                entity.HasOne(x => x.visualStyle)
                    .WithMany()
                    .HasForeignKey(x => x.VisualStyleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(x => x.ItemName)
                    .HasMaxLength(100);

                entity.Property(x => x.Icon)
                    .HasMaxLength(20);

                entity.HasIndex(x => new
                {
                    x.VisualStyleId,
                    x.ItemName
                })
                .IsUnique();
            });
        }

       
        

    }
}
