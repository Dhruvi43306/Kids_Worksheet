
import { AnswerBox } from "@/renderer/questionHelpers";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import "@/styles/worksheet.css";

function RealisticHand({
  count,
  title,
  side,
}: {
  count: number;
  title: string;
  side: "left" | "right";
}) {
  const fingerCount = Math.max(0, Math.min(5, Math.round(count)));

  const getHandEmoji = () => {
    switch (fingerCount) {
      case 0:
        return "✊";
      case 1:
        return "☝️";
      case 2:
        return "✌️";
      case 3:
        return "🤟";
      case 4:
      case 5:
        return "🖐️";
      default:
        return "✊";
    }
  };

  return (
    <div className="finger-game-hand" role="img" aria-label={title}>
      <div className="finger-game-hand__emoji-container">
        <span
          className={`finger-game-hand__emoji ${
            side === "right" ? "finger-game-hand__emoji--flipped" : ""
          } ${
            fingerCount === 0 ? "finger-game-hand__emoji--fist" : ""
          }`}
          aria-hidden="true"
        >
          {getHandEmoji()}
        </span>
      </div>
    </div>
  );
}

function FingerGameAdditionDisplay({
  firstHand,
  secondHand,
  total,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: {
  questionText?: string;
  firstHand: number;
  secondHand: number;
  total: number;
  userAnswer: unknown;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
}) {
  const currentAnswer = String(userAnswer ?? "").trim();
  const isCorrect = currentAnswer !== "" && currentAnswer === String(total);

  return (
    <div className="generated-question finger-game">
      <div className="finger-game__hands">
        <RealisticHand
          count={firstHand}
          title={`${firstHand} finger${firstHand === 1 ? "" : "s"}`}
          side="left"
        />

        <div className="finger-game__plus" aria-label="plus">
          +
        </div>

        <RealisticHand
          count={secondHand}
          title={`${secondHand} finger${secondHand === 1 ? "" : "s"}`}
          side="right"
        />
      </div>

      <div className="finger-game__answer-row">
        <label className="finger-game__answer-label" htmlFor="finger-game-answer">
          Answer:
        </label>

        <input
          id="finger-game-answer"
          className={`finger-game__answer-input ${
            showAnswers
              ? isCorrect
                ? "finger-game__answer-input--correct"
                : "finger-game__answer-input--incorrect"
              : ""
          }`}
          type="text"
          inputMode="numeric"
          value={currentAnswer}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write answer"
        />

        {showAnswers && (
          <span
            className={`finger-game__feedback ${
              isCorrect
                ? "finger-game__feedback--correct"
                : "finger-game__feedback--incorrect"
            }`}
          >
            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
          </span>
        )}
      </div>

      {showAnswers && (
        <AnswerBox answer={`${firstHand} + ${secondHand} = ${total}`} />
      )}
    </div>
  );
}

export default function FingerGameAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const firstHand = data.firstHand;
  const secondHand = data.secondHand;
  const total = data.total;

  if (
    firstHand === undefined ||
    secondHand === undefined ||
    total === undefined
  ) {
    return (
      <div className="generated-question finger-game__error">
        Finger game data is incomplete.
      </div>
    );
  }

  return (
    <FingerGameAdditionDisplay
      questionText={question.questionText}
      firstHand={firstHand}
      secondHand={secondHand}
      total={total}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
