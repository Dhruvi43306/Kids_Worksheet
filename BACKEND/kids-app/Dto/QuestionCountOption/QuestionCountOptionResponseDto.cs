namespace kids_app.Dto.QuestionCountOption
{
    public class QuestionCountOptionResponseDto
    {
        public int QuestionCountOptionId { get; set; }

        public int TopicLevelConfigurationId { get; set; }

        public int QuestionCount { get; set; }

        public bool IsActive { get; set; }
    }
}
