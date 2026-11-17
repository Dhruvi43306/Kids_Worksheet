
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  FileText,
  Filter,
  GraduationCap,
  Layers3,
  LoaderCircle,
  Printer,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import "@/app/components/components.css";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const LIBRARY_HOME_ROUTE = "/printable-worksheets";
// =====================================================
// API TYPES
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
// CATEGORY
// =====================================================

interface WorksheetCategory {
  worksheetCategoryId: number;
  topicId: number;
  categoryName: string;
  code: string;
  description?: string | null;
  displayOrder: number;
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
  levelName?: string;
  difficultyName?: string;
}

// =====================================================
// API HELPER
// =====================================================

async function apiGet<T>(endpoint: string): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing from your .env.local file."
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
      `Invalid API response (${response.status}).`
    );
  }

  const object =
    typeof json === "object" &&
    json !== null &&
    !Array.isArray(json)
      ? (json as Record<string, unknown>)
      : null;

  if (!response.ok) {
    const errors = object?.Errors ?? object?.errors;

    throw new Error(
      Array.isArray(errors) && errors.length
        ? errors.join("; ")
        : String(
            object?.message ??
              object?.Message ??
              object?.title ??
              object?.Title ??
              `API request failed (${response.status}).`
          )
    );
  }

  if (object) {
    const isEnvelope =
      "success" in object ||
      "Success" in object ||
      "data" in object ||
      "Data" in object;

    if (isEnvelope) {
      const envelope = json as ApiEnvelope<T>;

      if (
        envelope.success === false ||
        envelope.Success === false
      ) {
        throw new Error(
          envelope.errors?.join("; ") ??
            envelope.Errors?.join("; ") ??
            envelope.message ??
            envelope.Message ??
            "Unable to retrieve data."
        );
      }

      const data = envelope.data ?? envelope.Data;

      if (data == null) {
        throw new Error("API returned no data.");
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
// FILE TYPE
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
// TOPIC DETAILS PAGE
// =====================================================

export default function PreGeneratedTopicPage() {
  const router = useRouter();

  const params = useParams<{ topics: string }>();

const topicId = Number(params.topics);

  // ---------------------------------------------------
  // DATABASE DATA
  // ---------------------------------------------------

  const [topicOptions, setTopicOptions] =
    useState<TopicOptions | null>(null);

  const [categories, setCategories] =
    useState<WorksheetCategory[]>([]);

  const [worksheets, setWorksheets] =
    useState<Worksheet[]>([]);

  // ---------------------------------------------------
  // SELECTIONS
  // ---------------------------------------------------

  const [categoryId, setCategoryId] = useState("");

  const [levelId, setLevelId] = useState("");

  const [difficultyId, setDifficultyId] = useState("");

  const [preview, setPreview] = useState<Worksheet | null>(null);

  // ---------------------------------------------------
  // UI STATES
  // ---------------------------------------------------

  const [loadingTopic, setLoadingTopic] = useState(true);

  const [loadingWorksheets, setLoadingWorksheets] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ---------------------------------------------------
  // CURRENT SELECTED LEVEL
  // ---------------------------------------------------

  const levels = topicOptions?.levels ?? [];

  const selectedLevel = levels.find(
    (item) => String(item.levelId) === levelId
  );

  // Difficulties are dependent on the selected level.
  const difficulties = selectedLevel?.difficulties ?? [];

  const selectedDifficulty = difficulties.find(
    (item) => String(item.difficultyId) === difficultyId
  );

  const selectedCategory = categories.find(
    (item) =>
      String(item.worksheetCategoryId) === categoryId
  );

  // ===================================================
  // 1. LOAD TOPIC, CATEGORIES AND CONFIGURATIONS
  // ===================================================

  const loadTopicData = useCallback(async () => {
    if (!Number.isInteger(topicId) || topicId <= 0) {
      setError("Invalid topic ID.");
      setLoadingTopic(false);
      return;
    }

    setLoadingTopic(true);
    setError("");

    try {
      const [categoryRows, options] = await Promise.all([
        apiGet<WorksheetCategory[]>(
          `/api/pre-generated-worksheets/topics/${topicId}/categories`
        ),

        apiGet<TopicOptions>(
          `/api/pre-generated-worksheets/topics/${topicId}/options`
        ),
      ]);

      if (options.topicId !== topicId) {
        throw new Error("The returned topic does not match the requested topic.");
      }

      setCategories(
        Array.isArray(categoryRows)
          ? categoryRows
              .filter((item) => item.topicId === topicId)
              .sort((a, b) => a.displayOrder - b.displayOrder)
          : []
      );

      setTopicOptions(options);
    } catch (err) {
      setCategories([]);
      setTopicOptions(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load topic details."
      );
    } finally {
      setLoadingTopic(false);
    }
  }, [topicId]);

  useEffect(() => {
    void loadTopicData();
  }, [loadTopicData]);

  // ===================================================
  // 2. LOAD WORKSHEETS
  // All four IDs must match.
  // ===================================================

  useEffect(() => {
    if (!categoryId || !levelId || !difficultyId) {
      setWorksheets([]);
      return;
    }

    if (!selectedCategory || !selectedLevel || !selectedDifficulty) {
      setWorksheets([]);
      return;
    }

    let cancelled = false;

    const loadWorksheets = async () => {
      setLoadingWorksheets(true);
      setError("");
      setWorksheets([]);

      const query = new URLSearchParams({
        categoryId,
        levelId,
        difficultyId,
      });

      try {
        const rows = await apiGet<Worksheet[]>(
          `/api/pre-generated-worksheets/topics/${topicId}/worksheets?${query.toString()}`
        );

        if (!cancelled) {
          setWorksheets(
            (Array.isArray(rows) ? rows : []).map((item) => ({
              ...item,
              levelName: selectedLevel.levelName,
              difficultyName: selectedDifficulty.difficultyName,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setWorksheets([]);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load worksheets."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingWorksheets(false);
        }
      }
    };

    void loadWorksheets();

    return () => {
      cancelled = true;
    };
  }, [
    topicId,
    categoryId,
    levelId,
    difficultyId,
    selectedCategory,
    selectedLevel,
    selectedDifficulty,
  ]);

  // ===================================================
  // 3. CATEGORY SELECTION
  // ===================================================

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    setPreview(null);
    setSearch("");
    setError("");
  };

  // ===================================================
  // 4. LEVEL SELECTION
  // ===================================================

  const handleLevelChange = (nextLevelId: string) => {
    setLevelId(nextLevelId);

    // Clear old difficulty because it belongs
    // to the previously selected level.
    setDifficultyId("");

    setPreview(null);
    setSearch("");
    setError("");
    setWorksheets([]);
  };

  // ===================================================
  // 5. DIFFICULTY SELECTION
  // ===================================================

  const handleDifficultyChange = (nextDifficultyId: string) => {
    setDifficultyId(nextDifficultyId);

    setPreview(null);
    setSearch("");
    setError("");
  };

  // ===================================================
  // 6. RESET FILTERS
  // ===================================================

  const clearFilters = () => {
    setCategoryId("");
    setLevelId("");
    setDifficultyId("");

    setWorksheets([]);
    setPreview(null);

    setSearch("");
    setError("");
  };

  // ===================================================
  // 7. RETRY
  // ===================================================

  const retry = async () => {
    if (
      categoryId &&
      levelId &&
      difficultyId
    ) {
      // Changing a filter triggers the loading effect.
      const query = new URLSearchParams({
        categoryId,
        levelId,
        difficultyId,
      });

      setLoadingWorksheets(true);
      setError("");

      try {
        const rows = await apiGet<Worksheet[]>(
          `/api/pre-generated-worksheets/topics/${topicId}/worksheets?${query.toString()}`
        );

        setWorksheets(
          (Array.isArray(rows) ? rows : []).map((item) => ({
            ...item,
            levelName: selectedLevel?.levelName ?? "",
            difficultyName:
              selectedDifficulty?.difficultyName ?? "",
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load worksheets."
        );
      } finally {
        setLoadingWorksheets(false);
      }

      return;
    }

    await loadTopicData();
  };

  // ===================================================
  // 8. SEARCH WORKSHEETS
  // ===================================================

  const filteredWorksheets = useMemo(
    () =>
      worksheets.filter((item) =>
        item.worksheetTitle
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [worksheets, search]
  );

  // ===================================================
  // 9. PREVIEW CLOSE
  // ===================================================

  const closePreview = () => setPreview(null);

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <main className="rmt-page">
      {/* HEADER */}

      <header className="rmt-header">
        <div className="rmt-header__inner">
          <button
            type="button"
            className="rmt-back"
            onClick={() => router.push(LIBRARY_HOME_ROUTE)}
          >
            <ArrowLeft size={17} />
            Back to Library
          </button>

          <div className="rmt-breadcrumb">
            <button
              type="button"
              onClick={() => router.push(LIBRARY_HOME_ROUTE)}
            >
              Ready-Made Worksheets
            </button>

            <ChevronRight size={15} />

            <span>
              {topicOptions?.topicName ?? "Loading topic..."}
            </span>
          </div>

          <div className="rmt-header__title">
            <div>
              <span className="rmt-eyebrow">
                PRINTABLE LEARNING RESOURCES
              </span>

              <h1>
                {topicOptions?.topicName ?? "Topic Worksheets"}
              </h1>

              <p>
                Find ready-made worksheets by category,
                learning level and difficulty.
              </p>
            </div>

            <div className="rmt-header__icon">
              <BookOpen size={34} />
            </div>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}

      <section className="rmt-content">
        <div className="rmt-layout">

          {/* ========================================
              SIDEBAR
          ========================================= */}

          <aside className="rmt-sidebar">

            <div className="rmt-sidebar__heading">
              <div>
                <span>FILTER RESOURCES</span>
                <h2>Find Worksheets</h2>
              </div>

              <Filter size={20} />
            </div>

            {/* CATEGORIES */}

            <div className="rmt-sidebar__section">
              <div className="rmt-sidebar__section-title">
                <FileText size={17} />
                <h3>Categories</h3>
              </div>

              {loadingTopic ? (
                <div className="rmt-sidebar__loading">
                  <LoaderCircle size={18} className="rmt-spin" />
                  Loading categories...
                </div>
              ) : categories.length > 0 ? (
                <div className="rmt-category-list">
                  {categories.map((item) => {
                    const active =
                      categoryId ===
                      String(item.worksheetCategoryId);

                    return (
                      <button
                        type="button"
                        key={item.worksheetCategoryId}
                        className={`rmt-category-item ${
                          active ? "rmt-category-item--active" : ""
                        }`}
                        onClick={() =>
                          handleCategoryChange(
                            String(item.worksheetCategoryId)
                          )
                        }
                      >
                        <span className="rmt-category-item__text">
                          {item.categoryName}
                        </span>

                        {active ? (
                          <Check size={16} />
                        ) : (
                          <ChevronRight size={15} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rmt-sidebar__empty">
                  No active categories available for this topic.
                </p>
              )}
            </div>

            {/* LEVEL FILTER */}

            <div className="rmt-sidebar__section">
              <div className="rmt-sidebar__section-title">
                <GraduationCap size={18} />
                <h3>Learning Level</h3>
              </div>

              <select
                className="rmt-filter-select"
                value={levelId}
                disabled={loadingTopic || levels.length === 0}
                onChange={(event) =>
                  handleLevelChange(event.target.value)
                }
              >
                <option value="">Select level</option>

                {levels.map((item) => (
                  <option
                    key={item.topicLevelConfigurationId}
                    value={item.levelId}
                  >
                    {item.levelName}
                  </option>
                ))}
              </select>

              <p className="rmt-filter-help">
                Only levels configured for this topic are shown.
              </p>
            </div>

            {/* DIFFICULTY FILTER */}

            <div className="rmt-sidebar__section">
              <div className="rmt-sidebar__section-title">
                <Layers3 size={18} />
                <h3>Difficulty</h3>
              </div>

              <select
                className="rmt-filter-select"
                value={difficultyId}
                disabled={!levelId || difficulties.length === 0}
                onChange={(event) =>
                  handleDifficultyChange(event.target.value)
                }
              >
                <option value="">Select difficulty</option>

                {difficulties.map((item) => (
                  <option
                    key={item.difficultyId}
                    value={item.difficultyId}
                  >
                    {item.difficultyName}
                  </option>
                ))}
              </select>

              <p className="rmt-filter-help">
                Choose a level first to see its available difficulties.
              </p>
            </div>

            {/* CLEAR FILTERS */}

            <button
              type="button"
              className="rmt-clear-filters"
              onClick={clearFilters}
            >
              <RefreshCw size={15} />
              Clear All Filters
            </button>
          </aside>

          {/* ========================================
              MAIN WORKSHEET AREA
          ========================================= */}

          <div className="rmt-main">

            {/* MAIN HEADING */}

            <div className="rmt-main__heading">
              <div>
                <span className="rmt-eyebrow">
                  {selectedCategory
                    ? selectedCategory.categoryName
                    : "SELECT A CATEGORY"}
                </span>

                <h2>
                  {selectedCategory
                    ? "Available Worksheets"
                    : "Explore Topic Categories"}
                </h2>

                <p>
                  {selectedCategory
                    ? "Your printable resources will appear here."
                    : "Select a category from the sidebar, then choose a learning level and difficulty."}
                </p>
              </div>

              <span className="rmt-result-count">
                {filteredWorksheets.length} worksheets
              </span>
            </div>

            {/* FILTER SUMMARY */}

            {(selectedCategory || selectedLevel || selectedDifficulty) && (
              <div className="rmt-selected-filters">
                {selectedCategory && (
                  <span>
                    Category: {selectedCategory.categoryName}
                  </span>
                )}

                {selectedLevel && (
                  <span>Level: {selectedLevel.levelName}</span>
                )}

                {selectedDifficulty && (
                  <span>
                    Difficulty: {selectedDifficulty.difficultyName}
                  </span>
                )}
              </div>
            )}

            {/* SEARCH */}

            {worksheets.length > 0 && (
              <div className="rmt-search">
                <Search size={18} />

                <input
                  type="search"
                  placeholder="Search worksheets..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="rmt-error" role="alert">
                <div>
                  <strong>Unable to load resources</strong>
                  <p>{error}</p>
                </div>

                <button type="button" onClick={() => void retry()}>
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            )}

            {/* LOADING WORKSHEETS */}

            {loadingTopic || loadingWorksheets ? (
              <div className="rmt-state">
                <LoaderCircle size={35} className="rmt-spin" />

                <h3>
                  {loadingTopic
                    ? "Loading topic resources..."
                    : "Finding worksheets..."}
                </h3>

                <p>Fetching available resources from your library.</p>
              </div>
            ) : (
              <>
                {/* NOTHING SELECTED */}

                {!selectedCategory && !error && (
                  <div className="rmt-state">
                    <div className="rmt-state__icon">
                      <BookOpen size={34} />
                    </div>

                    <h3>Choose a Category</h3>

                    <p>
                      Select a category from the left sidebar
                      to begin exploring worksheets.
                    </p>
                  </div>
                )}

                {/* CATEGORY SELECTED, LEVEL NOT SELECTED */}

                {selectedCategory &&
                  !levelId &&
                  !error && (
                    <div className="rmt-state">
                      <div className="rmt-state__icon">
                        <GraduationCap size={34} />
                      </div>

                      <h3>Select a Learning Level</h3>

                      <p>
                        Choose a level from the sidebar to
                        continue.
                      </p>
                    </div>
                  )}

                {/* LEVEL SELECTED, DIFFICULTY NOT SELECTED */}

                {selectedCategory &&
                  levelId &&
                  !difficultyId &&
                  !error && (
                    <div className="rmt-state">
                      <div className="rmt-state__icon">
                        <Layers3 size={34} />
                      </div>

                      <h3>Select Difficulty</h3>

                      <p>
                        Choose an available difficulty for{" "}
                        {selectedLevel?.levelName}.
                      </p>
                    </div>
                  )}

                {/* WORKSHEET GRID */}

                {selectedCategory &&
                  levelId &&
                  difficultyId &&
                  !error &&
                  filteredWorksheets.length > 0 && (
                    <div className="rmt-worksheet-grid">
                      {filteredWorksheets.map((item) => (
                        <article
                          key={item.preGeneratedWorksheetId}
                          className="rmt-worksheet-card"
                        >
                          <button
                            type="button"
                            className="rmt-worksheet-card__preview"
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
                              <div className="rmt-file-placeholder">
                                <FileText size={44} />
                                <span>
                                  {item.fileType.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </button>

                          <div className="rmt-worksheet-card__body">
                            <h3>{item.worksheetTitle}</h3>

                            <div className="rmt-worksheet-meta">
                              <span>
                                {selectedLevel?.levelName}
                              </span>

                              <span>
                                {selectedDifficulty?.difficultyName}
                              </span>

                              <span>
                                {item.fileType.toUpperCase()}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="rmt-preview-button"
                              onClick={() => setPreview(item)}
                            >
                              Preview Worksheet
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                {/* NO WORKSHEETS */}

                {selectedCategory &&
                  levelId &&
                  difficultyId &&
                  !error &&
                  filteredWorksheets.length === 0 &&
                  !search && (
                    <div className="rmt-state">
                      <div className="rmt-state__icon">
                        <FileText size={34} />
                      </div>

                      <h3>No Worksheets Available</h3>

                      <p>
                        There are currently no uploaded worksheets
                        for this category, level and difficulty.
                      </p>
                    </div>
                  )}

                {/* SEARCH NO RESULTS */}

                {selectedCategory &&
                  levelId &&
                  difficultyId &&
                  search &&
                  filteredWorksheets.length === 0 && (
                    <div className="rmt-state">
                      <Search size={32} />

                      <h3>No Matching Worksheets</h3>

                      <p>
                        Try another worksheet title.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          WORKSHEET PREVIEW
      ========================================== */}

      {preview && (
        <div
          className="rmt-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Worksheet preview"
        >
          <button
            type="button"
            className="rmt-modal__backdrop"
            onClick={closePreview}
            aria-label="Close preview"
          />

          <div className="rmt-modal__panel">
            <header className="rmt-modal__header">
              <div>
                <span>WORKSHEET PREVIEW</span>

                <h2>{preview.worksheetTitle}</h2>

                <p>
                  {selectedCategory?.categoryName} ·{" "}
                  {selectedLevel?.levelName} ·{" "}
                  {selectedDifficulty?.difficultyName}
                </p>
              </div>

              <button
                type="button"
                onClick={closePreview}
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </header>

            <div className="rmt-modal__content">
              {getFileType(
                preview.fileType,
                preview.worksheetUrl
              ) === "image" ? (
                <img
                  src={preview.worksheetUrl}
                  alt={preview.worksheetTitle}
                />
              ) : getFileType(
                  preview.fileType,
                  preview.worksheetUrl
                ) === "pdf" ? (
                <iframe
                  src={preview.worksheetUrl}
                  title={preview.worksheetTitle}
                />
              ) : (
                <div className="rmt-state">
                  <FileText size={40} />

                  <p>
                    Preview is not available for this file type.
                  </p>

                  <a
                    href={preview.worksheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Worksheet
                  </a>
                </div>
              )}
            </div>

            <footer className="rmt-modal__footer">
              <a
                href={preview.worksheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rmt-modal__download"
              >
                <Download size={17} />
                Open / Download
              </a>

              <button
                type="button"
                className="rmt-modal__print"
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
