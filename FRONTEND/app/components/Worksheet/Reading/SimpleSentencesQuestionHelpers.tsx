
import React from "react";

export interface SimpleSentencesData {
    questionType?: string;
    sentence?: string;
    comprehensionQuestion?: string;
    sentencePattern?: string;
    missingWordIndex?: number;
    picture?: string;
    pictureDescription?: string;
    options?: string[];
    scrambledWords?: string[];
    wordCount?: number;
    selectionMode?: string;
    answerType?: string;
    difficultyLevel?: number;
}

export interface SimpleSentencesQuestion {
    questionText?: string;
    QuestionText?: string;
    questionDataJson?: string | SimpleSentencesData;
    QuestionDataJson?: string | SimpleSentencesData;
    correctAnswer?: string;
    CorrectAnswer?: string;
    questionNumber?: number;
    QuestionNumber?: number;
}

export interface SimpleSentencesProps {
    question: SimpleSentencesQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

export const parseSimpleSentencesData = (
    raw: string | SimpleSentencesData | undefined
): SimpleSentencesData => {
    if (!raw) return {};

    if (typeof raw === "object") return raw;

    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
};

export const getSimpleSentenceAnswers = (
    propAnswers: string[] | undefined,
    question: SimpleSentencesQuestion
): string[] => {
    if (propAnswers?.length) return propAnswers;

    const answer = question.correctAnswer ?? question.CorrectAnswer;

    return answer ? [answer] : [];
};

export const simpleSentenceAnswerMatches = (
    selected: string,
    answers: string[]
): boolean => {
    const normalize = (value: string) =>
        value.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").toLowerCase();

    return answers.some(answer => normalize(answer) === normalize(selected));
};

export const SimpleSentenceAnswerBox: React.FC<{ answer: string }> = ({
    answer
}) => (
    <div className="generated-question__answer-box">
        <strong>Correct answer:</strong> {answer}
    </div>
);
