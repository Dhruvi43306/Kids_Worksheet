"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Volume2, Sparkles } from "lucide-react";
import "@/styles/worksheet.css";

// ============================================
// AUDIO PLAYER
// ============================================

let currentPhonicsAudio: HTMLAudioElement | null = null;

async function playPhonicsAudio(
    audioUrl?: string | null
): Promise<void> {

    if (typeof window === "undefined") return;

    if (!audioUrl?.trim()) {
        console.error("Phonics audio URL is missing.");
        return;
    }

    try {
        // Stop previously playing audio.
        if (currentPhonicsAudio) {
            currentPhonicsAudio.pause();
            currentPhonicsAudio.currentTime = 0;
            currentPhonicsAudio = null;
        }

        const resolvedUrl = new URL(
            audioUrl.trim(),
            window.location.origin
        ).href;

        const audio = new Audio(resolvedUrl);

        audio.preload = "auto";
        audio.volume = 1;

        currentPhonicsAudio = audio;

        audio.addEventListener("ended", () => {
            if (currentPhonicsAudio === audio) {
                currentPhonicsAudio = null;
            }
        });

        audio.addEventListener("error", () => {
            console.error(
                "Unable to load phonics audio:",
                resolvedUrl,
                audio.error?.message
            );
        });

        await audio.play();

    } catch (error) {
        console.error(
            "Unable to play phonics audio:",
            audioUrl,
            error
        );

        currentPhonicsAudio = null;
    }
}

// ============================================
// NORMALIZE AUDIO URL
// ============================================

