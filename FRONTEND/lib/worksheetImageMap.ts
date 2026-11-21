
export interface WorksheetImage {
  src: string;
  title: string;
}

interface CategoryImageConfig {
  folder?: string;
  images: readonly string[];
}

interface TopicImageConfig {
  folder: string;
  aliases?: string[];
  categories: Record<string, CategoryImageConfig>;
}

interface SubjectImageConfig {
  aliases?: string[];
  defaultTopic?: string;
  topics: Record<string, TopicImageConfig>;
}

// =====================================================
// ADDITION IMAGES
// public/Addition/c1/a11.jpg
// =====================================================

const ADDITION_CATEGORIES: Record<string, CategoryImageConfig> = {
  c1: {
    images: [
      "a11.jpg",
      "a12.jpg",
      "a13.jpeg",
      "a14.webp",
      "a15.jpg",
      "a16.jpeg",
      "a17.webp",
    ],
  },

  c2: {
    images: [
      "a21.jpeg",
      "a22.jpg",
      "a23.png",
      "a24.jpeg",
      "a25.jpg",
      "a26.jpeg",
      "a27.jpeg",
    ],
  },

  c3: {
    images: ["a31.png", "a32.jpg"],
  },

  c4: {
    images: [
      "a41.jpg",
      "a42.png",
      "a43.jpg",
      "a45.jpg",
      "a46.jpg",
      "a47.jpg",
      "a48.jpg",
    ],
  },

  c5: {
    images: [
      "a51.jpeg",
      "a52.jpeg",
      "a53.jpg",
      "a54.jpeg",
      "a55.jpeg",
      "a56.jpg",
      "a57.jpg",
    ],
  },

  c6: {
    images: [
      "a61.jpg",
      "a62.jpeg",
      "a63.jpeg",
      "a64.jpeg",
      "a65.jpeg",
      "a66.jpeg",
      "a67.jpg",
      "a68.jpg",
      "a69.jpg",
    ],
  },

  c7: {
    images: [
      "a71.jpeg",
      "a72.jpeg",
      "a73.jpeg",
      "a74.jpeg",
      "a75 (2).jpeg",
      "a76.jpeg",
      "a77.jpeg",
      "a78.jpeg",
    ],
  },

  c8: {
    images: [
      "a81.jpeg",
      "a82.jpeg",
      "a83.jpeg",
      "a85.jpg",
      "a86.jpg",
      "a87.jpg",
      "a84.jpg",
    ],
  },

  c9: {
    images: [
      "a91.jpeg",
      "a92.jpeg",
      "a93.jpeg",
      "a94.jpeg",
      "a95.jpeg",
      "a96.jpeg",
      "a97.jpeg",
    ],
  },

  c10: {
    images: [
      "a101.jpeg",
      "a102.jpeg",
      "a103.jpeg",
      "a105.jpg",
      "a106.jpg",
      "a107.jpg",
      "a104.jpg",
    ],
  },

  c11: {
    images: [
      "a111.png",
      "a112.png",
      "a113.png",
      "a114.jpeg",
      "a115.jpg",
      "a116.jpg",
      "a117.jpg",
    ],
  },

  c12: {
    images: [
      "a121.jpeg",
      "a122.png",
      "a123.png",
      "a124.png",
      "a125.webp",
      "a126.jpg",
      "a127.jpg",
      "a128.jpg",
      "a129.jpg",
    ],
  },

  c13: {
    images: [
      "a131.jpeg",
      "a132.jpg",
      "a133.jpeg",
      "a134.jpg",
      "a135.jpg",
      "a136.png",
      "a137.jpg",
    ],
  },

  c14: {
    images: [
      "a141.webp",
      "a142.jpeg",
      "a143.jpeg",
      "a144.jpeg",
      "a146.jpg",
      "a147.jpg",
      "a148.jpg",
      "a144.jpg",
      "a145.jpg",
    ],
  },
};


