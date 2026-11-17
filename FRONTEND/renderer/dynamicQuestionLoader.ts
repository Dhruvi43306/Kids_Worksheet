import { componentManifest } from "./componentManifest";
import type { QuestionRendererComponent } from "./QuestionRendererTypes";

function toPascalCase(key: string): string {
  return key
    .trim()
    .replace(/[-_ ]+([a-zA-Z0-9])/g, (_, char) => char.toUpperCase())
    .replace(/^([a-z])/, (_, char) => char.toUpperCase());
}

export function resolveQuestionComponent(
  rendererKey?: string | null,
): QuestionRendererComponent | null {
  if (!rendererKey || typeof rendererKey !== "string") {
    return null;
  }

  const rawKey = rendererKey.trim();
  if (!rawKey) {
    return null;
  }

  if (componentManifest[rawKey]) {
    return componentManifest[rawKey];
  }

  const withSuffix = `${rawKey}Question`;
  if (componentManifest[withSuffix]) {
    return componentManifest[withSuffix];
  }

  const pascal = toPascalCase(rawKey);
  if (componentManifest[pascal]) {
    return componentManifest[pascal];
  }

  const pascalWithSuffix = `${pascal}Question`;
  if (componentManifest[pascalWithSuffix]) {
    return componentManifest[pascalWithSuffix];
  }

  const lowerKey = rawKey.toLowerCase();
  const lowerWithSuffix = `${lowerKey}question`;
  for (const registeredKey of Object.keys(componentManifest)) {
    const regLower = registeredKey.toLowerCase();
    if (regLower === lowerKey || regLower === lowerWithSuffix) {
      return componentManifest[registeredKey];
    }
  }

  return null;
}
