"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, ArrowLeftRight } from "lucide-react";
import "@/styles/worksheet.css";

interface ArrangeLetterAlphaOrderData {
    questionType?: string;
    letters?: string[];
    letterCount?: number;
    selectionMode?: string;
    answerType?: string;
}

interface ArrangeLetterAlphaOrderQuestion {
    questionDataJson?: string | ArrangeLetterAlphaOrderData;
    QuestionDataJson?: string | ArrangeLetterAlphaOrderData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

interface ArrangeLetterAlphaOrderProps {
    question: ArrangeLetterAlphaOrderQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

function parseQuestionData(
    rawData?: string | ArrangeLetterAlphaOrderData
): ArrangeLetterAlphaOrderData {
    if (!rawData) return {};

    if (typeof rawData === "object") {
        return rawData;
    }

    try {
        const parsed: unknown = JSON.parse(rawData);

        if (
            parsed === null ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return {};
        }

        return parsed as ArrangeLetterAlphaOrderData;
    } catch (error) {
        console.error("Invalid alphabetical-order question data:", error);
        return {};
    }
}

function parseCorrectOrder(answer?: string | null): string[] {
    if (!answer) return [];

    const normalized = String(answer).trim();

    if (!normalized) return [];

    try {
        const parsed: unknown = JSON.parse(normalized);

        if (Array.isArray(parsed)) {
            return parsed.map((item) =>
                String(item).trim().toUpperCase()
            );
        }
    } catch {
        // Backend sends comma-separated letters.
    }

    return normalized
        .split(",")
        .map((letter) => letter.trim().toUpperCase())
        .filter(Boolean);
}

function AnswerBox({ answer }: { answer: string }) {
    return (
        <div className="generated-question__answer-box">
            <Sparkles size={16} />
            <span>Correct Answer: {answer}</span>
        </div>
    );
}

const ArrangeLetterAlphaOrder: React.FC<
    ArrangeLetterAlphaOrderProps
> = ({
    question,
    userAnswer,
    value,
    correctAnswers: correctAnswersProp,
    showAnswers = false,
    showAnswer = false,
    onAnswerChange,
}) => {
    const [internalAnswer, setInternalAnswer] = useState("");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(
        null
    );

    const rawData =
        question.questionDataJson ??
        question.QuestionDataJson;

    const questionData = useMemo(
        () => parseQuestionData(rawData),
        [rawData]
    );

    const originalLetters = (questionData.letters ?? [])
        .map((letter) => letter.toUpperCase());

    const letterCount =
        questionData.letterCount ?? originalLetters.length;

    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const isAnswerChecked = showAnswers || showAnswer;

    const correctAnswers =
        correctAnswersProp && correctAnswersProp.length > 0
            ? correctAnswersProp
            : question.correctAnswer !== undefined &&
                question.correctAnswer !== null
                ? [question.correctAnswer]
                : question.CorrectAnswer !== undefined &&
                    question.CorrectAnswer !== null
                    ? [question.CorrectAnswer]
                    : [];

    const correctOrder = useMemo(
        () => parseCorrectOrder(correctAnswers[0]),
        [correctAnswers]
    );

    // Before the first interaction, display the shuffled backend order.
    // After interaction, display the user's selected order.
    const currentOrder = useMemo(
        () =>
            selectedAnswer
                ? parseCorrectOrder(selectedAnswer)
                : originalLetters,
        [selectedAnswer, originalLetters.join(",")]
    );

    useEffect(() => {
        setSelectedIndex(null);

        if (!isControlled) {
            setInternalAnswer("");
        }
    }, [
        rawData,
        question.questionNumber,
        question.QuestionNumber,
        isControlled,
    ]);

    const updateAnswer = (nextOrder: string[]) => {
        const serialized = nextOrder.join(",");

        if (!isControlled) {
            setInternalAnswer(serialized);
        }

        onAnswerChange?.(serialized);
    };

    // Click one letter and then another letter to swap them.
    const handleLetterSelect = (index: number) => {
        if (isAnswerChecked) return;

        if (selectedIndex === null) {
            setSelectedIndex(index);
            return;
        }

        if (selectedIndex === index) {
            setSelectedIndex(null);
            return;
        }

        const nextOrder = [...currentOrder];

        const temp = nextOrder[selectedIndex];

        nextOrder[selectedIndex] = nextOrder[index];
        nextOrder[index] = temp;

        updateAnswer(nextOrder);

        setSelectedIndex(null);
    };

    const isCorrect =
        correctOrder.length > 0 &&
        currentOrder.length === correctOrder.length &&
        currentOrder.every(
            (letter, index) =>
                letter === correctOrder[index]
        );

    const hasArranged = selectedAnswer.trim() !== "";

    const formattedCorrectAnswer = correctOrder.join(", ");

    if (originalLetters.length === 0) {
        return (
            <div className="alao-error">
                Alphabetical-order question data is missing.
            </div>
        );
    }

    return (
        <div className="alao-container">

            {/* Instruction */}
            <div className="alao-instruction">
                <p>
                    {question.questionText ??
                        question.QuestionText ??
                        "Arrange the following letters in alphabetical order."}
                </p>
            </div>

          
            {/* Arrange letters */}
            <div className="alao-letters-section">

                <div className="alao-letters-grid">
                    {currentOrder.map((letter, index) => {
                        const isSelected =
                            selectedIndex === index;

                        const positionIsCorrect =
                            isAnswerChecked &&
                            correctOrder[index] === letter;

                        const positionIsIncorrect =
                            isAnswerChecked &&
                            correctOrder[index] !== letter;

                        return (
                            <button
                                key={`${index}-${letter}`}
                                type="button"
                                disabled={isAnswerChecked}
                                onClick={() =>
                                    handleLetterSelect(index)
                                }
                                className={`alao-letter-card ${
                                    isSelected
                                        ? "alao-letter-selected"
                                        : ""
                                } ${
                                    positionIsCorrect
                                        ? "alao-letter-correct"
                                        : ""
                                } ${
                                    positionIsIncorrect
                                        ? "alao-letter-incorrect"
                                        : ""
                                }`}
                                aria-pressed={isSelected}
                                aria-label={`Position ${index + 1}: ${letter}`}
                            >
                                <span className="alao-position">
                                    {index + 1}
                                </span>

                                <span className="alao-letter">
                                    {letter}
                                </span>

                                {positionIsCorrect && (
                                    <span className="alao-status-icon">
                                        ✓
                                    </span>
                                )}

                                {positionIsIncorrect && (
                                    <span className="alao-status-icon alao-status-wrong">
                                        ✕
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="alao-swap-hint">
                    <ArrowLeftRight size={17} />

                    <span>
                        {selectedIndex === null
                            ? "Select the first letter to move."
                            : `Now select another letter to swap with ${currentOrder[selectedIndex]}.`}
                    </span>
                </div>
            </div>

            {/* Answer feedback */}
            {isAnswerChecked && correctOrder.length > 0 && (
                <div className="alao-feedback">

                    {hasArranged ? (
                        <div
                            className={
                                isCorrect
                                    ? "alao-feedback-correct"
                                    : "alao-feedback-incorrect"
                            }
                        >
                            {isCorrect
                                ? "Excellent! All letters are in the correct order."
                                : "Some letters are in the wrong position. Check the correct order below."}
                        </div>
                    ) : (
                        <div className="alao-feedback-incorrect">
                            You have not arranged the letters.
                        </div>
                    )}

                    <AnswerBox answer={formattedCorrectAnswer} />
                </div>
            )}

            {isAnswerChecked && correctOrder.length === 0 && (
                <div className="alao-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

            <div className="alao-count">
                {currentOrder.length} of {letterCount} letters
            </div>

        </div>
    );
};

export default ArrangeLetterAlphaOrder;