
"use client";

import { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

// =========================================================
// TYPES
// =========================================================

interface ShapeOption {
  shapeKey?: unknown;
  label?: unknown;
}

interface OddEvenMultiplePatternData {
  [key: string]: unknown;

  questionType?: unknown;
  title?: unknown;

  // Triangular dots
  rowCount?: unknown;
  patternType?: unknown;
  dotIcon?: unknown;

  // Tournament
  playerCount?: unknown;
  playersPerMatch?: unknown;

  // Repeated pattern
  patternId?: unknown;
  firstObjectName?: unknown;
  firstObjectCount?: unknown;
  firstObjectIcon?: unknown;

  secondObjectName?: unknown;
  secondObjectCount?: unknown;
  secondObjectIcon?: unknown;

  targetObjectName?: unknown;
  batchCount?: unknown;

  // Shape options
  shapeOptions?: unknown;

  // Answer options
  options?: unknown;
  answerMode?: unknown;
  answerType?: unknown;

  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface OddEvenMultiplePatternQuestion {
  questionNumber?: unknown;
  questionType?: unknown;
  questionText?: unknown;
  questionDataJson?: unknown;

  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface OddEvenMultiplePatternProps {
  question?: OddEvenMultiplePatternQuestion | null;

  correctAnswer?: unknown;

  value?: string | null;

  onAnswerChange?: (answer: string) => void;

  // Existing navbar Show/Hide Evaluation state.
  showAnswers?: boolean;
}

interface AnswerOption {
  value: string;
  label: string;
  shapeKey?: string;
}

// =========================================================
// SHAPE EDGE COUNTS
// =========================================================

const SHAPE_EDGE_COUNTS: Record<string, number> = {
  TETRAHEDRON: 6,
  SQUARE_PYRAMID: 8,
  TRIANGULAR_PRISM: 9,
  PENTAGONAL_PYRAMID: 10,
  CUBE: 12,
  PENTAGONAL_PRISM: 15,
  HEXAGONAL_PRISM: 18,
  HEPTAGONAL_PRISM: 21,
  OCTAGONAL_PRISM: 24,
};

// =========================================================
// HELPER FUNCTIONS
// =========================================================

function parseQuestionData(
  value: unknown
): OddEvenMultiplePatternData {
  if (!value) {
    return {};
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as OddEvenMultiplePatternData;
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

    return parsed as OddEvenMultiplePatternData;
  } catch (error) {
    console.error(
      "Unable to parse OddEvenMultiplePattern QuestionDataJson:",
      error
    );

    return {};
  }
}

function toNumber(value: unknown): number | null {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function toText(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return "";
}

function getParityAnswer(value: number): string {
  return Math.abs(Math.trunc(value)) % 2 === 0
    ? "Even"
    : "Odd";
}

function normalizeAnswer(value: unknown): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? normalizeAnswer(value[0])
      : "";
  }

  if (typeof value !== "string") {
    return String(value).trim();
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

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
      return normalizeAnswer(parsed[0]);
    }
  } catch {
    // Plain-text answer.
  }

  return trimmed;
}

// =========================================================
// GET QUESTION OPTIONS
// =========================================================

function getAnswerOptions(
  data: OddEvenMultiplePatternData,
  questionType: string
): AnswerOption[] {
  // Shape question uses shapeOptions instead of options.
  if (
    questionType === "ODD_EVEN_3D_SHAPE_EDGE_PARITY"
  ) {
    if (!Array.isArray(data.shapeOptions)) {
      return [];
    }

    return data.shapeOptions
      .filter(
        (item): item is ShapeOption =>
          typeof item === "object" &&
          item !== null
      )
      .map((item) => {
        const shapeKey = toText(item.shapeKey);
        const label = toText(item.label);

        return {
          value: label,
          label,
          shapeKey,
        };
      })
      .filter(
        (item) =>
          item.value.trim().length > 0 &&
          item.shapeKey.trim().length > 0
      );
  }

  if (!Array.isArray(data.options)) {
    return [];
  }

  return data.options
    .filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0
    )
    .map((item) => ({
      value: item,
      label: item,
    }));
}

