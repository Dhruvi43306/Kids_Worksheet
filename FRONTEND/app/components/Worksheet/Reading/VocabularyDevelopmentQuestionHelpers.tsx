
"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface VocabularyData {
    questionType?: string;
    targetWord?: string;
    picture?: string;
    pictureDescription?: string;
    pictureType?: string;
    options?: string[];
    scrambledLetters?: string[];
    letterCount?: number;
    pattern?: string;
    missingIndexes?: number[];
    selectionMode?: string;
    answerType?: string;
    difficultyLevel?: number;
}

export interface VocabularyQuestion {
    questionDataJson?: string | VocabularyData;
    QuestionDataJson?: string | VocabularyData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

export interface VocabularyProps {
    question: VocabularyQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

export function parseVocabularyData(
    raw?: string | VocabularyData
): VocabularyData {
    if (!raw) return {};

    if (typeof raw === "object") return raw;

    try {
        const parsed: unknown = JSON.parse(raw);

        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) return {};

        return parsed as VocabularyData;
    } catch (error) {
        console.error("Invalid vocabulary question data:", error);
        return {};
    }
}

export function getVocabularyAnswers(
    propAnswers: string[] | undefined,
    question: VocabularyQuestion
): string[] {
    if (propAnswers?.length) {
        return propAnswers.map(x => String(x).trim());
    }

    const answer =
        question.correctAnswer ??
        question.CorrectAnswer ??
        "";

    if (!answer.trim()) return [];

    try {
        const parsed: unknown = JSON.parse(answer);

        if (Array.isArray(parsed)) {
            return parsed.map(x => String(x).trim());
        }

        return [String(parsed).trim()];
    } catch {
        return [answer.trim()];
    }
}

export function vocabularyAnswerMatches(
    selected: string,
    answers: string[]
): boolean {
    return answers.some(
        answer => answer.trim().toLowerCase() ===
            selected.trim().toLowerCase()
    );
}

export function VocabularyAnswerBox({
    answer
}: {
    answer: string;
}) {
    return (
        <div className="generated-question__answer-box">
            <Sparkles size={16} />
            <span>Correct Answer: {answer}</span>
        </div>
    );
}
