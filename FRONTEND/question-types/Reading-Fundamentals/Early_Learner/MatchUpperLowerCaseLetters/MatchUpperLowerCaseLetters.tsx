"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import "@/styles/worksheet.css";

interface MatchUpperLowerCaseData {
    questionType?: string;
    uppercaseLetters?: string[];
    lowercaseLetters?: string[];
    pairCount?: number;
    selectionMode?: string;
    answerType?: string;
}

interface MatchUpperLowerCaseQuestion {
    questionDataJson?: string | MatchUpperLowerCaseData;
    QuestionDataJson?: string | MatchUpperLowerCaseData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

interface MatchUpperLowerCaseProps {
    question: MatchUpperLowerCaseQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

type PairMap = Record<string, string>;

function parseQuestionData(
    rawData?: string | MatchUpperLowerCaseData
): MatchUpperLowerCaseData {
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

        return parsed as MatchUpperLowerCaseData;
    } catch (error) {
        console.error("Invalid matching question data:", error);
        return {};
    }
}

function parsePairMap(answer?: string | null): PairMap {
    const result: PairMap = {};

    if (!answer) return result;

    answer.split("|").forEach((pair) => {
        const [uppercase, lowercase] = pair.split(":");

        if (uppercase && lowercase) {
            result[uppercase.trim().toUpperCase()] =
                lowercase.trim().toLowerCase();
        }
    });

    return result;
}

function serializePairMap(pairs: PairMap): string {
    return Object.keys(pairs)
        .sort()
        .map(
            (uppercase) =>
                `${uppercase}:${pairs[uppercase].toLowerCase()}`
        )
        .join("|");
}

function AnswerBox({ answer }: { answer: string }) {
    return (
        <div className="generated-question__answer-box">
            <Sparkles size={16} />
            <span>Correct Answer: {answer}</span>
        </div>
    );
}

const MatchUpperLowerCaseLetters: React.FC<
    MatchUpperLowerCaseProps
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
    const [selectedUppercase, setSelectedUppercase] =
        useState<string | null>(null);

    const rawData =
        question.questionDataJson ??
        question.QuestionDataJson;

    const questionData = useMemo(
        () => parseQuestionData(rawData),
        [rawData]
    );

    const uppercaseLetters = questionData.uppercaseLetters ?? [];
    const lowercaseLetters = questionData.lowercaseLetters ?? [];
    const pairCount = questionData.pairCount ?? uppercaseLetters.length;

    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const isAnswerChecked = showAnswers || showAnswer;

    const correctAnswer =
        correctAnswersProp?.[0] ??
        question.correctAnswer ??
        question.CorrectAnswer ??
        "";

    const userPairs = useMemo(
        () => parsePairMap(selectedAnswer),
        [selectedAnswer]
    );

    const correctPairs = useMemo(
        () => parsePairMap(correctAnswer),
        [correctAnswer]
    );

    useEffect(() => {
        setSelectedUppercase(null);

        if (!isControlled) {
            setInternalAnswer("");
        }
    }, [
        rawData,
        question.questionNumber,
        question.QuestionNumber,
        isControlled,
    ]);

    const updateAnswer = (nextPairs: PairMap) => {
        const serialized = serializePairMap(nextPairs);

        if (!isControlled) {
            setInternalAnswer(serialized);
        }

        onAnswerChange?.(serialized);
    };

    const handleUppercaseSelect = (letter: string) => {
        if (isAnswerChecked) return;

        setSelectedUppercase(letter);
    };

    const handleLowercaseSelect = (letter: string) => {
        if (isAnswerChecked) return;

        if (!selectedUppercase) return;

        const nextPairs = { ...userPairs };

        // Remove this lowercase letter from any previous pair.
        Object.keys(nextPairs).forEach((uppercase) => {
            if (nextPairs[uppercase] === letter.toLowerCase()) {
                delete nextPairs[uppercase];
            }
        });

        // Remove the previous match for the selected uppercase.
        delete nextPairs[selectedUppercase];

        nextPairs[selectedUppercase] = letter.toLowerCase();

        updateAnswer(nextPairs);
        setSelectedUppercase(null);
    };

    const matchedCount = Object.keys(userPairs).length;

    const isCorrect =
        matchedCount === pairCount &&
        Object.keys(correctPairs).length === pairCount &&
        Object.keys(correctPairs).every(
            (uppercase) =>
                userPairs[uppercase] === correctPairs[uppercase]
        );