// =========================================================
// CALCULATE FALLBACK ANSWER
// Backend CorrectAnswer has priority.
// =========================================================

function calculateCorrectAnswer(
  questionType: string,
  data: OddEvenMultiplePatternData,
  options: AnswerOption[]
): string {
  switch (questionType) {

    // -----------------------------------------------------
    // 1. TRIANGULAR DOT PARITY
    // Total dots = n * (n + 1) / 2
    // -----------------------------------------------------

    case "ODD_EVEN_TRIANGULAR_DOT_PARITY": {
      const rowCount = toNumber(data.rowCount);

      if (
        rowCount === null ||
        !Number.isInteger(rowCount) ||
        rowCount < 1
      ) {
        return "";
      }

      const totalDots =
        (rowCount * (rowCount + 1)) / 2;

      return getParityAnswer(totalDots);
    }

    // -----------------------------------------------------
    // 2. TOURNAMENT BYE
    // Odd players = one player receives a bye.
    // -----------------------------------------------------

    case "ODD_EVEN_TOURNAMENT_BYE": {
      const playerCount = toNumber(data.playerCount);

      if (
        playerCount === null ||
        !Number.isInteger(playerCount) ||
        playerCount < 1
      ) {
        return "";
      }

      return playerCount % 2 === 0
        ? "No"
        : "Yes";
    }

    // -----------------------------------------------------
    // 3. REPEATED PATTERN PARITY
    // Target count per batch * batch count.
    // -----------------------------------------------------

    case "ODD_EVEN_REPEATED_PATTERN_PARITY": {
      const firstObjectName = toText(
        data.firstObjectName
      ).trim().toLowerCase();

      const secondObjectName = toText(
        data.secondObjectName
      ).trim().toLowerCase();

      const targetObjectName = toText(
        data.targetObjectName
      ).trim().toLowerCase();

      const firstObjectCount = toNumber(
        data.firstObjectCount
      );

      const secondObjectCount = toNumber(
        data.secondObjectCount
      );

      const batchCount = toNumber(data.batchCount);

      if (
        firstObjectCount === null ||
        secondObjectCount === null ||
        batchCount === null ||
        !Number.isInteger(batchCount) ||
        batchCount < 1
      ) {
        return "";
      }

      let targetCountPerBatch: number | null = null;

      if (
        targetObjectName === firstObjectName
      ) {
        targetCountPerBatch = firstObjectCount;
      } else if (
        targetObjectName === secondObjectName
      ) {
        targetCountPerBatch = secondObjectCount;
      }

      if (targetCountPerBatch === null) {
        return "";
      }

      const totalTargetObjects =
        targetCountPerBatch * batchCount;

      return getParityAnswer(totalTargetObjects);
    }

    // -----------------------------------------------------
    // 4. 3D SHAPE EDGE PARITY
    // Find the shape with an odd edge count.
    // -----------------------------------------------------

    case "ODD_EVEN_3D_SHAPE_EDGE_PARITY": {
      const correctShape = options.find((option) => {
        const edgeCount =
          SHAPE_EDGE_COUNTS[
            option.shapeKey?.toUpperCase() ?? ""
          ];

        return (
          edgeCount !== undefined &&
          edgeCount % 2 !== 0
        );
      });

      return correctShape?.value ?? "";
    }

    default:
      return "";
  }
}

// =========================================================
// RESOLVE EXPECTED ANSWER
// =========================================================

function resolveCorrectAnswer(
  question: OddEvenMultiplePatternQuestion | null | undefined,
  correctAnswer: unknown,
  data: OddEvenMultiplePatternData,
  questionType: string,
  options: AnswerOption[]
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

  const rawAnswer =
    backendAnswer ??
    calculateCorrectAnswer(
      questionType,
      data,
      options
    );

  if (!rawAnswer) {
    return "";
  }

  // Match the answer to the backend option spelling.
  const matchedOption = options.find(
    (option) =>
      option.value.trim().toLowerCase() ===
      rawAnswer.trim().toLowerCase()
  );

  return matchedOption?.value ?? rawAnswer;
}

// =========================================================
// SHAPE ILLUSTRATION
// =========================================================

