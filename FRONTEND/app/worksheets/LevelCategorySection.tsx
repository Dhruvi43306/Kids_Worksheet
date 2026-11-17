"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/app/index.css";
import type { LearningLevel, WorksheetCategory } from "./types";

const LEVEL_UI: { icon: string; color: string }[] = [
  { icon: "🌱", color: "#22c55e" },
  { icon: "⭐", color: "#4f8ef7" },
  { icon: "🚀", color: "#8b5cf6" },
  { icon: "🏆", color: "#f59e0b" },
  { icon: "💎", color: "#ec4899" },
  { icon: "🔥", color: "#ef4444" },
];

const CATEGORY_CODE_ICONS: Record<string, string> = {
  objects: "🖼️",
  pictures: "🖼️",
  "number-line": "📏",
  numberline: "📏",
  mental: "🧠",
  "number-bonds": "🔢",
  numberbonds: "🔢",
  doubles: "✌️",
  "missing-addends": "❓",
  missingaddends: "❓",
  columns: "➕",
  "word-problems": "💬",
  wordproblems: "💬",
  comparison: "⚖️",
  comparing: "⚖️",
  reasoning: "💡",
  games: "🎮",
  activities: "🎨",
  patterns: "🔁",
  sorting: "📦",
  shapes: "🔷",
  fractions: "½",
  measurement: "📏",
  time: "⏰",
  money: "💰",
  "place-value": "📊",
  placevalue: "📊",
};

const FALLBACK_ICONS = ["📚", "✏️", "🔍", "📝", "🌟", "💫", "🎯", "🧩"];

function getCategoryIcon(
  code: string | null | undefined,
  index: number,
): string {
  const safeCode = code ?? "";

  const lower = safeCode.toLowerCase().replace(/\s+/g, "-");

  for (const key of Object.keys(CATEGORY_CODE_ICONS)) {
    if (lower.includes(key)) {
      return CATEGORY_CODE_ICONS[key];
    }
  }

  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

const QT_ICONS = [
  "🔍",
  "✅",
  "⭕",
  "🔄",
  "📦",
  "💡",
  "🎲",
  "😊",
  "🔷",
  "📝",
  "🧩",
  "⚡",
  "🌈",
  "🎯",
  "🔢",
  "🖼️",
];

function getQtIcon(index: number): string {
  return QT_ICONS[index % QT_ICONS.length];
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      delay: i * 0.05,
      ease: "easeOut" as const,
    },
  }),
};

const collapseVariants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: "easeOut" as const,
    },
  },

  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.18,
      ease: "easeIn" as const,
    },
  },
};

interface Props {
  levels: LearningLevel[];
  selectedLevelId: number;
  loadingLevels: boolean;
  onLevelSelect: (levelId: number) => void;
  categories: WorksheetCategory[];
  loadingCategories: boolean;
  error: string | null;
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number) => void;
  selectedQuestionTypeIds: number[];
  onToggle: (questionTypeId: number) => void;
  onSetQuestionTypeIds: (categoryId: number, ids: number[]) => void;
}

interface CategoryCardProps {
  cat: WorksheetCategory;
  catIndex: number;
  selectedCategoryId: number | null;
  selectedQuestionTypeIds: number[];
  onCategorySelect: (categoryId: number) => void;
  onToggle: (id: number) => void;
  onSetQuestionTypeIds: (categoryId: number, ids: number[]) => void;
  allSelectedIds: number[];
}

