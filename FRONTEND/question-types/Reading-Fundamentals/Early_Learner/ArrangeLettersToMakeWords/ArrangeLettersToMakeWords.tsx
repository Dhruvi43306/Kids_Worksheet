
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

import {
    parseVocabularyData,
    getVocabularyAnswers,
    vocabularyAnswerMatches,
    VocabularyAnswerBox,
    VocabularyProps
} from "@/app/components/Worksheet/Reading/VocabularyDevelopmentQuestionHelpers";

const ArrangeLettersToMakeWords: React.FC<VocabularyProps> = ({
    question,
    userAnswer,
    value,
    correctAnswers,
    showAnswers = false,
    showAnswer = false,
    onAnswerChange
}) => {
    const [internalLetters, setInternalLetters] = useState<number[]>([]);

    const rawData = question.questionDataJson ?? question.QuestionDataJson;

    const data = useMemo(
        () => parseVocabularyData(rawData),
        [rawData]
    );

    const letters = data.scrambledLetters ?? [];
    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getVocabularyAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    const correctAnswer = answers[0] ?? "";

    // Always display the locally selected letters.
    const displayedAnswer = internalLetters
        .map(index => letters[index])
        .join("");

    const isCorrect =
        displayedAnswer !== "" &&
        vocabularyAnswerMatches(displayedAnswer, answers);

    // Reset the selected letters when a new question is loaded.
    useEffect(() => {
        setInternalLetters([]);
    }, [rawData, question.questionNumber, question.QuestionNumber]);

    // Select a letter from the letter bank.
    const selectLetter = (index: number) => {
        if (checked || internalLetters.includes(index)) return;

        const next = [...internalLetters, index];

        setInternalLetters(next);

        const answer = next
            .map(letterIndex => letters[letterIndex])
            .join("");

        onAnswerChange?.(answer);
    };

    // Remove a selected letter from the answer.
    const removeLetter = (position: number) => {
        if (checked) return;

        const next = internalLetters.filter(
            (_, index) => index !== position
        );

        setInternalLetters(next);

        const answer = next
            .map(letterIndex => letters[letterIndex])
            .join("");

        onAnswerChange?.(answer);
    };

    // Clear the complete answer.
    const clearAnswer = () => {
        if (checked) return;

        setInternalLetters([]);
        onAnswerChange?.("");
    };

    if (!letters.length) {
        return (
            <div className="almw-error">
                Scrambled letters are missing from the backend.
            </div>
        );
    }

    return (
        <div className="almw-container">

            <div className="almw-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Arrange the letters to make a meaningful word."}
            </div>

            <div className="almw-picture-card">
                <span>{data.picture ?? "🧩"}</span>
            </div>

            {/* Answer area */}
            <div className="almw-answer-slots">

                {internalLetters.length === 0 ? (
                    <span className="almw-placeholder">
                        Tap letters below
                    </span>
                ) : (
                    internalLetters.map((letterIndex, position) => (
                        <button
                            key={`${letterIndex}-${position}`}
                            type="button"
                            disabled={checked}
                            className="almw-answer-letter"
                            onClick={() => removeLetter(position)}
                        >
                            {letters[letterIndex]}
                        </button>
                    ))
                )}

            </div>

            {/* Available letters */}
            <div className="almw-letter-bank">

                {letters.map((letter, index) => (
                    <button
                        key={`${letter}-${index}`}
                        type="button"
                        disabled={
                            checked ||
                            internalLetters.includes(index)
                        }
                        onClick={() => selectLetter(index)}
                        className={`almw-letter ${
                            internalLetters.includes(index)
                                ? "almw-used"
                                : ""
                        }`}
                    >
                        {letter}
                    </button>
                ))}

            </div>

            {/* Clear answer */}
            {!checked && internalLetters.length > 0 && (
                <button
                    type="button"
                    className="almw-clear"
                    onClick={clearAnswer}
                >
                    Clear answer
                </button>
            )}

            {/* Check answer feedback */}
            {checked && answers.length > 0 && (
                <div className="almw-feedback">

                    <p className={isCorrect ? "almw-good" : "almw-bad"}>
                        {displayedAnswer
                            ? isCorrect
                                ? "Excellent! You arranged the letters correctly."
                                : "Not quite! Check the letter order."
                            : "You have not arranged the letters."}
                    </p>

                    <VocabularyAnswerBox answer={correctAnswer} />

                </div>
            )}

            {checked && !answers.length && (
                <div className="almw-error">
                    Correct answer is missing from the backend.
                </div>
            )}

        </div>
    );
};

export default ArrangeLettersToMakeWords;