const SUBTRACTION_CATEGORIES: Record<string, CategoryImageConfig> = {
  c1: {
    images: [
      "s11.jpeg",
      "s12.jpeg",
      "s13.jpeg",
      "s14.jpeg",
    ],
  },

  // Add actual Subtraction filenames here.
  // Do not copy Addition filenames.

  c2: {
    images: [
      "s21.jpeg",
      "s22.jpeg",
      "s23.jpeg",
      "s24.jpeg",
      "s25.jpeg"
    ],
  },

  c3: {
    images: [
      "s31.jpeg",
      "s32.jpeg",
      "s33.jpeg",
      "s34.jpeg",
      "s35.jpeg"
    ],
  },

  c4: {
    images: [
      "s41.jpeg",
      "s42.jpeg",
      "s43.jpeg",
      "s44.jpeg",
      "s45.jpeg",
      "s46.jpeg"
    ],
  },

  c5: {
    images: [
      "s51.jpeg",
      "s52.jpeg",
      "s53.jpeg",
      "s54.jpeg",
    
    ],
  },

  c6: {
    images: [],
  },

  c7: {
    images: [
      "s71.jpeg",
      "s72.jpeg",
      "s73.jpeg",
      "s74.jpeg",
      "s75.jpeg",
      "s76.jpeg",
      "s77.jpeg",
      "s78.jpeg",
      "s79.jpeg"
    ],
  },

  c8: {
    images: [
      "s81.jpeg",
      "s82.jpeg",
      "s83.jpeg",
   
    ],
  },

  c9: {
    images: [],
  },

  c10: {
    images: [],
  },

  c11: {
    images: [
      "s111.jpeg",
      "s112.jpeg",
      "s113.jpeg",
      "s114.jpeg",
     
    ],
  },

  c12: {
    images: [
      "s121.jpeg",
      "s122.jpeg",
      "s123.jpeg",
      "s124.jpeg",
      "s125.jpeg",
      "s126.jpeg"
    ],
  },

  c13: {
    images: [
      "s131.jpeg",
      "s132.jpeg",
      "s133.jpeg",
      "s134.jpeg",
      "s135.jpeg",
      "s136.jpeg"
    ],
  },
    c14: {
    images: [
      "s141.jpeg",
      "s142.jpeg",
      "s143.jpeg",
      "s144.jpeg",
      "s145.jpeg",
      "s146.jpeg"
    ],
  },
  c15: {
    images: [
      "s151.jpeg",
      "s152.jpeg",
      "s153.jpeg",
      "s154.jpeg",
   
    ],
  },
  c16: {
    images: [
      "s161.jpeg",
      "s162.jpeg",
      "s163.jpeg",
      "s164.jpeg",
      "s165.jpeg",
      "s166.jpeg"
    ],
  },
};

const ODDEVEN_CATEGORIES: Record<string, CategoryImageConfig> = {
  c1: {
    images: [
      "oe11.jpeg",
      "oe12.jpeg",
      "oe13.jpeg",
    ],
  },
  c2: { 
    images: [
      "oe21.jpeg",
      "oe22.jpeg",
      "oe23.jpeg",] },
  c3: { 
    images: [
      "oe31.jpeg"
    ] 
  },
  c4: { 
    images: [
      "oe41.jpeg",
      "oe42.jpeg",
      "oe43.jpeg",
      "oe44.jpeg"
    ] 
  },
  c5: { images: [] },
  c6: { images: [] },
  c7: { images: [] },
  c8: { images: [] },
  c9: { 
    images: [
      "oe91.jpeg",
      "oe92.jpeg",
      "oe93.jpeg",
      "oe94.jpeg",
      "oe95.jpeg",
      "oe96.jpeg"
    ] 
  },
  c10: { 
    images: [
      "oe102.jpeg",
      "oe101.jpeg",
      "oe103.jpeg",
      "oe104.jpeg",
      "oe105.jpeg",
      
    ] },
  c11: { 
    images: [
      "oe111.jpeg",
      "oe112.jpeg",
      "oe113.jpeg",
    ] },
  c12: { 
    images: [
      "oe121.jpeg",
      "oe122.jpeg",
    ] 
  },
  c13: {
     images: [
      "oe131.jpeg",
      "oe132.jpeg",
     ] 
    },
  c14: { 
    images: [
      "oe141.jpeg",
      "oe142.jpeg",
      "oe143.jpeg",
    ] 
  },
  c15: { 
    images: [
      "oe151.jpeg",
      "oe152.jpeg",
      "oe153.jpeg",
      "oe154.jpeg",
      "oe155.jpeg",
    
    ] 
  },
  c16: { 
    images: [
      "oe161.jpeg"
    ] 
  },
  c17: { images: [] },
  c18: { 
    images: [
      "oe181.jpeg",
      "oe182.jpeg",
      "oe183.jpeg",
      "oe184.jpeg",
      "oe185.jpeg",
  ] },
};

