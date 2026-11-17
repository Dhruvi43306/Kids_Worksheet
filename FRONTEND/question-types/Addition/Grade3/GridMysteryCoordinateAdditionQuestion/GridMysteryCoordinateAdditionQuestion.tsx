
import React from "react";
import { motion } from "framer-motion";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type {
  QuestionData,
  GeneratedQuestion,
} from "@/app/worksheet/type";
import { AnswerBox } from "@/renderer/questionHelpers";

type GridMysteryCoordinateData = QuestionData & {
  grid?: {
    columns?: string[];
    rows?: Array<{
      label?: string;
      values?: number[];
    }>;
  };

  masterRegistryClue?: string;

  clue?: {
    first?: {
      row?: string;
      column?: number;
      value?: number;
    };
    mystery?: {
      row?: string;
      column?: number;
      value?: number | null;
    };
    second?: {
      row?: string;
      column?: number;
      value?: number;
    };
    target?: number;
  };

  tasks?: {
    task1?: string;
    task2?: string;
    task3?: string;
  };

  missingValue?: number | null;

  missingPosition?: {
    row?: string;
    column?: number;
  };

  correctCoordinate?: string;
};

type GridMysteryAnswer = {
  value?: string | number;
  coordinate?: string;
};

type GridMysteryDisplayProps = {
  question: GeneratedQuestion;
  data: QuestionData;
  userAnswer: unknown;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: GridMysteryAnswer) => void;
};

