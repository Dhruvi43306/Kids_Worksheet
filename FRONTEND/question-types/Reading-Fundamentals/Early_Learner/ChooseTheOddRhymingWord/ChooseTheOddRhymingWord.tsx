
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";


import {
    parseRhymingWordsData,
    getRhymingWordAnswers,
    rhymingWordAnswerMatches,
    RhymingWordAnswerBox,
    RhymingWordsProps
} from "@/app/components/Worksheet/Reading/RhymingWordsQuestionHelpers";

const ChooseTheOddRhymingWord: React.FC<RhymingWordsProps> = ({
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
        () => parseRhymingWordsData(rawData),
        [rawData]
    );

    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getRhymingWordAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    const correctAnswer = answers[0] ?? "";

    useEffect(() => {
        if (!isControlled) setInternalAnswer("");
    }, [
        rawData,
        question.questionNumber,
        question.QuestionNumber,
        isControlled
    ]);

    const selectOption = (option: string) => {
        if (checked) return;

        if (!isControlled) setInternalAnswer(option);

        onAnswerChange?.(option);
    };

    const isCorrect =
        selectedAnswer !== "" &&
        rhymingWordAnswerMatches(selectedAnswer, answers);

    if (!data.options?.length) {
        return (
            <div className="corw-error">
                Odd rhyming word question data is missing.
            </div>
        );
    }

    return (
        <div className="corw-container">
            <div className="corw-heading">
                <span className="corw-heading-icon">🎵</span>
                {/* <h3>Find the odd word!</h3> */}
                <p>
                    {question.questionText ??
                        question.QuestionText ??
                        "Three words rhyme. One word is different. Find it!"}
                </p>
            </div>

            <div className="corw-options-grid">
                {data.options.map((option, index) => {
                    const selected = selectedAnswer === option;
                    const correct = checked &&
                        rhymingWordAnswerMatches(option, answers);
                    const incorrect = checked && selected && !correct;

                    return (
                        <button
                            key={`${option}-${index}`}
                            type="button"
                            disabled={checked}
                            onClick={() => selectOption(option)}
                            className={`corw-option ${
                                selected && !checked ? "corw-selected" : ""
                            } ${
                                correct ? "corw-correct" : ""
                            } ${
                                incorrect ? "corw-incorrect" : ""
                            }`}
                        >
                            <span className="corw-option-number">
                                {index + 1}
                            </span>
                            <strong>{option}</strong>
                            {correct && <span className="corw-result">✓</span>}
                            {incorrect && <span className="corw-result">✕</span>}
                        </button>
                    );
                })}
            </div>

            {checked && answers.length > 0 && (
                <div className="corw-feedback">
                    <p className={
                        isCorrect
                            ? "corw-feedback-correct"
                            : "corw-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Great job! You found the odd word!"
                                : "Keep practising! Look for the word with a different sound."
                            : "You have not selected an answer."}
                    </p>

                    <RhymingWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="corw-error">
                    Correct answer is missing from the backend response.
                </div>
            )}
        </div>
    );
};

export default ChooseTheOddRhymingWord;