function getPolygonPoints(
  sides: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  rotation = -Math.PI / 2
): string {
  return Array.from({ length: sides }, (_, index) => {
    const angle =
      rotation + (2 * Math.PI * index) / sides;

    const x =
      centerX + Math.cos(angle) * radiusX;

    const y =
      centerY + Math.sin(angle) * radiusY;

    return `${x},${y}`;
  }).join(" ");
}

function ShapeIllustration({
  shapeKey,
}: {
  shapeKey: string;
}) {
  const normalizedKey = shapeKey.toUpperCase();

  // Cube illustration.
  if (normalizedKey === "CUBE") {
    return (
      <svg
        viewBox="0 0 120 100"
        className="oemp-shape-svg"
        aria-hidden="true"
      >
        <polygon
          points="29,29 67,29 67,69 29,69"
          className="oemp-shape-face"
        />

        <polygon
          points="46,13 84,13 84,53 67,69 67,29"
          className="oemp-shape-side"
        />

        <polygon
          points="29,29 46,13 84,13 67,29"
          className="oemp-shape-top"
        />

        <path
          d="M46 13 V53 L29 69 M46 53 H84 M84 13 V53"
          className="oemp-shape-line"
        />
      </svg>
    );
  }

  // Pyramid illustrations.
  const pyramidSides: Record<string, number> = {
    TETRAHEDRON: 3,
    SQUARE_PYRAMID: 4,
    PENTAGONAL_PYRAMID: 5,
  };

  if (pyramidSides[normalizedKey]) {
    const sides = pyramidSides[normalizedKey];

    const points = getPolygonPoints(
      sides,
      60,
      70,
      39,
      17,
      -Math.PI / 2
    );

    const basePoints = points
      .split(" ")
      .map((point) => point.split(",").map(Number));

    return (
      <svg
        viewBox="0 0 120 105"
        className="oemp-shape-svg"
        aria-hidden="true"
      >
        <polygon
          points={points}
          className="oemp-shape-face"
        />

        {basePoints.map(([x, y], index) => (
          <line
            key={index}
            x1={60}
            y1={12}
            x2={x}
            y2={y}
            className="oemp-shape-line"
          />
        ))}

        <polygon
          points={points}
          className="oemp-shape-outline"
        />

        <circle
          cx="60"
          cy="12"
          r="3.5"
          className="oemp-shape-apex"
        />
      </svg>
    );
  }

  // Prism illustrations.
  const prismSides: Record<string, number> = {
    TRIANGULAR_PRISM: 3,
    PENTAGONAL_PRISM: 5,
    HEXAGONAL_PRISM: 6,
    HEPTAGONAL_PRISM: 7,
    OCTAGONAL_PRISM: 8,
  };

  const sides = prismSides[normalizedKey] ?? 6;

  const frontPoints = getPolygonPoints(
    sides,
    40,
    55,
    27,
    29
  );

  const backPoints = getPolygonPoints(
    sides,
    72,
    42,
    27,
    29
  );

  const frontCoordinates = frontPoints
    .split(" ")
    .map((point) => point.split(",").map(Number));

  const backCoordinates = backPoints
    .split(" ")
    .map((point) => point.split(",").map(Number));

  return (
    <svg
      viewBox="0 0 120 100"
      className="oemp-shape-svg"
      aria-hidden="true"
    >
      <polygon
        points={frontPoints}
        className="oemp-shape-face"
      />

      <polygon
        points={backPoints}
        className="oemp-shape-side"
      />

      {frontCoordinates.map(([x1, y1], index) => {
        const [x2, y2] = backCoordinates[index];

        return (
          <line
            key={`edge-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="oemp-shape-line"
          />
        );
      })}

      <polygon
        points={frontPoints}
        className="oemp-shape-outline"
      />

      <polygon
        points={backPoints}
        className="oemp-shape-outline"
      />
    </svg>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function OddEvenMultiplePattern({
  question,
  correctAnswer,
  value,
  onAnswerChange,
  showAnswers = false,
}: OddEvenMultiplePatternProps) {
  const data = useMemo(
    () =>
      parseQuestionData(
        question?.questionDataJson
      ),
    [question?.questionDataJson]
  );

  const questionType = String(
    data.questionType ??
    question?.questionType ??
    ""
  )
    .trim()
    .toUpperCase();

  const [internalAnswer, setInternalAnswer] =
    useState("");

  const selectedAnswer =
    value !== undefined && value !== null
      ? value
      : internalAnswer;

  const options = useMemo(
    () => getAnswerOptions(data, questionType),
    [data, questionType]
  );

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

  // Reset internally stored answer when a new question loads.
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

  // Select answer.
  function handleAnswerSelect(answer: string) {
    if (
      value === undefined ||
      value === null
    ) {
      setInternalAnswer(answer);
    }

    onAnswerChange?.(answer);
  }

  // =========================================================
  // 1. TRIANGULAR DOT PATTERN
  // =========================================================

  function renderTriangularDots() {
    const rowCount = toNumber(data.rowCount);

    if (
      rowCount === null ||
      !Number.isInteger(rowCount) ||
      rowCount < 1
    ) {
      return null;
    }

    const dotIcon = toText(data.dotIcon) || "🔵";

    return (
      <div className="oemp-triangle-visual">
        <div className="oemp-triangle-info">
          <span className="oemp-info-pill">
            {rowCount} Rows
          </span>

          <span className="oemp-info-pill">
            Triangle Pattern
          </span>
        </div>

        <div
          className="oemp-triangle-board"
          role="img"
          aria-label={`Triangular pattern containing ${rowCount} rows of dots`}
        >
          {Array.from(
            { length: rowCount },
            (_, rowIndex) => (
              <div
                className="oemp-triangle-row"
                key={`triangle-row-${rowIndex}`}
              >
                {Array.from(
                  { length: rowIndex + 1 },
                  (_, dotIndex) => (
                    <span
                      className="oemp-triangle-dot"
                      key={`dot-${rowIndex}-${dotIndex}`}
                    >
                      {dotIcon}
                    </span>
                  )
                )}
              </div>
            )
          )}
        </div>

        <div className="oemp-triangle-caption">
          <span>🔹</span>
          <span>Count all the dots in the triangle.</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. TOURNAMENT BYE
  // =========================================================

  function renderTournamentBye() {
    const playerCount = toNumber(data.playerCount);

    const playersPerMatch =
      toNumber(data.playersPerMatch) ?? 2;

    if (
      playerCount === null ||
      !Number.isInteger(playerCount) ||
      playerCount < 1 ||
      !Number.isInteger(playersPerMatch) ||
      playersPerMatch < 1
    ) {
      return null;
    }

    const matchCount = Math.floor(
      playerCount / playersPerMatch
    );

    const remainingPlayers =
      playerCount % playersPerMatch;

    return (
      <div className="oemp-tournament-visual">
        <div className="oemp-tournament-summary">
          <div className="oemp-player-total">
            <span className="oemp-player-total__icon">
              🏆
            </span>

            <div>
              <strong>{playerCount}</strong>
              <small>Total Players</small>
            </div>
          </div>

          <div className="oemp-match-total">
            <strong>{matchCount}</strong>
            <small>Possible Matches</small>
          </div>
        </div>

        <div className="oemp-tournament-board">
          {Array.from(
            { length: matchCount },
            (_, index) => {
              const firstPlayer =
                index * playersPerMatch + 1;

              const secondPlayer =
                firstPlayer + 1;

              return (
                <div
                  className="oemp-match-card"
                  key={`match-${index}`}
                >
                  <span className="oemp-match-label">
                    MATCH {index + 1}
                  </span>

                  <div className="oemp-match-players">
                    <span className="oemp-player">
                      <span className="oemp-player-icon">
                        👤
                      </span>
                      P{firstPlayer}
                    </span>

                    <span className="oemp-versus">
                      VS
                    </span>

                    <span className="oemp-player">
                      <span className="oemp-player-icon">
                        👤
                      </span>
                      P{secondPlayer}
                    </span>
                  </div>
                </div>
              );
            }
          )}

          {remainingPlayers > 0 && (
            <div className="oemp-bye-card">
              <span className="oemp-bye-icon">
                👤
              </span>

              <div>
                <strong>
                  P{matchCount * playersPerMatch + 1}
                </strong>

                <span>Unpaired Player</span>
              </div>

              <span className="oemp-bye-tag">
                BYE
              </span>
            </div>
          )}
        </div>

        <div className="oemp-tournament-caption">
          Pair the players and look for anyone left unpaired.
        </div>
      </div>
    );
  }

  // =========================================================
  // 3. REPEATED PATTERN PARITY
  // =========================================================

  function renderRepeatedPattern() {
    const firstObjectName = toText(
      data.firstObjectName
    );

    const secondObjectName = toText(
      data.secondObjectName
    );

    const firstObjectCount = toNumber(
      data.firstObjectCount
    );

    const secondObjectCount = toNumber(
      data.secondObjectCount
    );

    const batchCount = toNumber(data.batchCount);

    const firstObjectIcon =
      toText(data.firstObjectIcon) || "🔴";

    const secondObjectIcon =
      toText(data.secondObjectIcon) || "🔵";

    const targetObjectName = toText(
      data.targetObjectName
    );

    if (
      firstObjectCount === null ||
      secondObjectCount === null ||
      batchCount === null ||
      !Number.isInteger(firstObjectCount) ||
      !Number.isInteger(secondObjectCount) ||
      !Number.isInteger(batchCount) ||
      firstObjectCount < 0 ||
      secondObjectCount < 0 ||
      batchCount < 1
    ) {
      return null;
    }

    const isFirstTarget =
      targetObjectName.trim().toLowerCase() ===
      firstObjectName.trim().toLowerCase();

    const isSecondTarget =
      targetObjectName.trim().toLowerCase() ===
      secondObjectName.trim().toLowerCase();

    const totalTargetObjects =
      (isFirstTarget
        ? firstObjectCount
        : isSecondTarget
          ? secondObjectCount
          : 0) * batchCount;

    return (
      <div className="oemp-repeated-visual">
        <div className="oemp-repeated-legend">
          <div className="oemp-legend-item">
            <span>{firstObjectIcon}</span>
            <span>{firstObjectName}</span>
            <strong>× {firstObjectCount}</strong>
          </div>

          <div className="oemp-legend-item">
            <span>{secondObjectIcon}</span>
            <span>{secondObjectName}</span>
            <strong>× {secondObjectCount}</strong>
          </div>
        </div>

        <div className="oemp-batch-heading">
          <strong>Repeated Batches</strong>

          <span>
            {batchCount} batches
          </span>
        </div>

        <div
          className="oemp-batch-list"
          role="img"
          aria-label={`${batchCount} repeated batches of ${firstObjectName} and ${secondObjectName}`}
        >
          {Array.from(
            { length: batchCount },
            (_, batchIndex) => (
              <div
                className="oemp-batch-card"
                key={`batch-${batchIndex}`}
              >
                <span className="oemp-batch-number">
                  B{batchIndex + 1}
                </span>

                <div className="oemp-batch-objects">
                  {Array.from(
                    { length: firstObjectCount },
                    (_, index) => (
                      <span
                        className={[
                          "oemp-pattern-object",
                          isFirstTarget
                            ? "oemp-pattern-object--target"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={`first-${index}`}
                      >
                        {firstObjectIcon}
                      </span>
                    )
                  )}

                  {Array.from(
                    { length: secondObjectCount },
                    (_, index) => (
                      <span
                        className={[
                          "oemp-pattern-object",
                          isSecondTarget
                            ? "oemp-pattern-object--target"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={`second-${index}`}
                      >
                        {secondObjectIcon}
                      </span>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* <div className="oemp-repeated-total">
          <div>
            <span>🎯</span>
            <strong>
              Target: {targetObjectName}
            </strong>
          </div>

          {isFirstTarget || isSecondTarget ? (
            <span>
              {isFirstTarget
                ? firstObjectCount
                : secondObjectCount}{" "}
              × {batchCount} batches
            </span>
          ) : (
            <span>Target object not found in pattern.</span>
          )}
        </div> */}
      </div>
    );
  }

  // =========================================================
  // 4. 3D SHAPE EDGE PARITY
  // =========================================================

  function renderShapeOptions() {
    if (options.length === 0) {
      return null;
    }

    return (
      <div className="oemp-shape-grid">
        {options.map((option, index) => (
          <div
            className="oemp-shape-card"
            key={`${option.shapeKey}-${index}`}
          >
            <span className="oemp-shape-number">
              {index + 1}
            </span>

            <div className="oemp-shape-illustration">
              <ShapeIllustration
                shapeKey={option.shapeKey ?? ""}
              />
            </div>

            <span className="oemp-shape-name">
              {option.label}
            </span>

            <span className="oemp-shape-select-hint">
              Select this shape below
            </span>
          </div>
        ))}
      </div>
    );
  }

  // =========================================================
  // RENDER VISUAL BASED ON BACKEND QUESTION TYPE
  // =========================================================

  function renderVisual() {
    switch (questionType) {
      case "ODD_EVEN_TRIANGULAR_DOT_PARITY":
        return renderTriangularDots();

      case "ODD_EVEN_TOURNAMENT_BYE":
        return renderTournamentBye();

      case "ODD_EVEN_REPEATED_PATTERN_PARITY":
        return renderRepeatedPattern();

      case "ODD_EVEN_3D_SHAPE_EDGE_PARITY":
        return renderShapeOptions();

      default:
        return null;
    }
  }

  const visual = renderVisual();

  // =========================================================
  // FINAL UI
  // =========================================================

  if (!visual) {
    return (
      <div className="oemp-error" role="alert">
        Unable to display this question.
        Please check the backend QuestionDataJson.
      </div>
    );
  }

  return (
    <section className="oemp-card">

      {/* VISUALIZATION */}

      <div className="oemp-visual">
        {visual}
      </div>

      {/* ANSWER OPTIONS */}

      {options.length > 0 &&
        questionType !== "ODD_EVEN_3D_SHAPE_EDGE_PARITY" && (
          <div
            className="oemp-answer-options"
            role="group"
            aria-label="Select your answer"
          >
            {options.map((option, index) => {
              const isSelected =
                selectedAnswer.trim().toLowerCase() ===
                option.value.trim().toLowerCase();

              return (
                <button
                  type="button"
                  key={`${option.value}-${index}`}
                  className={[
                    "oemp-answer-button",
                    isSelected
                      ? "oemp-answer-button--selected"
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

                  <span className="oemp-answer-check">
                    {isSelected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      {/* SHAPE ANSWER OPTIONS */}

      {questionType === "ODD_EVEN_3D_SHAPE_EDGE_PARITY" &&
        options.length > 0 && (
          <div
            className="oemp-answer-options oemp-answer-options--shapes"
            role="group"
            aria-label="Select the shape with an odd number of edges"
          >
            {options.map((option, index) => {
              const isSelected =
                selectedAnswer.trim().toLowerCase() ===
                option.value.trim().toLowerCase();

              return (
                <button
                  type="button"
                  key={`${option.value}-${index}`}
                  className={[
                    "oemp-answer-button",
                    isSelected
                      ? "oemp-answer-button--selected"
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

                  <span className="oemp-answer-check">
                    {isSelected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      {options.length === 0 && (
        <div className="oemp-error">
          No answer options received from the backend.
        </div>
      )}

      {/* SHOW ANSWER ONLY WHEN NAVBAR EVALUATION IS ENABLED */}

      {showAnswers && (
        expectedAnswer ? (
          <div
            className="oemp-correct-answer"
            role="status"
            aria-live="polite"
          >
            <span className="oemp-correct-answer__icon">
              ✨
            </span>

            <div className="oemp-correct-answer__content">
              <strong>Correct Answer</strong>
              <span>{expectedAnswer}</span>
            </div>
          </div>
        ) : (
          <div
            className="oemp-correct-answer oemp-correct-answer--error"
            role="alert"
          >
            <span className="oemp-correct-answer__icon">
              !
            </span>

            <div className="oemp-correct-answer__content">
              <strong>Correct answer unavailable</strong>
              <span>
                Check the backend CorrectAnswer and question data.
              </span>
            </div>
          </div>
        )
      )}

    </section>
  );
}
