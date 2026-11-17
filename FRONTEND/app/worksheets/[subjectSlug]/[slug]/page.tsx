
import { notFound } from "next/navigation";

import WorksheetGenerator from "@/app/worksheets/WorksheetGenerator";
import type { WorksheetTopic } from "@/app/worksheets/types";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    slug: string;
  }>;
}

export default async function WorksheetTopicPage({
  params,
}: PageProps) {
  const { subjectSlug, slug } = await params;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const apiUrl =
    `${API_URL}/api/WorkSheetTopic/subject/${encodeURIComponent(subjectSlug)}/${encodeURIComponent(slug)}`;

  let result;

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

    // Read response body ONLY ONCE.
    const responseText = await response.text();

    if (!response.ok) {
      console.error("Worksheet topic API failed:", {
        status: response.status,
        response: responseText,
        url: apiUrl,
      });

      if (response.status === 404) {
        notFound();
      }

      throw new Error(
        `Worksheet topic API failed: ${response.status}`
      );
    }

    // Parse the already-read response.
    result = JSON.parse(responseText);

  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_HTTP_ERROR_FALLBACK;404") {
      throw error;
    }

    console.error("Worksheet topic loading error:", error);
    throw error;
  }

  if (!result.success || !result.data) {
    notFound();
  }

  const topic: WorksheetTopic = result.data;

  return <WorksheetGenerator topic={topic} />;
}
