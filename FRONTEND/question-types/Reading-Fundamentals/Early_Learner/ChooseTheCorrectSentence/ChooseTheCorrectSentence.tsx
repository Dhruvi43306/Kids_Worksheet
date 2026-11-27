
"use client";

import React, { useMemo, useState, useEffect } from "react";
import "@/styles/worksheet.css";

import {
    parseSimpleSentencesData,
    getSimpleSentenceAnswers,
    simpleSentenceAnswerMatches,
    SimpleSentenceAnswerBox,
    SimpleSentencesProps
} from "@/app/components/Worksheet/Reading/SimpleSentencesQuestionHelpers";

const ChooseTheCorrectSentence: React.FC<SimpleSentencesProps> = ({
    question, userAnswer, value, correctAnswers,
    showAnswers = false, showAnswer = false, onAnswerChange
}) => {
    const raw = question.questionDataJson ?? question.QuestionDataJson;
    const data = useMemo(() => parseSimpleSentencesData(raw), [raw]);
    const [selected, setSelected] = useState(userAnswer ?? value ?? "");
    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getSimpleSentenceAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    useEffect(() => {
        setSelected(userAnswer ?? value ?? "");
    }, [raw, question.questionNumber, question.QuestionNumber]);

    const choose = (option: string) => {
        if (checked) return;
        setSelected(option);
        onAnswerChange?.(option);
    };

    const correct = simpleSentenceAnswerMatches(selected, answers);

    return (
        <div className="ccs-sentence-container">
            <div className="ccs-sentence-picture">
                <span>{data.picture ?? "🖼️"}</span>
                <p>{data.pictureDescription ?? "Look at the picture carefully."}</p>
            </div>

            <h3 className="ccs-sentence-instruction">
                {question.questionText ?? question.QuestionText ??
                    "Choose the sentence that matches the picture."}
            </h3>

            <div className="ccs-sentence-options">
                {(data.options ?? []).map((option, index) => (
                    <button
                        type="button"
                        key={`${option}-${index}`}
                        disabled={checked}
                        onClick={() => choose(option)}
                        className={`ccs-sentence-option ${
                            selected === option ? "ccs-sentence-selected" : ""
                        }`}
                    >
                        <span>{String.fromCharCode(65 + index)}.</span>
                        {option}
                    </button>
                ))}
            </div>

            {checked && (
                <div className={correct ? "ccs-sentence-correct" : "ccs-sentence-wrong"}>
                    {correct ? "Well done! That sentence is correct." : "That is not the correct sentence."}
                    <SimpleSentenceAnswerBox answer={answers[0] ?? ""} />
                </div>
            )}
        </div>
    );
};

export default ChooseTheCorrectSentence;
