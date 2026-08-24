"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const STEPS = [
  { id: 1, title: "Your Niche", description: "What do you create content about?" },
  { id: 2, title: "Brand Voice", description: "How should your content sound?" },
  { id: 3, title: "Target Audience", description: "Who are you creating for?" },
  { id: 4, title: "Content Goals", description: "What do you want to achieve?" },
  { id: 5, title: "Posting Schedule", description: "How often do you post?" },
];

const NICHE_OPTIONS = [
  "Fashion & Beauty", "Food & Cooking", "Fitness & Health", "Travel & Adventure",
  "Technology & Gadgets", "Business & Entrepreneurship", "Education & Learning",
  "Entertainment & Comedy", "Art & Design", "Music & Audio", "Gaming",
  "Parenting & Family", "Pets & Animals", "Home & Garden", "Sports & Outdoors",
  "Finance & Investing", "Marketing & Social Media", "Health & Wellness",
  "Sustainability & Environment", "Other",
];

const BRAND_VOICE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Authoritative and trustworthy" },
  { id: "casual", label: "Casual", description: "Friendly and approachable" },
  { id: "humorous", label: "Humorous", description: "Witty and entertaining" },
  { id: "inspirational", label: "Inspirational", description: "Motivating and uplifting" },
  { id: "educational", label: "Educational", description: "Informative and helpful" },
];

const TONE_OPTIONS = ["Formal", "Friendly", "Urgent", "Playful", "Authoritative", "Empathetic", "Bold", "Minimal"];

const GOAL_OPTIONS = [
  { id: "engagement", label: "Increase Engagement", icon: "❤️" },
  { id: "sales", label: "Drive Sales", icon: "💰" },
  { id: "awareness", label: "Build Brand Awareness", icon: "📢" },
  { id: "education", label: "Educate Audience", icon: "📚" },
  { id: "entertainment", label: "Entertain Followers", icon: "🎭" },
  { id: "community", label: "Grow Community", icon: "👥" },
];

const FREQUENCY_OPTIONS = [
  { id: "daily", label: "Daily", description: "7 posts per week" },
  { id: "3-5x-week", label: "3-5x per week", description: "Regular posting schedule" },
  { id: "1-2x-week", label: "1-2x per week", description: "Quality over quantity" },
  { id: "weekly", label: "Weekly", description: "One post per week" },
];

