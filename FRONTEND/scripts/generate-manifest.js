const fs = require('fs');
const path = require('path');

const questionTypesDir = path.resolve(__dirname, '..', 'question-types');
const manifestFile = path.resolve(__dirname, '..', 'renderer', 'componentManifest.ts');

if (!fs.existsSync(questionTypesDir)) {
  fs.mkdirSync(questionTypesDir, { recursive: true });
}

const entries = fs.readdirSync(questionTypesDir, { withFileTypes: true });
const componentNames = [];

for (const entry of entries) {
  if (entry.isDirectory()) {
    const compName = entry.name;
    const compFile = path.join(questionTypesDir, compName, `${compName}.tsx`);
    if (fs.existsSync(compFile)) {
      componentNames.push(compName);
    }
  }
}

componentNames.sort();

let content = `// ========================================================
// AUTO-GENERATED COMPONENT MANIFEST
// Generated from convention: question-types/<RendererKey>/<RendererKey>.tsx
// DO NOT EDIT MANUALLY. Run 'node scripts/generate-manifest.js' to update.
// ========================================================

import dynamic from "next/dynamic";
import type { QuestionRendererComponent } from "./QuestionRendererTypes";

export const componentManifest: Record<string, QuestionRendererComponent> = {
`;

for (const name of componentNames) {
  content += `  ${name}: dynamic(() => import("@/question-types/${name}/${name}")),\n`;
}

content += `};\n`;

fs.writeFileSync(manifestFile, content, 'utf8');
console.log(`Generated manifest with ${componentNames.length} components at: ${manifestFile}`);
