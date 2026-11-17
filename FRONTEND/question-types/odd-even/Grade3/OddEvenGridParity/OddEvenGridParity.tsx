
"use client";

import { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

// =========================================================
// QUESTION DATA
// =========================================================

interface OddEvenQuestionData {
  [key: string]: unknown;

  questionType?: unknown;
  options?: unknown;

  totalMoves?: unknown;
  rightMoves?: unknown;
  upMoves?: unknown;

  tensDigit?: unknown;
  onesDigit?: unknown;
  number?: unknown;
  equation?: unknown;

  totalTiles?: unknown;
  rows?: unknown;
  columns?: unknown;

  startingNumber?: unknown;
  multiplier?: unknown;
  subtractValue?: unknown;

  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface OddEvenQuestion {
  questionDataJson?: unknown;
  questionType?: unknown;
  questionNumber?: unknown;

  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface OddEvenGridParityProps {
  question?: OddEvenQuestion | null;
  correctAnswer?: unknown;

  // Selected answer controlled by parent.
  value?: string | null;

  onAnswerChange?: (answer: string) => void;

  // Existing navbar Show/Hide Evaluation state.
  showAnswers?: boolean;
}

// =========================================================
// PARSE QUESTION DATA
// =========================================================

function parseQuestionData(
  value: unknown
): OddEvenQuestionData {
  if (!value) {
    return {};
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as OddEvenQuestionData;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as OddEvenQuestionData;
  } catch (error) {
    console.error(
      "Unable to parse Odd/Even QuestionDataJson:",
      error
    );

    return {};
  }
}

// =========================================================
// SAFE NUMBER CONVERSION
// =========================================================

function toFiniteNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : null;
}

// =========================================================
// GET ODD / EVEN ANSWER
// =========================================================

function getParityAnswer(number: unknown): string {
  const numericValue = toFiniteNumber(number);

  if (numericValue === null) {
    return "";
  }

  return Math.abs(Math.trunc(numericValue)) % 2 === 0
    ? "Even"
    : "Odd";
}

// =========================================================
// NORMALIZE BACKEND ANSWER
// =========================================================

function normalizeBackendAnswer(
  answer: unknown
): string {
  if (
    answer === null ||
    answer === undefined
  ) {
    return "";
  }

  if (Array.isArray(answer)) {
    return answer.length > 0
      ? normalizeBackendAnswer(answer[0])
      : "";
  }

  if (typeof answer === "string") {
    const trimmed = answer.trim();

    if (!trimmed) {
      return "";
    }

    // Supports JSON-serialized answers such as "Odd".
    try {
      const parsed: unknown = JSON.parse(trimmed);

      if (
        typeof parsed === "string" ||
        typeof parsed === "number" ||
        typeof parsed === "boolean"
      ) {
        return String(parsed).trim();
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeBackendAnswer(parsed[0]);
      }
    } catch {
      // Backend may send plain text such as Odd or Even.
    }

    return trimmed;
  }

  if (
    typeof answer === "number" ||
    typeof answer === "boolean"
  ) {
    return String(answer);
  }

  return "";
}

// =========================================================
// CALCULATE ANSWER FROM QUESTION DATA
// Used only when backend CorrectAnswer is unavailable.
// =========================================================

function calculateCorrectAnswer(
  questionType: string,
  data: OddEvenQuestionData
): string {
  let result: number | null = null;

  switch (questionType) {
    // -----------------------------------------------------
    // 1. GRID PATH LENGTH
    // Total moves = right moves + up moves.
    // -----------------------------------------------------

    case "ODD_EVEN_GRID_PATH_LENGTH": {
      const totalMoves = toFiniteNumber(data.totalMoves);

      const rightMoves = toFiniteNumber(data.rightMoves);
      const upMoves = toFiniteNumber(data.upMoves);

      if (totalMoves !== null) {
        result = totalMoves;
      } else if (
        rightMoves !== null &&
        upMoves !== null
      ) {
        result = rightMoves + upMoves;
      }

      break;
    }

    // -----------------------------------------------------
    // 2. DIGIT PRODUCT PARITY
    // Tens digit * Ones digit.
    // -----------------------------------------------------

    case "ODD_EVEN_DIGIT_PRODUCT_PARITY": {
      const tensDigit = toFiniteNumber(data.tensDigit);
      const onesDigit = toFiniteNumber(data.onesDigit);

      if (
        tensDigit !== null &&
        onesDigit !== null
      ) {
        result = tensDigit * onesDigit;
      }

      break;
    }

    // -----------------------------------------------------
    // 3. AREA TILE PARITY
    // Rows * Columns.
    // -----------------------------------------------------

    case "ODD_EVEN_AREA_TILE_PARITY": {
      const totalTiles = toFiniteNumber(data.totalTiles);

      const rows = toFiniteNumber(data.rows);
      const columns = toFiniteNumber(data.columns);

      if (totalTiles !== null) {
        result = totalTiles;
      } else if (
        rows !== null &&
        columns !== null
      ) {
        result = rows * columns;
      }

      break;
    }

    // -----------------------------------------------------
    // 4. DOUBLE MINUS ONE
    // Starting number * multiplier - subtract value.
    // -----------------------------------------------------

    case "ODD_EVEN_DOUBLE_MINUS_ONE": {
      const startingNumber = toFiniteNumber(
        data.startingNumber
      );

      const multiplier =
        data.multiplier === undefined
          ? 2
          : toFiniteNumber(data.multiplier);

      const subtractValue =
        data.subtractValue === undefined
          ? 1
          : toFiniteNumber(data.subtractValue);

      if (
        startingNumber !== null &&
        multiplier !== null &&
        subtractValue !== null
      ) {
        result =
          startingNumber * multiplier - subtractValue;
      }

      break;
    }

    default:
      return "";
  }

  return result === null
    ? ""
    : getParityAnswer(result);
}

// =========================================================
// RESOLVE CORRECT ANSWER
//
// Priority:
// 1. Explicit correctAnswer prop.
// 2. Backend question.correctAnswer.
// 3. Backend question.CorrectAnswer.
// 4. QuestionDataJson answer.
// 5. Calculated answer fallback.
// =========================================================

function resolveCorrectAnswer(
  question: OddEvenQuestion | null | undefined,
  correctAnswer: unknown,
  data: OddEvenQuestionData,
  questionType: string,
  options: string[]
): string {
  const possibleAnswers = [
    correctAnswer,
    question?.correctAnswer,
    question?.CorrectAnswer,
    data.correctAnswer,
    data.CorrectAnswer,
  ];

  const backendAnswer = possibleAnswers
    .map(normalizeBackendAnswer)
    .find((answer) => answer.length > 0);

  const rawAnswer =
    backendAnswer ??
    calculateCorrectAnswer(questionType, data);

  if (!rawAnswer) {
    return "";
  }

  // Return the exact option supplied by the backend.
  const matchedOption = options.find(
    (option) =>
      option.trim().toLowerCase() ===
      rawAnswer.trim().toLowerCase()
  );

  if (matchedOption) {
    return matchedOption;
  }

  // If backend sends a numeric answer such as 42,
  // convert it to Odd or Even when those are the options.
  const hasOddOption = options.some(
    (option) => option.trim().toLowerCase() === "odd"
  );

  const hasEvenOption = options.some(
    (option) => option.trim().toLowerCase() === "even"
  );

  if (
    hasOddOption &&
    hasEvenOption &&
    toFiniteNumber(rawAnswer) !== null
  ) {
    const parity = getParityAnswer(rawAnswer);

    return (
      options.find(
        (option) =>
          option.trim().toLowerCase() ===
          parity.toLowerCase()
      ) ?? parity
    );
  }

  return rawAnswer;
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function OddEvenGridParity({
  question,
  correctAnswer,
  value,
  onAnswerChange,
  showAnswers = false,
}: OddEvenGridParityProps) {
  // -------------------------------------------------------
  // QUESTION DATA
  // -------------------------------------------------------

  const data = useMemo(
    () => parseQuestionData(question?.questionDataJson),
    [question?.questionDataJson]
  );

  const questionType = String(
    data.questionType ??
    question?.questionType ??
    ""
  )
    .trim()
    .toUpperCase();

  // -------------------------------------------------------
  // ANSWER STATE
  // -------------------------------------------------------

  const [internalAnswer, setInternalAnswer] = useState("");

  const selectedAnswer =
    value !== undefined && value !== null
      ? value
      : internalAnswer;

  // -------------------------------------------------------
  // BACKEND OPTIONS
  // -------------------------------------------------------

  const options = useMemo(() => {
    return Array.isArray(data.options)
      ? data.options.filter(
          (option): option is string =>
            typeof option === "string" &&
            option.trim().length > 0
        )
      : [];
  }, [data.options]);

  // -------------------------------------------------------
  // CORRECT ANSWER
  // -------------------------------------------------------

  const expectedAnswer = useMemo(
    () =>
      resolveCorrectAnswer(
        question,
        correctAnswer,
        data,
        questionType,
        options
      ),
    [
      question,
      correctAnswer,
      data,
      questionType,
      options,
    ]
  );

  // -------------------------------------------------------
  // RESET ANSWER WHEN QUESTION CHANGES
  // -------------------------------------------------------

  const questionKey = [
    question?.questionNumber ?? "",
    typeof question?.questionDataJson === "string"
      ? question.questionDataJson
      : JSON.stringify(question?.questionDataJson ?? {}),
  ].join(":");

  useEffect(() => {
    setInternalAnswer("");
  }, [questionKey]);

  // -------------------------------------------------------
  // SELECT ANSWER
  // -------------------------------------------------------

  const handleAnswerSelect = (
    answer: string
  ) => {
    if (
      value === undefined ||
      value === null
    ) {
      setInternalAnswer(answer);
    }

    onAnswerChange?.(answer);
  };

  // =========================================================
  // 1. ODD_EVEN_GRID_PATH_LENGTH
  // =========================================================

  function renderGridPath() {
    const rightMoves = toFiniteNumber(data.rightMoves);
    const upMoves = toFiniteNumber(data.upMoves);

    if (
      rightMoves === null ||
      upMoves === null ||
      !Number.isInteger(rightMoves) ||
      !Number.isInteger(upMoves) ||
      rightMoves < 1 ||
      upMoves < 1
    ) {
      return null;
    }

    const cellSize = 40;
    const padding = 30;

    const width = rightMoves * cellSize + padding * 2;
    const height = upMoves * cellSize + padding * 2;

    const startX = padding;
    const startY = height - padding;

    const finishX = width - padding;
    const finishY = padding;

    const routePoints = [
      `${startX},${startY}`,
      `${finishX},${startY}`,
      `${finishX},${finishY}`,
    ].join(" ");

    return (
      <div className="oe-gp-visual">
        <div className="oe-gp-board">
          <svg
            className="oe-gp-svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Robot moves ${rightMoves} squares right and ${upMoves} squares up`}
          >
            {Array.from(
              { length: rightMoves + 1 },
              (_, index) => {
                const x = padding + index * cellSize;

                return (
                  <line
                    key={`vertical-${index}`}
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    className="oe-gp-grid-line"
                  />
                );
              }
            )}

            {Array.from(
              { length: upMoves + 1 },
              (_, index) => {
                const y =
                  height - padding - index * cellSize;

                return (
                  <line
                    key={`horizontal-${index}`}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    className="oe-gp-grid-line"
                  />
                );
              }
            )}

            <polyline
              points={routePoints}
              className="oe-gp-route"
            />

            <circle
              cx={startX}
              cy={startY}
              r="7"
              className="oe-gp-start"
            />

            <circle
              cx={finishX}
              cy={finishY}
              r="8"
              className="oe-gp-finish"
            />
          </svg>
        </div>

        <div className="oe-gp-movements">
          <div className="oe-gp-movement oe-gp-movement--right">
            <span className="oe-gp-arrow">→</span>
            <span>{rightMoves}</span>
            <small>Right</small>
          </div>

          <div className="oe-gp-movement oe-gp-movement--up">
            <span className="oe-gp-arrow">↑</span>
            <span>{upMoves}</span>
            <small>Up</small>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. ODD_EVEN_DIGIT_PRODUCT_PARITY
  // =========================================================

  function renderDigitProduct() {
    const tensDigit = data.tensDigit;
    const onesDigit = data.onesDigit;

    if (
      tensDigit === undefined ||
      onesDigit === undefined
    ) {
      return null;
    }

    return (
      <div className="oe-dp-visual">
        <div className="oe-dp-number">
          {String(
            data.number ?? `${tensDigit}${onesDigit}`
          )}
        </div>

        <div className="oe-dp-digits">
          <div className="oe-dp-digit oe-dp-digit--tens">
            <span>{String(tensDigit)}</span>
            <small>Tens</small>
          </div>

          <span className="oe-dp-times">×</span>

          <div className="oe-dp-digit oe-dp-digit--ones">
            <span>{String(onesDigit)}</span>
            <small>Ones</small>
          </div>
        </div>

        {data.equation != null && (
          <div className="oe-dp-equation">
            {String(data.equation)}
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // 3. ODD_EVEN_AREA_TILE_PARITY
  // =========================================================

  function renderAreaTiles() {
    const rows = toFiniteNumber(data.rows);
    const columns = toFiniteNumber(data.columns);

    if (
      rows === null ||
      columns === null ||
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 1 ||
      columns < 1
    ) {
      return null;
    }

    return (
      <div className="oe-at-visual">
        <div className="oe-at-grid">
          {Array.from(
            { length: rows },
            (_, rowIndex) => (
              <div
                className="oe-at-row"
                key={`row-${rowIndex}`}
              >
                {Array.from(
                  { length: columns },
                  (_, columnIndex) => {
                    const tileColor =
                      (rowIndex + columnIndex) % 3;

                    return (
                      <span
                        key={`tile-${rowIndex}-${columnIndex}`}
                        className={`oe-at-tile oe-at-tile--${tileColor}`}
                      />
                    );
                  }
                )}
              </div>
            )
          )}
        </div>

        <div className="oe-at-dimensions">
          <span>{rows} rows</span>
          <span>×</span>
          <span>{columns} columns</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // 4. ODD_EVEN_DOUBLE_MINUS_ONE
  // =========================================================

  function renderDoubleMinusOne() {
    const startingNumber = toFiniteNumber(
      data.startingNumber
    );

    const multiplier =
      data.multiplier === undefined
        ? 2
        : toFiniteNumber(data.multiplier);

    const subtractValue =
      data.subtractValue === undefined
        ? 1
        : toFiniteNumber(data.subtractValue);

    if (
      startingNumber === null ||
      multiplier === null ||
      subtractValue === null
    ) {
      return null;
    }

    const doubledNumber = startingNumber * multiplier;

    return (
      <div className="oe-dm-visual">
        <div className="oe-dm-step oe-dm-step--start">
          <small>START</small>
          <strong>{startingNumber}</strong>
        </div>

        <div className="oe-dm-operator">
          <span>× {multiplier}</span>
          <b>→</b>
        </div>

        <div className="oe-dm-step oe-dm-step--middle">
          <small>DOUBLED</small>
          <strong>{doubledNumber}</strong>
        </div>

        <div className="oe-dm-operator">
          <span>− {subtractValue}</span>
          <b>→</b>
        </div>

        <div className="oe-dm-step oe-dm-step--result">
          <small>RESULT</small>
          <strong>?</strong>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER QUESTION VISUAL
  // =========================================================

  function renderVisual() {
    switch (questionType) {
      case "ODD_EVEN_GRID_PATH_LENGTH":
        return renderGridPath();

      case "ODD_EVEN_DIGIT_PRODUCT_PARITY":
        return renderDigitProduct();

      case "ODD_EVEN_AREA_TILE_PARITY":
        return renderAreaTiles();

      case "ODD_EVEN_DOUBLE_MINUS_ONE":
        return renderDoubleMinusOne();

      default:
        return null;
    }
  }

  const visual = renderVisual();

  if (!visual) {
    return (
      <div className="oe-gp-error" role="alert">
        Unable to display this Odd/Even question.
        Please check QuestionDataJson.
      </div>
    );
  }

  // =========================================================
  // FINAL UI
  // =========================================================

  return (
    <section className="oe-gp-card">

      {/* QUESTION VISUAL */}

      <div className="oe-gp-question-visual">
        {visual}
      </div>

      {/* ANSWER OPTIONS */}

      {options.length > 0 ? (
        <div
          className="oe-gp-answer-options"
          role="group"
          aria-label="Select Odd or Even"
        >
          {options.map((option, index) => {
            const isSelected =
              String(selectedAnswer).trim().toLowerCase() ===
              option.trim().toLowerCase();

            const optionClass =
              option.trim().toLowerCase();

            return (
              <button
                key={`${option}-${index}`}
                type="button"
                className={[
                  "oe-gp-answer-button",
                  `oe-gp-answer-button--${optionClass}`,
                  isSelected
                    ? "oe-gp-answer-button--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleAnswerSelect(option)}
                aria-pressed={isSelected}
              >
                <span className="oe-gp-answer-text">
                  {option}
                </span>

                <span className="oe-gp-answer-indicator">
                  {isSelected ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="oe-gp-error">
          No options received from backend.
        </div>
      )}

      {/* CORRECT ANSWER: ONLY WHEN SHOW EVALUATION IS ENABLED */}

      {showAnswers && (
        expectedAnswer ? (
          <div
            className="oe-gp-answer-reveal"
            role="status"
            aria-live="polite"
          >
            <span className="oe-gp-answer-reveal__icon">
              ✨
            </span>

            <div className="oe-gp-answer-reveal__content">
              <strong>Correct Answer </strong>
              <span>{expectedAnswer}</span>
            </div>
          </div>
        ) : (
          <div
            className="oe-gp-answer-reveal oe-gp-answer-reveal--unavailable"
            role="alert"
          >
            <span className="oe-gp-answer-reveal__icon">
              !
            </span>

            <div className="oe-gp-answer-reveal__content">
              <strong>Correct answer not available</strong>
              <span>
                Please check the backend CorrectAnswer and
                QuestionDataJson.
              </span>
            </div>
          </div>
        )
      )}

    </section>
  );
}
