/**
 * Judge0 Submission Tracking
 *
 * Tracks:
 * - Concurrent submissions per user (prevent multiple simultaneous API calls)
 * - Daily submission counts (hard cost control limit)
 *
 * Uses in-memory storage (resets on server restart).
 * For production with multiple instances, consider Redis.
 */

interface UserSubmissionState {
  concurrentCount: number;
  dailyCount: number;
  dailyResetTime: number; // Timestamp when daily counter resets
}

// In-memory store: Map<userId, UserSubmissionState>
const submissionTracker = new Map<string, UserSubmissionState>();

const DAILY_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get or initialize user's submission state
 */
function getUserState(userId: string): UserSubmissionState {
  if (!submissionTracker.has(userId)) {
    submissionTracker.set(userId, {
      concurrentCount: 0,
      dailyCount: 0,
      dailyResetTime: Date.now() + DAILY_RESET_MS,
    });
  }

  const state = submissionTracker.get(userId)!;

  // Reset daily counter if 24 hours have passed
  if (Date.now() > state.dailyResetTime) {
    state.dailyCount = 0;
    state.dailyResetTime = Date.now() + DAILY_RESET_MS;
  }

  return state;
}

/**
 * Check if user can start a new submission
 * Returns { allowed: boolean, reason?: string }
 */
export function canSubmit(
  userId: string,
  maxDailySubmissions: number,
  maxConcurrentSubmissions: number
): { allowed: boolean; reason?: string } {
  const state = getUserState(userId);

  // Check concurrent limit
  if (state.concurrentCount >= maxConcurrentSubmissions) {
    return {
      allowed: false,
      reason: `Your code is already being submitted. Please wait for the previous submission to finish.`,
    };
  }

  // Check daily limit
  if (state.dailyCount >= maxDailySubmissions) {
    const resetTime = new Date(state.dailyResetTime).toLocaleTimeString();
    return {
      allowed: false,
      reason: `You've reached your daily submission limit (${maxDailySubmissions}/day). Limit resets at ${resetTime}.`,
    };
  }

  return { allowed: true };
}

/**
 * Increment concurrent submission counter
 * Call this when submission starts
 */
export function startSubmission(userId: string): void {
  const state = getUserState(userId);
  state.concurrentCount++;
  state.dailyCount++;
}

/**
 * Decrement concurrent submission counter
 * Call this when submission finishes (success or failure)
 */
export function endSubmission(userId: string): void {
  const state = getUserState(userId);
  if (state.concurrentCount > 0) {
    state.concurrentCount--;
  }
}

/**
 * Get user's submission stats (for debugging/monitoring)
 */
export function getSubmissionStats(userId: string) {
  const state = getUserState(userId);
  const resetTime = new Date(state.dailyResetTime);
  return {
    concurrentCount: state.concurrentCount,
    dailyCount: state.dailyCount,
    dailyResetAt: resetTime.toISOString(),
  };
}

/**
 * Clear all tracking (useful for testing)
 */
export function clearAllTracking(): void {
  submissionTracker.clear();
}
