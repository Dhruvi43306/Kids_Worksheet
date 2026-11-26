
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText } from "lucide-react";
import type { Topic } from "@/lib/dummyData";
import "@/app/components/components.css";

interface Props {
  topic: Topic;
  categorySlug: string;
  index?: number;
}

export default function TopicCard({
  topic,
  categorySlug,
  index = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut",
      }}
    >
      <Link
        href={`/worksheets/${categorySlug}/${topic.slug}`}
        className="topic-card"
        style={
          { "--topic-color": topic.color } as React.CSSProperties
        }
      >
        <motion.div
          className="topic-card__inner"
          whileHover={{
            y: -4,
            boxShadow: "var(--shadow-hover)",
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 22,
          }}
        >
          <div className="topic-card__top">
            <div className="topic-card__icon-wrap">
              <span className="topic-card__icon">
                {topic.icon}
              </span>
            </div>

            <motion.div
              className="topic-card__arrow"
              initial={{ x: 0, opacity: 0.5 }}
              whileHover={{ x: 3, opacity: 1 }}
            >
              <ArrowRight size={16} />
            </motion.div>
          </div>

          <h3 className="topic-card__name">
            {topic.name}
          </h3>

          <p className="topic-card__desc">
            {topic.description}
          </p>

          <div className="topic-card__footer">
            {topic.worksheetCount > 0 && (
              <span className="topic-card__count">
                <FileText size={13} />
                {topic.worksheetCount} worksheets
              </span>
            )}

            {topic.grades.length > 0 && (
              <div className="topic-card__grades">
                {topic.grades.slice(0, 2).map((grade) => (
                  <span
                    key={grade}
                    className="topic-card__grade-tag"
                  >
                    {grade
                      .replace("Grade ", "G")
                      .replace("Kindergarten", "K")
                      .replace("Preschool", "Pre")}
                  </span>
                ))}

                {topic.grades.length > 2 && (
                  <span className="topic-card__grade-tag topic-card__grade-more">
                    +{topic.grades.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
