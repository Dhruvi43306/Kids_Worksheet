
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  Printer,
  X,
} from "lucide-react";

import "@/app/components/components.css";
import { useRouter } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

// =====================================================
// API RESPONSE TYPES
// =====================================================

type ApiEnvelope<T> = {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  data?: T;
  Data?: T;
  errors?: string[];
  Errors?: string[];
};

// =====================================================
// SUBJECT
// =====================================================

interface Subject {
  subjectId: number;
  subjectName: string;
  slug: string;
  topics: Topic[];
}

// =====================================================
// TOPIC
// =====================================================

interface Topic {
  topicId: number;
  topicName: string;
  slug: string;
  description?: string | null;
}

// =====================================================
// TOPIC OPTIONS
// =====================================================

interface TopicOptions {
  topicId: number;
  topicName: string;
  levels: LevelOption[];
}

interface LevelOption {
  topicLevelConfigurationId: number;
  levelId: number;
  levelName: string;
  displayOrder: number;
  difficulties: DifficultyOption[];
}

interface DifficultyOption {
  difficultyId: number;
  difficultyName: string;
  displayOrder: number;
}

// =====================================================
// WORKSHEET
// =====================================================

interface Worksheet {
  preGeneratedWorksheetId: number;
  worksheetTitle: string;
  worksheetUrl: string;
  thumbnailUrl?: string | null;
  fileType: string;
  displayOrder: number;

  // These two values are derived from the selected
  // database filters, not hardcoded worksheet data.
  levelName?: string;
  difficultyName?: string;
}

// =====================================================
// PAGE STAGE
// =====================================================

type Stage = "subjects" | "topicOptions" | "worksheets";

// =====================================================
// API GET HELPER
// Supports both raw API responses and ResponceDto wrappers.
// =====================================================

async function apiGet<T>(endpoint: string): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured in .env.local."
    );
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new Error(
      `API returned invalid JSON (${response.status}).`
    );
  }

  const object =
    typeof json === "object" && json !== null && !Array.isArray(json)
      ? (json as Record<string, unknown>)
      : null;

  if (!response.ok) {
    const errors = object?.Errors ?? object?.errors;

    const errorMessage =
      Array.isArray(errors) && errors.length > 0
        ? errors.join("; ")
        : String(
            object?.detail ??
              object?.Detail ??
              object?.message ??
              object?.Message ??
              object?.title ??
              object?.Title ??
              `API request failed (${response.status}).`
          );

    throw new Error(errorMessage);
  }

  if (object) {
    const isEnvelope =
      "success" in object ||
      "Success" in object ||
      "data" in object ||
      "Data" in object ||
      "errors" in object ||
      "Errors" in object;

    if (isEnvelope) {
      const envelope = json as ApiEnvelope<T>;

      const success = envelope.success ?? envelope.Success;

      if (success === false) {
        const errors = envelope.errors ?? envelope.Errors ?? [];

        throw new Error(
          errors.length
            ? errors.join("; ")
            : envelope.message ??
                envelope.Message ??
                "API request failed."
        );
      }

      const data = envelope.data ?? envelope.Data;

      if (data == null) {
        throw new Error(
          envelope.message ??
            envelope.Message ??
            "API returned no data."
        );
      }

      return data;
    }
  }

  if (json == null) {
    throw new Error("API returned no data.");
  }

  return json as T;
}

// =====================================================
// FILE TYPE DETECTION
// =====================================================

