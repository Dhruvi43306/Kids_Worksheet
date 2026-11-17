"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/lib/dummyData";
import TopicCard from "./TopicCard";
import "@/app/components/components.css";

interface Props {
  category: Category;
}

export default function CategoryPageClient({ category }: Props) {
  const [query, setQuery] = useState("");

  const filtered = category.topics.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main
      className="catpage"
      style={{ "--cat-color": category.color } as React.CSSProperties}
    >
      <section className="catpage__hero">
        <div className="catpage__hero-bg" />
        <div className="container catpage__hero-inner">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="catpage__back">
              <ArrowLeft size={16} /> Home
            </Link>
          </motion.div>

          <div className="catpage__hero-content">
            <motion.div
              className="catpage__icon-wrap"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <span className="catpage__icon">{category.icon}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="catpage__eyebrow">Subject</span>
              <h1 className="catpage__title">{category.name}</h1>
              <p className="catpage__desc">{category.description}</p>

              <div className="catpage__meta">
                <span className="catpage__meta-item">
                  <strong>{category.topicCount}</strong> Topics
                </span>
                <span className="catpage__meta-sep" />
                <span className="catpage__meta-item">
                  <strong>{category.worksheetCount}+</strong> Worksheets
                </span>
                <span className="catpage__meta-sep" />
                <span className="catpage__meta-item">All Grade Levels</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="catpage__topics container">
        <div className="catpage__topics-header">
          <h2 className="catpage__topics-title">Choose a Topic</h2>

          <div className="catpage__search">
            <Search size={16} className="catpage__search-icon" />
            <input
              type="search"
              placeholder={`Search ${category.name} topics...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="catpage__search-input"
              aria-label={`Search ${category.name} topics`}
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="catpage__topics-grid">
            {filtered.map((topic, i) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                categorySlug={category.slug}
                index={i}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="catpage__empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="catpage__empty-icon">🧩</span>
            <h3>No topics found</h3>
            <p>Try a different search term.</p>
          </motion.div>
        )}
      </section>
    </main>
  );
}
