import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge"

// Sin esto twMerge toma `text-meta` por un color y lo pisa al combinarlo con `text-primary-foreground`
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "display-sm", "title", "layer", "layer-sm", "body", "meta", "caption"] }],
    },
  },
})

// Ancla de la URL sin el "#"; un hash malformado (p. ej. "%E0%A4%A") se trata como sin ancla
export function decodeHashId(hash: string): string | null {
  try {
    return decodeURIComponent(hash.slice(1)) || null;
  } catch {
    return null;
  }
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
