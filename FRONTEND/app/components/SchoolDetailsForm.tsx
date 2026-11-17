"use client";
import { motion } from "framer-motion";
import type { SchoolDetails } from "@/lib/dummyData";
import "@/app/components/components.css";

interface Props {
  details: SchoolDetails;
  onChange: (updated: SchoolDetails) => void;
}

const FIELDS: {
  key: keyof SchoolDetails;
  label: string;
  placeholder: string;
  type?: string;
  half?: boolean;
}[] = [
  {
    key: "schoolName",
    label: "School Name",
    placeholder: "e.g. Sunrise International School",
    half: false,
  },
  {
    key: "studentName",
    label: "Student Name",
    placeholder: "e.g. Alex Johnson",
    half: false,
  },
  {
    key: "grade",
    label: "Grade / Level",
    placeholder: "e.g. Grade 2",
    half: true,
  },
  {
    key: "section",
    label: "Section / Class",
    placeholder: "e.g. Class B",
    half: true,
  },
  {
    key: "teacherName",
    label: "Teacher Name",
    placeholder: "e.g. Ms. Williams",
    half: true,
  },
  {
    key: "rollNumber",
    label: "Roll / Student No.",
    placeholder: "e.g. 12",
    half: true,
  },
  {
    key: "date",
    label: "Date",
    placeholder: "e.g. 18/08/2026",
    half: true,
    type: "date",
  },
  {
    key: "academicYear",
    label: "Academic Year",
    placeholder: "e.g. 2025–2026",
    half: true,
  },
];

export default function SchoolDetailsForm({ details, onChange }: Props) {
  const update = (key: keyof SchoolDetails, value: string) =>
    onChange({ ...details, [key]: value });

  return (
    <motion.div
      className="sdf"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="sdf__header">
        <span className="sdf__header-icon">🎒</span>
        <div>
          <h2 className="sdf__title">Personalise Your Worksheet</h2>
          <p className="sdf__sub">
            Add school and student details — all optional.
          </p>
        </div>
      </div>

      <div className="sdf__grid">
        {FIELDS.map((field) => (
          <div
            key={field.key}
            className={`sdf__field${field.half ? " sdf__field--half" : ""}`}
          >
            <label className="sdf__label" htmlFor={`sdf-${field.key}`}>
              {field.label}
            </label>
            <input
              id={`sdf-${field.key}`}
              type={field.type ?? "text"}
              className="sdf__input"
              placeholder={field.placeholder}
              value={details[field.key] as string}
              onChange={(e) => update(field.key, e.target.value)}
              autoComplete="off"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
