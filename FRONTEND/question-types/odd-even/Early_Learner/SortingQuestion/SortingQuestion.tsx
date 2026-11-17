import { motion } from "framer-motion";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import {AnswerBox,} from "@/renderer/questionHelpers";

export default function SortingQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const sortingNumbers = Array.isArray(data.numbers)
    ? data.numbers.map(Number).filter(Number.isFinite)
    : [];

  const expectedOrder = correctAnswers.map(Number).filter(Number.isFinite);

  const selectedOrder: number[] = Array.isArray(userAnswer)
    ? userAnswer.map(Number).filter(Number.isFinite)
    : [];

  const isSortingCorrect =
    selectedOrder.length === expectedOrder.length &&
    selectedOrder.every((number, index) => number === expectedOrder[index]);

  const selectedSet = new Set(selectedOrder);

  const addNumber = (number: number) => {
    if (showAnswers) {
      return;
    }

    if (selectedSet.has(number)) {
      return;
    }

    onAnswerChange([...selectedOrder, number]);
  };

  const removeLastNumber = () => {
    if (showAnswers) {
      return;
    }

    onAnswerChange(selectedOrder.slice(0, -1));
  };

  const resetSorting = () => {
    if (showAnswers) {
      return;
    }

    onAnswerChange([]);
  };

  return (
    <div className="generated-question sortingQuestionContainer">
      <h3 className="sortingQuestionTitle">
        {question.questionText || "Sort the numbers from smallest to largest."}
      </h3>

      <div className="sortingQuestionInstruction">
        Click the numbers in <strong>smallest → largest</strong> order.
      </div>

      <div className="sortingQuestionOptionsContainer">
        {sortingNumbers.map((number, index) => {
          const isSelected = selectedSet.has(number);

          const selectedIndex = selectedOrder.indexOf(number);

          const isCorrectPosition =
            showAnswers &&
            isSelected &&
            selectedIndex >= 0 &&
            expectedOrder[selectedIndex] === number;

          let numberBtnClass = "sortingQuestionNumberBtn--idle";

          if (showAnswers) {
            if (isCorrectPosition) {
              numberBtnClass = "sortingQuestionNumberBtn--review-correct";
            } else if (isSelected) {
              numberBtnClass = "sortingQuestionNumberBtn--review-wrong";
            } else {
              numberBtnClass = "sortingQuestionNumberBtn--review-unselected";
            }
          } else if (isSelected) {
            numberBtnClass = "sortingQuestionNumberBtn--picked";
          }

          return (
            <motion.button
              key={`sort-number-${number}-${index}`}
              type="button"
              onClick={() => addNumber(number)}
              whileHover={
                !showAnswers && !isSelected
                  ? {
                      y: -2,
                      scale: 1.03,
                    }
                  : {}
              }
              whileTap={
                !showAnswers && !isSelected
                  ? {
                      scale: 0.97,
                    }
                  : {}
              }
              disabled={showAnswers || isSelected}
              className={`sortingQuestionNumberBtn ${numberBtnClass}`}
            >
              {number}

              {isSelected && !showAnswers && (
                <span className="sortingQuestionNumberBadge">
                  {selectedIndex + 1}
                </span>
              )}

              {showAnswers && isSelected && (isCorrectPosition ? " ✓" : " ✕")}
            </motion.button>
          );
        })}
      </div>

      <div className="sortingQuestionOrderContainer">
        <div className="sortingQuestionOrderHeader">
          Your order
        </div>

        <div className="sortingQuestionOrderList">
          {selectedOrder.length === 0 ? (
            <div className="sortingQuestionEmptyPlaceholder">
              Click numbers above...
            </div>
          ) : (
            selectedOrder.map((number, index) => {
              const correctAtPosition =
                showAnswers && expectedOrder[index] === number;

              const chipClass = showAnswers
                ? correctAtPosition
                  ? "sortingQuestionOrderChip--review-correct"
                  : "sortingQuestionOrderChip--review-wrong"
                : "sortingQuestionOrderChip--active";

              return (
                <div
                  key={`selected-${number}-${index}`}
                  className="sortingQuestionOrderItemRow"
                >
                  <div
                    className={`sortingQuestionOrderChip ${chipClass}`}
                  >
                    {number}
                  </div>

                  {index < selectedOrder.length - 1 && (
                    <span className="sortingQuestionOrderArrow">
                      →
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {!showAnswers && (
        <div className="sortingQuestionControls">
          <button
            type="button"
            onClick={removeLastNumber}
            disabled={selectedOrder.length === 0}
            className={`sortingQuestionControlBtn ${
              selectedOrder.length === 0
                ? "sortingQuestionControlBtn--undo-disabled"
                : "sortingQuestionControlBtn--undo"
            }`}
          >
            ↶ Undo
          </button>

          <button
            type="button"
            onClick={resetSorting}
            disabled={selectedOrder.length === 0}
            className={`sortingQuestionControlBtn ${
              selectedOrder.length === 0
                ? "sortingQuestionControlBtn--reset-disabled"
                : "sortingQuestionControlBtn--reset"
            }`}
          >
            ↻ Reset
          </button>
        </div>
      )}

      {!showAnswers && (
        <div className="sortingQuestionProgress">
          {selectedOrder.length} / {sortingNumbers.length} numbers selected
        </div>
      )}

      {showAnswers && (
        <div
          className={`sortingQuestionResultBanner ${
            isSortingCorrect
              ? "sortingQuestionResultBanner--correct"
              : "sortingQuestionResultBanner--incorrect"
          }`}
        >
          {isSortingCorrect
            ? "✅ Perfect! The numbers are in the correct order."
            : "❌ The order is not correct."}
        </div>
      )}

      {showAnswers && <AnswerBox answer={expectedOrder.join(" → ")} />}
    </div>
  );
}
