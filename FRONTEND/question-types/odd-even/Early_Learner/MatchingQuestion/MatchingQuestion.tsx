import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, AlertCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData, GeneratedQuestion, NumberLineOption, NumberLineJump } from "@/app/worksheet/type";
import { AnswerBox, VisualDisplay, answerMatches } from "@/renderer/questionHelpers";


function MatchingLineCanvas({
  pairs,
  targets,
  connections,
  showAnswers,
  onConnect,
}: {
  pairs: Array<{
    number: number;
    answer: string;
  }>;

  targets: string[];

  connections: Record<number, string>;

  showAnswers: boolean;

  onConnect: (
    num: number,
    target: string,
  ) => void;
}) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const leftRefs =
    useRef<Record<number, HTMLDivElement | null>>(
      {},
    );

  const rightRefs =
    useRef<Record<string, HTMLDivElement | null>>(
      {},
    );

  const [activeNum, setActiveNum] =
    useState<number | null>(null);

  const [mousePos, setMousePos] =
    useState<{
      x: number;
      y: number;
    } | null>(null);

  const [lines, setLines] =
    useState<
      Array<{
        num: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        isCorrect: boolean;
      }>
    >([]);

  const updateLines = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const containerRect =
      containerRef.current.getBoundingClientRect();

    const newLines: Array<{
      num: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isCorrect: boolean;
    }> = [];

    pairs.forEach((pair) => {
      const selectedTarget =
        connections[pair.number];

      if (!selectedTarget) {
        return;
      }

      const leftElem =
        leftRefs.current[pair.number];

      const rightElem =
        rightRefs.current[selectedTarget];

      if (!leftElem || !rightElem) {
        return;
      }

      const lRect =
        leftElem.getBoundingClientRect();

      const rRect =
        rightElem.getBoundingClientRect();

      newLines.push({
        num: pair.number,

        x1:
          lRect.right -
          containerRect.left,

        y1:
          lRect.top +
          lRect.height / 2 -
          containerRect.top,

        x2:
          rRect.left -
          containerRect.left,

        y2:
          rRect.top +
          rRect.height / 2 -
          containerRect.top,

        isCorrect:
          pair.answer
            .trim()
            .toLowerCase() ===
          selectedTarget
            .trim()
            .toLowerCase(),
      });
    });

    setLines(newLines);
  }, [pairs, connections]);

  useEffect(() => {
    updateLines();

    window.addEventListener(
      "resize",
      updateLines,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateLines,
      );
    };
  }, [updateLines]);

  const handlePointerDown = (
    num: number,
    event: React.PointerEvent,
  ) => {
    if (showAnswers) {
      return;
    }

    setActiveNum(num);

    if (containerRef.current) {
      const rect =
        containerRef.current.getBoundingClientRect();

      setMousePos({
        x:
          event.clientX -
          rect.left,

        y:
          event.clientY -
          rect.top,
      });
    }
  };

  const handlePointerMove = (
    event: React.PointerEvent,
  ) => {
    if (
      activeNum === null ||
      !containerRef.current
    ) {
      return;
    }

    const rect =
      containerRef.current.getBoundingClientRect();

    setMousePos({
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    });
  };

  const handlePointerUp = (
    target: string,
  ) => {
    if (activeNum !== null) {
      onConnect(
        activeNum,
        target,
      );

      setActiveNum(null);
      setMousePos(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={() => {
        setActiveNum(null);
        setMousePos(null);
      }}
      className="ws-matching-questionCanvas"
    >
      <svg className="ws-matching-questionCanvasSvg">
        {lines.map(
          (line, index) => {
            const lineClass = showAnswers
              ? line.isCorrect
                ? "ws-matching-questionLine ws-matching-questionLine--correct"
                : "ws-matching-questionLine ws-matching-questionLine--incorrect ws-matching-questionLine--incorrect-dash"
              : "ws-matching-questionLine ws-matching-questionLine--active";

            return (
              <line
                key={`line-${line.num}-${index}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className={lineClass}
              />
            );
          },
        )}

        {activeNum !== null &&
          mousePos &&
          leftRefs.current[
            activeNum
          ] &&
          containerRef.current && (
            <line
              x1={
                leftRefs.current[
                  activeNum
                ]!.getBoundingClientRect()
                  .right -
                containerRef.current.getBoundingClientRect()
                  .left
              }

              y1={
                leftRefs.current[
                  activeNum
                ]!.getBoundingClientRect()
                  .top +
                leftRefs.current[
                  activeNum
                ]!.getBoundingClientRect()
                  .height /
                  2 -
                containerRef.current.getBoundingClientRect()
                  .top
              }

              x2={
                mousePos.x
              }

              y2={
                mousePos.y
              }

              className="ws-matching-questionLine ws-matching-questionLine--drag"
            />
          )}
      </svg>

      {/* LEFT NUMBERS */}

      <div className="ws-matching-questionColumn">
        {pairs.map(
          (pair, index) => {
            const connectedTarget =
              connections[
                pair.number
              ];

            const isCorrect =
              !!connectedTarget &&
              pair.answer
                .trim()
                .toLowerCase() ===
                connectedTarget
                  .trim()
                  .toLowerCase();

            const isSelected =
              !!connectedTarget;

            let leftClass =
              "ws-matching-questionLeftItem--default";

            if (isSelected) {
              leftClass =
                "ws-matching-questionLeftItem--connected";
            }

            if (showAnswers) {
              if (isCorrect) {
                leftClass =
                  "ws-matching-questionLeftItem--review-correct";
              } else if (isSelected) {
                leftClass =
                  "ws-matching-questionLeftItem--review-wrong";
              }
            }

            return (
              <motion.div
                key={`pair-${pair.number}-${index}`}
                ref={(el) => {
                  leftRefs.current[
                    pair.number
                  ] = el;
                }}
                onPointerDown={(
                  event,
                ) =>
                  handlePointerDown(
                    pair.number,
                    event,
                  )
                }
                whileHover={
                  !showAnswers
                    ? {
                        scale: 1.03,
                      }
                    : {}
                }
                whileTap={
                  !showAnswers
                    ? {
                        scale: 0.97,
                      }
                    : {}
                }
                className={`ws-matching-questionLeftItem ${leftClass}`}
              >
                <span>
                  {pair.number}
                </span>

                {showAnswers &&
                  isSelected &&
                  (isCorrect ? (
                    <Check
                      size={16}
                    />
                  ) : (
                    <X
                      size={16}
                    />
                  ))}
              </motion.div>
            );
          },
        )}
      </div>

      {/* RIGHT TARGETS */}

      <div className="ws-matching-questionColumn ws-matching-questionColumn--right">
        {targets.map(
          (target, index) => {
            const connectedNumbers =
              Object.entries(
                connections,
              )
                .filter(
                  ([, value]) =>
                    value ===
                    target,
                )
                .map(
                  ([key]) =>
                    Number(key),
                );

            const hasCorrect =
              pairs.some(
                (pair) =>
                  connectedNumbers.includes(
                    pair.number,
                  ) &&
                  pair.answer
                    .trim()
                    .toLowerCase() ===
                    target
                      .trim()
                      .toLowerCase(),
              );

            const rightClass =
              showAnswers && hasCorrect
                ? "ws-matching-questionRightItem--review-correct"
                : "ws-matching-questionRightItem--default";

            return (
              <motion.div
                key={`target-${target}-${index}`}
                ref={(el) => {
                  rightRefs.current[
                    target
                  ] = el;
                }}
                onPointerUp={() =>
                  handlePointerUp(
                    target,
                  )
                }
                whileHover={
                  !showAnswers
                    ? {
                        scale: 1.03,
                      }
                    : {}
                }
                className={`ws-matching-questionRightItem ${rightClass}${
                  showAnswers
                    ? " ws-matching-questionRightItem--readonly"
                    : ""
                }`}
              >
                {target}
              </motion.div>
            );
          },
        )}
      </div>
    </div>
  );
}

export default function MatchingQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const rawPairs = Array.isArray(data.pairs)
    ? data.pairs
    : [];

  const pairs: Array<{
    number: number;
    answer: string;
  }> = rawPairs
    .map((pair: any) => ({
      number: Number(
        pair?.number ??
        pair?.Number,
      ),
      answer: String(
        pair?.answer ??
        pair?.Answer ??
        "",
      ),
    }))
    .filter(
      (pair) =>
        Number.isFinite(pair.number) &&
        pair.answer.trim() !== "",
    );

  const targets = Array.from(
    new Set(
      pairs
        .map((pair) => pair.answer)
        .filter(Boolean),
    ),
  );

  const userConnections: Record<
    number,
    string
  > =
    userAnswer &&
    typeof userAnswer === "object" &&
    !Array.isArray(userAnswer)
      ? userAnswer
      : {};

  return (
    <div className="generated-question ws-matching-questionContainer">
      <h3 className="ws-matching-questionTitle">
        {question.questionText ||
          "Match each number to Odd or Even."}
      </h3>

      <MatchingLineCanvas
        pairs={pairs}
        targets={
          targets.length > 0
            ? targets
            : ["Odd", "Even"]
        }
        connections={userConnections}
        showAnswers={showAnswers}
        onConnect={(
          num,
          answer,
        ) => {
          onAnswerChange({
            ...userConnections,
            [num]: answer,
          });
        }}
      />

      {showAnswers && (
        <AnswerBox
          answer={pairs
            .map(
              (pair) =>
                `${pair.number} → ${pair.answer}`,
            )
            .join(", ")}
        />
      )}
    </div>
  );
}
