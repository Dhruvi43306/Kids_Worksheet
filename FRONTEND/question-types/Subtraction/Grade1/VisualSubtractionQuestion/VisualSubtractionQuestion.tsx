"use client";

import type { ReactNode } from "react";

import {
  CalendarDays,
  Check,
  Droplets,
  Package,
  PackageOpen,
  X,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";

import {
  AnswerBox,
  answerMatches,
} from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

// ======================================================
// TYPES
// ======================================================

type CalendarDayData = {
  day: number;
  isStartDay?: boolean;
  isTargetDay?: boolean;
  isBetweenDates?: boolean;
};

type CalendarData = {
  min: number;
  max: number;
};

type VisualBlockData = {
  position: number;
  state: string;
  isFilled: boolean;
};

type VisualSubtractionData = QuestionData & {
  questionType?: string;

  calendar?: CalendarData;
  calendarDays?: CalendarDayData[];
  startDay?: number;
  targetDay?: number;
  daysBack?: number;

  blocks?: VisualBlockData[];
  startCount?: number;
  emptiedCount?: number;
  remainingCount?: number;

  icon?: string;
  totalCount?: number;
  visibleCount?: number;
  hiddenCount?: number;
  visibleObjects?: string[];

  equation?: string;
  selectionMode?: string;
  answerType?: string;
};

// ======================================================
// COMPONENT
// ======================================================

export default function VisualSubtractionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const visualData = data as VisualSubtractionData;

  const questionType = (
    question.questionTypeCode?.trim() ||
    visualData.questionType?.trim() ||
    ""
  ).toUpperCase();

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const hasAnswer = currentAnswer.trim().length > 0;

  const isCorrect =
    hasAnswer &&
    answerMatches(currentAnswer, correctAnswers);

  const correctAnswer = correctAnswers[0] ?? "";

  const answerId =
    `visual-subtraction-answer-${question.generatedQuestionId}`;

  let answerClassName =
    "visual-subtraction-question__answer-input";

  if (showAnswers && hasAnswer) {
    answerClassName += isCorrect
      ? " visual-subtraction-question__answer-input--correct"
      : " visual-subtraction-question__answer-input--wrong";
  }

  // ======================================================
  // CALENDAR DATA
  // ======================================================

  const calendarMin = visualData.calendar?.min ?? 1;
  const calendarMax = visualData.calendar?.max ?? 31;

  const startDay = visualData.startDay ?? 0;
  const targetDay = visualData.targetDay ?? 0;

  const calendarDays: CalendarDayData[] =
    visualData.calendarDays?.length
      ? visualData.calendarDays
      : Array.from(
          {
            length: Math.max(
              0,
              calendarMax - calendarMin + 1,
            ),
          },
          (_, index) => {
            const day = calendarMin + index;

            return {
              day,
              isStartDay: day === startDay,
              isTargetDay: day === targetDay,
              isBetweenDates:
                day > targetDay && day < startDay,
            };
          },
        );

  // ======================================================
  // CALENDAR SUBTRACTION UI
  // ======================================================

  const renderCalendarQuestion = () => (
    <div className="visual-subtraction-question__calendar-panel">
      <div className="visual-subtraction-question__calendar-topbar">
        <div className="visual-subtraction-question__calendar-title-wrap">
          <div className="visual-subtraction-question__calendar-icon">
            <CalendarDays
              size={26}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="visual-subtraction-question__calendar-eyebrow">
              CALENDAR CHALLENGE
            </p>

            <h4 className="visual-subtraction-question__calendar-title">
              Count Backward
            </h4>
          </div>
        </div>

        <span className="visual-subtraction-question__calendar-badge">
          {calendarMax} DAYS
        </span>
      </div>

      <div className="visual-subtraction-question__calendar-body">
        <div
          className="visual-subtraction-question__calendar-grid"
          role="list"
          aria-label="Calendar day numbers"
        >
          {calendarDays.map((calendarDay) => {
            const isStartDay =
              calendarDay.isStartDay ??
              calendarDay.day === startDay;

            const isTargetDay =
              calendarDay.isTargetDay ??
              calendarDay.day === targetDay;

            const isBetweenDates =
              calendarDay.isBetweenDates ??
              (
                calendarDay.day > targetDay &&
                calendarDay.day < startDay
              );

            const dayClassName = [
              "visual-subtraction-question__calendar-day",

              isStartDay
                ? "visual-subtraction-question__calendar-day--start"
                : "",

              isTargetDay
                ? "visual-subtraction-question__calendar-day--target"
                : "",

              isBetweenDates
                ? "visual-subtraction-question__calendar-day--between"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={calendarDay.day}
                role="listitem"
                className={dayClassName}
                aria-label={[
                  `Day ${calendarDay.day}`,
                  isStartDay ? "starting day" : "",
                  isTargetDay ? "target day" : "",
                  isBetweenDates ? "between the dates" : "",
                ]
                  .filter(Boolean)
                  .join(", ")}
              >
                <span className="visual-subtraction-question__calendar-number">
                  {calendarDay.day}
                </span>

                {(isStartDay ||
                  isTargetDay ||
                  isBetweenDates) && (
                  <span className="visual-subtraction-question__calendar-marker">
                    {isStartDay
                      ? "S"
                      : isTargetDay
                        ? "T"
                        : "•"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ======================================================
  // UNFILLED LEVEL SHIFT DATA
  // ======================================================

  const startCount = visualData.startCount ?? 0;
  const emptiedCount = visualData.emptiedCount ?? 0;

  const blocks: VisualBlockData[] =
    visualData.blocks ??
    Array.from(
      { length: Math.max(0, startCount) },
      (_, index) => ({
        position: index + 1,
        state:
          index < emptiedCount
            ? "empty"
            : "filled",
        isFilled: index >= emptiedCount,
      }),
    );

  // ======================================================
  // UNFILLED LEVEL SHIFT UI
  // ======================================================

  const renderLevelShiftQuestion = () => (
    <div className="visual-subtraction-question__level-shift">
      <div className="visual-subtraction-question__visual-heading">
        <Droplets size={24} aria-hidden="true" />
        <span>Container Blocks</span>
      </div>

      <div
        className="visual-subtraction-question__block-board"
        role="list"
        aria-label="Filled and emptied blocks"
      >
        {blocks.map((block, index) => {
          const isFilled =
            typeof block.isFilled === "boolean"
              ? block.isFilled
              : block.state === "filled";

          return (
            <div
              key={`${block.position}-${index}`}
              role="listitem"
              className={[
                "visual-subtraction-question__block",
                isFilled
                  ? "visual-subtraction-question__block--filled"
                  : "visual-subtraction-question__block--emptied",
              ].join(" ")}
              aria-label={
                `Block ${block.position}: ${
                  isFilled ? "still filled" : "emptied"
                }`
              }
            >
              <span className="visual-subtraction-question__block-position">
                {block.position}
              </span>

              <span
                className="visual-subtraction-question__block-symbol"
                aria-hidden="true"
              >
                {isFilled ? "●" : "×"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="visual-subtraction-question__block-legend">
        <span>
          <i className="visual-subtraction-question__legend-dot visual-subtraction-question__legend-dot--filled" />
          Still filled
        </span>

        <span>
          <i className="visual-subtraction-question__legend-dot visual-subtraction-question__legend-dot--emptied" />
          Emptied
        </span>
      </div>
    </div>
  );

  // ======================================================
  // MYSTERY STORAGE CHEST UI
  // ======================================================

  const visibleCount = visualData.visibleCount ?? 0;

  const visibleObjects: string[] =
    visualData.visibleObjects?.length
      ? visualData.visibleObjects
      : Array.from(
          { length: Math.max(0, visibleCount) },
          () => visualData.icon || "●",
        );

 const totalObjectCount =
  visualData.totalCount ?? visibleCount;

const hiddenObjectCount = Math.max(
  0,
  totalObjectCount - visibleCount,
);

  const hiddenObjectIcon =
    visualData.icon || visibleObjects[0] || "●";

  const hiddenObjects = Array.from(
    { length: hiddenObjectCount },
    () => hiddenObjectIcon,
  );
 const isMysteryChestSolved =
  hasAnswer && isCorrect;

  const renderMysteryChestQuestion = () => (
    <div className="visual-subtraction-question__mystery-chest">
      <div className="visual-subtraction-question__visual-heading">
        <Package size={24} aria-hidden="true" />
        <span>Mystery Storage Chest</span>
      </div>

  

      <div className="visual-subtraction-question__mystery-layout">
        <div className="visual-subtraction-question__visible-area">
          <h4 className="visual-subtraction-question__area-title">
            Objects outside the chest
          </h4>

          <div
            className="visual-subtraction-question__visible-objects"
            role="list"
            aria-label={`${visibleObjects.length} visible objects`}
          >
            {visibleObjects.map((icon, index) => (
              <span
                key={`${icon}-${index}`}
                role="listitem"
                className="visual-subtraction-question__visible-object"
              >
                {icon}
              </span>
            ))}

            {visibleObjects.length === 0 && (
              <span className="visual-subtraction-question__empty-message">
                No visible objects
              </span>
            )}
          </div>
        </div>

        {/* Mystery chest */}
        <div
          className={[
            "visual-subtraction-question__chest-area",
            isMysteryChestSolved
              ? "visual-subtraction-question__chest-area--opened"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            className={[
              "visual-subtraction-question__chest-stage",
              isMysteryChestSolved
                ? "visual-subtraction-question__chest-stage--opened"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Reveal hidden objects only after the correct answer */}
            {isMysteryChestSolved && (
              <div
                className="visual-subtraction-question__hidden-objects"
                role="list"
                aria-label={`${hiddenObjects.length} objects revealed from the chest`}
              >
                {hiddenObjects.map((icon, index) => (
                  <span
                    key={`${icon}-${index}`}
                    role="listitem"
                    className="visual-subtraction-question__hidden-object"
                    style={{
                      animationDelay:
                        `${Math.min(index * 80, 600)}ms`,
                    }}
                  >
                    {icon}
                  </span>
                ))}

                {hiddenObjects.length === 0 && (
                  <span className="visual-subtraction-question__no-hidden-objects">
                    Empty!
                  </span>
                )}
              </div>
            )}

            <div
              className={[
                "visual-subtraction-question__chest-illustration",
                isMysteryChestSolved
                  ? "visual-subtraction-question__chest-illustration--open"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="img"
              aria-label={
                isMysteryChestSolved
                  ? `Open storage chest revealing ${hiddenObjectCount} objects`
                  : "Storage chest containing an unknown number of objects"
              }
            >
              {isMysteryChestSolved ? (
                <PackageOpen
                  size={62}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              ) : (
                <Package
                  size={62}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              )}

              {!isMysteryChestSolved && (
                <span className="visual-subtraction-question__chest-question-mark">
                  ?
                </span>
              )}
            </div>
          </div>

          <strong className="visual-subtraction-question__chest-caption">
            Hidden inside
          </strong>

          <span className="visual-subtraction-question__chest-unknown">
            {isMysteryChestSolved
              ? `${hiddenObjectCount} ${
                  hiddenObjectCount === 1
                    ? "object"
                    : "objects"
                } revealed!`
              : "Unknown amount"}
          </span>
        </div>
      </div>
    </div>
  );

  // ======================================================
  // SELECT QUESTION TYPE
  // ======================================================

  let questionVisual: ReactNode;

  switch (questionType) {
    case "CALENDAR_SUBTRACTION_MISSING_DAYS":
      questionVisual = renderCalendarQuestion();
      break;

    case "UNFILLED_LEVEL_SHIFT":
      questionVisual = renderLevelShiftQuestion();
      break;

    case "MYSTERY_STORAGE_CHEST":
      questionVisual = renderMysteryChestQuestion();
      break;

    default:
      questionVisual = (
        <p className="visual-subtraction-question__unsupported">
          Unsupported visual subtraction question type:{" "}
          {questionType || "Unknown"}
        </p>
      );
      break;
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================

  return (
    <section className="generated-question visual-subtraction-question">
      <h3 className="generated-question__text">
        {question.questionText}
      </h3>

      {questionVisual}

      {visualData.equation && (
        <div className="visual-subtraction-question__equation">
          <span>Equation</span>
          <strong>{visualData.equation}</strong>
        </div>
      )}

      {/* Answer input */}
      <div className="visual-subtraction-question__answer-section">
        <label
          htmlFor={answerId}
          className="visual-subtraction-question__answer-label"
        >
          Your answer
        </label>

        <div className="visual-subtraction-question__answer-row">
          <input
            id={answerId}
            type="number"
            inputMode="numeric"
            value={currentAnswer}
            disabled={showAnswers}
            placeholder="?"
            aria-label="Enter your numeric answer"
            className={answerClassName}
            onChange={(event) =>
              onAnswerChange(event.target.value)
            }
          />

          {showAnswers && hasAnswer && isCorrect && (
            <Check
              size={24}
              aria-label="Correct answer"
              className="visual-subtraction-question__feedback-icon visual-subtraction-question__feedback-icon--correct"
            />
          )}

          {showAnswers && hasAnswer && !isCorrect && (
            <X
              size={24}
              aria-label="Incorrect answer"
              className="visual-subtraction-question__feedback-icon visual-subtraction-question__feedback-icon--wrong"
            />
          )}
        </div>
      </div>

      {/* Display correct answer when answer-check mode is enabled */}
      {showAnswers && correctAnswer !== "" && (
        <AnswerBox answer={correctAnswer} />
      )}
    </section>
  );
}