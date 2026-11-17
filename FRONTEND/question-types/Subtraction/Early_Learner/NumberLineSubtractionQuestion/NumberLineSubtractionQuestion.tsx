"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

type NumberLineOption = {
  value: number;
  isCorrect?: boolean;
};

type NumberLineJump = {
  start: number;
  end: number;
  size: number;
  direction?: string;
};

type NumberLineSubtractionData = Omit<QuestionData, "options"> & {
  questionType?: string;

  numberLine?: {
    min: number;
    max: number;
  };

  startNumber?: number | null;
  endNumber?: number | null;

  backwardSteps?: number | null;
  distance?: number | null;

  firstJump?: number;
  intermediate?: number;
  secondJump?: number;
  finalNumber?: number;

  jumps?: NumberLineJump[];

  direction?: string;

  equation?: string;

  selectionMode?: string;
  answerType?: string;

  options?: NumberLineOption[];
};

type NumberLineMarker = {
  value: number;
  label?: string;
  type?: "start" | "end" | "hidden" | "intermediate";
};

function normalizeQuestionType(value: string): string {
  const normalized = value.trim().toUpperCase();

  const aliases: Record<string, string> = {
    NUMBERLINESUBTRACTIONWRONGLANDING:
      "NUMBER_LINE_WRONG_LANDING",

    NUMBERLINEMISSINGSTART:
      "NUMBER_LINE_MISSING_START",

    NUMBERLINEMISSINGJUMPS:
      "NUMBER_LINE_MISSING_JUMPS",

    NUMBERLINEFINDDISTANCE:
      "NUMBER_LINE_FIND_DISTANCE",

    NUMBERLINESUBTRACTIONSEQUENCE:
      "NUMBER_LINE_SUBTRACTION_SEQUENCE",
  };

  return aliases[normalized] ?? normalized;
}

function getNumberLineValue(
  value: number,
  min: number,
  max: number,
): number {
  if (max <= min) {
    return 0.5;
  }

  return (value - min) / (max - min);
}

function getLabelStep(min: number, max: number): number {
  const count = max - min + 1;

  if (count <= 20) {
    return 1;
  }

  if (count <= 50) {
    return 5;
  }

  return 10;
}

