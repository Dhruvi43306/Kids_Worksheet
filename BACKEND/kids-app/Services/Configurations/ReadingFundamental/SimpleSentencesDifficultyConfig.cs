
namespace kids_app.Services.Configurations.Reading
{
    public sealed record SimpleSentenceItem(
        string Sentence,
        string Question,
        string Answer,
        string Picture,
        string PictureDescription
    );

    public sealed record SimpleSentenceDifficultySettings(
        int OptionCount,
        int MinimumSentenceWords,
        int MaximumSentenceWords
    );

    public static class SimpleSentencesDifficultyConfig
    {
        public static readonly Dictionary<int, SimpleSentenceItem[]> SentencesByLevel = new()
        {
            // LEVEL 1 - Very simple sentences
            {
                1, new[]
                {
                    new SimpleSentenceItem("The cat is sleeping.", "What is sleeping?", "cat", "🐱", "A cat"),
                    new SimpleSentenceItem("The sun is hot.", "What is hot?", "sun", "☀️", "The sun"),
                    new SimpleSentenceItem("A dog can run.", "What can run?", "dog", "🐶", "A dog"),
                    new SimpleSentenceItem("The bird can fly.", "What can fly?", "bird", "🐦", "A bird"),
                    new SimpleSentenceItem("I eat an apple.", "What do I eat?", "apple", "🍎", "An apple"),
                    new SimpleSentenceItem("The boy has a ball.", "What does the boy have?", "ball", "⚽", "A ball"),
                    new SimpleSentenceItem("The fish can swim.", "What can swim?", "fish", "🐟", "A fish"),
                    new SimpleSentenceItem("The girl has a doll.", "What does the girl have?", "doll", "🪆", "A doll"),
                    new SimpleSentenceItem("The moon is bright.", "What is bright?", "moon", "🌙", "The moon"),
                    new SimpleSentenceItem("I see a red car.", "What do I see?", "car", "🚗", "A red car"),
                    new SimpleSentenceItem("The baby is happy.", "Who is happy?", "baby", "👶", "A baby"),
                    new SimpleSentenceItem("The duck is yellow.", "What is yellow?", "duck", "🦆", "A duck"),
                    new SimpleSentenceItem("The frog can jump.", "What can jump?", "frog", "🐸", "A frog"),
                    new SimpleSentenceItem("I drink cold milk.", "What do I drink?", "milk", "🥛", "A glass of milk"),
                    new SimpleSentenceItem("The cake is sweet.", "What is sweet?", "cake", "🎂", "A cake"),
                    new SimpleSentenceItem("The hen lays eggs.", "What lays eggs?", "hen", "🐔", "A hen"),
                    new SimpleSentenceItem("The bus is big.", "What is big?", "bus", "🚌", "A bus"),
                    new SimpleSentenceItem("The bee makes honey.", "What makes honey?", "bee", "🐝", "A bee"),
                    new SimpleSentenceItem("I have a blue bag.", "What do I have?", "bag", "🎒", "A blue bag"),
                    new SimpleSentenceItem("The rabbit eats carrots.", "What eats carrots?", "rabbit", "🐰", "A rabbit")
                }
            },

            // LEVEL 2 - Simple sentences with more detail
            {
                2, new[]
                {
                    new SimpleSentenceItem("The little girl reads a book.", "What does the girl read?", "book", "📖", "A girl reading"),
                    new SimpleSentenceItem("A brown horse runs fast.", "Which animal runs fast?", "horse", "🐴", "A brown horse"),
                    new SimpleSentenceItem("The children play in the park.", "Where do the children play?", "park", "🌳", "A park"),
                    new SimpleSentenceItem("My mother cooks tasty food.", "Who cooks the food?", "mother", "👩‍🍳", "A mother cooking"),
                    new SimpleSentenceItem("The farmer grows fresh vegetables.", "Who grows vegetables?", "farmer", "👨‍🌾", "A farmer"),
                    new SimpleSentenceItem("The baby drinks warm milk.", "What does the baby drink?", "milk", "🍼", "A baby drinking milk"),
                    new SimpleSentenceItem("The red kite flies high.", "What flies high?", "kite", "🪁", "A red kite"),
                    new SimpleSentenceItem("The monkey climbs a tall tree.", "What does the monkey climb?", "tree", "🐒", "A monkey in a tree"),
                    new SimpleSentenceItem("The teacher writes on the board.", "Where does the teacher write?", "board", "🧑‍🏫", "A classroom board"),
                    new SimpleSentenceItem("My father drives a yellow taxi.", "What does my father drive?", "taxi", "🚕", "A yellow taxi"),
                    new SimpleSentenceItem("The small puppy drinks water.", "What does the puppy drink?", "water", "🐕", "A puppy drinking water"),
                    new SimpleSentenceItem("The children build a sandcastle.", "What do the children build?", "sandcastle", "🏖️", "A sandcastle"),
                    new SimpleSentenceItem("A butterfly sits on a flower.", "Where does the butterfly sit?", "flower", "🦋", "A butterfly on a flower"),
                    new SimpleSentenceItem("The train stops at the station.", "Where does the train stop?", "station", "🚉", "A train station"),
                    new SimpleSentenceItem("The girl waters the green plants.", "What does the girl water?", "plants", "🪴", "Green plants"),
                    new SimpleSentenceItem("The chef makes a chocolate cake.", "Who makes the cake?", "chef", "👨‍🍳", "A chef"),
                    new SimpleSentenceItem("The duck swims in the pond.", "Where does the duck swim?", "pond", "🦆", "A duck in a pond"),
                    new SimpleSentenceItem("The boy kicks the football.", "What does the boy kick?", "football", "⚽", "A football"),
                    new SimpleSentenceItem("The squirrel collects small nuts.", "What does the squirrel collect?", "nuts", "🐿️", "A squirrel with nuts"),
                    new SimpleSentenceItem("The family eats dinner together.", "What does the family eat?", "dinner", "🍽️", "A family having dinner")
                }
            },

            // LEVEL 3 - Longer sentences and more information
            {
                3, new[]
                {
                    new SimpleSentenceItem("The young boy rides his bicycle to school.", "How does the boy go to school?", "bicycle", "🚲", "A boy riding a bicycle"),
                    new SimpleSentenceItem("The hungry rabbit eats fresh carrots in the garden.", "What does the rabbit eat?", "carrots", "🐰", "A rabbit eating carrots"),
                    new SimpleSentenceItem("The little girl paints a beautiful picture of flowers.", "What does the girl paint?", "picture", "🎨", "A girl painting"),
                    new SimpleSentenceItem("The friendly shopkeeper sells fruits and vegetables.", "Who sells fruits and vegetables?", "shopkeeper", "🛒", "A shopkeeper"),
                    new SimpleSentenceItem("The children carefully cross the busy road.", "What do the children cross?", "road", "🚸", "Children crossing a road"),
                    new SimpleSentenceItem("The clever fox hides behind a large tree.", "Where does the fox hide?", "tree", "🦊", "A fox behind a tree"),
                    new SimpleSentenceItem("The mother bird feeds her babies in the nest.", "Where are the baby birds?", "nest", "🪺", "Baby birds in a nest"),
                    new SimpleSentenceItem("The students listen carefully to their teacher.", "Who do the students listen to?", "teacher", "👩‍🏫", "A teacher with students"),
                    new SimpleSentenceItem("The postman delivers letters to every house.", "What does the postman deliver?", "letters", "📮", "Letters"),
                    new SimpleSentenceItem("The little puppy sleeps peacefully under the table.", "Where does the puppy sleep?", "table", "🐶", "A puppy under a table"),
                    new SimpleSentenceItem("The farmer plants seeds before the rainy season.", "What does the farmer plant?", "seeds", "🌱", "Seeds being planted"),
                    new SimpleSentenceItem("The colourful parrot repeats the words it hears.", "What does the parrot repeat?", "words", "🦜", "A colourful parrot"),
                    new SimpleSentenceItem("The family visits their grandparents every Sunday.", "Whom does the family visit?", "grandparents", "👵", "Grandparents"),
                    new SimpleSentenceItem("The brave firefighter rescues a kitten from the tree.", "Whom does the firefighter rescue?", "kitten", "🚒", "A firefighter rescuing a kitten"),
                    new SimpleSentenceItem("The baker puts freshly baked bread on the shelf.", "What does the baker put on the shelf?", "bread", "🍞", "Fresh bread"),
                    new SimpleSentenceItem("The children collect colourful leaves during autumn.", "What do the children collect?", "leaves", "🍂", "Autumn leaves"),
                    new SimpleSentenceItem("The astronaut looks at Earth from the spaceship.", "Where does the astronaut look from?", "spaceship", "🚀", "An astronaut in space"),
                    new SimpleSentenceItem("The little girl shares her lunch with a friend.", "With whom does the girl share lunch?", "friend", "🥪", "Two friends sharing food"),
                    new SimpleSentenceItem("The gardener trims the bushes in the morning.", "What does the gardener trim?", "bushes", "🌿", "A gardener trimming bushes"),
                    new SimpleSentenceItem("The children watch colourful fish inside the aquarium.", "Where do the children see the fish?", "aquarium", "🐠", "An aquarium")
                }
            },

            // LEVEL 4 - More detailed sentences and comprehension
            {
                4, new[]
                {
                    new SimpleSentenceItem("The curious girl carefully observed the tiny insects in the garden.", "What did the girl observe?", "insects", "🐞", "Tiny insects"),
                    new SimpleSentenceItem("The students prepared a colourful poster for their science exhibition.", "What did the students prepare?", "poster", "🖼️", "A colourful poster"),
                    new SimpleSentenceItem("The helpful neighbours carried groceries for the elderly woman.", "Whom did the neighbours help?", "woman", "🛍️", "A woman carrying groceries"),
                    new SimpleSentenceItem("The experienced pilot safely landed the airplane during the storm.", "Who landed the airplane?", "pilot", "✈️", "An airplane"),
                    new SimpleSentenceItem("The children discovered an unusual shell near the seashore.", "What did the children discover?", "shell", "🐚", "A shell"),
                    new SimpleSentenceItem("The librarian recommended an interesting adventure book to Maya.", "What did the librarian recommend?", "book", "📚", "Books in a library"),
                    new SimpleSentenceItem("The scientist carefully examined the colourful butterfly under a microscope.", "What did the scientist examine?", "butterfly", "🦋", "A butterfly"),
                    new SimpleSentenceItem("The volunteers planted several young trees beside the playground.", "What did the volunteers plant?", "trees", "🌳", "Young trees"),
                    new SimpleSentenceItem("The little explorer followed animal footprints through the forest.", "What did the explorer follow?", "footprints", "🐾", "Animal footprints"),
                    new SimpleSentenceItem("The orchestra performed beautiful music at the school celebration.", "What did the orchestra perform?", "music", "🎻", "Musical instruments"),
                    new SimpleSentenceItem("The rescue team searched the mountain for the missing hikers.", "Whom did the rescue team search for?", "hikers", "🏔️", "Mountain hikers"),
                    new SimpleSentenceItem("The artist mixed several colours to create a bright landscape painting.", "What did the artist create?", "painting", "🖌️", "A landscape painting"),
                    new SimpleSentenceItem("The children patiently waited for their turn at the water fountain.", "Where did the children wait?", "fountain", "⛲", "A water fountain"),
                    new SimpleSentenceItem("The young inventor designed a machine that collects rainwater.", "What did the machine collect?", "rainwater", "💧", "Rainwater collection"),
                    new SimpleSentenceItem("The family packed sandwiches and fruit before starting their journey.", "What did the family pack?", "sandwiches", "🥪", "Packed sandwiches"),
                    new SimpleSentenceItem("The cheerful shop assistant helped the customer find a suitable gift.", "Who helped the customer?", "assistant", "🎁", "A shop assistant"),
                    new SimpleSentenceItem("The penguins huddled together to stay warm in the icy weather.", "Why did the penguins huddle together?", "warm", "🐧", "Penguins in the snow"),
                    new SimpleSentenceItem("The school garden attracted bees because many flowers were blooming.", "What attracted the bees?", "flowers", "🌼", "Blooming flowers"),
                    new SimpleSentenceItem("The young athlete practised every afternoon to improve her running speed.", "When did the athlete practise?", "afternoon", "🏃", "A running athlete"),
                    new SimpleSentenceItem("The museum guide explained how ancient people used simple tools.", "What did the guide explain?", "tools", "🏛️", "Ancient tools")
                }
            }
        };

