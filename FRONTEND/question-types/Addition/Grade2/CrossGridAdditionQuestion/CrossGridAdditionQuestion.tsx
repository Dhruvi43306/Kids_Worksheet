
import React, { useState } from "react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { answerMatches } from "@/renderer/questionHelpers";
import { GridNumberBox, GridTotalBox } from "@/renderer/gridHelpers";

function CrossGridAdditionDisplayLegacy({
  questionText,
  data,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: {
  questionText: string;
  data: QuestionData;
  userAnswer: unknown;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: string) => void;
}) {
  const [rowColumnAnswers, setRowColumnAnswers] = useState({
    topRow: "",
    bottomRow: "",
    leftColumn: "",
    rightColumn: "",
  });

  const grid = data.grid;

  if (!grid) {
    return (
      <div className="cross-grid-addition__error">
        Cross-grid addition data is missing.
      </div>
    );
  }

  const topRowTotal =
    data.rows?.top?.total ?? grid.topLeft + grid.topRight;

  const bottomRowTotal =
    data.rows?.bottom?.total ?? grid.bottomLeft + grid.bottomRight;

  const leftColumnTotal =
    data.columns?.left?.total ?? grid.topLeft + grid.bottomLeft;

  const rightColumnTotal =
    data.columns?.right?.total ?? grid.topRight + grid.bottomRight;

  const grandTotal =
    data.grandTotal?.answer ?? topRowTotal + bottomRowTotal;

  const updateRowColumnAnswer = (
    field: "topRow" | "bottomRow" | "leftColumn" | "rightColumn",
    value: string,
  ) => {
    if (showAnswers) {
      return;
    }

    setRowColumnAnswers((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const enteredGrandTotal = String(userAnswer ?? "").trim();

  const isGrandTotalCorrect =
    enteredGrandTotal !== "" &&
    answerMatches(enteredGrandTotal, correctAnswers);

  const grandTotalStateClass = !showAnswers
    ? "cross-grid-addition__grand-input--pending"
    : isGrandTotalCorrect
      ? "cross-grid-addition__grand-input--correct"
      : "cross-grid-addition__grand-input--incorrect";

  const resultStateClass = isGrandTotalCorrect
    ? "cross-grid-addition__result--correct"
    : "cross-grid-addition__result--incorrect";

  return (
    <div className="cross-grid-addition__display">
      <h3 className="cross-grid-addition__question">
        {questionText}
      </h3>

      <div className="cross-grid-addition__grid">
        {/* Top row */}
        <GridNumberBox value={grid.topLeft} label="TOP" />

        <GridNumberBox value={grid.topRight} label="TOP" />

        <GridTotalBox
          label="ROW TOTAL"
          correctValue={topRowTotal}
          userValue={rowColumnAnswers.topRow}
          showAnswers={showAnswers}
          onChange={(value) =>
            updateRowColumnAnswer("topRow", value)
          }
        />

        {/* Bottom row */}
        <GridNumberBox value={grid.bottomLeft} label="BOTTOM" />

        <GridNumberBox value={grid.bottomRight} label="BOTTOM" />

        <GridTotalBox
          label="ROW TOTAL"
          correctValue={bottomRowTotal}
          userValue={rowColumnAnswers.bottomRow}
          showAnswers={showAnswers}
          onChange={(value) =>
            updateRowColumnAnswer("bottomRow", value)
          }
        />

        {/* Column totals */}
        <GridTotalBox
          label="COLUMN"
          correctValue={leftColumnTotal}
          userValue={rowColumnAnswers.leftColumn}
          showAnswers={showAnswers}
          onChange={(value) =>
            updateRowColumnAnswer("leftColumn", value)
          }
        />

        <GridTotalBox
          label="COLUMN"
          correctValue={rightColumnTotal}
          userValue={rowColumnAnswers.rightColumn}
          showAnswers={showAnswers}
          onChange={(value) =>
            updateRowColumnAnswer("rightColumn", value)
          }
        />

        {/* Grand total: connected to the parent answer */}
        <div className="cross-grid-addition__grand-cell">
          <span className="cross-grid-addition__grand-label">
            GRAND TOTAL
          </span>

          <input
            type="number"
            className={`cross-grid-addition__grand-input ${grandTotalStateClass}`}
            value={userAnswer == null ? "" : String(userAnswer)}
            disabled={showAnswers}
            onChange={(event) =>
              onAnswerChange(event.target.value)
            }
            placeholder="?"
            aria-label="Grand total answer"
          />

          {showAnswers && (
            <span
              className={`cross-grid-addition__grand-status ${
                isGrandTotalCorrect
                  ? "cross-grid-addition__grand-status--correct"
                  : "cross-grid-addition__grand-status--incorrect"
              }`}
            >
              {isGrandTotalCorrect
                ? "✓ Correct"
                : `Answer: ${grandTotal}`}
            </span>
          )}
        </div>
      </div>

      {showAnswers && (
        <div
          className={`cross-grid-addition__result ${resultStateClass}`}
          role="status"
        >
          {isGrandTotalCorrect ? (
            <>✓ Correct! The grand total is {grandTotal}.</>
          ) : (
            <>✗ Incorrect. The correct grand total is {grandTotal}.</>
          )}
        </div>
      )}
    </div>
  );
}

export default function CrossGridAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <div className="cross-grid-addition__container">
      <CrossGridAdditionDisplayLegacy
        questionText={question.questionText}
        data={data}
        userAnswer={userAnswer}
        showAnswers={showAnswers}
        correctAnswers={correctAnswers}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
}
