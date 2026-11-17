
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

export default function AdditionPyramidQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const whole = data.whole;
  const leftPart = data.leftPart;
  const rightPart = data.rightPart;

  const leftBottom = data.leftBottom ?? {};
  const rightBottom = data.rightBottom ?? {};

  const missingNods = data.missingNods;
  const completeTree = data.completeTree;
  const correctAnswer = correctAnswers[0];

  const currentAnswer = String(userAnswer ?? "").trim();
  const isCorrect = answerMatches(currentAnswer, correctAnswers);

  const nodeValue = (
    value: number | null | undefined,
    missing: boolean,
  ) => {
    if (missing) {
      return currentAnswer || "?";
    }

    return value ?? "?";
  };

  const Node = ({
    value,
    missing = false,
    size = "medium",
  }: {
    value: number | null | undefined;
    missing?: boolean;
    size?: "small" | "medium" | "large";
  }) => {
    const isFilled = missing && currentAnswer !== "";

    const statusClass = showAnswers
      ? missing
        ? isCorrect
          ? "addition-pyramid__node--correct"
          : "addition-pyramid__node--incorrect"
        : "addition-pyramid__node--revealed"
      : missing && isFilled
        ? "addition-pyramid__node--filled"
        : "";

    return (
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={
          missing && !showAnswers ? { scale: 1.05 } : undefined
        }
        className={[
          "addition-pyramid__node",
          `addition-pyramid__node--${size}`,
          missing ? "addition-pyramid__node--missing" : "",
          statusClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {nodeValue(value, missing)}

        {showAnswers && missing && (
          <span
            className={`addition-pyramid__node-status ${
              isCorrect
                ? "addition-pyramid__node-status--correct"
                : "addition-pyramid__node-status--incorrect"
            }`}
          >
            {isCorrect ? "✓" : "×"}
          </span>
        )}
      </motion.div>
    );
  };

  const VerticalConnector = () => (
    <div className="addition-pyramid__vertical-connector" />
  );

  const PlusSymbol = () => (
    <div className="addition-pyramid__plus">+</div>
  );

  if (
    !missingNods ||
    !completeTree ||
    completeTree.whole === undefined ||
    completeTree.leftPart === undefined ||
    completeTree.rightPart === undefined ||
    !completeTree.leftBottom ||
    !completeTree.rightBottom
  ) {
    return (
      <div className="addition-pyramid__error">
        Addition number-bond tree data is incomplete.
      </div>
    );
  }

  return (
    <div className="generated-question addition-pyramid">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="addition-pyramid__heading"
      >
        {question.questionText ||
          "Complete the addition number-bond tree."}
      </motion.h3>

      {!showAnswers && (
        <div className="addition-pyramid__instructions">
          Find the missing number in the tree. Remember: the two numbers
          below each part add up to that part.
        </div>
      )}

      <div className="addition-pyramid__tree">
        <Node
          value={whole}
          missing={missingNods === "root"}
          size="large"
        />

        <VerticalConnector />

        <div className="addition-pyramid__branches">
          <div className="addition-pyramid__branch">
            <Node
              value={leftPart}
              missing={missingNods === "leftMiddle"}
            />

            <VerticalConnector />

            <div className="addition-pyramid__bottom-row">
              <Node
                value={leftBottom.first}
                missing={missingNods === "leftBottom1"}
                size="small"
              />

              <PlusSymbol />

              <Node
                value={leftBottom.second}
                missing={missingNods === "leftBottom2"}
                size="small"
              />
            </div>
          </div>

          <div className="addition-pyramid__branch">
            <Node
              value={rightPart}
              missing={missingNods === "rightMiddle"}
            />

            <VerticalConnector />

            <div className="addition-pyramid__bottom-row">
              <Node
                value={rightBottom.first}
                missing={missingNods === "rightBottom1"}
                size="small"
              />

              <PlusSymbol />

              <Node
                value={rightBottom.second}
                missing={missingNods === "rightBottom2"}
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="addition-pyramid__answer-section">
        <label
          className="addition-pyramid__answer-label"
          htmlFor="addition-pyramid-answer"
        >
          Enter the missing number
        </label>

        <input
          id="addition-pyramid-answer"
          className={`addition-pyramid__answer-input ${
            showAnswers
              ? isCorrect
                ? "addition-pyramid__answer-input--correct"
                : "addition-pyramid__answer-input--incorrect"
              : ""
          }`}
          type="number"
          inputMode="numeric"
          min="0"
          value={currentAnswer}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="?"
        />

        {showAnswers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`addition-pyramid__feedback ${
              isCorrect
                ? "addition-pyramid__feedback--correct"
                : "addition-pyramid__feedback--incorrect"
            }`}
          >
            {isCorrect ? (
              <>
                <Check size={19} />
                Correct!
              </>
            ) : (
              <>
                <X size={19} />
                Incorrect
              </>
            )}
          </motion.div>
        )}
      </div>

      {showAnswers && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="addition-pyramid__explanation"
        >
          <div className="addition-pyramid__explanation-heading">
            How the tree works
          </div>

          <div className="addition-pyramid__explanation-text">
            {(data as QuestionData & { explanation?: string })
              .explanation}
          </div>
        </motion.div>
      )}

      {showAnswers && (
        <AnswerBox answer={`Missing number = ${correctAnswer}`} />
      )}
    </div>
  );
}