const MULTIPLICATION_CATEGORIES: Record<string, CategoryImageConfig> = {
  c1: {
    images: [
      "m11.jpeg",
      "m12.jpeg",
     
    ],
  },
  c2: { 
    images: [
      "m21.jpeg",
      "m22.jpeg",
      "m23.jpeg",
      "m24.jpeg",
      "m25.jpeg",
      "m26.jpeg"
      
    ] },
  c3: { 
    images: [
      "m31.jpeg",
      "m32.jpeg",
      "m33.jpeg",
      "m34.jpeg"
    ] 
  },
  c4: { 
    images: [
      "m41.jpeg",
      "m42.jpeg",
      
    ] 
  },
  c5: { 
    images: [
      "m51.jpeg",
      "m52.jpeg",
    ] 
  },
  c6: { 
    images: [
      "m61.jpeg",
      "m62.jpeg",
      "m63.jpeg",
      "m64.jpeg"
    ] 
  },
  c7: { 
    images: [

    ] 
  },
  c8: { 
    images: [
      "m81.jpeg",
      "m82.jpeg",
      "m83.jpeg",
      "m84.jpeg",
      "m85.jpeg"
    ] 
  },
  c9: { 
    images: [
      "m91.jpeg",
      "m92.jpeg",
     
    ] },
  c10: { images: [
      "m101.jpeg",
      "m102.jpeg",
      "m103.jpeg",
      "m104.jpeg",
      "m105.jpeg"
  ] 
},
  c11: { images: [] },
  c12: { 
    images: [
      "m121.jpeg",
      "m122.jpeg",
      "m123.jpeg",
      "m124.jpeg",
      "m125.jpeg"
    ] },
};
const DIVISION_CATEGORIES: Record<string, CategoryImageConfig> = {
  c1: {
    images: [
      "d11.jpeg",
      "d12.jpeg",
      "d13.jpeg",
      "d14.jpeg",
      "d15.jpeg"
    ],
  },

  // Add actual filenames when available.
  c2: { 
    images: [
      "d21.jpeg",
      "d22.jpeg",
      "d23.jpeg",
      "d24.jpeg",
      "d25.jpeg"
    ] },
  c3: { 
    images: [
      "d31.jpeg",
      "d32.jpeg",
      "d33.jpeg",
      "d34.jpeg",
    ] 
  },
  c4: { 
    images: [
      "d41.jpeg",
      "d42.jpeg",
      "d43.jpeg",
      "d44.jpeg",
      
    ] },
  c5: { 
    images: [
      "d51.jpeg",
    
    ] },
  c6: { images: [
      "d61.jpeg",
      "d62.jpeg",
      "d63.jpeg",
  ] },
  c7: { 
    images: [
      "d71.jpeg",
      "d72.jpeg",
      "d73.jpeg",
      "d74.jpeg",
      "d75.jpeg",
      "d76.jpeg",
      "d77.jpeg",
      
  ] },
  c8: { 
    images: [
     
    ] },
  c9: { images: [
     "d91.jpeg",
      "d92.jpeg",
      "d93.jpeg",
      "d94.jpeg",
      "d95.jpeg",
      "d96.jpeg"
  ] },
  c10: { images: [
      "d101.jpeg",
      "d102.jpeg",
      "d103.jpeg",
      "d104.jpeg",
      "d105.jpeg",
      
  ] },
  c11: { images: [] },
  c12: { images: [
      "d121.jpeg",
      "d122.jpeg",
      "d123.jpeg",
      "d124.jpeg",
      "d125.jpeg",
      "d126.jpeg"
  ] },
  
};
// =====================================================
// SUBJECT AND TOPIC CONFIGURATION
// =====================================================

const WORKSHEET_IMAGE_MAP: Record<string, SubjectImageConfig> = {
  math: {
    aliases: ["mathematics"],

    defaultTopic: "addition",

    topics: {
      addition: {
        aliases: ["add", "addition with fun"],

        folder: "Addition",

        categories: ADDITION_CATEGORIES,
      },

      subtraction: {
        aliases: ["subtract", "substraction", "minus"],

        folder: "Substraction",

        categories: SUBTRACTION_CATEGORIES,
      },
     odd_even: {
    aliases: [
    "Odd_Even",
    "Odd & Even",
    "Odd & Even Numbers",
    "Identify Odd & Even",
    "Identify Odd and Even",
    "Odd and Even Numbers",
  ],

  folder: "Odd_Even",

  categories: ODDEVEN_CATEGORIES,
},
Multiplication:{
   aliases: [
    "Multiplication Advanced",
    "Multiplication",
    "Multiply",
  ],
  folder:"Multiplication",
  categories:MULTIPLICATION_CATEGORIES
},
Division:{
  folder:"Division",
  categories:DIVISION_CATEGORIES
}
    },
  },

  // Add English, Science, etc. as separate subjects here.
};

// =====================================================
// NORMALIZE
// =====================================================

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

// =====================================================
// NORMALIZE CATEGORY
// c1, C1, 1, Category 1
// =====================================================

