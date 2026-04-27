/**
 * Base URL for server-side fetches (RSC) to the local API.
 */
export const INTERNAL_API =
  process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4000";
