
namespace kids_app.Services.Configurations.Reading
{
    public sealed record SightWordItem(
        string Word,
        string Sentence,
        string Clue,
        string Picture,
        string PictureDescription
    );

    public sealed record SightWordDifficultySettings(
        int OptionCount,
        string DifficultyName
    );

    public static class SightWordsDifficultyConfig
    {
        // =====================================
        // DIFFICULTY SETTINGS
        // =====================================

        public static readonly Dictionary<int,
            Dictionary<int, SightWordDifficultySettings>>
            DifficultySettingsByLevel = new()
        {
            {
                1, new Dictionary<int, SightWordDifficultySettings>
                {
                    { 1, new(2, "Very Easy") },
                    { 2, new(3, "Easy") },
                    { 3, new(4, "Medium") },
                    { 4, new(5, "Hard") }
                }
            },
            {
                2, new Dictionary<int, SightWordDifficultySettings>
                {
                    { 1, new(2, "Very Easy") },
                    { 2, new(3, "Easy") },
                    { 3, new(4, "Medium") },
                    { 4, new(5, "Hard") }
                }
            },
            {
                3, new Dictionary<int, SightWordDifficultySettings>
                {
                    { 1, new(2, "Very Easy") },
                    { 2, new(3, "Easy") },
                    { 3, new(4, "Medium") },
                    { 4, new(5, "Hard") }
                }
            },
            {
                4, new Dictionary<int, SightWordDifficultySettings>
                {
                    { 1, new(2, "Very Easy") },
                    { 2, new(3, "Easy") },
                    { 3, new(4, "Medium") },
                    { 4, new(5, "Hard") }
                }
            }
        };

        // =====================================
        // LEVEL 1 - BEGINNER
        // =====================================

        private static readonly SightWordItem[] Level1Words =
        {
            new("I", "I am happy.", "The word we use when talking about ourselves.", "👧", "A child pointing to herself."),
            new("a", "I see a cat.", "A small word used before one thing.", "🐱", "One cat."),
            new("the", "Look at the sun.", "A word used for a specific person or thing.", "☀️", "The sun in the sky."),
            new("is", "The ball is red.", "A word that tells what something is like.", "🔴", "A red ball."),
            new("it", "It is a ball.", "A word used instead of naming an object.", "⚽", "A ball."),
            new("in", "The toy is in the box.", "Means inside something.", "🧸", "A toy inside a box."),
            new("to", "I go to school.", "A word that can show direction.", "🏫", "A child going to school."),
            new("my", "This is my bag.", "Shows that something belongs to me.", "🎒", "A child's school bag."),
            new("we", "We are playing.", "Means me and other people together.", "👨‍👩‍👧", "A family together."),
            new("see", "I can see a bird.", "An action you do with your eyes.", "👀", "Eyes looking at a bird."),
            new("go", "I go to school.", "Means to move or travel somewhere.", "🚶", "A person walking."),
            new("up", "Look up at the sky.", "The direction above.", "⬆️", "An upward arrow."),
            new("me", "Please help me.", "A word used for the person speaking.", "🧒", "A child asking for help."),
            new("he", "He is my brother.", "A word used when talking about a boy.", "👦", "A boy."),
            new("she", "She is my sister.", "A word used when talking about a girl.", "👧", "A girl."),
            new("on", "The book is on the table.", "Means touching the top of something.", "📘", "A book on a table."),
            new("at", "I am at school.", "A small word that can show a place.", "📍", "A location marker."),
            new("am", "I am happy.", "A form of the word 'be' used with I.", "😀", "A happy child."),
            new("can", "I can jump.", "Shows that someone is able to do something.", "🦘", "A person jumping."),
            new("you", "You are my friend.", "A word used for the person being spoken to.", "👉", "A person pointing toward another person.")
        };

        // =====================================
        // LEVEL 2 - DEVELOPING
        // =====================================

        private static readonly SightWordItem[] Level2Words =
        {
            new("have", "I have a blue bag.", "Means to own or hold something.", "🎒", "A child with a bag."),
            new("has", "She has a red book.", "A word showing that someone owns something.", "📕", "A girl holding a book."),
            new("do", "I do my homework.", "An action word used to talk about doing something.", "✏️", "A child writing homework."),
            new("did", "I did my work yesterday.", "The past form of do.", "✅", "A completed task."),
            new("was", "He was happy.", "A word used to talk about a past state.", "🙂", "A happy boy."),
            new("are", "They are playing.", "A form of be used with you, we and they.", "👧👦", "Children playing together."),
            new("this", "This is my pencil.", "Points to one thing that is near.", "✏️", "A nearby pencil."),
            new("that", "That is a tall tree.", "Points to one thing farther away.", "🌳", "A distant tree."),
            new("with", "I play with my friend.", "Means together or accompanied by someone.", "🤝", "Two friends together."),
            new("for", "This gift is for you.", "Shows who or what something is intended for.", "🎁", "A gift for someone."),
            new("come", "Please come here.", "Means to move toward someone.", "🫴", "Someone inviting a friend."),
            new("from", "This letter is from Dad.", "Shows where something starts or who sent it.", "✉️", "A letter sent by someone."),
            new("said", "She said hello.", "The past form of say.", "💬", "A speech bubble."),
            new("went", "We went to the park.", "The past form of go.", "🚶", "A person walking to a park."),
            new("what", "What is in the box?", "A question word used to ask about a thing.", "❓", "A question mark."),
            new("when", "When is your birthday?", "A question word used to ask about time.", "🕒", "A clock."),
            new("where", "Where is my bag?", "A question word used to ask about place.", "📍", "A location marker."),
            new("who", "Who is at the door?", "A question word used to ask about a person.", "🧑", "A person."),
            new("why", "Why are you smiling?", "A question word used to ask for a reason.", "🤔", "A thinking face."),
            new("how", "How do you make a cake?", "A question word used to ask about the way something happens.", "🎂", "A cake being made.")
        };