        // Four difficulty settings for every learning level.
        // All settings retain the complete level word bank so 20 questions can be generated.
        public static readonly Dictionary<int, Dictionary<int, SimpleSentenceDifficultySettings>>
            DifficultyByLevel = new()
        {
            {
                1, new Dictionary<int, SimpleSentenceDifficultySettings>
                {
                    { 1, new(2, 3, 6) },
                    { 2, new(3, 3, 6) },
                    { 3, new(4, 3, 6) },
                    { 4, new(5, 3, 6) }
                }
            },
            {
                2, new Dictionary<int, SimpleSentenceDifficultySettings>
                {
                    { 1, new(2, 4, 8) },
                    { 2, new(3, 4, 8) },
                    { 3, new(4, 4, 8) },
                    { 4, new(5, 4, 8) }
                }
            },
            {
                3, new Dictionary<int, SimpleSentenceDifficultySettings>
                {
                    { 1, new(2, 5, 10) },
                    { 2, new(3, 5, 10) },
                    { 3, new(4, 5, 10) },
                    { 4, new(5, 5, 10) }
                }
            },
            {
                4, new Dictionary<int, SimpleSentenceDifficultySettings>
                {
                    { 1, new(2, 6, 12) },
                    { 2, new(3, 6, 12) },
                    { 3, new(4, 6, 12) },
                    { 4, new(5, 6, 12) }
                }
            }
        };
    }
}
