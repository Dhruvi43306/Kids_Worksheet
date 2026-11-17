import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WorksheetCard from "@/app/components/WorksheetCard";
import type { WorksheetTopic } from "@/app/worksheets/types";
import "@/app/index.css";
import "@/app/components/components.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function MathPage() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(
    `${API_URL}/api/WorkSheetTopic/subject/math`,
    {
      cache: "no-store",
    }
  );

if (!response.ok) {
  const errorText = await response.text();

  console.error("Math topics API failed:", {
    url: `${API_URL}/api/WorkSheetTopic/subject/math`,
    status: response.status,
    response: errorText,
  });

  throw new Error(
    `Unable to load Math topics. API returned ${response.status}: ${errorText}`
  );
}

  const result = await response.json();
  const topics: WorksheetTopic[] = result.data ?? [];

  return (
    <div className="catpage-wrapper">
      <Navbar />

      <main className="catpage math-page" style={{ "--cat-color": "#3478E8" } as React.CSSProperties}>
        {/* Hero Section */}
        <section className="catpage__hero">
          <div className="catpage__hero-ambient catpage__hero-ambient--1" aria-hidden="true" />
          <div className="catpage__hero-ambient catpage__hero-ambient--2" aria-hidden="true" />

          <div className="container catpage__hero-inner">
            <Link href="/" className="catpage__back">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>

            <div className="catpage__hero-content">
              <div className="catpage__icon-wrap">
                <span className="catpage__icon">🔢</span>
              </div>

              <div>
                <span className="catpage__eyebrow">Subject • Mathematics</span>
                <h1 className="catpage__title">Choose a Math Worksheet</h1>
                <p className="catpage__desc">
                  Select a math topic below to customize difficulty, pick question styles, and generate clean print-ready worksheets in seconds.
                </p>

                {/* <div className="catpage__meta">
                  <span className="catpage__meta-item">
                    <strong>{topics.length}</strong> Topics Available
                  </span>
                  <span className="catpage__meta-sep" />
                  <span className="catpage__meta-item">Instant 1-Click Print</span>
                  <span className="catpage__meta-sep" />
                  <span className="catpage__meta-item">Preschool to Grade 5</span>
                  <span className="catpage__meta-sep" />
                  <span className="catpage__meta-item">100% Free Access</span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="catpage__topics container">
          <div className="catpage__topics-header">
            <div>
              {/* <span className="catpage__eyebrow">Curriculum Topics</span> */}
              <h2 className="catpage__topics-title">Math Practice Topics</h2>
            </div>
            {/* <div className="catpage__topics-count-badge">
              {topics.length} Topics Ready to Print
            </div> */}
          </div>

          <div className="worksheets-grid">
            {topics.map((topic, i) => (
              <WorksheetCard
                key={topic.topicId}
                worksheet={topic}
                subjectSlug="math"
                index={i}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}