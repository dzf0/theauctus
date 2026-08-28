// ══════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// Validates all required environment variables at startup
// ══════════════════════════════════════════════════════════════

const requiredServerEnv = [
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const recommendedServerEnv = [
  "GEMINI_API_KEY",
  "ELEVENLABS_API_KEY",
  "ANTHROPIC_API_KEY",
] as const;

const requiredPublicEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optionalEnv = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "NEXT_PUBLIC_APP_URL",
] as const;

type EnvVar = (typeof requiredServerEnv)[number] | (typeof requiredPublicEnv)[number] | (typeof optionalEnv)[number];

class EnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private validated = false;

  validate(): void {
    if (this.validated) return;

    // Check required server env vars
    for (const envVar of requiredServerEnv) {
      if (!process.env[envVar]) {
        this.errors.push(`Missing required server env: ${envVar}`);
      }
    }

    // Check recommended server env vars (warnings only)
    for (const envVar of recommendedServerEnv) {
      if (!process.env[envVar]) {
        this.warnings.push(`Recommended server env not set: ${envVar}`);
      }
    }

    // Check required public env vars
    for (const envVar of requiredPublicEnv) {
      if (!process.env[envVar]) {
        this.errors.push(`Missing required public env: ${envVar}`);
      }
    }

    // Check optional env vars (warnings only)
    for (const envVar of optionalEnv) {
      if (!process.env[envVar]) {
        this.warnings.push(`Optional env not set: ${envVar}`);
      }
    }

    this.validated = true;

    // Log warnings in development
    if (process.env.NODE_ENV === "development" && this.warnings.length > 0) {
      console.warn("⚠️  Environment warnings:", this.warnings);
    }

    // Throw in production if required vars missing
    if (process.env.NODE_ENV === "production" && this.errors.length > 0) {
      console.error("❌ Missing required environment variables:", this.errors);
      throw new Error(`Missing required env vars: ${this.errors.join(", ")}`);
    }
  }

  getErrors(): string[] {
    this.validate();
    return [...this.errors];
  }

  getWarnings(): string[] {
    this.validate();
    return [...this.warnings];
  }

  isValid(): boolean {
    this.validate();
    return this.errors.length === 0;
  }

  // Get specific variable with fallback
  get(key: EnvVar, fallback?: string): string {
    const value = process.env[key];
    if (!value && fallback !== undefined) return fallback;
    if (!value) throw new Error(`Env var ${key} is not set`);
    return value;
  }

  // Get public variable (safe to use in client)
  getPublic(key: (typeof requiredPublicEnv)[number] | (typeof optionalEnv)[number], fallback?: string): string {
    const value = process.env[key];
    if (!value && fallback !== undefined) return fallback;
    if (!value) throw new Error(`Public env var ${key} is not set`);
    return value;
  }

  // Check if a feature is enabled based on env
  isFeatureEnabled(feature: string): boolean {
    const key = `FEATURE_${feature.toUpperCase()}` as EnvVar;
    return process.env[key] === "true" || process.env[key] === "1";
  }
}

// Singleton instance
export const env = new EnvValidator();

// Validate on import in development
if (process.env.NODE_ENV === "development") {
  env.validate();
}

// Helper to check if we're in production
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