function getFileType(type: string, url: string) {
  const value = (type || "").toUpperCase();

  if (
    ["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(value) ||
    /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url)
  ) {
    return "image";
  }

  if (value === "PDF" || /\.pdf(\?.*)?$/i.test(url)) {
    return "pdf";
  }

  return "other";
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PrintableWorksheetsGallery() {
  const router = useRouter();

  // ---------------------------------------------------
  // DATA STATES
  // ---------------------------------------------------

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [topicOptions, setTopicOptions] =
    useState<TopicOptions | null>(null);

  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);

  // ---------------------------------------------------
  // SELECTED ITEMS
  // ---------------------------------------------------

  const [subject, setSubject] = useState<Subject | null>(null);

  const [topic, setTopic] = useState<Topic | null>(null);

  const [preview, setPreview] = useState<Worksheet | null>(null);

  // ---------------------------------------------------
  // FILTER STATES
  // ---------------------------------------------------

  const [levelId, setLevelId] = useState("");

  const [difficultyId, setDifficultyId] = useState("");

  // ---------------------------------------------------
  // UI STATES
  // ---------------------------------------------------

  const [stage, setStage] = useState<Stage>("subjects");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ---------------------------------------------------
  // AVAILABLE LEVELS
  // Fetched from selected topic's configuration.
  // ---------------------------------------------------

  const levels = topicOptions?.levels ?? [];

  // ---------------------------------------------------
  // AVAILABLE DIFFICULTIES
  // Only difficulties linked to the selected level.
  // ---------------------------------------------------

  const selectedLevel = levels.find(
    (item) => String(item.levelId) === levelId
  );

  const difficulties = selectedLevel?.difficulties ?? [];

  const selectedDifficulty = difficulties.find(
    (item) => String(item.difficultyId) === difficultyId
  );

  // ===================================================
  // 1. LOAD SUBJECTS AND THEIR TOPICS
  // ===================================================

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const subjectRows = await apiGet<
        Omit<Subject, "topics">[]
      >("/api/pre-generated-worksheets/subjects");

      const subjectsWithTopics = await Promise.all(
        subjectRows.map(async (item) => {
          const topics = await apiGet<Topic[]>(
            `/api/pre-generated-worksheets/subjects/${item.subjectId}/topics`
          );

          return {
            ...item,
            topics: Array.isArray(topics) ? topics : [],
          };
        })
      );

      setSubjects(subjectsWithTopics);
    } catch (err) {
      setSubjects([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subjects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  // ===================================================
  // 2. LOAD TOPIC OPTIONS
  // Fetch active levels and their configured difficulties.
  // ===================================================

  const loadTopicOptions = async (topicId: number) => {
    const result = await apiGet<TopicOptions>(
      `/api/pre-generated-worksheets/topics/${topicId}/options`
    );

    setTopicOptions(result);
    return result;
  };

  // ===================================================
  // 3. FETCH WORKSHEETS
  // By topic + level + difficulty.
  // ===================================================

  const fetchWorksheets = async (
    selectedTopicId: number,
    selectedLevelId: string,
    selectedDifficultyId: string
  ): Promise<Worksheet[]> => {
    const params = new URLSearchParams({
      levelId: selectedLevelId,
      difficultyId: selectedDifficultyId,
    });

    const rows = await apiGet<Worksheet[]>(
      `/api/pre-generated-worksheets/topics/${selectedTopicId}/worksheets?${params.toString()}`
    );

    const currentLevel = topicOptions?.levels.find(
      (item) => String(item.levelId) === selectedLevelId
    );

    const currentDifficulty = currentLevel?.difficulties.find(
      (item) =>
        String(item.difficultyId) === selectedDifficultyId
    );

    return (Array.isArray(rows) ? rows : []).map((item) => ({
      ...item,
      levelName: currentLevel?.levelName ?? "",
      difficultyName: currentDifficulty?.difficultyName ?? "",
    }));
  };

  // ===================================================
  // 4. LOAD WORKSHEETS
  // ===================================================

  const loadWorksheets = async (
    selectedTopicId: number,
    selectedLevelId: string,
    selectedDifficultyId: string
  ) => {
    setLoading(true);
    setError("");

    try {
      const rows = await fetchWorksheets(
        selectedTopicId,
        selectedLevelId,
        selectedDifficultyId
      );

      setWorksheets(rows);
      setStage("worksheets");
    } catch (err) {
      setWorksheets([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load worksheets."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // 5. TOPIC CLICK
  // Subject -> Topic -> Level and Difficulty.
  // ===================================================

const handleTopicClick = (selectedTopic: Topic) => {
  router.push(
    `/printable-worksheets/topics/${selectedTopic.topicId}`
  );
};

  // ===================================================
  // 6. LEVEL CHANGE
  // Difficulties change according to selected level.
  // ===================================================

  const handleLevelChange = (nextLevelId: string) => {
    setLevelId(nextLevelId);

    // A previous difficulty may not belong to
    // the newly selected level.
    setDifficultyId("");

    setWorksheets([]);
    setPreview(null);

    setStage("topicOptions");
    setError("");
    setSearch("");
  };

  // ===================================================
  // 7. DIFFICULTY CHANGE
  // Load worksheets after both filters are selected.
  // ===================================================

  const handleDifficultyChange = async (
    nextDifficultyId: string
  ) => {
    setDifficultyId(nextDifficultyId);

    setPreview(null);
    setWorksheets([]);
    setError("");

    if (!topic || !levelId || !nextDifficultyId) {
      setStage("topicOptions");
      return;
    }

    await loadWorksheets(
      topic.topicId,
      levelId,
      nextDifficultyId
    );
  };

  // ===================================================
  // 8. RETRY CURRENT REQUEST
  // ===================================================

  const retryCurrentStage = async () => {
    setError("");

    if (stage === "subjects") {
      await loadSubjects();
      return;
    }

    if (!topic) return;

    setLoading(true);

    try {
      if (stage === "topicOptions") {
        await loadTopicOptions(topic.topicId);
      } else if (stage === "worksheets" && levelId && difficultyId) {
        const rows = await fetchWorksheets(
          topic.topicId,
          levelId,
          difficultyId
        );

        setWorksheets(rows);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load library data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // 9. GO TO HOME
  // ===================================================

  const goHome = () => {
    setStage("subjects");

    setSubject(null);
    setTopic(null);
    setTopicOptions(null);
    setPreview(null);

    setWorksheets([]);

    setLevelId("");
    setDifficultyId("");

    setSearch("");
    setError("");
  };

  // ===================================================
  // 10. GO BACK
  // ===================================================

  const goBack = () => {
    setError("");
    setSearch("");
    setPreview(null);

    if (stage === "worksheets") {
      setStage("topicOptions");

      setWorksheets([]);

      // Keep the selected level so the user can
      // choose another difficulty.
      setDifficultyId("");
    } else {
      goHome();
    }
  };

  // ===================================================
  // 11. FILTER SUBJECTS
  // ===================================================

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((item) =>
        `${item.subjectName} ${item.topics
          .map((topicItem) => topicItem.topicName)
          .join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [subjects, search]
  );

  // ===================================================
  // 12. FILTER WORKSHEETS
  // ===================================================

  const filteredWorksheets = worksheets.filter((item) =>
    item.worksheetTitle
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ===================================================
  // 13. PAGE TITLE AND DESCRIPTION
  // ===================================================

  const pageTitle =
    stage === "subjects"
      ? "Ready-Made Worksheets"
      : stage === "topicOptions"
        ? `${topic?.topicName ?? "Topic"} · Worksheet Options`
        : `${topic?.topicName ?? "Topic"} · Worksheets`;

  const pageDescription =
    stage === "subjects"
      ? "Browse subjects and choose a topic to find ready-made printable worksheets."
      : stage === "topicOptions"
        ? "Choose a learning level and difficulty to find matching worksheets."
        : "Preview, download, or print worksheets matching your selected topic and filters.";

  // ===================================================
  // MAIN UI
  // Existing rml CSS classes and visual structure
  // are preserved.
  // ===================================================

  return (
    <main className="rml-page">
      <section className="rml-hero">
        <div className="rml-hero__decor rml-hero__decor--one" />
        <div className="rml-hero__decor rml-hero__decor--two" />

        <div className="rml-container">
          <div className="rml-hero__eyebrow">
            <Sparkles size={15} />
            <span>LEARNING RESOURCE LIBRARY</span>
          </div>

          <h1 className="rml-hero__title">{pageTitle}</h1>

          <p className="rml-hero__description">
            {pageDescription}
          </p>

          <div className="rml-hero__search">
            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${
                stage === "subjects"
                  ? "subjects or topics"
                  : stage === "topicOptions"
                    ? "worksheet titles"
                    : "worksheets"
              }...`}
              aria-label="Search library"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rml-content">
        <div className="rml-container">
          {/* BREADCRUMB */}

          <nav className="rml-breadcrumb" aria-label="Breadcrumb">
            <button type="button" onClick={goHome}>
              Library
            </button>

            {subject && (
              <>
                <ChevronRight size={15} />
                <span>{subject.subjectName}</span>
              </>
            )}

            {topic && (
              <>
                <ChevronRight size={15} />
                <span>{topic.topicName}</span>
              </>
            )}
          </nav>

          {/* BACK BUTTON */}

          {stage !== "subjects" && (
            <button
              type="button"
              className="rml-back-button"
              onClick={goBack}
            >
              <ArrowLeft size={17} />
              Back
            </button>
          )}

          {/* SECTION HEADING */}

          <div className="rml-section-heading">
            <div>
              <span className="rml-section-heading__eyebrow">
                {stage === "subjects"
                  ? "BROWSE BY SUBJECT"
                  : stage === "topicOptions"
                    ? "SELECT LEVEL AND DIFFICULTY"
                    : "AVAILABLE WORKSHEETS"}
              </span>

              <h2>
                {stage === "subjects"
                  ? "Explore Subjects"
                  : stage === "topicOptions"
                    ? "Choose Your Learning Level"
                    : "Choose Your Worksheet"}
              </h2>
            </div>

            {!loading && (
              <span className="rml-count">
                {stage === "subjects"
                  ? filteredSubjects.length
                  : stage === "topicOptions"
                    ? levels.length
                    : filteredWorksheets.length}{" "}
                {stage === "subjects"
                  ? "subjects"
                  : stage === "topicOptions"
                    ? "available levels"
                    : "worksheets"}
              </span>
            )}
          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="rml-error" role="alert">
              <div>
                <strong>Unable to load library data</strong>
                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={() => void retryCurrentStage()}
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="rml-loading">
              <LoaderCircle
                size={34}
                className="rml-loading__spinner"
              />

              <span>Loading learning resources...</span>
            </div>
          ) : (
            <>
              {/* =====================================
                  SUBJECT CARDS WITH TOPIC LINKS
              ====================================== */}

              {stage === "subjects" && (
                <>
                  <div className="rml-grid rml-grid--subjects">
                    {filteredSubjects.map((item, index) => (
                      <article
                        key={item.subjectId}
                        className={`rml-card rml-subject-card rml-subject-card--${index % 4}`}
                      >
                        <div className="rml-subject-card__icon">
                          <BookOpen size={27} />
                        </div>

                        <div className="rml-card__body">
                          <h3>{item.subjectName}</h3>

                          <p>
                            {item.topics.length} available topics
                          </p>
                        </div>

                        <div className="rml-subject-card__categories">
                          <span className="rml-subject-card__categories-title">
                            TOPICS
                          </span>

                          {item.topics.length > 0 ? (
                            item.topics.map((topicItem) => (
                              <button
                                type="button"
                                key={topicItem.topicId}
                                className="rml-category-link"
                                onClick={() =>
                                  void handleTopicClick(topicItem)
                                }
                              >
                                <span>{topicItem.topicName}</span>

                                <small>Explore</small>

                                <ArrowRight size={15} />
                              </button>
                            ))
                          ) : (
                            <p className="rml-no-categories">
                              No active topics available.
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  {!filteredSubjects.length && (
                    <EmptyState message="No active subjects were returned by the backend." />
                  )}
                </>
              )}

              {/* =====================================
                  TOPIC LEVEL AND DIFFICULTY FILTERS
              ====================================== */}

              {(stage === "topicOptions" ||
                stage === "worksheets") && (
                <>
                  <div className="rml-filter-panel">
                    {/* LEARNING LEVEL */}

                    <label>
                      <span>
                        <GraduationCap size={16} />
                        Learning Level
                      </span>

                      <select
                        value={levelId}
                        onChange={(event) =>
                          handleLevelChange(event.target.value)
                        }
                      >
                        <option value="">
                          Select a learning level
                        </option>

                        {levels.map((level) => (
                          <option
                            key={level.topicLevelConfigurationId}
                            value={level.levelId}
                          >
                            {level.levelName}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* DIFFICULTY */}

                    <label>
                      <span>
                        <Layers3 size={16} />
                        Difficulty
                      </span>

                      <select
                        value={difficultyId}
                        disabled={!levelId || difficulties.length === 0}
                        onChange={(event) =>
                          void handleDifficultyChange(
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          {levelId
                            ? "Select a difficulty"
                            : "Select a level first"}
                        </option>

                        {difficulties.map((difficulty) => (
                          <option
                            key={difficulty.difficultyId}
                            value={difficulty.difficultyId}
                          >
                            {difficulty.difficultyName}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* OPTIONS EMPTY STATES */}

                  {stage === "topicOptions" &&
                    !error &&
                    topicOptions &&
                    !levels.length && (
                      <EmptyState message="No active learning levels and difficulties are configured for this topic." />
                    )}

                  {stage === "topicOptions" &&
                    !error &&
                    levels.length > 0 &&
                    !levelId && (
                      <EmptyState message="Please select a learning level to see the difficulties available for this topic." />
                    )}

                  {stage === "topicOptions" &&
                    !error &&
                    levelId &&
                    !difficulties.length && (
                      <EmptyState message="No active difficulties are configured for the selected learning level." />
                    )}

                  {stage === "topicOptions" &&
                    !error &&
                    levelId &&
                    difficulties.length > 0 &&
                    !difficultyId && (
                      <EmptyState message="Now select a difficulty to load the available worksheet images and PDFs." />
                    )}
                </>
              )}

              {/* =====================================
                  MATCHING WORKSHEETS
                  Topic + Level + Difficulty
              ====================================== */}

              {stage === "worksheets" && (
                <div className="rml-grid rml-grid--worksheets">
                  {filteredWorksheets.map((item, index) => (
                    <article
                      className={`rml-card rml-worksheet-card rml-worksheet-card--${index % 3}`}
                      key={item.preGeneratedWorksheetId}
                    >
                      {/* WORKSHEET PREVIEW IMAGE */}

                      <button
                        type="button"
                        className="rml-worksheet-card__preview"
                        onClick={() => setPreview(item)}
                      >
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.worksheetTitle}
                          />
                        ) : getFileType(
                            item.fileType,
                            item.worksheetUrl
                          ) === "image" ? (
                          <img
                            src={item.worksheetUrl}
                            alt={item.worksheetTitle}
                          />
                        ) : (
                          <div className="rml-worksheet-card__placeholder">
                            <FileText size={44} />
                            <span>{item.fileType.toUpperCase()}</span>
                          </div>
                        )}
                      </button>

                      {/* WORKSHEET DETAILS */}

                      <div className="rml-worksheet-card__body">
                        <h3>{item.worksheetTitle}</h3>

                        <div className="rml-worksheet-card__meta">
                          <span>
                            {item.levelName || selectedLevel?.levelName}
                          </span>

                          <span>
                            {item.difficultyName ||
                              selectedDifficulty?.difficultyName}
                          </span>

                          <span>{item.fileType.toUpperCase()}</span>
                        </div>

                        <button
                          type="button"
                          className="rml-card__action rml-inline-action"
                          onClick={() => setPreview(item)}
                        >
                          Preview

                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* NO WORKSHEETS */}

              {stage === "worksheets" &&
                !loading &&
                !error &&
                !filteredWorksheets.length && (
                  <EmptyState message="No worksheets are available for this topic, learning level and difficulty. Please try another selection." />
                )}
            </>
          )}
        </div>
      </section>

      {/* =========================================
          WORKSHEET PREVIEW MODAL
          Existing preview structure preserved.
      ========================================== */}

      {preview && (
        <div
          className="rml-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Worksheet preview"
        >
          <button
            className="rml-modal__backdrop"
            type="button"
            aria-label="Close preview"
            onClick={() => setPreview(null)}
          />

          <div className="rml-modal__panel">
            {/* MODAL HEADER */}

            <header className="rml-modal__header">
              <div>
                <span className="rml-modal__eyebrow">
                  WORKSHEET PREVIEW
                </span>

                <h2>{preview.worksheetTitle}</h2>

                <p>
                  {preview.levelName || selectedLevel?.levelName} ·{" "}
                  {preview.difficultyName ||
                    selectedDifficulty?.difficultyName}{" "}
                  · {preview.fileType.toUpperCase()}
                </p>
              </div>

              <button
                type="button"
                className="rml-modal__close"
                onClick={() => setPreview(null)}
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </header>

            {/* MODAL CONTENT */}

            <div className="rml-modal__content">
              {getFileType(
                preview.fileType,
                preview.worksheetUrl
              ) === "image" ? (
                <img
                  className="rml-modal__image"
                  src={preview.worksheetUrl}
                  alt={preview.worksheetTitle}
                />
              ) : getFileType(
                  preview.fileType,
                  preview.worksheetUrl
                ) === "pdf" ? (
                <iframe
                  className="rml-modal__pdf"
                  src={preview.worksheetUrl}
                  title={preview.worksheetTitle}
                />
              ) : (
                <div className="rml-modal__unsupported">
                  <FileText size={45} />

                  <p>
                    Preview is not available for this file type.
                  </p>

                  <a
                    href={preview.worksheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open worksheet
                  </a>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            <footer className="rml-modal__footer">
              <a
                className="rml-modal__button rml-modal__button--secondary"
                href={preview.worksheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download size={17} />

                Open / Download
              </a>

              <button
                className="rml-modal__button rml-modal__button--primary"
                type="button"
                onClick={() => {
                  const win = window.open(
                    preview.worksheetUrl,
                    "_blank"
                  );

                  if (win) {
                    win.onload = () => win.print();
                  }
                }}
              >
                <Printer size={17} />

                Print
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rml-empty">
      <div className="rml-empty__icon">
        <BookOpen size={28} />
      </div>

      <h3>No resources available</h3>

      <p>{message}</p>
    </div>
  );
}
