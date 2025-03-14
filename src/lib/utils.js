import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Add these new functions for CSRF protection
export function generateCSRFToken() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export function setupCSRF() {
  const token = generateCSRFToken();
  document.cookie = `XSRF-TOKEN=${token}; SameSite=Strict; Secure; Path=/`;
  return token;
}