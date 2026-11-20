// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   ArrowLeft,
//   ArrowRight,
//   BookOpen,
//   ChevronRight,
//   Download,
//   LoaderCircle,
//   Printer,
//   RefreshCw,
//   Search,
//   Sparkles,
//   X,
// } from "lucide-react";

// import "@/app/components/components.css";

// // =====================================================
// // API CONFIGURATION
// // =====================================================

// const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

// // =====================================================
// // API RESPONSE TYPES
// // =====================================================

// type ApiEnvelope<T> = {
//   success?: boolean;
//   Success?: boolean;
//   message?: string;
//   Message?: string;
//   data?: T;
//   Data?: T;
//   errors?: string[];
//   Errors?: string[];
// };

// // =====================================================
// // SUBJECT AND CATEGORY TYPES
// // =====================================================

// interface Topic {
//   topicId: number;
//   topicName: string;
//   slug: string;

//   // Prefer categoryCode/code from your API.
//   // If neither exists, slug is used as a fallback.
//   categoryCode?: string | null;
//   code?: string | null;

//   description?: string | null;
// }

// interface Subject {
//   subjectId: number;
//   subjectName: string;
//   slug: string;
//   topics: Topic[];
// }

// // =====================================================
// // LOCAL WORKSHEET IMAGE
// // =====================================================

// interface WorksheetImage {
//   id: string;
//   url: string;
//   title: string;
// }

// // =====================================================
// // PAGE STAGE
// // =====================================================

// type Stage = "subjects" | "images";

// // =====================================================
// // API GET HELPER
// // Supports raw responses and ResponceDto wrappers.
// // =====================================================

// async function apiGet<T>(endpoint: string): Promise<T> {
//   if (!API_BASE) {
//     throw new Error("NEXT_PUBLIC_API_URL is not configured in .env.local.");
//   }

//   const response = await fetch(`${API_BASE}${endpoint}`, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//     },
//     cache: "no-store",
//   });

//   let json: unknown;

//   try {
//     json = await response.json();
//   } catch {
//     throw new Error(`API returned invalid JSON (${response.status}).`);
//   }

//   const object =
//     typeof json === "object" && json !== null && !Array.isArray(json)
//       ? (json as Record<string, unknown>)
//       : null;

//   if (!response.ok) {
//     const errors = object?.Errors ?? object?.errors;

//     const errorMessage =
//       Array.isArray(errors) && errors.length > 0
//         ? errors.join("; ")
//         : String(
//             object?.detail ??
//               object?.Detail ??
//               object?.message ??
//               object?.Message ??
//               object?.title ??
//               object?.Title ??
//               `API request failed (${response.status}).`,
//           );

//     throw new Error(errorMessage);
//   }

//   if (object) {
//     const isEnvelope =
//       "success" in object ||
//       "Success" in object ||
//       "data" in object ||
//       "Data" in object ||
//       "errors" in object ||
//       "Errors" in object;

//     if (isEnvelope) {
//       const envelope = json as ApiEnvelope<T>;
//       const success = envelope.success ?? envelope.Success;

//       if (success === false) {
//         const errors = envelope.errors ?? envelope.Errors ?? [];

//         throw new Error(
//           errors.length
//             ? errors.join("; ")
//             : (envelope.message ?? envelope.Message ?? "API request failed."),
//         );
//       }

//       const data = envelope.data ?? envelope.Data;

//       if (data == null) {
//         throw new Error(
//           envelope.message ?? envelope.Message ?? "API returned no data.",
//         );
//       }

//       return data;
//     }
//   }

//   if (json == null) {
//     throw new Error("API returned no data.");
//   }

//   return json as T;
// }

// // =====================================================
// // GET CATEGORY CODE
// // =====================================================

// function getCategoryCode(topic: Topic): string {
//   return (
//     topic.categoryCode?.trim() || topic.code?.trim() || topic.slug?.trim() || ""
//   );
// }