        // =====================================
        // LEVEL 3 - INTERMEDIATE
        // =====================================

        private static readonly SightWordItem[] Level3Words =
        {
            new("because", "I smiled because I was happy.", "A word used to give a reason.", "😊", "A happy child."),
            new("before", "Wash your hands before dinner.", "Means earlier than something.", "🧼", "Washing hands before a meal."),
            new("after", "We play after school.", "Means later than something.", "🏫", "Children leaving school."),
            new("again", "Please read the story again.", "Means one more time.", "📖", "A child reading a book again."),
            new("around", "We walked around the park.", "Means on every side or in a circle.", "🌳", "A path around a park."),
            new("every", "Every child has a book.", "Means each one in a group.", "👧👦", "A group of children."),
            new("could", "I could swim when I was young.", "Shows past ability or possibility.", "🏊", "A child swimming."),
            new("would", "I would like some water.", "A word used to express a polite wish.", "🥤", "A glass of water being offered."),
            new("should", "You should brush your teeth.", "A word used to give advice.", "🪥", "A toothbrush."),
            new("their", "The children packed their bags.", "Shows that something belongs to them.", "🎒", "Children carrying their bags."),
            new("there", "Put the chair over there.", "Points to a place.", "📍", "A marker showing a place."),
            new("these", "These are my crayons.", "Points to more than one nearby thing.", "🖍️", "Several crayons."),
            new("those", "Those are tall buildings.", "Points to more than one thing farther away.", "🏢", "Buildings in the distance."),
            new("then", "We ate dinner and then played.", "Means next in a sequence.", "➡️", "Steps in an activity."),
            new("them", "Please give them the books.", "A word used for people or things already mentioned.", "📚", "Children receiving books."),
            new("some", "I would like some apples.", "Means an amount or number that is not exact.", "🍎", "A few apples."),
            new("many", "There are many stars.", "Means a large number.", "⭐", "Lots of stars."),
            new("very", "The water is very cold.", "Makes an adjective stronger.", "🧊", "Ice and cold water."),
            new("your", "Is this your pencil?", "Shows that something belongs to the person being spoken to.", "✏️", "A pencil belonging to someone."),
            new("our", "This is our classroom.", "Shows that something belongs to us.", "🏫", "A classroom shared by children.")
        };

        // =====================================
        // LEVEL 4 - ADVANCED
        // =====================================

        private static readonly SightWordItem[] Level4Words =
        {
            new("always", "I always brush my teeth.", "Means every time or on every occasion.", "🪥", "A daily tooth-brushing routine."),
            new("also", "She can sing and also dance.", "Means in addition or too.", "🎤", "A child singing and dancing."),
            new("almost", "The glass is almost full.", "Means nearly but not completely.", "🥛", "A nearly full glass."),
            new("another", "May I have another cookie?", "Means one more or a different one.", "🍪", "Two cookies."),
            new("answer", "Please write your answer.", "A reply to a question.", "✍️", "A child writing an answer."),
            new("against", "The ball rolled against the wall.", "Means touching or facing something.", "⚽", "A ball against a wall."),
            new("anything", "You can ask me anything.", "Means any thing at all.", "❔", "A question mark."),
            new("become", "A caterpillar will become a butterfly.", "Means to change into something.", "🦋", "A butterfly."),
            new("between", "The ball is between two boxes.", "Means in the space separating two things.", "⚽", "A ball between two boxes."),
            new("both", "Both children are smiling.", "Means the two together.", "👧👦", "Two smiling children."),
            new("children", "The children are reading.", "Means more than one child.", "👧👦", "A group of children."),
            new("country", "India is a beautiful country.", "Means a nation with its own land and people.", "🇮🇳", "The flag of India."),
            new("enough", "We have enough food for everyone.", "Means as much as is needed.", "🍎", "A table with sufficient food."),
            new("example", "The teacher gave an example.", "Something used to explain an idea.", "📝", "A written example."),
            new("family", "My family eats dinner together.", "A group of related people.", "👨‍👩‍👧", "A family eating together."),
            new("important", "It is important to be kind.", "Means something that matters a lot.", "❤️", "A heart symbol."),
            new("together", "We read a book together.", "Means with one another.", "📖", "People reading together."),
            new("sometimes", "I sometimes play in the rain.", "Means on some occasions, but not always.", "🌦️", "Sun and rain."),
            new("something", "I have something to show you.", "Means an unspecified thing.", "🎁", "A wrapped present."),
            new("without", "Do not go without your shoes.", "Means not having or using something.", "👟", "A pair of shoes.")
        };

        // =====================================
        // LEVEL + DIFFICULTY WORD BANK
        // =====================================

        public static readonly Dictionary<int,
            Dictionary<int, SightWordItem[]>>
            SightWordsByLevelAndDifficulty = BuildDifficultyBanks();

        private static Dictionary<int,
            Dictionary<int, SightWordItem[]>> BuildDifficultyBanks()
        {
            var result = new Dictionary<int,
                Dictionary<int, SightWordItem[]>>();

            var levelWords = new Dictionary<int, SightWordItem[]>
            {
                { 1, Level1Words },
                { 2, Level2Words },
                { 3, Level3Words },
                { 4, Level4Words }
            };

            foreach (var level in levelWords)
            {
                result[level.Key] = new Dictionary<int, SightWordItem[]>
                {
                    { 1, level.Value },
                    { 2, level.Value },
                    { 3, level.Value },
                    { 4, level.Value }
                };
            }

            return result;
        }
    }
}
