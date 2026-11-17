// AdditionPathQuestion.tsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox } from "@/renderer/questionHelpers";

type AdditionPathNode = {
  id: string;
  label?: string;
  value?: string;
  actualValue?: number;
  isStart?: boolean;
  isMissing?: boolean;
  isFinish?: boolean;
};

type AdditionPathStep = {
  from: string;
  to: string;
  operation?: string;
  operationValue?: number;
  operationType?: "add" | "subtract";
  fromValue?: number;
  toValue?: number;
};

type AdditionPathAnswer = {
  nodeId: string;
  answer?: number;
};

type AdditionPathData = Omit<QuestionData, "answers"> & {
  startNode?: string;
  finishNode?: string;
  nodeCount?: number;
  operationCount?: number;
  nodes?: AdditionPathNode[];
  finish?: AdditionPathNode;
  paths?: AdditionPathStep[];
  startValue?: number;
  finalValue?: number;
  answers?: AdditionPathAnswer[];
};

function AdditionPathDisplay({
  questionText,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: {
  questionText: string;
  data: QuestionData;
  userAnswer: any;
  showAnswers: boolean;
  onAnswerChange: (value: any) => void;
}) {
  const pathData = data as AdditionPathData;

  const nodes = Array.isArray(pathData.nodes) ? pathData.nodes : [];
  const paths = Array.isArray(pathData.paths) ? pathData.paths : [];
  const answerList = Array.isArray(pathData.answers)
    ? pathData.answers
    : [];

  const allNodes: AdditionPathNode[] = [
    ...nodes,
    ...(pathData.finish
      ? [
          {
            ...pathData.finish,
            isFinish: pathData.finish.isFinish ?? true,
          },
        ]
      : []),
  ];

  const startValue =
    typeof pathData.startValue === "number"
      ? pathData.startValue
      : (nodes[0]?.actualValue ?? 0);

  const finalValue =
    typeof pathData.finalValue === "number"
      ? pathData.finalValue
      : (pathData.finish?.actualValue ?? 0);

  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  const answers =
    userAnswer &&
    typeof userAnswer === "object" &&
    !Array.isArray(userAnswer)
      ? userAnswer
      : {};

  const getExpectedAnswer = (nodeId: string): string => {
    const item = answerList.find((entry) => entry.nodeId === nodeId);
    return item?.answer !== undefined ? String(item.answer) : "";
  };

  const getUserAnswer = (nodeId: string): string =>
    String(answers[nodeId] ?? "").trim();

  const updateNodeAnswer = (nodeId: string, value: string) => {
    if (showAnswers) return;

    onAnswerChange({
      ...answers,
      [nodeId]: value,
    });
  };

  useEffect(() => {
    setAnimationStep(0);
    setIsAnimating(false);
    setAnimationFinished(false);
  }, [questionText]);

  useEffect(() => {
    if (showAnswers) {
      setAnimationStep(paths.length);
      setIsAnimating(false);
      setAnimationFinished(true);
      return;
    }

    if (!isAnimating) return;

    if (animationStep >= paths.length) {
      setIsAnimating(false);
      setAnimationFinished(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setAnimationStep((previous) => previous + 1);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [isAnimating, animationStep, paths.length, showAnswers]);

  const startJourney = () => {
    if (showAnswers || isAnimating) return;

    setAnimationStep(0);
    setAnimationFinished(false);
    setIsAnimating(true);
  };

  const replayJourney = () => {
    if (showAnswers) return;

    setAnimationStep(0);
    setAnimationFinished(false);
    setIsAnimating(false);
    onAnswerChange({});
  };

  const getCurrentNodeIndex = () => {
    if (animationStep === 0) return 0;

    const currentPath = paths[animationStep - 1];
    if (!currentPath) return 0;

    const index = allNodes.findIndex(
      (node) => node.id === currentPath.to,
    );

    return index >= 0 ? index : 0;
  };

  const currentNodeIndex = getCurrentNodeIndex();

  const getNodeLeft = (index: number): string => {
    if (allNodes.length <= 1) return "50%";

    const start = 7;
    const end = 93;

    return `${
      start + (index / (allNodes.length - 1)) * (end - start)
    }%`;
  };

  const kidLeft = getNodeLeft(currentNodeIndex);
  const currentPath =
    animationStep > 0 ? paths[animationStep - 1] : undefined;
  const currentOperation = currentPath?.operation ?? "";

  const completedNodeIds = new Set(
    paths.slice(0, animationStep).map((path) => path.to),
  );

  const areAllAnswersCorrect = allNodes
    .filter((node) => node.isMissing === true)
    .every((node) => {
      const expected = getExpectedAnswer(node.id);
      const entered = getUserAnswer(node.id);

      return (
        expected !== "" &&
        entered !== "" &&
        entered === expected
      );
    });

  if (nodes.length === 0 || paths.length === 0) {
    return (
      <div className="additionPathQuestionError">
        Addition path data is missing.
      </div>
    );
  }

  return (
    <motion.div
      className="additionPathQuestionBoard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="additionPathQuestionHeading">
        <div className="additionPathQuestionTitle">
          {questionText ||
            "Follow the path and complete the missing numbers."}
        </div>

        <div className="additionPathQuestionInstruction">
          Start at {startValue}, follow each operation, and reach the
          finish.
        </div>
      </div>

      {/* PATH BOARD */}
      <div className="additionPathQuestionViewport">
        <div className="additionPathQuestionTrack">
          <div className="additionPathQuestionLine" />

          {/* PATH OPERATIONS */}
          {paths.map((path, index) => {
            const fromIndex = allNodes.findIndex(
              (node) => node.id === path.from,
            );
            const toIndex = allNodes.findIndex(
              (node) => node.id === path.to,
            );

            const safeFromIndex = fromIndex >= 0 ? fromIndex : 0;
            const safeToIndex = toIndex >= 0 ? toIndex : 0;

            const middleIndex =
              (safeFromIndex + safeToIndex) / 2;

            const completed = animationStep > index;
            const isSubtract = path.operationType === "subtract";

            return (
              <motion.div
                key={`${path.from}-${path.to}-${index}`}
                className={[
                  "additionPathQuestionOperation",
                  isSubtract
                    ? "additionPathQuestionOperationSubtract"
                    : "additionPathQuestionOperationAdd",
                ].join(" ")}
                style={{
                  left: getNodeLeft(middleIndex),
                }}
                animate={{ scale: completed ? 1.05 : 1 }}
              >
                {path.operation}
              </motion.div>
            );
          })}

          {/* NODES */}
          {allNodes.map((node, index) => {
            const isStart = node.id === pathData.startNode;
            const isFinish =
              node.id === pathData.finishNode ||
              node.id === "finish" ||
              node.isFinish === true;

            const completed =
              isStart || completedNodeIds.has(node.id);

            const entered = getUserAnswer(node.id);
            const expected = getExpectedAnswer(node.id);

            const nodeCorrect =
              showAnswers &&
              node.isMissing === true &&
              entered !== "" &&
              expected !== "" &&
              entered === expected;

            const nodeWrong =
              showAnswers &&
              node.isMissing === true &&
              entered !== "" &&
              expected !== "" &&
              entered !== expected;

            const nodeClassName = [
              "additionPathQuestionNodeCircle",
              isStart ? "additionPathQuestionNodeStart" : "",
              isFinish ? "additionPathQuestionNodeFinish" : "",
              !isStart && !isFinish && completed
                ? "additionPathQuestionNodeCompleted"
                : "",
              nodeCorrect ? "additionPathQuestionNodeCorrect" : "",
              nodeWrong ? "additionPathQuestionNodeWrong" : "",
              !completed && !isStart && !isFinish
                ? "additionPathQuestionNodePending"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <motion.div
                key={node.id}
                className="additionPathQuestionNode"
                style={{ left: getNodeLeft(index) }}
                animate={{
                  scale:
                    currentNodeIndex === index && isAnimating
                      ? [1, 1.05, 1]
                      : 1,
                }}
                transition={{
                  repeat:
                    currentNodeIndex === index && isAnimating
                      ? Infinity
                      : 0,
                  duration: 0.65,
                }}
              >
                <div className="additionPathQuestionNodeLabel">
                  {node.label}
                </div>

                <div className={nodeClassName}>
                  {isStart
                    ? node.value
                    : isFinish
                      ? showAnswers && nodeCorrect
                        ? "✅"
                        : "🏁"
                      : showAnswers && nodeCorrect
                        ? "✓"
                        : (node.value ?? "?")}
                </div>
              </motion.div>
            );
          })}

          {/* MOVING CHILD */}
          <motion.div
            className="additionPathQuestionChild"
            animate={{ left: kidLeft }}
            transition={{
              left: { duration: 0.55, ease: "easeInOut" },
            }}
          >
            🧒
          </motion.div>

          {/* OPERATION STATUS */}
          <div className="additionPathQuestionStatus">
            {isAnimating
              ? `Kid is following ${currentOperation}`
              : animationFinished
                ? "🎉 Journey completed!"
                : "👆 Start the journey"}
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="additionPathQuestionProgress">
        <span>Start: {startValue}</span>
        <span>→</span>
        <span>
          Steps completed: {animationStep}/{paths.length}
        </span>
        <span>→</span>
        <span>
          Finish: {animationFinished ? finalValue : "?"}
        </span>
      </div>

      {/* ANSWER INPUTS */}
      <div className="additionPathQuestionAnswers">
        {allNodes
          .filter((node) => node.isMissing === true)
          .map((node) => {
            const entered = getUserAnswer(node.id);
            const expected = getExpectedAnswer(node.id);

            const isCorrect =
              showAnswers &&
              entered !== "" &&
              expected !== "" &&
              entered === expected;

            const isWrong =
              showAnswers &&
              entered !== "" &&
              expected !== "" &&
              entered !== expected;

            return (
              <div
                key={`answer-${node.id}`}
                className={[
                  "additionPathQuestionAnswerCard",
                  isCorrect
                    ? "additionPathQuestionAnswerCorrect"
                    : "",
                  isWrong
                    ? "additionPathQuestionAnswerWrong"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="additionPathQuestionAnswerLabel">
                  {node.label}
                </div>

                <input
                  className="additionPathQuestionAnswerInput"
                  type="number"
                  inputMode="numeric"
                  value={entered}
                  disabled={showAnswers}
                  onChange={(event) =>
                    updateNodeAnswer(node.id, event.target.value)
                  }
                  placeholder="?"
                />

                {showAnswers && (
                  <div
                    className={[
                      "additionPathQuestionAnswerFeedback",
                      isCorrect
                        ? "additionPathQuestionFeedbackCorrect"
                        : "additionPathQuestionFeedbackWrong",
                    ].join(" ")}
                  >
                    {isCorrect
                      ? "✓ Correct"
                      : `Correct: ${expected}`}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* CONTROLS */}
      {!showAnswers && (
        <div className="additionPathQuestionControls">
          {!isAnimating && !animationFinished && (
            <button
              type="button"
              className="additionPathQuestionStartButton"
              onClick={startJourney}
            >
              🧒 Start Journey
            </button>
          )}

          {animationFinished && (
            <button
              type="button"
              className="additionPathQuestionReplayButton"
              onClick={replayJourney}
            >
              ↻ Replay Journey
            </button>
          )}
        </div>
      )}

      {/* RESULT */}
      {showAnswers && (
        <motion.div
          className={[
            "additionPathQuestionResult",
            areAllAnswersCorrect
              ? "additionPathQuestionResultCorrect"
              : "additionPathQuestionResultWrong",
          ].join(" ")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {areAllAnswersCorrect
            ? "✅ Excellent! You completed the entire addition path."
            : "❌ Check the missing node values and try again."}
        </motion.div>
      )}

      {showAnswers && (
        <AnswerBox answer={`Start ${startValue} → Finish ${finalValue}`} />
      )}
    </motion.div>
  );
}

export default function AdditionPathQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  return (
    <div className="additionPathQuestionRoot">
      <AdditionPathDisplay
        questionText={question.questionText}
        data={data}
        userAnswer={userAnswer}
        showAnswers={showAnswers}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
}