function CategoryCard({
  cat,
  catIndex,
  selectedCategoryId,
  selectedQuestionTypeIds,
  onCategorySelect,
  onToggle,
  onSetQuestionTypeIds,
  allSelectedIds,
}: CategoryCardProps) {
  const [open, setOpen] = useState(false);
  const icon = getCategoryIcon(cat.code, catIndex);
  const catQtIds = (cat.questionTypes ?? []).map((qt) => qt.questionTypeId);
  const selectedInCat = catQtIds.filter((id) =>
    selectedQuestionTypeIds.includes(id),
  );
  const selCount = selectedInCat.length;
  const allSelected = selCount === catQtIds.length && catQtIds.length > 0;
  const hasSelection = selCount > 0;
  const categorySelected = selectedCategoryId === cat.worksheetCategoryId;

  function handleSelectAll() {
    if (allSelected) {
      const next = allSelectedIds.filter((id) => !catQtIds.includes(id));

      onSetQuestionTypeIds(cat.worksheetCategoryId, next);

      return;
    }

    const next = Array.from(new Set([...allSelectedIds, ...catQtIds]));

    onSetQuestionTypeIds(cat.worksheetCategoryId, next);
  }

  return (
    <motion.div
      className={`lcs__cat-card${hasSelection ? " lcs__cat-card--active" : ""}${
        categorySelected ? " lcs__cat-card--category-selected" : ""
      }`}
      custom={catIndex}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ======================================================
          CATEGORY HEADER
      ====================================================== */}

      <button
        type="button"
        className="lcs__cat-card-header"
        onClick={() => {
          onCategorySelect(cat.worksheetCategoryId);

          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-controls={`cat-body-${cat.worksheetCategoryId}`}
      >
        <span className="lcs__cat-icon-wrap" aria-hidden="true">
          {icon}
        </span>

        <span className="lcs__cat-info">
          <span className="lcs__cat-name">{cat.categoryName}</span>

          <span className="lcs__cat-meta">
            <span className="lcs__cat-count">
              {cat.questionTypes.length}{" "}
              {cat.questionTypes.length === 1 ? "activity" : "activities"}
            </span>

            {hasSelection && (
              <motion.span
                className="lcs__cat-badge"
                key={selCount}
                initial={{
                  scale: 0.7,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
              >
                {selCount} selected
              </motion.span>
            )}
          </span>
        </span>

        <span
          className={`lcs__cat-chevron${open ? " lcs__cat-chevron--open" : ""}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {/* ======================================================
          QUESTION TYPES
      ====================================================== */}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`cat-body-${cat.worksheetCategoryId}`}
            className="lcs__cat-body"
            variants={collapseVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="lcs__cat-body-inner">
              {/* SELECT ALL */}
              <div className="lcs__cat-select-row">
                <button
                  type="button"
                  className={`lcs__cat-select-all${
                    allSelected ? " lcs__cat-select-all--deselect" : ""
                  }`}
                  onClick={handleSelectAll}
                  aria-label={
                    allSelected
                      ? `Deselect all in ${cat.categoryName}`
                      : `Select all in ${cat.categoryName}`
                  }
                >
                  {allSelected ? "✕ Deselect all" : "✓ Select all"}
                </button>
              </div>

              {/* QUESTION TYPE LIST */}
              {cat.questionTypes.map((qt, qtIndex) => {
                const selected = selectedQuestionTypeIds.includes(
                  qt.questionTypeId,
                );

                const qtIcon = getQtIcon(qtIndex);

                return (
                  <motion.button
                    key={qt.questionTypeId}
                    type="button"
                    className={`lcs__qt-card${
                      selected ? " lcs__qt-card--selected" : ""
                    }`}
                    onClick={() => {
                      onCategorySelect(cat.worksheetCategoryId);

                      onToggle(qt.questionTypeId);
                    }}
                    aria-pressed={selected}
                    initial={{
                      opacity: 0,
                      x: -6,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: qtIndex * 0.04,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      x: 2,
                      transition: {
                        duration: 0.12,
                      },
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    <span className="lcs__qt-icon" aria-hidden="true">
                      {qtIcon}
                    </span>

                    <span className="lcs__qt-text">
                      <span className="lcs__qt-name">{qt.typeName}</span>

                      {qt.description && (
                        <span className="lcs__qt-desc">{qt.description}</span>
                      )}
                    </span>

                    <span className="lcs__qt-check" aria-hidden="true">
                      {selected ? "✓" : ""}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LevelSkeleton() {
  return (
    <div className="lcs__level-grid">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="wg__skeleton lcs__skel-level" />
      ))}
    </div>
  );
}

function CategorySelectionSkeleton() {
  return (
    <div className="lcs__cat-grid">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="wg__skeleton lcs__skel-cat" />
      ))}
    </div>
  );
}

export default function LevelCategorySection({
  levels,
  selectedLevelId,
  loadingLevels,
  onLevelSelect,

  categories,
  loadingCategories,
  error,

  selectedCategoryId,
  onCategorySelect,

  selectedQuestionTypeIds,
  onToggle,
  onSetQuestionTypeIds,
}: Props) {
  const totalSelected = selectedQuestionTypeIds.length;

  return (
    <>
      {/* ======================================================
          LEVEL SECTION
      ====================================================== */}

      <div className="lcs__level-wrap">
        <div className="lcs__section-head">
          <h3 className="lcs__section-title">Learning Level</h3>
        </div>

        <p className="lcs__section-hint">
          Choose the grade or level that matches your learner.
        </p>

        {loadingLevels && <LevelSkeleton />}

        {!loadingLevels && levels.length === 0 && (
          <p className="lcs__section-hint">No levels available.</p>
        )}

        {!loadingLevels && levels.length > 0 && (
          <div className="lcs__level-grid">
            {levels.map((level, i) => {
              const ui = LEVEL_UI[i % LEVEL_UI.length];

              const selected = selectedLevelId === level.levelId;

              const ageLabel =
                level.minAge != null && level.maxAge != null
                  ? `Ages ${level.minAge}–${level.maxAge}`
                  : null;

              return (
                <motion.button
                  key={level.levelId}
                  type="button"
                  className={`lcs__level-card${
                    selected ? " lcs__level-card--selected" : ""
                  }`}
                  style={
                    {
                      "--lc-color": ui.color,
                    } as React.CSSProperties
                  }
                  onClick={() => onLevelSelect(level.levelId)}
                  aria-pressed={selected}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -3,
                    transition: {
                      duration: 0.16,
                    },
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  <span className="lcs__level-icon" aria-hidden="true">
                    {ui.icon}
                  </span>

                  <span className="lcs__level-name">{level.levelName}</span>

                  {ageLabel && (
                    <span className="lcs__level-age">{ageLabel}</span>
                  )}

                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        className="lcs__level-check"
                        initial={{
                          scale: 0,
                          opacity: 0,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                        }}
                        exit={{
                          scale: 0,
                          opacity: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 18,
                        }}
                        aria-hidden="true"
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <span className="lcs__level-stripe" aria-hidden="true" />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================
          CATEGORY SECTION
      ====================================================== */}

      <div className="lcs__cat-wrap">
        <div className="lcs__cat-header">
          <div
            className="lcs__section-head"
            style={{
              marginBottom: 0,
            }}
          >
            <h3 className="lcs__section-title">Choose What to Practise</h3>
          </div>

          {totalSelected > 0 && (
            <motion.span
              className="lcs__cat-total"
              key={totalSelected}
              initial={{
                scale: 0.75,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 18,
              }}
            >
              {totalSelected} selected
            </motion.span>
          )}
        </div>

        <p
          className="lcs__section-hint"
          style={{
            marginTop: 6,
          }}
        >
          Open a practice area and pick the activities you want.
        </p>

        {/* ERROR */}
        {error && !loadingCategories && (
          <motion.div
            className="wg__error"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <span className="wg__error-icon">⚠️</span>

            <p className="wg__error-title">Unable to load activities</p>

            <p className="wg__error-msg">{error}</p>
          </motion.div>
        )}

        {/* LOADING */}
        {loadingCategories && !error && <CategorySelectionSkeleton />}

        {/* EMPTY */}
        {!loadingCategories && !error && categories.length === 0 && (
          <motion.div
            className="lcs__empty"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <span className="lcs__empty-icon">📚</span>

            <p className="lcs__empty-title">More practice is coming soon</p>

            <p className="lcs__empty-msg">
              We don&apos;t have activities configured for this level yet.
            </p>
          </motion.div>
        )}

        {/* CATEGORY GRID */}
        {!loadingCategories && !error && categories.length > 0 && (
          <div className="lcs__cat-grid">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.worksheetCategoryId}
                cat={cat}
                catIndex={i}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={onCategorySelect}
                selectedQuestionTypeIds={selectedQuestionTypeIds}
                onToggle={onToggle}
                onSetQuestionTypeIds={onSetQuestionTypeIds}
                allSelectedIds={selectedQuestionTypeIds}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function SummaryCategoryList({
  categories,
  selectedQuestionTypeIds,
}: {
  categories: WorksheetCategory[];
  selectedQuestionTypeIds: number[];
}) {
  const activeCategories = categories.filter((cat) =>
    cat.questionTypes.some((qt) =>
      selectedQuestionTypeIds.includes(qt.questionTypeId),
    ),
  );

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <div className="lcs__summary-cats">
      {activeCategories.map((cat) => (
        <div key={cat.worksheetCategoryId} className="lcs__summary-cat-row">
          <span className="lcs__summary-cat-dot" aria-hidden="true" />

          <span>{cat.categoryName}</span>
        </div>
      ))}
    </div>
  );
}
