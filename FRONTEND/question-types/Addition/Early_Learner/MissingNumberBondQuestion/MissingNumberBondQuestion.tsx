
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

interface MissingNumberBondDisplayProps {
  whole: number;
  leftPart?: number | null;
  rightPart?: number | null;
  missingPosition: "left" | "right";
  options: Array<string | number>;
  userAnswer: any;
  showAnswers: boolean;
  onAnswerChange: (value: any) => void;
  correctAnswer: string;
}

function MissingNumberBondDisplay({
  whole,
  leftPart,
  rightPart,
  missingPosition,
  options,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswer,
}: MissingNumberBondDisplayProps) {
  const selectedAnswer = String(userAnswer ?? "");

  const isCorrect =
    selectedAnswer !== "" &&
    selectedAnswer === String(correctAnswer);

  return (
    <div
      className="generated-question"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <h3
        className="generated-question__text"
        style={{
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "#1e293b",
          margin: 0,
          textAlign: "center",
        }}
      >
        Find the missing number in the number bond.
      </h3>

      {/* Number Bond Diagram */}
      <div
        style={{
          width: "420px",
          maxWidth: "100%",
          padding: "20px",
          background: "#f8fafc",
          border: "2px solid #e2e8f0",
          borderRadius: "18px",
        }}
      >
        <svg
          viewBox="0 0 420 250"
          width="100%"
          height="250"
        >
          {/* Connecting Lines */}
          <line
            x1="210"
            y1="90"
            x2="105"
            y2="165"
            stroke="#64748b"
            strokeWidth="4"
          />

          <line
            x1="210"
            y1="90"
            x2="315"
            y2="165"
            stroke="#64748b"
            strokeWidth="4"
          />

          {/* Whole Number Circle */}
          <circle
            cx="210"
            cy="70"
            r="42"
            fill="#eef2ff"
            stroke="#6366f1"
            strokeWidth="3"
          />

          <text
            x="210"
            y="78"
            textAnchor="middle"
            fontSize="28"
            fontWeight="800"
            fill="#1e293b"
          >
            {whole}
          </text>

          {/* Left Part Circle */}
          <circle
            cx="105"
            cy="175"
            r="42"
            fill={
              missingPosition === "left"
                ? "#fff7ed"
                : "#f0fdf4"
            }
            stroke={
              missingPosition === "left"
                ? "#f59e0b"
                : "#22c55e"
            }
            strokeWidth="3"
          />

          <text
            x="105"
            y="183"
            textAnchor="middle"
            fontSize="28"
            fontWeight="800"
            fill="#1e293b"
          >
            {missingPosition === "left"
              ? "?"
              : leftPart}
          </text>

          {/* Right Part Circle */}
          <circle
            cx="315"
            cy="175"
            r="42"
            fill={
              missingPosition === "right"
                ? "#fff7ed"
                : "#f0fdf4"
            }
            stroke={
              missingPosition === "right"
                ? "#f59e0b"
                : "#22c55e"
            }
            strokeWidth="3"
          />

          <text
            x="315"
            y="183"
            textAnchor="middle"
            fontSize="28"
            fontWeight="800"
            fill="#1e293b"
          >
            {missingPosition === "right"
              ? "?"
              : rightPart}
          </text>
        </svg>
      </div>

      {/* Addition Equation */}
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "#334155",
        }}
      >
        {missingPosition === "left"
          ? `? + ${rightPart} = ${whole}`
          : `${leftPart} + ? = ${whole}`}
      </div>

      {/* Answer Options */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {options.map((option, index) => {
          const value = String(option);

          const selected = selectedAnswer === value;

          const correct =
            value === String(correctAnswer);

          let border = "#cbd5e1";
          let background = "#ffffff";
          let color = "#334155";

          if (selected) {
            border = "#6366f1";
            background = "#eef2ff";
            color = "#4338ca";
          }

          if (showAnswers && correct) {
            border = "#22c55e";
            background = "#f0fdf4";
            color = "#15803d";
          }

          if (showAnswers && selected && !correct) {
            border = "#ef4444";
            background = "#fef2f2";
            color = "#b91c1c";
          }

          return (
            <button
              key={`${value}-${index}`}
              type="button"
              disabled={showAnswers}
              onClick={() => {
                if (!showAnswers) {
                  onAnswerChange(value);
                }
              }}
              style={{
                minWidth: "70px",
                height: "50px",
                padding: "8px 18px",
                border: `2px solid ${border}`,
                borderRadius: "12px",
                background,
                color,
                fontSize: "1.2rem",
                fontWeight: 800,
                cursor: showAnswers
                  ? "default"
                  : "pointer",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback */}
      {showAnswers && (
        <div
          style={{
            fontWeight: 800,
            color: isCorrect
              ? "#16a34a"
              : "#dc2626",
          }}
        >
          {isCorrect
            ? "✓ Correct"
            : `✗ Correct answer: ${correctAnswer}`}
        </div>
      )}
    </div>
  );
}

// Main Question Renderer
export default function MissingNumberBondQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {

  // Backend sends "whole", not "total".
  const whole = data.whole ?? data.total;

  const leftPart = data.leftPart ?? undefined;
  const rightPart = data.rightPart ?? undefined;

  const missingPosition = data.missingPosition as
    | "left"
    | "right"
    | undefined;

  // Validate backend data.
  if (
    whole === undefined ||
    whole === null ||
    !Number.isFinite(Number(whole)) ||
    missingPosition === undefined ||
    (missingPosition === "left" &&
      rightPart === undefined) ||
    (missingPosition === "right" &&
      leftPart === undefined)
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
        Number bond data is incomplete.
      </div>
    );
  }

  // Get the correct answer.
  const correctAnswer = String(
    correctAnswers?.[0] ??
    question.correctAnswer ??
    ""
  );

  return (
    <MissingNumberBondDisplay
      whole={Number(whole)}
      leftPart={leftPart}
      rightPart={rightPart}
      missingPosition={missingPosition}
      options={data.options ?? []}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
      correctAnswer={correctAnswer}
    />
  );
}
