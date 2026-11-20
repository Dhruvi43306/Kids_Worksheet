
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
  ImageIcon,
  LoaderCircle,
  Printer,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import "@/app/components/components.css";

import {
  getWorksheetImages,
  hasLocalImages,
  type WorksheetImage,
} from "@/lib/worksheetImageMap";

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
// TOPIC
// =====================================================

interface TopicOptions {
  topicId: number;
  topicName: string;
}

// =====================================================
// LOCAL IMAGE PREVIEW
// =====================================================

interface LocalPreview {
  src: string;
  title: string;
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
    throw new Error(`Invalid API response (${response.status}).`);
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
      Array.isArray(errors) && errors.length > 0
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
// MAP DATABASE TOPIC NAME TO LOCAL IMAGE FOLDER
//
// Database topic:
// Math / Mathematics
//
// Actual public folder:
// public/Addition/
//
// Image URLs:
// /Addition/c1/a11.jpg
// /Addition/c2/...
//
// Category names are not used as image folder names.
// =====================================================

function getImageSubjectName(topicName: string): string {
  const normalized = topicName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const subjectAliases: Record<string, string> = {
    math: "Addition",
    mathematics: "Addition",
    addition: "Addition",
  };

  return subjectAliases[normalized] ?? topicName.trim();
}

// =====================================================
// CATEGORY IMAGE FOLDER CODE
//
// First category  -> c1
// Second category -> c2
// Third category  -> c3
//
// If the database category code is already c1, c2, etc.,
// use that code directly.
// =====================================================

function getCategoryFolderCode(
  category: WorksheetCategory,
  categories: WorksheetCategory[]
): string {
  const databaseCode = category.code?.trim() ?? "";

  if (/^c\d+$/i.test(databaseCode)) {
    return databaseCode.toLowerCase();
  }

  const position =
    categories.findIndex(
      (item) =>
        Number(item.worksheetCategoryId) ===
        Number(category.worksheetCategoryId)
    ) + 1;

  return position > 0 ? `c${position}` : "";
}

// =====================================================
// PRINT LOCAL IMAGE
// =====================================================

function printLocalImage(src: string): void {
  const win = window.open("", "_blank");

  if (!win) {
    window.alert(
      "Please allow pop-ups in your browser to print this worksheet."
    );
    return;
  }

  const safeSrc = src.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Worksheet</title>

        <style>
          @page {
            size: A4;
            margin: 10mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
          }

          body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          img {
            max-width: 100%;
            max-height: 277mm;
            height: auto;
            width: auto;
            object-fit: contain;
            display: block;
          }
        </style>
      </head>

      <body>
        <img
          src="${safeSrc}"
          alt="Worksheet"
          onload="window.print();"
          onerror="document.body.innerHTML='<p>Unable to load worksheet image.</p>';"
        />
      </body>
    </html>
  `);

  win.document.close();
}

// =====================================================
// TOPIC DETAILS PAGE
// =====================================================

export default function PreGeneratedTopicPage() {
  const router = useRouter();

  const params = useParams<{ topics: string }>();

  const topicId = Number(params.topics);

  // ===================================================
  // DATABASE DATA
  // ===================================================

  const [topicOptions, setTopicOptions] =
    useState<TopicOptions | null>(null);

  const [categories, setCategories] =
    useState<WorksheetCategory[]>([]);

  // ===================================================
  // SELECTIONS
  // ===================================================

  const [categoryId, setCategoryId] = useState("");

  const [localPreview, setLocalPreview] =
    useState<LocalPreview | null>(null);

  // ===================================================
  // LOCAL IMAGE DATA
  // ===================================================

  const [localImages, setLocalImages] =
    useState<WorksheetImage[]>([]);

  // ===================================================
  // UI STATES
  // ===================================================

  const [loadingTopic, setLoadingTopic] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ===================================================
  // SELECTED CATEGORY
  // ===================================================

  const selectedCategory = useMemo(() => {
    return (
      categories.find(
        (item) =>
          String(item.worksheetCategoryId) === categoryId
      ) ?? null
    );
  }, [categories, categoryId]);

  // ===================================================
  // DATABASE TOPIC NAME
  // ===================================================

  const subjectName = topicOptions?.topicName?.trim() ?? "";

  // ===================================================
  // LOCAL IMAGE SUBJECT NAME
  //
  // Math -> Addition
  // Mathematics -> Addition
  //
  // Other subject names remain unchanged.
  // ===================================================

  const imageSubjectName = useMemo(() => {
    if (!subjectName) {
      return "";
    }

    return getImageSubjectName(subjectName);
  }, [subjectName]);

  // ===================================================
  // CATEGORY FOLDER CODE
  // ===================================================

  const categoryFolderCode = useMemo(() => {
    if (!selectedCategory) {
      return "";
    }

    return getCategoryFolderCode(
      selectedCategory,
      categories
    );
  }, [selectedCategory, categories]);

  // ===================================================
  // CHECK LOCAL IMAGES
  // ===================================================

  const showLocalImages =
    !!selectedCategory &&
    !!imageSubjectName &&
    !!categoryFolderCode &&
    hasLocalImages(imageSubjectName, categoryFolderCode);

  // ===================================================
  // 1. LOAD TOPIC AND CATEGORIES FROM BACKEND
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

      if (Number(options.topicId) !== topicId) {
        throw new Error(
          "The returned topic does not match the requested topic."
        );
      }

      const sortedCategories = (
        Array.isArray(categoryRows) ? categoryRows : []
      )
        .filter(
          (item) => Number(item.topicId) === topicId
        )
        .sort(
          (a, b) =>
            Number(a.displayOrder) - Number(b.displayOrder)
        );

      setCategories(sortedCategories);
      setTopicOptions(options);
      setCategoryId("");
      setLocalImages([]);
      setLocalPreview(null);
      setSearch("");
    } catch (err) {
      setCategories([]);
      setTopicOptions(null);
      setLocalImages([]);
      setLocalPreview(null);

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
  // 2. LOAD LOCAL IMAGES
  //
  // Images are loaded using only:
  // imageSubjectName + categoryFolderCode
  //
  // Example:
  // getWorksheetImages("Addition", "c1")
  //
  // No level or difficulty is required.
  // ===================================================

  useEffect(() => {
    if (
      !selectedCategory ||
      !imageSubjectName ||
      !categoryFolderCode
    ) {
      setLocalImages([]);
      setLocalPreview(null);
      return;
    }

    const images = getWorksheetImages(
      imageSubjectName,
      categoryFolderCode
    );

    setLocalImages(images);
    setLocalPreview(null);
  }, [
    selectedCategory,
    imageSubjectName,
    categoryFolderCode,
  ]);

  // ===================================================
  // 3. CATEGORY SELECTION
  // ===================================================

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    setLocalPreview(null);
    setSearch("");
    setError("");
  };

  // ===================================================
  // 4. CLEAR FILTERS
  // ===================================================

  const clearFilters = () => {
    setCategoryId("");
    setLocalImages([]);
    setLocalPreview(null);
    setSearch("");
    setError("");
  };

  // ===================================================
  // 5. RETRY
  // ===================================================

  const retry = async () => {
    await loadTopicData();
  };

  // ===================================================
  // 6. FILTER LOCAL IMAGES
  // ===================================================

  const filteredLocalImages = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return localImages;
    }

    return localImages.filter((item) =>
      item.title.toLowerCase().includes(searchValue)
    );
  }, [localImages, search]);

  // ===================================================
  // 7. CLOSE PREVIEW
  // ===================================================

  const closeLocalPreview = () => {
    setLocalPreview(null);
  };

  // ===================================================
  // 8. TOTAL WORKSHEET COUNT
  // ===================================================

  const totalVisible = filteredLocalImages.length;

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <main className="rmt-page">

      {/* =========================================
          HEADER
      ========================================== */}

      <header className="rmt-header">
        <div className="rmt-header__inner">

          {/* <button
            type="button"
            className="rmt-back"
            onClick={() => router.push(LIBRARY_HOME_ROUTE)}
          >
            <ArrowLeft size={17} />
            Back to Library
          </button> */}

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
              {/* <span className="rmt-eyebrow">
                PRINTABLE LEARNING RESOURCES
              </span> */}

              <h1>
                {topicOptions?.topicName ?? "Topic Worksheets"}
              </h1>

              {/* <p>
                Explore ready-made printable worksheets by category.
              </p> */}
            </div>

            <div className="rmt-header__icon">
              <BookOpen size={34} />
            </div>
          </div>
        </div>
      </header>

      {/* =========================================
          PAGE CONTENT
      ========================================== */}

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
                  <LoaderCircle
                    size={18}
                    className="rmt-spin"
                  />

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
                          active
                            ? "rmt-category-item--active"
                            : ""
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
                    ? "Browse, preview, print or download your worksheets."
                    : "Select a category from the sidebar to explore its worksheets."}
                </p>
              </div>

              <span className="rmt-result-count">
                {totalVisible} worksheets
              </span>
            </div>

            {/* SELECTED CATEGORY */}

            {selectedCategory && (
              <div className="rmt-selected-filters">
                <span>
                  Category: {selectedCategory.categoryName}
                </span>
              </div>
            )}

            {/* SEARCH */}

            {/* {selectedCategory && localImages.length > 0 && (
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
            )} */}

            {/* ERROR */}

            {error && (
              <div
                className="rmt-error rmt-error--dismissible"
                role="alert"
              >
                <div>
                  <strong>Unable to load topic resources</strong>
                  <p>{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void retry()}
                >
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            )}

            {/* ========================================
                MAIN CONTENT
            ========================================= */}

            {loadingTopic ? (
              <div className="rmt-state">

                <LoaderCircle
                  size={35}
                  className="rmt-spin"
                />

                <h3>Loading topic resources...</h3>

                <p>
                  Fetching available categories from your library.
                </p>

              </div>
            ) : (
              <>

                {/* NO CATEGORY SELECTED */}

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

                {/* ========================================
                    LOCAL IMAGE GALLERY
                ========================================= */}

                {selectedCategory &&
                  showLocalImages &&
                  filteredLocalImages.length > 0 && (
                    <>

                      {/* SECTION HEADER */}

                      {/* <div className="rmt-local-section-header">

                        {/* <div className="rmt-local-section-header__left">
                          <ImageIcon size={18} />

                          <span>
                            Printable Worksheets —{" "}
                            {selectedCategory.categoryName}
                          </span>
                        </div> 

                        <span className="rmt-local-count">
                          {filteredLocalImages.length} images
                        </span>

                      </div> */}

                      {/* IMAGE GRID */}

                      <div className="rmt-worksheet-grid rmt-local-grid">

                        {filteredLocalImages.map((item, index) => (
                          <article
                            key={`${item.src}-${index}`}
                            className="rmt-worksheet-card rmt-local-card"
                          >

                            {/* THUMBNAIL */}

                            <button
                              type="button"
                              className="rmt-worksheet-card__preview rmt-local-card__thumb"
                              onClick={() =>
                                setLocalPreview({
                                  src: item.src,
                                  title: item.title,
                                })
                              }
                              aria-label={`Preview ${item.title}`}
                            >

                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.src}
                                alt={item.title}
                                onError={(event) => {
                                  event.currentTarget.style.display =
                                    "none";

                                  const fallback =
                                    event.currentTarget
                                      .nextElementSibling as HTMLElement | null;

                                  if (fallback) {
                                    fallback.style.display = "flex";
                                  }
                                }}
                              />

                              {/* IMAGE FALLBACK */}

                              <span
                                className="rmt-local-card__fallback"
                                style={{ display: "none" }}
                              >
                                <FileText size={36} />

                                <small>
                                  Image unavailable
                                </small>
                              </span>

                            </button>

                            {/* CARD BODY */}

                            <div className="rmt-worksheet-card__body">

                              {/* <h3>{item.title}</h3> */}

                              {/* <div className="rmt-worksheet-meta"> */}
                                {/* <span>
                                  {selectedCategory.categoryName}
                                </span> */}
                              {/* </div> */}

                              {/* ACTION BUTTONS */}

                              <div className="rmt-local-card__actions">

                                {/* PREVIEW */}

                                <button
                                  type="button"
                                  className="rmt-local-btn rmt-local-btn--preview"
                                  onClick={() =>
                                    setLocalPreview({
                                      src: item.src,
                                      title: item.title,
                                    })
                                  }
                                >
                                  Preview

                                  <ArrowRight size={14} />
                                </button>

                                {/* PRINT */}

                                <button
                                  type="button"
                                  className="rmt-local-btn rmt-local-btn--print"
                                  onClick={() =>
                                    printLocalImage(item.src)
                                  }
                                >
                                  <Printer size={14} />

                                  Print
                                </button>

                                {/* DOWNLOAD */}

                                <a
                                  href={item.src}
                                  download
                                  className="rmt-local-btn rmt-local-btn--download"
                                >
                                  <Download size={14} />

                                  Download
                                </a>

                              </div>
                            </div>

                          </article>
                        ))}

                      </div>
                    </>
                  )}

                {/* ========================================
                    NO IMAGES FOR SELECTED CATEGORY
                ========================================= */}

                {selectedCategory &&
                  (!showLocalImages ||
                    filteredLocalImages.length === 0) && (
                    <div className="rmt-state">

                      <div className="rmt-state__icon">
                        {search ? (
                          <Search size={34} />
                        ) : (
                          <ImageIcon size={34} />
                        )}
                      </div>

                      <h3>
                        {search
                          ? "No Matching Worksheets"
                          : "No Worksheets Available"}
                      </h3>

                      <p>
                        {search
                          ? "Try another worksheet title or clear your search."
                          : `No worksheet images were found for ${selectedCategory.categoryName}. Image folder lookup: ${imageSubjectName}/${categoryFolderCode}. Please check the image folder and filenames.`}
                      </p>

                      {search && (
                        <button
                          type="button"
                          className="rmt-clear-filters"
                          onClick={() => setSearch("")}
                        >
                          <RefreshCw size={15} />
                          Clear Search
                        </button>
                      )}

                    </div>
                  )}

              </>
            )}

          </div>
        </div>
      </section>

      {/* =========================================
          LOCAL IMAGE PREVIEW MODAL
      ========================================== */}

      {localPreview && (
        <div
          className="rmt-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Worksheet image preview"
        >

          {/* BACKDROP */}

          <button
            type="button"
            className="rmt-modal__backdrop"
            onClick={closeLocalPreview}
            aria-label="Close preview"
          />

          {/* MODAL PANEL */}

          <div className="rmt-modal__panel">

            {/* HEADER */}

            <header className="rmt-modal__header">

              <div>
                <span>WORKSHEET PREVIEW</span>

                <h2>{localPreview.title}</h2>

                <p>
                  {selectedCategory?.categoryName ?? ""}
                </p>
              </div>

              <button
                type="button"
                onClick={closeLocalPreview}
                aria-label="Close"
              >
                <X size={21} />
              </button>

            </header>

            {/* IMAGE */}

            <div className="rmt-modal__content">

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={localPreview.src}
                alt={localPreview.title}
              />

            </div>

            {/* FOOTER */}

            <footer className="rmt-modal__footer">

              <a
                href={localPreview.src}
                download
                className="rmt-modal__download"
              >
                <Download size={17} />

                Download
              </a>

              <button
                type="button"
                className="rmt-modal__print"
                onClick={() =>
                  printLocalImage(localPreview.src)
                }
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
