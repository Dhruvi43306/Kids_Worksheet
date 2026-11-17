"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";


type ObjectSubtractionOption = {
  value: number;
  objects: string[];
};

type ObjectSubtractionData = Omit<QuestionData, "options"> & {
  firstGroup?: string[];
  secondGroup?: string[];
  removedGroup?: string[];
  remainingGroup?: string[];

  firstCount?: number;
  secondCount?: number;
  removedCount?: number;
  remainingCount?: number;

  difference?: number;
  targetCount?: number;
  removeCount?: number;

  equation?: string;

  options?: ObjectSubtractionOption[];
};

function ObjectGroup({
  label,
  objects = [],
}: {
  label: string;
  objects?: string[];
}) {
  return (
    <div className="object-subtraction-question__group">
      {" "}
      <div className="object-subtraction-question__group-title">{label} </div>
      <div className="object-subtraction-question__objects">
        {objects.length > 0 ? (
          objects.map((icon, index) => (
            <span
              key={`${icon}-${index}`}
              className="object-subtraction-question__object"
            >
              {icon}
            </span>
          ))
        ) : (
          <span className="object-subtraction-question__empty">—</span>
        )}
      </div>
    </div>
  );
}

function EquationBox({ equation }: { equation?: string }) {
  if (!equation) {
    return null;
  }

  return (
    <div className="object-subtraction-question__equation">{equation} </div>
  );
}

export default function ObjectSubtractionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const subtractionData = data as ObjectSubtractionData;

 const questionTypeAliases: Record<string, string> = {
  OBJECTSUBTRACTIONRESULT: "OBJECT_SUBTRACTION_RESULT",

  OBJECTSUBTRACTIONMISSINGTAKEAWAY: "OBJECT_SUBTRACTION_MISSING_TAKEAWAY",

  OBJECTSUBTRACTIONMISSINGSTART: "OBJECT_SUBTRACTION_MISSING_START",

  OBJECTGROUPDIFFERENCE:"OBJECT_GROUP_DIFFERENCE",

  OBJECTSUBTRACTIONEQUALIZE:"OBJECT_SUBTRACTION_EQUALIZE",

  OBJECTSUBTRACTIONCHOOSERESULT:"OBJECT_SUBTRACTION_CHOOSE_RESULT",
};

const rawQuestionType = question.questionTypeCode?.trim() || subtractionData.questionType?.trim() || "";

const normalizedQuestionType = rawQuestionType.toUpperCase();

