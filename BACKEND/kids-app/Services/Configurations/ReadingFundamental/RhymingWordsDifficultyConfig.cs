
namespace kids_app.Services.Configurations.Reading
{
    public sealed record RhymingWordItem(
        string Word,
        string Picture,
        string PictureDescription
    );

    public sealed record RhymingDifficultySettings(
        int OptionCount,
        int RhymeGroupSize,
        int MinimumWordLength,
        int MaximumWordLength
    );

    public static class RhymingWordsDifficultyConfig
    {
        // Structure:
        // Learning Level -> Difficulty -> Rhyme Families -> Words
        public static readonly Dictionary<int,
            Dictionary<int, RhymingWordItem[][]>> RhymingWordsByLevelAndDifficulty = new()
        {
            // ==================================================
            // LEVEL 1 - BEGINNER RHYMING WORDS
            // ==================================================
            {
                1, new Dictionary<int, RhymingWordItem[][]>
                {
                    // Difficulty 1 - Very Easy
                    {
                        1, new[]
                        {
                            new[] {
                                new RhymingWordItem("cat", "🐱", "Cat"),
                                new RhymingWordItem("hat", "🎩", "Hat"),
                                new RhymingWordItem("bat", "🦇", "Bat"),
                                new RhymingWordItem("mat", "🧘", "Mat"),
                                new RhymingWordItem("rat", "🐀", "Rat")
                            },
                            new[] {
                                new RhymingWordItem("sun", "☀️", "Sun"),
                                new RhymingWordItem("fun", "🎉", "Fun"),
                                new RhymingWordItem("run", "🏃", "Run"),
                                new RhymingWordItem("bun", "🍞", "Bun"),
                                new RhymingWordItem("nun", "👩‍🦳", "Nun")
                            },
                            new[] {
                                new RhymingWordItem("pen", "🖊️", "Pen"),
                                new RhymingWordItem("hen", "🐔", "Hen"),
                                new RhymingWordItem("ten", "🔟", "Ten"),
                                new RhymingWordItem("men", "👨", "Men"),
                                new RhymingWordItem("den", "🏡", "Den")
                            },
                            new[] {
                                new RhymingWordItem("pig", "🐷", "Pig"),
                                new RhymingWordItem("wig", "💇", "Wig"),
                                new RhymingWordItem("dig", "⛏️", "Dig"),
                                new RhymingWordItem("fig", "🟣", "Fig"),
                                new RhymingWordItem("big", "🐘", "Big")
                            }
                        }
                    },

                    // Difficulty 2 - Easy
                    {
                        2, new[]
                        {
                            new[] {
                                new RhymingWordItem("dog", "🐶", "Dog"),
                                new RhymingWordItem("log", "🪵", "Log"),
                                new RhymingWordItem("fog", "🌫️", "Fog"),
                                new RhymingWordItem("hog", "🐗", "Hog"),
                                new RhymingWordItem("jog", "🏃", "Jog")
                            },
                            new[] {
                                new RhymingWordItem("map", "🗺️", "Map"),
                                new RhymingWordItem("cap", "🧢", "Cap"),
                                new RhymingWordItem("tap", "🚰", "Tap"),
                                new RhymingWordItem("lap", "🦵", "Lap"),
                                new RhymingWordItem("nap", "😴", "Nap")
                            },
                            new[] {
                                new RhymingWordItem("box", "📦", "Box"),
                                new RhymingWordItem("fox", "🦊", "Fox"),
                                new RhymingWordItem("ox", "🐂", "Ox"),
                                new RhymingWordItem("pox", "🩹", "Pox"),
                                new RhymingWordItem("lox", "🐟", "Lox")
                            },
                            new[] {
                                new RhymingWordItem("bed", "🛏️", "Bed"),
                                new RhymingWordItem("red", "🔴", "Red"),
                                new RhymingWordItem("fed", "🍽️", "Fed"),
                                new RhymingWordItem("led", "➡️", "Led"),
                                new RhymingWordItem("wed", "💍", "Wed")
                            }
                        }
                    },

                    // Difficulty 3 - Medium
                    {
                        3, new[]
                        {
                            new[] {
                                new RhymingWordItem("cake", "🎂", "Cake"),
                                new RhymingWordItem("bake", "🥧", "Bake"),
                                new RhymingWordItem("lake", "🏞️", "Lake"),
                                new RhymingWordItem("make", "🛠️", "Make"),
                                new RhymingWordItem("rake", "🍂", "Rake")
                            },
                            new[] {
                                new RhymingWordItem("light", "💡", "Light"),
                                new RhymingWordItem("night", "🌙", "Night"),
                                new RhymingWordItem("right", "➡️", "Right"),
                                new RhymingWordItem("sight", "👀", "Sight"),
                                new RhymingWordItem("tight", "🔒", "Tight")
                            },
                            new[] {
                                new RhymingWordItem("bell", "🔔", "Bell"),
                                new RhymingWordItem("shell", "🐚", "Shell"),
                                new RhymingWordItem("smell", "👃", "Smell"),
                                new RhymingWordItem("well", "🪣", "Well"),
                                new RhymingWordItem("tell", "💬", "Tell")
                            },
                            new[] {
                                new RhymingWordItem("book", "📘", "Book"),
                                new RhymingWordItem("look", "👀", "Look"),
                                new RhymingWordItem("cook", "👩‍🍳", "Cook"),
                                new RhymingWordItem("hook", "🪝", "Hook"),
                                new RhymingWordItem("took", "🤲", "Took")
                            }
                        }
                    },

                    // Difficulty 4 - Hard
                    {
                        4, new[]
                        {
                            new[] {
                                new RhymingWordItem("train", "🚆", "Train"),
                                new RhymingWordItem("brain", "🧠", "Brain"),
                                new RhymingWordItem("chain", "⛓️", "Chain"),
                                new RhymingWordItem("drain", "🚰", "Drain"),
                                new RhymingWordItem("grain", "🌾", "Grain")
                            },
                            new[] {
                                new RhymingWordItem("chair", "🪑", "Chair"),
                                new RhymingWordItem("bear", "🐻", "Bear"),
                                new RhymingWordItem("pear", "🍐", "Pear"),
                                new RhymingWordItem("wear", "👕", "Wear"),
                                new RhymingWordItem("share", "🤝", "Share")
                            },
                            new[] {
                                new RhymingWordItem("stone", "🪨", "Stone"),
                                new RhymingWordItem("phone", "📱", "Phone"),
                                new RhymingWordItem("cone", "🍦", "Cone"),
                                new RhymingWordItem("bone", "🦴", "Bone"),
                                new RhymingWordItem("throne", "👑", "Throne")
                            },
                            new[] {
                                new RhymingWordItem("clock", "⏰", "Clock"),
                                new RhymingWordItem("block", "🧱", "Block"),
                                new RhymingWordItem("shock", "⚡", "Shock"),
                                new RhymingWordItem("rock", "🪨", "Rock"),
                                new RhymingWordItem("flock", "🐦", "Flock")
                            }
                        }
                    }
                }
            },

            // ==================================================
            // LEVEL 2 - DEVELOPING RHYMING WORDS
            // ==================================================
            {
                2, new Dictionary<int, RhymingWordItem[][]>
                {
                    {
                        1, new[]
                        {
                            new[] {
                                new RhymingWordItem("cake", "🎂", "Cake"),
                                new RhymingWordItem("bake", "🥧", "Bake"),
                                new RhymingWordItem("lake", "🏞️", "Lake"),
                                new RhymingWordItem("make", "🛠️", "Make"),
                                new RhymingWordItem("rake", "🍂", "Rake")
                            },
                            new[] {
                                new RhymingWordItem("bell", "🔔", "Bell"),
                                new RhymingWordItem("shell", "🐚", "Shell"),
                                new RhymingWordItem("smell", "👃", "Smell"),
                                new RhymingWordItem("well", "🪣", "Well"),
                                new RhymingWordItem("tell", "💬", "Tell")
                            },
                            new[] {
                                new RhymingWordItem("book", "📘", "Book"),
                                new RhymingWordItem("look", "👀", "Look"),
                                new RhymingWordItem("cook", "👩‍🍳", "Cook"),
                                new RhymingWordItem("hook", "🪝", "Hook"),
                                new RhymingWordItem("took", "🤲", "Took")
                            },
                            new[] {
                                new RhymingWordItem("rain", "🌧️", "Rain"),
                                new RhymingWordItem("pain", "🤕", "Pain"),
                                new RhymingWordItem("main", "⭐", "Main"),
                                new RhymingWordItem("gain", "📈", "Gain"),
                                new RhymingWordItem("chain", "⛓️", "Chain")
                            }
                        }
                    },
                    {
                        2, new[]
                        {
                            new[] {
                                new RhymingWordItem("light", "💡", "Light"),
                                new RhymingWordItem("night", "🌙", "Night"),
                                new RhymingWordItem("bright", "✨", "Bright"),
                                new RhymingWordItem("sight", "👀", "Sight"),
                                new RhymingWordItem("flight", "✈️", "Flight")
                            },
                            new[] {
                                new RhymingWordItem("ground", "🌍", "Ground"),
                                new RhymingWordItem("sound", "🔊", "Sound"),
                                new RhymingWordItem("found", "🔎", "Found"),
                                new RhymingWordItem("round", "⭕", "Round"),
                                new RhymingWordItem("bound", "📦", "Bound")
                            },
                            new[] {
                                new RhymingWordItem("dream", "💭", "Dream"),
                                new RhymingWordItem("cream", "🍦", "Cream"),
                                new RhymingWordItem("stream", "🌊", "Stream"),
                                new RhymingWordItem("team", "👥", "Team"),
                                new RhymingWordItem("beam", "🔦", "Beam")
                            },
                            new[] {
                                new RhymingWordItem("smile", "😊", "Smile"),
                                new RhymingWordItem("while", "⏳", "While"),
                                new RhymingWordItem("style", "👗", "Style"),
                                new RhymingWordItem("file", "📁", "File"),
                                new RhymingWordItem("tile", "🧩", "Tile")
                            }
                        }
                    },
                    {
                        3, new[]
                        {
                            new[] {
                                new RhymingWordItem("station", "🚉", "Station"),
                                new RhymingWordItem("nation", "🌍", "Nation"),
                                new RhymingWordItem("creation", "🎨", "Creation"),
                                new RhymingWordItem("location", "📍", "Location"),
                                new RhymingWordItem("vacation", "🏖️", "Vacation")
                            },
                            new[] {
                                new RhymingWordItem("motion", "🏃", "Motion"),
                                new RhymingWordItem("ocean", "🌊", "Ocean"),
                                new RhymingWordItem("notion", "💭", "Notion"),
                                new RhymingWordItem("potion", "🧪", "Potion"),
                                new RhymingWordItem("lotion", "🧴", "Lotion")
                            },
                            new[] {
                                new RhymingWordItem("appear", "👀", "Appear"),
                                new RhymingWordItem("clear", "💎", "Clear"),
                                new RhymingWordItem("dear", "💌", "Dear"),
                                new RhymingWordItem("fear", "😨", "Fear"),
                                new RhymingWordItem("year", "📅", "Year")
                            },
                            new[] {
                                new RhymingWordItem("pleasure", "😊", "Pleasure"),
                                new RhymingWordItem("measure", "📏", "Measure"),
                                new RhymingWordItem("treasure", "💎", "Treasure"),
                                new RhymingWordItem("leisure", "🌴", "Leisure"),
                                new RhymingWordItem("seizure", "⚕️", "Seizure")
                            }
                        }
                    },
                    {
                        4, new[]
                        {
                            new[] {
                                new RhymingWordItem("education", "🎓", "Education"),
                                new RhymingWordItem("celebration", "🎉", "Celebration"),
                                new RhymingWordItem("information", "📚", "Information"),
                                new RhymingWordItem("preparation", "📝", "Preparation"),
                                new RhymingWordItem("explanation", "💡", "Explanation")
                            },
                            new[] {
                                new RhymingWordItem("beautiful", "🌸", "Beautiful"),
                                new RhymingWordItem("dutiful", "🤝", "Dutiful"),
                                new RhymingWordItem("fruitful", "🍎", "Fruitful"),
                                new RhymingWordItem("truthful", "💬", "Truthful"),
                                new RhymingWordItem("youthful", "🧒", "Youthful")
                            },
                            new[] {
                                new RhymingWordItem("adventure", "🧭", "Adventure"),
                                new RhymingWordItem("venture", "🚀", "Venture"),
                                new RhymingWordItem("capture", "📸", "Capture"),
                                new RhymingWordItem("nature", "🌳", "Nature"),
                                new RhymingWordItem("creature", "🦋", "Creature")
                            },
                            new[] {
                                new RhymingWordItem("discovery", "🔍", "Discovery"),
                                new RhymingWordItem("recovery", "💚", "Recovery"),
                                new RhymingWordItem("history", "📜", "History"),
                                new RhymingWordItem("mystery", "🕵️", "Mystery"),
                                new RhymingWordItem("victory", "🏆", "Victory")
                            }
                        }
                    }
                }
            },

            // ==================================================
            // LEVEL 3 - INTERMEDIATE RHYMING WORDS
            // ==================================================
            {
                3, new Dictionary<int, RhymingWordItem[][]>
                {
                    {
                        1, new[]
                        {
                            new[] {
                                new RhymingWordItem("train", "🚆", "Train"),
                                new RhymingWordItem("brain", "🧠", "Brain"),
                                new RhymingWordItem("chain", "⛓️", "Chain"),
                                new RhymingWordItem("drain", "🚰", "Drain"),
                                new RhymingWordItem("grain", "🌾", "Grain")
                            },
                            new[] {
                                new RhymingWordItem("chair", "🪑", "Chair"),
                                new RhymingWordItem("bear", "🐻", "Bear"),
                                new RhymingWordItem("pear", "🍐", "Pear"),
                                new RhymingWordItem("wear", "👕", "Wear"),
                                new RhymingWordItem("share", "🤝", "Share")
                            },
                            new[] {
                                new RhymingWordItem("stone", "🪨", "Stone"),
                                new RhymingWordItem("phone", "📱", "Phone"),
                                new RhymingWordItem("cone", "🍦", "Cone"),
                                new RhymingWordItem("bone", "🦴", "Bone"),
                                new RhymingWordItem("throne", "👑", "Throne")
                            },
                            new[] {
                                new RhymingWordItem("clock", "⏰", "Clock"),
                                new RhymingWordItem("block", "🧱", "Block"),
                                new RhymingWordItem("shock", "⚡", "Shock"),
                                new RhymingWordItem("rock", "🪨", "Rock"),
                                new RhymingWordItem("flock", "🐦", "Flock")
                            }
                        }
                    },
                    {
                        2, new[]
                        {
                            new[] {
                                new RhymingWordItem("flight", "✈️", "Flight"),
                                new RhymingWordItem("fright", "😱", "Fright"),
                                new RhymingWordItem("slight", "🤏", "Slight"),
                                new RhymingWordItem("tight", "🔒", "Tight"),
                                new RhymingWordItem("tonight", "🌃", "Tonight")
                            },
                            new[] {
                                new RhymingWordItem("station", "🚉", "Station"),
                                new RhymingWordItem("nation", "🌍", "Nation"),
                                new RhymingWordItem("creation", "🎨", "Creation"),
                                new RhymingWordItem("location", "📍", "Location"),
                                new RhymingWordItem("vacation", "🏖️", "Vacation")
                            },
                            new[] {
                                new RhymingWordItem("appear", "👀", "Appear"),
                                new RhymingWordItem("clear", "💎", "Clear"),
                                new RhymingWordItem("dear", "💌", "Dear"),
                                new RhymingWordItem("fear", "😨", "Fear"),
                                new RhymingWordItem("year", "📅", "Year")
                            },
                            new[] {
                                new RhymingWordItem("motion", "🏃", "Motion"),
                                new RhymingWordItem("ocean", "🌊", "Ocean"),
                                new RhymingWordItem("notion", "💭", "Notion"),
                                new RhymingWordItem("potion", "🧪", "Potion"),
                                new RhymingWordItem("lotion", "🧴", "Lotion")
                            }
                        }
                    },
                    {
                        3, new[]
                        {
                            new[] {
                                new RhymingWordItem("delight", "😊", "Delight"),
                                new RhymingWordItem("midnight", "🌌", "Midnight"),
                                new RhymingWordItem("sunlight", "☀️", "Sunlight"),
                                new RhymingWordItem("moonlight", "🌙", "Moonlight"),
                                new RhymingWordItem("highlight", "✨", "Highlight")
                            },
                            new[] {
                                new RhymingWordItem("arrangement", "📋", "Arrangement"),
                                new RhymingWordItem("agreement", "🤝", "Agreement"),
                                new RhymingWordItem("development", "📈", "Development"),
                                new RhymingWordItem("enjoyment", "😊", "Enjoyment"),
                                new RhymingWordItem("movement", "🏃", "Movement")
                            },
                            new[] {
                                new RhymingWordItem("reflection", "🪞", "Reflection"),
                                new RhymingWordItem("connection", "🔗", "Connection"),
                                new RhymingWordItem("direction", "🧭", "Direction"),
                                new RhymingWordItem("collection", "🧺", "Collection"),
                                new RhymingWordItem("protection", "🛡️", "Protection")
                            },
                            new[] {
                                new RhymingWordItem("community", "🏘️", "Community"),
                                new RhymingWordItem("opportunity", "🌟", "Opportunity"),
                                new RhymingWordItem("creativity", "🎨", "Creativity"),
                                new RhymingWordItem("activity", "⚽", "Activity"),
                                new RhymingWordItem("ability", "💪", "Ability")
                            }
                        }
                    },
                    {
                        4, new[]
                        {
                            new[] {
                                new RhymingWordItem("extraordinary", "🌟", "Extraordinary"),
                                new RhymingWordItem("necessary", "📌", "Necessary"),
                                new RhymingWordItem("temporary", "⏳", "Temporary"),
                                new RhymingWordItem("dictionary", "📖", "Dictionary"),
                                new RhymingWordItem("vocabulary", "📝", "Vocabulary")
                            },
                            new[] {
                                new RhymingWordItem("inspiration", "💡", "Inspiration"),
                                new RhymingWordItem("exploration", "🧭", "Exploration"),
                                new RhymingWordItem("celebration", "🎉", "Celebration"),
                                new RhymingWordItem("preparation", "📝", "Preparation"),
                                new RhymingWordItem("determination", "🏅", "Determination")
                            },
                            new[] {
                                new RhymingWordItem("responsibility", "🤝", "Responsibility"),
                                new RhymingWordItem("possibility", "✨", "Possibility"),
                                new RhymingWordItem("flexibility", "🧘", "Flexibility"),
                                new RhymingWordItem("reliability", "🛠️", "Reliability"),
                                new RhymingWordItem("capability", "💪", "Capability")
                            },
                            new[] {
                                new RhymingWordItem("understanding", "🧠", "Understanding"),
                                new RhymingWordItem("outstanding", "🏆", "Outstanding"),
                                new RhymingWordItem("demanding", "📚", "Demanding"),
                                new RhymingWordItem("commanding", "🎖️", "Commanding"),
                                new RhymingWordItem("withstanding", "🛡️", "Withstanding")
                            }
                        }
                    }
                }
            },

            // ==================================================
            // LEVEL 4 - ADVANCED RHYMING WORDS
            // ==================================================
            {
                4, new Dictionary<int, RhymingWordItem[][]>
                {
                    {
                        1, new[]
                        {
                            new[] {
                                new RhymingWordItem("flight", "✈️", "Flight"),
                                new RhymingWordItem("fright", "😱", "Fright"),
                                new RhymingWordItem("slight", "🤏", "Slight"),
                                new RhymingWordItem("tight", "🔒", "Tight"),
                                new RhymingWordItem("tonight", "🌃", "Tonight")
                            },
                            new[] {
                                new RhymingWordItem("station", "🚉", "Station"),
                                new RhymingWordItem("nation", "🌍", "Nation"),
                                new RhymingWordItem("creation", "🎨", "Creation"),
                                new RhymingWordItem("location", "📍", "Location"),
                                new RhymingWordItem("vacation", "🏖️", "Vacation")
                            },
                            new[] {
                                new RhymingWordItem("appear", "👀", "Appear"),
                                new RhymingWordItem("clear", "💎", "Clear"),
                                new RhymingWordItem("dear", "💌", "Dear"),
                                new RhymingWordItem("fear", "😨", "Fear"),
                                new RhymingWordItem("year", "📅", "Year")
                            },
                            new[] {
                                new RhymingWordItem("motion", "🏃", "Motion"),
                                new RhymingWordItem("ocean", "🌊", "Ocean"),
                                new RhymingWordItem("notion", "💭", "Notion"),
                                new RhymingWordItem("potion", "🧪", "Potion"),
                                new RhymingWordItem("lotion", "🧴", "Lotion")
                            }
                        }
                    },
                    {
                        2, new[]
                        {
                            new[] {
                                new RhymingWordItem("delight", "😊", "Delight"),
                                new RhymingWordItem("midnight", "🌌", "Midnight"),
                                new RhymingWordItem("sunlight", "☀️", "Sunlight"),
                                new RhymingWordItem("moonlight", "🌙", "Moonlight"),
                                new RhymingWordItem("highlight", "✨", "Highlight")
                            },
                            new[] {
                                new RhymingWordItem("reflection", "🪞", "Reflection"),
                                new RhymingWordItem("connection", "🔗", "Connection"),
                                new RhymingWordItem("direction", "🧭", "Direction"),
                                new RhymingWordItem("collection", "🧺", "Collection"),
                                new RhymingWordItem("protection", "🛡️", "Protection")
                            },
                            new[] {
                                new RhymingWordItem("community", "🏘️", "Community"),
                                new RhymingWordItem("opportunity", "🌟", "Opportunity"),
                                new RhymingWordItem("creativity", "🎨", "Creativity"),
                                new RhymingWordItem("activity", "⚽", "Activity"),
                                new RhymingWordItem("ability", "💪", "Ability")
                            },
                            new[] {
                                new RhymingWordItem("inspiration", "💡", "Inspiration"),
                                new RhymingWordItem("exploration", "🧭", "Exploration"),
                                new RhymingWordItem("celebration", "🎉", "Celebration"),
                                new RhymingWordItem("preparation", "📝", "Preparation"),
                                new RhymingWordItem("determination", "🏅", "Determination")
                            }
                        }
                    },
                    {
                        3, new[]
                        {
                            new[] {
                                new RhymingWordItem("responsibility", "🤝", "Responsibility"),
                                new RhymingWordItem("possibility", "✨", "Possibility"),
                                new RhymingWordItem("flexibility", "🧘", "Flexibility"),
                                new RhymingWordItem("reliability", "🛠️", "Reliability"),
                                new RhymingWordItem("capability", "💪", "Capability")
                            },
                            new[] {
                                new RhymingWordItem("understanding", "🧠", "Understanding"),
                                new RhymingWordItem("outstanding", "🏆", "Outstanding"),
                                new RhymingWordItem("demanding", "📚", "Demanding"),
                                new RhymingWordItem("commanding", "🎖️", "Commanding"),
                                new RhymingWordItem("withstanding", "🛡️", "Withstanding")
                            },
                            new[] {
                                new RhymingWordItem("education", "🎓", "Education"),
                                new RhymingWordItem("communication", "🗣️", "Communication"),
                                new RhymingWordItem("celebration", "🎉", "Celebration"),
                                new RhymingWordItem("preparation", "📝", "Preparation"),
                                new RhymingWordItem("explanation", "💡", "Explanation")
                            },
                            new[] {
                                new RhymingWordItem("discovery", "🔍", "Discovery"),
                                new RhymingWordItem("recovery", "💚", "Recovery"),
                                new RhymingWordItem("history", "📜", "History"),
                                new RhymingWordItem("mystery", "🕵️", "Mystery"),
                                new RhymingWordItem("victory", "🏆", "Victory")
                            }
                        }
                    },
                    {
                        4, new[]
                        {
                            new[] {
                                new RhymingWordItem("extraordinary", "🌟", "Extraordinary"),
                                new RhymingWordItem("necessary", "📌", "Necessary"),
                                new RhymingWordItem("temporary", "⏳", "Temporary"),
                                new RhymingWordItem("dictionary", "📖", "Dictionary"),
                                new RhymingWordItem("vocabulary", "📝", "Vocabulary")
                            },
                            new[] {
                                new RhymingWordItem("determination", "🏅", "Determination"),
                                new RhymingWordItem("consideration", "🤔", "Consideration"),
                                new RhymingWordItem("appreciation", "💐", "Appreciation"),
                                new RhymingWordItem("organization", "🗂️", "Organization"),
                                new RhymingWordItem("concentration", "🎯", "Concentration")
                            },
                            new[] {
                                new RhymingWordItem("accessibility", "♿", "Accessibility"),
                                new RhymingWordItem("adaptability", "🔄", "Adaptability"),
                                new RhymingWordItem("compatibility", "🔗", "Compatibility"),
                                new RhymingWordItem("sustainability", "🌱", "Sustainability"),
                                new RhymingWordItem("availability", "📅", "Availability")
                            },
                            new[] {
                                new RhymingWordItem("investigation", "🔎", "Investigation"),
                                new RhymingWordItem("collaboration", "🤝", "Collaboration"),
                                new RhymingWordItem("transformation", "🦋", "Transformation"),
                                new RhymingWordItem("interpretation", "📖", "Interpretation"),
                                new RhymingWordItem("demonstration", "🎤", "Demonstration")
                            }
                        }
                    }
                }
            }
        };

