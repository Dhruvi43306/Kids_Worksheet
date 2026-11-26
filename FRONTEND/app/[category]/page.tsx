
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CategoryPageClient from "../components/CategoryPageClient";
import { categories, type Topic } from "@/lib/dummyData";

interface DatabaseTopic {
  topicId: number;
  subjectId: number;
  topicName: string;
  slug: string;
  description: string;
}

interface TopicApiResponse {
  success: boolean;
  data: DatabaseTopic[];
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const topicColors = [
  "#4F8EF7",
  "#43B89C",
  "#F4845F",
  "#AB47BC",
  "#F7C948",
  "#26C6DA",
];

const topicIcons: Record<string, string> = {
  "reading-fundamentals": "🔤",
  "reading-comprehension": "📖",
  "vocabulary-development": "🧩",
  "reading-skills-thinking": "💡",
};

async function getTopicsBySubject(subjectSlug: string): Promise<DatabaseTopic[]> {
  if (!NEXT_PUBLIC_API_URL) {
    throw new Error("API_BASE_URL is not configured in .env.local");
  }

  const response = await fetch(
    `${NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/WorkSheetTopic/subject/${encodeURIComponent(subjectSlug)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch topics for ${subjectSlug}. Status: ${response.status}`
    );
  }

  const result: TopicApiResponse = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(`Invalid topic API response for ${subjectSlug}`);
  }

  return result.data;
}

function mapDatabaseTopics(
  databaseTopics: DatabaseTopic[],
  categoryId: string
): Topic[] {
  return databaseTopics.map((topic, index) => ({
    id: String(topic.topicId),
    name: topic.topicName,
    slug: topic.slug,
    description: topic.description,
    icon: topicIcons[topic.slug] || "📚",
    worksheetCount: 0,
    grades: [],
    difficulty: [],
    categoryId,
    color: topicColors[index % topicColors.length],
  }));
}

export function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;

  const category = categories.find((item) => item.slug === slug);

  if (!category) return {};

  return {
    title: `${category.name} Worksheets — LearnSpark`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  // Fetch actual topics from the database
  const databaseTopics = await getTopicsBySubject(category.slug);

  // Convert database topics into the existing UI format
  const topics = mapDatabaseTopics(databaseTopics, category.id);

  // Preserve existing category design and update dynamic topic data
  const dynamicCategory = {
    ...category,
    topics,
    topicCount: topics.length,
  };

  return (
    <>
      <Navbar />
      <CategoryPageClient category={dynamicCategory} />
      <Footer />
    </>
  );
}
