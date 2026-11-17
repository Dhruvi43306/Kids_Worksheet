
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";


export default function CompleteAdditionSentenceQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  
}: QuestionRendererProps) {
    const objects = data.objects ?? [];
    const knownCount = data.knowncount ?? 0;
    const totalCount = data.totalcount ?? objects.length;
    const missingCount =
      data.missingcount ?? Math.max(0, totalCount - knownCount);
    const selectedCount = typeof userAnswer === "number" ? userAnswer : 0;
    const colorCount = Math.min(knownCount + selectedCount, totalCount);
    const isCorrect = selectedCount === missingCount;

    return (
      <div
        className="generated-question"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          width: "100%",
        }}
      >
        <h3
          className="generated-question__text"
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "#1e293b",
            textAlign: "center",
          }}
        >
          {question.questionText}
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px",
            maxWidth: "650px",
            padding: "18px",
            background: "#f8fafc",
            border: "2px solid #e2e8f0",
            borderRadius: "14px",
          }}
        >
          {objects.map((icon, index) => {
            const isColored = index < colorCount;
            const isInitiallyColored = index < knownCount;
            const canColor = index >= knownCount && !showAnswers;

            return (
              <button
                key={`${icon}-${index}`}
                type="button"
                disabled={!canColor}
                onClick={() => {
                  if (!canColor) {
                    return;
                  }

                  const nextCount = selectedCount + 1;

                  onAnswerChange(nextCount);
                }}
                style={{
                  width: "58px",
                  height: "58px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  border: isColored
                    ? "2px solid #22c55e"
                    : "2px dashed #94a3b8",

                  borderRadius: "12px",
                  background: isColored ? "#f0fdf4" : "#ffffff",
                  fontSize: "2rem",
                  cursor: canColor ? "pointer" : "default",
                  filter: isColored ? "grayscale(0)" : "grayscale(1)",
                  opacity: isColored ? 1 : 0.45,
                  transition: "all 0.2s ease",
                }}
              >
                {icon}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "#1e293b",
          }}
        >
          <span>{knownCount}</span>

          <span>+</span>

          <span
            style={{
              minWidth: "70px",
              height: "48px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #94a3b8",
              borderRadius: "8px",
              background: "#ffffff",
            }}
          >
            {showAnswers
              ? missingCount
              : selectedCount > 0
                ? selectedCount
                : "___"}
          </span>

          <span>=</span>

          <span>{totalCount}</span>
        </div>

        {!showAnswers && (
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Click the remaining objects to color them.
          </p>
        )}

        {showAnswers && (
          <div
            style={{
              fontWeight: 700,
              color: isCorrect ? "#15803d" : "#b91c1c",
            }}
          >
            {isCorrect
              ? "✓ Correct!"
              : `The correct answer is ${missingCount}.`}
          </div>
        )}

        {showAnswers && (
          <AnswerBox
            answer={`${knownCount} + ${missingCount} = ${totalCount}`}
          />
        )}
      </div>
    );
}
