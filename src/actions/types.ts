/**
 * Standard Action Response Format sesuai AGENTS.md Section 2.4
 */
export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