    const formattedCorrectAnswer = Object.keys(correctPairs)
        .sort()
        .map(
            (uppercase) =>
                `${uppercase} ↔ ${correctPairs[uppercase]}`
        )
        .join("  |  ");

    if (
        uppercaseLetters.length === 0 ||
        lowercaseLetters.length === 0
    ) {
        return (
            <div className="mulcl-error">
                Matching question data is missing.
            </div>
        );
    }

    return (
        <div className="mulcl-container">

            <div className="mulcl-instruction">
                <p>
                    {question.questionText ??
                        question.QuestionText ??
                        "Match each uppercase letter with its lowercase letter."}
                </p>
            </div>

            <div className="mulcl-progress">
                <span>Matching pairs</span>
                <strong>{matchedCount} / {pairCount}</strong>
            </div>

            <div className="mulcl-columns">

                {/* Uppercase column */}
                <div className="mulcl-column">
                    <h4 className="mulcl-column-title">
                        Uppercase
                    </h4>

                    {uppercaseLetters.map((letter, index) => {
                        const matched = userPairs[letter];
                        const isSelected =
                            selectedUppercase === letter;

                        const pairIsCorrect =
                            isAnswerChecked &&
                            matched !== undefined &&
                            correctPairs[letter] === matched;

                        const pairIsIncorrect =
                            isAnswerChecked &&
                            matched !== undefined &&
                            correctPairs[letter] !== matched;

                        return (
                            <button
                                key={`${letter}-${index}`}
                                type="button"
                                disabled={isAnswerChecked}
                                onClick={() =>
                                    handleUppercaseSelect(letter)
                                }
                                className={`mulcl-letter ${
                                    isSelected
                                        ? "mulcl-letter-selected"
                                        : ""
                                } ${
                                    pairIsCorrect
                                        ? "mulcl-letter-correct"
                                        : ""
                                } ${
                                    pairIsIncorrect
                                        ? "mulcl-letter-incorrect"
                                        : ""
                                }`}
                            >
                                <span>{letter}</span>

                                {matched && (
                                    <small>
                                        Matched with {matched}
                                    </small>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Lowercase column */}
                <div className="mulcl-column">
                    <h4 className="mulcl-column-title">
                        Lowercase
                    </h4>

                    {lowercaseLetters.map((letter, index) => {
                        const matchedUppercase =
                            Object.keys(userPairs).find(
                                (uppercase) =>
                                    userPairs[uppercase] ===
                                    letter.toLowerCase()
                            );

                        const pairIsCorrect =
                            isAnswerChecked &&
                            matchedUppercase !== undefined &&
                            correctPairs[matchedUppercase] ===
                                letter.toLowerCase();

                        const pairIsIncorrect =
                            isAnswerChecked &&
                            matchedUppercase !== undefined &&
                            correctPairs[matchedUppercase] !==
                                letter.toLowerCase();

                        return (
                            <button
                                key={`${letter}-${index}`}
                                type="button"
                                disabled={isAnswerChecked}
                                onClick={() =>
                                    handleLowercaseSelect(letter)
                                }
                                className={`mulcl-letter ${
                                    matchedUppercase
                                        ? "mulcl-letter-matched"
                                        : ""
                                } ${
                                    pairIsCorrect
                                        ? "mulcl-letter-correct"
                                        : ""
                                } ${
                                    pairIsIncorrect
                                        ? "mulcl-letter-incorrect"
                                        : ""
                                }`}
                            >
                                <span>{letter}</span>

                                {matchedUppercase && (
                                    <small>
                                        Matched with {matchedUppercase}
                                    </small>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mulcl-hint">
                {isAnswerChecked
                    ? "Your matching answers have been checked."
                    : selectedUppercase
                        ? `Now select the lowercase letter for ${selectedUppercase}.`
                        : "Select an uppercase letter, then its lowercase pair."}
            </div>

            {isAnswerChecked && (
                <div className="mulcl-feedback">
                    {isCorrect ? (
                        <div className="mulcl-feedback-correct">
                            Excellent! All pairs are correct.
                        </div>
                    ) : (
                        <div className="mulcl-feedback-incorrect">
                            Some pairs are incorrect. Check the correct pairs below.
                        </div>
                    )}

                    <AnswerBox answer={formattedCorrectAnswer} />
                </div>
            )}

        </div>
    );
};

export default MatchUpperLowerCaseLetters;