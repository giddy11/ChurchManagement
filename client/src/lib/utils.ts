import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize a phone number: preserve leading + for international numbers, strip all other non-digit characters
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const hasPlus = raw.trimStart().startsWith('+');
  const digits = raw.replace(/\D/g, '');
  return digits ? (hasPlus ? `+${digits}` : digits) : '';
}
