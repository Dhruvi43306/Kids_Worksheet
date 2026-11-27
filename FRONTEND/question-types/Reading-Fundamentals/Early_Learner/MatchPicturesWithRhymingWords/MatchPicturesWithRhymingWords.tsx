
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

const MatchPicturesWithRhymingWords: React.FC<RhymingWordsProps> = ({
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

    if (!data.picture || !data.options?.length) {
        return (
            <div className="mprw-error">
                Picture rhyming words question data is missing.
            </div>
        );
    }

    return (
        <div className="mprw-container">
            <div className="mprw-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Look at the picture and choose a word that rhymes with it."}
            </div>

            <div className="mprw-picture-card">
                <span className="mprw-picture">
                    {data.picture}
                </span>

                <strong className="mprw-picture-description">
                    {data.pictureDescription ?? "Look at this picture"}
                </strong>

                {/* <span className="mprw-picture-hint">
                    Find a word with the same ending sound.
                </span> */}
            </div>

            <div className="mprw-options-section">
                {/* <h4>Which word rhymes with the picture?</h4> */}

                <div className="mprw-options-grid">
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
                                className={`mprw-option ${
                                    selected && !checked ? "mprw-selected" : ""
                                } ${
                                    correct ? "mprw-correct" : ""
                                } ${
                                    incorrect ? "mprw-incorrect" : ""
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
                <div className="mprw-feedback">
                    <p className={
                        isCorrect
                            ? "mprw-feedback-correct"
                            : "mprw-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Amazing! You found the rhyming word."
                                : "Try again next time! Listen to the ending sound."
                            : "You have not selected an answer."}
                    </p>

                    <RhymingWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="mprw-error">
                    Correct answer is missing from the backend response.
                </div>
            )}
        </div>
    );
};

export default MatchPicturesWithRhymingWords;
