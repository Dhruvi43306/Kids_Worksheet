
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

type SeesawPosition =
  | "total"
  | "body"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

type CompleteSeesaw = {
  topLeft?: number;
  bottomLeft?: number;
  total?: number;
  topRight?: number;
  bottomRight?: number;
};

function BalancingSeesawDisplay({
  questionText,
  completeSeesaw,
  missingPosition,
  explanation,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: {
  questionText: string;
  completeSeesaw?: CompleteSeesaw;
  missingPosition?: SeesawPosition;
  explanation?: string;
  userAnswer: any;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: string) => void;
}) {
  const currentAnswer = String(userAnswer ?? "").trim();
  const correctAnswer = correctAnswers[0] ?? "";

  const isCorrect =
    currentAnswer !== "" && answerMatches(currentAnswer, correctAnswers);

  if (
    !completeSeesaw ||
    completeSeesaw.topLeft === undefined ||
    completeSeesaw.bottomLeft === undefined ||
    completeSeesaw.total === undefined ||
    completeSeesaw.topRight === undefined ||
    completeSeesaw.bottomRight === undefined ||
    !missingPosition
  ) {
    return (
      <div className="balancing-seesaw__error">
        Balancing seesaw data is incomplete.
      </div>
    );
  }

  const isMissing = (position: string) =>
    missingPosition === position;

  const getValue = (value: number, position: string) => {
    if (!isMissing(position)) {
      return value;
    }

    if (showAnswers) {
      return correctAnswer || "?";
    }

    return currentAnswer || "?";
  };

  const NumberCircle = ({
    value,
    position,
    large = false,
  }: {
    value: number;
    position: string;
    large?: boolean;
  }) => {
    const missing = isMissing(position);

    const statusClass = [
      "balancing-seesaw__number",
      large ? "balancing-seesaw__number--large" : "",
      missing ? "balancing-seesaw__number--missing" : "",
      missing && currentAnswer !== "" && !showAnswers
        ? "balancing-seesaw__number--editing"
        : "",
      showAnswers && missing
        ? isCorrect
          ? "balancing-seesaw__number--correct"
          : "balancing-seesaw__number--incorrect"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={statusClass}
      >
        {getValue(value, position)}

        {showAnswers && missing && (
          <span
            className={`balancing-seesaw__status-icon ${
              isCorrect
                ? "balancing-seesaw__status-icon--correct"
                : "balancing-seesaw__status-icon--incorrect"
            }`}
          >
            {isCorrect ? "✓" : "×"}
          </span>
        )}
      </motion.div>
    );
  };

  const PlusSymbol = () => (
    <div className="balancing-seesaw__plus">+</div>
  );

  const SeesawSide = ({
    side,
  }: {
    side: "left" | "right";
  }) => {
    const left = side === "left";

    const first = left
      ? completeSeesaw.topLeft!
      : completeSeesaw.topRight!;

    const second = left
      ? completeSeesaw.bottomLeft!
      : completeSeesaw.bottomRight!;

    const firstPosition = left ? "topLeft" : "topRight";
    const secondPosition = left ? "bottomLeft" : "bottomRight";

    return (
      <div className="balancing-seesaw__side">
        <NumberCircle
          value={first}
          position={firstPosition}
        />

        <PlusSymbol />

        <NumberCircle
          value={second}
          position={secondPosition}
        />

        <div className="balancing-seesaw__side-line" />

        <NumberCircle
          value={completeSeesaw.total!}
          position="total"
          large
        />
      </div>
    );
  };

  return (
    <div className="balancing-seesaw">
      <h3 className="balancing-seesaw__title">
        {questionText}
      </h3>

      {!showAnswers && (
        <div className="balancing-seesaw__instructions">
          Both sides of the seesaw must have the same total.
        </div>
      )}

      {/* Seesaw diagram */}
      <div className="balancing-seesaw__diagram">
        <div className="balancing-seesaw__side-position balancing-seesaw__side-position--left">
          <SeesawSide side="left" />
        </div>

        <div className="balancing-seesaw__side-position balancing-seesaw__side-position--right">
          <SeesawSide side="right" />
        </div>

        <div className="balancing-seesaw__board" />

        <div className="balancing-seesaw__left-support" />

        <div className="balancing-seesaw__right-support" />

        <div className="balancing-seesaw__fulcrum" />

        <div className="balancing-seesaw__scale">⚖</div>
      </div>

      {/* Missing number input */}
      <div className="balancing-seesaw__answer-section">
        <label className="balancing-seesaw__answer-label">
          Enter the missing number
        </label>

        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={currentAnswer}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="?"
          className={`balancing-seesaw__answer-input ${
            showAnswers
              ? isCorrect
                ? "balancing-seesaw__answer-input--correct"
                : "balancing-seesaw__answer-input--incorrect"
              : ""
          }`}
        />

        {showAnswers && (
          <div
            className={`balancing-seesaw__feedback ${
              isCorrect
                ? "balancing-seesaw__feedback--correct"
                : "balancing-seesaw__feedback--incorrect"
            }`}
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
          </div>
        )}
      </div>

      {/* Explanation */}
      {showAnswers && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="balancing-seesaw__explanation"
        >
          <div className="balancing-seesaw__explanation-title">
            How the seesaw works
          </div>

          <div className="balancing-seesaw__explanation-text">
            {explanation}
          </div>
        </motion.div>
      )}

      {showAnswers && (
        <AnswerBox answer={`Missing number = ${correctAnswer}`} />
      )}
    </div>
  );
}

export default function BalancingSeesawQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <BalancingSeesawDisplay
      questionText={
        question.questionText || "Complete the balancing seesaw."
      }
      completeSeesaw={data.completeSeesaw}
      missingPosition={data.missingPosition as SeesawPosition | undefined}
      explanation={data.explanation}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      correctAnswers={correctAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
