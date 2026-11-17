import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

function AdditionVisualDisplay({
  firstGroup,
  secondGroup,
  operatorSymbol = "+",
}: {
  firstGroup: string[];
  secondGroup?: string[];
  operatorSymbol?: string;
}) {
  const hasFirst = firstGroup && firstGroup.length > 0;
  const hasSecond = secondGroup && secondGroup.length > 0;

  if (!hasFirst && !hasSecond) return null;

  return (
    <div className="additionVisualGroups">
      <div className="additionVisualGroup">
        {firstGroup.map((icon, index) => (
          <span
            className="additionVisualObject"
            key={`first-${index}`}
          >
            {icon}
          </span>
        ))}
      </div>

      {hasSecond && (
        <span className="additionVisualOperator">
          {operatorSymbol}
        </span>
      )}

      {hasSecond && (
        <div className="additionVisualGroup">
          {secondGroup!.map((icon, index) => (
            <span
              className="additionVisualObject"
              key={`second-${index}`}
            >
              {icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdditionVisualQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const firstGroup = data.firstGroup ?? [];
  const secondGroup = data.secondGroup ?? [];

  const isMatchObjectsNumber =
    firstGroup.length > 0 &&
    secondGroup.length === 0 &&
    Array.isArray(data.option) &&
    data.option.length > 0;

  const isOptionCorrect = (value: string | number) =>
    answerMatches(value, correctAnswers);

  const isCountAddChoose =
    question.questionTypeId === 17 ||
    data.questionType === "countAndAddChoose" ||
    (Array.isArray(data.option) && data.option.length > 0);

  const isEquationQuestion =
    data.firstcount !== undefined &&
    data.secondcount !== undefined;

  const isCountBothGroups =
    data.questionType === "countBothGroups";

  const userString = String(userAnswer ?? "").trim();
  const isTextCorrect = answerMatches(userString, correctAnswers);

  const renderOption = (
    option: string | number,
    index: number,
    variant: "count" | "match",
  ) => {
    const isSelected =
      String(userAnswer) === String(option);

    const correct = isOptionCorrect(option);
    const isWrong = isSelected && !correct;
    const isMissed =
      showAnswers && !isSelected && correct;

    const stateClass = showAnswers
      ? isSelected && correct
        ? "additionVisualOptionCorrect"
        : isWrong
          ? "additionVisualOptionWrong"
          : isMissed
            ? "additionVisualOptionMissed"
            : "additionVisualOptionDefault"
      : isSelected
        ? "additionVisualOptionSelected"
        : "additionVisualOptionDefault";

    return (
      <motion.button
        key={`${option}-${index}`}
        type="button"
        className={[
          "additionVisualOption",
          variant === "count"
            ? "additionVisualOptionCount"
            : "additionVisualOptionMatch",
          stateClass,
        ].join(" ")}
        whileHover={{ scale: showAnswers ? 1 : 1.05 }}
        whileTap={{ scale: showAnswers ? 1 : 0.97 }}
        onClick={() => {
          if (!showAnswers) {
            onAnswerChange(option);
          }
        }}
      >
        {option}

        {showAnswers && isSelected && correct && (
          <Check
            className="additionVisualOptionIcon"
            size={16}
          />
        )}

        {showAnswers && isWrong && (
          <X
            className="additionVisualOptionIcon"
            size={16}
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className="additionVisualQuestion">
      {!isEquationQuestion && (
        <h3 className="additionVisualQuestionText">
          {question.questionText}
        </h3>
      )}

      <AdditionVisualDisplay
        firstGroup={firstGroup}
        secondGroup={secondGroup}
        operatorSymbol={data.operatorSymbol ?? "+"}
      />

      {/* EQUATION QUESTION */}
      {isEquationQuestion && (
        <div className="additionVisualEquation">
          <span>{data.firstcount}</span>
          <span>{data.operatorSymbol ?? "+"}</span>
          <span>{data.secondcount}</span>
          <span>=</span>
          <span className="additionVisualEquationBlank">
            ?
          </span>
        </div>
      )}

      {/* COUNT AND ADD CHOOSE */}
      {isCountAddChoose && (
        <div className="additionVisualCountOptions">
          {(data.options ?? []).map((option, index) =>
            renderOption(option, index, "count"),
          )}
        </div>
      )}

      {/* MATCH OBJECTS TO NUMBER */}
      {isMatchObjectsNumber && (
        <div className="additionVisualMatchOptions">
          {data.option!.map((option, index) =>
            renderOption(option, index, "match"),
          )}
        </div>
      )}

      {/* NORMAL ANSWER INPUT */}
      {!isMatchObjectsNumber && (
        <div className="additionVisualAnswerRow">
          <span className="additionVisualAnswerLabel">
            Answer:
          </span>

          <input
            className={[
              "additionVisualAnswerInput",
              showAnswers
                ? isTextCorrect
                  ? "additionVisualInputCorrect"
                  : "additionVisualInputWrong"
                : "",
            ].join(" ")}
            type="text"
            value={userAnswer ?? ""}
            disabled={showAnswers}
            onChange={(event) =>
              onAnswerChange(event.target.value)
            }
            placeholder={
              isCountBothGroups
                ? "e.g. 4,5"
                : "Write answer"
            }
          />

          {showAnswers &&
            (isTextCorrect ? (
              <span className="additionVisualAnswerCorrect">
                <Check size={18} />
                Correct
              </span>
            ) : (
              <span className="additionVisualAnswerWrong">
                <X size={18} />
                Incorrect
              </span>
            ))}
        </div>
      )}

      {showAnswers && (
        <AnswerBox answer={correctAnswers.join(", ")} />
      )}
    </div>
  );
}