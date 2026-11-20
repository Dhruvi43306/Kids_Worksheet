// import PrintableWorksheetsGallery from
//   "@/app/components/PrintableWorksheets/PrintableWorksheetsGallery";

// export default function PrintableWorksheetsPage() {
//   return <PrintableWorksheetsGallery />;
// }

// import PrintableWorksheetsGallery from "../components/PrintableWorksheets/PrintableWorksheetsGallery";

// export default function PrintableWorksheetsPage() {
//   return <PrintableWorksheetsGallery />;
// }

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import "@/app/components/components.css";

// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const TOPIC_DETAILS_ROUTE = "/printable-worksheets/topics";

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
// TOPIC TYPE
// =====================================================

interface Topic {
  topicId: number;
  topicName: string;
  slug: string;

  categoryCode?: string | null;
  code?: string | null;

  description?: string | null;
}

// =====================================================
// SUBJECT TYPE
// =====================================================

interface Subject {
  subjectId: number;
  subjectName: string;
  slug: string;
  topics: Topic[];
}

// =====================================================
// API GET HELPER
//
// Supports:
// 1. Raw API arrays/objects
// 2. ResponceDto<T> wrapped responses
// 3. PascalCase and camelCase envelope properties
// =====================================================

async function apiGet<T>(endpoint: string): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured in your .env.local file."
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
    throw new Error(`API returned invalid JSON (${response.status}).`);
  }

  const object =
    typeof json === "object" && json !== null && !Array.isArray(json)
      ? (json as Record<string, unknown>)
      : null;

  // ---------------------------------------------------
  // HANDLE HTTP ERRORS
  // ---------------------------------------------------

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

  // ---------------------------------------------------
  // HANDLE DTO ENVELOPE
  // ---------------------------------------------------

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
          errors.length > 0
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

  // ---------------------------------------------------
  // HANDLE RAW RESPONSE
  // ---------------------------------------------------

  if (json == null) {
    throw new Error("API returned no data.");
  }

  return json as T;
}

// =====================================================
// NORMALIZE SUBJECT DATA
// =====================================================

function normalizeSubject(
  subject: Omit<Subject, "topics">
): Omit<Subject, "topics"> {
  return {
    ...subject,
    subjectId: Number(subject.subjectId),
    subjectName: subject.subjectName?.trim() ?? "",
    slug: subject.slug?.trim() ?? "",
  };
}

// =====================================================
// NORMALIZE TOPIC DATA
// =====================================================

