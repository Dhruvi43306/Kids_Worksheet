
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

import {
  AnswerBox,
  answerMatches,
} from "@/renderer/questionHelpers";

export default function MissingNumberQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const isOptionCorrect = (value: string | number) =>
    answerMatches(value, correctAnswers);
  const userString = String(userAnswer ?? "").trim();

  const isTextCorrect = answerMatches(userString, correctAnswers);

  const isTextWrong = showAnswers && userString !== "" && !isTextCorrect;

  return (
    <div className="generated-question ws-missing-number-questionContainer">
      <h3 className="ws-missing-number-questionTitle">
        {question.questionText}
      </h3>

      <div className="ws-missing-number-questionNumbersRow">
        {(data.numbers ?? []).map((number, index) => (
          <div
            key={`missing-${number}-${index}`}
            className={`ws-missing-number-questionChip ${
              number === -1
                ? "ws-missing-number-questionChip--placeholder"
                : "ws-missing-number-questionChip--value"
            }`}
          >
            {number === -1 ? "?" : number}
          </div>
        ))}
      </div>

      {data.options && data.options.length > 0 ? (
        <div className="ws-missing-number-questionOptionsRow">
          {data.options.map((option, index) => {
            const isSelected = userAnswer === option;

            const correct = isOptionCorrect(option);

            const isWrong = isSelected && !correct;

            const isMissed = showAnswers && !isSelected && correct;

            let stateClass = "ws-missing-number-questionOption--default";

            if (isSelected) {
              stateClass = "ws-missing-number-questionOption--selected";
            }

            if (showAnswers) {
              if (isSelected && correct) {
                stateClass = "ws-missing-number-questionOption--correct";
              } else if (isWrong) {
                stateClass = "ws-missing-number-questionOption--wrong";
              } else if (isMissed) {
                stateClass = "ws-missing-number-questionOption--missed";
              }
            }

            return (
              <div
                key={`missing-option-${option}-${index}`}
                onClick={() => {
                  if (!showAnswers) {
                    onAnswerChange(option);
                  }
                }}
                className={`ws-missing-number-questionOption ${stateClass}`}
              >
                {option}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ws-missing-number-questionTextRow">
          <span className="ws-missing-number-questionAnswerLabel">
            Answer:
          </span>

          <input
            type="text"
            value={userAnswer ?? ""}
            disabled={showAnswers}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer..."
            className={`ws-missing-number-questionInput ${
              showAnswers
                ? isTextCorrect
                  ? "ws-missing-number-questionInput--correct"
                  : "ws-missing-number-questionInput--wrong"
                : "ws-missing-number-questionInput--idle"
            }`}
          />

          {showAnswers && isTextCorrect && (
            <span className="ws-missing-number-questionFeedback--correct">
              ✓ Correct
            </span>
          )}

          {showAnswers && isTextWrong && (
            <span className="ws-missing-number-questionFeedback--wrong">
              ✕ Incorrect
            </span>
          )}
        </div>
      )}

      {showAnswers && <AnswerBox answer={correctAnswers.join(", ")} />}
    </div>
  );
}
