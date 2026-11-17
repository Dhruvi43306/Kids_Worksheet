import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CategoryPageClient from "../components/CategoryPageClient";
import { categories } from "@/lib/dummyData";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({params,}: {params: Promise<{ category: string }>;}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.name} Worksheets — LearnSpark`,
    description: category.description,
  };
}

export default async function CategoryPage({params,}: {params: Promise<{ category: string }>;}) {
  const { category: slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <Navbar />
      <CategoryPageClient category={category} />
      <Footer />
    </>
  );
}