// // =====================================================
// // GET IMAGE TITLE
// // =====================================================

// function getImageTitle(imageUrl: string, index: number): string {
//   const filename = imageUrl.split("/").pop() ?? `Worksheet ${index + 1}`;

//   return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
// }

// // =====================================================
// // MAIN COMPONENT
// // =====================================================

// export default function PrintableWorksheetsGallery() {
//   // ---------------------------------------------------
//   // DATA
//   // ---------------------------------------------------

//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [images, setImages] = useState<WorksheetImage[]>([]);

//   // ---------------------------------------------------
//   // SELECTED ITEMS
//   // ---------------------------------------------------

//   const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

//   const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

//   const [preview, setPreview] = useState<WorksheetImage | null>(null);

//   // ---------------------------------------------------
//   // UI STATES
//   // ---------------------------------------------------

//   const [stage, setStage] = useState<Stage>("subjects");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");

//   // ===================================================
//   // 1. LOAD SUBJECTS AND THEIR CATEGORIES
//   // ===================================================

//   const loadSubjects = useCallback(async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const subjectRows = await apiGet<Omit<Subject, "topics">[]>(
//         "/api/pre-generated-worksheets/subjects",
//       );

//       const subjectsWithTopics = await Promise.all(
//         subjectRows.map(async (item) => {
//           const topics = await apiGet<Topic[]>(
//             `/api/pre-generated-worksheets/subjects/${item.subjectId}/topics`,
//           );

//           return {
//             ...item,
//             topics: Array.isArray(topics) ? topics : [],
//           };
//         }),
//       );

//       setSubjects(subjectsWithTopics);
//     } catch (err) {
//       setSubjects([]);

//       setError(err instanceof Error ? err.message : "Unable to load subjects.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     void loadSubjects();
//   }, [loadSubjects]);

//   // ===================================================
//   // 2. OPEN CATEGORY AND LOAD LOCAL IMAGES
//   //
//   // Example:
//   // Subject: Addition
//   // Category code: c1
//   // public/Addition/c1/a11.jpg
//   // URL: /Addition/c1/a11.jpg
//   // ===================================================

//   const handleTopicClick = (
//     selectedSubjectItem: Subject,
//     selectedTopicItem: Topic,
//   ) => {
//     setError("");
//     setSearch("");
//     setPreview(null);

//     const categoryCode = getCategoryCode(selectedTopicItem);

//     if (!categoryCode) {
//       setImages([]);
//       setSelectedSubject(selectedSubjectItem);
//       setSelectedTopic(selectedTopicItem);
//       setStage("images");

//       setError(
//         "This category does not have a category code. Please provide categoryCode, code, or a slug such as c1 from the API.",
//       );

//       return;
//     }

//     const imageUrls = getWorksheetImages(
//       selectedSubjectItem.subjectName,
//       categoryCode,
//     );

//     const imageRows: WorksheetImage[] = imageUrls.map(
//       (url: string, index: number): WorksheetImage => ({
//         id: `${selectedTopicItem.topicId}-${index}`,
//         url,
//         title: getImageTitle(url, index),
//       }),
//     );

//     setSelectedSubject(selectedSubjectItem);
//     setSelectedTopic(selectedTopicItem);
//     setImages(imageRows);
//     setStage("images");
//   };

//   // ===================================================
//   // 3. GO BACK TO SUBJECTS
//   // ===================================================

//   const goHome = () => {
//     setStage("subjects");

//     setSelectedSubject(null);
//     setSelectedTopic(null);
//     setPreview(null);

//     setImages([]);
//     setSearch("");
//     setError("");
//   };

//   // ===================================================
//   // 4. GO BACK TO CATEGORY LIST
//   // ===================================================

//   const goBack = () => {
//     goHome();
//   };

//   // ===================================================
//   // 5. RETRY
//   // ===================================================

//   const retryCurrentStage = async () => {
//     setError("");