        // Four difficulty settings for every learning level.
        public static readonly Dictionary<int,
            Dictionary<int, RhymingDifficultySettings>> DifficultySettingsByLevel = new()
        {
            {
                1, new Dictionary<int, RhymingDifficultySettings>
                {
                    { 1, new(3, 3, 3, 3) },
                    { 2, new(4, 4, 3, 4) },
                    { 3, new(4, 4, 3, 5) },
                    { 4, new(5, 5, 3, 5) }
                }
            },
            {
                2, new Dictionary<int, RhymingDifficultySettings>
                {
                    { 1, new(3, 3, 4, 5) },
                    { 2, new(4, 4, 4, 6) },
                    { 3, new(4, 4, 4, 8) },
                    { 4, new(5, 5, 4, 10) }
                }
            },
            {
                3, new Dictionary<int, RhymingDifficultySettings>
                {
                    { 1, new(3, 3, 5, 7) },
                    { 2, new(4, 4, 5, 9) },
                    { 3, new(4, 4, 5, 12) },
                    { 4, new(5, 5, 5, 15) }
                }
            },
            {
                4, new Dictionary<int, RhymingDifficultySettings>
                {
                    { 1, new(3, 3, 6, 9) },
                    { 2, new(4, 4, 6, 12) },
                    { 3, new(4, 4, 6, 16) },
                    { 4, new(5, 5, 6, 25) }
                }
            }
        };
    }
}