function normalizeCategoryCode(value: string): string {
  const normalized = normalize(value);

  const match = normalized.match(/^(?:category|c)?(\d+)$/);

  return match ? `c${match[1]}` : normalized;
}

// =====================================================
// GET SUBJECT
// =====================================================

function getSubjectConfig(
  subjectName: string
): SubjectImageConfig | undefined {
  const normalized = normalize(subjectName);

  return Object.entries(WORKSHEET_IMAGE_MAP).find(
    ([key, config]) =>
      normalize(key) === normalized ||
      config.aliases?.some(
        alias => normalize(alias) === normalized
      )
  )?.[1];
}

// =====================================================
// GET TOPIC
//
// Supports:
// getTopicConfig("Mathematics", "Addition")
// getTopicConfig("Mathematics", "Subtraction")
// getTopicConfig("Subtraction")
// =====================================================

function getTopicConfig(
  subjectName: string,
  topicName?: string
): TopicImageConfig | undefined {
  // Direct topic lookup when subjectName itself is
  // Addition or Subtraction.
  const directName = normalize(subjectName);

  for (const subject of Object.values(WORKSHEET_IMAGE_MAP)) {
    const directTopic = Object.entries(subject.topics).find(
      ([key, topic]) =>
        normalize(key) === directName ||
        topic.aliases?.some(
          alias => normalize(alias) === directName
        )
    );

    if (directTopic) {
      return directTopic[1];
    }
  }

  const subject = getSubjectConfig(subjectName);

  if (!subject) {
    return undefined;
  }

  // If topic is not supplied, use default topic.
  if (!topicName?.trim()) {
    return subject.defaultTopic
      ? subject.topics[subject.defaultTopic]
      : undefined;
  }

  const normalizedTopic = normalize(topicName);

  return Object.entries(subject.topics).find(
    ([key, topic]) =>
      normalize(key) === normalizedTopic ||
      topic.aliases?.some(
        alias => normalize(alias) === normalizedTopic
      )
  )?.[1];
}

// =====================================================
// FIND CATEGORY
// =====================================================

function getCategory(
  categories: Record<string, CategoryImageConfig>,
  categoryCode: string
): [string, CategoryImageConfig] | undefined {
  const normalized = normalizeCategoryCode(categoryCode);

  return Object.entries(categories).find(
    ([key]) => normalizeCategoryCode(key) === normalized
  );
}

// =====================================================
// BUILD IMAGE URL
// Supports nested paths and filenames with spaces.
// =====================================================

function buildImageUrl(
  topicFolder: string,
  categoryFolder: string,
  filename: string
): string {
  const path = [
    topicFolder,
    categoryFolder,
    filename,
  ]
    .flatMap(part => part.replace(/\\/g, "/").split("/"))
    .filter(Boolean)
    .map(part => encodeURIComponent(part))
    .join("/");

  return `/${path}`;
}

// =====================================================
// GET WORKSHEET IMAGES
//
// getWorksheetImages("Mathematics", "c1", "Addition")
// getWorksheetImages("Mathematics", "c1", "Subtraction")
// =====================================================

export function getWorksheetImages(
  subjectName: string,
  categoryCode: string,
  topicName?: string
): WorksheetImage[] {
  if (!subjectName?.trim() || !categoryCode?.trim()) {
    return [];
  }

  const topic = getTopicConfig(subjectName, topicName);

  if (!topic) {
    return [];
  }

  const category = getCategory(
    topic.categories,
    categoryCode
  );

  if (!category) {
    return [];
  }

  const [categoryKey, config] = category;

  const categoryFolder = config.folder ?? categoryKey;

  return config.images.map((filename, index) => ({
    src: buildImageUrl(
      topic.folder,
      categoryFolder,
      filename
    ),

    title: `${topicName || subjectName} Worksheet ${index + 1}`,
  }));
}

// =====================================================
// GET AVAILABLE CATEGORIES
// =====================================================

export function getWorksheetCategories(
  subjectName: string,
  topicName?: string
): string[] {
  const topic = getTopicConfig(subjectName, topicName);

  if (!topic) {
    return [];
  }

  return Object.entries(topic.categories)
    .filter(([, config]) => config.images.length > 0)
    .map(([category]) => category);
}

// =====================================================
// CHECK LOCAL IMAGES
// =====================================================

export function hasLocalImages(
  subjectName: string,
  categoryCode: string,
  topicName?: string
): boolean {
  return getWorksheetImages(
    subjectName,
    categoryCode,
    topicName
  ).length > 0;
}

// =====================================================
// CHECK TOPIC
// =====================================================

export function hasWorksheetTopic(
  subjectName: string,
  topicName?: string
): boolean {
  return Boolean(getTopicConfig(subjectName, topicName));
}
