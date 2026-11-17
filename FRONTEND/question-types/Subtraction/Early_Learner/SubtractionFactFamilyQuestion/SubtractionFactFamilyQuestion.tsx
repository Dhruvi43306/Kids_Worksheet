"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

type FactFamilyOption = {
  label: string;
  equations: string[];
  isCorrect?: boolean;
};

type OddOneOutOption = {
  label: string;
  equation: string;
  isCorrect?: boolean;
};

type FactFamilyNumbers = {
  whole?: number;
  larger?: number;
  smaller?: number;
};

type MissingEquation = {
  position: number;
  equation: string;
  isMissing: boolean;
  answer?: number | null;
};

type FactFamilyData = Omit<QuestionData, "options"> & {
  questionType?: string;

  numbers?: FactFamilyNumbers;

  options?: FactFamilyOption[] | OddOneOutOption[];

  statement?: string;
  statementIsCorrect?: boolean;

  equations?: MissingEquation[];
  missingAnswers?: number[];
};

function normalizeQuestionType(value: string): string {
  const normalized = value.trim().toUpperCase();

  const aliases: Record<string, string> = {
    FACTFAMILYCHOOSECORRECT: "FACT_FAMILY_CHOOSE_CORRECT",

    FACTFAMILYODDONEOUT: "FACT_FAMILY_ODD_ONE_OUT",

    FACTFAMILYTRUEFALSE: "FACT_FAMILY_TRUE_FALSE",

    FACTFAMILYMISSINGEQUATION: "FACT_FAMILY_MISSING_EQUATION",
  };

  return aliases[normalized] ?? normalized;
}

function isFactFamilyOption(
  option: FactFamilyOption | OddOneOutOption,
): option is FactFamilyOption {
  return "equations" in option;
}