function normalizeTopic(topic: Topic): Topic {
  return {
    ...topic,
    topicId: Number(topic.topicId),
    topicName: topic.topicName?.trim() ?? "",
    slug: topic.slug?.trim() ?? "",
    categoryCode: topic.categoryCode ?? null,
    code: topic.code ?? null,
    description: topic.description ?? null,
  };
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PrintableWorksheetsGallery() {
  const router = useRouter();

  // ===================================================
  // DATA
  // ===================================================

  const [subjects, setSubjects] = useState<Subject[]>([]);

  // ===================================================
  // UI STATES
  // ===================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ===================================================
  // 1. LOAD SUBJECTS AND THEIR TOPICS FROM BACKEND
  // ===================================================

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // -----------------------------------------------
      // LOAD ALL ACTIVE SUBJECTS
      // -----------------------------------------------

      const subjectRows = await apiGet<Omit<Subject, "topics">[]>(
        "/api/pre-generated-worksheets/subjects"
      );

      if (!Array.isArray(subjectRows)) {
        throw new Error("The subjects API returned an invalid response.");
      }

      // -----------------------------------------------
      // LOAD TOPICS FOR EACH SUBJECT
      // -----------------------------------------------

      const subjectsWithTopics = await Promise.all(
        subjectRows.map(async (subjectItem) => {
          const normalizedSubject = normalizeSubject(subjectItem);

          const topicRows = await apiGet<Topic[]>(
            `/api/pre-generated-worksheets/subjects/${normalizedSubject.subjectId}/topics`
          );

          return {
            ...normalizedSubject,
            topics: Array.isArray(topicRows)
              ? topicRows
                  .map(normalizeTopic)
                  .filter(
                    (topic) =>
                      Number.isInteger(topic.topicId) &&
                      topic.topicId > 0
                  )
              : [],
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

  // ===================================================
  // 2. INITIAL DATA LOAD
  // ===================================================

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  // ===================================================
  // 3. OPEN TOPIC DETAILS PAGE
  //
  // Example:
  //
  // User clicks Math
  // User clicks Addition
  //
  // topicId = 2
  //
  // Opens:
  // /printable-worksheets/topics/2
  //
  // The topic details page will then load:
  // - Topic details
  // - Categories
  // - Category sidebar
  // - Local worksheet images after category selection
  // ===================================================

  const handleTopicClick = (
    selectedSubject: Subject,
    selectedTopic: Topic
  ) => {
    setError("");

    if (
      !selectedSubject ||
      !selectedTopic ||
      !Number.isInteger(selectedTopic.topicId) ||
      selectedTopic.topicId <= 0
    ) {
      setError("Unable to open this topic. Invalid topic information.");
      return;
    }

    router.push(
      `${TOPIC_DETAILS_ROUTE}/${selectedTopic.topicId}`
    );
  };

  // ===================================================
  // 4. FILTER SUBJECTS AND TOPICS
  // ===================================================

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return subjects;
    }

    return subjects
      .map((subject) => {
        const subjectMatches = subject.subjectName
          .toLowerCase()
          .includes(query);

        const matchingTopics = subject.topics.filter((topic) =>
          topic.topicName.toLowerCase().includes(query)
        );

        // If the subject name matches, show all its topics.
        if (subjectMatches) {
          return subject;
        }

        // Otherwise show only matching topics.
        return {
          ...subject,
          topics: matchingTopics,
        };
      })
      .filter(
        (subject) =>
          subject.subjectName.toLowerCase().includes(query) ||
          subject.topics.length > 0
      );
  }, [subjects, search]);

  // ===================================================
  // 5. TOTAL SUBJECT COUNT
  // ===================================================

  const totalSubjects = filteredSubjects.length;

  // ===================================================
  // 6. TOTAL TOPIC COUNT
  // ===================================================

  const totalTopics = useMemo(() => {
    return filteredSubjects.reduce(
      (total, subject) => total + subject.topics.length,
      0
    );
  }, [filteredSubjects]);

  // ===================================================
  // 7. CLEAR SEARCH
  // ===================================================

  const clearSearch = () => {
    setSearch("");
  };

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <main className="rml-page">

      {/* =========================================
          HERO SECTION
      ========================================== */}

      <section className="rml-hero">

        <div className="rml-hero__decor rml-hero__decor--one" />

        <div className="rml-hero__decor rml-hero__decor--two" />

        <div className="rml-container">

          {/* HERO EYEBROW */}

          <div className="rml-hero__eyebrow">
            <Sparkles size={15} />

            <span>LEARNING RESOURCE LIBRARY</span>
          </div>

          {/* HERO TITLE */}

          <h1 className="rml-hero__title">
            Ready-Made Worksheets
          </h1>

          {/* HERO DESCRIPTION */}

          <p className="rml-hero__description">
            Choose a subject and category to explore ready-made printable
            worksheets.
          </p>

          {/* SEARCH */}

          <div className="rml-hero__search">

            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subjects or categories..."
              aria-label="Search subjects or categories"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

          </div>

        </div>
      </section>

      {/* =========================================
          MAIN CONTENT
      ========================================== */}

      <section className="rml-content">

        <div className="rml-container">

          {/* BREADCRUMB */}

          <nav
            className="rml-breadcrumb"
            aria-label="Breadcrumb"
          >
            <span>Library</span>
          </nav>

          {/* SECTION HEADING */}

          <div className="rml-section-heading">

            <div>

              <span className="rml-section-heading__eyebrow">
                BROWSE BY SUBJECT
              </span>

              <h2>
                Explore Subjects
              </h2>
{/* 
              <p>
                Choose a subject and select a topic to explore its
                available worksheet categories.
              </p> */}

            </div>

            {!loading && (
              <span className="rml-count">
                {totalSubjects} subjects
              </span>
            )}

          </div>

          {/* =====================================
              ERROR MESSAGE
          ====================================== */}

          {error && (
            <div
              className="rml-error"
              role="alert"
            >

              <div>
                <strong>
                  Unable to load library data
                </strong>

                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={() => void loadSubjects()}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Retry
              </button>

            </div>
          )}

          {/* =====================================
              LOADING STATE
          ====================================== */}

          {loading ? (
            <div className="rml-loading">

              <LoaderCircle
                size={34}
                className="rml-loading__spinner"
              />

              <span>
                Loading subjects and categories...
              </span>

            </div>
          ) : (
            <>

              {/* =====================================
                  SUBJECT CARDS
              ====================================== */}

              <div className="rml-grid rml-grid--subjects">

                {filteredSubjects.map((item, index) => (

                  <article
                    key={item.subjectId}
                    className={`rml-card rml-subject-card rml-subject-card--${index % 4}`}
                  >

                    {/* SUBJECT ICON */}

                    <div className="rml-subject-card__icon">
                      <BookOpen size={27} />
                    </div>

                    {/* SUBJECT DETAILS */}

                    <div className="rml-card__body">

                      <h3>
                        {item.subjectName}
                      </h3>

                      <p>
                        {item.topics.length} available categories
                      </p>

                    </div>

                    {/* TOPIC LINKS */}

                    <div className="rml-subject-card__categories">

                      <span className="rml-subject-card__categories-title">
                        CATEGORIES
                      </span>

                      {item.topics.length > 0 ? (

                        item.topics.map((topicItem) => (

                          <button
                            type="button"
                            key={topicItem.topicId}
                            className="rml-category-link"
                            onClick={() =>
                              handleTopicClick(item, topicItem)
                            }
                          >

                            <span>
                              {topicItem.topicName}
                            </span>

                            <small>
                              Explore
                            </small>

                            <ArrowRight size={15} />

                          </button>

                        ))

                      ) : (

                        <p className="rml-no-categories">
                          No active categories available.
                        </p>

                      )}

                    </div>

                  </article>

                ))}

              </div>

              {/* =====================================
                  EMPTY SEARCH STATE
              ====================================== */}

              {!filteredSubjects.length && (

                <EmptyState
                  message={
                    search
                      ? "No subjects or categories match your search. Try another search term."
                      : "No active subjects or categories were returned by the backend."
                  }
                />

              )}

            </>
          )}

        </div>

      </section>

    </main>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rml-empty">

      <div className="rml-empty__icon">
        <BookOpen size={28} />
      </div>

      <h3>
        No resources available
      </h3>

      <p>
        {message}
      </p>

    </div>
  );
}

