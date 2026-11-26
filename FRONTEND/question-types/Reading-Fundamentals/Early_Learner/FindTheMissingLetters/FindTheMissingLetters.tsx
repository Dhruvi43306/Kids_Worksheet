"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import "@/styles/worksheet.css";

interface FindMissingLetterData {
    questionType?: string;
    sequence?: (string | null)[];
    missingIndex?: number;
    options?: string[];
    selectionMode?: string;
    answerType?: string;
}

interface FindMissingLetterQuestion {
    questionDataJson?: string | FindMissingLetterData;
    QuestionDataJson?: string | FindMissingLetterData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

interface FindMissingLettersProps {
    question: FindMissingLetterQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

function parseQuestionData(
    rawData?: string | FindMissingLetterData
): FindMissingLetterData {
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

        return parsed as FindMissingLetterData;
    } catch (error) {
        console.error("Invalid missing-letter question data:", error);
        return {};
    }
}

function parseCorrectAnswers(answer?: string | null): string[] {
    if (!answer) return [];

    const normalized = String(answer).trim();

    if (!normalized) return [];

    try {
        const parsed: unknown = JSON.parse(normalized);

        if (Array.isArray(parsed)) {
            return parsed.map((item) =>
                String(item).trim()
            );
        }

        if (
            typeof parsed === "string" ||
            typeof parsed === "number" ||
            typeof parsed === "boolean"
        ) {
            return [String(parsed).trim()];
        }
    } catch {
        return [normalized];
    }

    return [normalized];
}

function answerMatches(
    value: string,
    correctAnswers: string[]
): boolean {
    const normalizedValue = value.trim().toLowerCase();

    return correctAnswers.some(
        (answer) =>
            String(answer).trim().toLowerCase() === normalizedValue
    );
}

function AnswerBox({ answer }: { answer: string }) {
    return (
        <div className="generated-question__answer-box">
            <Sparkles size={16} />
            <span>Correct Answer: {answer}</span>
        </div>
    );
}

const FindTheMissingLetters: React.FC<
    FindMissingLettersProps
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

    const rawData =
        question.questionDataJson ??
        question.QuestionDataJson;

    const questionData = useMemo(
        () => parseQuestionData(rawData),
        [rawData]
    );

    const sequence = questionData.sequence ?? [];
    const missingIndex = questionData.missingIndex ?? -1;
    const options = questionData.options ?? [];

    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const isAnswerChecked = showAnswers || showAnswer;

    const correctAnswers = useMemo(() => {
        if (
            Array.isArray(correctAnswersProp) &&
            correctAnswersProp.length > 0
        ) {
            return correctAnswersProp.map((answer) =>
                String(answer).trim()
            );
        }

        return parseCorrectAnswers(
            question.correctAnswer ??
            question.CorrectAnswer
        );
    }, [
        correctAnswersProp,
        question.correctAnswer,
        question.CorrectAnswer,
    ]);

    const correctAnswer = correctAnswers[0] ?? "";

    useEffect(() => {
        if (!isControlled) {
            setInternalAnswer("");
        }
    }, [
        rawData,
        question.questionNumber,
        question.QuestionNumber,
        isControlled,
    ]);

    const handleOptionSelect = (option: string) => {
        if (isAnswerChecked) return;

        if (!isControlled) {
            setInternalAnswer(option);
        }

        onAnswerChange?.(option);
    };

    const isCorrect =
        selectedAnswer !== "" &&
        correctAnswers.length > 0 &&
        answerMatches(selectedAnswer, correctAnswers);

    if (
        sequence.length === 0 ||
        options.length === 0 ||
        missingIndex < 0 ||
        missingIndex >= sequence.length
    ) {
        return (
            <div className="fml-error">
                Missing-letter question data is missing or invalid.
            </div>
        );
    }

    return (
        <div className="fml-container">

            {/* Question instruction */}
            <div className="fml-instruction">
                <p>
                    {question.questionText ??
                        question.QuestionText ??
                        "Find the missing letter in the alphabetical sequence."}
                </p>
            </div>

            {/* Alphabetical sequence */}
            <div className="fml-sequence-section">

                <h4 className="fml-section-title">
                    Complete the sequence
                </h4>

                <div className="fml-sequence">
                    {sequence.map((letter, index) => {
                        const isMissing = index === missingIndex;

                        return (
                            <div
                                key={`${letter ?? "missing"}-${index}`}
                                className={`fml-sequence-card ${
                                    isMissing
                                        ? "fml-sequence-missing"
                                        : ""
                                }`}
                            >
                                {isMissing ? (
                                    <span className="fml-question-mark">
                                        {isAnswerChecked
                                            ? correctAnswer
                                            : "?"}
                                    </span>
                                ) : (
                                    <span>{letter}</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p className="fml-sequence-hint">
                    Choose the letter that completes the sequence.
                </p>
            </div>

            {/* Multiple-choice options */}
            <div className="fml-options-section">

                <h4 className="fml-section-title">
                    Select the missing letter
                </h4>

                <div className="fml-options-grid">
                    {options.map((option, index) => {
                        const isSelected =
                            selectedAnswer.toLowerCase() ===
                            option.toLowerCase();

                        const isCorrectOption =
                            correctAnswers.length > 0 &&
                            answerMatches(option, correctAnswers);

                        const isCorrectAfterCheck =
                            isAnswerChecked && isCorrectOption;

                        const isIncorrectSelected =
                            isAnswerChecked &&
                            isSelected &&
                            !isCorrectOption;

                        return (
                            <button
                                key={`${option}-${index}`}
                                type="button"
                                disabled={isAnswerChecked}
                                onClick={() =>
                                    handleOptionSelect(option)
                                }
                                className={`fml-option-card ${
                                    isSelected && !isAnswerChecked
                                        ? "fml-option-selected"
                                        : ""
                                } ${
                                    isCorrectAfterCheck
                                        ? "fml-option-correct"
                                        : ""
                                } ${
                                    isIncorrectSelected
                                        ? "fml-option-incorrect"
                                        : ""
                                }`}
                                aria-pressed={isSelected}
                            >
                                <span>{option}</span>

                                {isCorrectAfterCheck && (
                                    <span className="fml-option-indicator">
                                        ✓
                                    </span>
                                )}

                                {isIncorrectSelected && (
                                    <span className="fml-option-indicator fml-option-wrong-indicator">
                                        ✕
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Answer feedback */}
            {isAnswerChecked && correctAnswers.length > 0 && (
                <div className="fml-feedback">

                    {selectedAnswer ? (
                        <div
                            className={
                                isCorrect
                                    ? "fml-feedback-correct"
                                    : "fml-feedback-incorrect"
                            }
                        >
                            {isCorrect
                                ? "Excellent! You found the missing letter."
                                : "Not quite right. Look at the correct letter."}
                        </div>
                    ) : (
                        <div className="fml-feedback-incorrect">
                            You have not selected an answer.
                        </div>
                    )}

                    <AnswerBox answer={correctAnswer} />
                </div>
            )}

            {isAnswerChecked && correctAnswers.length === 0 && (
                <div className="fml-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default FindTheMissingLetters;