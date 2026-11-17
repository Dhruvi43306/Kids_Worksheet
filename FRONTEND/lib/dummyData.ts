// ============================================================
// DUMMY DATA — replaces the .NET backend until API is ready
// ============================================================

export type Difficulty = "Easy" | "Medium" | "Hard" | "Mixed";
export type Grade =
  | "Preschool"
  | "Kindergarten"
  | "Grade 1"
  | "Grade 2"
  | "Grade 3"
  | "Grade 4"
  | "Grade 5";

// ─── Categories ─────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  topicCount: number;
  worksheetCount: number;
  topics: Topic[];
}

// ─── Topics ─────────────────────────────────────────────────
export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  worksheetCount: number;
  grades: Grade[];
  difficulty: Difficulty[];
  categoryId: string;
  color: string;
}

// ─── Worksheets ─────────────────────────────────────────────
export interface Worksheet {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  topicId: string;
  topicName: string;
  grades: Grade[];
  difficulty: Difficulty;
  questionCount: number;
  downloads: number;
  rating: number;
  icon: string;
  color: string;
  tags: string[];
}

// ─── Questions ───────────────────────────────────────────────
export type QuestionType =
  | "Identify"
  | "CircleOdd"
  | "CircleEven"
  | "TrueFalse"
  | "EmojiCount"
  | "ShapeCount"
  | "ObjectCount"
  | "Pattern"
  | "Sorting"
  | "Reasoning"
  | "FillBlank"
  | "MultipleChoice"
  | "MatchPairs";

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  number?: number;
  numbers?: number[];
  emoji?: string;
  count?: number;
  shape?: string;
  options?: string[];
  answer: string | string[];
  hint?: string;
}

// ─── School Details ──────────────────────────────────────────
export interface SchoolDetails {
  schoolName: string;
  studentName: string;
  grade: string;
  section: string;
  rollNumber: string;
  teacherName: string;
  date: string;
  academicYear: string;
  logoUrl?: string;
}

