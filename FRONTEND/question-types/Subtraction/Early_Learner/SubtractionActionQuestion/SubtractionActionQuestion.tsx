"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

import type { QuestionData } from "@/app/worksheet/type";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

type SubtractionActionOption = {
  value: number;
  objects?: string[];
  isCorrect?: boolean;
};

type SubtractionActionData = Omit<
  QuestionData,
  "options" | "missingPosition"
> & {
  startCount?: number;
  takeAwayCount?: number;
  remainingCount?: number;

  removeCount?: number;
  targetCount?: number;
  correctTakeAway?: number;
  crossOutCount?: number;

  missingPosition?: "start" | "takeAway" | "remaining" | string;

  objects?: string[];

  optionValues?: number[];

  options?: Array<string | number | SubtractionActionOption>;

  equation?: string;

  remainingGroup?: string[];
};

function normalizeQuestionType(value?: string | null): string {
  return (value ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
}

function resolveQuestionType(
  question: QuestionRendererProps["question"],
  data: SubtractionActionData,
): string {
  const raw = normalizeQuestionType(
    question.questionTypeCode ?? data.questionType,
  );

  const aliases: Record<string, string> = {
    CROSSOUTOBJECTS: "CROSS_OUT_OBJECTS",
    DRAWANDCROSSOUT: "DRAW_AND_CROSS_OUT",
    CHOOSETAKEAWAY: "CHOOSE_TAKE_AWAY",
    MISSINGNUMBERSUBTRACTION: "MISSING_NUMBER_SUBTRACTION",
  };

  return aliases[raw] ?? raw;
}

function getNumber(value: number | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeOption(
  option: string | number | SubtractionActionOption,
): SubtractionActionOption | null {
  if (typeof option === "number" && Number.isFinite(option)) {
    return {
      value: option,
    };
  }

  if (typeof option === "string") {
    const value = Number(option);

    if (Number.isFinite(value)) {
      return {
        value,
      };
    }

    return null;
  }

  if (
    typeof option === "object" &&
    option !== null &&
    Number.isFinite(option.value)
  ) {
    return {
      value: Number(option.value),
      objects: option.objects ?? [],
      isCorrect: option.isCorrect,
    };
  }

  return null;
}

function buildFallbackObjects(
  objects: string[] | undefined,
  count: number,
): string[] {
  if (Array.isArray(objects) && objects.length > 0) {
    return objects;
  }

  return Array.from(
    {
      length: Math.max(0, count),
    },
    () => "⭐",
  );
}

function ActionObjects({
  objects,
  crossedIndexes,
  allowInteraction,
  mode,
  onToggle,
}: {
  objects: string[];
  crossedIndexes: Set<number>;
  allowInteraction: boolean;
  mode: "cross" | "draw";
  onToggle: (index: number) => void;
}) {
  return (
    <div
      className="subtraction-action-question__objects"
      role="group"
      aria-label="Objects to subtract"
    >
      {objects.map((icon, index) => {
        const crossed = crossedIndexes.has(index);

        return (
          <button
            key={`subtraction-action-object-${index}`}
            type="button"
            disabled={!allowInteraction}
            className={[
              "subtraction-action-question__object",
              crossed ? "subtraction-action-question__object--crossed" : "",
              mode === "draw"
                ? "subtraction-action-question__object--draw-mode"
                : "subtraction-action-question__object--cross-mode",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={
              crossed
                ? `Object ${index + 1} crossed out`
                : `Object ${index + 1}`
            }
            aria-pressed={crossed}
            onClick={() => onToggle(index)}
          >
            <span className="subtraction-action-question__object-icon">
              {icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function QuestionStatus({
  showAnswers,
  hasAnswer,
  isCorrect,
}: {
  showAnswers: boolean;
  hasAnswer: boolean;
  isCorrect: boolean;
}) {
  if (!showAnswers || !hasAnswer) {
    return null;
  }

  return (
    <div
      className={
        isCorrect
          ? "subtraction-action-question__status subtraction-action-question__status--correct"
          : "subtraction-action-question__status subtraction-action-question__status--wrong"
      }
    >
      {isCorrect ? <Check size={18} /> : <X size={18} />}

      <span>{isCorrect ? "Correct" : "Incorrect"}</span>
    </div>
  );
}

function AnswerReveal({ answer }: { answer: string }) {
  return (
    <div className="subtraction-action-question__answer-reveal">
      <span className="subtraction-action-question__answer-label">
        Correct Answer
      </span>

      <span className="subtraction-action-question__answer-value">
        {answer}
      </span>
    </div>
  );
}

export default function SubtractionActionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const actionData = data as SubtractionActionData;

  const questionType = resolveQuestionType(question, actionData);

  const startCount = getNumber(
    actionData.startCount,
    Array.isArray(actionData.objects) ? actionData.objects.length : 0,
  );

  const takeAwayCount = getNumber(
    actionData.takeAwayCount,
    getNumber(actionData.removeCount, getNumber(actionData.crossOutCount, 0)),
  );

  const remainingCount = getNumber(
    actionData.remainingCount,
    Math.max(0, startCount - takeAwayCount),
  );

  const objects = useMemo(
    () =>
      buildFallbackObjects(actionData.objects, startCount).slice(
        0,
        Math.max(startCount, actionData.objects?.length ?? 0),
      ),
    [actionData.objects, startCount],
  );

  const remainingObjects = useMemo(
    () => buildFallbackObjects(actionData.remainingGroup, remainingCount),
    [actionData.remainingGroup, remainingCount],
  );

  const [crossedIndexes, setCrossedIndexes] = useState<Set<number>>(
    () => new Set(),
  );

  useEffect(() => {
    setCrossedIndexes(new Set());
  }, [question.questionNumber, question.generatedQuestionId]);

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer).trim();

  const hasAnswer = currentAnswer.length > 0;

  const isCorrect = hasAnswer && answerMatches(currentAnswer, correctAnswers);

  const toggleCrossedObject = (index: number) => {
    if (showAnswers) {
      return;
    }

    setCrossedIndexes((previous) => {
      const next = new Set(previous);

      if (next.has(index)) {
        next.delete(index);
      } else {
        if (next.size >= takeAwayCount) {
          return previous;
        }

        next.add(index);
      }

      const leftCount = Math.max(0, startCount - next.size);

      onAnswerChange(leftCount);

      return next;
    });
  };

  const actionOptions = useMemo(() => {
    const rawOptions = [
      ...(Array.isArray(actionData.options) ? actionData.options : []),
    ];

    if (rawOptions.length === 0 && Array.isArray(actionData.optionValues)) {
      rawOptions.push(...actionData.optionValues);
    }

    return rawOptions
      .map(normalizeOption)
      .filter((option): option is SubtractionActionOption => option !== null);
  }, [actionData.options, actionData.optionValues]);

  const selectTakeAwayOption = (value: number) => {
    if (showAnswers) {
      return;
    }

    onAnswerChange(value);
  };

  const missingAtStart = actionData.missingPosition === "start";

  const missingNumberEquation =
    actionData.equation ??
    (missingAtStart
      ? `? − ${takeAwayCount} = ${remainingCount}`
      : `${startCount} − ? = ${remainingCount}`);

  const renderObjectInstruction = () => {
    const isDrawMode = questionType === "DRAW_AND_CROSS_OUT";

    return (
      <>
        <div className="subtraction-action-question__instruction">
          {question.questionText}
        </div>

        <div className="subtraction-action-question__action-card">
          <ActionObjects
            objects={objects}
            crossedIndexes={crossedIndexes}
            allowInteraction={!showAnswers}
            mode={isDrawMode ? "draw" : "cross"}
            onToggle={toggleCrossedObject}
          />

          <div className="subtraction-action-question__progress">
            <span>
              Crossed out: <strong>{crossedIndexes.size}</strong>
            </span>

            <span>
              Left:{" "}
              <strong>{Math.max(0, startCount - crossedIndexes.size)}</strong>
            </span>
          </div>
        </div>

        <QuestionStatus
          showAnswers={showAnswers}
          hasAnswer={hasAnswer}
          isCorrect={isCorrect}
        />

        {showAnswers && <AnswerReveal answer={String(remainingCount)} />}
      </>
    );
  };

  const renderChooseTakeAway = () => {
    return (
      <>
        <div className="subtraction-action-question__instruction">
          {question.questionText}
        </div>

        <div className="subtraction-action-question__takeaway-layout">
          <div className="subtraction-action-question__takeaway-equation">
            <span>{startCount}</span>

            <span>−</span>

            <span className="subtraction-action-question__takeaway-blank">
              ?
            </span>

            <span>=</span>

            <span>{remainingCount}</span>
          </div>
        </div>

        <div className="subtraction-action-question__option-title">
          Choose how many objects to take away.
        </div>

        <div className="subtraction-action-question__options">
          {actionOptions.map((option, index) => {
            const selected = String(userAnswer) === String(option.value);

            const correct = answerMatches(option.value, correctAnswers);

            const missed = showAnswers && !selected && correct;

            const optionClass = [
              "subtraction-action-question__option",

              selected ? "subtraction-action-question__option--selected" : "",

              showAnswers && selected && correct
                ? "subtraction-action-question__option--correct"
                : "",

              showAnswers && selected && !correct
                ? "subtraction-action-question__option--wrong"
                : "",

              missed ? "subtraction-action-question__option--missed" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const optionObjects =
              option.objects ?? buildFallbackObjects(undefined, option.value);

            return (
              <motion.button
                key={`takeaway-option-${option.value}-${index}`}
                type="button"
                disabled={showAnswers}
                className={optionClass}
                whileHover={{
                  scale: showAnswers ? 1 : 1.03,
                }}
                whileTap={{
                  scale: showAnswers ? 1 : 0.98,
                }}
                onClick={() => selectTakeAwayOption(option.value)}
              >
                <span className="subtraction-action-question__option-value">
                  {option.value}
                </span>

                <span className="subtraction-action-question__option-objects">
                  {optionObjects.map((icon, objectIndex) => (
                    <span
                      key={`takeaway-option-object-${index}-${objectIndex}`}
                      className="subtraction-action-question__option-object"
                    >
                      {icon}
                    </span>
                  ))}
                </span>

                {showAnswers && selected && correct && <Check size={18} />}

                {showAnswers && selected && !correct && <X size={18} />}

                {showAnswers && missed && <Check size={18} />}
              </motion.button>
            );
          })}
        </div>

        <QuestionStatus
          showAnswers={showAnswers}
          hasAnswer={hasAnswer}
          isCorrect={isCorrect}
        />

        {showAnswers && <AnswerReveal answer={String(takeAwayCount)} />}
      </>
    );
  };

  const renderMissingNumber = () => {
    return (
      <>
        <div className="subtraction-action-question__instruction">
          {question.questionText}
        </div>

        <div className="subtraction-action-question__missing-card">
          <div className="subtraction-action-question__missing-equation">
            {missingAtStart ? (
              <>
                <span className="subtraction-action-question__missing-placeholder">
                  ?
                </span>

                <span>−</span>

                <span>{takeAwayCount}</span>

                <span>=</span>

                <span>{remainingCount}</span>
              </>
            ) : (
              <>
                <span>{startCount}</span>

                <span>−</span>

                <span className="subtraction-action-question__missing-placeholder">
                  ?
                </span>

                <span>=</span>

                <span>{remainingCount}</span>
              </>
            )}
          </div>

          <div className="subtraction-action-question__missing-objects">
            <div className="subtraction-action-question__missing-object-group">
              {/* <span className="subtraction-action-question__missing-group-label">
                  Objects
                </span> */}

              {/* <span className="subtraction-action-question__missing-group-value">
                  {startCount}
                </span> */}

              <div className="subtraction-action-question__missing-object-list">
                {objects.map((icon, index) => (
                  <span
                    key={`missing-start-${index}`}
                    className="subtraction-action-question__missing-object"
                  >
                    {icon}
                  </span>
                ))}
              </div>
            </div>

            <div className="subtraction-action-question__missing-arrow">→</div>

            <div className="subtraction-action-question__missing-object-group">
              <div className="subtraction-action-question__missing-object-list">
                {remainingObjects.map((icon, index) => (
                  <span
                    key={`missing-left-${index}`}
                    className="subtraction-action-question__missing-object"
                  >
                    {icon}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={currentAnswer}
            disabled={showAnswers}
            aria-label="Missing subtraction number"
            className={
              showAnswers
                ? isCorrect
                  ? "subtraction-action-question__number-input subtraction-action-question__number-input--correct"
                  : "subtraction-action-question__number-input subtraction-action-question__number-input--wrong"
                : "subtraction-action-question__number-input"
            }
            onChange={(event) => onAnswerChange(event.target.value)}
          />
        </div>

        <QuestionStatus
          showAnswers={showAnswers}
          hasAnswer={hasAnswer}
          isCorrect={isCorrect}
        />

        {showAnswers && (
          <AnswerReveal
            answer={String(missingAtStart ? startCount : takeAwayCount)}
          />
        )}
      </>
    );
  };

  return (
    <section
      className="subtraction-action-question"
      aria-label="Subtraction action question"
    >
      {questionType === "CROSS_OUT_OBJECTS" && renderObjectInstruction()}

      {questionType === "DRAW_AND_CROSS_OUT" && renderObjectInstruction()}

      {questionType === "CHOOSE_TAKE_AWAY" && renderChooseTakeAway()}

      {questionType === "MISSING_NUMBER_SUBTRACTION" && renderMissingNumber()}

      {![
        "CROSS_OUT_OBJECTS",
        "DRAW_AND_CROSS_OUT",
        "CHOOSE_TAKE_AWAY",
        "MISSING_NUMBER_SUBTRACTION",
      ].includes(questionType) && (
        <div className="subtraction-action-question__unsupported">
          Unsupported subtraction action question type:{" "}
          {questionType || "Unknown"}
        </div>
      )}

      {showAnswers && (
        <div className="subtraction-action-question__equation-source">
          {missingNumberEquation}
        </div>
      )}
    </section>
  );
}
