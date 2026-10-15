namespace kids_app.Services.Configurations;

public readonly record struct CalendarSubtractionRange(
    int MinStartDay,
    int MaxStartDay,
    int MinDaysBack,
    int MaxDaysBack);

public static class CalendarSubtractionDifficultyConfig
{
    public static readonly Dictionary<int, CalendarSubtractionRange[]> ByGrade = new()
    {
        [1] = new[]
        {
            new CalendarSubtractionRange(4, 10, 1, 3),
            new CalendarSubtractionRange(6, 20, 2, 5),
            new CalendarSubtractionRange(10, 28, 3, 8)
        },

        [2] = new[]
        {
            new CalendarSubtractionRange(5, 15, 1, 5),
            new CalendarSubtractionRange(10, 25, 2, 10),
            new CalendarSubtractionRange(16, 31, 3, 15)
        },

        [3] = new[]
        {
            new CalendarSubtractionRange(10, 20, 2, 8),
            new CalendarSubtractionRange(15, 28, 3, 12),
            new CalendarSubtractionRange(20, 31, 5, 18)
        },

        [4] = new[]
        {
            new CalendarSubtractionRange(15, 25, 3, 10),
            new CalendarSubtractionRange(20, 31, 5, 15),
            new CalendarSubtractionRange(25, 31, 8, 20)
        }
    };
}