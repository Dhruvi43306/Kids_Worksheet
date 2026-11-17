
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type {  NumberLineOption } from "@/app/worksheet/type";


function ChooseCorrectNumberLineDisplay({
  min,
  max,
  firstNumber,
  secondNumber,
  total,
  options,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: {
  min: number;
  max: number;
  firstNumber: number;
  secondNumber: number;
  total: number;
  options: NumberLineOption[];
  userAnswer: any;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
}) {
  const selectedAnswer = String(userAnswer ?? "");

  return (
    <div
      className="generated-question"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "18px",
      }}
    >
      <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e293b" }}>
        {firstNumber} + {secondNumber} = {total}
      </div>
      <div style={{ color: "#475569", textAlign: "center" }}>
        Choose the number line that shows the addition.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          width: "100%",
        }}
      >
        {options.map((option, index) => {
          const selected = selectedAnswer === option.label;
          const borderColor = showAnswers
            ? option.isCorrect
              ? "#22c55e"
              : selected
                ? "#ef4444"
                : "#cbd5e1"
            : selected
              ? "#6366f1"
              : "#cbd5e1";

          return (
            <button
              key={`${option.label}-${index}`}
              type="button"
              disabled={showAnswers}
              onClick={() => onAnswerChange(option.label)}
              style={{
                padding: "14px",
                border: `3px solid ${borderColor}`,
                borderRadius: "14px",
                background: selected ? "#eef2ff" : "#ffffff",
                color: "#334155",
                cursor: showAnswers ? "default" : "pointer",
                fontWeight: 800,
              }}
            >
              <div>{option.label}</div>
              <div style={{ marginTop: "8px", fontWeight: 600 }}>
                {option.path.join(" → ")} ({min}–{max})
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


export default function ChooseCorrectNumberLineQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const numberLineOptions = data.numberLineOptions ?? [];
  const correctTotal =
    data.correctTotal ??
    (data.firstNumber !== undefined && data.secondNumber !== undefined
      ? data.firstNumber + data.secondNumber
      : undefined);

  if (
    numberLineOptions.length === 0 ||
    data.firstNumber === undefined ||
    data.secondNumber === undefined ||
    correctTotal === undefined
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
        Choose-correct-number-line data is incomplete.
      </div>
    );
  }

  return (
    <ChooseCorrectNumberLineDisplay
      min={data.numberLine?.min ?? 0}
      max={data.numberLine?.max ?? 20}
      firstNumber={data.firstNumber}
      secondNumber={data.secondNumber}
      total={correctTotal}
      options={numberLineOptions}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