function NumberLineVisual({
  min,
  max,
  markers = [],
  jumps = [],
}: {
  min: number;
  max: number;
  markers?: NumberLineMarker[];
  jumps?: NumberLineJump[];
}) {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  const numberCount = safeMax - safeMin + 1;

  if (numberCount <= 0) {
    return null;
  }

  const width = 1000;
  const lineY = 62;
  const startX = 40;
  const endX = 960;
  const lineWidth = endX - startX;

  const getX = (value: number) => {
    const ratio = getNumberLineValue(
      value,
      safeMin,
      safeMax,
    );

    return startX + lineWidth * ratio;
  };

  const labelStep = getLabelStep(
    safeMin,
    safeMax,
  );

  const markerMap = new Map<number, NumberLineMarker>();

  markers.forEach((marker) => {
    markerMap.set(marker.value, marker);
  });

  const markerValues = new Set(
    markers.map((marker) => marker.value),
  );

  const visibleNumbers = Array.from(
    { length: numberCount },
    (_, index) => safeMin + index,
  );

  return (
    <div className="number-line-subtraction-question__line-wrapper">
      <svg
        className="number-line-subtraction-question__line-svg"
        viewBox={`0 0 ${width} 150`}
        role="img"
        aria-label="Subtraction number line"
      >
        <defs>
          <marker
            id="number-line-subtraction-backward-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L6,3 z"
              className="number-line-subtraction-question__arrow-head"
            />
          </marker>

          <marker
            id="number-line-subtraction-end-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L6,3 z"
              className="number-line-subtraction-question__arrow-head"
            />
          </marker>
        </defs>

        <line
          x1={startX}
          y1={lineY}
          x2={endX}
          y2={lineY}
          className="number-line-subtraction-question__base-line"
        />

        <line
          x1={startX}
          y1={lineY}
          x2={startX + 8}
          y2={lineY}
          className="number-line-subtraction-question__left-cap"
          markerStart="url(#number-line-subtraction-backward-arrow)"
        />

        <line
          x1={endX}
          y1={lineY}
          x2={endX - 8}
          y2={lineY}
          className="number-line-subtraction-question__right-cap"
        />

        {visibleNumbers.map((number) => {
          const x = getX(number);
          const marker = markerMap.get(number);

          const shouldLabel =
            number === safeMin ||
            number === safeMax ||
            number % labelStep === 0 ||
            markerValues.has(number);

          return (
            <g
              key={number}
              className="number-line-subtraction-question__tick-group"
            >
              <line
                x1={x}
                y1={lineY - 9}
                x2={x}
                y2={lineY + 9}
                className="number-line-subtraction-question__tick"
              />

              {shouldLabel && (
                <text
                  x={x}
                  y={lineY + 34}
                  textAnchor="middle"
                  className={[
                    "number-line-subtraction-question__tick-label",
                    marker?.type === "start"
                      ? "number-line-subtraction-question__tick-label--start"
                      : "",
                    marker?.type === "end"
                      ? "number-line-subtraction-question__tick-label--end"
                      : "",
                    marker?.type === "hidden"
                      ? "number-line-subtraction-question__tick-label--hidden"
                      : "",
                    marker?.type === "intermediate"
                      ? "number-line-subtraction-question__tick-label--intermediate"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {marker?.label ?? number}
                </text>
              )}

              {marker?.type === "start" && (
                <circle
                  cx={x}
                  cy={lineY}
                  r="9"
                  className="number-line-subtraction-question__marker number-line-subtraction-question__marker--start"
                />
              )}

              {marker?.type === "end" && (
                <circle
                  cx={x}
                  cy={lineY}
                  r="9"
                  className="number-line-subtraction-question__marker number-line-subtraction-question__marker--end"
                />
              )}

              {marker?.type === "intermediate" && (
                <circle
                  cx={x}
                  cy={lineY}
                  r="8"
                  className="number-line-subtraction-question__marker number-line-subtraction-question__marker--intermediate"
                />
              )}
            </g>
          );
        })}

        {jumps.map((jump, index) => {
          const xStart = getX(jump.start);
          const xEnd = getX(jump.end);
          const middleX = (xStart + xEnd) / 2;

          return (
            <g
              key={`${jump.start}-${jump.end}-${index}`}
              className="number-line-subtraction-question__jump"
            >
              <line
                x1={xStart}
                y1={44 - index * 18}
                x2={xEnd}
                y2={44 - index * 18}
                className="number-line-subtraction-question__jump-line"
                markerEnd="url(#number-line-subtraction-backward-arrow)"
              />

              <text
                x={middleX}
                y={34 - index * 18}
                textAnchor="middle"
                className="number-line-subtraction-question__jump-label"
              >
                {jump.size} steps
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function NumberLineSubtractionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const subtractionData =
    data as NumberLineSubtractionData;

  const rawQuestionType =
    question.questionTypeCode?.trim() ||
    subtractionData.questionType?.trim() ||
    "";

  const questionType =
    normalizeQuestionType(rawQuestionType);

  const numberLine =
    subtractionData.numberLine ?? {
      min: 1,
      max: 10,
    };

  const min =
    numberLine.min;

  const max =
    numberLine.max;

  const currentAnswer =
    userAnswer === undefined ||
    userAnswer === null
      ? ""
      : String(userAnswer);

  const hasAnswer =
    currentAnswer.trim().length > 0;

  const isCorrect =
    hasAnswer &&
    answerMatches(
      currentAnswer,
      correctAnswers,
    );

  const renderNumberInput = () => {
    let inputClass =
      "number-line-subtraction-question__input";

    if (showAnswers) {
      if (isCorrect) {
        inputClass +=
          " number-line-subtraction-question__input--correct";
      } else if (hasAnswer) {
        inputClass +=
          " number-line-subtraction-question__input--wrong";
      }
    }

    return (
      <div className="number-line-subtraction-question__answer-area">
        <input
          type="number"
          inputMode="numeric"
          value={currentAnswer}
          disabled={showAnswers}
          aria-label="Answer"
          className={inputClass}
          onChange={(event) =>
            onAnswerChange(event.target.value)
          }
        />

        {showAnswers &&
          hasAnswer &&
          isCorrect && (
            <Check
              size={22}
              className="number-line-subtraction-question__answer-icon number-line-subtraction-question__answer-icon--correct"
            />
          )}

        {showAnswers &&
          hasAnswer &&
          !isCorrect && (
            <X
              size={22}
              className="number-line-subtraction-question__answer-icon number-line-subtraction-question__answer-icon--wrong"
            />
          )}
      </div>
    );
  };

  const renderWrongLandingOptions = () => {
    const options =
      subtractionData.options ?? [];

    return (
      <div className="number-line-subtraction-question__options">
        {options.map((option, index) => {
          const selected =
            String(userAnswer) ===
            String(option.value);

          const correct =
            answerMatches(
              option.value,
              correctAnswers,
            );

          let optionClass =
            "number-line-subtraction-question__option";

          if (selected) {
            optionClass +=
              " number-line-subtraction-question__option--selected";
          }

          if (showAnswers) {
            if (selected && correct) {
              optionClass +=
                " number-line-subtraction-question__option--correct";
            } else if (
              selected &&
              !correct
            ) {
              optionClass +=
                " number-line-subtraction-question__option--wrong";
            } else if (
              !selected &&
              correct
            ) {
              optionClass +=
                " number-line-subtraction-question__option--missed";
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
              onClick={() =>
                onAnswerChange(option.value)
              }
            >
              <span className="number-line-subtraction-question__option-value">
                {option.value}
              </span>

              {showAnswers &&
                selected &&
                correct && (
                  <Check
                    size={20}
                    className="number-line-subtraction-question__option-icon number-line-subtraction-question__option-icon--correct"
                  />
                )}

              {showAnswers &&
                selected &&
                !correct && (
                  <X
                    size={20}
                    className="number-line-subtraction-question__option-icon number-line-subtraction-question__option-icon--wrong"
                  />
                )}

              {showAnswers &&
                !selected &&
                correct && (
                  <Check
                    size={20}
                    className="number-line-subtraction-question__option-icon number-line-subtraction-question__option-icon--missed"
                  />
                )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderWrongLanding = () => {
    const startNumber =
      subtractionData.startNumber;

    const endNumber =
      subtractionData.endNumber;

    const backwardSteps =
      subtractionData.backwardSteps;

    if (
      startNumber === null ||
      startNumber === undefined ||
      endNumber === null ||
      endNumber === undefined ||
      backwardSteps === null ||
      backwardSteps === undefined
    ) {
      return (
        <div className="number-line-subtraction-question__error">
          Number-line subtraction data is incomplete.
        </div>
      );
    }

    return (
      <>
        <div className="number-line-subtraction-question__instruction">
          Start at {startNumber}. Move backward{" "}
          {backwardSteps} steps.
        </div>

        <NumberLineVisual
          min={min}
          max={max}
          markers={[
            {
              value: startNumber,
              type: "start",
              label: String(startNumber),
            },
          ]}
          jumps={[
            {
              start: startNumber,
              end: endNumber,
              size: backwardSteps,
              direction: "backward",
            },
          ]}
        />

        <div className="number-line-subtraction-question__choice-label">
          Choose the correct landing point:
        </div>

        {renderWrongLandingOptions()}
      </>
    );
  };

  const renderMissingStart = () => {
    const endNumber =
      subtractionData.endNumber;

    const backwardSteps =
      subtractionData.backwardSteps;

    if (
      endNumber === null ||
      endNumber === undefined ||
      backwardSteps === null ||
      backwardSteps === undefined
    ) {
      return (
        <div className="number-line-subtraction-question__error">
          Missing-start number-line data is incomplete.
        </div>
      );
    }

    const hiddenStart =
      endNumber + backwardSteps;

    return (
      <>
        <div className="number-line-subtraction-question__equation">
          {subtractionData.equation ??
            `? - ${backwardSteps} = ${endNumber}`}
        </div>

        <NumberLineVisual
          min={min}
          max={max}
          markers={[
            {
              value: hiddenStart,
              type: "hidden",
              label: "?",
            },
            {
              value: endNumber,
              type: "end",
              label: String(endNumber),
            },
          ]}
          jumps={[
            {
              start: hiddenStart,
              end: endNumber,
              size: backwardSteps,
              direction: "backward",
            },
          ]}
        />

        <div className="number-line-subtraction-question__input-prompt">
          What is the starting number?
        </div>

        {renderNumberInput()}
      </>
    );
  };

  const renderMissingJumps = () => {
    const startNumber =
      subtractionData.startNumber;

    const endNumber =
      subtractionData.endNumber;

    if (
      startNumber === null ||
      startNumber === undefined ||
      endNumber === null ||
      endNumber === undefined
    ) {
      return (
        <div className="number-line-subtraction-question__error">
          Missing-jumps number-line data is incomplete.
        </div>
      );
    }

    return (
      <>
        <div className="number-line-subtraction-question__equation">
          {subtractionData.equation ??
            `${startNumber} - ? = ${endNumber}`}
        </div>

        <NumberLineVisual
          min={min}
          max={max}
          markers={[
            {
              value: startNumber,
              type: "start",
              label: String(startNumber),
            },
            {
              value: endNumber,
              type: "end",
              label: String(endNumber),
            },
          ]}
          jumps={[
            {
              start: startNumber,
              end: endNumber,
              size:
                Math.abs(startNumber - endNumber),
              direction: "backward",
            },
          ]}
        />

        <div className="number-line-subtraction-question__input-prompt">
          How many backward steps?
        </div>

        {renderNumberInput()}
      </>
    );
  };

  const renderFindDistance = () => {
    const startNumber =
      subtractionData.startNumber;

    const endNumber =
      subtractionData.endNumber;

    if (
      startNumber === null ||
      startNumber === undefined ||
      endNumber === null ||
      endNumber === undefined
    ) {
      return (
        <div className="number-line-subtraction-question__error">
          Distance number-line data is incomplete.
        </div>
      );
    }

    const distance =
      Math.abs(
        startNumber - endNumber,
      );

    return (
      <>
        <NumberLineVisual
          min={min}
          max={max}
          markers={[
            {
              value: startNumber,
              type: "start",
              label: String(startNumber),
            },
            {
              value: endNumber,
              type: "end",
              label: String(endNumber),
            },
          ]}
          jumps={[
            {
              start: startNumber,
              end: endNumber,
              size: distance,
              direction: "backward",
            },
          ]}
        />

        <div className="number-line-subtraction-question__distance-equation">
          {startNumber} − ? = {endNumber}
        </div>

        <div className="number-line-subtraction-question__input-prompt">
          How many steps backward?
        </div>

        {renderNumberInput()}
      </>
    );
  };

  const renderSequence = () => {
    const startNumber =
      subtractionData.startNumber;

    const firstJump =
      subtractionData.firstJump;

    const intermediate =
      subtractionData.intermediate;

    const secondJump =
      subtractionData.secondJump;

    const finalNumber =
      subtractionData.finalNumber;

    if (
      startNumber === null ||
      startNumber === undefined ||
      firstJump === undefined ||
      intermediate === undefined ||
      secondJump === undefined ||
      finalNumber === undefined
    ) {
      return (
        <div className="number-line-subtraction-question__error">
          Subtraction-sequence number-line data is incomplete.
        </div>
      );
    }

    return (
      <>
        <div className="number-line-subtraction-question__equation">
          {subtractionData.equation ??
            `${startNumber} - ${firstJump} - ${secondJump} = ?`}
        </div>

        <NumberLineVisual
          min={min}
          max={max}
          markers={[
            {
              value: startNumber,
              type: "start",
              label: String(startNumber),
            },
            {
              value: intermediate,
              type: "intermediate",
              label: String(intermediate),
            },
            {
              value: finalNumber,
              type: "hidden",
              label: "?",
            },
          ]}
          jumps={[
            {
              start: startNumber,
              end: intermediate,
              size: firstJump,
              direction: "backward",
            },
            {
              start: intermediate,
              end: finalNumber,
              size: secondJump,
              direction: "backward",
            },
          ]}
        />

        <div className="number-line-subtraction-question__input-prompt">
          Where do you finish?
        </div>

        {renderNumberInput()}
      </>
    );
  };

  const renderQuestionContent = () => {
    switch (questionType) {
      case "NUMBER_LINE_WRONG_LANDING":
        return renderWrongLanding();

      case "NUMBER_LINE_MISSING_START":
        return renderMissingStart();

      case "NUMBER_LINE_MISSING_JUMPS":
        return renderMissingJumps();

      case "NUMBER_LINE_FIND_DISTANCE":
        return renderFindDistance();

      case "NUMBER_LINE_SUBTRACTION_SEQUENCE":
        return renderSequence();

      default:
        return (
          <div className="number-line-subtraction-question__unsupported">
            Unsupported subtraction number-line question type:{" "}
            {questionType || "Unknown"}
          </div>
        );
    }
  };

  return (
    <div className="number-line-subtraction-question">
      <div className="number-line-subtraction-question__header">
        <h3 className="number-line-subtraction-question__title">
          {question.questionText}
        </h3>
      </div>

      <div className="number-line-subtraction-question__content">
        {renderQuestionContent()}
      </div>

      {showAnswers && (
        <AnswerBox
          answer={correctAnswers.join(", ")}
        />
      )}
    </div>
  );
}