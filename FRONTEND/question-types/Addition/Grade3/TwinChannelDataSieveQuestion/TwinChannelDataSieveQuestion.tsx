import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

type TwinChannelDataSieveDisplayProps = {
  questionText: string;
  data: QuestionData;
  userAnswer: unknown;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: string) => void;
};

function TwinChannelDataSieveDisplay({
  questionText,
  data,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: TwinChannelDataSieveDisplayProps) {
  const isBalance =
    data.questionType === "twinChannelBalance";

  const currentAnswer = String(userAnswer ?? "").trim();

  const correctAnswer =
    String(correctAnswers[0] ?? "").trim();

  const isCorrect =
    currentAnswer !== "" &&
    answerMatches(currentAnswer, correctAnswers);

  const alphaNumbers =
    data.channelAlpha?.numbers ?? [];

  const betaNumbers = Array.isArray(data.channelBeta)
    ? data.channelBeta
    : data.channelBeta?.numbers ?? [];

  const target = data.systemLog?.target ?? 0;

  const renderValue = (
    value: number | null | undefined,
    missing: boolean,
  ) => {
    if (!missing) {
      return (
        <div className="twin-channel-sieve__value">
          {value ?? "?"}
        </div>
      );
    }

    return (
      <motion.div
        className={[
          "twin-channel-sieve__value",
          "twin-channel-sieve__value--missing",
          showAnswers
            ? isCorrect
              ? "twin-channel-sieve__value--correct"
              : "twin-channel-sieve__value--wrong"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        animate={
          !showAnswers
            ? { scale: [1, 1.03, 1] }
            : undefined
        }
        transition={
          !showAnswers
            ? { repeat: Infinity, duration: 2.2 }
            : undefined
        }
      >
        <span className="twin-channel-sieve__value-text">
          {showAnswers
            ? correctAnswer || "?"
            : currentAnswer || "?"}
        </span>

        {showAnswers && (
          <span
            className={[
              "twin-channel-sieve__value-badge",
              isCorrect
                ? "twin-channel-sieve__value-badge--correct"
                : "twin-channel-sieve__value-badge--wrong",
            ].join(" ")}
          >
            {isCorrect ? "✓" : "×"}
          </span>
        )}
      </motion.div>
    );
  };

  const renderLane = (
    name: "Alpha" | "Beta",
    symbol: string,
    icon: string,
    numbers: Array<number | null | undefined>,
    label: string,
  ) => {
    const first = numbers[0];
    const second = numbers[1];

    const firstMissing =
      first === null || first === undefined;

    const secondMissing =
      second === null || second === undefined;

    const isAlpha = name === "Alpha";

    return (
      <motion.div
        className={[
          "twin-channel-sieve__lane",
          isAlpha
            ? "twin-channel-sieve__lane--alpha"
            : "twin-channel-sieve__lane--beta",
        ].join(" ")}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
      >
        {/* Lane header */}
        <div className="twin-channel-sieve__lane-header">
          <div className="twin-channel-sieve__lane-identity">
            <span className="twin-channel-sieve__lane-icon">
              {icon}
            </span>

            <div className="twin-channel-sieve__lane-heading">
              <div className="twin-channel-sieve__lane-name">
                {name}
              </div>

              <div className="twin-channel-sieve__lane-subtitle">
                Data Channel {symbol}
              </div>
            </div>
          </div>

          <span className="twin-channel-sieve__lane-label">
            {label}
          </span>
        </div>

        {/* Channel numbers */}
        <div className="twin-channel-sieve__lane-equation">
          {renderValue(first, firstMissing)}

          <span className="twin-channel-sieve__operator">
            +
          </span>

          {renderValue(second, secondMissing)}
        </div>

        {/* Subtotal */}
        <div className="twin-channel-sieve__subtotal">
          <span className="twin-channel-sieve__subtotal-label">
            SUBTOTAL
          </span>

          <span className="twin-channel-sieve__subtotal-value">
            —
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="twin-channel-sieve">
      {/* Challenge type */}
      <div className="twin-channel-sieve__badge-row">
        <span
          className={[
            "twin-channel-sieve__mode-badge",
            isBalance
              ? "twin-channel-sieve__mode-badge--balance"
              : "twin-channel-sieve__mode-badge--sieve",
          ].join(" ")}
        >
          {isBalance
            ? "⚖️ BALANCE CHALLENGE"
            : "🔐 DATA SIEVE"}
        </span>
      </div>

      {/* Question */}
      <motion.h3
        className="twin-channel-sieve__question"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {questionText}
      </motion.h3>

      {/* Alpha channel, merge/balance module, Beta channel */}
      <div className="twin-channel-sieve__channels">
        {renderLane(
          "Alpha",
          "α",
          "🔵",
          alphaNumbers,
          "INPUT A",
        )}

        <motion.div
          className="twin-channel-sieve__merge"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <span className="twin-channel-sieve__merge-icon">
            {isBalance ? "⚖️" : "🔗"}
          </span>

          <span className="twin-channel-sieve__merge-label">
            {isBalance ? "BALANCE" : "MERGE"}
          </span>
        </motion.div>

        {renderLane(
          "Beta",
          "β",
          "🟢",
          betaNumbers,
          "INPUT B",
        )}
      </div>

      {/* System target */}
      <motion.div
        className="twin-channel-sieve__system-log"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="twin-channel-sieve__system-icon">
          🔐
        </span>

        <span className="twin-channel-sieve__system-label">
          {data.systemLog?.label ||
            (isBalance
              ? "BALANCE TARGET"
              : "SYSTEM LOG LOCK")}
        </span>

        <span className="twin-channel-sieve__target">
          {target}
        </span>
      </motion.div>

      {/* Missing number answer */}
      <div className="twin-channel-sieve__answer-section">
        <label
          className="twin-channel-sieve__answer-label"
          htmlFor="twin-channel-sieve-answer"
        >
          {isBalance
            ? "Enter the missing balance value"
            : "Enter the missing number"}
        </label>

        <div className="twin-channel-sieve__answer-row">
          <input
            id="twin-channel-sieve-answer"
            className={[
              "twin-channel-sieve__answer-input",
              showAnswers
                ? isCorrect
                  ? "twin-channel-sieve__answer-input--correct"
                  : "twin-channel-sieve__answer-input--wrong"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="number"
            inputMode="numeric"
            min="0"
            value={currentAnswer}
            disabled={showAnswers}
            onChange={(e) =>
              onAnswerChange(e.target.value)
            }
            placeholder="?"
          />

          <span className="twin-channel-sieve__answer-icon">
            {showAnswers
              ? isCorrect
                ? "✅"
                : "❌"
              : "✨"}
          </span>
        </div>

        {showAnswers && (
          <motion.div
            className={[
              "twin-channel-sieve__answer-feedback",
              isCorrect
                ? "twin-channel-sieve__answer-feedback--correct"
                : "twin-channel-sieve__answer-feedback--wrong",
            ].join(" ")}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {isCorrect
              ? "Correct! The data channels are solved."
              : `Incorrect. Correct answer: ${correctAnswer}`}
          </motion.div>
        )}
      </div>

      {/* Explanation */}
      {showAnswers && (
        <motion.div
          className="twin-channel-sieve__explanation"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="twin-channel-sieve__explanation-heading">
            <Sparkles
              size={15}
              aria-hidden="true"
            />
            <span>How to solve</span>
          </div>

          <div className="twin-channel-sieve__explanation-text">
            {data.explanation}
          </div>
        </motion.div>
      )}

      {showAnswers && (
        <div className="twin-channel-sieve__final-answer">
          <AnswerBox answer={`Missing number = ${correctAnswer}`} />
        </div>
      )}
    </div>
  );
}

export default function TwinChannelDataSieveQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <TwinChannelDataSieveDisplay
      questionText={question.questionText}
      data={data}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      correctAnswers={correctAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
