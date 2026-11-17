import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, AlertCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData, GeneratedQuestion, NumberLineOption, NumberLineJump } from "@/app/worksheet/type";
import { AnswerBox, VisualDisplay, answerMatches } from "@/renderer/questionHelpers";


function DiceGameAdditionDisplay({
  firstDice,
  secondDice,
  total,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: {
  questionText: string;
  firstDice: number;
  secondDice: number;
  total: number;
  userAnswer: any;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
}) {
  const currentAnswer = String(userAnswer ?? "").trim();

  const isCorrect = currentAnswer !== "" && currentAnswer === String(total);

  const renderDie = (value: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ["center"],
      2: ["topLeft", "bottomRight"],
      3: ["topLeft", "center", "bottomRight"],
      4: ["topLeft", "topRight", "bottomLeft", "bottomRight"],
      5: ["topLeft", "topRight", "center", "bottomLeft", "bottomRight"],
      6: [
        "topLeft",
        "topRight",
        "middleLeft",
        "middleRight",
        "bottomLeft",
        "bottomRight",
      ],
    };

    const positions = dotPositions[value] ?? [];

    const positionStyle: Record<string, React.CSSProperties> = {
      topLeft: {
        top: "16px",
        left: "16px",
      },
      topRight: {
        top: "16px",
        right: "16px",
      },
      middleLeft: {
        top: "50%",
        left: "16px",
        transform: "translateY(-50%)",
      },
      middleRight: {
        top: "50%",
        right: "16px",
        transform: "translateY(-50%)",
      },
      center: {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      },
      bottomLeft: {
        bottom: "16px",
        left: "16px",
      },
      bottomRight: {
        bottom: "16px",
        right: "16px",
      },
    };

    return (
      <div
        style={{
          width: "110px",
          height: "110px",
          position: "relative",
          background: "#ffffff",
          border: "3px solid #334155",
          borderRadius: "18px",
          boxShadow: "0 5px 14px rgba(15, 23, 42, 0.12)",
        }}
      >
        {positions.map((position, index) => (
          <span
            key={index}
            style={{
              position: "absolute",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#334155",
              ...positionStyle[position],
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="generated-question"
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {renderDie(firstDice)}

        <span
          style={{
            fontSize: "2.2rem",
            fontWeight: 900,
            color: "#334155",
          }}
        >
          +
        </span>

        {renderDie(secondDice)}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
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
            width: "150px",
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
            }}
          >
            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
          </span>
        )}
      </div>

      {showAnswers && (
        <AnswerBox answer={`${firstDice} + ${secondDice} = ${total}`} />
      )}
    </div>
  );
}


export default function DiceGameAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const firstDice = data.firstDice;
  const secondDice = data.secondDice;
  const total = data.total;

  if (
    firstDice === undefined ||
    secondDice === undefined ||
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
        Dice game data is incomplete.
      </div>
    );
  }

  return (
    <DiceGameAdditionDisplay
      questionText={question.questionText}
      firstDice={firstDice}
      secondDice={secondDice}
      total={total}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
