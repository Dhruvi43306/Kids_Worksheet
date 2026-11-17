"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/dummyData";
import "@/app/components/components.css";

interface Props {
  category: Category;
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
    >
      <Link href={`/${category.slug}`} className="cat-card" style={{ "--cat-color": category.color } as React.CSSProperties}>
        <motion.div
          className="cat-card__inner"
          whileHover={{ y: -6, boxShadow: "var(--shadow-hover)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Icon area */}
          <div className="cat-card__icon-wrap">
            <motion.span
              className="cat-card__icon"
              whileHover={{ rotate: 12, scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {category.icon}
            </motion.span>
          </div>

          {/* Content */}
          <div className="cat-card__content">
            <h3 className="cat-card__name">{category.name}</h3>
            <p className="cat-card__desc">{category.description}</p>

            <div className="cat-card__stats">
              <span className="cat-card__stat">
                <span className="cat-card__stat-num">{category.topicCount}</span> topics
              </span>
              <span className="cat-card__stat-sep">·</span>
              <span className="cat-card__stat">
                <span className="cat-card__stat-num">{category.worksheetCount}+</span> worksheets
              </span>
            </div>
          </div>

          {/* Arrow */}
          <motion.div
            className="cat-card__arrow"
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowRight size={18} />
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
