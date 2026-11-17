
"use client";

import type { ReactNode } from "react";

import {
  ArrowRight,
  Check,
  Flag,
  Flame,
  GitFork,
  Orbit,
  RotateCcw,
  Target,
  X,
  Zap,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";

import {
  AnswerBox,
  answerMatches,
} from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

// ======================================================
// BACKEND PAYLOAD TYPES
// ======================================================

type CountdownTrackData = QuestionData & {
  brokenFuseCountdownTrack?: {
    startNumber: number;
    trackNumbers: Array<number | null>;
    breakMarker: number;
    trackStyle: string;
    equation: string;
  };

  dualExitCountdownSplit?: {
    startNumber: number;
    branchA: number;
    branchB: number;
    trackStyle: string;
    equation: string;
  };

  targetLandmarkBrakingTrack?: {
    startNumber: number;
    targetLandmark: number;
    footprints: number[];
    trackStyle: string;
    equation: string;
  };

  loopDeLoopPortalWarp?: {
    trackNumbers: number[];
    portalEntry: number;
    backwardSlots: number;
    landingPad: number;
    portalStyle: string;
    equation: string;
  };
};

type TrackVariant =
  | "broken-fuse"
  | "landmark-braking"
  | "loop-portal";

type TrackNode = {
  value: number | null;
  index: number;
  isStart: boolean;
  isDestination: boolean;
  isMissing: boolean;
  displayValue: string;
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function CountdownLoopTrackQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const countdownData = data as CountdownTrackData;

  const code = (
    question.questionTypeCode?.trim() ||
    countdownData.questionType?.trim() ||
    ""
  ).toUpperCase();

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const hasAnswer = currentAnswer.trim().length > 0;

  const isCorrect =
    hasAnswer &&
    answerMatches(currentAnswer, correctAnswers);

  const correctAnswer = correctAnswers[0] ?? "";

  const answerId =
    `countdown-loop-track-answer-${question.generatedQuestionId}`;

  const isDualExit =
    code === "DUAL_EXIT_COUNTDOWN_SPLIT";

  const headerConfig: Record<
    string,
    {
      title: string;
      subtitle: string;
      badge: string;
    }
  > = {
    BROKEN_FUSE_COUNTDOWN_TRACK: {
      title: "Broken Fuse Track",
      subtitle:
        "",
      badge: "FUSE CHALLENGE",
    },

    DUAL_EXIT_COUNTDOWN_SPLIT: {
      title: "Choose the Correct Exit",
      subtitle:
        "",
      badge: "EXIT CHALLENGE",
    },

    TARGET_LANDMARK_BRAKING_TRACK: {
      title: "Target Landmark Track",
      subtitle:
        "",
      badge: "RACING TRACK",
    },

    LOOP_DE_LOOP_PORTAL_WARP: {
      title: "Loop-the-Loop Portal",
      subtitle:
        "",
      badge: "PORTAL CHALLENGE",
    },
  };

  const config = headerConfig[code];

  // ======================================================
  // COMMON TRACK RENDERER
  // ======================================================

  const renderTrack = (
    values: Array<number | null>,
    variant: TrackVariant,
    options?: {
      breakPosition?: number;
      finishLabel?: string;
    },
  ) => {
    if (values.length === 0) {
      return (
        <div className="countdown-loop-track-question__empty-state">
          Track data is unavailable for this question.
        </div>
      );
    }

    const lastIndex = values.length - 1;

    const nodes: TrackNode[] = values.map((value, index) => {
      const isStart = index === 0;
      const isDestination = index === lastIndex;

      const isBrokenFuse =
        variant === "broken-fuse" &&
        (
          index === options?.breakPosition ||
          value === null
        );

      // Never expose the destination value before answer reveal.
      const isHiddenDestination =
        isDestination &&
        variant !== "broken-fuse";

      const isMissing =
        isBrokenFuse || isHiddenDestination;

      let displayValue: string;

      if (isMissing) {
        displayValue =
          showAnswers && correctAnswer !== ""
            ? correctAnswer
            : "?";
      } else {
        displayValue =
          value === null ? "?" : String(value);
      }

      return {
        value,
        index,
        isStart,
        isDestination,
        isMissing,
        displayValue,
      };
    });

    return (
      <div
        className={[
          "countdown-loop-track-question__track-board",
          `countdown-loop-track-question__track-board--${variant}`,
        ].join(" ")}
        role="list"
        aria-label="Countdown track"
      >
        {nodes.map((node) => {
          const nodeClassName = [
            "countdown-loop-track-question__track-stop",

            node.isStart
              ? "countdown-loop-track-question__track-stop--start"
              : "",

            node.isDestination
              ? "countdown-loop-track-question__track-stop--destination"
              : "",

            node.isMissing
              ? "countdown-loop-track-question__track-stop--missing"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          const stopLabel = node.isStart
            ? "START"
            : node.isMissing
              ? variant === "broken-fuse"
                ? "BROKEN FUSE"
                : options?.finishLabel ?? "DESTINATION"
              : `STEP ${node.index}`;

          return (
            <div
              key={`${variant}-${node.index}`}
              className="countdown-loop-track-question__track-item"
              role="listitem"
            >
              <div className={nodeClassName}>
                <span className="countdown-loop-track-question__stop-label">
                  {stopLabel}
                </span>

                <strong className="countdown-loop-track-question__stop-value">
                  {node.displayValue}
                </strong>

                <span className="countdown-loop-track-question__stop-icon">
                  {node.isMissing ? (
                    showAnswers ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      <Flame size={15} aria-hidden="true" />
                    )
                  ) : node.isStart ? (
                    <Zap size={15} aria-hidden="true" />
                  ) : node.isDestination ? (
                    <Flag size={15} aria-hidden="true" />
                  ) : (
                    <Target size={13} aria-hidden="true" />
                  )}
                </span>
              </div>

              {node.index < lastIndex && (
                <span
                  className="countdown-loop-track-question__track-connector"
                  aria-hidden="true"
                >
                  <ArrowRight size={20} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBrokenFuse = (): ReactNode => {
    const fuse = countdownData.brokenFuseCountdownTrack;

    if (!fuse) {
      return (
        <div className="countdown-loop-track-question__empty-state">
          Broken fuse track data is unavailable.
        </div>
      );
    }

    return (
      <>
       

        {renderTrack(
          fuse.trackNumbers,
          "broken-fuse",
          {
            breakPosition: fuse.breakMarker,
            finishLabel: "FINISH",
          },
        )}

      </>
    );
  };

  // ======================================================
  // DUAL EXIT COUNTDOWN SPLIT
  // ======================================================

  const renderDualExit = (): ReactNode => {
    const split = countdownData.dualExitCountdownSplit;

    if (!split) {
      return (
        <div className="countdown-loop-track-question__empty-state">
          Dual exit track data is unavailable.
        </div>
      );
    }

    const branches = [
      {
        label: "EXIT A",
        value: split.branchA,
      },
      {
        label: "EXIT B",
        value: split.branchB,
      },
    ];

    return (
      <>
        <div className="countdown-loop-track-question__info-row">
          <div className="countdown-loop-track-question__info-card">
            <span>Vehicle starts at</span>
            <strong>{split.startNumber}</strong>
          </div>

          <div className="countdown-loop-track-question__info-card countdown-loop-track-question__info-card--accent">
            <span>Choose one exit</span>
            <strong> A or B </strong>
          </div>
        </div>

        <div className="countdown-loop-track-question__split-layout">
          <div className="countdown-loop-track-question__split-origin">
            <span>START</span>
            <strong>{split.startNumber}</strong>
          </div>

          <div className="countdown-loop-track-question__split-branches">
            {branches.map((branch) => {
              const selected =
                currentAnswer === String(branch.value);

              const branchIsCorrect =
                answerMatches(branch.value, correctAnswers);

              const branchClassName = [
                "countdown-loop-track-question__exit-option",

                selected
                  ? "countdown-loop-track-question__exit-option--selected"
                  : "",

                showAnswers && branchIsCorrect
                  ? "countdown-loop-track-question__exit-option--correct"
                  : "",

                showAnswers && selected && !branchIsCorrect
                  ? "countdown-loop-track-question__exit-option--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={branch.label}
                  type="button"
                  className={branchClassName}
                  disabled={showAnswers}
                  aria-pressed={selected}
                  onClick={() => {
                    if (!showAnswers) {
                      onAnswerChange(String(branch.value));
                    }
                  }}
                >
                  <span className="countdown-loop-track-question__exit-label">
                    <GitFork size={18} aria-hidden="true" />

                    {branch.label}
                  </span>

                  <strong className="countdown-loop-track-question__exit-number">
                    {branch.value}
                  </strong>

                  <span className="countdown-loop-track-question__exit-status">
                    {showAnswers && branchIsCorrect ? (
                      <Check
                        size={19}
                        aria-label="Correct exit"
                      />
                    ) : showAnswers && selected ? (
                      <X
                        size={19}
                        aria-label="Incorrect exit"
                      />
                    ) : selected ? (
                      "Selected"
                    ) : (
                      "Choose exit"
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ======================================================
  // TARGET LANDMARK BRAKING TRACK
  // ======================================================

  const renderLandmarkTrack = (): ReactNode => {
    const landmark =
      countdownData.targetLandmarkBrakingTrack;

    if (!landmark) {
      return (
        <div className="countdown-loop-track-question__empty-state">
          Landmark track data is unavailable.
        </div>
      );
    }

    return (
      <>
      

        {renderTrack(
          landmark.footprints,
          "landmark-braking",
          {
            finishLabel: "LANDMARK",
          },
        )}

      </>
    );
  };

  const renderPortalWarp = (): ReactNode => {
    const portal = countdownData.loopDeLoopPortalWarp;

    if (!portal) {
      return (
        <div className="countdown-loop-track-question__empty-state">
          Portal track data is unavailable.
        </div>
      );
    }

    return (
      <>
       
        {/* </div> */}

        {renderTrack(
          portal.trackNumbers,
          "loop-portal",
          {
            finishLabel: "LANDING PAD",
          },
        )}
      </>
    );
  };


  let questionVisual: ReactNode;

  switch (code) {
    case "BROKEN_FUSE_COUNTDOWN_TRACK":
      questionVisual = renderBrokenFuse();
      break;

    case "DUAL_EXIT_COUNTDOWN_SPLIT":
      questionVisual = renderDualExit();
      break;

    case "TARGET_LANDMARK_BRAKING_TRACK":
      questionVisual = renderLandmarkTrack();
      break;

    case "LOOP_DE_LOOP_PORTAL_WARP":
      questionVisual = renderPortalWarp();
      break;

    default:
      questionVisual = (
        <div className="countdown-loop-track-question__empty-state">
          Unsupported countdown question type: {code || "Unknown"}
        </div>
      );
      break;
  }

  const equation =
    countdownData.brokenFuseCountdownTrack?.equation ??
    countdownData.dualExitCountdownSplit?.equation ??
    countdownData.targetLandmarkBrakingTrack?.equation ??
    countdownData.loopDeLoopPortalWarp?.equation;

  let inputClassName =
    "countdown-loop-track-question__answer-input";

  if (showAnswers && hasAnswer) {
    inputClassName += isCorrect
      ? " countdown-loop-track-question__answer-input--correct"
      : " countdown-loop-track-question__answer-input--wrong";
  }

  // ======================================================
  // COMPLETE QUESTION
  // ======================================================

  return (
    <section className="generated-question countdown-loop-track-question">

      <h3 className="generated-question__text">
        {question.questionText}
      </h3>

      <div className="countdown-loop-track-question__panel">

        {config && (
          <div className="countdown-loop-track-question__header">
            <div className="countdown-loop-track-question__header-main">
              <div className="countdown-loop-track-question__header-icon">
                {code === "BROKEN_FUSE_COUNTDOWN_TRACK" && (
                  <Flame size={25} aria-hidden="true" />
                )}

                {code === "DUAL_EXIT_COUNTDOWN_SPLIT" && (
                  <GitFork size={25} aria-hidden="true" />
                )}

                {code === "TARGET_LANDMARK_BRAKING_TRACK" && (
                  <Flag size={25} aria-hidden="true" />
                )}

                {code === "LOOP_DE_LOOP_PORTAL_WARP" && (
                  <Orbit size={25} aria-hidden="true" />
                )}
              </div>

              <div>
                <span className="countdown-loop-track-question__eyebrow">
                  COUNTDOWN ADVENTURE
                </span>

                <h4 className="countdown-loop-track-question__title">
                  {config.title}
                </h4>

                <p className="countdown-loop-track-question__subtitle">
                  {config.subtitle}
                </p>
              </div>
            </div>

            <span className="countdown-loop-track-question__badge">
              {config.badge}
            </span>
          </div>
        )}

        <div className="countdown-loop-track-question__visual">
          {questionVisual}
        </div>

        {equation && (
          <div className="countdown-loop-track-question__equation">
            <span>Countdown equation</span>
            <strong>{equation}</strong>
          </div>
        )}
      </div>

      {/* The dual-exit type uses selectable answer cards. */}

      {!isDualExit && (
        <div className="countdown-loop-track-question__answer-section">
          <label
            htmlFor={answerId}
            className="countdown-loop-track-question__answer-label"
          >
            Your answer
          </label>

          <div className="countdown-loop-track-question__answer-row">
            <input
              id={answerId}
              type="number"
              inputMode="numeric"
              value={currentAnswer}
              disabled={showAnswers}
              placeholder="?"
              aria-label="Enter the landing number"
              className={inputClassName}
              onChange={(event) =>
                onAnswerChange(event.target.value)
              }
            />

            {showAnswers && hasAnswer && isCorrect && (
              <Check
                size={24}
                aria-label="Correct answer"
                className="countdown-loop-track-question__feedback countdown-loop-track-question__feedback--correct"
              />
            )}

            {showAnswers && hasAnswer && !isCorrect && (
              <X
                size={24}
                aria-label="Incorrect answer"
                className="countdown-loop-track-question__feedback countdown-loop-track-question__feedback--wrong"
              />
            )}
          </div>
        </div>
      )}

      {showAnswers && correctAnswer !== "" && (
        <AnswerBox answer={correctAnswer} />
      )}

      {!showAnswers && (
        <div className="countdown-loop-track-question__footer-hint">
          <RotateCcw size={16} aria-hidden="true" />

          <span>
            Count backward carefully before submitting your answer.
          </span>
        </div>
      )}

    </section>
  );
}