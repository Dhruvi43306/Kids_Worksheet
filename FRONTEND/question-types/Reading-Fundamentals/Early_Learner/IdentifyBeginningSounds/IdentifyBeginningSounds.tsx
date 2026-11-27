"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Volume2, Sparkles } from "lucide-react";
import "@/styles/worksheet.css";

let currentPhonicsAudio: HTMLAudioElement | null = null;

// ============================================
// PLAY PHONICS AUDIO
// ============================================

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

    // Resolve relative URLs using the frontend domain.
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
    console.error("Unable to play phonics audio:", audioUrl, error);

    currentPhonicsAudio = null;
  }
}

// ============================================
// GET WORD AUDIO URL
// ============================================

function getPhonicsWordAudioUrl(
  targetWord: string | undefined,
  wordAudioUrl: string | undefined
): string | undefined {

  if (!targetWord?.trim()) {
    return undefined;
  }

  // First use the URL provided by the backend.
  const backendAudioUrl = wordAudioUrl?.trim();

  if (backendAudioUrl) {
    return normalizeAudioUrl(backendAudioUrl);
  }

  // Fallback: automatically generate URL from the word.
  const wordKey = targetWord
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `/audio/phonics/words/${encodeURIComponent(wordKey)}.mp3`;
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

  // First look for the sound URL from backend JSON.
  const matchingEntry = Object.entries(soundAudioUrls ?? {}).find(
    ([key]) =>
      normalizeSoundKey(key) === soundKey
  );

  const backendAudioUrl = matchingEntry?.[1]?.trim();

  if (backendAudioUrl) {
    return normalizeAudioUrl(backendAudioUrl);
  }

  // Fallback: construct sound audio path automatically.
  return `/audio/phonics/sounds/${encodeURIComponent(soundKey)}.mp3`;
}

// ============================================
// QUESTION DATA INTERFACE
// ============================================

interface BeginningSoundsData {
  questionType?: string;
  targetWord?: string;
  targetPosition?: string;
  wordAudioUrl?: string;
  options?: string[];
  soundAudioUrls?: Record<string, string>;
  selectionMode?: string;
  answerType?: string;
}