// Fun animated loading component
function OnboardingLoader({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    { icon: "🚀", text: "Setting up your workspace..." },
    { icon: "✨", text: "Preparing your dashboard..." },
    { icon: "🎯", text: "Almost ready..." },
    { icon: "🎉", text: "Welcome to TheAuctus!" },
  ];

  useEffect(() => {
    // Animate through steps
    const stepTimer = setInterval(() => {
      setStep((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(stepTimer);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    // Animate progress bar
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete, messages.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "var(--background)" }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full animate-float-slow" style={{ background: "radial-gradient(circle, rgba(201,168,124,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full animate-float-medium" style={{ background: "radial-gradient(circle, rgba(124,158,201,0.1) 0%, transparent 70%)", filter: "blur(30px)" }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-md">
        {/* Animated logo */}
        <div className="mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-pulse-glow" style={{ background: "rgba(201, 168, 124, 0.1)", border: "1px solid rgba(201, 168, 124, 0.2)" }}>
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="font-headline text-3xl mb-2" style={{ color: "var(--foreground)" }}>
            The<span className="accent-text">Auctus</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Your growth engine is starting...</p>
        </div>

        {/* Animated message */}
        <div className="mb-8 h-16">
          <div className="animate-fade-in-up" key={step}>
            <span className="text-4xl mb-4 block">{messages[step].icon}</span>
            <p className="text-[15px] font-medium" style={{ color: "var(--foreground)" }}>
              {messages[step].text}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--lg-bg)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--accent-copper), var(--primary-light))",
              }}
            />
          </div>
        </div>

        {/* Floating particles */}
        <div className="relative h-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                background: "var(--accent-copper)",
                opacity: 0.3 + i * 0.1,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  const [formData, setFormData] = useState({
    niche: "",
    customNiche: "",
    brandVoice: "",
    tonePreferences: [] as string[],
    targetAudience: "",
    contentGoals: [] as string[],
    postingFrequency: "",
  });

  const handleNicheSelect = (niche: string) => {
    setFormData({ ...formData, niche, customNiche: niche === "Other" ? formData.customNiche : "" });
  };

  const handleVoiceSelect = (voice: string) => {
    setFormData({ ...formData, brandVoice: voice });
  };

  const handleToneToggle = (tone: string) => {
    const tones = formData.tonePreferences.includes(tone)
      ? formData.tonePreferences.filter((t) => t !== tone)
      : [...formData.tonePreferences, tone];
    setFormData({ ...formData, tonePreferences: tones });
  };

  const handleGoalToggle = (goal: string) => {
    const goals = formData.contentGoals.includes(goal)
      ? formData.contentGoals.filter((g) => g !== goal)
      : [...formData.contentGoals, goal];
    setFormData({ ...formData, contentGoals: goals });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.niche && (formData.niche !== "Other" || formData.customNiche);
      case 2: return formData.brandVoice && formData.tonePreferences.length > 0;
      case 3: return formData.targetAudience.length >= 10;
      case 4: return formData.contentGoals.length > 0;
      case 5: return formData.postingFrequency;
      default: return false;
    }
  };

  const handleNext = () => { if (currentStep < 5) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: formData.niche === "Other" ? formData.customNiche : formData.niche,
          brandVoice: formData.brandVoice,
          tonePreferences: formData.tonePreferences,
          targetAudience: formData.targetAudience,
          contentGoals: formData.contentGoals,
          postingFrequency: formData.postingFrequency,
          onboarded: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Failed to save profile"); setLoading(false); return; }
      setShowLoader(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setShowLoader(true);
    await fetch("/api/profile/complete-onboarding", { method: "POST" });
  };

  const handleLoaderComplete = () => {
    router.push("/dashboard");
  };

  // Show animated loader
  if (showLoader) {
    return <OnboardingLoader onComplete={handleLoaderComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
              The<span className="accent-text">Auctus</span>
            </span>
          </Link>
          <h1 className="font-headline text-3xl mb-3" style={{ color: "var(--foreground)" }}>
            Set up your brand
          </h1>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Tell us about your content so we personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: step.id <= currentStep ? "var(--accent-copper)" : "var(--lg-bg)",
                  color: step.id <= currentStep ? "#111" : "var(--muted)",
                }}
              >
                {step.id}
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--lg-bg)" }}>
            <div className="h-full transition-all duration-300" style={{ width: `${(currentStep / 5) * 100}%`, backgroundColor: "var(--accent-copper)" }} />
          </div>
          <div className="mt-2 text-center">
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>
              Step {currentStep} of 5: {STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 liquid-card border border-red-500/20 text-red-400 text-[12px]">{error}</div>
        )}

        {/* Step Content */}
        <div className="liquid-card p-6 mb-6">
          {currentStep === 1 && (
            <div>
              <h2 className="font-headline text-xl mb-4" style={{ color: "var(--foreground)" }}>What&apos;s your niche?</h2>
              <div className="grid grid-cols-2 gap-3">
                {NICHE_OPTIONS.map((niche) => (
                  <button key={niche} onClick={() => handleNicheSelect(niche)} className="p-3 text-left text-[13px] rounded-lg border transition-colors"
                    style={{ borderColor: formData.niche === niche ? "var(--accent-copper)" : "var(--lg-border)", backgroundColor: formData.niche === niche ? "rgba(201, 168, 124, 0.1)" : "var(--lg-bg)", color: formData.niche === niche ? "var(--foreground)" : "var(--muted)" }}>
                    {niche}
                  </button>
                ))}
              </div>
              {formData.niche === "Other" && (
                <input type="text" value={formData.customNiche} onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })} placeholder="Enter your niche" className="mt-4 w-full px-4 py-3 liquid-input text-[13px]" />
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="font-headline text-xl mb-4" style={{ color: "var(--foreground)" }}>Choose your brand voice</h2>
              <div className="space-y-3 mb-6">
                {BRAND_VOICE_OPTIONS.map((voice) => (
                  <button key={voice.id} onClick={() => handleVoiceSelect(voice.id)} className="w-full p-4 text-left rounded-lg border transition-colors"
                    style={{ borderColor: formData.brandVoice === voice.id ? "var(--accent-copper)" : "var(--lg-border)", backgroundColor: formData.brandVoice === voice.id ? "rgba(201, 168, 124, 0.1)" : "var(--lg-bg)" }}>
                    <div className="font-medium text-[14px]" style={{ color: "var(--foreground)" }}>{voice.label}</div>
                    <div className="text-[12px]" style={{ color: "var(--muted)" }}>{voice.description}</div>
                  </button>
                ))}
              </div>
              <h3 className="font-medium text-[14px] mb-3" style={{ color: "var(--foreground)" }}>Select tone preferences (1-3)</h3>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <button key={tone} onClick={() => handleToneToggle(tone)} className="px-4 py-2 text-[13px] rounded-full border transition-colors"
                    style={{ borderColor: formData.tonePreferences.includes(tone) ? "var(--accent-copper)" : "var(--lg-border)", backgroundColor: formData.tonePreferences.includes(tone) ? "rgba(201, 168, 124, 0.1)" : "var(--lg-bg)", color: formData.tonePreferences.includes(tone) ? "var(--foreground)" : "var(--muted)" }}>
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="font-headline text-xl mb-4" style={{ color: "var(--foreground)" }}>Who&apos;s your target audience?</h2>
              <p className="text-[13px] mb-4" style={{ color: "var(--muted)" }}>Describe your ideal follower. Be specific about age, interests, and what they&apos;re looking for.</p>
              <textarea value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} placeholder="e.g., 18-24 year old fashion enthusiasts who love sustainable streetwear" className="w-full h-32 px-4 py-3 liquid-input text-[13px] resize-none" maxLength={200} />
              <div className="mt-2 text-right">
                <span className="text-[11px]" style={{ color: formData.targetAudience.length < 10 ? "var(--muted)" : "var(--accent-copper)" }}>{formData.targetAudience.length}/200</span>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="font-headline text-xl mb-4" style={{ color: "var(--foreground)" }}>What are your content goals?</h2>
              <p className="text-[13px] mb-4" style={{ color: "var(--muted)" }}>Select up to 3 goals that matter most to you.</p>
              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <button key={goal.id} onClick={() => handleGoalToggle(goal.id)} className="p-4 text-left rounded-lg border transition-colors"
                    style={{ borderColor: formData.contentGoals.includes(goal.id) ? "var(--accent-copper)" : "var(--lg-border)", backgroundColor: formData.contentGoals.includes(goal.id) ? "rgba(201, 168, 124, 0.1)" : "var(--lg-bg)" }}>
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="font-medium text-[13px]" style={{ color: "var(--foreground)" }}>{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="font-headline text-xl mb-4" style={{ color: "var(--foreground)" }}>How often do you post?</h2>
              <div className="space-y-3">
                {FREQUENCY_OPTIONS.map((freq) => (
                  <button key={freq.id} onClick={() => setFormData({ ...formData, postingFrequency: freq.id })} className="w-full p-4 text-left rounded-lg border transition-colors"
                    style={{ borderColor: formData.postingFrequency === freq.id ? "var(--accent-copper)" : "var(--lg-border)", backgroundColor: formData.postingFrequency === freq.id ? "rgba(201, 168, 124, 0.1)" : "var(--lg-bg)" }}>
                    <div className="font-medium text-[14px]" style={{ color: "var(--foreground)" }}>{freq.label}</div>
                    <div className="text-[12px]" style={{ color: "var(--muted)" }}>{freq.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <button onClick={handleBack} className="flex-1 py-3 liquid-card text-[13px] transition-colors" style={{ color: "var(--muted)" }}>Back</button>
          )}
          {currentStep < 5 ? (
            <button onClick={handleNext} disabled={!canProceed()} className="flex-1 py-3 liquid-btn-primary text-[13px] disabled:opacity-50">Continue</button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || loading} className="flex-1 py-3 liquid-btn-primary text-[13px] disabled:opacity-50">
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          )}
        </div>

        {/* Skip Link */}
        <p className="text-center mt-6 text-[12px]" style={{ color: "var(--muted)" }}>
          <button onClick={handleSkip} className="hover:opacity-80 transition-opacity">Skip for now →</button>
        </p>
      </div>
    </div>
  );
}
