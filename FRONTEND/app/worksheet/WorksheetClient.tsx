"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Printer,
  RefreshCw,
  Check,
  Sparkles,
  ArrowLeft,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import GeneratedQuestionRenderer from "@/renderer/GeneratedQuestionRenderer";
import "@/styles/worksheet.css";
import {
  GeneratedQuestion,
  GeneratedWorksheetResponse,
  NumberLineOption,
  QuestionData,
  SchoolDetails,
} from "./type";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const GENERATE_WORKSHEET_URL = `${API_URL}/api/GeneratedWorksheet/generate`;

const defaultSchoolDetails: SchoolDetails = {
  schoolName: "",
  studentName: "",
  grade: "",
  date: new Date().toISOString().split("T")[0],
  teacherName: "",
  section: "",
};

function parseQuestionData(json?: string | null): QuestionData {
  if (!json) {
    return {};
  }

  try {
    const parsed = JSON.parse(json);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as QuestionData;
  } catch (error) {
    console.error("Invalid questionDataJson:", json, error);
    return {};
  }
}

function parseCorrectAnswers(answer?: string | null): string[] {
  if (answer === null || answer === undefined || answer === "") {
    return [];
  }

  const normalized = String(answer).trim();

  if (!normalized) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(normalized);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim());
    }

    if (
      typeof parsed === "string" ||
      typeof parsed === "number" ||
      typeof parsed === "boolean"
    ) {
      return [String(parsed).trim()];
    }
  } catch {
    return [normalized];
  }

  return [normalized];
}

function answerMatches(
  value: string | number,
  correctAnswers: string[],
): boolean {
  const normalizedValue = String(value).trim().toLowerCase();

  return correctAnswers.some(
    (answer) => String(answer).trim().toLowerCase() === normalizedValue,
  );
}

function LoadingScreen() {
  return (
    <div className="ws-worksheet-loading">
      <RefreshCw
        className="animate-spin ws-worksheet-loading__icon"
        size={36}
      />

      <p className="ws-worksheet-loading__text">
        Generating your interactive worksheet...
      </p>
    </div>
  );
}

function ErrorScreen({message,onRetry,}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="ws-worksheet-error">
      <AlertCircle
        size={40}
        className="ws-worksheet-error__icon"
      />

      <h3 className="ws-worksheet-error__title">
        Generation Failed
      </h3>

      <p className="ws-worksheet-error__message">
        {message}
      </p>

      <button
        onClick={onRetry}
        className="ws-success__btn ws-success__btn--primary"
      >
        Try Again
      </button>
    </div>
  );
}
function AnswerBox({ answer }: { answer: string }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      className="generated-question__answer-box"
    >
      <Sparkles size={16} />

      <span>Correct Answer: {answer}</span>
    </motion.div>
  );
}

export default function WorksheetPage({ worksheetId }: { worksheetId?: number }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WorksheetInner worksheetId={worksheetId}/>
    </Suspense>
  );
}

