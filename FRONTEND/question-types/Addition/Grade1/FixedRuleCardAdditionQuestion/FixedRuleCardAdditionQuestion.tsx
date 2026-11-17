
import React from "react";
import { motion } from "framer-motion";
import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

export default function FixedRuleCardAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const fixedRule = data.fixedRule;
  const cards = data.cards ?? [];
  const answers = data.answers ?? [];
  const finalTotal = data.finalTotal;

  const userAnswers = Array.isArray(userAnswer?.cards)
    ? userAnswer.cards
    : [];

  const userTotal =
    userAnswer?.total !== undefined
      ? String(userAnswer.total)
      : "";

  if (
    fixedRule === undefined ||
    cards.length === 0 ||
    answers.length !== cards.length ||
    finalTotal === undefined
  ) {
    return (
      <div className="fixed-rule-card-addition__error">
        Fixed Rule Card Addition data is incomplete.
      </div>
    );
  }

  const handleCardAnswerChange = (
    index: number,
    value: string
  ) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = value;

    onAnswerChange({
      cards: updatedAnswers,
      total: userTotal,
    });
  };

  const handleTotalChange = (value: string) => {
    onAnswerChange({
      cards: userAnswers,
      total: value,
    });
  };

  const cardCorrect = (index: number) =>
    answerMatches(userAnswers[index] ?? "", [
      String(answers[index]),
    ]);

  const totalCorrect = answerMatches(userTotal, [
    String(finalTotal),
  ]);

  return (
    <div className="fixed-rule-card-addition">
      <h3 className="fixed-rule-card-addition__question">
        {question.questionText}
      </h3>

      {/* Fixed rule */}
      <div className="fixed-rule-card-addition__rule-section">
        <span className="fixed-rule-card-addition__rule-label">
          Fixed Rule
        </span>

        <div className="fixed-rule-card-addition__rule">
          +{fixedRule}
        </div>

        <div
          className="fixed-rule-card-addition__rule-arrow"
          aria-hidden="true"
        >
          ↓
        </div>
      </div>

      {/* Cards and final basket */}
      <div className="fixed-rule-card-addition__flow">
        {cards.map((card, index) => {
          const isCorrect =
            showAnswers && cardCorrect(index);

          const isWrong =
            showAnswers && !isCorrect;

          return (
            <React.Fragment key={`${card}-${index}`}>
              <div className="fixed-rule-card-addition__item">
                <motion.div
                  className="fixed-rule-card-addition__card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="fixed-rule-card-addition__card-label">
                    Card
                  </span>

                  <span className="fixed-rule-card-addition__card-number">
                    {card}
                  </span>
                </motion.div>

                <div
                  className="fixed-rule-card-addition__arrow"
                  aria-hidden="true"
                >
                  ↓
                </div>

                <input
                  className={[
                    "fixed-rule-card-addition__input",
                    "fixed-rule-card-addition__card-input",
                    showAnswers
                      ? isCorrect
                        ? "fixed-rule-card-addition__input--correct"
                        : "fixed-rule-card-addition__input--wrong"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  type="number"
                  inputMode="numeric"
                  value={userAnswers[index] ?? ""}
                  disabled={showAnswers}
                  onChange={(e) =>
                    handleCardAnswerChange(
                      index,
                      e.target.value
                    )
                  }
                  placeholder="?"
                  aria-label={`Answer for card ${card}`}
                />

                {showAnswers && (
                  <span
                    className={[
                      "fixed-rule-card-addition__feedback",
                      isCorrect
                        ? "fixed-rule-card-addition__feedback--correct"
                        : "fixed-rule-card-addition__feedback--wrong",
                    ].join(" ")}
                  >
                    {isCorrect
                      ? "✓ Correct"
                      : `✗ ${answers[index]}`}
                  </span>
                )}
              </div>

              {index < cards.length - 1 && (
                <div
                  className="fixed-rule-card-addition__flow-arrow"
                  aria-hidden="true"
                >
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Final basket */}
        <div className="fixed-rule-card-addition__total-item">
          <div className="fixed-rule-card-addition__basket">
            <span className="fixed-rule-card-addition__basket-label">
              Final Basket
            </span>

            <span className="fixed-rule-card-addition__basket-total-label">
              Total
            </span>
          </div>

          <div
            className="fixed-rule-card-addition__total-arrow"
            aria-hidden="true"
          >
            ↓
          </div>

          <input
            className={[
              "fixed-rule-card-addition__input",
              "fixed-rule-card-addition__total-input",
              showAnswers
                ? totalCorrect
                  ? "fixed-rule-card-addition__input--correct"
                  : "fixed-rule-card-addition__input--wrong"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="number"
            inputMode="numeric"
            value={userTotal}
            disabled={showAnswers}
            onChange={(e) =>
              handleTotalChange(e.target.value)
            }
            placeholder="?"
            aria-label="Final basket total"
          />

          {showAnswers && (
            <span
              className={[
                "fixed-rule-card-addition__feedback",
                totalCorrect
                  ? "fixed-rule-card-addition__feedback--correct"
                  : "fixed-rule-card-addition__feedback--wrong",
              ].join(" ")}
            >
              {totalCorrect
                ? "✓ Correct"
                : `✗ ${finalTotal}`}
            </span>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed-rule-card-addition__instructions">
        <div className="fixed-rule-card-addition__instructions-title">
          How to Solve
        </div>

        <div className="fixed-rule-card-addition__instructions-content">
          <span>Each card</span>

          <strong className="fixed-rule-card-addition__rule-highlight">
            +{fixedRule}
          </strong>

          <span>then add all answers for the</span>

          <strong className="fixed-rule-card-addition__total-highlight">
            final basket total
          </strong>
          <span>.</span>
        </div>
      </div>

      {showAnswers && (
        <div className="fixed-rule-card-addition__answer">
          <AnswerBox
            answer={`${answers.join(" + ")} = ${finalTotal}`}
          />
        </div>
      )}
    </div>
  );
}
