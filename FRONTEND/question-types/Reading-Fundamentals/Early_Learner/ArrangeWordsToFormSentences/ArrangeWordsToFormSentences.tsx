
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

import {
    parseSimpleSentencesData,
    getSimpleSentenceAnswers,
    simpleSentenceAnswerMatches,
    SimpleSentenceAnswerBox,
    SimpleSentencesProps
} from "@/app/components/Worksheet/Reading/SimpleSentencesQuestionHelpers";

const ArrangeWordsToFormSentences: React.FC<SimpleSentencesProps> = ({
    question, userAnswer, value, correctAnswers,
    showAnswers = false, showAnswer = false, onAnswerChange
}) => {
    const raw = question.questionDataJson ?? question.QuestionDataJson;
    const data = useMemo(() => parseSimpleSentencesData(raw), [raw]);
    const words = data.scrambledWords ?? [];

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getSimpleSentenceAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    const correctAnswer = answers[0] ?? "";

    const displayedAnswer = selectedIndexes
        .map(index => words[index])
        .join(" ");

    const correct = simpleSentenceAnswerMatches(displayedAnswer, answers);

    useEffect(() => {
        setSelectedIndexes([]);
    }, [raw, question.questionNumber, question.QuestionNumber]);

    const selectWord = (index: number) => {
        if (checked || selectedIndexes.includes(index)) return;

        const next = [...selectedIndexes, index];
        setSelectedIndexes(next);

        onAnswerChange?.(next.map(i => words[i]).join(" "));
    };

    const removeWord = (position: number) => {
        if (checked) return;

        const next = selectedIndexes.filter((_, i) => i !== position);
        setSelectedIndexes(next);

        onAnswerChange?.(next.map(i => words[i]).join(" "));
    };

    const clearAnswer = () => {
        if (checked) return;

        setSelectedIndexes([]);
        onAnswerChange?.("");
    };

    if (!words.length) {
        return (
            <div className="awfs-error">
                Scrambled words are missing from the backend.
            </div>
        );
    }

    return (
        <div className="awfs-container">
            <div className="awfs-picture">
                <span>{data.picture ?? "🧩"}</span>
                <p>{data.pictureDescription}</p>
            </div>

            <h3 className="awfs-instruction">
                {question.questionText ?? question.QuestionText ??
                    "Arrange the words to form a meaningful sentence."}
            </h3>

            <div className="awfs-answer-area">
                {selectedIndexes.length === 0 ? (
                    <span className="awfs-placeholder">Tap words below to build your sentence</span>
                ) : (
                    selectedIndexes.map((wordIndex, position) => (
                        <button
                            key={`${wordIndex}-${position}`}
                            type="button"
                            disabled={checked}
                            className="awfs-answer-word"
                            onClick={() => removeWord(position)}
                        >
                            {words[wordIndex]}
                        </button>
                    ))
                )}
            </div>

            <div className="awfs-word-bank">
                {words.map((word, index) => (
                    <button
                        key={`${word}-${index}`}
                        type="button"
                        disabled={checked || selectedIndexes.includes(index)}
                        onClick={() => selectWord(index)}
                        className={`awfs-word ${
                            selectedIndexes.includes(index) ? "awfs-used" : ""
                        }`}
                    >
                        {word}
                    </button>
                ))}
            </div>

            {!checked && selectedIndexes.length > 0 && (
                <button
                    type="button"
                    className="awfs-clear"
                    onClick={clearAnswer}
                >
                    Clear sentence
                </button>
            )}

            {checked && (
                <div className={correct ? "awfs-correct" : "awfs-wrong"}>
                    {correct ? "Wonderful! You formed the sentence correctly." : "The word order is not correct."}
                    <SimpleSentenceAnswerBox answer={correctAnswer} />
                </div>
            )}
        </div>
    );
};

export default ArrangeWordsToFormSentences;
