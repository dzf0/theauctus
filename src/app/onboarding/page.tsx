"use client";

import Link from "next/link";
import { useState } from "react";
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
  "Fashion & Beauty",
  "Food & Cooking",
  "Fitness & Health",
  "Travel & Adventure",
  "Technology & Gadgets",
  "Business & Entrepreneurship",
  "Education & Learning",
  "Entertainment & Comedy",
  "Art & Design",
  "Music & Audio",
  "Gaming",
  "Parenting & Family",
  "Pets & Animals",
  "Home & Garden",
  "Sports & Outdoors",
  "Finance & Investing",
  "Marketing & Social Media",
  "Health & Wellness",
  "Sustainability & Environment",
  "Other",
];

const BRAND_VOICE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Authoritative and trustworthy" },
  { id: "casual", label: "Casual", description: "Friendly and approachable" },
  { id: "humorous", label: "Humorous", description: "Witty and entertaining" },
  { id: "inspirational", label: "Inspirational", description: "Motivating and uplifting" },
  { id: "educational", label: "Educational", description: "Informative and helpful" },
];

const TONE_OPTIONS = [
  "Formal",
  "Friendly",
  "Urgent",
  "Playful",
  "Authoritative",
  "Empathetic",
  "Bold",
  "Minimal",
];

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

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      case 1:
        return formData.niche && (formData.niche !== "Other" || formData.customNiche);
      case 2:
        return formData.brandVoice && formData.tonePreferences.length > 0;
      case 3:
        return formData.targetAudience.length >= 10;
      case 4:
        return formData.contentGoals.length > 0;
      case 5:
        return formData.postingFrequency;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

      if (!response.ok) {
        setError(data.error || "Failed to save profile");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="font-headline text-2xl text-[#f5f0eb]">
              The<span className="accent-text">Auctus</span>
            </span>
          </Link>
          <h1 className="font-headline text-3xl text-[#f5f0eb] mb-3">
            Set up your brand
          </h1>
          <p className="text-[13px] text-[#6b6560]">
            Tell us about your content so we can personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ${
                  step.id <= currentStep
                    ? "bg-[#c9a87c] text-[#111]"
                    : "bg-white/[0.06] text-[#6b6560]"
                }`}
              >
                {step.id}
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c9a87c] transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <p className="text-[12px] text-[#6b6560]">
              Step {currentStep} of 5: {STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 glass-card border border-red-500/20 text-red-400 text-[12px]">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="glass-card p-6 mb-6">
          {/* Step 1: Niche */}
          {currentStep === 1 && (
            <div>
              <h2 className="font-headline text-xl text-[#f5f0eb] mb-4">
                What&apos;s your niche?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {NICHE_OPTIONS.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => handleNicheSelect(niche)}
                    className={`p-3 text-left text-[13px] rounded-lg border transition-colors ${
                      formData.niche === niche
                        ? "border-[#c9a87c] bg-[#c9a87c]/10 text-[#f5f0eb]"
                        : "border-white/[0.06] bg-white/[0.02] text-[#9a9590] hover:border-white/[0.12]"
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
              {formData.niche === "Other" && (
                <input
                  type="text"
                  value={formData.customNiche}
                  onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })}
                  placeholder="Enter your niche"
                  className="mt-4 w-full px-4 py-3 glass-input text-[13px]"
                />
              )}
            </div>
          )}

          {/* Step 2: Brand Voice */}
          {currentStep === 2 && (
            <div>
              <h2 className="font-headline text-xl text-[#f5f0eb] mb-4">
                Choose your brand voice
              </h2>
              <div className="space-y-3 mb-6">
                {BRAND_VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => handleVoiceSelect(voice.id)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      formData.brandVoice === voice.id
                        ? "border-[#c9a87c] bg-[#c9a87c]/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="font-medium text-[14px] text-[#f5f0eb]">{voice.label}</div>
                    <div className="text-[12px] text-[#6b6560]">{voice.description}</div>
                  </button>
                ))}
              </div>

              <h3 className="font-medium text-[14px] text-[#f5f0eb] mb-3">
                Select tone preferences (1-3)
              </h3>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => handleToneToggle(tone)}
                    className={`px-4 py-2 text-[13px] rounded-full border transition-colors ${
                      formData.tonePreferences.includes(tone)
                        ? "border-[#c9a87c] bg-[#c9a87c]/10 text-[#f5f0eb]"
                        : "border-white/[0.06] bg-white/[0.02] text-[#9a9590] hover:border-white/[0.12]"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {currentStep === 3 && (
            <div>
              <h2 className="font-headline text-xl text-[#f5f0eb] mb-4">
                Who&apos;s your target audience?
              </h2>
              <p className="text-[13px] text-[#6b6560] mb-4">
                Describe your ideal follower. Be specific about age, interests, and what they&apos;re looking for.
              </p>
              <textarea
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., 18-24 year old fashion enthusiasts who love sustainable streetwear and follow brands like Zara and H&M"
                className="w-full h-32 px-4 py-3 glass-input text-[13px] resize-none"
                maxLength={200}
              />
              <div className="mt-2 text-right">
                <span className={`text-[11px] ${formData.targetAudience.length < 10 ? "text-[#6b6560]" : "text-[#c9a87c]"}`}>
                  {formData.targetAudience.length}/200
                </span>
              </div>
            </div>
          )}

          {/* Step 4: Content Goals */}
          {currentStep === 4 && (
            <div>
              <h2 className="font-headline text-xl text-[#f5f0eb] mb-4">
                What are your content goals?
              </h2>
              <p className="text-[13px] text-[#6b6560] mb-4">
                Select up to 3 goals that matter most to you.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-4 text-left rounded-lg border transition-colors ${
                      formData.contentGoals.includes(goal.id)
                        ? "border-[#c9a87c] bg-[#c9a87c]/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="font-medium text-[13px] text-[#f5f0eb]">{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Posting Frequency */}
          {currentStep === 5 && (
            <div>
              <h2 className="font-headline text-xl text-[#f5f0eb] mb-4">
                How often do you post?
              </h2>
              <div className="space-y-3">
                {FREQUENCY_OPTIONS.map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => setFormData({ ...formData, postingFrequency: freq.id })}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      formData.postingFrequency === freq.id
                        ? "border-[#c9a87c] bg-[#c9a87c]/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="font-medium text-[14px] text-[#f5f0eb]">{freq.label}</div>
                    <div className="text-[12px] text-[#6b6560]">{freq.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 glass-card text-[13px] text-[#9a9590] hover:bg-white/[0.04] transition-colors"
            >
              Back
            </button>
          )}
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 py-3 glass-btn-primary text-[13px] disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex-1 py-3 glass-btn-primary text-[13px] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          )}
        </div>

        {/* Skip Link */}
        <p className="text-center mt-6 text-[12px] text-[#6b6560]">
          <button
            onClick={async () => {
              await fetch("/api/profile/complete-onboarding", { method: "POST" });
              router.push("/dashboard");
            }}
            className="hover:text-[#9a9590] transition-colors"
          >
            Skip for now →
          </button>
        </p>
      </div>
    </div>
  );
}
