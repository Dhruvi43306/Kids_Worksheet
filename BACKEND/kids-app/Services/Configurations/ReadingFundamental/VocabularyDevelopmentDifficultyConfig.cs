
namespace kids_app.Services.Configurations.Reading
{
    public sealed record VocabularyWordItem(
        string Word,
        string Picture,
        string Description
    );

    public sealed record VocabularyDifficultySettings(
        int OptionCount,
        int MissingLetterCount,
        int MinimumWordLength,
        int MaximumWordLength
    );

    public static class VocabularyDevelopmentDifficultyConfig
    {
        public static readonly Dictionary<int, VocabularyWordItem[]> WordsByLevel = new()
        {
            {
                1, new[]
                {
                    new VocabularyWordItem("am", "😊", "Happy expression"),
                    new VocabularyWordItem("an", "🍎", "An apple"),
                    new VocabularyWordItem("at", "📍", "At a place"),
                    new VocabularyWordItem("in", "📦", "Inside"),
                    new VocabularyWordItem("on", "⬆️", "On top"),
                    new VocabularyWordItem("up", "⬆️", "Up"),
                    new VocabularyWordItem("it", "🧸", "It"),
                    new VocabularyWordItem("is", "✨", "Is"),
                    new VocabularyWordItem("go", "🚶", "Go"),
                    new VocabularyWordItem("no", "🙅", "No"),
                    new VocabularyWordItem("me", "👧", "Me"),
                    new VocabularyWordItem("we", "👫", "We"),
                    new VocabularyWordItem("he", "👦", "He"),
                    new VocabularyWordItem("be", "🐝", "Bee"),
                    new VocabularyWordItem("my", "🎒", "My bag"),
                    new VocabularyWordItem("to", "➡️", "To"),
                    new VocabularyWordItem("do", "🛠️", "Do"),
                    new VocabularyWordItem("so", "🌟", "So"),
                    new VocabularyWordItem("if", "🤔", "If"),
                    new VocabularyWordItem("ox", "🐂", "Ox")
                }
            },
            {
                2, new[]
                {
                    new VocabularyWordItem("apple", "🍎", "Apple"),
                    new VocabularyWordItem("tiger", "🐯", "Tiger"),
                    new VocabularyWordItem("house", "🏠", "House"),
                    new VocabularyWordItem("plant", "🌱", "Plant"),
                    new VocabularyWordItem("bread", "🍞", "Bread"),
                    new VocabularyWordItem("chair", "🪑", "Chair"),
                    new VocabularyWordItem("smile", "😊", "Smile"),
                    new VocabularyWordItem("clock", "⏰", "Clock"),
                    new VocabularyWordItem("train", "🚆", "Train"),
                    new VocabularyWordItem("green", "💚", "Green"),
                    new VocabularyWordItem("water", "💧", "Water"),
                    new VocabularyWordItem("cloud", "☁️", "Cloud"),
                    new VocabularyWordItem("grape", "🍇", "Grape"),
                    new VocabularyWordItem("flame", "🔥", "Flame"),
                    new VocabularyWordItem("brush", "🪥", "Brush"),
                    new VocabularyWordItem("spoon", "🥄", "Spoon"),
                    new VocabularyWordItem("crown", "👑", "Crown"),
                    new VocabularyWordItem("sheep", "🐑", "Sheep"),
                    new VocabularyWordItem("beach", "🏖️", "Beach"),
                    new VocabularyWordItem("fruit", "🍉", "Fruit")
                }
            },
            {
                3, new[]
                {
                    new VocabularyWordItem("butter", "🧈", "Butter"),
                    new VocabularyWordItem("rabbit", "🐰", "Rabbit"),
                    new VocabularyWordItem("planet", "🪐", "Planet"),
                    new VocabularyWordItem("garden", "🌷", "Garden"),
                    new VocabularyWordItem("monkey", "🐒", "Monkey"),
                    new VocabularyWordItem("rocket", "🚀", "Rocket"),
                    new VocabularyWordItem("pencil", "✏️", "Pencil"),
                    new VocabularyWordItem("bridge", "🌉", "Bridge"),
                    new VocabularyWordItem("castle", "🏰", "Castle"),
                    new VocabularyWordItem("puzzle", "🧩", "Puzzle"),
                    new VocabularyWordItem("forest", "🌳", "Forest"),
                    new VocabularyWordItem("winter", "❄️", "Winter"),
                    new VocabularyWordItem("market", "🛒", "Market"),
                    new VocabularyWordItem("circle", "⭕", "Circle"),
                    new VocabularyWordItem("school", "🏫", "School"),
                    new VocabularyWordItem("silver", "🥈", "Silver"),
                    new VocabularyWordItem("pillow", "🛏️", "Pillow"),
                    new VocabularyWordItem("orange", "🍊", "Orange"),
                    new VocabularyWordItem("camera", "📷", "Camera"),
                    new VocabularyWordItem("family", "👨‍👩‍👧", "Family")
                }
            },
            {
                4, new[]
                {
                    new VocabularyWordItem("beautiful", "🌸", "Beautiful"),
                    new VocabularyWordItem("adventure", "🗺️", "Adventure"),
                    new VocabularyWordItem("important", "⭐", "Important"),
                    new VocabularyWordItem("wonderful", "🌈", "Wonderful"),
                    new VocabularyWordItem("knowledge", "📚", "Knowledge"),
                    new VocabularyWordItem("creative", "🎨", "Creative"),
                    new VocabularyWordItem("discover", "🔍", "Discover"),
                    new VocabularyWordItem("excellent", "🏆", "Excellent"),
                    new VocabularyWordItem("remember", "🧠", "Remember"),
                    new VocabularyWordItem("celebrate", "🎉", "Celebrate"),
                    new VocabularyWordItem("education", "🎓", "Education"),
                    new VocabularyWordItem("different", "🌟", "Different"),
                    new VocabularyWordItem("community", "🏘️", "Community"),
                    new VocabularyWordItem("imagine", "💭", "Imagine"),
                    new VocabularyWordItem("curiosity", "🔎", "Curiosity"),
                    new VocabularyWordItem("friendship", "🤝", "Friendship"),
                    new VocabularyWordItem("invention", "💡", "Invention"),
                    new VocabularyWordItem("confident", "💪", "Confident"),
                    new VocabularyWordItem("exploring", "🧭", "Exploring"),
                    new VocabularyWordItem("language", "🗣️", "Language")
                }
            }
        };

