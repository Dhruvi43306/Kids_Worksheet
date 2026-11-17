
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox } from "@/renderer/questionHelpers";

type ThresholdWallSpilloverData = QuestionData & {
  startingValue?: number;

  thresholdWall?: {
    value?: number;
    label?: string;
  };

  addition?: {
    total?: number;
    distanceToWall?: number;
    spillover?: number;
  };

  remainderDeflection?: {
    value?: number;
    label?: string;
  };

  terminalSpilloverZone?: {
    value?: number;
    label?: string;
  };

  path?: Array<{
    step?: number;
    value?: number;
    zone?: string;
    collected?: boolean;
    coinValue?: number;
  }>;

  equation?: string;

  strategy?: {
    firstStep?: string;
    distanceToWall?: number;
    secondStep?: string;
    spilloverValue?: number;
  };

  animation?: {
    enabled?: boolean;
    startValue?: number;
    threshold?: number;
    finalValue?: number;
  };
};

type SpilloverAnswer = {
  distanceToWall: string;
  spilloverValue: string;
  finalValue: string;
};

function ThresholdWallSpilloverDisplay({
  questionText,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: {
  questionText: string;
  data: QuestionData;
  userAnswer: unknown;
  showAnswers: boolean;
  onAnswerChange: (value: any) => void;
}) {
  const thresholdData = data as ThresholdWallSpilloverData;

  const startingValue =
    typeof thresholdData.startingValue === "number"
      ? thresholdData.startingValue
      : 0;

  const threshold =
    typeof thresholdData.thresholdWall?.value === "number"
      ? thresholdData.thresholdWall.value
      : startingValue;

  const additionTotal =
    typeof thresholdData.addition?.total === "number"
      ? thresholdData.addition.total
      : 0;

  const distanceToWall =
    typeof thresholdData.addition?.distanceToWall === "number"
      ? thresholdData.addition.distanceToWall
      : threshold - startingValue;

  const spilloverValue =
    typeof thresholdData.addition?.spillover === "number"
      ? thresholdData.addition.spillover
      : additionTotal - distanceToWall;

  const finalValue =
    typeof thresholdData.terminalSpilloverZone?.value === "number"
      ? thresholdData.terminalSpilloverZone.value
      : threshold + spilloverValue;

  const pathValues =
    Array.isArray(thresholdData.path) &&
    thresholdData.path.length > 0
      ? thresholdData.path
      : Array.from(
          {
            length: Math.max(
              0,
              distanceToWall + spilloverValue,
            ),
          },
          (_, index) => ({
            step: index + 1,
            value: startingValue + index + 1,
            zone:
              index + 1 <= distanceToWall
                ? "path"
                : "spillover",
            collected: true,
            coinValue: 1,
          }),
        );

  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationFinished, setAnimationFinished] =
    useState(false);

  const existingAnswer: SpilloverAnswer =
    userAnswer && typeof userAnswer === "object"
      ? {
          distanceToWall:
            String(
              (userAnswer as Partial<SpilloverAnswer>)
                .distanceToWall ?? "",
            ),
          spilloverValue:
            String(
              (userAnswer as Partial<SpilloverAnswer>)
                .spilloverValue ?? "",
            ),
          finalValue:
            String(
              (userAnswer as Partial<SpilloverAnswer>)
                .finalValue ?? "",
            ),
        }
      : {
          distanceToWall: "",
          spilloverValue: "",
          finalValue: "",
        };

  const enteredDistance =
    existingAnswer.distanceToWall.trim();

  const enteredSpillover =
    existingAnswer.spilloverValue.trim();

  const enteredFinalValue =
    existingAnswer.finalValue.trim();

  let storedCorrectAnswer: {
    distanceToWall?: number;
    missingNumber?: number;
    spilloverValue?: number;
    finalValue?: number;
  } = {};

  try {
    const parsed = JSON.parse(
      String(data?.correctTotal ?? "{}"),
    );

    if (parsed && typeof parsed === "object") {
      storedCorrectAnswer = parsed;
    }
  } catch {
    storedCorrectAnswer = {};
  }

  const correctDistance =
    typeof storedCorrectAnswer.distanceToWall === "number"
      ? storedCorrectAnswer.distanceToWall
      : distanceToWall;

  const correctSpillover =
    typeof storedCorrectAnswer.spilloverValue === "number"
      ? storedCorrectAnswer.spilloverValue
      : spilloverValue;

  const correctFinalValue =
    typeof storedCorrectAnswer.finalValue === "number"
      ? storedCorrectAnswer.finalValue
      : finalValue;

  const distanceCorrect =
    enteredDistance !== "" &&
    Number(enteredDistance) === correctDistance;

  const spilloverCorrect =
    enteredSpillover !== "" &&
    Number(enteredSpillover) === correctSpillover;

  const finalCorrect =
    enteredFinalValue !== "" &&
    Number(enteredFinalValue) === correctFinalValue;

  const allCorrect =
    distanceCorrect &&
    spilloverCorrect &&
    finalCorrect;

  useEffect(() => {
    setAnimationStep(0);
    setIsAnimating(false);
    setAnimationFinished(false);
  }, [questionText]);

  useEffect(() => {
    if (showAnswers) {
      setAnimationStep(pathValues.length);
      setIsAnimating(false);
      setAnimationFinished(true);
      return;
    }

    if (!isAnimating) {
      return;
    }

    if (animationStep >= pathValues.length) {
      setIsAnimating(false);
      setAnimationFinished(true);
      return;
    }

    const nextStep = animationStep + 1;
    const isWallArrival = nextStep === distanceToWall;

    const timer = window.setTimeout(
      () => {
        setAnimationStep(nextStep);
      },
      isWallArrival ? 900 : 420,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    isAnimating,
    animationStep,
    distanceToWall,
    pathValues.length,
    showAnswers,
  ]);

  const startAnimation = () => {
    if (showAnswers || isAnimating) {
      return;
    }

    setAnimationStep(0);
    setAnimationFinished(false);
    setIsAnimating(true);
  };

  const resetAnimation = () => {
    if (showAnswers) {
      return;
    }

    setAnimationStep(0);
    setAnimationFinished(false);
    setIsAnimating(false);

    onAnswerChange({
      distanceToWall: "",
      spilloverValue: "",
      finalValue: "",
    });
  };

  const updateAnswer = (
    field:
      | "distanceToWall"
      | "spilloverValue"
      | "finalValue",
    value: string,
  ) => {
    if (showAnswers) {
      return;
    }

    onAnswerChange({
      distanceToWall: enteredDistance,
      spilloverValue: enteredSpillover,
      finalValue: enteredFinalValue,
      [field]: value,
    });
  };

  const getKidPosition = (step: number) => {
    if (distanceToWall <= 0) {
      return "10%";
    }

    if (step <= distanceToWall) {
      const progress = step / distanceToWall;

      return `${8 + progress * 58}%`;
    }

    const spilloverSteps = Math.max(spilloverValue, 1);

    const spilloverProgress =
      Math.min(step - distanceToWall, spilloverSteps) /
      spilloverSteps;

    return `${66 + spilloverProgress * 18}%`;
  };

  const kidLeft = getKidPosition(animationStep);

  const spilloverVisible =
    animationStep >= pathValues.length;

  const currentValue =
    animationStep === 0
      ? startingValue
      : animationStep >= pathValues.length
        ? finalValue
        : pathValues[animationStep - 1]?.value ??
          startingValue;

  const inputClassName = (
    correct: boolean,
    color: "blue" | "purple" | "green",
  ) => {
    const classes = [
      "threshold-wall-spillover__answer-input",
      `threshold-wall-spillover__answer-input--${color}`,
    ];

    if (showAnswers) {
      classes.push(
        correct
          ? "threshold-wall-spillover__answer-input--correct"
          : "threshold-wall-spillover__answer-input--wrong",
      );
    }

    return classes.join(" ");
  };

  return (
    <div className="threshold-wall-spillover">
      {/* Question heading */}
      <h3 className="threshold-wall-spillover__question">
        {questionText}
      </h3>

      {/* Journey scene */}
      <div className="threshold-wall-spillover__scene">
        {/* Start marker */}
        <div className="threshold-wall-spillover__start">
          <span className="threshold-wall-spillover__start-label">
            START
          </span>

          <span className="threshold-wall-spillover__start-value">
            {startingValue}
          </span>
        </div>

        {/* Threshold marker */}
        <div className="threshold-wall-spillover__threshold">
          <span className="threshold-wall-spillover__threshold-label">
            THRESHOLD WALL
          </span>

          <span className="threshold-wall-spillover__threshold-value">
            {threshold}
          </span>
        </div>

        {/* Wall */}
        <div
          className="threshold-wall-spillover__wall"
          aria-label={`Threshold wall at ${threshold}`}
        >
          <span className="threshold-wall-spillover__wall-label">
            WALL
          </span>
        </div>

        {/* Spillover zone */}
        <div className="threshold-wall-spillover__zone">
          <span className="threshold-wall-spillover__zone-title">
            TERMINAL
            <br />
            SPILLOVER ZONE
          </span>

          <span className="threshold-wall-spillover__zone-value">
            {spilloverVisible ? spilloverValue : "?"}
          </span>

          <span className="threshold-wall-spillover__zone-caption">
            +{spilloverValue} remainder
          </span>
        </div>

        {/* Journey path */}
        <div className="threshold-wall-spillover__track" />

        {/* Coins along the route */}
        {pathValues.map((item, index) => {
          const step = index + 1;
          const left = getKidPosition(step);
          const collected = animationStep >= step;
          const isSpillover = item.zone === "spillover";

          return (
            <motion.div
              key={`${item.value}-${step}`}
              className={[
                "threshold-wall-spillover__coin",
                isSpillover
                  ? "threshold-wall-spillover__coin--spillover"
                  : "threshold-wall-spillover__coin--path",
              ].join(" ")}
              initial={{ left, opacity: 1, scale: 1 }}
              animate={{
                left,
                opacity: collected ? 0.18 : 1,
                scale: collected ? 0.78 : 1,
              }}
              transition={{ duration: 0.28 }}
            >
              <span className="threshold-wall-spillover__coin-icon">
                🪙
              </span>

              <span className="threshold-wall-spillover__coin-value">
                {item.value}
              </span>
            </motion.div>
          );
        })}

        {/* Animated character */}
        <motion.button
          type="button"
          className="threshold-wall-spillover__kid"
          onClick={startAnimation}
          disabled={isAnimating || showAnswers}
          aria-label="Start the journey animation"
          animate={{
            left: kidLeft,
            scale:
              isAnimating &&
              animationStep < pathValues.length
                ? [1, 1.04, 1]
                : 1,
          }}
          transition={{
            left: {
              duration:
                animationStep === distanceToWall
                  ? 0.85
                  : 0.38,
              ease: "easeInOut",
            },
            scale: {
              repeat:
                isAnimating &&
                animationStep < pathValues.length
                  ? Infinity
                  : 0,
              duration: 0.55,
            },
          }}
        >
          🧒
        </motion.button>

        {/* Current and final value */}
        <div className="threshold-wall-spillover__status">
          {isAnimating
            ? `Current: ${currentValue}`
            : animationFinished
              ? `Final: ${finalValue}`
              : "👆 Click the kid to start"}
        </div>

        {/* Completion decoration */}
        {animationFinished && (
          <motion.div
            className="threshold-wall-spillover__celebration"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            💰✨
          </motion.div>
        )}
      </div>

      {/* Answer cards */}
      <div className="threshold-wall-spillover__answer-grid">
        <div className="threshold-wall-spillover__answer-card threshold-wall-spillover__answer-card--distance">
          <label
            className="threshold-wall-spillover__answer-label threshold-wall-spillover__answer-label--distance"
            htmlFor="threshold-wall-spillover-distance"
          >
            1. DISTANCE TO WALL
          </label>

          <input
            id="threshold-wall-spillover-distance"
            className={inputClassName(
              distanceCorrect,
              "blue",
            )}
            type="number"
            inputMode="numeric"
            value={enteredDistance}
            disabled={showAnswers}
            onChange={(e) =>
              updateAnswer("distanceToWall", e.target.value)
            }
            placeholder="?"
          />
        </div>

        <div className="threshold-wall-spillover__answer-card threshold-wall-spillover__answer-card--spillover">
          <label
            className="threshold-wall-spillover__answer-label threshold-wall-spillover__answer-label--spillover"
            htmlFor="threshold-wall-spillover-spillover"
          >
            2. SPILLOVER NUMBER
          </label>

          <input
            id="threshold-wall-spillover-spillover"
            className={inputClassName(
              spilloverCorrect,
              "purple",
            )}
            type="number"
            inputMode="numeric"
            value={enteredSpillover}
            disabled={showAnswers}
            onChange={(e) =>
              updateAnswer("spilloverValue", e.target.value)
            }
            placeholder="?"
          />
        </div>

        <div className="threshold-wall-spillover__answer-card threshold-wall-spillover__answer-card--final">
          <label
            className="threshold-wall-spillover__answer-label threshold-wall-spillover__answer-label--final"
            htmlFor="threshold-wall-spillover-final"
          >
            3. FINAL VALUE
          </label>

          <input
            id="threshold-wall-spillover-final"
            className={inputClassName(
              finalCorrect,
              "green",
            )}
            type="number"
            inputMode="numeric"
            value={enteredFinalValue}
            disabled={showAnswers}
            onChange={(e) =>
              updateAnswer("finalValue", e.target.value)
            }
            placeholder="?"
          />
        </div>
      </div>

      {/* Animation controls */}
      {!showAnswers && (
        <div className="threshold-wall-spillover__controls">
          {!isAnimating && !animationFinished && (
            <button
              type="button"
              className="threshold-wall-spillover__button threshold-wall-spillover__button--start"
              onClick={startAnimation}
            >
              🧒 Start Journey
            </button>
          )}

          {animationFinished && (
            <button
              type="button"
              className="threshold-wall-spillover__button threshold-wall-spillover__button--replay"
              onClick={resetAnimation}
            >
              ↻ Replay Journey
            </button>
          )}
        </div>
      )}

      {/* Final feedback */}
      {showAnswers && (
        <motion.div
          className={[
            "threshold-wall-spillover__feedback",
            allCorrect
              ? "threshold-wall-spillover__feedback--correct"
              : "threshold-wall-spillover__feedback--wrong",
          ].join(" ")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {allCorrect
            ? "✅ Great job! The kid reached the wall, collected the remainder, and solved the strategy."
            : `Correct answers: Distance = ${correctDistance}, Spillover = ${correctSpillover}, Final Value = ${correctFinalValue}`}
        </motion.div>
      )}

      {showAnswers && (
        <div className="threshold-wall-spillover__final-answer">
          <AnswerBox
            answer={`${startingValue} + ${additionTotal} = (${startingValue} + ${correctDistance}) + ${correctSpillover} = ${threshold} + ${correctSpillover} = ${correctFinalValue}`}
          />
        </div>
      )}
    </div>
  );
}

export default function ThresholdWallSpilloverQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  return (
    <ThresholdWallSpilloverDisplay
      questionText={question.questionText}
      data={data}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
