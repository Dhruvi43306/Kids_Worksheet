"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Star, ArrowRight } from "lucide-react";

import type { Worksheet } from "@/lib/dummyData";
import type { WorksheetTopic } from "@/app/worksheets/types";

import "@/app/components/components.css";

type WorksheetCardData = Worksheet | WorksheetTopic;

interface Props {
  worksheet: WorksheetCardData;
  index?: number;
  subjectSlug?: string;
}

const difficultyColors: Record<string, string> = {
  Easy: "#10B981",
  Medium: "#F59E0B",
  Hard: "#F43F5E",
  Mixed: "#8B5CF6",
};

/* -----------------------------------------
   Topic Presets for Database Topics
----------------------------------------- */
const TOPIC_PRESETS: Record<
  string,
  { icon: string; color: string; bg: string; border: string; badge: string }
> = {
  "odd-even": {
    icon: "🔀",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    badge: "Odd & Even",
  },
  addition: {
    icon: "➕",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    badge: "Addition",
  },
  subtraction: {
    icon: "➖",
    color: "#22C55E",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    badge: "Subtraction",
  },
  multiplication: {
    icon: "✖️",
    color: "#8B5CF6",
    bg: "#EDE9FE",
    border: "#C4B5FD",
    badge: "Multiplication",
  },
  division: {
    icon: "➗",
    color: "#FB923C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    badge: "Division",
  },
  numbers: {
    icon: "1️⃣",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    badge: "Numbers",
  },
  fractions: {
    icon: "½",
    color: "#06B6D4",
    bg: "#ECFEFF",
    border: "#A5F3FC",
    badge: "Fractions",
  },
  shapes: {
    icon: "🔷",
    color: "#22C55E",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    badge: "Shapes",
  },
  measurement: {
    icon: "📏",
    color: "#FB923C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    badge: "Measurement",
  },
  time: {
    icon: "⏰",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    badge: "Time",
  },
  money: {
    icon: "💰",
    color: "#22C55E",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    badge: "Money",
  },
  patterns: {
    icon: "🔁",
    color: "#8B5CF6",
    bg: "#EDE9FE",
    border: "#C4B5FD",
    badge: "Patterns",
  },
};

/* -----------------------------------------
   Type guard
----------------------------------------- */
function isDummyWorksheet(
  worksheet: WorksheetCardData
): worksheet is Worksheet {
  return "title" in worksheet;
}

export default function WorksheetCard({
  worksheet,
  index = 0,
  subjectSlug = "math",
}: Props) {
  const isDummy = isDummyWorksheet(worksheet);

  const title = isDummy ? worksheet.title : worksheet.topicName;
  const description = worksheet.description;

  const slug = isDummy ? createSlug(worksheet.title) : worksheet.slug;

  const preset = !isDummy
    ? TOPIC_PRESETS[slug.toLowerCase()] || {
        icon: "📝",
        color: "#3478E8",
        bg: "#EAF4FF",
        border: "#D2E4FC",
        badge: "Worksheet",
      }
    : null;

  const icon = isDummy ? worksheet.icon : preset!.icon;
  const color = isDummy ? worksheet.color : preset!.color;
  // const difficulty = isDummy ? worksheet.difficulty : "";
  const categoryName = isDummy ? worksheet.categoryName : subjectSlug;

  // const diffColor = isDummy
  //    difficultyColors[difficulty] ?? "#10B981"
  //   : color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        margin: "-40px",
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      className="ws-card-wrapper"
    >
      <Link
        href={`/worksheets/${subjectSlug}/${slug}`}
        className="ws-card"
        style={
          {
            "--ws-color": color,
          } as React.CSSProperties
        }
      >
        <div
          className="ws-card__inner"
          style={{
            borderColor: preset ? preset.border : "#E8EEF5",
          }}
        >
          {/* Header area */}
          <div className="ws-card__header">
            <div
              className="ws-card__icon-wrap"
              style={{
                backgroundColor: preset ? preset.bg : "#F8FAFC",
                borderColor: preset ? preset.border : "#E8EEF5",
              }}
            >
              <span className="ws-card__icon">{icon}</span>
            </div>

            <div className="ws-card__badge-wrap">
              {/* <span
                className="ws-card__difficulty"
                style={{
                  backgroundColor: preset ? preset.bg : "#F8FAFC",
                  color: diffColor,
                  border: `1px solid ${preset ? preset.border : "#E2E8F0"}`,
                }}
              >
                {difficulty}
              </span> */}
            </div>
          </div>

          {/* Category Chip */}
          <span
            className="ws-card__category"
            style={{
              color: color,
              backgroundColor: preset ? preset.bg : "#F8FAFC",
              border: `1px solid ${preset ? preset.border : "#E2E8F0"}`,
            }}
          >
            {categoryName}
          </span>

          {/* Title & description */}
          <h3 className="ws-card__title">{title}</h3>
          <p className="ws-card__desc">{description}</p>

          {/* Grades for dummy worksheets */}
          {isDummy && worksheet.grades && (
            <div className="ws-card__grades">
              {worksheet.grades.map((g: any) => (
                <span key={g} className="ws-card__grade">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Footer with action */}
          {/* <div className="ws-card__footer">
            {isDummy ? (
              <>
                <span className="ws-card__rating">
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  <span>{worksheet.rating}</span>
                </span>

                <span className="ws-card__downloads">
                  <Download size={12} />
                  <span>{worksheet.downloads.toLocaleString()}</span>
                </span>
              </>
            ) : (
              <span
                className="ls-sheet-action-btn ls-sheet-action-btn--primary"
                 style={{ backgroundColor: color }}
              >
                <span>Create Worksheet</span>
                <ArrowRight size={14} className="ws-card__cta-arrow" />
              </span>
            )}
          </div> */}
        </div>
      </Link>
    </motion.div>
  );
}

/* -----------------------------------------
   Create slug for old dummy data
----------------------------------------- */
function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}