"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

type SightWordsQuestion = {
    questionDataJson?: unknown;
    QuestionDataJson?: unknown;
    questionText?: string;
    QuestionText?: string;
    questionNumber?: string | number;
    QuestionNumber?: string | number;
    correctAnswer?: unknown;
    CorrectAnswer?: unknown;
};

type SightWordsProps = {
    question: SightWordsQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: unknown;
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
};

type SightWordsData = {
    picture?: string;
    pictureDescription?: string;
    options?: string[];
};

const parseSightWordsData = (rawData: unknown): SightWordsData => {
    let parsed = rawData;

    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return {};
        }
    }

    if (!parsed || typeof parsed !== "object") return {};

    const data = parsed as Record<string, unknown>;
    const options = data.options ?? data.Options;
    const picture = data.picture ?? data.Picture ?? data.image ?? data.Image;
    const description = data.pictureDescription ?? data.PictureDescription;

    return {
        picture: typeof picture === "string" ? picture : undefined,
        pictureDescription: typeof description === "string" ? description : undefined,
        options: Array.isArray(options)
            ? options.filter((option): option is string => typeof option === "string")
            : undefined
    };
};

const getSightWordAnswers = (
    correctAnswers: unknown,
    question: SightWordsQuestion
): string[] => {
    const answer = correctAnswers ?? question.correctAnswer ?? question.CorrectAnswer;
    const candidates = Array.isArray(answer) ? answer : [answer];

    return candidates
        .map((candidate) => {
            if (typeof candidate === "string" || typeof candidate === "number") {
                return String(candidate);
            }
            if (candidate && typeof candidate === "object") {
                const record = candidate as Record<string, unknown>;
                const value = record.answer ?? record.Answer ?? record.correctAnswer;
                return typeof value === "string" || typeof value === "number"
                    ? String(value)
                    : "";
            }
            return "";
        })
        .filter(Boolean);
};

const sightWordAnswerMatches = (answer: string, answers: string[]): boolean =>
    answers.some(
        (correctAnswer) =>
            answer.trim().toLocaleLowerCase() ===
            correctAnswer.trim().toLocaleLowerCase()
    );

const SightWordAnswerBox: React.FC<{ answer: string }> = ({ answer }) => (
    <div className="mwp-answer-box">Correct answer: {answer}</div>
);

const MatchWordsWithPictures: React.FC<SightWordsProps> = ({
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

    if (!data.picture || !options.length) {
        return (
            <div className="mwp-error">
                Picture matching question data is missing.
            </div>
        );
    }

    return (
        <div className="mwp-container">

            <div className="mwp-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Look at the picture and choose the matching word."}
            </div>

            <div className="mwp-picture-section">

                {/* <span className="mwp-label">
                    Look at the picture
                </span> */}

                <div
                    className="mwp-picture-card"
                    role="img"
                    aria-label={data.pictureDescription ?? "Sight word picture"}
                >
                    <span className="mwp-picture">
                        {data.picture}
                    </span>
                </div>

                {data.pictureDescription && (
                    <p className="mwp-picture-description">
                        {data.pictureDescription}
                    </p>
                )}

            </div>

            <div className="mwp-options-section">
                {/* <h4>Choose the matching word</h4> */}

                <div className="mwp-options-grid">
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
                                className={`mwp-option ${
                                    selected && !checked
                                        ? "mwp-selected"
                                        : ""
                                } ${
                                    correct ? "mwp-correct" : ""
                                } ${
                                    incorrect ? "mwp-incorrect" : ""
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
                <div className="mwp-feedback">
                    <div className={
                        isCorrect
                            ? "mwp-feedback-correct"
                            : "mwp-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Wonderful! You matched the correct word."
                                : "That word does not match the picture."
                            : "You have not selected an answer."}
                    </div>

                    <SightWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="mwp-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default MatchWordsWithPictures;