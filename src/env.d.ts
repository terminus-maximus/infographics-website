/// <reference types="astro/client" />

interface Window {
  /** The feedback page loads Turnstile asynchronously; only reset is used here. */
  turnstile?: { reset: () => void };
}
