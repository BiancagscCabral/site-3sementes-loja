import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Junta classes e resolve conflitos do Tailwind: a última ganha, em vez de as
// duas ficarem na etiqueta brigando.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
