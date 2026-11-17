import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { QuestionData } from "@/app/worksheet/type";

export function parseQuestionData(json?: string | null): QuestionData {
  if (!json) {
    return {};
  }

  try {
    const parsed = JSON.parse(json);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as QuestionData;
  } catch (error) {
    console.error("Invalid questionDataJson:", json, error);
    return {};
  }
}

export function parseCorrectAnswers(answer?: string | null): string[] {
  if (answer === null || answer === undefined || answer === "") {
    return [];
  }

  const normalized = String(answer).trim();

  if (!normalized) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(normalized);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim());
    }

    if (
      typeof parsed === "string" ||
      typeof parsed === "number" ||
      typeof parsed === "boolean"
    ) {
      return [String(parsed).trim()];
    }
  } catch {
    return [normalized];
  }

  return [normalized];
}

export function answerMatches(
  value: string | number,
  correctAnswers: string[],
): boolean {
  const normalizedValue = String(value).trim().toLowerCase();

  return correctAnswers.some(
    (answer) => String(answer).trim().toLowerCase() === normalizedValue,
  );
}

export function AnswerBox({ answer }: { answer: string }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      className="generated-question__answer-box"
    >
      <Sparkles size={16} />

      <span>Correct Answer: {answer}</span>
    </motion.div>
  );
}

export function VisualDisplay({
  visualType,
  icons,
}: {
  visualType?: string;
  icons: string[];
}) {
  if (!icons.length) {
    return null;
  }

  return (
    <div className="generated-question__visual-display">
      {icons.map((icon, index) => (
        <span key={index} title={visualType}>
          {icon}
        </span>
      ))}
    </div>
  );
}
