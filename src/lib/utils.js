import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateCSRFToken() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function setupCSRF() {
  const token = generateCSRFToken();
  const isSecure = window.location.protocol === "https:";
  document.cookie = `XSRF-TOKEN=${token}; SameSite=Strict;${isSecure ? " Secure;" : ""} Path=/`;
  return token;
}