import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomHexColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

export function generateRandomPalette(tubesCount = 3, lightsCount = 4) {
  return {
    tubes: Array.from({ length: tubesCount }, () => randomHexColor()),
    lights: Array.from({ length: lightsCount }, () => randomHexColor()),
  };
}
