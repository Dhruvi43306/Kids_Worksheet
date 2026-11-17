import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import {answerMatches } from "@/renderer/questionHelpers";


function MissingOperationSwitchDisplay({
  questionText,
  data,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: {
  questionText: string;
  data: QuestionData;
  userAnswer: any;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: any) => void;
}) {
  const firstNumber = data.firstNumber;
  const secondNumber = data.secondNumber;

  const equation = data.equation;

  const result = data.result;

  const options = Array.isArray(data.options) ? data.options : ["+", "-"];

  const selectedAnswer = String(userAnswer ?? "").trim();

  const correctAnswer = correctAnswers[0] ?? data.operation ?? "";

  const isCorrect =
    selectedAnswer !== "" &&
    answerMatches(
      selectedAnswer,
      correctAnswers.length > 0 ? correctAnswers : [correctAnswer],
    );

  const displayEquation =
    equation ??
    `${firstNumber ?? ""} ◯ ${secondNumber ?? ""} = ${result ?? ""}`;

  return (
    <div className="generated-question ws-missing-operation-switch-questionRoot">
      <h3 className="generated-question__text ws-missing-operation-switch-questionHeading">
        {questionText}
      </h3>

      <div className="ws-missing-operation-switch-questionMachine">
        <div className="ws-missing-operation-switch-questionHeaderRow">
          <div className="ws-missing-operation-switch-questionBadge">
            🔎 CHOOSE YOUR TOOL
          </div>
        </div>

        <div className="ws-missing-operation-switch-questionEquationRow">
          <div className="ws-missing-operation-switch-questionOperand">
            {firstNumber}
          </div>

          <div className="ws-missing-operation-switch-questionOperatorSlot">
            {showAnswers ? correctAnswer : "◯"}
          </div>

          <div className="ws-missing-operation-switch-questionOperand">
            {secondNumber}
          </div>

          <div className="ws-missing-operation-switch-questionEquals">
            =
          </div>

          <div className="ws-missing-operation-switch-questionResult">
            {result}
          </div>
        </div>

        <div className="ws-missing-operation-switch-questionArrow">
          ↓
        </div>

        <div className="ws-missing-operation-switch-questionHint">
          Look at the first number and the final number.
          <br />
          Decide whether the value went up or down.
        </div>

        <div className="ws-missing-operation-switch-questionOptionsRow">
          {options.map((option, index) => {
            const value = String(option);

            const selected = selectedAnswer === value;

            const correct = answerMatches(
              value,
              correctAnswers.length > 0 ? correctAnswers : [correctAnswer],
            );

            let stateClass =
              "ws-missing-operation-switch-questionOptionBtn--default";

            if (selected && !showAnswers) {
              stateClass =
                "ws-missing-operation-switch-questionOptionBtn--selected";
            }

            if (showAnswers && correct) {
              stateClass =
                "ws-missing-operation-switch-questionOptionBtn--correct";
            }

            if (showAnswers && selected && !correct) {
              stateClass =
                "ws-missing-operation-switch-questionOptionBtn--wrong";
            }

            if (showAnswers) {
              stateClass += " ws-missing-operation-switch-questionOptionBtn--readonly";
            }

            return (
              <motion.button
                key={`${value}-${index}`}
                type="button"
                disabled={showAnswers}
                onClick={() => {
                  if (!showAnswers) {
                    onAnswerChange(value);
                  }
                }}
                whileHover={{
                  scale: showAnswers ? 1 : 1.04,
                }}
                whileTap={{
                  scale: showAnswers ? 1 : 0.96,
                }}
                className={`ws-missing-operation-switch-questionOptionBtn ${stateClass}`}
              >
                {value}

                {showAnswers && correct && (
                  <Check
                    size={18}
                    className="ws-missing-operation-switch-questionIconAfter"
                  />
                )}

                {showAnswers && selected && !correct && (
                  <X
                    size={18}
                    className="ws-missing-operation-switch-questionIconAfter"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {showAnswers && (
          <div className="ws-missing-operation-switch-questionCompleted">
            {data.completedEquation ??
              `${firstNumber} ${correctAnswer} ${secondNumber} = ${result}`}
          </div>
        )}
      </div>

      {showAnswers && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`ws-missing-operation-switch-questionResultPanel ${
            isCorrect
              ? "ws-missing-operation-switch-questionResultPanel--correct"
              : "ws-missing-operation-switch-questionResultPanel--incorrect"
          }`}
        >
          {isCorrect ? (
            <>
              <Check
                size={18}
                className="ws-missing-operation-switch-questionIconBefore"
              />
              Correct! The missing operation is <strong>{correctAnswer}</strong>
              .
            </>
          ) : (
            <>
              <X
                size={18}
                className="ws-missing-operation-switch-questionIconBefore"
              />
              Incorrect. The missing operation is{" "}
              <strong>{correctAnswer}</strong>.
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}


export default function MissingOperationSwitchQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <MissingOperationSwitchDisplay
      questionText={question.questionText}
      data={data}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      correctAnswers={correctAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
