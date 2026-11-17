
"use client";

import type { ReactNode } from "react";

import {
  ArrowRight,
  Bus,
  Check,
  Coins,
  Heart,
  Pencil,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";

import { answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

// ======================================================
// BACKEND DATA
// ======================================================

type TwoStepStoryData = Omit<QuestionData, "steps"> & {
  renderKey?: string;
  questionType?: string;
  startCount?: number;
  firstTakeAway?: number;
  remainingAfterFirst?: number;
  secondTakeAway?: number;
  remainingCount?: number;
  story?: string;
  equation?: string;
  steps?: Array<{
    step: number;
    equation: string;
    answer: number;
  }>;
  selectionMode?: string;
  answerType?: string;
};

type StoryTheme = {
  title: string;
  objectLabel: string;
  themeClass: string;
  icon: ReactNode;
  decorations: ReactNode[];
  objectIcon: ReactNode;
};

const storyThemes: Record<string, StoryTheme> = {
  STORY_GIVE_AWAY_TWICE: {
    title: "Sticker Collection",
    objectLabel: "stickers",
    themeClass: "two-step-subtraction-story-question__theme--stickers",
    icon: <Heart size={36} fill="currentColor" />,
    decorations: [
      <Star size={21} fill="currentColor" />,
      <Sparkles size={20} />,
      <Heart size={19} fill="currentColor" />,
      <Star size={17} fill="currentColor" />,
    ],
    objectIcon: <Heart size={15} fill="currentColor" />,
  },

  STORY_BUS_PASSENGERS: {
    title: "Bus Passengers",
    objectLabel: "passengers",
    themeClass: "two-step-subtraction-story-question__theme--bus",
    icon: <Bus size={38} />,
    decorations: [
      <UserRound size={17} />,
      <UserRound size={17} />,
      <UserRound size={17} />,
      <Star size={16} fill="currentColor" />,
    ],
    objectIcon: <UserRound size={15} />,
  },

  STORY_SPEND_TWICE: {
    title: "Coin Collection",
    objectLabel: "coins",
    themeClass: "two-step-subtraction-story-question__theme--coins",
    icon: <Coins size={38} />,
    decorations: [
      <Coins size={19} />,
      <Star size={17} fill="currentColor" />,
      <Coins size={17} />,
      <Sparkles size={18} />,
    ],
    objectIcon: <Coins size={15} />,
  },

  STORY_USE_SUPPLIES: {
    title: "Art Supplies",
    objectLabel: "crayons",
    themeClass: "two-step-subtraction-story-question__theme--supplies",
    icon: <Pencil size={38} />,
    decorations: [
      <Pencil size={20} />,
      <Star size={17} fill="currentColor" />,
      <Sparkles size={18} />,
      <Pencil size={17} />,
    ],
    objectIcon: <Pencil size={15} />,
  },
};

// ======================================================
// COMPONENT
// ======================================================

export default function TwoStepSubtractionStoryQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const storyData = data as TwoStepStoryData;

  const code = (
    question.questionTypeCode?.trim() ||
    storyData.questionType?.trim() ||
    ""
  ).toUpperCase();

  const startCount = storyData.startCount ?? 0;
  const firstTakeAway = storyData.firstTakeAway ?? 0;
  const afterFirst = storyData.remainingAfterFirst ?? 0;
  const secondTakeAway = storyData.secondTakeAway ?? 0;

  const expectedAnswers =
    correctAnswers.length > 0
      ? correctAnswers
      : [String(storyData.remainingCount ?? "")];

  const correctAnswer = expectedAnswers[0] ?? "";

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer).trim();

  const hasAnswer = currentAnswer.length > 0;

  const isCorrect =
    hasAnswer &&
    answerMatches(currentAnswer, expectedAnswers);

  const answerId =
    `two-step-subtraction-story-${question.generatedQuestionId}`;

  const theme: StoryTheme = storyThemes[code] ?? {
    title: "Two-Step Story",
    objectLabel: "objects",
    themeClass: "two-step-subtraction-story-question__theme--default",
    icon: <Pencil size={36} />,
    decorations: [
      <Star size={18} />,
      <Sparkles size={18} />,
      <Heart size={18} />,
    ],
    objectIcon: <Star size={15} />,
  };

  const itemCount = Math.max(
    0,
    Math.floor(startCount),
  );

  const displayedItemCount = Math.min(itemCount, 8);

  let inputClassName =
    "two-step-subtraction-story-question__answer-input";

  if (showAnswers && hasAnswer) {
    inputClassName += isCorrect
      ? " two-step-subtraction-story-question__answer-input--correct"
      : " two-step-subtraction-story-question__answer-input--wrong";
  }

  return (
    <section
      className={[
        "two-step-subtraction-story-question",
        theme.themeClass,
      ].join(" ")}
    >
      {/* Illustration on the left, backend question on the right */}

      <div className="two-step-subtraction-story-question__prompt-card">

        <div
          className="two-step-subtraction-story-question__illustration"
          role="img"
          aria-label={theme.title}
        >
          <div className="two-step-subtraction-story-question__illustration-decorations">
            {theme.decorations.map((decoration, index) => (
              <span
                key={index}
                className={`two-step-subtraction-story-question__decoration two-step-subtraction-story-question__decoration--${index + 1}`}
              >
                {decoration}
              </span>
            ))}
          </div>

          <div className="two-step-subtraction-story-question__illustration-main">
            {theme.icon}
          </div>
        </div>

        <div className="two-step-subtraction-story-question__prompt-content">
          <span className="two-step-subtraction-story-question__type-label">
            {theme.title}
          </span>

          {/* Show backend-generated question text once only. */}

          <p className="two-step-subtraction-story-question__question-text">
            {question.questionText}
          </p>
        </div>

      </div>

      {/* Compact visual representation of the two steps */}

      <div className="two-step-subtraction-story-question__activity">

        <div className="two-step-subtraction-story-question__activity-header">
          <span className="two-step-subtraction-story-question__activity-label">
            VISUAL STEPS
          </span>

          <span className="two-step-subtraction-story-question__steps-badge">
            2 steps
          </span>
        </div>

        <div className="two-step-subtraction-story-question__flow">

          {/* Initial amount */}

          <div className="two-step-subtraction-story-question__flow-node two-step-subtraction-story-question__flow-node--start">
            <span className="two-step-subtraction-story-question__node-label">
              START
            </span>

            <strong className="two-step-subtraction-story-question__node-value">
              {startCount}
            </strong>

            <div
              className="two-step-subtraction-story-question__start-icons"
              aria-hidden="true"
            >
              {Array.from(
                { length: displayedItemCount },
                (_, index) => (
                  <span key={index}>
                    {theme.objectIcon}
                  </span>
                ),
              )}

              {itemCount > displayedItemCount && (
                <span className="two-step-subtraction-story-question__extra-count">
                  +{itemCount - displayedItemCount}
                </span>
              )}
            </div>
          </div>

          <ArrowRight
            className="two-step-subtraction-story-question__flow-arrow"
            size={19}
            aria-hidden="true"
          />

          {/* First subtraction */}

          <div className="two-step-subtraction-story-question__flow-node two-step-subtraction-story-question__flow-node--operation">
            <span className="two-step-subtraction-story-question__node-label">
              STEP 1
            </span>

            <strong className="two-step-subtraction-story-question__node-value">
              − {firstTakeAway}
            </strong>

            <span className="two-step-subtraction-story-question__node-caption">
              Take away
            </span>
          </div>

          <ArrowRight
            className="two-step-subtraction-story-question__flow-arrow"
            size={19}
            aria-hidden="true"
          />

          {/* Intermediate result */}

          <div className="two-step-subtraction-story-question__flow-node two-step-subtraction-story-question__flow-node--result">
            <span className="two-step-subtraction-story-question__node-label">
              AFTER 1
            </span>

            <strong className="two-step-subtraction-story-question__node-value">
              {showAnswers ? afterFirst : "?"}
            </strong>

            <span className="two-step-subtraction-story-question__node-caption">
              Remaining
            </span>
          </div>

          <ArrowRight
            className="two-step-subtraction-story-question__flow-arrow"
            size={19}
            aria-hidden="true"
          />

          {/* Second subtraction */}

          <div className="two-step-subtraction-story-question__flow-node two-step-subtraction-story-question__flow-node--operation-second">
            <span className="two-step-subtraction-story-question__node-label">
              STEP 2
            </span>

            <strong className="two-step-subtraction-story-question__node-value">
              − {secondTakeAway}
            </strong>

            <span className="two-step-subtraction-story-question__node-caption">
              Take away
            </span>
          </div>

          <ArrowRight
            className="two-step-subtraction-story-question__flow-arrow"
            size={19}
            aria-hidden="true"
          />

          {/* Final result */}

          <div className="two-step-subtraction-story-question__flow-node two-step-subtraction-story-question__flow-node--final">
            <span className="two-step-subtraction-story-question__node-label">
              LEFT
            </span>

            <strong className="two-step-subtraction-story-question__node-value">
              {showAnswers ? correctAnswer : "?"}
            </strong>

            <span className="two-step-subtraction-story-question__node-caption">
              Final total
            </span>
          </div>

        </div>
      </div>

      {/* One answer control */}

      <div className="two-step-subtraction-story-question__answer-row">

        <label
          htmlFor={answerId}
          className="two-step-subtraction-story-question__answer-label"
        >
          Your answer
        </label>

        <input
          id={answerId}
          type="number"
          inputMode="numeric"
          value={currentAnswer}
          disabled={showAnswers}
          placeholder="?"
          aria-label="Enter the final remaining amount"
          className={inputClassName}
          onChange={(event) =>
            onAnswerChange(event.target.value)
          }
        />

        {showAnswers && hasAnswer && (
          <span
            className={[
              "two-step-subtraction-story-question__feedback",
              isCorrect
                ? "two-step-subtraction-story-question__feedback--correct"
                : "two-step-subtraction-story-question__feedback--wrong",
            ].join(" ")}
            role="status"
          >
            {isCorrect ? (
              <>
                <Check size={18} aria-hidden="true" />
                Correct
              </>
            ) : (
              <>
                <X size={18} aria-hidden="true" />
                Answer: {correctAnswer}
              </>
            )}
          </span>
        )}

      </div>
    </section>
  );
}