function normalizeAudioUrl(audioUrl: string): string {

    let url = audioUrl.trim();

    // Remove accidental public/ prefix.
    url = url.replace(/^\/?public\//i, "/");

    // Add leading slash for relative paths.
    if (
        !url.startsWith("/") &&
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        url = `/${url}`;
    }

    return url;
}

// ============================================
// NORMALIZE SOUND KEY
// ============================================

function normalizeSoundKey(sound: string): string {

    return sound
        .trim()
        .replace(/^\/+|\/+$/g, "")
        .toLowerCase();
}

// ============================================
// GET SOUND AUDIO URL
// ============================================

function getPhonicsSoundAudioUrl(
    sound: string | undefined,
    soundAudioUrls?: Record<string, string>
): string | undefined {

    if (!sound?.trim()) {
        return undefined;
    }

    const soundKey = normalizeSoundKey(sound);

    // First find the URL provided by the backend.
    // Supports keys such as /sh/, sh and /SH/.
    const matchingEntry = Object.entries(
        soundAudioUrls ?? {}
    ).find(
        ([key]) => normalizeSoundKey(key) === soundKey
    );

    const backendAudioUrl = matchingEntry?.[1]?.trim();

    if (backendAudioUrl) {
        return normalizeAudioUrl(backendAudioUrl);
    }

    // Fallback: generate audio URL automatically.
    // Example: /sh/ -> sh.mp3
    return `/audio/phonics/sounds/${encodeURIComponent(soundKey)}.mp3`;
}

// ============================================
// QUESTION DATA INTERFACE
// ============================================

interface MatchSoundsData {
    questionType?: string;
    letters?: string[];
    sounds?: string[];
    pairCount?: number;
    soundAudioUrls?: Record<string, string>;
    selectionMode?: string;
    answerType?: string;
}

interface Question {
    questionDataJson?: string | MatchSoundsData;
    QuestionDataJson?: string | MatchSoundsData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

interface Props {
    question: Question;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

type PairMap = Record<string, string>;

// ============================================
// PARSE QUESTION DATA
// ============================================

function parseData(
    raw?: string | MatchSoundsData
): MatchSoundsData {

    if (!raw) return {};

    if (typeof raw === "object") return raw;

    try {
        return JSON.parse(raw) as MatchSoundsData;
    } catch (error) {
        console.error(
            "Invalid letter-sound matching data:",
            error
        );

        return {};
    }
}

// ============================================
// PARSE PAIR MAP
// ============================================

function parsePairMap(answer?: string | null): PairMap {

    const pairs: PairMap = {};

    if (!answer) return pairs;

    answer.split("|").forEach(pair => {

        const separatorIndex = pair.indexOf(":");

        if (separatorIndex < 0) return;

        const letter = pair
            .slice(0, separatorIndex)
            .trim()
            .toUpperCase();

        const sound = pair
            .slice(separatorIndex + 1)
            .trim()
            .toLowerCase();

        if (letter && sound) {
            pairs[letter] = sound;
        }
    });

    return pairs;
}

// ============================================
// SERIALIZE PAIR MAP
// ============================================

function serializePairMap(pairs: PairMap): string {

    return Object.keys(pairs)
        .sort()
        .map(letter => `${letter}:${pairs[letter]}`)
        .join("|");
}

// ============================================
// ANSWER BOX
// ============================================

function AnswerBox({ answer }: { answer: string }) {

    const formatted = Object.entries(parsePairMap(answer))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, sound]) => `${letter} ↔ ${sound}`)
        .join("  |  ");

    return (
        <div className="generated-question__answer-box">
            <Sparkles size={16} />

            <span>
                Correct Answer: {formatted || answer}
            </span>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

const MatchLettersWithSounds: React.FC<Props> = ({
    question,
    userAnswer,
    value,
    correctAnswers,
    showAnswers = false,
    showAnswer = false,
    onAnswerChange,
}) => {

    const [internalAnswer, setInternalAnswer] = useState("");

    const [selectedLetter, setSelectedLetter] =
        useState<string | null>(null);

    // Read backend JSON.
    const rawData =
        question.questionDataJson ??
        question.QuestionDataJson;

    const data = useMemo(
        () => parseData(rawData),
        [rawData]
    );

    const letters = data.letters ?? [];

    const sounds = data.sounds ?? [];

    const pairCount = data.pairCount ?? letters.length;

    const isControlled =
        userAnswer !== undefined ||
        value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const checked = showAnswers || showAnswer;

    const correctAnswer =
        correctAnswers?.[0] ??
        question.correctAnswer ??
        question.CorrectAnswer ??
        "";

    // ============================================
    // USER AND CORRECT PAIRS
    // ============================================

    const userPairs = useMemo(
        () => parsePairMap(selectedAnswer),
        [selectedAnswer]
    );

    const correctPairs = useMemo(
        () => parsePairMap(correctAnswer),
        [correctAnswer]
    );

    // ============================================
    // RESET WHEN QUESTION CHANGES
    // ============================================

    useEffect(() => {

        setSelectedLetter(null);

        if (!isControlled) {
            setInternalAnswer("");
        }

    }, [
        rawData,
        question.questionText,
        question.QuestionText,
        question.questionNumber,
        question.QuestionNumber,
        isControlled,
    ]);

    // ============================================
    // UPDATE ANSWER
    // ============================================

    const updatePairs = (nextPairs: PairMap) => {

        const answer = serializePairMap(nextPairs);

        if (!isControlled) {
            setInternalAnswer(answer);
        }

        onAnswerChange?.(answer);
    };

    // ============================================
    // SELECT LETTER
    // ============================================

    const selectLetter = (letter: string) => {

        if (checked) return;

        setSelectedLetter(letter);
    };

    // ============================================
    // SELECT SOUND AND MATCH
    // ============================================

    const selectSound = (sound: string) => {

        if (checked || !selectedLetter) return;

        const nextPairs = { ...userPairs };

        // Prevent the same sound from being assigned twice.
        Object.keys(nextPairs).forEach(letter => {

            if (
                nextPairs[letter] === sound.toLowerCase()
            ) {
                delete nextPairs[letter];
            }
        });

        // Add the selected matching pair.
        nextPairs[selectedLetter] = sound.toLowerCase();

        updatePairs(nextPairs);

        setSelectedLetter(null);
    };

    // ============================================
    // CHECK ANSWERS
    // ============================================

    const matchedCount = Object.keys(userPairs).length;

    const isCorrect =
        matchedCount === pairCount &&
        Object.keys(correctPairs).length === pairCount &&
        Object.keys(correctPairs).every(
            letter =>
                userPairs[letter] === correctPairs[letter]
        );

    // ============================================
    // INVALID QUESTION DATA
    // ============================================

    if (!letters.length || !sounds.length) {
        return (
            <div className="mlws-error">
                Letter-sound matching data is missing.
            </div>
        );
    }

    // ============================================
    // FRONTEND UI
    // ============================================

    return (
        <div className="mlws-container">

            {/* Instruction */}
            <div className="mlws-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Match each letter or letter group with its correct sound."}
            </div>

            {/* Matching progress */}
            <div className="mlws-progress">
                <span>Matching pairs</span>

                <strong>
                    {matchedCount} / {pairCount}
                </strong>
            </div>

            {/* Two columns */}
            <div className="mlws-columns">

                {/* =================================
                    LETTER COLUMN
                ================================= */}

                <div className="mlws-column">

                    <h4>Letters</h4>

                    {letters.map((letter, index) => {

                        const matchedSound = userPairs[letter];

                        const selected =
                            selectedLetter === letter;

                        const correct =
                            checked &&
                            matchedSound !== undefined &&
                            correctPairs[letter] === matchedSound;

                        const incorrect =
                            checked &&
                            matchedSound !== undefined &&
                            correctPairs[letter] !== matchedSound;

                        return (
                            <button
                                key={`${letter}-${index}`}
                                type="button"
                                disabled={checked}
                                onClick={() => selectLetter(letter)}
                                className={`mlws-letter-card ${
                                    selected
                                        ? "mlws-letter-selected"
                                        : ""
                                } ${
                                    correct
                                        ? "mlws-correct"
                                        : ""
                                } ${
                                    incorrect
                                        ? "mlws-incorrect"
                                        : ""
                                }`}
                            >
                                <span>{letter}</span>

                                {matchedSound && (
                                    <small>
                                        Matched with {matchedSound}
                                    </small>
                                )}
                            </button>
                        );
                    })}

                </div>

                {/* =================================
                    SOUND COLUMN
                ================================= */}

                <div className="mlws-column">

                    <h4>Sounds</h4>

                    {sounds.map((sound, index) => {

                        const matchedLetter = Object.keys(userPairs).find(
                            letter =>
                                userPairs[letter] === sound.toLowerCase()
                        );

                        const correct =
                            checked &&
                            matchedLetter !== undefined &&
                            correctPairs[matchedLetter] === sound.toLowerCase();

                        const incorrect =
                            checked &&
                            matchedLetter !== undefined &&
                            correctPairs[matchedLetter] !== sound.toLowerCase();

                        // Generate the sound audio URL.
                        const soundAudioUrl =
                            getPhonicsSoundAudioUrl(
                                sound,
                                data.soundAudioUrls
                            );

                        return (
                            <div
                                className="mlws-sound-row"
                                key={`${sound}-${index}`}
                            >

                                {/* Select sound */}
                                <button
                                    type="button"
                                    disabled={checked}
                                    onClick={() => selectSound(sound)}
                                    className={`mlws-sound-card ${
                                        matchedLetter
                                            ? "mlws-sound-matched"
                                            : ""
                                    } ${
                                        correct
                                            ? "mlws-correct"
                                            : ""
                                    } ${
                                        incorrect
                                            ? "mlws-incorrect"
                                            : ""
                                    }`}
                                >
                                    <span>{sound}</span>

                                    {matchedLetter && (
                                        <small>
                                            Matched with {matchedLetter}
                                        </small>
                                    )}
                                </button>

                                {/* Play sound */}
                                <button
                                    type="button"
                                    className="mlws-audio-button"
                                    onClick={() =>
                                        void playPhonicsAudio(
                                            soundAudioUrl
                                        )
                                    }
                                    title={`Listen to ${sound}`}
                                    aria-label={`Play ${sound}`}
                                >
                                    <Volume2 size={19} />
                                </button>

                            </div>
                        );
                    })}

                </div>

            </div>

            {/* Matching instruction */}
            <div className="mlws-hint">
                {checked
                    ? "Your matching answers have been checked."
                    : selectedLetter
                        ? `Now choose the sound for ${selectedLetter}. You can listen before selecting it.`
                        : "Select a letter first, then choose its matching sound."}
            </div>

            {/* Answer feedback */}
            {checked && correctAnswer && (
                <div className="mlws-feedback">

                    <div className={
                        isCorrect
                            ? "mlws-feedback-correct"
                            : "mlws-feedback-incorrect"
                    }>
                        {isCorrect
                            ? "Excellent! All letter-sound pairs are correct."
                            : "Some matches are incorrect. Check the correct pairs below."}
                    </div>

                    <AnswerBox answer={correctAnswer} />

                </div>
            )}

            {/* Missing correct answer */}
            {checked && !correctAnswer && (
                <div className="mlws-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default MatchLettersWithSounds;