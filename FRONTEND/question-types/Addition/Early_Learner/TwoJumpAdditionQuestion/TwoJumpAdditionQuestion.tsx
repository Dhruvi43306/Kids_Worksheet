import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, AlertCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData, GeneratedQuestion, NumberLineOption, NumberLineJump } from "@/app/worksheet/type";
import { AnswerBox, VisualDisplay, answerMatches } from "@/renderer/questionHelpers";


function TwoJumpAdditionDisplay({
  min = 1,
  max = 10,
  firstNumber,
  firstJump,
  intermediate,
  secondJump,
  total,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: {
  min?: number;
  max?: number;
  firstNumber: number;
  firstJump: number;
  intermediate: number;
  secondJump: number;
  total: number;
  userAnswer: any;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
}) {
  const numbers = Array.from(
    { length: max - min + 1 },
    (_, index) => min + index,
  );

  const [path, setPath] = useState<number[]>([firstNumber]);

  useEffect(() => {
    setPath([firstNumber]);
  }, [firstNumber, firstJump, intermediate, secondJump, total]);

  const currentPosition = path[path.length - 1];

  const reachedFirstJump = currentPosition >= intermediate;
  const reachedTotal = currentPosition === total;

  const currentAnswer = String(userAnswer ?? "").trim();

  const isCorrect = currentAnswer !== "" && currentAnswer === String(total);

  const getPercent = (number: number) => {
    if (numbers.length <= 1) {
      return 50;
    }

    return ((number - min) / (numbers.length - 1)) * 100;
  };

  const handleNumberClick = (number: number) => {
    if (showAnswers) {
      return;
    }

    const expectedNext = currentPosition + 1;

    if (number !== expectedNext) {
      return;
    }

    if (number > total) {
      return;
    }

    setPath((prev) => [...prev, number]);
  };

  const handleReset = () => {
    if (showAnswers) {
      return;
    }

    setPath([firstNumber]);
    onAnswerChange("");
  };

  const renderArc = (
    start: number,
    end: number,
    label: string,
    key: string,
  ) => {
    if (end <= start) {
      return null;
    }

    const startPercent = getPercent(start);
    const endPercent = getPercent(end);

    const leftPercent = Math.min(startPercent, endPercent);

    const widthPercent = Math.abs(endPercent - startPercent);

    return (
      <div
        key={key}
        style={{
          position: "absolute",
          left: `calc(${leftPercent}% + 15px)`,
          width: `calc(${widthPercent}% - 2px)`,
          top: "42px",
          height: "60px",
          borderTop: "3px solid #475569",
          borderLeft: "3px solid #475569",
          borderRight: "3px solid #475569",
          borderRadius: "32px 32px 0 0",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "-32px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.9rem",
            fontWeight: 800,
            color: "#475569",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>

        <div
          style={{
            position: "absolute",
            right: "-7px",
            top: "-8px",
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderLeft: "10px solid #475569",
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "22px",
      }}
    >
      <div
        style={{
          fontSize: "1.4rem",
          fontWeight: 800,
          color: "#1e293b",
          textAlign: "center",
        }}
      >
        Start at {firstNumber}, jump +{firstJump}, then jump +{secondJump}.
        Where do you land?
      </div>

      <div
        style={{
          width: "100%",
          overflowX: "auto",
          padding: "85px 20px 45px",
        }}
      >
        <div
          style={{
            position: "relative",
            minWidth: `${Math.max(numbers.length * 70, 650)}px`,
            height: "190px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "30px",
              right: "30px",
              top: "115px",
              height: "4px",
              background: "#334155",
              borderRadius: "4px",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "22px",
              top: "107px",
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: "14px solid #334155",
            }}
          />

          {currentPosition >= intermediate &&
            renderArc(firstNumber, intermediate, `+${firstJump}`, "first-jump")}

          {currentPosition > intermediate &&
            renderArc(
              intermediate,
              Math.min(currentPosition, total),
              `+${secondJump}`,
              "second-jump",
            )}
          {numbers.map((number) => {
            const percent = getPercent(number);

            const isCurrent = number === currentPosition;

            const isIntermediate = number === intermediate;

            const isTotal = number === total;

            let background = "#ffffff";
            let border = "2px solid #94a3b8";

            if (isCurrent) {
              background = "#f8fafc";
              border = "3px solid #334155";
            }

            if (isIntermediate && reachedFirstJump) {
              border = "3px solid #64748b";
            }

            if (isTotal && showAnswers) {
              background = "#f0fdf4";
              border = "3px solid #22c55e";
            }

            return (
              <button
                key={number}
                type="button"
                disabled={showAnswers}
                onClick={() => handleNumberClick(number)}
                style={{
                  position: "absolute",
                  left: `calc(${percent}% - 20px)`,
                  top: "94px",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  border,
                  background,
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 800,
                  zIndex: 4,
                  cursor: showAnswers ? "default" : "pointer",
                  padding: 0,
                }}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      {!showAnswers && !reachedTotal && (
        <div
          style={{
            padding: "12px 20px",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            color: "#475569",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Click the next number one step at a time to draw both jumps.
        </div>
      )}

      {!showAnswers && reachedFirstJump && !reachedTotal && (
        <div
          style={{
            padding: "12px 20px",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            color: "#475569",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          First jump complete! Continue to the next number.
        </div>
      )}

      {!showAnswers && reachedTotal && (
        <div
          style={{
            padding: "12px 20px",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            color: "#334155",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Great! You reached {total}. Now write your answer.
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "#475569",
          }}
        >
          Answer:
        </span>

        <input
          type="text"
          value={currentAnswer}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write answer"
          style={{
            width: "170px",
            height: "44px",
            padding: "8px 12px",
            border: `2px solid ${
              showAnswers ? (isCorrect ? "#22c55e" : "#ef4444") : "#cbd5e1"
            }`,
            borderRadius: "8px",
            outline: "none",
            textAlign: "center",
            fontSize: "1.1rem",
            fontWeight: 700,
            background: showAnswers
              ? isCorrect
                ? "#f0fdf4"
                : "#fef2f2"
              : "#ffffff",
          }}
        />

        {showAnswers && (
          <span
            style={{
              fontWeight: 700,
              color: isCorrect ? "#16a34a" : "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            {isCorrect ? (
              <>
                <Check size={18} />
                Correct
              </>
            ) : (
              <>
                <X size={18} />
                Incorrect
              </>
            )}
          </span>
        )}
      </div>

      {!showAnswers && path.length > 1 && (
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "9px 18px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#475569",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reset Path
        </button>
      )}

      {showAnswers && (
        <AnswerBox
          answer={`${firstNumber} + ${firstJump} + ${secondJump} = ${total}`}
        />
      )}
    </div>
  );
}

export default function TwoJumpAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const firstNumber = data.firstNumber;
  const firstJump = data.firstJump;
  const intermediate = data.intermediate;
  const secondJump = data.secondJump;
  const total = (data as QuestionData & { total?: number }).total;
  const numberLine = data.numberLine ?? {
    min: 1,
    max:
      total !== undefined ? (total <= 10 ? 10 : total <= 15 ? 15 : 20) : 10,
  };

  if (
    firstNumber === undefined ||
    firstJump === undefined ||
    intermediate === undefined ||
    secondJump === undefined ||
    total === undefined
  ) {
    return (
      <div
        className="generated-question"
        style={{
          padding: "20px",
          color: "#dc2626",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Two Jump Addition data is incomplete.
      </div>
    );
  }

  return (
    <TwoJumpAdditionDisplay
      min={numberLine.min}
      max={numberLine.max}
      firstNumber={firstNumber}
      firstJump={firstJump}
      intermediate={intermediate}
      secondJump={secondJump}
      total={total}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
