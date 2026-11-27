namespace kids_app.Services.Configurations.Reading
{
    public sealed record PhonicsWord(
        string Word,
        string BeginningGrapheme,
        string BeginningSound,
        string EndingGrapheme,
        string EndingSound
    );

    public sealed record PhonicsSoundPair(
        string Grapheme,
        string Sound
    );
    public sealed record PhonicsDifficultySettings(
    int OptionCount,
    int PairCount
);
    public static class PhonicsDifficultyConfig
    {
        public static readonly Dictionary<int, PhonicsWord[]>
            PhonicsWordsByLevel = new()
        {
            // =========================================
            // LEVEL 1 - BEGINNER / SIMPLE WORDS
            // =========================================
            {
                1,
                new[]
                {
                    new PhonicsWord("cat", "C", "/k/", "T", "/t/"),
                    new PhonicsWord("dog", "D", "/d/", "G", "/g/"),
                    new PhonicsWord("sun", "S", "/s/", "N", "/n/"),
                    new PhonicsWord("pen", "P", "/p/", "N", "/n/"),
                    new PhonicsWord("cup", "C", "/k/", "P", "/p/"),
                    new PhonicsWord("map", "M", "/m/", "P", "/p/"),
                    new PhonicsWord("hat", "H", "/h/", "T", "/t/"),
                    new PhonicsWord("bed", "B", "/b/", "D", "/d/"),
                    new PhonicsWord("pig", "P", "/p/", "G", "/g/"),
                    new PhonicsWord("fan", "F", "/f/", "N", "/n/"),
                    new PhonicsWord("net", "N", "/n/", "T", "/t/"),
                    new PhonicsWord("top", "T", "/t/", "P", "/p/"),
                    new PhonicsWord("rug", "R", "/r/", "G", "/g/"),
                    new PhonicsWord("jam", "J", "/j/", "M", "/m/"),
                    new PhonicsWord("van", "V", "/v/", "N", "/n/"),
                    new PhonicsWord("web", "W", "/w/", "B", "/b/"),
                    new PhonicsWord("kid", "K", "/k/", "D", "/d/"),
                    new PhonicsWord("leg", "L", "/l/", "G", "/g/"),
                    new PhonicsWord("hot", "H", "/h/", "T", "/t/"),
                    new PhonicsWord("mop", "M", "/m/", "P", "/p/"),
                    new PhonicsWord("box", "B", "/b/", "X", "/ks/"),
                    new PhonicsWord("fox", "F", "/f/", "X", "/ks/"),
                    new PhonicsWord("zip", "Z", "/z/", "P", "/p/"),
                    new PhonicsWord("yak", "Y", "/y/", "K", "/k/")
                }
            },

            // =========================================
            // LEVEL 2 - DEVELOPING PHONICS
            // =========================================
            {
                2,
                new[]
                {
                    new PhonicsWord("fish", "F", "/f/", "SH", "/sh/"),
                    new PhonicsWord("ship", "SH", "/sh/", "P", "/p/"),
                    new PhonicsWord("chat", "CH", "/ch/", "T", "/t/"),
                    new PhonicsWord("chin", "CH", "/ch/", "N", "/n/"),
                    new PhonicsWord("thin", "TH", "/th/", "N", "/n/"),
                    new PhonicsWord("that", "TH", "/th/", "T", "/t/"),
                    new PhonicsWord("frog", "F", "/f/", "G", "/g/"),
                    new PhonicsWord("crab", "C", "/k/", "B", "/b/"),
                    new PhonicsWord("milk", "M", "/m/", "K", "/k/"),
                    new PhonicsWord("hand", "H", "/h/", "D", "/d/"),
                    new PhonicsWord("lamp", "L", "/l/", "P", "/p/"),
                    new PhonicsWord("nest", "N", "/n/", "T", "/t/"),
                    new PhonicsWord("bell", "B", "/b/", "L", "/l/"),
                    new PhonicsWord("kick", "K", "/k/", "K", "/k/"),
                    new PhonicsWord("duck", "D", "/d/", "K", "/k/"),
                    new PhonicsWord("ring", "R", "/r/", "NG", "/ng/"),
                    new PhonicsWord("song", "S", "/s/", "NG", "/ng/"),
                    new PhonicsWord("book", "B", "/b/", "K", "/k/"),
                    new PhonicsWord("farm", "F", "/f/", "M", "/m/"),
                    new PhonicsWord("desk", "D", "/d/", "K", "/k/"),
                    new PhonicsWord("mask", "M", "/m/", "K", "/k/"),
                    new PhonicsWord("tent", "T", "/t/", "T", "/t/"),
                    new PhonicsWord("bump", "B", "/b/", "P", "/p/"),
                    new PhonicsWord("camp", "C", "/k/", "P", "/p/")
                }
            },

            // =========================================
            // LEVEL 3 - INTERMEDIATE PHONICS
            // =========================================
            {
                3,
                new[]
                {
                    new PhonicsWord("black", "B", "/b/", "K", "/k/"),
                    new PhonicsWord("clock", "C", "/k/", "K", "/k/"),
                    new PhonicsWord("brush", "B", "/b/", "SH", "/sh/"),
                    new PhonicsWord("sheep", "SH", "/sh/", "P", "/p/"),
                    new PhonicsWord("chair", "CH", "/ch/", "R", "/r/"),
                    new PhonicsWord("three", "TH", "/th/", "EE", "/ee/"),
                    new PhonicsWord("slide", "S", "/s/", "D", "/d/"),
                    new PhonicsWord("train", "T", "/t/", "N", "/n/"),
                    new PhonicsWord("plant", "P", "/p/", "T", "/t/"),
                    new PhonicsWord("crisp", "C", "/k/", "P", "/p/"),
                    new PhonicsWord("smile", "S", "/s/", "L", "/l/"),
                    new PhonicsWord("green", "G", "/g/", "N", "/n/"),
                    new PhonicsWord("grape", "G", "/g/", "P", "/p/"),
                    new PhonicsWord("stone", "ST", "/st/", "N", "/n/"),
                    new PhonicsWord("chest", "CH", "/ch/", "T", "/t/"),
                    new PhonicsWord("shark", "SH", "/sh/", "K", "/k/"),
                    new PhonicsWord("thick", "TH", "/th/", "K", "/k/"),
                    new PhonicsWord("thing", "TH", "/th/", "NG", "/ng/"),
                    new PhonicsWord("sleep", "SL", "/sl/", "P", "/p/"),
                    new PhonicsWord("twist", "TW", "/tw/", "T", "/t/"),
                    new PhonicsWord("flame", "FL", "/fl/", "M", "/m/"),
                    new PhonicsWord("drum", "DR", "/dr/", "M", "/m/"),
                    new PhonicsWord("splash", "SPL", "/spl/", "SH", "/sh/"),
                    new PhonicsWord("branch", "BR", "/br/", "CH", "/ch/")
                }
            },

            // =========================================
            // LEVEL 4 - ADVANCED PHONICS
            // =========================================
            {
                4,
                new[]
                {
                    new PhonicsWord("phone", "PH", "/f/", "N", "/n/"),
                    new PhonicsWord("whale", "WH", "/w/", "L", "/l/"),
                    new PhonicsWord("knight", "KN", "/n/", "T", "/t/"),
                    new PhonicsWord("thumb", "TH", "/th/", "M", "/m/"),
                    new PhonicsWord("graph", "GR", "/gr/", "PH", "/f/"),
                    new PhonicsWord("bridge", "BR", "/br/", "DGE", "/j/"),
                    new PhonicsWord("watch", "W", "/w/", "CH", "/ch/"),
                    new PhonicsWord("school", "SCH", "/sk/", "L", "/l/"),
                    new PhonicsWord("queen", "QU", "/kw/", "N", "/n/"),
                    new PhonicsWord("shell", "SH", "/sh/", "L", "/l/"),
                    new PhonicsWord("cheer", "CH", "/ch/", "R", "/r/"),
                    new PhonicsWord("match", "M", "/m/", "CH", "/ch/"),
                    new PhonicsWord("thick", "TH", "/th/", "K", "/k/"),
                    new PhonicsWord("squeeze", "SQ", "/skw/", "Z", "/z/"),
                    new PhonicsWord("splash", "SPL", "/spl/", "SH", "/sh/"),
                    new PhonicsWord("stripe", "STR", "/str/", "P", "/p/"),
                    new PhonicsWord("scrape", "SCR", "/skr/", "P", "/p/"),
                    new PhonicsWord("spring", "SPR", "/spr/", "NG", "/ng/"),
                    new PhonicsWord("crunch", "CR", "/kr/", "CH", "/ch/"),
                    new PhonicsWord("branch", "BR", "/br/", "CH", "/ch/"),
                    new PhonicsWord("throat", "TH", "/th/", "T", "/t/"),
                    new PhonicsWord("wrench", "WR", "/r/", "CH", "/ch/"),
                    new PhonicsWord("knock", "KN", "/n/", "K", "/k/"),
                    new PhonicsWord("phrase", "PH", "/f/", "Z", "/z/")
                }
            }
        };
        public static readonly Dictionary<int, Dictionary<int, PhonicsDifficultySettings>>
    DifficultyByLevel = new()
{
    // LEVEL 1
    {
        1, new Dictionary<int, PhonicsDifficultySettings>
        {
            { 1, new(2, 2) },
            { 2, new(3, 3) },
            { 3, new(4, 4) },
            { 4, new(5, 5) }
        }
    },

    // LEVEL 2
    {
        2, new Dictionary<int, PhonicsDifficultySettings>
        {
            { 1, new(2, 2) },
            { 2, new(3, 3) },
            { 3, new(4, 4) },
            { 4, new(5, 5) }
        }
    },

    // LEVEL 3
    {
        3, new Dictionary<int, PhonicsDifficultySettings>
        {
            { 1, new(2, 2) },
            { 2, new(3, 3) },
            { 3, new(4, 4) },
            { 4, new(5, 5) }
        }
    },

    // LEVEL 4
    {
        4, new Dictionary<int, PhonicsDifficultySettings>
        {
            { 1, new(2, 2) },
            { 2, new(3, 3) },
            { 3, new(4, 4) },
            { 4, new(5, 5) }
        }
    }
};
    }
}