//     if (stage === "subjects") {
//       await loadSubjects();
//       return;
//     }

//     if (!selectedSubject || !selectedTopic) {
//       return;
//     }

//     handleTopicClick(selectedSubject, selectedTopic);
//   };

//   // ===================================================
//   // 6. FILTER SUBJECTS
//   // ===================================================

//   const filteredSubjects = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) return subjects;

//     return subjects.filter((item) => {
//       const subjectMatches = item.subjectName.toLowerCase().includes(query);

//       const topicMatches = item.topics.some((topic) =>
//         topic.topicName.toLowerCase().includes(query),
//       );

//       return subjectMatches || topicMatches;
//     });
//   }, [subjects, search]);

//   // ===================================================
//   // 7. FILTER IMAGES
//   // ===================================================

//   const filteredImages = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) return images;

//     return images.filter((item) => item.title.toLowerCase().includes(query));
//   }, [images, search]);

//   // ===================================================
//   // 8. PAGE TITLE AND DESCRIPTION
//   // ===================================================

//   const pageTitle =
//     stage === "subjects"
//       ? "Ready-Made Worksheets"
//       : `${selectedTopic?.topicName ?? "Category"} Worksheets`;

//   const pageDescription =
//     stage === "subjects"
//       ? "Choose a subject and category to explore ready-made printable worksheets."
//       : "Browse the available worksheets in this category. Preview, download, or print any worksheet.";

//   // ===================================================
//   // 9. PRINT IMAGE
//   // ===================================================

//   const printImage = (imageUrl: string) => {
//     const printWindow = window.open("", "_blank");

//     if (!printWindow) {
//       setError(
//         "The print window was blocked. Please allow pop-ups and try again.",
//       );
//       return;
//     }

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Print Worksheet</title>
//           <style>
//             @page {
//               size: A4;
//               margin: 10mm;
//             }

//             html, body {
//               margin: 0;
//               padding: 0;
//               width: 100%;
//               height: 100%;
//             }

//             body {
//               display: flex;
//               align-items: center;
//               justify-content: center;
//             }

//             img {
//               display: block;
//               max-width: 100%;
//               max-height: 100vh;
//               object-fit: contain;
//             }
//           </style>
//         </head>
//         <body>
//           <img id="worksheet-image" src="${imageUrl}" alt="Worksheet" />
//           <script>
//             const image = document.getElementById("worksheet-image");

//             image.onload = () => {
//               window.focus();
//               window.print();
//             };

//             image.onerror = () => {
//               document.body.innerHTML = "Unable to load worksheet image.";
//             };
//           </script>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//   };

//   // ===================================================
//   // MAIN UI
//   // ===================================================

//   return (
//     <main className="rml-page">
//       <section className="rml-hero">
//         <div className="rml-hero__decor rml-hero__decor--one" />
//         <div className="rml-hero__decor rml-hero__decor--two" />

//         <div className="rml-container">
//           <div className="rml-hero__eyebrow">
//             <Sparkles size={15} />
//             <span>LEARNING RESOURCE LIBRARY</span>
//           </div>

//           <h1 className="rml-hero__title">{pageTitle}</h1>

//           <p className="rml-hero__description">{pageDescription}</p>

//           <div className="rml-hero__search">
//             <Search size={19} />

//             <input
//               type="search"
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//               placeholder={
//                 stage === "subjects"
//                   ? "Search subjects or categories..."
//                   : "Search worksheets..."
//               }
//               aria-label="Search library"
//             />

//             {search && (
//               <button
//                 type="button"
//                 onClick={() => setSearch("")}
//                 aria-label="Clear search"
//               >
//                 <X size={17} />
//               </button>
//             )}
//           </div>
//         </div>
//       </section>

//       <section className="rml-content">
//         <div className="rml-container">
//           {/* BREADCRUMB */}

//           <nav className="rml-breadcrumb" aria-label="Breadcrumb">
//             <button type="button" onClick={goHome}>
//               Library
//             </button>

