"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import "@/app/index.css";
import "@/app/worksheets/worksheet-generator.css";
import DifficultySection from "@/app/worksheets/DifficultySection";
import QuestionCountSection from "@/app/worksheets/QuestionCountSection";
import VisualStyleSection from "@/app/worksheets/VisualStyleSection";
import LoadingDots from "@/app/worksheets/LoadingDots";
import LevelCategorySection, {
  SummaryCategoryList,
} from "@/app/worksheets/LevelCategorySection";
import type {
  Difficulty,
  LearningLevel,
  QuestionCountOption,
  QuestionType,
  VisualStyle,
  WorksheetCategory,
  WorksheetConfig,
  WorksheetTopic,
} from "./types";

interface WorksheetGeneratorProps {
  topic: WorksheetTopic;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WORKSHEET_OPTIONS_URL = `${API_URL}/api/WorksheetGeneratorOptions`;
const LEARNING_LEVEL_URL = `${API_URL}/api/LearningLevel`;
const WORKSHEET_CATEGORY_URL = `${API_URL}/api/WorksheetCategory`;

const difficultyUI = [
  { icon: "😊", color: "#4F8CFF" },
  { icon: "🤔", color: "#8B5CF6" },
  { icon: "💪", color: "#F59E0B" },
  { icon: "🎲", color: "#10B981" },
];
const exploreCards = [
  {
    icon: "🖼️",
    title: "Adding with Pictures",
    desc: "Learn addition visually using colourful objects and pictures.",
  },
  {
    icon: "📏",
    title: "Number Lines Addition",
    desc: "Jump along number lines to practise adding step by step.",
  },
  {
    icon: "🔢",
    title: "Missing Addends",
    desc: "Fill in the missing number to complete each addition equation.",
  },
];
const STEPS = [
  { label: "Level" },
  { label: "Practice" },
  { label: "Difficulty" },
  { label: "Questions" },
  { label: "Style" },
];
function getArrayData<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray((result as { data?: unknown })?.data))
    return (result as { data: T[] }).data;
  return [];
}

