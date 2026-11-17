// ============================================================
// API LAYER — currently uses dummy data
// Replace implementations with fetch() calls to the .NET backend
// ============================================================

import {
  categories,
  popularWorksheets,
  grades,
  generateOddEvenQuestions,
  getCategoryBySlug,
  type Category,
  type Worksheet,
  type Question,
} from "./dummyData";

// ─── Base config (future .NET API) ────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Categories ──────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  // Future: return fetch(`${API_BASE}/api/categories`).then(r => r.json());
  return Promise.resolve(categories);
}

export async function getCategoryTopics(categorySlug: string) {
  // Future: return fetch(`${API_BASE}/api/topics/${categorySlug}`).then(r => r.json());
  const cat = getCategoryBySlug(categorySlug);
  return Promise.resolve(cat?.topics ?? []);
}

// ─── Worksheets ───────────────────────────────────────────────
export async function getPopularWorksheets(): Promise<Worksheet[]> {
  // Future: return fetch(`${API_BASE}/api/worksheets?popular=true`).then(r => r.json());
  return Promise.resolve(popularWorksheets);
}

export async function getGrades() {
  return Promise.resolve(grades);
}

// ─── Worksheet generation ─────────────────────────────────────
export interface GenerateConfig {
  topic: string;
  level: string;
  difficulty: string;
  questionCount: number;
  visualStyle: string;
  questionTypes: string[];
}

export async function generateWorksheet(config: GenerateConfig): Promise<Question[]> {
  // Future: return fetch(`${API_BASE}/api/worksheets/generate`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(config),
  // }).then(r => r.json());
  //
  // Simulate a small network delay for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 1800));
  return generateOddEvenQuestions(config.questionCount, config.questionTypes, config.visualStyle);
}
