"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-block mb-8">
          <span className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
            The<span className="accent-text">Auctus</span>
          </span>
        </Link>
        <h1 className="font-headline text-4xl mb-4" style={{ color: "var(--foreground)" }}>Privacy Policy</h1>
        <p className="text-[12px] mb-12" style={{ color: "var(--muted)" }}>Last updated: August 24, 2026</p>

        <div className="space-y-10 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>1. What We Collect</h2>
            <p className="mb-3">When you use TheAuctus, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "var(--foreground)" }}>Account info:</strong> email, name, username (via sign-up or Google OAuth)</li>
              <li><strong style={{ color: "var(--foreground)" }}>Brand profile:</strong> niche, brand voice, target audience, content goals, posting frequency</li>
              <li><strong style={{ color: "var(--foreground)" }}>Content data:</strong> posts you create, schedule, or generate through AI</li>
              <li><strong style={{ color: "var(--foreground)" }}>Usage data:</strong> basic analytics on how you use the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>2. How We Use Your Data</h2>
            <p className="mb-3">We use your data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Generate personalized AI content based on your brand voice and niche</li>
              <li>Schedule and publish content to your connected platforms</li>
              <li>Track analytics and suggest growth tactics</li>
              <li>Send you important account notifications</li>
              <li>Improve our AI models (anonymized, aggregated data only)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>3. Where Your Data Is Stored</h2>
            <p>
              Your data is stored in <strong style={{ color: "var(--foreground)" }}>Supabase</strong> (PostgreSQL database hosted on AWS).
              All data is encrypted at rest and in transit. We do not store any data on third-party servers beyond what is listed here.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>4. Data Encryption</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "var(--foreground)" }}>In transit:</strong> All data is encrypted via TLS 1.3</li>
              <li><strong style={{ color: "var(--foreground)" }}>At rest:</strong> Database encryption via Supabase (AES-256)</li>
              <li><strong style={{ color: "var(--foreground)" }}>Passwords:</strong> Hashed with bcrypt — we never store or can read your password</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>5. Who Can Access Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "var(--foreground)" }}>You:</strong> Full access to your own data via the dashboard</li>
              <li><strong style={{ color: "var(--foreground)" }}>TheAuctus team:</strong> Limited access for support and maintenance only</li>
              <li><strong style={{ color: "var(--foreground)" }}>Third parties:</strong> We do not sell, share, or rent your data to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>6. Data Retention</h2>
            <p>
              We retain your data as long as your account is active. If you delete your account, all personal data is permanently removed within 30 days.
              Anonymized analytics data may be retained for product improvement.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "var(--foreground)" }}>Access:</strong> View all your data in the dashboard</li>
              <li><strong style={{ color: "var(--foreground)" }}>Export:</strong> Request a copy of your data</li>
              <li><strong style={{ color: "var(--foreground)" }}>Delete:</strong> Delete your account and all associated data</li>
              <li><strong style={{ color: "var(--foreground)" }}>Rectify:</strong> Update incorrect data via settings</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Significant changes will be notified via email. The latest version is always available at <Link href="/privacy" className="accent-text hover:opacity-80">theauctus.in/privacy</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl mb-3" style={{ color: "var(--foreground)" }}>10. Contact</h2>
            <p>
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@theauctus.in" className="accent-text hover:opacity-80">legal@theauctus.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