function fadeUpTransition(delay = 0) {
  return { duration: 0.45, delay, ease: "easeOut" as const };
}
export default function WorksheetGenerator({ topic }: WorksheetGeneratorProps) {
  const router = useRouter();
  const eyebrow = "Fun & Easy Learning";
  const heroNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [difficulty, setDifficulty] = useState<Difficulty[]>([]);
  const [visualStyle, setVisualStyle] = useState<VisualStyle[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [questionCount, setQuestionCount] = useState<QuestionCountOption[]>([]);

  const [config, setConfig] = useState<WorksheetConfig>({
    topicId: topic.topicId,
    levelId: 1,
    categoryId: null,
    difficultyId: null,
    questionCountOptionId: null,
    visualStyleId: null,
    questionTypeIds: [],
  });

  const [configurationId, setConfigurationId] = useState<number | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<LearningLevel[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [rawCategories, setRawCategories] = useState<WorksheetCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [groupedCategories, setGroupedCategories] = useState<
    WorksheetCategory[]
  >([]);
  const loadWorksheetOptions = useCallback(
    async (topicId: number, levelId: number) => {
      try {
        setLoadingOptions(true);
        setError(null);
        setDifficulty([]);
        setVisualStyle([]);
        setQuestionTypes([]);
        setQuestionCount([]);
        setConfigurationId(null);
        setConfig((prev) => ({
          ...prev,
          topicId,
          levelId,
          categoryId: null,
          difficultyId: null,
          questionCountOptionId: null,
          visualStyleId: null,
          questionTypeIds: [],
        }));

        const response = await fetch(
          `${WORKSHEET_OPTIONS_URL}?topicId=${topicId}&levelId=${levelId}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch worksheet options: ${response.status}`,
          );
        }

        const result = await response.json();

        if (!result?.success || !result?.data) {
          throw new Error(
            result?.message || "No worksheet options found for this level.",
          );
        }

        const data = result.data;

        setConfigurationId(data.topicLevelConfigurationId ?? null);
        setDifficulty(data.difficulties ?? []);
        setVisualStyle(data.visualStyles ?? []);
        setQuestionTypes(data.questionTypes ?? []);
        setQuestionCount(data.questionCounts ?? []);
      } catch (err) {
        console.error("Error loading worksheet options:", err);
        setError("Unable to load worksheet options. Please try again.");
      } finally {
        setLoadingOptions(false);
      }
    },
    [],
  );

  const handleCategorySelect = useCallback((categoryId: number) => {
    setConfig((prev) => ({
      ...prev,
      categoryId,
      // questionTypeIds: [],
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchLevels() {
      setLoadingLevels(true);
      try {
        const res = await fetch(LEARNING_LEVEL_URL);
        if (!res.ok) throw new Error("Failed to fetch learning levels");
        const data = await res.json();
        if (!cancelled) {
          const sorted = getArrayData<LearningLevel>(data)
            .filter((l) => l.isActive === undefined || l.isActive)
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
          setLevels(sorted);
        }
      } catch (err) {
        console.error("Error fetching learning levels:", err);
      } finally {
        if (!cancelled) setLoadingLevels(false);
      }
    }
    void fetchLevels();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      setLoadingCategories(true);

      try {
        const url =
          `${WORKSHEET_CATEGORY_URL}` +
          `?topicId=${topic.topicId}` +
          `&levelId=${config.levelId}`;

        console.log("Fetching Worksheet Categories:", url);

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();

          console.error("WorksheetCategory API error:", res.status, errorText);

          throw new Error(`WorksheetCategory API failed: ${res.status}`);
        }

        const data = await res.json();

        console.log("WorksheetCategory API response:", data);

        if (cancelled) {
          return;
        }

        const categories = getArrayData<WorksheetCategory>(data).sort(
          (a, b) => (a.displayorder ?? 0) - (b.displayorder ?? 0),
        );

        console.log("Categories with QuestionTypes:", categories);

        setRawCategories(categories);
        setGroupedCategories(categories);
      } catch (err) {
        console.error("Error fetching worksheet categories:", err);

        if (!cancelled) {
          setRawCategories([]);
          setGroupedCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    if (topic.topicId > 0 && config.levelId > 0) {
      void fetchCategories();
    }

    return () => {
      cancelled = true;
    };
  }, [topic.topicId, config.levelId]);
  useEffect(() => {
    loadWorksheetOptions(topic.topicId, 1);
  }, [topic.topicId, loadWorksheetOptions]);

  const handleLevelSelect = useCallback(
    (levelId: number) => {
      loadWorksheetOptions(topic.topicId, levelId);
    },
    [topic.topicId, loadWorksheetOptions],
  );

  const handleDifficultySelect = (difficultyId: number) =>
    setConfig((prev) => ({ ...prev, difficultyId }));

  const handleVisualStyleSelect = (visualStyleId: number) =>
    setConfig((prev) => ({ ...prev, visualStyleId }));

  const handleQuestionCountSelect = (questionCountOptionId: number) =>
    setConfig((prev) => ({ ...prev, questionCountOptionId }));
  const toggleQuestionType = useCallback((questionTypeId: number) => {
    setConfig((prev) => {
      const exists = prev.questionTypeIds.includes(questionTypeId);

      return {
        ...prev,
        questionTypeIds: exists
          ? prev.questionTypeIds.filter((id) => id !== questionTypeId)
          : [...prev.questionTypeIds, questionTypeId],
      };
    });
  }, []);
  const setQuestionTypeIds = useCallback(
    (categoryId: number, ids: number[]) => {
      setConfig((prev) => ({
        ...prev,
        categoryId,
        questionTypeIds: ids,
      }));
    },
    [],
  );
  const handleGenerate = async () => {
    if (!config.levelId) {
      alert("Please select a level.");
      return;
    }
    if (!configurationId) {
      alert("No worksheet configuration found for this level.");
      return;
    }
    if (!config.difficultyId) {
      alert("Please select a difficulty.");
      return;
    }
    if (!config.questionCountOptionId) {
      alert("Please select number of questions.");
      return;
    }
    if (config.questionTypeIds.length === 0) {
      alert("Please select at least one question type.");
      return;
    }
    if (!config.categoryId) {
      alert("Please select a category.");
      return;
    }
    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const selectedCount = questionCount.find(
      (item) => item.questionCountOptionId === config.questionCountOptionId,
    );

    const params = new URLSearchParams({
      topicId: String(config.topicId),
      levelId: String(config.levelId),
      worksheetCategoryId: String(config.categoryId),
      configurationId: String(configurationId),
      difficultyId: String(config.difficultyId),
      questionCountOptionId: String(config.questionCountOptionId),
      questionCount: String(selectedCount?.questionCount ?? 0),
      visualStyleId: String(config.visualStyleId ?? ""),
      questionTypeIds: config.questionTypeIds.join(","),
    });
    console.log({
      topicId: config.topicId,
      levelId: config.levelId,
      worksheetCategoryId: config.categoryId,
      configurationId,
      difficultyId: config.difficultyId,
      questionCount: selectedCount?.questionCount,
      visualStyleId: config.visualStyleId,
      questionTypeIds: config.questionTypeIds,
    });
    router.push(`/worksheet?${params.toString()}`);
  };

  const selectedDifficulty = difficulty.find(
    (d) => d.difficultyId === config.difficultyId,
  );
  const selectedCount = questionCount.find(
    (c) => c.questionCountOptionId === config.questionCountOptionId,
  );
  const selectedStyle = visualStyle.find(
    (v) => v.visualStyleId === config.visualStyleId,
  );
  const selectedLevel = levels.find((l) => l.levelId === config.levelId);

  const stepsDone = [
    config.levelId > 0,
    config.questionTypeIds.length > 0,
    config.difficultyId !== null,
    config.questionCountOptionId !== null,
    config.visualStyleId !== null,
  ];
  const currentStep = stepsDone.findIndex((done) => !done);
  const activeMobileStep = currentStep === -1 ? STEPS.length : currentStep + 1;

  return (
    <main className="wg">
      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section className="wg__hero">
        <div className="wg__hero-bg" />
        <div className="wg__hero-inner">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38 }}
          >
            <Link href="/math" className="wg__back">
              <ArrowLeft size={14} className="wg__back-icon" />
              Back to Math
            </Link>
          </motion.div>

          <div className="wg__hero-layout">
            {/* Text column */}
            <div className="wg__hero-text">
              <motion.span
                className="wg__eyebrow"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fadeUpTransition(0.05)}
              >
                ✨ {eyebrow}
              </motion.span>

              <motion.h1
                className="wg__title"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fadeUpTransition(0.12)}
              >
                {topic.topicName}
              </motion.h1>

              <motion.p
                className="wg__desc"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fadeUpTransition(0.18)}
              >
                {topic.description}
              </motion.p>

              <motion.div
                className="wg__pills"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fadeUpTransition(0.24)}
              >
                {selectedLevel && (
                  <span className="wg__pill">🎓 {selectedLevel.levelName}</span>
                )}
                <span className="wg__pill">📄 {topic.topicName}</span>
                <span className="wg__pill">🖨️ Printable</span>
              </motion.div>
            </div>

            {/* Decorative number cloud */}
            <div className="wg__deco" aria-hidden="true">
              {heroNumbers.map((n, i) => (
                <motion.span
                  key={`${n}-${i}`}
                  className="wg__deco-num"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 0.85],
                    scale: 1,
                    y: [0, -6, 0],
                    rotate: [0, i % 2 === 0 ? 6 : -6, 0],
                  }}
                  transition={{
                    opacity: {
                      duration: 0.5,
                      delay: i * 0.06,
                      times: [0, 0.4, 1],
                    },
                    scale: {
                      duration: 0.5,
                      delay: i * 0.06,
                      type: "spring",
                      stiffness: 280,
                    },
                    y: {
                      duration: 3 + (i % 3) * 0.8,
                      delay: i * 0.12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: 4 + (i % 4) * 0.6,
                      delay: i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  whileHover={{ scale: 1.25, rotate: 0 }}
                >
                  {n}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          BUILDER CARD
      ════════════════════════════════════════════════════ */}
      <section className="wg__builder">
        <div className="wg__builder-inner">
          <motion.div
            className="wg__card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* ── Card header ──────────────────────────── */}
            <div className="wg__card-header">
              <h2 className="wg__card-title">
                <Sparkles size={22} style={{ color: "var(--wg-primary)" }} />
                Build Your Worksheet
              </h2>
              <p className="wg__card-sub">
                Choose your level, pick practice activities, and create a
                worksheet that&apos;s perfect for your learner.
              </p>

              {/* Desktop 5-step progress */}
              <div className="wg__progress" role="list">
                {STEPS.map((step, i) => {
                  const done = stepsDone[i];
                  const active = !done && (i === 0 || stepsDone[i - 1]);
                  return (
                    <div
                      key={step.label}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <motion.div
                        role="listitem"
                        className={`wg__progress-step${done ? " wg__progress-step--done" : active ? " wg__progress-step--active" : ""}`}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <span className="wg__progress-num">
                          {done ? "✓" : String(i + 1).padStart(2, "0")}
                        </span>
                        {step.label}
                      </motion.div>
                      {i < STEPS.length - 1 && (
                        <span className="wg__progress-arrow" aria-hidden="true">
                          ›
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile progress */}
              <div className="wg__progress-mobile" aria-live="polite">
                Step{" "}
                <strong>
                  {Math.min(activeMobileStep, STEPS.length)} of {STEPS.length}
                </strong>
                {" — "}
                {STEPS[Math.min(activeMobileStep - 1, STEPS.length - 1)]?.label}
              </div>
            </div>

            {/* ── Card body ────────────────────────────── */}
            <div className="wg__card-body">
              {/* Top-level error banner */}
              {error && (
                <motion.div
                  className="wg__error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="wg__error-icon">⚠️</span>
                  <p className="wg__error-title">Something went wrong</p>
                  <p className="wg__error-msg">{error}</p>
                </motion.div>
              )}

              {/* ── Step 1+2: Level selector + Categories ── */}
              <LevelCategorySection
                levels={levels}
                selectedLevelId={config.levelId}
                loadingLevels={loadingLevels}
                onLevelSelect={handleLevelSelect}
                categories={groupedCategories}
                loadingCategories={loadingOptions || loadingCategories}
                error={null}
                selectedCategoryId={config.categoryId}
                onCategorySelect={handleCategorySelect}
                selectedQuestionTypeIds={config.questionTypeIds}
                onToggle={toggleQuestionType}
                onSetQuestionTypeIds={setQuestionTypeIds}
              />

              {/* ── Step 3: Difficulty ──────────────────── */}
              <DifficultySection
                difficulty={difficulty}
                selectedId={config.difficultyId}
                loading={loadingOptions}
                ui={difficultyUI}
                onSelect={handleDifficultySelect}
              />

              {/* ── Step 4: Question Count ──────────────── */}
              <QuestionCountSection
                questionCount={questionCount}
                selectedId={config.questionCountOptionId}
                onSelect={handleQuestionCountSelect}
              />

              {/* ── Step 5: Visual Style ────────────────── */}
              <VisualStyleSection
                visualStyles={visualStyle}
                selectedId={config.visualStyleId}
                isLoading={loadingOptions}
                onSelect={handleVisualStyleSelect}
              />

              {/* ── Summary + CTA ───────────────────────── */}
              <div
                className="wg__section"
                style={{
                  borderBottom: "none",
                  paddingBottom: 0,
                  marginBottom: 0,
                }}
              >
                <div className="wg__summary">
                  <div className="wg__summary-title">
                    <Sparkles
                      size={16}
                      style={{ color: "var(--wg-primary)" }}
                    />
                    Your Worksheet
                  </div>

                  <div className="wg__summary-topic">{topic.topicName}</div>

                  <div className="wg__summary-chips">
                    {/* Level */}
                    {selectedLevel ? (
                      <span className="wg__summary-chip">
                        🎓 {selectedLevel.levelName}
                      </span>
                    ) : (
                      <span className="wg__summary-chip wg__summary-chip--placeholder">
                        🎓 Level
                      </span>
                    )}

                    {/* Difficulty */}
                    {selectedDifficulty ? (
                      <span className="wg__summary-chip">
                        🎯 {selectedDifficulty.name}
                      </span>
                    ) : (
                      <span className="wg__summary-chip wg__summary-chip--placeholder">
                        🎯 Difficulty
                      </span>
                    )}

                    {/* Question count */}
                    {selectedCount ? (
                      <span className="wg__summary-chip">
                        📝 {selectedCount.questionCount} Questions
                      </span>
                    ) : (
                      <span className="wg__summary-chip wg__summary-chip--placeholder">
                        📝 Questions
                      </span>
                    )}

                    {/* Visual style */}
                    {selectedStyle ? (
                      <span className="wg__summary-chip">
                        🎨 {selectedStyle.name}
                      </span>
                    ) : (
                      <span className="wg__summary-chip wg__summary-chip--placeholder">
                        🎨 Style
                      </span>
                    )}

                    {/* Question types */}
                    {config.questionTypeIds.length > 0 ? (
                      <span className="wg__summary-chip">
                        🧩 {config.questionTypeIds.length} Type
                        {config.questionTypeIds.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="wg__summary-chip wg__summary-chip--placeholder">
                        🧩 Activities
                      </span>
                    )}
                  </div>

                  {/* Practice areas derived from selected question types */}
                  {groupedCategories.length > 0 &&
                    config.questionTypeIds.length > 0 && (
                      <SummaryCategoryList
                        categories={groupedCategories}
                        selectedQuestionTypeIds={config.questionTypeIds}
                      />
                    )}

                  <motion.button
                    className="wg__cta"
                    style={{ marginTop: 20 }}
                    onClick={handleGenerate}
                    disabled={generating || loadingOptions || !configurationId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {generating ? (
                      <span className="wg__cta-loading">
                        <LoadingDots />
                        Creating your worksheet…
                      </span>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Create My Worksheet
                      </>
                    )}
                  </motion.button>

                  <div className="wg__trust">
                    {["Free", "No sign-in required", "Printable PDF"].map(
                      (item) => (
                        <span key={item} className="wg__trust-item">
                          <span className="wg__trust-check">✓</span>
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="wg__explore">
        <div className="wg__explore-inner">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
          >
            <p className="wg__explore-eyebrow">Keep Learning</p>
            <h2 className="wg__explore-title">Explore More Worksheets</h2>
          </motion.div>

          <div className="wg__explore-grid">
            {exploreCards.map((card, i) => (
              <motion.div
                key={card.title}
                className="wg__explore-card"
                role="button"
                tabIndex={0}
                aria-label={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -3, scale: 1.01 }}
              >
                <span className="wg__explore-card-icon">{card.icon}</span>
                <div className="wg__explore-card-title">{card.title}</div>
                <div className="wg__explore-card-desc">{card.desc}</div>
                <div className="wg__explore-card-arrow">→</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {generating && (
          <motion.div
            className="wg__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="wg__overlay-card"
              initial={{ scale: 0.88, y: 32 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 32 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className="wg__overlay-floats" aria-hidden="true">
                {["⭐", "✏️", "🔢", "🧩", "🌟"].map((icon, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -14, 0], opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 1.6,
                      delay: i * 0.18,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {icon}
                  </motion.span>
                ))}
              </div>

              <div className="wg__overlay-ring" aria-hidden="true">
                <span className="wg__overlay-spark">✨</span>
              </div>

              <h2 className="wg__overlay-title">Creating your worksheet</h2>
              <p className="wg__overlay-sub">
                We&apos;re putting together something fun for you…
              </p>

              <div className="wg__overlay-dots" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="wg__overlay-dot"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 0.9,
                      delay: i * 0.22,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