function GridMysteryCoordinateAdditionDisplay({
  question,
  data,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: GridMysteryDisplayProps) {
  const gridData = data as GridMysteryCoordinateData;

  const currentAnswer: GridMysteryAnswer = (() => {
    if (userAnswer && typeof userAnswer === "object") {
      return userAnswer as GridMysteryAnswer;
    }

    try {
      const parsed: unknown = JSON.parse(
        String(userAnswer ?? "{}"),
      );

      if (parsed && typeof parsed === "object") {
        return parsed as GridMysteryAnswer;
      }
    } catch {
      // Use empty answers when the supplied value is not valid JSON.
    }

    return {
      value: "",
      coordinate: "",
    };
  })();

  const enteredValue = String(
    currentAnswer.value ?? "",
  ).trim();

  const enteredCoordinate = String(
    currentAnswer.coordinate ?? "",
  ).trim();

  let correctValue = String(
    correctAnswers[0] ?? "",
  ).trim();

  let correctCoordinate = String(
    gridData.correctCoordinate ?? "",
  ).trim();

  try {
    const parsedAnswer: unknown = JSON.parse(
      question.correctAnswer || "{}",
    );

    if (
      parsedAnswer &&
      typeof parsedAnswer === "object"
    ) {
      const parsed = parsedAnswer as {
        value?: string | number;
        coordinate?: string;
      };

      correctValue = String(
        parsed.value ?? correctValue,
      ).trim();

      correctCoordinate = String(
        parsed.coordinate ?? correctCoordinate,
      ).trim();
    }
  } catch {
    correctValue = String(
      question.correctAnswer || correctValue,
    ).trim();
  }

  const normalizeCoordinate = (value: string) =>
    value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");

  const isValueCorrect =
    enteredValue !== "" &&
    enteredValue === correctValue;

  const isCoordinateCorrect =
    enteredCoordinate !== "" &&
    normalizeCoordinate(enteredCoordinate) ===
      normalizeCoordinate(correctCoordinate);

  const isCorrect =
    isValueCorrect && isCoordinateCorrect;

  const updateAnswer = (
    value: string,
    coordinate: string,
  ) => {
    if (showAnswers) {
      return;
    }

    onAnswerChange({
      value,
      coordinate,
    });
  };

  const firstClue = gridData.clue?.first;
  const secondClue = gridData.clue?.second;
  const mysteryClue = gridData.clue?.mystery;

  const firstKey =
    `${firstClue?.row}-${firstClue?.column}`;

  const secondKey =
    `${secondClue?.row}-${secondClue?.column}`;

  const mysteryKey =
    `${mysteryClue?.row}-${mysteryClue?.column}`;

  const isFirstCell = (
    row: string,
    column: number,
  ) => firstKey === `${row}-${column}`;

  const isSecondCell = (
    row: string,
    column: number,
  ) => secondKey === `${row}-${column}`;

  const isMysteryCell = (
    row: string,
    column: number,
  ) => mysteryKey === `${row}-${column}`;

  const coordinateOptions = [
    "ROW X, COL 1",
    "ROW X, COL 2",
    "ROW Y, COL 1",
    "ROW Y, COL 2",
  ];

  const renderCell = (
    row: string,
    column: number,
    value: number,
  ) => {
    const first = isFirstCell(row, column);
    const second = isSecondCell(row, column);
    const mystery = isMysteryCell(row, column);

    const classes = [
      "grid-mystery-coordinate__cell",
      first
        ? "grid-mystery-coordinate__cell--first"
        : "",
      second
        ? "grid-mystery-coordinate__cell--second"
        : "",
      mystery
        ? "grid-mystery-coordinate__cell--mystery"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const label = first
      ? "CLUE 1"
      : second
        ? "CLUE 2"
        : mystery
          ? "MYSTERY"
          : "";

    return (
      <motion.div
        key={`${row}-${column}`}
        className={classes}
        whileHover={{
          y: -3,
          scale: 1.02,
        }}
      >
        {label && (
          <span className="grid-mystery-coordinate__cell-badge">
            {label}
          </span>
        )}

        <span className="grid-mystery-coordinate__cell-coordinate">
          {row === "X" ? "ROW X" : "ROW Y"}
          {" • "}
          COL {column}
        </span>

        <span className="grid-mystery-coordinate__cell-value">
          {mystery ? "?" : value}
        </span>
      </motion.div>
    );
  };

  return (
    <div className="grid-mystery-coordinate">
      {/* Question */}
      <h3 className="grid-mystery-coordinate__question">
        {question.questionText ||
          "Decode the registry, solve the mystery value, and find its coordinate."}
      </h3>

      {/* Master registry clue */}
      <div className="grid-mystery-coordinate__master-clue">
        {gridData.masterRegistryClue}
      </div>

      {/* Coordinate grid */}
      <div className="grid-mystery-coordinate__grid">
        <div className="grid-mystery-coordinate__column-headers">
          {(gridData.grid?.columns ?? [
            "COLUMN 1",
            "COLUMN 2",
          ]).map((column) => (
            <div
              key={column}
              className="grid-mystery-coordinate__column-header"
            >
              {column}
            </div>
          ))}
        </div>

        {gridData.grid?.rows?.map((row) => {
          const normalizedRow = (
            row.label ?? ""
          ).replace(/^ROW\s+/i, "").trim().toUpperCase();

          return (
            <div
              key={row.label}
              className="grid-mystery-coordinate__row"
            >
              {(row.values ?? []).map((value, index) => (
                <React.Fragment key={`${row.label}-${index}`}>
                  {renderCell(
                    normalizedRow,
                    index + 1,
                    value,
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>

      {/* Missing value */}
      <div className="grid-mystery-coordinate__answer-section">
        <label
          className="grid-mystery-coordinate__section-label"
          htmlFor="grid-mystery-coordinate-value"
        >
          Enter the missing value
        </label>

        <div className="grid-mystery-coordinate__value-answer-row">
          <input
            id="grid-mystery-coordinate-value"
            className={[
              "grid-mystery-coordinate__input",
              showAnswers
                ? isValueCorrect
                  ? "grid-mystery-coordinate__input--correct"
                  : "grid-mystery-coordinate__input--wrong"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="number"
            inputMode="numeric"
            value={enteredValue}
            disabled={showAnswers}
            placeholder="?"
            onChange={(e) =>
              updateAnswer(
                e.target.value,
                enteredCoordinate,
              )
            }
          />

          <span className="grid-mystery-coordinate__answer-icon">
            {showAnswers
              ? isValueCorrect
                ? "✅"
                : "❌"
              : "✨"}
          </span>
        </div>
      </div>

      {/* Coordinate answer */}
      <div className="grid-mystery-coordinate__coordinate-section">
        <label
          className="grid-mystery-coordinate__section-label"
          htmlFor="grid-mystery-coordinate-address"
        >
          Write the missing coordinate address key
        </label>

        <input
          id="grid-mystery-coordinate-address"
          className={[
            "grid-mystery-coordinate__input",
            "grid-mystery-coordinate__coordinate-input",
            showAnswers
              ? isCoordinateCorrect
                ? "grid-mystery-coordinate__input--correct"
                : "grid-mystery-coordinate__input--wrong"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          type="text"
          value={enteredCoordinate}
          disabled={showAnswers}
          placeholder="ROW Y, COL 2"
          onChange={(e) =>
            updateAnswer(
              enteredValue,
              e.target.value,
            )
          }
        />

        <div className="grid-mystery-coordinate__coordinate-options">
          {coordinateOptions.map((coordinate) => {
            const selected =
              normalizeCoordinate(enteredCoordinate) ===
              normalizeCoordinate(coordinate);

            const classes = [
              "grid-mystery-coordinate__coordinate-option",
              selected
                ? "grid-mystery-coordinate__coordinate-option--selected"
                : "",
              showAnswers &&
              normalizeCoordinate(coordinate) ===
                normalizeCoordinate(correctCoordinate)
                ? "grid-mystery-coordinate__coordinate-option--correct"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <motion.button
                key={coordinate}
                type="button"
                className={classes}
                disabled={showAnswers}
                whileHover={{
                  scale: showAnswers ? 1 : 1.03,
                }}
                whileTap={{
                  scale: showAnswers ? 1 : 0.97,
                }}
                onClick={() =>
                  updateAnswer(
                    enteredValue,
                    coordinate,
                  )
                }
              >
                {coordinate}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Overall answer status */}
      {showAnswers && (
        <motion.div
          className={[
            "grid-mystery-coordinate__feedback",
            isCorrect
              ? "grid-mystery-coordinate__feedback--correct"
              : "grid-mystery-coordinate__feedback--wrong",
          ].join(" ")}
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >
          {isCorrect
            ? "✓ Correct! You decoded the grid."
            : `Correct: ${correctValue} • ${correctCoordinate}`}
        </motion.div>
      )}

      {/* Explanation */}
      {showAnswers && data.explanation && (
        <div className="grid-mystery-coordinate__explanation">
          <strong className="grid-mystery-coordinate__explanation-title">
            How to solve:
          </strong>

          <span className="grid-mystery-coordinate__explanation-text">
            {data.explanation}
          </span>
        </div>
      )}

      {showAnswers && (
        <div className="grid-mystery-coordinate__final-answer">
          <AnswerBox
            answer={`${correctValue} • ${correctCoordinate}`}
          />
        </div>
      )}
    </div>
  );
}

export default function GridMysteryCoordinateAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <GridMysteryCoordinateAdditionDisplay
      question={question}
      data={data}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      correctAnswers={correctAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
