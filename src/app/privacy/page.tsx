import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — TheAuctus",
  description: "How TheAuctus collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-24 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-block mb-12">
          <span className="font-headline text-2xl text-[#f5f0eb]">
            The<span className="accent-text">Auctus</span>
          </span>
        </Link>

        <h1 className="font-headline text-4xl text-[#f5f0eb] mb-4">Privacy Policy</h1>
        <p className="text-[12px] text-[#6b6560] mb-12">Last updated: August 24, 2026</p>

        <div className="space-y-10 text-[13px] text-[#9a9590] leading-relaxed">
          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">1. What We Collect</h2>
            <p>We collect only what&apos;s necessary to provide the service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong className="text-[#f5f0eb]">Account info:</strong> email, name, username (via sign-up or Google OAuth)</li>
              <li><strong className="text-[#f5f0eb]">Brand profile:</strong> niche, brand voice, target audience, content goals, posting frequency</li>
              <li><strong className="text-[#f5f0eb]">Content data:</strong> posts you create, schedule, or generate through AI</li>
              <li><strong className="text-[#f5f0eb]">Usage data:</strong> basic analytics on how you use the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>To provide and improve the TheAuctus service</li>
              <li>To generate AI-powered content based on your brand profile</li>
              <li>To send transactional emails (verification, password reset)</li>
              <li>To display analytics and growth metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">3. Where Your Data Is Stored</h2>
            <p>
              Your data is stored in <strong className="text-[#f5f0eb]">Supabase</strong> (PostgreSQL database hosted on AWS).
              Supabase provides encryption at rest and in transit (TLS 1.3). Your data is stored in
              the region closest to your location.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">4. Data Encryption</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong className="text-[#f5f0eb]">In transit:</strong> All data is encrypted via TLS 1.3</li>
              <li><strong className="text-[#f5f0eb]">At rest:</strong> Database encryption via Supabase (AES-256)</li>
              <li><strong className="text-[#f5f0eb]">Passwords:</strong> Hashed with bcrypt — we never store or can read your password</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">5. Who Can Access Your Data</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong className="text-[#f5f0eb]">You:</strong> Full access to your own data via the dashboard</li>
              <li><strong className="text-[#f5f0eb]">TheAuctus team:</strong> Limited access for support and maintenance only</li>
              <li><strong className="text-[#f5f0eb]">Third parties:</strong> We do not sell, share, or rent your data to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account,
              all personal data is removed within 30 days. Anonymized analytics may be retained
              indefinitely.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">7. Your Rights</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong className="text-[#f5f0eb]">Access:</strong> View all your data in the dashboard</li>
              <li><strong className="text-[#f5f0eb]">Export:</strong> Request a copy of your data</li>
              <li><strong className="text-[#f5f0eb]">Delete:</strong> Delete your account and all associated data</li>
              <li><strong className="text-[#f5f0eb]">Rectify:</strong> Update incorrect data via settings</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">8. Cookies</h2>
            <p>
              We use essential cookies for authentication (HttpOnly, Secure, SameSite=Strict).
              We do not use tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this policy. Material changes will be communicated via email.
              Continued use of the service constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-[#f5f0eb] mb-3">10. Contact</h2>
            <p>
              For privacy questions, contact us at{' '}
              <a href="mailto:privacy@theauctus.in" className="accent-text hover:text-[#dcc4a0]">
                privacy@theauctus.in
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.04]">
          <Link href="/" className="text-[12px] accent-text hover:text-[#dcc4a0]">
            ← Back to TheAuctus
          </Link>
        </div>
      </div>
    </div>
  );
}