function WorksheetInner({ worksheetId }: { worksheetId?: number }) {
  const params = useSearchParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);
  const topicId = Number(params.get("topicId") ?? 0);
  const levelId = Number(params.get("levelId") ?? 0);
  const difficultyId = Number(params.get("difficultyId") ?? 0);
  const visualStyleParam = params.get("visualStyleId");

  const visualStyleId =
    visualStyleParam !== null &&
    visualStyleParam !== "" &&
    !Number.isNaN(Number(visualStyleParam))
      ? Number(visualStyleParam)
      : null;

  const questionCount = Number(params.get("questionCount") ?? 0);

  const worksheetCategoryId = Number(
    params.get("worksheetCategoryId") ?? params.get("categoryId") ?? 0,
  );

  const questionTypeIds = useMemo(() => {
    const raw = params.get("questionTypeIds") ?? "";

    if (!raw) {
      return [];
    }

    return raw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);
  }, [params]);

  const loadWorksheetById = useCallback(async () => {
    if (!worksheetId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDone(false);
      setUserAnswers({});

      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(
        `${API_URL}/api/GeneratedWorksheet/${worksheetId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        let message = "Failed to load worksheet.";

        try {
          const errorData = JSON.parse(errorText);
          message =
            errorData?.message ||
            errorData?.error ||
            errorData?.title ||
            message;
        } catch {
          message = errorText || message;
        }

        throw new Error(message);
      }

      const data = (await response.json()) as GeneratedWorksheetResponse;

      if (!data || !Array.isArray(data.questions)) {
        throw new Error("Invalid worksheet response from server.");
      }

      setWorksheet(data);
      setDetails({
        schoolName: data.schoolName ?? "",
        studentName: data.studentName ?? "",
        grade: data.gradeName ?? "",
        date: defaultSchoolDetails.date,
        teacherName: data.teacherName ?? "",
        section: data.section ?? "",
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the worksheet.",
      );
    } finally {
      setLoading(false);
    }
  }, [worksheetId]);

  const [worksheet, setWorksheet] = useState<GeneratedWorksheetResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [details, setDetails] = useState<SchoolDetails>(defaultSchoolDetails);
  const [showForm, setShowForm] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const handleAnswerChange = (questionId: number, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const generateWorksheet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDone(false);
      setUserAnswers({});

      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      if (!topicId) {
        throw new Error("Topic ID is missing.");
      }

      if (!levelId) {
        throw new Error("Learning level ID is missing.");
      }
      if (!worksheetCategoryId) {
        throw new Error("Worksheet category ID is missing.");
      }
      if (!difficultyId) {
        throw new Error("Difficulty ID is missing.");
      }

      if (!questionCount || questionCount <= 0) {
        throw new Error("Question count is invalid.");
      }

      if (questionTypeIds.length === 0) {
        throw new Error("No question types were selected.");
      }
      const requestBody = {
        topicId,
        levelId,
        worksheetCategoryId,
        difficultyId,
        ...(visualStyleId !== null ? { visualStyleId } : {}),
        questionCount,
        questionTypeIds,
        schoolName: details.schoolName.trim() || null,
        studentName: details.studentName.trim() || null,
        gradeName: details.grade.trim() || null,
        section: details.section.trim() || null,
        teacherName: details.teacherName.trim() || null,
      };

      console.log("GENERATE REQUEST:", requestBody);

      const response = await fetch(GENERATE_WORKSHEET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorText = await response.text();

        console.error("GENERATE API ERROR:", response.status, errorText);

        let message = "Failed to generate worksheet.";

        try {
          const errorData = JSON.parse(errorText);
          console.error("BACKEND ERROR DATA:", errorData);
          message =
            errorData?.message ||
            errorData?.error ||
            errorData?.title ||
            message;

          if (Array.isArray(errorData?.invalidQuestionTypeIds)) {
            message +=
              ` Invalid Question Type IDs: ` +
              errorData.invalidQuestionTypeIds.join(", ");
          }
        } catch {
          message = errorText || message;
        }

        throw new Error(message);
      }

      const data = (await response.json()) as GeneratedWorksheetResponse;

      if (!data || !Array.isArray(data.questions)) {
        throw new Error("Invalid worksheet response from server.");
      }

      console.log("GENERATED WORKSHEET:", data);

      setWorksheet(data);

      setDone(true);
      router.replace(`/worksheet/${data.generatedWorksheetId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the worksheet.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    topicId,
    levelId,
    worksheetCategoryId,
    difficultyId,
    visualStyleId,
    questionCount,
    questionTypeIds,
    details,
    router,
  ]);
  useEffect(() => {
    if (hasGeneratedRef.current) {
      return;
    }
    hasGeneratedRef.current = true;

    if (worksheetId) {
      void loadWorksheetById();
      return;
    }

    void generateWorksheet();
  }, [worksheetId, loadWorksheetById, generateWorksheet]);

  const handleDownloadPdf = () => {
    window.print();
  };
  const handleRetry = () => {
    hasGeneratedRef.current = true;

    if (worksheetId) {
      void loadWorksheetById();
      return;
    }

    void generateWorksheet();
  };

  if (loading) {
    return <LoadingScreen />;
  }
  if (error || !worksheet) {
    return (
      <ErrorScreen
        message={error ?? "Worksheet could not be generated."}
        onRetry={handleRetry}
      />
    );
  }
  const worksheetTitle = worksheet.worksheetTitle || "Worksheet";
  const questions = worksheet.questions ?? [];
  return (
    <main className="ws-page ws-page--with-bottom-padding">
      <AnimatePresence>
        {done && (
          <motion.div
            className="ws-success no-print"
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
          >
            <div className="container ws-success__inner">
              <div className="ws-success__left">
                <motion.span
                  className="ws-success__emoji"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                >
                  🎉
                </motion.span>

                <div>
                  <h2 className="ws-success__title">Worksheet Ready!</h2>

                  <p className="ws-success__sub">
                    {questions.length} questions · Interactive &amp; Printable
                  </p>
                </div>
              </div>

              <div className="ws-success__actions">
                <button
                  className="ws-success__btn ws-success__btn--outline"
                  onClick={() => setShowForm((value) => !value)}
                >
                  {showForm ? <Check size={16} /> : <Sparkles size={16} />}

                  {showForm ? "Details saved" : "Add details"}
                </button>

                <button
                  className={`ws-success__btn ${
                    showAnswers
                      ? "ws-success__btn--primary"
                      : "ws-success__btn--outline"
                  }`}
                  onClick={() => setShowAnswers((value) => !value)}
                >
                  {showAnswers ? "Hide Evaluation" : "Check Answers"}
                </button>

                <button
                  className="ws-success__btn ws-success__btn--primary"
                  onClick={handleDownloadPdf}
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container ws-page__body ws-page__body--offset-top">
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="no-print"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <div className="ws-page__form-wrap ws-page__form-wrap--mb-24">
                <div className="school-details-card">
                  <div className="school-details-header">
                    <h3 className="school-details-title">
                      School &amp; Student Details
                    </h3>

                    <p className="school-details-subtitle">
                      Personalize the header for your printout.
                    </p>
                  </div>

                  <div className="school-details-grid">
                    <div className="form-group form-group--full">
                      <label htmlFor="schoolName">School Name</label>

                      <input
                        id="schoolName"
                        type="text"
                        placeholder="e.g. Oakridge Elementary"
                        value={details.schoolName}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            schoolName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group form-group--full">
                      <label htmlFor="studentName">Student Name</label>

                      <input
                        id="studentName"
                        type="text"
                        placeholder="e.g. Alex Johnson"
                        value={details.studentName}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            studentName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="grade">Grade</label>

                      <input
                        id="grade"
                        type="text"
                        placeholder="e.g. Grade 2"
                        value={details.grade}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            grade: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="section">Section</label>

                      <input
                        id="section"
                        type="text"
                        placeholder="e.g. A"
                        value={details.section}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            section: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group form-group--full">
                      <label htmlFor="teacherName">Teacher Name</label>

                      <input
                        id="teacherName"
                        type="text"
                        placeholder="e.g. Ms. Davis"
                        value={details.teacherName}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            teacherName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className="ws-print-area ws-print-area--interactive-view"
          ref={printRef}
        >
          <div className="ws-print__header">
            <div className="ws-print__brand">
              <span className="ws-print__brand-icon">📚</span>

              <span className="ws-print__brand-name">LearnSpark</span>
            </div>

            <div className="ws-print__title-wrap">
              <h1 className="ws-print__title">🔢 {worksheetTitle}</h1>

              <p className="ws-print__subtitle">
                Interactive &amp; Printable Worksheet
              </p>
            </div>

            <div className="ws-print__fields">
              <div className="ws-print__field-row">
                <span className="ws-print__field-label">School:</span>

                <span className="ws-print__field-value ws-print__field-line">
                  {details.schoolName || "\u00A0"}
                </span>
              </div>

              <div className="ws-print__field-row">
                <span className="ws-print__field-label">Student:</span>

                <span className="ws-print__field-value ws-print__field-line">
                  {details.studentName || "\u00A0"}
                </span>
              </div>

              <div className="ws-print__fields-inline">
                <div className="ws-print__field-row">
                  <span className="ws-print__field-label">Grade:</span>

                  <span className="ws-print__field-value ws-print__field-line ws-print__field-short">
                    {details.grade || "\u00A0"}
                  </span>
                </div>

                <div className="ws-print__field-row">
                  <span className="ws-print__field-label">Section:</span>

                  <span className="ws-print__field-value ws-print__field-line ws-print__field-short">
                    {details.section || "\u00A0"}
                  </span>
                </div>

                <div className="ws-print__field-row">
                  <span className="ws-print__field-label">Date:</span>

                  <span className="ws-print__field-value ws-print__field-line ws-print__field-short">
                    {details.date || "\u00A0"}
                  </span>
                </div>
              </div>

              {details.teacherName && (
                <div className="ws-print__field-row">
                  <span className="ws-print__field-label">Teacher:</span>

                  <span className="ws-print__field-value">
                    {details.teacherName}
                  </span>
                </div>
              )}
            </div>

            <div className="ws-print__divider" />

            <div className="ws-print__instructions">
              <span className="ws-print__instructions-icon">💡</span>

              <p>
                Look carefully at the objects, count them, and write the correct
                answer.
              </p>
            </div>
          </div>
          <div className="ws-print__questions ws-print__questions--spaced">
            {questions.map((question) => (
              <div
                key={question.generatedQuestionId}
                className="ws-print__q-wrap ws-print__q-wrap--dashed"
              >
                <span className="ws-print__q-num">
                  {question.questionNumber}.
                </span>

                <div className="ws-print__q-body ws-print__q-body--full">
                  <GeneratedQuestionRenderer
                    question={question}
                    showAnswers={showAnswers}
                    userAnswer={userAnswers[question.generatedQuestionId]}
                    onAnswerChange={(value) =>
                      handleAnswerChange(question.generatedQuestionId, value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="ws-print__footer">
            <div className="ws-print__footer-score">
              <span>Score:</span>

              <span className="ws-print__footer-score-box">
                ______ / {questions.length}
              </span>
            </div>

            <div className="ws-print__footer-brand">📚 LearnSpark</div>
          </div>
        </div>

        <div className="ws-page__bottom ws-page__bottom--mt-32 no-print">
          <Link href="/math/odd-even" className="ws-page__back">
            <ArrowLeft size={16} />
            Create Another Worksheet
          </Link>

          <div className="ws-page__bottom-actions">
            <button
              className="ws-page__bottom-btn ws-page__bottom-btn--outline"
              onClick={handleRetry}
            >
              <RefreshCw size={15} />
              New Version
            </button>

            <button
              className="ws-page__bottom-btn ws-page__bottom-btn--primary"
              onClick={handleDownloadPdf}
            >
              <Download size={15} />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}