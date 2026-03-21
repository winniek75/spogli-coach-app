import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the appropriate display name based on locale.
 * When English locale and name_en exists, returns name_en (romaji).
 * Otherwise returns name (kanji).
 */
export function getStudentDisplayName(
  student: { name: string; name_en?: string },
  isEnglish: boolean
): string {
  return (isEnglish && student.name_en) ? student.name_en : student.name
}
