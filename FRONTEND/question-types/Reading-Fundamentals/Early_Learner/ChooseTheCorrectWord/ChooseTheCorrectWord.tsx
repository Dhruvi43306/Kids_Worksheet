"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

type SightWordsProps = {
    question: Record<string, any>;
    userAnswer?: string;
    value?: string;
    correctAnswers?: unknown;
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
};

type SightWordsData = { clue?: string; options?: string[] };

const parseSightWordsData = (rawData: unknown): SightWordsData => {
    let parsed = rawData;
    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return {};
        }
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const data = parsed as Record<string, unknown>;
    const clue = data.clue ?? data.Clue;
    const options = data.options ?? data.Options;
    return {
        clue: typeof clue === "string" ? clue : undefined,
        options: Array.isArray(options)
            ? options.filter((option): option is string => typeof option === "string")
            : undefined
    };
};

const getSightWordAnswers = (correctAnswers: unknown, question: Record<string, any>): string[] => {
    const source = correctAnswers ?? question.correctAnswer ?? question.CorrectAnswer;
    return (Array.isArray(source) ? source : [source]).flatMap((answer): string[] => {
        if (typeof answer === "string" && answer.trim()) return [answer.trim()];
        if (typeof answer === "number") return [String(answer)];
        if (answer && typeof answer === "object") {
            const record = answer as Record<string, unknown>;
            const value = record.answer ?? record.Answer ?? record.correctAnswer ?? record.CorrectAnswer;
            return typeof value === "string" && value.trim() ? [value.trim()] : [];
        }
        return [];
    });
};

const sightWordAnswerMatches = (answer: string, answers: string[]): boolean =>
    answers.some(correct => answer.trim().toLowerCase() === correct.trim().toLowerCase());

const SightWordAnswerBox: React.FC<{ answer: string }> = ({ answer }) => (
    <div className="ccw-answer-box">Correct answer: <strong>{answer}</strong></div>
);

const ChooseTheCorrectWord: React.FC<SightWordsProps> = ({
    question,
    userAnswer,
    value,
    correctAnswers,
    showAnswers = false,
    showAnswer = false,
    onAnswerChange
}) => {
    const [internalAnswer, setInternalAnswer] = useState("");

    const rawData =
        question.questionDataJson ??
        question.QuestionDataJson;

    const data = useMemo(
        () => parseSightWordsData(rawData),
        [rawData]
    );

    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getSightWordAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    const correctAnswer = answers[0] ?? "";
    const options = data.options ?? [];

    useEffect(() => {
        if (!isControlled) {
            setInternalAnswer("");
        }
    }, [rawData, question.questionNumber, question.QuestionNumber, isControlled]);

    const selectOption = (option: string) => {
        if (checked) return;

        if (!isControlled) setInternalAnswer(option);

        onAnswerChange?.(option);
    };

    const isCorrect =
        selectedAnswer !== "" &&
        sightWordAnswerMatches(selectedAnswer, answers);

    if (!data.clue || !options.length) {
        return (
            <div className="ccw-error">
                Choose-the-correct-word question data is missing.
            </div>
        );
    }

    return (
        <div className="ccw-container">

            <div className="ccw-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Read the clue and choose the correct sight word."}
            </div>

            <div className="ccw-clue-section">

                {/* <span className="ccw-clue-label">
                    Read the clue
                </span> */}

                <div className="ccw-clue-card">

                    <span className="ccw-clue-icon">
                        💡
                    </span>

                    <p>{data.clue}</p>

                </div>
            </div>

            <div className="ccw-options-section">
                {/* <h4>Choose the correct word</h4> */}

                <div className="ccw-options-grid">
                    {options.map((option, index) => {
                        const selected = selectedAnswer === option;

                        const correct = checked &&
                            sightWordAnswerMatches(option, answers);

                        const incorrect = checked &&
                            selected && !correct;

                        return (
                            <button
                                key={`${option}-${index}`}
                                type="button"
                                disabled={checked}
                                onClick={() => selectOption(option)}
                                className={`ccw-option ${
                                    selected && !checked
                                        ? "ccw-selected"
                                        : ""
                                } ${
                                    correct ? "ccw-correct" : ""
                                } ${
                                    incorrect ? "ccw-incorrect" : ""
                                }`}
                            >
                                {option}

                                {correct && <span>✓</span>}
                                {incorrect && <span>✕</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {checked && answers.length > 0 && (
                <div className="ccw-feedback">
                    <div className={
                        isCorrect
                            ? "ccw-feedback-correct"
                            : "ccw-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Excellent! You chose the correct word."
                                : "Not quite right. Read the clue once more."
                            : "You have not selected an answer."}
                    </div>

                    <SightWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="ccw-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default ChooseTheCorrectWord;