export default function SubtractionFactFamilyQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const factFamilyData = data as FactFamilyData;

  const rawQuestionType =
    question.questionTypeCode?.trim() ||
    factFamilyData.questionType?.trim() ||
    "";

  const questionType = normalizeQuestionType(rawQuestionType);

  const currentArrayAnswer = Array.isArray(userAnswer) ? userAnswer : [];

  const currentSingleAnswer =
    userAnswer === undefined || userAnswer === null ? "" : String(userAnswer);

  const renderOptionResult = (selected: boolean, correct: boolean) => {
    if (!showAnswers) {
      return null;
    }

    if (selected && correct) {
      return (
        <Check
          size={20}
          className="subtraction-fact-family-question__option-status subtraction-fact-family-question__option-status--correct"
        />
      );
    }

    if (selected && !correct) {
      return (
        <X
          size={20}
          className="subtraction-fact-family-question__option-status subtraction-fact-family-question__option-status--wrong"
        />
      );
    }

    if (!selected && correct) {
      return (
        <Check
          size={20}
          className="subtraction-fact-family-question__option-status subtraction-fact-family-question__option-status--missed"
        />
      );
    }

    return null;
  };

  const renderChooseCorrect = () => {
    const options = (factFamilyData.options ?? []).filter(isFactFamilyOption);

    return (
      <>
        <div className="subtraction-fact-family-question__instruction">
          Choose the group that contains a correct fact family.
        </div>

        <div className="subtraction-fact-family-question__family-options">
          {options.map((option, index) => {
            const selected = currentSingleAnswer === option.label;

            const correct = answerMatches(option.label, correctAnswers);

            let optionClass = "subtraction-fact-family-question__family-option";

            if (selected) {
              optionClass +=
                " subtraction-fact-family-question__family-option--selected";
            }

            if (showAnswers) {
              if (selected && correct) {
                optionClass +=
                  " subtraction-fact-family-question__family-option--correct";
              } else if (selected && !correct) {
                optionClass +=
                  " subtraction-fact-family-question__family-option--wrong";
              } else if (!selected && correct) {
                optionClass +=
                  " subtraction-fact-family-question__family-option--missed";
              }
            }

            return (
              <motion.button
                key={`${option.label}-${index}`}
                type="button"
                disabled={showAnswers}
                className={optionClass}
                whileHover={{
                  scale: showAnswers ? 1 : 1.015,
                }}
                whileTap={{
                  scale: showAnswers ? 1 : 0.985,
                }}
                onClick={() => onAnswerChange(option.label)}
              >
                <div className="subtraction-fact-family-question__family-option-header">
                  <span className="subtraction-fact-family-question__family-option-label">
                    {option.label}
                  </span>

                  {renderOptionResult(selected, correct)}
                </div>

                <div className="subtraction-fact-family-question__equation-list">
                  {option.equations.map((equation, equationIndex) => (
                    <div
                      key={`${option.label}-${equationIndex}`}
                      className="subtraction-fact-family-question__equation-row"
                    >
                      {equation}
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </>
    );
  };

  const renderOddOneOut = () => {
    const options = (factFamilyData.options ?? []).filter(
      (option): option is OddOneOutOption => !isFactFamilyOption(option),
    );

    return (
      <>
        <div className="subtraction-fact-family-question__equation-options">
          {options.map((option, index) => {
            const selected = currentSingleAnswer === option.label;

            const correct = answerMatches(option.label, correctAnswers);

            let optionClass =
              "subtraction-fact-family-question__equation-option";

            if (selected) {
              optionClass +=
                " subtraction-fact-family-question__equation-option--selected";
            }

            if (showAnswers) {
              if (selected && correct) {
                optionClass +=
                  " subtraction-fact-family-question__equation-option--correct";
              } else if (selected && !correct) {
                optionClass +=
                  " subtraction-fact-family-question__equation-option--wrong";
              } else if (!selected && correct) {
                optionClass +=
                  " subtraction-fact-family-question__equation-option--missed";
              }
            }

            return (
              <motion.button
                key={`${option.label}-${index}`}
                type="button"
                disabled={showAnswers}
                className={optionClass}
                whileHover={{
                  scale: showAnswers ? 1 : 1.02,
                }}
                whileTap={{
                  scale: showAnswers ? 1 : 0.98,
                }}
                onClick={() => onAnswerChange(option.label)}
              >
                <span className="subtraction-fact-family-question__equation-label">
                  {option.label}
                </span>

                <span className="subtraction-fact-family-question__equation-text">
                  {option.equation}
                </span>

                {renderOptionResult(selected, correct)}
              </motion.button>
            );
          })}
        </div>
      </>
    );
  };

  const renderTrueFalse = () => {
    const selected = currentSingleAnswer;

    return (
      <>
        <div className="subtraction-fact-family-question__numbers">
          <span>Whole: {factFamilyData.numbers?.whole}</span>
          <span>Part: {factFamilyData.numbers?.larger}</span>
          <span>Part: {factFamilyData.numbers?.smaller}</span>
        </div>

        <div className="subtraction-fact-family-question__statement-card">
          <div className="subtraction-fact-family-question__statement-label">
            Statement
          </div>

          <div className="subtraction-fact-family-question__statement">
            {factFamilyData.statement}
          </div>
        </div>

        <div className="subtraction-fact-family-question__true-false-options">
          {["True", "False"].map((option) => {
            const isSelected = selected === option;

            const correct = answerMatches(option, correctAnswers);

            let optionClass =
              "subtraction-fact-family-question__true-false-option";

            if (isSelected) {
              optionClass +=
                " subtraction-fact-family-question__true-false-option--selected";
            }

            if (showAnswers) {
              if (isSelected && correct) {
                optionClass +=
                  " subtraction-fact-family-question__true-false-option--correct";
              } else if (isSelected && !correct) {
                optionClass +=
                  " subtraction-fact-family-question__true-false-option--wrong";
              } else if (!isSelected && correct) {
                optionClass +=
                  " subtraction-fact-family-question__true-false-option--missed";
              }
            }

            return (
              <motion.button
                key={option}
                type="button"
                disabled={showAnswers}
                className={optionClass}
                whileHover={{
                  scale: showAnswers ? 1 : 1.03,
                }}
                whileTap={{
                  scale: showAnswers ? 1 : 0.97,
                }}
                onClick={() => onAnswerChange(option)}
              >
                <span>{option}</span>

                {renderOptionResult(isSelected, correct)}
              </motion.button>
            );
          })}
        </div>
      </>
    );
  };

  const updateMissingAnswer = (index: number, value: string) => {
    const nextAnswers = [...currentArrayAnswer];

    nextAnswers[index] = value;

    onAnswerChange(nextAnswers);
  };

  const renderMissingEquation = () => {
    const equations = factFamilyData.equations ?? [];

    return (
      <>
        <div className="subtraction-fact-family-question__family-numbers">
          <span className="subtraction-fact-family-question__family-number">
            {factFamilyData.numbers?.whole}
          </span>

          <span className="subtraction-fact-family-question__family-number">
            {factFamilyData.numbers?.larger}
          </span>

          <span className="subtraction-fact-family-question__family-number">
            {factFamilyData.numbers?.smaller}
          </span>
        </div>

        <div className="subtraction-fact-family-question__missing-equations">
          {equations.map((item, index) => {
            const answerIndex = equations
              .slice(0, index)
              .filter((equation) => equation.isMissing).length;

            const isMissing = item.isMissing;

            const currentValue = currentArrayAnswer[answerIndex] ?? "";

            const correctValue = correctAnswers[answerIndex] ?? "";

            const isInputCorrect =
              String(currentValue).trim().toLowerCase() ===
              String(correctValue).trim().toLowerCase();

            let inputClass = "subtraction-fact-family-question__missing-input";

            if (showAnswers) {
              if (isInputCorrect) {
                inputClass +=
                  " subtraction-fact-family-question__missing-input--correct";
              } else if (String(currentValue).trim()) {
                inputClass +=
                  " subtraction-fact-family-question__missing-input--wrong";
              }
            }

            if (!isMissing) {
              return (
                <div
                  key={`${item.position}-${index}`}
                  className="subtraction-fact-family-question__missing-equation"
                >
                  <span className="subtraction-fact-family-question__missing-position">
                    {item.position}.
                  </span>

                  <span className="subtraction-fact-family-question__missing-equation-text">
                    {item.equation}
                  </span>
                </div>
              );
            }

            const equationParts = item.equation.split("?");

            return (
              <div
                key={`${item.position}-${index}`}
                className="subtraction-fact-family-question__missing-equation"
              >
                <span className="subtraction-fact-family-question__missing-position">
                  {item.position}.
                </span>

                <span className="subtraction-fact-family-question__missing-equation-text">
                  {equationParts[0]}
                </span>

                <input
                  type="number"
                  inputMode="numeric"
                  value={currentValue}
                  disabled={showAnswers}
                  aria-label={`Answer ${answerIndex + 1}`}
                  className={inputClass}
                  onChange={(event) =>
                    updateMissingAnswer(answerIndex, event.target.value)
                  }
                />

                <span className="subtraction-fact-family-question__missing-equation-text">
                  {equationParts[1] ?? ""}
                </span>

                {showAnswers &&
                  String(currentValue).trim() &&
                  (isInputCorrect ? (
                    <Check
                      size={20}
                      className="subtraction-fact-family-question__missing-status subtraction-fact-family-question__missing-status--correct"
                    />
                  ) : (
                    <X
                      size={20}
                      className="subtraction-fact-family-question__missing-status subtraction-fact-family-question__missing-status--wrong"
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderQuestionContent = () => {
    switch (questionType) {
      case "FACT_FAMILY_CHOOSE_CORRECT":
        return renderChooseCorrect();

      case "FACT_FAMILY_ODD_ONE_OUT":
        return renderOddOneOut();

      case "FACT_FAMILY_TRUE_FALSE":
        return renderTrueFalse();

      case "FACT_FAMILY_MISSING_EQUATION":
        return renderMissingEquation();

      default:
        return (
          <div className="subtraction-fact-family-question__unsupported">
            Unsupported subtraction fact-family question type:{" "}
            {questionType || "Unknown"}
          </div>
        );
    }
  };

  return (
    <div className="subtraction-fact-family-question">
      <div className="subtraction-fact-family-question__header">
        <h3 className="subtraction-fact-family-question__title">
          {question.questionText}
        </h3>
      </div>

      <div className="subtraction-fact-family-question__content">
        {renderQuestionContent()}
      </div>

      {showAnswers && <AnswerBox answer={correctAnswers.join(", ")} />}
    </div>
  );
}