const questionType = questionTypeAliases[normalizedQuestionType] || normalizedQuestionType;

  const currentAnswer =
    userAnswer === undefined || userAnswer === null ? "" : String(userAnswer);

  const hasAnswer = currentAnswer.trim().length > 0;

  const isCorrect = hasAnswer && answerMatches(currentAnswer, correctAnswers);

  const selectOption = (value: number) => {
    if (showAnswers) {
      return;
    }

    onAnswerChange(value);
  };

  const renderNumberInput = () => {
    let inputStateClass = "object-subtraction-question__input";

    if (showAnswers) {
      if (isCorrect) {
        inputStateClass += " object-subtraction-question__input--correct";
      } else if (hasAnswer) {
        inputStateClass += " object-subtraction-question__input--wrong";
      }
    }

    return (
      <div className="object-subtraction-question__answer-area">
        <input
          type="number"
          inputMode="numeric"
          value={currentAnswer}
          disabled={showAnswers}
          aria-label="Answer"
          className={inputStateClass}
          onChange={(event) => onAnswerChange(event.target.value)}
        />

        {showAnswers && hasAnswer && isCorrect && (
          <Check
            size={22}
            className="object-subtraction-question__result-icon object-subtraction-question__result-icon--correct"
          />
        )}

        {showAnswers && hasAnswer && !isCorrect && (
          <X
            size={22}
            className="object-subtraction-question__result-icon object-subtraction-question__result-icon--wrong"
          />
        )}
      </div>
    );
  };

  const renderChooseResultOptions = () => {
    const options = subtractionData.options ?? [];

    return (
      <div className="object-subtraction-question__options">
        {options.map((option, index) => {
          const selected = String(userAnswer) === String(option.value);

          const correct = answerMatches(option.value, correctAnswers);

          let optionClass = "object-subtraction-question__option";

          if (selected) {
            optionClass += " object-subtraction-question__option--selected";
          }

          if (showAnswers) {
            if (selected && correct) {
              optionClass += " object-subtraction-question__option--correct";
            } else if (selected && !correct) {
              optionClass += " object-subtraction-question__option--wrong";
            } else if (!selected && correct) {
              optionClass += " object-subtraction-question__option--missed";
            }
          }

          return (
            <motion.button
              key={`${option.value}-${index}`}
              type="button"
              disabled={showAnswers}
              className={optionClass}
              whileHover={{
                scale: showAnswers ? 1 : 1.03,
              }}
              whileTap={{
                scale: showAnswers ? 1 : 0.98,
              }}
              onClick={() => selectOption(option.value)}
            >
              <div className="object-subtraction-question__option-number">
                {option.value}
              </div>

              <div className="object-subtraction-question__option-objects">
                {(option.objects ?? []).map((icon, objectIndex) => (
                  <span
                    key={`${icon}-${objectIndex}`}
                    className="object-subtraction-question__option-object"
                  >
                    {icon}
                  </span>
                ))}
              </div>

              {showAnswers && selected && correct && (
                <Check
                  size={19}
                  className="object-subtraction-question__option-status object-subtraction-question__option-status--correct"
                />
              )}

              {showAnswers && selected && !correct && (
                <X
                  size={19}
                  className="object-subtraction-question__option-status object-subtraction-question__option-status--wrong"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderQuestionContent = () => {
    switch (questionType) {
      case "OBJECT_SUBTRACTION_RESULT":
        return (
          <>
            {" "}
            <div className="object-subtraction-question__groups">
              <ObjectGroup label="Start" objects={subtractionData.firstGroup} />

              <div className="object-subtraction-question__operator">−</div>

              <ObjectGroup
                label="Take Away"
                objects={subtractionData.removedGroup}
              />
            </div>
            {renderNumberInput()}
          </>
        );

      case "OBJECT_SUBTRACTION_MISSING_TAKEAWAY":
        return (
          <>
            <div className="object-subtraction-question__groups">
              <ObjectGroup label="Start" objects={subtractionData.firstGroup} />

              <div className="object-subtraction-question__operator">− ?</div>

              <ObjectGroup
                label="Remaining"
                objects={subtractionData.remainingGroup}
              />
            </div>

            <EquationBox equation={subtractionData.equation} />

            {renderNumberInput()}
          </>
        );

      case "OBJECT_SUBTRACTION_MISSING_START":
        return (
          <>
            <div className="object-subtraction-question__groups object-subtraction-question__groups--three">
              <ObjectGroup label="Start" objects={[]} />

              <div className="object-subtraction-question__operator">−</div>

              <ObjectGroup
                label="Taken Away"
                objects={subtractionData.removedGroup}
              />

              <div className="object-subtraction-question__operator">=</div>

              <ObjectGroup
                label="Remaining"
                objects={subtractionData.remainingGroup}
              />
            </div>

            <EquationBox equation={subtractionData.equation} />

            {renderNumberInput()}
          </>
        );

      case "OBJECT_GROUP_DIFFERENCE":
        return (
          <>
            <div className="object-subtraction-question__comparison">
              <ObjectGroup
                label="Group A"
                objects={subtractionData.firstGroup}
              />

              <div className="object-subtraction-question__comparison-label">
                VS
              </div>

              <ObjectGroup
                label="Group B"
                objects={
                  subtractionData.secondGroup ?? subtractionData.removedGroup
                }
              />
            </div>

            <div className="object-subtraction-question__prompt">
              How many more objects are in Group A?
            </div>

            <EquationBox equation={subtractionData.equation} />

            {renderNumberInput()}
          </>
        );

      case "OBJECT_SUBTRACTION_EQUALIZE":
        return (
          <>
            <div className="object-subtraction-question__comparison">
              <ObjectGroup
                label="Larger Group"
                objects={subtractionData.firstGroup}
              />

              <div className="object-subtraction-question__comparison-label">
                =
              </div>

              <ObjectGroup
                label="Smaller Group"
                objects={
                  subtractionData.secondGroup ?? subtractionData.removedGroup
                }
              />
            </div>

            <div className="object-subtraction-question__prompt">
              Remove how many objects from the larger group to make both groups
              equal?
            </div>

            <EquationBox equation={subtractionData.equation} />

            {renderNumberInput()}
          </>
        );

      case "OBJECT_SUBTRACTION_CHOOSE_RESULT":
        return (
          <>
            <div className="object-subtraction-question__groups">
              <ObjectGroup label="Start" objects={subtractionData.firstGroup} />

              <div className="object-subtraction-question__operator">−</div>

              <ObjectGroup
                label="Take Away"
                objects={subtractionData.removedGroup}
              />
            </div>

            <EquationBox equation={subtractionData.equation} />

            <div className="object-subtraction-question__prompt">
              Choose the group that shows how many objects are left.
            </div>

            {renderChooseResultOptions()}
          </>
        );

      default:
        return (
          <div className="object-subtraction-question__unsupported">
            Unsupported subtraction question type: {questionType || "Unknown"}
          </div>
        );
    }
  };

  return (
    <div className="object-subtraction-question">
      {" "}
      <div className="object-subtraction-question__header">
        {" "}
        <h3 className="object-subtraction-question__title">
          {question.questionText}{" "}
        </h3>{" "}
      </div>
      <div className="object-subtraction-question__content">
        {renderQuestionContent()}
      </div>
      {showAnswers && <AnswerBox answer={correctAnswers.join(", ")} />}
    </div>
  );
}