// ─── Categories Data ─────────────────────────────────────────
export const categories: Category[] = [
  {
    id: "math",
    name: "Math",
    slug: "math",
    description: "Build number confidence with engaging arithmetic, shapes, and logic activities.",
    icon: "🔢",
    color: "#4F8EF7",
    gradient: "linear-gradient(135deg, #4F8EF7 0%, #7B5EA7 100%)",
    topicCount: 15,
    worksheetCount: 120,
    topics: [
      { id: "math-numbers", name: "Numbers", slug: "numbers", description: "Counting, reading, and writing numbers", icon: "1️⃣", worksheetCount: 18, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "math", color: "#4F8EF7" },
      { id: "math-odd-even", name: "Odd & Even", slug: "odd-even", description: "Identify odd and even numbers through fun activities", icon: "🔀", worksheetCount: 14, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "math", color: "#7B5EA7" },
      { id: "math-addition", name: "Addition", slug: "addition", description: "Learn to add with pictures, numbers, and word problems", icon: "➕", worksheetCount: 22, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "math", color: "#43B89C" },
      { id: "math-subtraction", name: "Subtraction", slug: "subtraction", description: "Master subtraction step by step", icon: "➖", worksheetCount: 20, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "math", color: "#F4845F" },
      { id: "math-multiplication", name: "Multiplication", slug: "multiplication", description: "Times tables and multiplication strategies", icon: "✖️", worksheetCount: 16, grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "math", color: "#F7C948" },
      { id: "math-division", name: "Division", slug: "division", description: "Sharing equally and long division", icon: "➗", worksheetCount: 12, grades: ["Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium", "Hard"], categoryId: "math", color: "#EC407A" },
      { id: "math-fractions", name: "Fractions", slug: "fractions", description: "Halves, thirds, and beyond", icon: "½", worksheetCount: 10, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "math", color: "#26C6DA" },
      { id: "math-place-value", name: "Place Value", slug: "place-value", description: "Ones, tens, hundreds and thousands", icon: "📊", worksheetCount: 8, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "math", color: "#AB47BC" },
      { id: "math-shapes", name: "Shapes & Geometry", slug: "shapes", description: "2D and 3D shapes, symmetry, and patterns", icon: "🔷", worksheetCount: 11, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "math", color: "#66BB6A" },
      { id: "math-measurement", name: "Measurement", slug: "measurement", description: "Length, weight, volume, and capacity", icon: "📏", worksheetCount: 9, grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "math", color: "#FFA726" },
      { id: "math-time", name: "Time", slug: "time", description: "Reading clocks and understanding calendars", icon: "⏰", worksheetCount: 10, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "math", color: "#42A5F5" },
      { id: "math-money", name: "Money", slug: "money", description: "Counting coins and making change", icon: "💰", worksheetCount: 8, grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "math", color: "#26A69A" },
      { id: "math-patterns", name: "Patterns", slug: "patterns", description: "Recognising and extending number and shape patterns", icon: "🔁", worksheetCount: 7, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "math", color: "#EC407A" },
      { id: "math-comparing", name: "Comparing Numbers", slug: "comparing", description: "Greater than, less than, equal to", icon: "⚖️", worksheetCount: 8, grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "math", color: "#5C6BC0" },
      { id: "math-word-problems", name: "Word Problems", slug: "word-problems", description: "Solve real-world maths challenges", icon: "📝", worksheetCount: 14, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium", "Hard"], categoryId: "math", color: "#8D6E63" },
    ],
  },
  {
    id: "english",
    name: "English",
    slug: "english",
    description: "Build language skills with phonics, grammar, vocabulary and more.",
    icon: "📖",
    color: "#43B89C",
    gradient: "linear-gradient(135deg, #43B89C 0%, #26C6DA 100%)",
    topicCount: 10,
    worksheetCount: 95,
    topics: [
      { id: "eng-alphabet", name: "Alphabet", slug: "alphabet", description: "Letters, sounds, and alphabetical order", icon: "🔤", worksheetCount: 14, grades: ["Preschool", "Kindergarten"], difficulty: ["Easy"], categoryId: "english", color: "#43B89C" },
      { id: "eng-phonics", name: "Phonics", slug: "phonics", description: "Letter sounds and blends", icon: "🔊", worksheetCount: 18, grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "english", color: "#26C6DA" },
      { id: "eng-vocabulary", name: "Vocabulary", slug: "vocabulary", description: "Word meanings, synonyms, and antonyms", icon: "💬", worksheetCount: 16, grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "english", color: "#66BB6A" },
      { id: "eng-nouns", name: "Nouns", slug: "nouns", description: "Common, proper, and collective nouns", icon: "🏷️", worksheetCount: 10, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "english", color: "#FFA726" },
      { id: "eng-verbs", name: "Verbs", slug: "verbs", description: "Action words and tenses", icon: "🏃", worksheetCount: 10, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "english", color: "#EC407A" },
      { id: "eng-adjectives", name: "Adjectives", slug: "adjectives", description: "Describing words and comparisons", icon: "✨", worksheetCount: 8, grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "english", color: "#AB47BC" },
      { id: "eng-grammar", name: "Grammar", slug: "grammar", description: "Sentences, tenses, and word order", icon: "📝", worksheetCount: 12, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium", "Hard"], categoryId: "english", color: "#42A5F5" },
      { id: "eng-spelling", name: "Spelling", slug: "spelling", description: "Common words and spelling patterns", icon: "🔡", worksheetCount: 15, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "english", color: "#26A69A" },
      { id: "eng-sentences", name: "Sentences", slug: "sentences", description: "Building and punctuating sentences", icon: "💡", worksheetCount: 9, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "english", color: "#EF5350" },
      { id: "eng-punctuation", name: "Punctuation", slug: "punctuation", description: "Full stops, commas, and question marks", icon: "❓", worksheetCount: 8, grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: ["Medium"], categoryId: "english", color: "#5C6BC0" },
    ],
  },
  {
    id: "reading",
    name: "Reading",
    slug: "reading",
    description: "Strengthen comprehension with stories, characters, and reading practice.",
    icon: "📚",
    color: "#F4845F",
    gradient: "linear-gradient(135deg, #F4845F 0%, #F7C948 100%)",
    topicCount: 8,
    worksheetCount: 72,
    topics: [
      { id: "read-comprehension", name: "Reading Comprehension", slug: "comprehension", description: "Read passages and answer questions", icon: "🧠", worksheetCount: 20, grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "reading", color: "#F4845F" },
      { id: "read-stories", name: "Short Stories", slug: "short-stories", description: "Fun illustrated short stories", icon: "📖", worksheetCount: 14, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "reading", color: "#F7C948" },
      { id: "read-picture", name: "Picture Reading", slug: "picture-reading", description: "Describe and answer questions about pictures", icon: "🖼️", worksheetCount: 10, grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: ["Easy"], categoryId: "reading", color: "#EC407A" },
      { id: "read-questions", name: "Story Questions", slug: "story-questions", description: "Who, what, when, where, and why", icon: "❓", worksheetCount: 9, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "reading", color: "#AB47BC" },
      { id: "read-vocabulary", name: "Reading Vocabulary", slug: "reading-vocabulary", description: "Words in context", icon: "🔍", worksheetCount: 7, grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: ["Medium"], categoryId: "reading", color: "#42A5F5" },
      { id: "read-sequencing", name: "Sequencing", slug: "sequencing", description: "Put events in the correct order", icon: "🔢", worksheetCount: 5, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "reading", color: "#66BB6A" },
      { id: "read-main-idea", name: "Main Idea", slug: "main-idea", description: "Identify the key message of a passage", icon: "💡", worksheetCount: 4, grades: ["Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium", "Hard"], categoryId: "reading", color: "#26A69A" },
      { id: "read-characters", name: "Characters", slug: "characters", description: "Describe and compare story characters", icon: "🧒", worksheetCount: 3, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "reading", color: "#FFA726" },
    ],
  },
  {
    id: "writing",
    name: "Writing",
    slug: "writing",
    description: "Develop handwriting, creative writing, and storytelling skills.",
    icon: "✏️",
    color: "#AB47BC",
    gradient: "linear-gradient(135deg, #AB47BC 0%, #EC407A 100%)",
    topicCount: 7,
    worksheetCount: 58,
    topics: [
      { id: "write-alphabet", name: "Alphabet Writing", slug: "alphabet-writing", description: "Practice letter formation", icon: "✍️", worksheetCount: 12, grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: ["Easy"], categoryId: "writing", color: "#AB47BC" },
      { id: "write-words", name: "Word Writing", slug: "word-writing", description: "Copy and trace common words", icon: "🔤", worksheetCount: 10, grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "writing", color: "#EC407A" },
      { id: "write-sentences", name: "Sentence Writing", slug: "sentence-writing", description: "Write complete sentences", icon: "📝", worksheetCount: 8, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "writing", color: "#7B5EA7" },
      { id: "write-creative", name: "Creative Writing", slug: "creative-writing", description: "Imaginative stories and descriptions", icon: "🌈", worksheetCount: 9, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium", "Hard"], categoryId: "writing", color: "#F4845F" },
      { id: "write-story-starters", name: "Story Starters", slug: "story-starters", description: "Begin a story from a given prompt", icon: "🚀", worksheetCount: 7, grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "writing", color: "#F7C948" },
      { id: "write-picture", name: "Picture Writing", slug: "picture-writing", description: "Write about what you see", icon: "🖼️", worksheetCount: 6, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "writing", color: "#66BB6A" },
      { id: "write-handwriting", name: "Handwriting", slug: "handwriting", description: "Neat and joined handwriting practice", icon: "🖊️", worksheetCount: 6, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy"], categoryId: "writing", color: "#42A5F5" },
    ],
  },
  {
    id: "science",
    name: "Science",
    slug: "science",
    description: "Explore the natural world through plants, animals, space, and experiments.",
    icon: "🔬",
    color: "#66BB6A",
    gradient: "linear-gradient(135deg, #66BB6A 0%, #26C6DA 100%)",
    topicCount: 10,
    worksheetCount: 83,
    topics: [
      { id: "sci-plants", name: "Plants", slug: "plants", description: "Parts of a plant, growth, and life cycles", icon: "🌱", worksheetCount: 9, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "science", color: "#66BB6A" },
      { id: "sci-animals", name: "Animals", slug: "animals", description: "Animal habitats, classification, and diet", icon: "🦁", worksheetCount: 12, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "science", color: "#FFA726" },
      { id: "sci-human-body", name: "Human Body", slug: "human-body", description: "Body parts, senses, and health", icon: "🧍", worksheetCount: 8, grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "science", color: "#EC407A" },
      { id: "sci-earth", name: "Earth", slug: "earth", description: "Soil, rocks, and landforms", icon: "🌍", worksheetCount: 7, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "science", color: "#8D6E63" },
      { id: "sci-weather", name: "Weather", slug: "weather", description: "Seasons, clouds, rain, and temperature", icon: "⛅", worksheetCount: 8, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "science", color: "#42A5F5" },
      { id: "sci-space", name: "Space", slug: "space", description: "Planets, stars, and the solar system", icon: "🚀", worksheetCount: 10, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "science", color: "#5C6BC0" },
      { id: "sci-living", name: "Living & Non-Living", slug: "living-nonliving", description: "Identify living and non-living things", icon: "🌿", worksheetCount: 6, grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy"], categoryId: "science", color: "#26A69A" },
      { id: "sci-food", name: "Food", slug: "food", description: "Food groups, healthy eating, and nutrition", icon: "🍎", worksheetCount: 6, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "science", color: "#EF5350" },
      { id: "sci-water", name: "Water", slug: "water", description: "Water cycle, states of water, and conservation", icon: "💧", worksheetCount: 5, grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "science", color: "#26C6DA" },
      { id: "sci-environment", name: "Environment", slug: "environment", description: "Caring for our planet", icon: "♻️", worksheetCount: 5, grades: ["Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium"], categoryId: "science", color: "#66BB6A" },
    ],
  },
  {
    id: "puzzles",
    name: "Puzzles & Logic",
    slug: "puzzles",
    description: "Challenge young minds with creative puzzles, mazes, and brain-teasers.",
    icon: "🧩",
    color: "#F7C948",
    gradient: "linear-gradient(135deg, #F7C948 0%, #F4845F 100%)",
    topicCount: 10,
    worksheetCount: 76,
    topics: [
      { id: "puz-matching", name: "Matching", slug: "matching", description: "Match pictures, words, and numbers", icon: "🔗", worksheetCount: 10, grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: ["Easy"], categoryId: "puzzles", color: "#F7C948" },
      { id: "puz-differences", name: "Find the Difference", slug: "differences", description: "Spot what is different between two pictures", icon: "🔍", worksheetCount: 8, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "puzzles", color: "#F4845F" },
      { id: "puz-odd-one-out", name: "Odd One Out", slug: "odd-one-out", description: "Find the item that does not belong", icon: "🎯", worksheetCount: 8, grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "puzzles", color: "#EF5350" },
      { id: "puz-mazes", name: "Mazes", slug: "mazes", description: "Find the path through fun mazes", icon: "🗺️", worksheetCount: 9, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "puzzles", color: "#AB47BC" },
      { id: "puz-patterns", name: "Patterns", slug: "patterns", description: "Identify and continue visual patterns", icon: "🔁", worksheetCount: 7, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "puzzles", color: "#42A5F5" },
      { id: "puz-sorting", name: "Sorting", slug: "sorting", description: "Sort by colour, size, shape, and category", icon: "📦", worksheetCount: 6, grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: ["Easy"], categoryId: "puzzles", color: "#66BB6A" },
      { id: "puz-memory", name: "Memory", slug: "memory", description: "Memory challenges and recall activities", icon: "🧠", worksheetCount: 5, grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "puzzles", color: "#26C6DA" },
      { id: "puz-counting", name: "Counting Puzzles", slug: "counting", description: "Count and solve number-based puzzles", icon: "🔢", worksheetCount: 8, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "puzzles", color: "#FFA726" },
      { id: "puz-logic", name: "Logic Puzzles", slug: "logic", description: "Deductive reasoning and critical thinking", icon: "💡", worksheetCount: 7, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium", "Hard"], categoryId: "puzzles", color: "#5C6BC0" },
      { id: "puz-picture", name: "Picture Puzzles", slug: "picture-puzzles", description: "Visual challenges and picture-based brainteasers", icon: "🖼️", worksheetCount: 8, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "puzzles", color: "#EC407A" },
    ],
  },
  {
    id: "general-knowledge",
    name: "General Knowledge",
    slug: "general-knowledge",
    description: "Broaden horizons with fascinating facts about the world around us.",
    icon: "🌍",
    color: "#26C6DA",
    gradient: "linear-gradient(135deg, #26C6DA 0%, #66BB6A 100%)",
    topicCount: 9,
    worksheetCount: 65,
    topics: [
      { id: "gk-animals", name: "Animals", slug: "animals", description: "Wildlife, pets, and amazing creatures", icon: "🦒", worksheetCount: 10, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "general-knowledge", color: "#FFA726" },
      { id: "gk-countries", name: "Countries & Flags", slug: "countries", description: "Capitals, flags, and fascinating facts", icon: "🏳️", worksheetCount: 9, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Easy", "Medium", "Hard"], categoryId: "general-knowledge", color: "#42A5F5" },
      { id: "gk-space", name: "Space", slug: "space", description: "Planets, stars, and outer space wonders", icon: "🌌", worksheetCount: 8, grades: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"], difficulty: ["Easy", "Medium"], categoryId: "general-knowledge", color: "#5C6BC0" },
      { id: "gk-transport", name: "Transportation", slug: "transportation", description: "Vehicles, travel, and how things move", icon: "🚂", worksheetCount: 7, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy"], categoryId: "general-knowledge", color: "#EC407A" },
      { id: "gk-sports", name: "Sports", slug: "sports", description: "World sports and famous events", icon: "⚽", worksheetCount: 6, grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "general-knowledge", color: "#66BB6A" },
      { id: "gk-nature", name: "Nature", slug: "nature", description: "Forests, oceans, and amazing landscapes", icon: "🌿", worksheetCount: 7, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "general-knowledge", color: "#26A69A" },
      { id: "gk-helpers", name: "Community Helpers", slug: "community-helpers", description: "People who help us every day", icon: "👩‍⚕️", worksheetCount: 6, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy"], categoryId: "general-knowledge", color: "#EF5350" },
      { id: "gk-objects", name: "Everyday Objects", slug: "everyday-objects", description: "Things we use every day", icon: "🎒", worksheetCount: 5, grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: ["Easy"], categoryId: "general-knowledge", color: "#F7C948" },
      { id: "gk-places", name: "Famous Places", slug: "famous-places", description: "Wonders of the world and famous landmarks", icon: "🗼", worksheetCount: 7, grades: ["Grade 3", "Grade 4", "Grade 5"], difficulty: ["Medium", "Hard"], categoryId: "general-knowledge", color: "#AB47BC" },
    ],
  },
  {
    id: "arts",
    name: "Arts & Creativity",
    slug: "arts",
    description: "Unlock imagination with coloring, drawing, crafts, and creative activities.",
    icon: "🎨",
    color: "#EC407A",
    gradient: "linear-gradient(135deg, #EC407A 0%, #AB47BC 100%)",
    topicCount: 8,
    worksheetCount: 54,
    topics: [
      { id: "art-coloring", name: "Coloring", slug: "coloring", description: "Beautiful coloring pages for all levels", icon: "🖍️", worksheetCount: 12, grades: ["Preschool", "Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy"], categoryId: "arts", color: "#EC407A" },
      { id: "art-drawing", name: "Drawing", slug: "drawing", description: "Step-by-step drawing guides", icon: "✏️", worksheetCount: 9, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "arts", color: "#AB47BC" },
      { id: "art-trace", name: "Trace & Draw", slug: "trace-draw", description: "Trace shapes and pictures then draw your own", icon: "🔲", worksheetCount: 7, grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: ["Easy"], categoryId: "arts", color: "#F4845F" },
      { id: "art-complete", name: "Complete the Picture", slug: "complete-picture", description: "Finish the drawing by adding missing parts", icon: "🎭", worksheetCount: 6, grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: ["Easy", "Medium"], categoryId: "arts", color: "#F7C948" },
      { id: "art-creative", name: "Creative Activities", slug: "creative-activities", description: "Open-ended creative challenges", icon: "🌟", worksheetCount: 7, grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"], difficulty: ["Easy", "Medium"], categoryId: "arts", color: "#66BB6A" },
      { id: "art-cut-paste", name: "Cut & Paste", slug: "cut-paste", description: "Scissors skills and creative collage", icon: "✂️", worksheetCount: 5, grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: ["Easy"], categoryId: "arts", color: "#42A5F5" },
      { id: "art-craft", name: "Craft Activities", slug: "craft", description: "Step-by-step craft projects", icon: "🎪", worksheetCount: 4, grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "arts", color: "#26C6DA" },
      { id: "art-patterns", name: "Pattern Art", slug: "pattern-art", description: "Create beautiful patterns and designs", icon: "🎨", worksheetCount: 4, grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: ["Easy", "Medium"], categoryId: "arts", color: "#EF5350" },
    ],
  },
];

// ─── Popular Worksheets ──────────────────────────────────────
export const popularWorksheets: Worksheet[] = [
  { id: "ws-1", title: "Odd & Even Adventure", description: "Identify odd and even numbers through fun visual activities", categoryId: "math", categoryName: "Math", topicId: "math-odd-even", topicName: "Odd & Even", grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: "Easy", questionCount: 15, downloads: 4823, rating: 4.9, icon: "🔀", color: "#7B5EA7", tags: ["numbers", "counting", "visual"] },
  { id: "ws-2", title: "Addition Adventure", description: "Single and double digit addition with pictures and number lines", categoryId: "math", categoryName: "Math", topicId: "math-addition", topicName: "Addition", grades: ["Grade 1", "Grade 2"], difficulty: "Easy", questionCount: 20, downloads: 3971, rating: 4.8, icon: "➕", color: "#43B89C", tags: ["addition", "arithmetic", "numbers"] },
  { id: "ws-3", title: "Animal Matching Fun", description: "Match animals to their homes, sounds, and food", categoryId: "puzzles", categoryName: "Puzzles", topicId: "puz-matching", topicName: "Matching", grades: ["Kindergarten", "Grade 1", "Grade 2"], difficulty: "Easy", questionCount: 10, downloads: 3654, rating: 4.8, icon: "🦁", color: "#F7C948", tags: ["animals", "matching", "visual"] },
  { id: "ws-4", title: "Phonics Practice", description: "Letter sounds, blends, and beginning word recognition", categoryId: "english", categoryName: "English", topicId: "eng-phonics", topicName: "Phonics", grades: ["Kindergarten", "Grade 1"], difficulty: "Easy", questionCount: 12, downloads: 3289, rating: 4.7, icon: "🔊", color: "#43B89C", tags: ["phonics", "reading", "letters"] },
  { id: "ws-5", title: "Space Explorer", description: "Learn about planets, stars, and the solar system", categoryId: "science", categoryName: "Science", topicId: "sci-space", topicName: "Space", grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: "Medium", questionCount: 15, downloads: 2988, rating: 4.9, icon: "🚀", color: "#5C6BC0", tags: ["space", "planets", "science"] },
  { id: "ws-6", title: "Multiplication Magic", description: "Times tables 1–10 with visual aids and practice grids", categoryId: "math", categoryName: "Math", topicId: "math-multiplication", topicName: "Multiplication", grades: ["Grade 2", "Grade 3", "Grade 4"], difficulty: "Medium", questionCount: 25, downloads: 2756, rating: 4.7, icon: "✖️", color: "#F7C948", tags: ["multiplication", "times tables", "arithmetic"] },
  { id: "ws-7", title: "Story Reading Fun", description: "Short story with comprehension questions and vocabulary", categoryId: "reading", categoryName: "Reading", topicId: "read-stories", topicName: "Short Stories", grades: ["Grade 1", "Grade 2", "Grade 3"], difficulty: "Easy", questionCount: 8, downloads: 2543, rating: 4.8, icon: "📚", color: "#F4845F", tags: ["reading", "comprehension", "stories"] },
  { id: "ws-8", title: "Creative Coloring World", description: "Imaginative coloring scenes with hidden objects", categoryId: "arts", categoryName: "Arts", topicId: "art-coloring", topicName: "Coloring", grades: ["Preschool", "Kindergarten", "Grade 1"], difficulty: "Easy", questionCount: 5, downloads: 5102, rating: 4.9, icon: "🎨", color: "#EC407A", tags: ["coloring", "art", "creative"] },
];

// ─── Grades ──────────────────────────────────────────────────
export const grades = [
  { id: "preschool", name: "Preschool", ageRange: "3–4 years", icon: "🌟", color: "#EC407A" },
  { id: "kindergarten", name: "Kindergarten", ageRange: "4–5 years", icon: "🦋", color: "#AB47BC" },
  { id: "grade-1", name: "Grade 1", ageRange: "5–6 years", icon: "🌈", color: "#42A5F5" },
  { id: "grade-2", name: "Grade 2", ageRange: "6–7 years", icon: "🚀", color: "#43B89C" },
  { id: "grade-3", name: "Grade 3", ageRange: "7–8 years", icon: "⭐", color: "#F7C948" },
  { id: "grade-4", name: "Grade 4", ageRange: "8–9 years", icon: "🧩", color: "#F4845F" },
  { id: "grade-5", name: "Grade 5", ageRange: "9–10 years", icon: "🏆", color: "#66BB6A" },
];

// ─── ODD & EVEN DUMMY QUESTIONS ──────────────────────────────
export function generateOddEvenQuestions(
  count: number = 10,
  questionTypes: string[] = ["Mixed"],
  visualStyle: string = "Mixed"
): Question[] {
  const emojis = ["🍎", "🌟", "🐶", "🦋", "🎈", "🌸", "🍕", "⚽", "🎨", "🚀", "🐱", "🍦", "🎵", "🌍", "🏆"];
  const shapes = ["circle", "star", "heart", "triangle", "square", "diamond"];
  const objects = ["pencil", "book", "apple", "balloon", "flower"];

  const allTypes: QuestionType[] = ["Identify", "TrueFalse", "EmojiCount", "ShapeCount", "Pattern", "Sorting", "Reasoning", "CircleOdd", "CircleEven"];
  const resolvedTypes = questionTypes.includes("Mixed") ? allTypes : questionTypes as QuestionType[];

  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const type = resolvedTypes[i % resolvedTypes.length];
    const num = Math.floor(Math.random() * 20) + 1;
    const isOdd = num % 2 !== 0;

    switch (type) {
      case "Identify":
        questions.push({
          id: i + 1,
          type: "Identify",
          question: `Is ${num} odd or even?`,
          number: num,
          options: ["Odd", "Even"],
          answer: isOdd ? "Odd" : "Even",
          hint: "Think: can you share it equally into two groups?"
        });
        break;
      case "TrueFalse":
        questions.push({
          id: i + 1,
          type: "TrueFalse",
          question: `${num} is an ${isOdd ? "odd" : "even"} number. True or False?`,
          number: num,
          options: ["True", "False"],
          answer: "True",
        });
        break;
      case "EmojiCount": {
        const emoji = emojis[i % emojis.length];
        const cnt = Math.floor(Math.random() * 9) + 2;
        questions.push({
          id: i + 1,
          type: "EmojiCount",
          question: `Count the ${emoji}. Is the number odd or even?`,
          emoji,
          count: cnt,
          options: ["Odd", "Even"],
          answer: cnt % 2 !== 0 ? "Odd" : "Even",
        });
        break;
      }
      case "ShapeCount": {
        const shape = shapes[i % shapes.length];
        const cnt = Math.floor(Math.random() * 9) + 2;
        questions.push({
          id: i + 1,
          type: "ShapeCount",
          question: `Count the ${shape}s. Is the number odd or even?`,
          shape,
          count: cnt,
          options: ["Odd", "Even"],
          answer: cnt % 2 !== 0 ? "Odd" : "Even",
        });
        break;
      }
      case "Pattern": {
        const start = Math.floor(Math.random() * 5) * 2 + 1;
        const nums = [start, start + 2, start + 4, start + 6, 0];
        questions.push({
          id: i + 1,
          type: "Pattern",
          question: `Complete the pattern: ${nums.slice(0, 4).join(", ")}, ___`,
          numbers: nums.slice(0, 4),
          options: [`${start + 8}`, `${start + 7}`, `${start + 9}`, `${start + 6}`],
          answer: `${start + 8}`,
        });
        break;
      }
      case "CircleOdd":
      case "CircleEven": {
        const numSet = Array.from({ length: 6 }, () => Math.floor(Math.random() * 18) + 1);
        const targetOdd = type === "CircleOdd";
        questions.push({
          id: i + 1,
          type,
          question: `Circle all the ${targetOdd ? "ODD" : "EVEN"} numbers.`,
          numbers: numSet,
          answer: numSet.filter(n => targetOdd ? n % 2 !== 0 : n % 2 === 0).map(String),
        });
        break;
      }
      case "Sorting":
        questions.push({
          id: i + 1,
          type: "Sorting",
          question: "Sort these numbers into the correct boxes.",
          numbers: [3, 8, 15, 4, 11, 6, 7, 12],
          answer: ["3", "15", "11", "7"],
          hint: "Odd numbers cannot be divided equally into two groups."
        });
        break;
      case "Reasoning":
        questions.push({
          id: i + 1,
          type: "Reasoning",
          question: "Emma has 9 stickers. She wants to share them equally with her friend. Can she do it without any leftovers?",
          options: ["Yes, she can share equally", "No, there will be a leftover"],
          answer: "No, there will be a leftover",
          hint: "9 is an odd number — it cannot be split into two equal groups.",
        });
        break;
      default:
        questions.push({
          id: i + 1,
          type: "Identify",
          question: `Is ${num} odd or even?`,
          number: num,
          options: ["Odd", "Even"],
          answer: isOdd ? "Odd" : "Even",
        });
    }
  }
  return questions;
}

// ─── Worksheet Generator Config ───────────────────────────────
export const worksheetLevels = [
  { id: "early", label: "Early Learner", icon: "🌟", description: "Ages 4–5, very simple" },
  { id: "grade1", label: "Grade 1", icon: "🌈", description: "Ages 5–6, basic" },
  { id: "grade2", label: "Grade 2", icon: "🚀", description: "Ages 6–7, developing" },
  { id: "grade3", label: "Grade 3", icon: "⭐", description: "Ages 7–8, confident" },
];

export const worksheetDifficulties = [
  { id: "easy", label: "Easy", icon: "😊", color: "#66BB6A" },
  { id: "medium", label: "Medium", icon: "🤔", color: "#F7C948" },
  { id: "hard", label: "Hard", icon: "💪", color: "#F4845F" },
  { id: "mixed", label: "Mixed", icon: "🎲", color: "#AB47BC" },
];

export const worksheetQuestionCounts = [5, 10, 15, 20, 25];

export const worksheetVisualStyles = [
  { id: "mixed", label: "Mixed", icon: "🎲" },
  { id: "numbers", label: "Numbers", icon: "🔢" },
  { id: "emojis", label: "Emojis", icon: "😊" },
  { id: "shapes", label: "Shapes", icon: "🔷" },
  { id: "objects", label: "Objects", icon: "🎒" },
  { id: "patterns", label: "Patterns", icon: "🔁" },
];

export const worksheetQuestionTypes = [
  { id: "Mixed", label: "Mixed", icon: "🎲" },
  { id: "Identify", label: "Identify", icon: "🔍" },
  { id: "CircleOdd", label: "Circle Odd", icon: "⭕" },
  { id: "CircleEven", label: "Circle Even", icon: "⭕" },
  { id: "TrueFalse", label: "True / False", icon: "✅" },
  { id: "EmojiCount", label: "Emoji Count", icon: "😊" },
  { id: "ShapeCount", label: "Shape Count", icon: "🔷" },
  { id: "Pattern", label: "Patterns", icon: "🔁" },
  { id: "Sorting", label: "Sorting", icon: "📦" },
  { id: "Reasoning", label: "Reasoning", icon: "💡" },
];

export const defaultSchoolDetails: SchoolDetails = {
  schoolName: "",
  studentName: "",
  grade: "",
  section: "",
  rollNumber: "",
  teacherName: "",
  date: new Date().toLocaleDateString("en-GB"),
  academicYear: "2025–2026",
};

// ─── Helper functions ─────────────────────────────────────────
export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