        public static readonly Dictionary<int, Dictionary<int, VocabularyDifficultySettings>>
            DifficultyByLevel = new()
        {
            {
                1, new Dictionary<int, VocabularyDifficultySettings>
                {
                    { 1, new(2, 1, 2, 2) },
                    { 2, new(3, 1, 2, 3) },
                    { 3, new(4, 1, 2, 4) },
                    { 4, new(5, 2, 2, 4) }
                }
            },
            {
                2, new Dictionary<int, VocabularyDifficultySettings>
                {
                    { 1, new(2, 1, 4, 4) },
                    { 2, new(3, 1, 4, 5) },
                    { 3, new(4, 2, 4, 5) },
                    { 4, new(5, 2, 4, 6) }
                }
            },
            {
                3, new Dictionary<int, VocabularyDifficultySettings>
                {
                    { 1, new(2, 1, 5, 6) },
                    { 2, new(3, 2, 5, 6) },
                    { 3, new(4, 2, 5, 7) },
                    { 4, new(5, 3, 5, 7) }
                }
            },
            {
                4, new Dictionary<int, VocabularyDifficultySettings>
                {
                    { 1, new(2, 2, 6, 9) },
                    { 2, new(3, 2, 6, 9) },
                    { 3, new(4, 3, 6, 9) },
                    { 4, new(5, 4, 6, 9) }
                }
            }
        };
    }
}