//             {selectedSubject && (
//               <>
//                 <ChevronRight size={15} />
//                 <span>{selectedSubject.subjectName}</span>
//               </>
//             )}

//             {selectedTopic && (
//               <>
//                 <ChevronRight size={15} />
//                 <span>{selectedTopic.topicName}</span>
//               </>
//             )}
//           </nav>

//           {/* BACK BUTTON */}

//           {stage === "images" && (
//             <button type="button" className="rml-back-button" onClick={goBack}>
//               <ArrowLeft size={17} />
//               Back to Subjects
//             </button>
//           )}

//           {/* SECTION HEADING */}

//           <div className="rml-section-heading">
//             <div>
//               <span className="rml-section-heading__eyebrow">
//                 {stage === "subjects"
//                   ? "BROWSE BY SUBJECT"
//                   : "AVAILABLE WORKSHEETS"}
//               </span>

//               <h2>
//                 {stage === "subjects"
//                   ? "Explore Subjects"
//                   : "Choose Your Worksheet"}
//               </h2>
//             </div>

//             {!loading && (
//               <span className="rml-count">
//                 {stage === "subjects"
//                   ? filteredSubjects.length
//                   : filteredImages.length}{" "}
//                 {stage === "subjects" ? "subjects" : "worksheets"}
//               </span>
//             )}
//           </div>

//           {/* ERROR MESSAGE */}

//           {error && (
//             <div className="rml-error" role="alert">
//               <div>
//                 <strong>Unable to load library data</strong>
//                 <p>{error}</p>
//               </div>

//               <button type="button" onClick={() => void retryCurrentStage()}>
//                 <RefreshCw size={16} />
//                 Retry
//               </button>
//             </div>
//           )}

//           {/* LOADING */}

//           {loading ? (
//             <div className="rml-loading">
//               <LoaderCircle size={34} className="rml-loading__spinner" />
//               <span>Loading learning resources...</span>
//             </div>
//           ) : (
//             <>
//               {/* =====================================
//                   SUBJECT CARDS AND CATEGORY LINKS
//               ====================================== */}

//               {stage === "subjects" && (
//                 <>
//                   <div className="rml-grid rml-grid--subjects">
//                     {filteredSubjects.map((item, index) => (
//                       <article
//                         key={item.subjectId}
//                         className={`rml-card rml-subject-card rml-subject-card--${index % 4}`}
//                       >
//                         <div className="rml-subject-card__icon">
//                           <BookOpen size={27} />
//                         </div>

//                         <div className="rml-card__body">
//                           <h3>{item.subjectName}</h3>

//                           <p>{item.topics.length} available categories</p>
//                         </div>

//                         <div className="rml-subject-card__categories">
//                           <span className="rml-subject-card__categories-title">
//                             CATEGORIES
//                           </span>

//                           {item.topics.length > 0 ? (
//                             item.topics.map((topicItem) => (
//                               <button
//                                 type="button"
//                                 key={topicItem.topicId}
//                                 className="rml-category-link"
//                                 onClick={() =>
//                                   handleTopicClick(item, topicItem)
//                                 }
//                               >
//                                 <span>{topicItem.topicName}</span>
//                                 <small>Explore</small>
//                                 <ArrowRight size={15} />
//                               </button>
//                             ))
//                           ) : (
//                             <p className="rml-no-categories">
//                               No active categories available.
//                             </p>
//                           )}
//                         </div>
//                       </article>
//                     ))}
//                   </div>

//                   {!filteredSubjects.length && (
//                     <EmptyState message="No active subjects or categories were returned by the backend." />
//                   )}
//                 </>
//               )}

//               {/* =====================================
//                   CATEGORY WORKSHEET IMAGES
//                   Images come from the public folder.
//               ====================================== */}