interface Question {
  questionDataJson?: string | BeginningSoundsData;
  QuestionDataJson?: string | BeginningSoundsData;
  questionText?: string;
  QuestionText?: string;
  correctAnswer?: string | null;
  CorrectAnswer?: string | null;
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

// ============================================
// PARSE QUESTION DATA
// ============================================

function parseData(
  raw?: string | BeginningSoundsData
): BeginningSoundsData {
  if (!raw) return {};

  if (typeof raw === "object") return raw;

  try {
    return JSON.parse(raw) as BeginningSoundsData;
  } catch (error) {
    console.error("Invalid beginning-sounds data:", error);
    return {};
  }
}

// ============================================
// PARSE CORRECT ANSWERS
// ============================================

function getAnswers(
  propAnswers: string[] | undefined,
  question: Question
): string[] {
  if (propAnswers?.length) {
    return propAnswers.map((x) => String(x).trim());
  }

  const answer =
    question.correctAnswer ??
    question.CorrectAnswer ??
    "";

  if (!answer) return [];

  try {
    const parsed: unknown = JSON.parse(answer);

    return Array.isArray(parsed)
      ? parsed.map((x) => String(x).trim())
      : [String(parsed).trim()];
  } catch {
    return [answer.trim()];
  }
}

// ============================================
// ANSWER BOX
// ============================================

function AnswerBox({ answer }: { answer: string }) {
  return (
    <div className="generated-question__answer-box">
      <Sparkles size={16} />
      <span>Correct Answer: {answer}</span>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

const IdentifyBeginningSounds: React.FC<Props> = ({
  question,
  userAnswer,
  value,
  correctAnswers,
  showAnswers = false,
  showAnswer = false,
  onAnswerChange,
}) => {
  const [internalAnswer, setInternalAnswer] = useState("");

  const rawData =
    question.questionDataJson ??
    question.QuestionDataJson;

  const data = useMemo(
    () => parseData(rawData),
    [rawData]
  );

  const isControlled =
    userAnswer !== undefined ||
    value !== undefined;

  const selectedAnswer =
    userAnswer ?? value ?? internalAnswer;

  const checked = showAnswers || showAnswer;

  const answers = useMemo(
    () => getAnswers(correctAnswers, question),
    [
      correctAnswers,
      question.correctAnswer,
      question.CorrectAnswer,
    ]
  );

  const correctAnswer = answers[0] ?? "";

  const options = data.options ?? [];

  // Reset answer when question changes.
  useEffect(() => {
    if (!isControlled) {
      setInternalAnswer("");
    }
  }, [
    rawData,
    question.questionText,
    question.QuestionText,
    isControlled,
  ]);

  // Select answer.
  const selectOption = (option: string) => {
    if (checked) return;

    if (!isControlled) {
      setInternalAnswer(option);
    }

    onAnswerChange?.(option);
  };

  // Compare correct answer.
  const matches = (option: string) =>
    answers.some(
      (answer) =>
        answer.trim().toLowerCase() ===
        option.trim().toLowerCase()
    );

  const isCorrect =
    selectedAnswer !== "" &&
    matches(selectedAnswer);

  // Word audio URL.
  const wordAudioUrl = getPhonicsWordAudioUrl(
    data.targetWord,
    data.wordAudioUrl
  );

  // ============================================
  // INVALID QUESTION DATA
  // ============================================

  if (!data.targetWord || !options.length) {
    return (
      <div className="ibs-error">
        Beginning-sounds question data is missing.
      </div>
    );
  }

  // ============================================
  // FRONTEND UI
  // ============================================

  return (
    <div className="ibs-container">

      {/* Instruction */}
      <div className="ibs-instruction">
        {question.questionText ??
          question.QuestionText ??
          "Listen to the word. Which sound do you hear at the beginning?"}
      </div>

      {/* Word audio section */}
      <div className="ibs-word-section">

        {/* <span className="ibs-label">
          Listen to the word
        </span> */}

        <div className="ibs-word-card">

          <span className="ibs-word">
            {data.targetWord}
          </span>

          <button
            type="button"
            className="ibs-audio-button"
            onClick={() =>
              void playPhonicsAudio(wordAudioUrl)
            }
            aria-label={`Listen to ${data.targetWord}`}
            title="Play word"
          >
            <Volume2 size={23} />
          </button>

        </div>

        {/* <span className="ibs-hint">
          Tap the speaker to hear the word again.
        </span> */}

      </div>

      {/* Answer options */}
      <div className="ibs-options-section">

        {/* <h4>
          Choose the beginning sound
        </h4> */}

        <div className="ibs-options-grid">

          {options.map((option, index) => {

            const selected =
              selectedAnswer === option;

            const correct =
              checked && matches(option);

            const incorrect =
              checked &&
              selected &&
              !matches(option);

            const soundAudioUrl =
              getPhonicsSoundAudioUrl(
                option,
                data.soundAudioUrls
              );

            return (
              <div
                className="ibs-option-row"
                key={`${option}-${index}`}
              >

                {/* Select answer */}
                <button
                  type="button"
                  disabled={checked}
                  onClick={() => selectOption(option)}
                  className={`ibs-option ${
                    selected && !checked
                      ? "ibs-selected"
                      : ""
                  } ${
                    correct
                      ? "ibs-correct"
                      : ""
                  } ${
                    incorrect
                      ? "ibs-incorrect"
                      : ""
                  }`}
                >
                  {option}

                  {correct && <span>✓</span>}

                  {incorrect && <span>✕</span>}
                </button>

                {/* Play individual sound */}
                <button
                  type="button"
                  className="ibs-option-audio"
                  onClick={() =>
                    void playPhonicsAudio(soundAudioUrl)
                  }
                  title={`Listen to ${option}`}
                  aria-label={`Play ${option}`}
                >
                  <Volume2 size={19} />
                </button>

              </div>
            );
          })}

        </div>

      </div>

      {/* Answer feedback */}
      {checked && answers.length > 0 && (
        <div className="ibs-feedback">

          <div
            className={
              isCorrect
                ? "ibs-feedback-correct"
                : "ibs-feedback-incorrect"
            }
          >
            {selectedAnswer
              ? isCorrect
                ? "Excellent! You identified the beginning sound."
                : "Not quite right. Listen again and check the answer."
              : "You have not selected an answer."}
          </div>

          <AnswerBox answer={correctAnswer} />

        </div>
      )}

      {/* Missing correct answer */}
      {checked && !answers.length && (
        <div className="ibs-error">
          Correct answer is missing from the backend response.
        </div>
      )}

    </div>
  );
};

export default IdentifyBeginningSounds;