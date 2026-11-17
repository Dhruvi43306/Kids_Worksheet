
"use client";

import { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

// =========================================================
// TYPES
// =========================================================

interface PuzzleBoardData {
  [key: string]: unknown;

  questionType?: unknown;
  title?: unknown;

  // Rectangle
  length?: unknown;
  width?: unknown;
  perimeterFormula?: unknown;

  // Domino board
  rowCount?: unknown;
  columnCount?: unknown;
  squaresPerDomino?: unknown;

  // Handshake
  childCount?: unknown;

  // Prime exception
  options?: unknown;

  // Answers
  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface PuzzleQuestion {
  questionNumber?: unknown;
  questionType?: unknown;
  questionText?: unknown;
  questionDataJson?: unknown;

  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface AnswerOption {
  value: string;
  label: string;
}

interface HandshakeSelection {
  count: string;
  parity: string;
}

interface OddEvenParityPuzzleBoardProps {
  question?: PuzzleQuestion | null;
  correctAnswer?: unknown;
  value?: string | number | null;
  onAnswerChange?: (answer: string) => void;
  showAnswers?: boolean;
}

type DominoCell = {
  row: number;
  column: number;
  color: number;
};

// =========================================================
// CONSTANTS
// =========================================================

const PEOPLE_ICONS = [
  "👧",
  "👦",
  "🧒",
  "👩",
  "👨",
  "🧑",
  "👩‍🚀",
  "👨‍🚀",
  "🧑‍🎓",
  "👩‍🎨",
  "👨‍🔬",
  "🧑‍🏫",
];

const HANDSHAKE_PARITIES = ["Odd", "Even"];

// =========================================================
// PARSE BACKEND DATA
// =========================================================

function parseQuestionData(
  value: unknown
): PuzzleBoardData {
  if (!value) {
    return {};
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as PuzzleBoardData;
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

    return parsed as PuzzleBoardData;
  } catch (error) {
    console.error(
      "Unable to parse OddEvenParityPuzzleBoard QuestionDataJson:",
      error
    );

    return {};
  }
}

// =========================================================
// HELPER FUNCTIONS
// =========================================================

function toNumber(value: unknown): number | null {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : null;
}

function toText(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value).trim();
  }

  return "";
}

function getParity(value: number): string {
  return Math.abs(Math.trunc(value)) % 2 === 0
    ? "Even"
    : "Odd";
}

function normalizeAnswer(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? normalizeAnswer(value[0])
      : "";
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  try {
    const parsed: unknown = JSON.parse(text);

    if (
      typeof parsed === "string" ||
      typeof parsed === "number" ||
      typeof parsed === "boolean"
    ) {
      return String(parsed).trim();
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeAnswer(parsed[0]);
    }
  } catch {
    // Plain-text answer from backend.
  }

  return text;
}

// =========================================================
// GET BACKEND OPTIONS
// =========================================================

function getAnswerOptions(
  data: PuzzleBoardData
): AnswerOption[] {
  if (!Array.isArray(data.options)) {
    return [];
  }

  const uniqueOptions = new Map<string, AnswerOption>();

  for (const item of data.options) {
    if (
      typeof item !== "string" &&
      typeof item !== "number"
    ) {
      continue;
    }

    const label = String(item).trim();

    if (!label) {
      continue;
    }

    const key = label.toLowerCase();

    if (!uniqueOptions.has(key)) {
      uniqueOptions.set(key, {
        value: label,
        label,
      });
    }
  }

  return Array.from(uniqueOptions.values());
}

// =========================================================
// HANDSHAKE ANSWER PARSER
// Expected backend format: "6 (Odd)"
// Partial format: "6"
// =========================================================

function parseHandshakeAnswer(
  value: string
): HandshakeSelection {
  const completeMatch = value.match(
    /^(\d+)\s*\(\s*(Odd|Even)\s*\)$/i
  );

  if (completeMatch) {
    return {
      count: completeMatch[1],
      parity:
        completeMatch[2].toLowerCase() === "odd"
          ? "Odd"
          : "Even",
    };
  }

  const countMatch = value.match(/^\d+$/);

  if (countMatch) {
    return {
      count: value,
      parity: "",
    };
  }

  return {
    count: "",
    parity: "",
  };
}

// =========================================================
// CALCULATE FALLBACK ANSWER
// =========================================================

function calculateCorrectAnswer(
  questionType: string,
  data: PuzzleBoardData
): string {
  switch (questionType) {

    // -----------------------------------------------------
    // 1. RECTANGLE PERIMETER
    // P = 2 × (length + width)
    // -----------------------------------------------------

    case "ODD_EVEN_RECTANGLE_PERIMETER_REASONING": {
      const length = toNumber(data.length);
      const width = toNumber(data.width);

      if (length === null || width === null) {
        return "";
      }

      const perimeter = 2 * (length + width);

      return getParity(perimeter);
    }

    // -----------------------------------------------------
    // 2. DOMINO BOARD
    // A rectangular board is domino-coverable if
    // the total number of squares is even.
    // -----------------------------------------------------

    case "ODD_EVEN_DOMINO_BOARD_COVERABILITY": {
      const rows = toNumber(data.rowCount);
      const columns = toNumber(data.columnCount);

      if (
        rows === null ||
        columns === null ||
        !Number.isInteger(rows) ||
        !Number.isInteger(columns) ||
        rows < 1 ||
        columns < 1
      ) {
        return "";
      }

      return rows * columns % 2 === 0
        ? "Yes"
        : "No";
    }

    // -----------------------------------------------------
    // 3. HANDSHAKE COUNT
    // n * (n - 1) / 2
    // -----------------------------------------------------

    case "ODD_EVEN_HANDSHAKE_COUNT": {
      const childCount = toNumber(data.childCount);

      if (
        childCount === null ||
        !Number.isInteger(childCount) ||
        childCount < 1
      ) {
        return "";
      }

      const handshakeCount =
        (childCount * (childCount - 1)) / 2;

      const parity = getParity(handshakeCount);

      return `${handshakeCount} (${parity})`;
    }

    // -----------------------------------------------------
    // 4. PRIME EXCEPTION
    // The only even prime number is 2.
    // -----------------------------------------------------

    case "ODD_EVEN_PRIME_EXCEPTION":
      return "2";

    default:
      return "";
  }
}

// =========================================================
// RESOLVE CORRECT ANSWER
// BACKEND ANSWER HAS PRIORITY
// =========================================================

function resolveCorrectAnswer(
  question: PuzzleQuestion | null | undefined,
  correctAnswer: unknown,
  data: PuzzleBoardData,
  questionType: string
): string {
  const backendAnswers = [
    correctAnswer,
    question?.correctAnswer,
    question?.CorrectAnswer,
    data.correctAnswer,
    data.CorrectAnswer,
  ];

  const backendAnswer = backendAnswers
    .map(normalizeAnswer)
    .find((answer) => answer.length > 0);

  return (
    backendAnswer ??
    calculateCorrectAnswer(questionType, data)
  );
}

// =========================================================
// DOMINO BOARD CELLS
// =========================================================

function createDominoCells(
  rows: number,
  columns: number
): DominoCell[][] {
  return Array.from(
    { length: rows },
    (_, row) =>
      Array.from(
        { length: columns },
        (_, column) => ({
          row,
          column,
          color: (row + column) % 2,
        })
      )
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function OddEvenParityPuzzleBoard({
  question,
  correctAnswer,
  value,
  onAnswerChange,
  showAnswers = false,
}: OddEvenParityPuzzleBoardProps) {
  // -------------------------------------------------------
  // BACKEND QUESTION DATA
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
  // ANSWER OPTIONS
  // -------------------------------------------------------

  const options = useMemo(
    () => getAnswerOptions(data),
    [data]
  );

  // -------------------------------------------------------
  // SELECTED ANSWER
  // -------------------------------------------------------

  const [internalAnswer, setInternalAnswer] = useState("");

  const selectedAnswer =
    value !== undefined && value !== null
      ? String(value)
      : internalAnswer;

  const isControlled =
    value !== undefined && value !== null;

  // -------------------------------------------------------
  // HANDSHAKE SELECTION
  // -------------------------------------------------------

  const handshakeSelection = useMemo(
    () => parseHandshakeAnswer(selectedAnswer),
    [selectedAnswer]
  );

  // -------------------------------------------------------
  // CORRECT ANSWER
  // -------------------------------------------------------

  const expectedAnswer = useMemo(
    () =>
      resolveCorrectAnswer(
        question,
        correctAnswer,
        data,
        questionType
      ),
    [
      question,
      correctAnswer,
      data,
      questionType,
    ]
  );

  // -------------------------------------------------------
  // RESET ANSWER WHEN NEW QUESTION LOADS
  // -------------------------------------------------------

  const questionKey = [
    question?.questionNumber ?? "",
    typeof question?.questionDataJson === "string"
      ? question.questionDataJson
      : JSON.stringify(
          question?.questionDataJson ?? {}
        ),
  ].join(":");

  useEffect(() => {
    setInternalAnswer("");
  }, [questionKey]);

  // -------------------------------------------------------
  // UPDATE ANSWER
  // -------------------------------------------------------

  function handleAnswerSelect(answer: string) {
    if (!isControlled) {
      setInternalAnswer(answer);
    }

    onAnswerChange?.(answer);
  }

  // -------------------------------------------------------
  // HANDSHAKE NUMBER INPUT
  // -------------------------------------------------------

  function handleHandshakeCountChange(
    count: string
  ) {
    if (count !== "" && !/^\d+$/.test(count)) {
      return;
    }

    const answer = count
      ? handshakeSelection.parity
        ? `${count} (${handshakeSelection.parity})`
        : count
      : "";

    handleAnswerSelect(answer);
  }

  // -------------------------------------------------------
  // HANDSHAKE PARITY SELECTION
  // -------------------------------------------------------

  function handleHandshakeParitySelect(
    parity: string
  ) {
    const count = handshakeSelection.count;

    if (!count) {
      return;
    }

    handleAnswerSelect(`${count} (${parity})`);
  }

  // =========================================================
  // 1. RECTANGLE PERIMETER VISUAL
  // =========================================================

  function renderRectangle() {
    const length = toNumber(data.length);
    const width = toNumber(data.width);

    if (
      length === null ||
      width === null ||
      length <= 0 ||
      width <= 0
    ) {
      return null;
    }

    return (
      <div className="oepp-rectangle-visual">
        <div className="oepp-visual-heading">
          <span className="oepp-visual-icon">📐</span>

          <span>Rectangle Dimensions</span>
        </div>

        <div className="oepp-rectangle-board">
          <svg
            viewBox="0 0 340 210"
            className="oepp-rectangle-svg"
            role="img"
            aria-label={`Rectangle with length ${length} centimetres and width ${width} centimetres`}
          >
            <defs>
              <linearGradient
                id="oeppRectangleFill"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#e7e3ff"
                />

                <stop
                  offset="100%"
                  stopColor="#dceeff"
                />
              </linearGradient>
            </defs>

            <rect
              x="70"
              y="48"
              width="200"
              height="112"
              rx="9"
              fill="url(#oeppRectangleFill)"
              stroke="#8274d7"
              strokeWidth="2.5"
            />

            <text
              x="170"
              y="108"
              textAnchor="middle"
              className="oepp-rectangle-center"
            >
              RECTANGLE
            </text>

            <text
              x="170"
              y="29"
              textAnchor="middle"
              className="oepp-rectangle-label"
            >
              {length} cm
            </text>

            <text
              x="294"
              y="107"
              textAnchor="middle"
              className="oepp-rectangle-label"
            >
              {width} cm
            </text>

            <text
              x="170"
              y="190"
              textAnchor="middle"
              className="oepp-rectangle-caption"
            >
              Length × Width
            </text>
          </svg>
        </div>

        <div className="oepp-dimension-list">
          <div>
            <span className="oepp-dimension-color oepp-dimension-color--length" />
            <span>Length</span>
            <strong>{length} cm</strong>
          </div>

          <div>
            <span className="oepp-dimension-color oepp-dimension-color--width" />
            <span>Width</span>
            <strong>{width} cm</strong>
          </div>
        </div>

        <div className="oepp-formula">
          <span>Perimeter Formula</span>

          <strong>
            {toText(data.perimeterFormula) ||
              "2 × (length + width)"}
          </strong>
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. DOMINO BOARD VISUAL
  // =========================================================

  function renderDominoBoard() {
    const rows = toNumber(data.rowCount);
    const columns = toNumber(data.columnCount);
    const squaresPerDomino =
      toNumber(data.squaresPerDomino) ?? 2;

    if (
      rows === null ||
      columns === null ||
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 1 ||
      columns < 1 ||
      rows * columns > 400
    ) {
      return null;
    }

    const cells = createDominoCells(rows, columns);

    return (
      <div className="oepp-domino-visual">
        <div className="oepp-visual-heading">
          <span className="oepp-visual-icon">🁢</span>

          <span>Domino Board</span>
        </div>

        <div className="oepp-board-summary">
          <div>
            <strong>{rows}</strong>
            <span>Rows</span>
          </div>

          <span className="oepp-board-multiply">×</span>

          <div>
            <strong>{columns}</strong>
            <span>Columns</span>
          </div>

          <span className="oepp-board-equals">=</span>

          <div>
            <strong>{rows * columns}</strong>
            <span>Squares</span>
          </div>
        </div>

        <div className="oepp-domino-board-wrap">
          <div
            className="oepp-domino-board"
            role="img"
            aria-label={`Board with ${rows} rows and ${columns} columns`}
          >
            {cells.map((row, rowIndex) => (
              <div
                className="oepp-domino-row"
                key={`row-${rowIndex}`}
              >
                {row.map((cell) => (
                  <span
                    className={[
                      "oepp-domino-cell",
                      cell.color === 0
                        ? "oepp-domino-cell--light"
                        : "oepp-domino-cell--dark",
                    ].join(" ")}
                    key={`${cell.row}-${cell.column}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="oepp-domino-legend">
          <span className="oepp-domino-legend__item">
            <span className="oepp-domino-square" />
            One square
          </span>

          <span className="oepp-domino-legend__item">
            <span className="oepp-domino-two-squares" />
            {squaresPerDomino} squares per domino
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // 3. HANDSHAKE VISUAL
  // =========================================================

  function renderHandshake() {
    const childCount = toNumber(data.childCount);

    if (
      childCount === null ||
      !Number.isInteger(childCount) ||
      childCount < 1
    ) {
      return null;
    }

    const visiblePeople = Math.min(childCount, 12);
    const extraPeople = childCount - visiblePeople;

    return (
      <div className="oepp-handshake-visual">
        <div className="oepp-visual-heading">
          <span className="oepp-visual-icon">🤝</span>

          <span>Handshake Challenge</span>
        </div>

        <div className="oepp-people-summary">
          <div className="oepp-people-total">
            <strong>{childCount}</strong>

            <span>
              {childCount === 1 ? "Child" : "Children"}
            </span>
          </div>

          <div className="oepp-people-description">
            Everyone meets everyone!
          </div>
        </div>

        <div className="oepp-people-board">
          {Array.from(
            { length: visiblePeople },
            (_, index) => (
              <div
                className="oepp-person"
                key={`person-${index}`}
              >
                <span className="oepp-person-avatar">
                  {PEOPLE_ICONS[
                    index % PEOPLE_ICONS.length
                  ]}
                </span>

                <span className="oepp-person-label">
                  P{index + 1}
                </span>
              </div>
            )
          )}

          {extraPeople > 0 && (
            <div className="oepp-person oepp-person--extra">
              <span className="oepp-person-avatar">
                +{extraPeople}
              </span>

              <span className="oepp-person-label">
                More
              </span>
            </div>
          )}
        </div>

        <div className="oepp-handshake-rule">
          <span>💡</span>

          <span>
            Each pair shakes hands exactly once.
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // 4. PRIME EXCEPTION VISUAL
  // =========================================================

  function renderPrimeException() {
    if (options.length === 0) {
      return null;
    }

    return (
      <div className="oepp-prime-visual">
        <div className="oepp-visual-heading">
          <span className="oepp-visual-icon">🔢</span>

          <span>Number Collection</span>
        </div>

        <div className="oepp-prime-description">
          Explore the numbers below.
        </div>

        <div className="oepp-number-display">
          {options.map((option, index) => {
            const isSelected =
              selectedAnswer.trim() === option.value;

            return (
              <button
                type="button"
                key={`${option.value}-${index}`}
                className={[
                  "oepp-number-card",
                  isSelected
                    ? "oepp-number-card--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  handleAnswerSelect(option.value)
                }
                aria-pressed={isSelected}
              >
                <span className="oepp-number-value">
                  {option.label}
                </span>

                <span className="oepp-number-indicator">
                  {isSelected ? "✓" : "Select"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER VISUAL BY BACKEND QUESTION TYPE
  // =========================================================

  function renderVisual() {
    switch (questionType) {
      case "ODD_EVEN_RECTANGLE_PERIMETER_REASONING":
        return renderRectangle();

      case "ODD_EVEN_DOMINO_BOARD_COVERABILITY":
        return renderDominoBoard();

      case "ODD_EVEN_HANDSHAKE_COUNT":
        return renderHandshake();

      case "ODD_EVEN_PRIME_EXCEPTION":
        return renderPrimeException();

      default:
        return null;
    }
  }

  const visual = renderVisual();

  // =========================================================
  // ANSWER CONTROLS
  // =========================================================

  function renderAnswerOptions() {
    switch (questionType) {

      // Rectangle and Domino: use backend options.
      case "ODD_EVEN_RECTANGLE_PERIMETER_REASONING":
      case "ODD_EVEN_DOMINO_BOARD_COVERABILITY":
        return (
          <div
            className="oepp-answer-section"
            role="group"
            aria-label="Select your answer"
          >
            <div className="oepp-answer-heading">
              Choose your answer
            </div>

            <div className="oepp-answer-options">
              {options.map((option, index) => {
                const isSelected =
                  selectedAnswer.trim().toLowerCase() ===
                  option.value.toLowerCase();

                return (
                  <button
                    type="button"
                    key={`${option.value}-${index}`}
                    className={[
                      "oepp-answer-button",
                      isSelected
                        ? "oepp-answer-button--selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      handleAnswerSelect(option.value)
                    }
                    aria-pressed={isSelected}
                  >
                    <span>{option.label}</span>

                    <span className="oepp-answer-check">
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Handshake: number + parity.
      case "ODD_EVEN_HANDSHAKE_COUNT":
        return (
          <div className="oepp-handshake-answer">
            <div className="oepp-answer-heading">
              Enter your answer
            </div>

            <label
              className="oepp-handshake-label"
              htmlFor="oepp-handshake-count"
            >
              Total number of handshakes
            </label>

            <input
              id="oepp-handshake-count"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              className="oepp-handshake-input"
              placeholder="Enter total handshakes"
              value={handshakeSelection.count}
              onChange={(event) =>
                handleHandshakeCountChange(
                  event.target.value
                )
              }
            />

            <div className="oepp-handshake-label">
              Is the total Odd or Even?
            </div>

            <div
              className="oepp-parity-options"
              role="group"
              aria-label="Select handshake count parity"
            >
              {HANDSHAKE_PARITIES.map((parity) => {
                const isSelected =
                  handshakeSelection.parity === parity;

                return (
                  <button
                    type="button"
                    key={parity}
                    disabled={!handshakeSelection.count}
                    className={[
                      "oepp-parity-button",
                      `oepp-parity-button--${parity.toLowerCase()}`,
                      isSelected
                        ? "oepp-parity-button--selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      handleHandshakeParitySelect(parity)
                    }
                    aria-pressed={isSelected}
                  >
                    {parity}

                    {isSelected && (
                      <span> ✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Prime: options are rendered inside the number display.
      case "ODD_EVEN_PRIME_EXCEPTION":
        return null;

      default:
        return null;
    }
  }

  // =========================================================
  // CORRECT ANSWER VISIBILITY
  // Controlled by existing navbar showAnswers.
  // =========================================================

  function renderCorrectAnswer() {
    if (!showAnswers) {
      return null;
    }

    return expectedAnswer ? (
      <div
        className="oepp-correct-answer"
        role="status"
        aria-live="polite"
      >
        <span className="oepp-correct-answer__icon">
          ✨
        </span>

        <div className="oepp-correct-answer__content">
          <strong>Correct Answer</strong>
          <span>{expectedAnswer}</span>
        </div>
      </div>
    ) : (
      <div
        className="oepp-correct-answer oepp-correct-answer--error"
        role="alert"
      >
        <span className="oepp-correct-answer__icon">
          !
        </span>

        <div className="oepp-correct-answer__content">
          <strong>Answer unavailable</strong>
          <span>
            Please check the backend CorrectAnswer.
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // FINAL UI
  // =========================================================

  if (!visual) {
    return (
      <div className="oepp-error" role="alert">
        Unable to display this Odd/Even question.
        Please check the question type and QuestionDataJson.
      </div>
    );
  }

  return (
    <section className="oepp-card">

      {/* QUESTION VISUAL ONLY.
          QuestionText is already displayed by the parent. */}

      <div className="oepp-visual">
        {visual}
      </div>

      {/* ANSWER INPUTS */}

      {renderAnswerOptions()}

      {/* ANSWER REVEAL */}

      {renderCorrectAnswer()}

    </section>
  );
}
