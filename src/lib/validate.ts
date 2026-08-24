/**
 * Shared validation rules for email and password.
 * Used by sign-up, update-password, and settings pages.
 */

// ── Email ────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return null;
}

// ── Password rules ───────────────────────────────────────────────

export interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: "number",
    label: "One number",
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    id: "special",
    label: "One special character (!@#$%^&*)",
    test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
  },
];

/**
 * Validate a password against all rules.
 * Returns the first failing rule's message, or null if all pass.
 */
export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.label;
  }
  return null;
}

/**
 * Check which password rules pass (for the strength indicator).
 */
export function getPasswordRuleResults(password: string): boolean[] {
  return PASSWORD_RULES.map((rule) => rule.test(password));
}

/**
 * Compute a password strength score from 0-4.
 * 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };

  const results = getPasswordRuleResults(password);
  const passed = results.filter(Boolean).length;

  // Bonus for length > 12
  const longBonus = password.length >= 12 ? 1 : 0;
  const score = Math.min(passed + longBonus, 4);

  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score === 2) return { score, label: "Fair", color: "#f59e0b" };
  if (score === 3) return { score, label: "Good", color: "#3b82f6" };
  return { score, label: "Strong", color: "#22c55e" };
}

// ── Username ─────────────────────────────────────────────────────

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function validateUsername(username: string): string | null {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 20) return "Username must be 20 characters or fewer";
  if (!USERNAME_REGEX.test(username))
    return "Only letters, numbers, and underscores";
  return null;
}
