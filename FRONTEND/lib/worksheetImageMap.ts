
export interface WorksheetImage {
  src: string;
  title: string;
}

type CategoryImageMap = Record<string, readonly string[]>;

interface SubjectImageConfig {
  folder: string;
  categories: CategoryImageMap;
}

const WORKSHEET_IMAGE_MAP: Record<string, SubjectImageConfig> = {
  math: {
    folder: "Addition",
    categories: {
      c1: [
        "a11.jpg",
        "a12.jpg",
        "a13.jpeg",
        "a14.webp",
        "a15.jpg",
        "a16.jpeg",
        "a17.webp",
      ],
      c2: [
        "a21.jpeg",
        "a22.jpg",
        "a23.png",
        "a24.jpeg",
        "a25.jpg",
        "a26.jpeg",
        "a27.jpeg",
      ],
      c3: ["a31.png", "a32.jpg"],
      c4: [
        "a41.jpg",
        "a42.png",
        "a43.jpg",
        "a45.jpg",
        "a46.jpg",
        "a47.jpg",
        "a48.jpg",
      ],
      c5: [
        "a51.jpeg",
        "a52.jpeg",
        "a53.jpg",
        "a54.jpeg",
        "a55.jpeg",
        "a56.jpg",
        "a57.jpg",
      ],
      c6: [
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
      c7: [
        "a71.jpeg",
        "a72.jpeg",
        "a73.jpeg",
        "a74.jpeg",
        "a75 (2).jpeg",
        "a76.jpeg",
        "a77.jpeg",
        "a78.jpeg",
      ],
      c8: [
        "a81.jpeg",
        "a82.jpeg",
        "a83.jpeg",
        "a85.jpg",
        "a86.jpg",
        "a87.jpg",
        "a84.jpg",
      ],
      c9: [
        "a91.jpeg",
        "a92.jpeg",
        "a93.jpeg",
        "a94.jpeg",
        "a95.jpeg",
        "a96.jpeg",
        "a97.jpeg",
      ],
      c10: [
        "a101.jpeg",
        "a102.jpeg",
        "a103.jpeg",
        "a105.jpg",
        "a106.jpg",
        "a107.jpg",
        "a104.jpg",
      ],
      c11: [
        "a111.png",
        "a112.png",
        "a113.png",
        "a114.jpeg",
        "a115.jpg",
        "a116.jpg",
        "a117.jpg",
      ],
      c12: [
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
      c13: [
        "a131.jpeg",
        "a132.jpg",
        "a133.jpeg",
        "a134.jpg",
        "a135.jpg",
        "a136.png",
        "a137.jpg",
      ],
      c14: [
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
  },
};

// =====================================================
// NORMALIZE VALUES
// Supports:
// Math, Mathematics, Addition, addition
// =====================================================

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

// =====================================================
// GET SUBJECT CONFIGURATION
//
// Database topic names supported:
// Math
// Mathematics
// Addition
//
// All three use the Addition image folder.
// =====================================================

function getSubjectConfig(
  subjectName: string
): SubjectImageConfig | undefined {
  const normalized = normalize(subjectName);

  const aliases: Record<string, string> = {
    math: "math",
    mathematics: "math",
    addition: "math",
  };

  const subjectKey = aliases[normalized] ?? normalized;

  return WORKSHEET_IMAGE_MAP[subjectKey];
}

// =====================================================
// NORMALIZE CATEGORY CODE
//
// Supports:
// C1
// c1
// Category 1
// category1
// =====================================================

function normalizeCategoryCode(categoryCode: string): string {
  const value = normalize(categoryCode);

  const categoryMatch = value.match(/^(?:category)?(\d+)$/);

  return categoryMatch ? `c${categoryMatch[1]}` : value;
}

// =====================================================
// GET WORKSHEET IMAGES
//
// Example:
// getWorksheetImages("Addition", "c1")
//
// Returns:
// [
//   {
//     src: "/Addition/c1/a11.jpg",
//     title: "Addition Worksheet 1"
//   }
// ]
// =====================================================

export function getWorksheetImages(
  subjectName: string,
  categoryCode: string
): WorksheetImage[] {
  if (!subjectName?.trim() || !categoryCode?.trim()) {
    return [];
  }

  const subject = getSubjectConfig(subjectName);

  if (!subject) {
    return [];
  }

  const normalizedCategory = normalizeCategoryCode(categoryCode);

  const categoryKey = Object.keys(subject.categories).find(
    (key) => normalizeCategoryCode(key) === normalizedCategory
  );

  if (!categoryKey) {
    return [];
  }

  const filenames = subject.categories[categoryKey];

  return filenames.map((filename, index) => ({
    src: `/${subject.folder}/${categoryKey}/${encodeURIComponent(filename)}`,
    title: `${subjectName} Worksheet ${index + 1}`,
  }));
}

// =====================================================
// GET AVAILABLE CATEGORIES
// =====================================================

export function getWorksheetCategories(
  subjectName: string
): string[] {
  const subject = getSubjectConfig(subjectName);

  if (!subject) {
    return [];
  }

  return Object.keys(subject.categories).filter(
    (category) => subject.categories[category].length > 0
  );
}

// =====================================================
// CHECK LOCAL IMAGES
// =====================================================

export function hasLocalImages(
  subjectName: string,
  categoryCode: string
): boolean {
  return getWorksheetImages(subjectName, categoryCode).length > 0;
}