//               {/* {stage === "images" && (
//                 <>
//                   <div className="rml-grid rml-grid--worksheets">
//                     {filteredImages.map((item, index) => (
//                       <article
//                         className={`rml-card rml-worksheet-card rml-worksheet-card--${index % 3}`}
//                         key={item.id}
//                       >
//                         <button
//                           type="button"
//                           className="rml-worksheet-card__preview"
//                           onClick={() => setPreview(item)}
//                         >
//                           <img src={item.url} alt={item.title} loading="lazy" />
//                         </button>

//                         <div className="rml-worksheet-card__body">
//                           <h3>{item.title}</h3>

//                           <div className="rml-worksheet-card__meta">
//                             <span>{selectedSubject?.subjectName}</span>
//                             <span>{selectedTopic?.topicName}</span>
//                           </div>

//                           <button
//                             type="button"
//                             className="rml-card__action rml-inline-action"
//                             onClick={() => setPreview(item)}
//                           >
//                             Preview
//                             <ArrowRight size={16} />
//                           </button>
//                         </div>
//                       </article>
//                     ))}
//                   </div>

//                   {!filteredImages.length && !error && (
//                     <EmptyState message="No images are registered for this subject and category. Check the image map and make sure the files exist in the matching public folder." />
//                   )}
//                 </>
//               )} */}
//             </>
//           )}
//         </div>
//       </section>

//       {/* =========================================
//           WORKSHEET PREVIEW MODAL
//       ========================================== */}

//       {preview && (
//         <div
//           className="rml-modal"
//           role="dialog"
//           aria-modal="true"
//           aria-label="Worksheet preview"
//         >
//           <button
//             className="rml-modal__backdrop"
//             type="button"
//             aria-label="Close preview"
//             onClick={() => setPreview(null)}
//           />

//           <div className="rml-modal__panel">
//             <header className="rml-modal__header">
//               <div>
//                 <span className="rml-modal__eyebrow">WORKSHEET PREVIEW</span>

//                 <h2>{preview.title}</h2>

//                 <p>
//                   {selectedSubject?.subjectName} · {selectedTopic?.topicName}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 className="rml-modal__close"
//                 onClick={() => setPreview(null)}
//                 aria-label="Close"
//               >
//                 <X size={21} />
//               </button>
//             </header>

//             <div className="rml-modal__content">
//               <img
//                 className="rml-modal__image"
//                 src={preview.url}
//                 alt={preview.title}
//               />
//             </div>

//             <footer className="rml-modal__footer">
//               <a
//                 className="rml-modal__button rml-modal__button--secondary"
//                 href={preview.url}
//                 download
//               >
//                 <Download size={17} />
//                 Download
//               </a>

//               <button
//                 className="rml-modal__button rml-modal__button--primary"
//                 type="button"
//                 onClick={() => printImage(preview.url)}
//               >
//                 <Printer size={17} />
//                 Print
//               </button>
//             </footer>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

// // =====================================================
// // EMPTY STATE
// // =====================================================

// function EmptyState({ message }: { message: string }) {
//   return (
//     <div className="rml-empty">
//       <div className="rml-empty__icon">
//         <BookOpen size={28} />
//       </div>

//       <h3>No resources available</h3>
//       <p>{message}</p>
//     </div>
//   );
// }

// // Add local worksheets here using the public-folder layout:
// // /<Subject>/<categoryCode>/<filename>.
// const WORKSHEET_IMAGE_MAP: Record<string, readonly string[]> = {
//   "addition/c1": ["/Addition/c1/a11.jpg"],
// };

// function getWorksheetImages(
//   subjectName: string,
//   categoryCode: string,
// ): string[] {
//   const normalizedSubject = subjectName
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
//   const normalizedCategory = categoryCode.trim().toLowerCase();

//   if (!normalizedSubject || !normalizedCategory) {
//     return [];
//   }

//   return [...(WORKSHEET_IMAGE_MAP[`${normalizedSubject}/${normalizedCategory}`] ?? [])];
// }
