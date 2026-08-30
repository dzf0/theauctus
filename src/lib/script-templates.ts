// ══════════════════════════════════════════════════════════════
// SCRIPT TEMPLATES LIBRARY
// 50+ viral script hooks organized by niche
// Users pick a template → fill blanks → AI generates video
// ══════════════════════════════════════════════════════════════

export interface ScriptTemplate {
  id: string;
  name: string;
  niche: string;
  category: "hook" | "story" | "list" | "challenge" | "myth" | "secret" | "reddit" | "fake-text";
  duration: "short" | "medium" | "long"; // 15s, 30s, 60s
  template: string; // Contains {placeholders}
  placeholders?: { key: string; label: string; example: string }[];
}

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  // ══════════════════════════════════════════════════════════════
  // HOOKS — Grab attention in the first 2 seconds
  // ══════════════════════════════════════════════════════════════
  {
    id: "hook-stop-scrolling",
    name: "Stop Scrolling",
    niche: "general",
    category: "hook",
    duration: "short",
    template: "Stop scrolling. {topic} just changed everything and nobody is talking about it. Here's what you need to know before it's too late. {detail} The people who figure this out first are going to absolutely dominate. Save this before it gets taken down.",
    placeholders: [
      { key: "topic", label: "Topic", example: "AI content creation" },
      { key: "detail", label: "Key Detail", example: "A new tool just dropped that generates entire video scripts in 10 seconds." },
    ],
  },
  {
    id: "hook-nobody-tells-you",
    name: "Nobody Tells You",
    niche: "general",
    category: "hook",
    duration: "short",
    template: "Here's what nobody tells you about {topic}. Everyone talks about {common_belief} but that's completely wrong. The real secret is {secret}. I wish someone told me this {timeframe} ago. {cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "making money online" },
      { key: "common_belief", label: "Common Belief", example: "you need a huge audience" },
      { key: "secret", label: "The Secret", example: "you only need 100 true fans paying $100/month" },
      { key: "timeframe", label: "Timeframe", example: "2 years" },
      { key: "cta", label: "Call to Action", example: "Follow for more." },
    ],
  },
  {
    id: "hook-unpopular-opinion",
    name: "Unpopular Opinion",
    niche: "general",
    category: "hook",
    duration: "short",
    template: "Unpopular opinion: {topic} is completely overrated. Here's what actually works instead. {explanation} The top 1% already know this. Now you do too.",
    placeholders: [
      { key: "topic", label: "Topic", example: "hustle culture" },
      { key: "explanation", label: "Explanation", example: "Working smarter with systems beats working harder every single time." },
    ],
  },
  {
    id: "hook-3-things",
    name: "3 Things Nobody Knows",
    niche: "general",
    category: "list",
    duration: "medium",
    template: "Did you know that {topic} is one of the fastest growing industries right now? Here are three things most people completely miss.\n\nFirst, {point_1}\n\nSecond, {point_2}\n\nThird — and this is the one nobody talks about — {point_3}\n\nHere's my challenge to you: {challenge}\n\nThe creators who win aren't the most talented. They're the most consistent. Start today, not tomorrow.\n\n{cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "AI content creation" },
      { key: "point_1", label: "Point 1", example: "The market for AI content is expected to grow by 40% in the next two years." },
      { key: "point_2", label: "Point 2", example: "The top 1% of creators are making six figures from their own products." },
      { key: "point_3", label: "Point 3", example: "The barrier to entry has never been lower." },
      { key: "challenge", label: "Challenge", example: "Pick one platform. Post every day for 30 days." },
      { key: "cta", label: "Call to Action", example: "Follow for more strategies that actually work." },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // STORIES — Narrative-driven content
  // ══════════════════════════════════════════════════════════════
  {
    id: "story-transformation",
    name: "Before & After Story",
    niche: "general",
    category: "story",
    duration: "long",
    template: "{timeframe} ago, I was {before_state}.\n\nToday: {after_state}.\n\nHere's the playbook:\n\n{steps}\n\nThe real win? {lesson}\n\n{cta}",
    placeholders: [
      { key: "timeframe", label: "Timeframe", example: "6 months ago" },
      { key: "before_state", label: "Before", example: "stuck at 200 followers with zero strategy" },
      { key: "after_state", label: "After", example: "15,000+ followers, 3 brand deals, and a community that engages" },
      { key: "steps", label: "Steps", example: "Week 1-2: Defined my niche precisely.\nWeek 3-4: Built a content system.\nMonth 2: Daily engagement on 20 accounts.\nMonth 3: Weekly analytics reviews." },
      { key: "lesson", label: "Lesson", example: "I enjoy creating now because I have a system instead of a scramble." },
      { key: "cta", label: "Call to Action", example: "Comment SYSTEM and I'll DM you the template." },
    ],
  },
  {
    id: "story-5-mistakes",
    name: "5 Mistakes I Made",
    niche: "general",
    category: "story",
    duration: "long",
    template: "I made {count} mistakes that cost me {cost}. Here they are so you don't repeat them.\n\nMistake #{num_1}: {mistake_1}. The fix? {fix_1}\n\nMistake #{num_2}: {mistake_2}. The fix? {fix_2}\n\nMistake #{num_3}: {mistake_3}. The fix? {fix_3}\n\n{cta}",
    placeholders: [
      { key: "count", label: "How Many", example: "5" },
      { key: "cost", label: "Cost", example: "over $10,000 and 6 months" },
      { key: "num_1", label: "Number", example: "1" },
      { key: "mistake_1", label: "Mistake 1", example: "Trying to be on every platform at once" },
      { key: "fix_1", label: "Fix 1", example: "Master one platform first, then expand." },
      { key: "num_2", label: "Number", example: "2" },
      { key: "mistake_2", label: "Mistake 2", example: "Posting without a content calendar" },
      { key: "fix_2", label: "Fix 2", example: "Batch create and schedule everything in advance." },
      { key: "num_3", label: "Number", example: "3" },
      { key: "mistake_3", label: "Mistake 3", example: "Ignoring analytics completely" },
      { key: "fix_3", label: "Fix 3", example: "Review analytics every Sunday. Double down on what works." },
      { key: "cta", label: "Call to Action", example: "Save this so you don't make the same mistakes." },
    ],
  },
  {
    id: "story-rags-to-riches",
    name: "Rags to Riches",
    niche: "business",
    category: "story",
    duration: "long",
    template: "I went from {starting_point} to {ending_point} in {timeframe}.\n\nNobody believed me. Here's exactly how I did it.\n\nStep 1: {step_1}\nStep 2: {step_2}\nStep 3: {step_3}\n\nThe biggest lesson? {lesson}\n\n{cta}",
    placeholders: [
      { key: "starting_point", label: "Starting Point", example: "broke college student with $200" },
      { key: "ending_point", label: "Ending Point", example: "running a $50K/month business" },
      { key: "timeframe", label: "Timeframe", example: "18 months" },
      { key: "step_1", label: "Step 1", example: "Started selling digital products on Gumroad" },
      { key: "step_2", label: "Step 2", example: "Reinvested everything into content marketing" },
      { key: "step_3", label: "Step 3", example: "Hired my first VA at the $10K mark" },
      { key: "lesson", label: "Lesson", example: "Speed of implementation beats perfection every time." },
      { key: "cta", label: "Call to Action", example: "Follow for the full breakdown." },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // LIST — Numbered content
  // ══════════════════════════════════════════════════════════════
  {
    id: "list-5-tools",
    name: "5 Tools You Need",
    niche: "tech",
    category: "list",
    duration: "medium",
    template: "Here are {count} tools that will {benefit}:\n\n{tool_1}: {desc_1}\n{tool_2}: {desc_2}\n{tool_3}: {desc_3}\n{tool_4}: {desc_4}\n{tool_5}: {desc_5}\n\nTool number {best_num} is my favorite. {reason}\n\n{cta}",
    placeholders: [
      { key: "count", label: "How Many", example: "5" },
      { key: "benefit", label: "Benefit", example: "10x your productivity in 2026" },
      { key: "tool_1", label: "Tool 1", example: "Notion" },
      { key: "desc_1", label: "Description 1", example: "All-in-one workspace for notes, tasks, and databases" },
      { key: "tool_2", label: "Tool 2", example: "Arc Browser" },
      { key: "desc_2", label: "Description 2", example: "AI-powered browser that organizes your tabs" },
      { key: "tool_3", label: "Tool 3", example: "Linear" },
      { key: "desc_3", label: "Description 3", example: "Project management that doesn't suck" },
      { key: "tool_4", label: "Tool 4", example: "Raycast" },
      { key: "desc_4", label: "Description 4", example: "Launcher that replaces Spotlight" },
      { key: "tool_5", label: "Tool 5", example: "Descript" },
      { key: "desc_5", label: "Description 5", example: "Edit video by editing text" },
      { key: "best_num", label: "Best Number", example: "5" },
      { key: "reason", label: "Reason", example: "It replaced 3 other apps for me." },
      { key: "cta", label: "Call to Action", example: "Save this list. You'll thank me later." },
    ],
  },
  {
    id: "list-beginner-mistakes",
    name: "Beginner Mistakes",
    niche: "general",
    category: "list",
    duration: "medium",
    template: "If you're just starting with {topic}, avoid these {count} mistakes:\n\n{mistake_1} — {fix_1}\n{mistake_2} — {fix_2}\n{mistake_3} — {fix_3}\n\nMistake #{worst_num} is the one that costs people the most. {explanation}\n\n{cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "content creation" },
      { key: "count", label: "How Many", example: "5" },
      { key: "mistake_1", label: "Mistake 1", example: "Posting inconsistently" },
      { key: "fix_1", label: "Fix 1", example: "Use a content calendar" },
      { key: "mistake_2", label: "Mistake 2", example: "Ignoring your analytics" },
      { key: "fix_2", label: "Fix 2", example: "Review weekly and adjust" },
      { key: "mistake_3", label: "Mistake 3", example: "Trying to be perfect" },
      { key: "fix_3", label: "Fix 3", example: "Done beats perfect every time" },
      { key: "worst_num", label: "Worst Number", example: "3" },
      { key: "explanation", label: "Explanation", example: "Perfectionism kills more dreams than failure ever will." },
      { key: "cta", label: "Call to Action", example: "Follow for more tips." },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // CHALLENGE — Interactive content
  // ══════════════════════════════════════════════════════════════
  {
    id: "challenge-30-day",
    name: "30 Day Challenge",
    niche: "general",
    category: "challenge",
    duration: "medium",
    template: "I'm doing a {count}-day challenge: {challenge}\n\nHere's my plan:\nWeek 1: {week_1}\nWeek 2: {week_2}\nWeek 3: {week_3}\nWeek 4: {week_4}\n\nBy day {count}, I'll have {expected_result}.\n\nWant to join me? {cta}",
    placeholders: [
      { key: "count", label: "Days", example: "30" },
      { key: "challenge", label: "Challenge", example: "posting one short-form video every single day" },
      { key: "week_1", label: "Week 1", example: "Define my niche and content pillars" },
      { key: "week_2", label: "Week 2", example: "Batch create 7 videos" },
      { key: "week_3", label: "Week 3", example: "Analyze what's working, double down" },
      { key: "week_4", label: "Week 4", example: "Collaborate with 3 creators" },
      { key: "expected_result", label: "Expected Result", example: "more data than 90% of creators" },
      { key: "cta", label: "Call to Action", example: "Comment 'IN' and I'll send you the template." },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // MYTH-BUSTING
  // ══════════════════════════════════════════════════════════════
  {
    id: "myth-busting",
    name: "Myth vs Reality",
    niche: "general",
    category: "myth",
    duration: "medium",
    template: "Everyone thinks {myth}. That's completely wrong.\n\nHere's the reality: {reality}\n\nThe proof? {proof}\n\nStop believing the myth. Start {action}.\n\n{cta}",
    placeholders: [
      { key: "myth", label: "The Myth", example: "you need expensive equipment to start creating content" },
      { key: "reality", label: "The Reality", example: "the top creators started with just their phone" },
      { key: "proof", label: "Proof", example: "MrBeast started with a $30 camera. Now he has 300M+ subscribers." },
      { key: "action", label: "Action", example: "creating with what you have right now" },
      { key: "cta", label: "Call to Action", example: "Share this with someone who needs to hear it." },
    ],
  },
  {
    id: "myth-top-3",
    name: "3 Myths Debunked",
    niche: "general",
    category: "myth",
    duration: "long",
    template: "Three myths about {topic} that need to die:\n\nMyth 1: {myth_1}\nReality: {reality_1}\n\nMyth 2: {myth_2}\nReality: {reality_2}\n\nMyth 3: {myth_3}\nReality: {reality_3}\n\nThe truth is {truth}.\n\n{cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "growing on social media" },
      { key: "myth_1", label: "Myth 1", example: "You need to post 3 times a day" },
      { key: "reality_1", label: "Reality 1", example: "One great post beats ten mediocre ones." },
      { key: "myth_2", label: "Myth 2", example: "You need to go viral to succeed" },
      { key: "reality_2", label: "Reality 2", example: "Consistent 1K-view videos build empires." },
      { key: "myth_3", label: "Myth 3", example: "The algorithm is against you" },
      { key: "reality_3", label: "Reality 3", example: "The algorithm rewards engagement, not luck." },
      { key: "truth", label: "Truth", example: "success is about systems, not shortcuts." },
      { key: "cta", label: "Call to Action", example: "Save this and share it with a creator friend." },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // SECRETS — Exclusive knowledge
  // ══════════════════════════════════════════════════════════════
  {
    id: "secret-revealed",
    name: "The Secret Nobody Shares",
    niche: "general",
    category: "secret",
    duration: "medium",
    template: "The {topic} secret that nobody shares publicly:\n\n{secret}\n\nHere's why this works: {explanation}\n\nI spent {timeframe} figuring this out. You just learned it in 30 seconds.\n\n{cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "content creation" },
      { key: "secret", label: "The Secret", example: "Batch create 7 days of content in one 3-hour session." },
      { key: "explanation", label: "Why It Works", example: "Your brain stays in creative mode instead of switching context." },
      { key: "timeframe", label: "Timeframe", example: "6 months and $5,000 in courses" },
      { key: "cta", label: "Call to Action", example: "Follow for more secrets the gurus won't tell you." },
    ],
  },
  {
    id: "secret-framework",
    name: "The Framework",
    niche: "business",
    category: "secret",
    duration: "long",
    template: "Here's the framework that changed everything for me in {topic}:\n\nThe {framework_name} method:\n1. {step_1}\n2. {step_2}\n3. {step_3}\n4. {step_4}\n\nMost people skip step {skip_num}. That's why they fail.\n\n{cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "building an online business" },
      { key: "framework_name", label: "Framework Name", example: "4P" },
      { key: "step_1", label: "Step 1", example: "Position: Find a specific audience with a painful problem" },
      { key: "step_2", label: "Step 2", example: "Product: Create the minimum viable solution" },
      { key: "step_3", label: "Step 3", example: "Promote: Content market on ONE platform" },
      { key: "step_4", label: "Step 4", example: "Profit: Scale with systems and team" },
      { key: "skip_num", label: "Skip Number", example: "1" },
      { key: "cta", label: "Call to Action", example: "Save this framework. You'll need it." },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // NICHE-SPECIFIC
  // ══════════════════════════════════════════════════════════════
  {
    id: "fitness-3-exercises",
    name: "3 Exercises For",
    niche: "fitness",
    category: "list",
    duration: "medium",
    template: "These 3 exercises will {benefit}:\n\nExercise 1: {exercise_1}\nWhy: {reason_1}\nSets: {sets_1}\n\nExercise 2: {exercise_2}\nWhy: {reason_2}\nSets: {sets_2}\n\nExercise 3: {exercise_3}\nWhy: {reason_3}\nSets: {sets_3}\n\nDo this {frequency} for {timeframe} and you'll see results.\n\n{cta}",
    placeholders: [
      { key: "benefit", label: "Benefit", example: "transform your physique in 30 days" },
      { key: "exercise_1", label: "Exercise 1", example: "Barbell Squat" },
      { key: "reason_1", label: "Reason 1", example: "Builds full-body strength and testosterone" },
      { key: "sets_1", label: "Sets 1", example: "4 sets of 8 reps" },
      { key: "exercise_2", label: "Exercise 2", example: "Deadlift" },
      { key: "reason_2", label: "Reason 2", example: "Works every muscle chain" },
      { key: "sets_2", label: "Sets 2", example: "3 sets of 5 reps" },
      { key: "exercise_3", label: "Exercise 3", example: "Bench Press" },
      { key: "reason_3", label: "Reason 3", example: "Upper body foundation" },
      { key: "sets_3", label: "Sets 3", example: "4 sets of 8 reps" },
      { key: "frequency", label: "Frequency", example: "3x per week" },
      { key: "timeframe", label: "Timeframe", example: "8 weeks" },
      { key: "cta", label: "Call to Action", example: "Save this workout. Your future self will thank you." },
    ],
  },
  {
    id: "finance-investing",
    name: "Investing for Beginners",
    niche: "finance",
    category: "list",
    duration: "medium",
    template: "If I was starting with ${amount} today, here's exactly what I'd do:\n\nStep 1: {step_1}\nStep 2: {step_2}\nStep 3: {step_3}\n\nThe biggest mistake beginners make? {mistake}\n\nDon't overcomplicate it. {simple_advice}\n\n{cta}",
    placeholders: [
      { key: "amount", label: "Amount", example: "1,000" },
      { key: "step_1", label: "Step 1", example: "Put $500 in a low-cost index fund (VTI or VOO)" },
      { key: "step_2", label: "Step 2", example: "Put $300 in a high-yield savings account" },
      { key: "step_3", label: "Step 3", example: "Use $200 to learn a high-income skill" },
      { key: "mistake", label: "Mistake", example: "Trying to pick individual stocks" },
      { key: "simple_advice", label: "Simple Advice", example: "Consistency beats timing every time." },
      { key: "cta", label: "Call to Action", example: "Follow for more financial tips." },
    ],
  },
  {
    id: "cooking-recipe",
    name: "60 Second Recipe",
    niche: "food",
    category: "list",
    duration: "medium",
    template: "Make {dish} in under {time}:\n\nIngredients:\n{ingredients}\n\nSteps:\n1. {step_1}\n2. {step_2}\n3. {step_3}\n\nPro tip: {tip}\n\n{cta}",
    placeholders: [
      { key: "dish", label: "Dish", example: "the perfect steak" },
      { key: "time", label: "Time", example: "15 minutes" },
      { key: "ingredients", label: "Ingredients", example: "Ribeye steak, salt, pepper, butter, garlic, rosemary" },
      { key: "step_1", label: "Step 1", example: "Season steak generously with salt and pepper" },
      { key: "step_2", label: "Step 2", example: "Sear in cast iron for 3 minutes each side" },
      { key: "step_3", label: "Step 3", example: "Butter baste with garlic and rosemary" },
      { key: "tip", label: "Pro Tip", example: "Let it rest for 5 minutes before cutting." },
      { key: "cta", label: "Call to Action", example: "Save this recipe. You'll make it again and again." },
    ],
  },
  {
    id: "travel-hidden-gems",
    name: "Hidden Gems",
    niche: "travel",
    category: "list",
    duration: "medium",
    template: "Places in {location} that tourists don't know about:\n\n1. {place_1} — {desc_1}\n2. {place_2} — {desc_2}\n3. {place_3} — {desc_3}\n\nNumber {best_num} is my personal favorite. {reason}\n\n{cta}",
    placeholders: [
      { key: "location", label: "Location", example: "Bali" },
      { key: "place_1", label: "Place 1", example: "Tukad Cepung Waterfall" },
      { key: "desc_1", label: "Description 1", example: "Hidden inside a cave with sun rays filtering through" },
      { key: "place_2", label: "Place 2", example: "Leke Leke Waterfall" },
      { key: "desc_2", label: "Description 2", example: "Short hike leads to a stunning jungle waterfall" },
      { key: "place_3", label: "Place 3", example: "Sidemen Valley" },
      { key: "desc_3", label: "Description 3", example: "Rice terraces without the Ubud crowds" },
      { key: "best_num", label: "Best Number", example: "3" },
      { key: "reason", label: "Reason", example: "I stayed there for a week and it was pure magic." },
      { key: "cta", label: "Call to Action", example: "Save this for your next trip." },
    ],
  },
  {
    id: "tech-ai-tools",
    name: "AI Tools Nobody Knows",
    niche: "tech",
    category: "list",
    duration: "medium",
    template: "AI tools that will {benefit}:\n\nTool 1: {tool_1}\nWhat it does: {desc_1}\n\nTool 2: {tool_2}\nWhat it does: {desc_2}\n\nTool 3: {tool_3}\nWhat it does: {desc_3}\n\nTool {best_num} replaced {old_tool} for me completely.\n\n{cta}",
    placeholders: [
      { key: "benefit", label: "Benefit", example: "save you 10 hours per week" },
      { key: "tool_1", label: "Tool 1", example: "Claude" },
      { key: "desc_1", label: "Description 1", example: "Better than ChatGPT for writing and analysis" },
      { key: "tool_2", label: "Tool 2", example: "Midjourney v7" },
      { key: "desc_2", label: "Description 2", example: "Photorealistic images from text prompts" },
      { key: "tool_3", label: "Tool 3", example: "ElevenLabs" },
      { key: "desc_3", label: "Description 3", example: "Voice cloning and text-to-speech" },
      { key: "best_num", label: "Best Number", example: "3" },
      { key: "old_tool", label: "Old Tool", example: "hiring a voice actor" },
      { key: "cta", label: "Call to Action", example: "Follow for more AI tools that actually work." },
    ],
  },
  {
    id: "productivity-hacks",
    name: "Productivity Hack",
    niche: "productivity",
    category: "secret",
    duration: "short",
    template: "This {timeframe} productivity hack changed my life:\n\n{hack}\n\nHere's why it works: {reason}\n\nI've been using it for {duration} and {result}.\n\n{cta}",
    placeholders: [
      { key: "timeframe", label: "Timeframe", example: "2-minute" },
      { key: "hack", label: "The Hack", example: "Before opening any app, ask: 'What am I here to do?'" },
      { key: "reason", label: "Why It Works", example: "It prevents autopilot scrolling." },
      { key: "duration", label: "Duration", example: "3 months" },
      { key: "result", label: "Result", example: "I save 2+ hours every day" },
      { key: "cta", label: "Call to Action", example: "Try it tomorrow morning. Thank me later." },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // REDDIT-STYLE STORIES
  // ══════════════════════════════════════════════════════════════
  {
    id: "reddit-aita",
    name: "AITA Story",
    niche: "general",
    category: "reddit",
    duration: "long",
    template: "So I {action}. Now my {person} is {reaction}.\n\nHere's what happened:\n\n{story}\n\nThe internet is divided on this one. Some say {side_a}. Others say {side_b}.\n\nWhat do you think? {cta}",
    placeholders: [
      { key: "action", label: "Action", example: "told my best friend her boyfriend was cheating" },
      { key: "person", label: "Person", example: "best friend" },
      { key: "reaction", label: "Reaction", example: "not talking to me" },
      { key: "story", label: "Story", example: "I saw him at a restaurant with another girl. I showed her the photos. She looked through them and said I was jealous." },
      { key: "side_a", label: "Side A", example: "I did the right thing as a friend" },
      { key: "side_b", label: "Side B", example: "I should have minded my own business" },
      { key: "cta", label: "Call to Action", example: "Drop your verdict in the comments." },
    ],
  },
  {
    id: "reddit-tifu",
    name: "TIFU Story",
    niche: "general",
    category: "reddit",
    duration: "long",
    template: "TIFU by {action}.\n\nSo here's what happened:\n\n{story}\n\nNow {consequence}.\n\nI can't believe I did this. {reaction}\n\n{cta}",
    placeholders: [
      { key: "action", label: "Action", example: "sending my boss a meme about hating Mondays" },
      { key: "story", label: "Story", example: "I meant to send it to my work friend group chat. But I sent it to the company-wide Slack channel." },
      { key: "consequence", label: "Consequence", example: "everyone including the CEO has seen it" },
      { key: "reaction", label: "Reaction", example: "I'm updating my resume as we speak." },
      { key: "cta", label: "Call to Action", example: "Tell me your worst work story in the comments." },
    ],
  },
  {
    id: "reddit-prorevenge",
    name: "Pro Revenge Story",
    niche: "general",
    category: "reddit",
    duration: "long",
    template: "My {villain} tried to {villain_action}. So I {revenge}.\n\nHere's the full story:\n\n{story}\n\nFast forward to today: {outcome}\n\nSometimes karma works fast.\n\n{cta}",
    placeholders: [
      { key: "villain", label: "Villain", example: "neighbor" },
      { key: "villain_action", label: "Villain Action", example: "steal my parking spot every single day" },
      { key: "revenge", label: "Revenge", example: "registered the spot as my property with the city" },
      { key: "story", label: "Story", example: "He kept parking in my assigned spot even after I left notes. So I got the deed, filed with the city, and had his car towed." },
      { key: "outcome", label: "Outcome", example: "He's never parked there again and now waves politely every morning" },
      { key: "cta", label: "Call to Action", example: "What's your best revenge story?" },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // FAKE TEXT CHAT
  // ══════════════════════════════════════════════════════════════
  {
    id: "fake-text-breakup",
    name: "Breakup Chat",
    niche: "general",
    category: "fake-text",
    duration: "medium",
    template: "[Conversation between {person_a} and {person_b}]\n\n{person_a}: {msg_1}\n{person_b}: {msg_2}\n{person_a}: {msg_3}\n{person_b}: {msg_4}\n{person_a}: {msg_5}\n{person_b}: {msg_6}\n\n{person_a}: {final_msg}",
    placeholders: [
      { key: "person_a", label: "Person A", example: "Jake" },
      { key: "person_b", label: "Person B", example: "Sarah" },
      { key: "msg_1", label: "Message 1", example: "We need to talk" },
      { key: "msg_2", label: "Message 2", example: "About what?" },
      { key: "msg_3", label: "Message 3", example: "I saw your texts with Emma" },
      { key: "msg_4", label: "Message 4", example: "It's not what you think" },
      { key: "msg_5", label: "Message 5", example: "You're right. It's worse." },
      { key: "msg_6", label: "Message 6", example: "Please just let me explain" },
      { key: "final_msg", label: "Final Message", example: "Don't contact me again." },
    ],
  },
  {
    id: "fake-text-prank",
    name: "Prank Chat",
    niche: "general",
    category: "fake-text",
    duration: "short",
    template: "[Conversation between {person_a} and {person_b}]\n\n{person_a}: {msg_1}\n{person_b}: {msg_2}\n{person_a}: {msg_3}\n{person_b}: {msg_4}\n{person_a}: {msg_5}\n{person_b}: {msg_5_response}",
    placeholders: [
      { key: "person_a", label: "Person A", example: "Mom" },
      { key: "person_b", label: "Person B", example: "Me" },
      { key: "msg_1", label: "Message 1", example: "I'm selling your gaming console" },
      { key: "msg_2", label: "Message 2", example: "WHAT? No please" },
      { key: "msg_3", label: "Message 3", example: "Already listed it on Facebook" },
      { key: "msg_4", label: "Message 4", example: "Mom I'll do anything" },
      { key: "msg_5", label: "Message 5", example: "Clean your room by tonight or it's gone" },
      { key: "msg_5_response", label: "Response", example: "ON IT 🏃‍♂️💨" },
    ],
  },
  {
    id: "fake-text-sales",
    name: "Sales Conversation",
    niche: "business",
    category: "fake-text",
    duration: "medium",
    template: "[Conversation between {buyer} and {seller}]\n\n{buyer}: {inquiry}\n{seller}: {response_1}\n{buyer}: {objection}\n{seller}: {response_2}\n{buyer}: {second_objection}\n{seller}: {close}\n{buyer}: {decision}",
    placeholders: [
      { key: "buyer", label: "Buyer", example: "Client" },
      { key: "seller", label: "Seller", example: "You" },
      { key: "inquiry", label: "Inquiry", example: "How much for your course?" },
      { key: "response_1", label: "Response 1", example: "$497. But let me ask you something first..." },
      { key: "objection", label: "Objection", example: "That's too expensive" },
      { key: "response_2", label: "Response 2", example: "What's the cost of staying where you are right now?" },
      { key: "second_objection", label: "Second Objection", example: "I need to think about it" },
      { key: "close", label: "Close", example: "Totally understand. The price goes up Monday. No pressure." },
      { key: "decision", label: "Decision", example: "Okay send me the link" },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // MORE GENERAL TEMPLATES
  // ══════════════════════════════════════════════════════════════
  {
    id: "hot-take",
    name: "Hot Take",
    niche: "general",
    category: "hook",
    duration: "short",
    template: "{topic} is not {common_belief}. It's actually {reality}.\n\nHere's proof: {proof}\n\n{cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "Discipline" },
      { key: "common_belief", label: "Common Belief", example: "about motivation" },
      { key: "reality", label: "Reality", example: "about systems and habits" },
      { key: "proof", label: "Proof", example: "I haven't relied on motivation in 2 years. I just follow my system." },
      { key: "cta", label: "Call to Action", example: "Agree or disagree? Comment below." },
    ],
  },
  {
    id: "storytime-crazy",
    name: "Crazy Storytime",
    niche: "general",
    category: "story",
    duration: "long",
    template: "You won't believe what just happened.\n\n{story_setup}\n\nI thought it was over. But then {twist}\n\nThe ending? {ending}\n\nI'm still shaking. {reaction}\n\n{cta}",
    placeholders: [
      { key: "story_setup", label: "Setup", example: "I was at a coffee shop and this guy recognized me from my videos." },
      { key: "twist", label: "Twist", example: "he handed me a business card and said his company wants to sponsor me" },
      { key: "ending", label: "Ending", example: "It's a $10,000 deal for 3 videos." },
      { key: "reaction", label: "Reaction", example: "This is why you never stop creating." },
      { key: "cta", label: "Call to Action", example: "Follow for more insane stories." },
    ],
  },
  {
    id: "green-flag-red-flag",
    name: "Green Flag / Red Flag",
    niche: "general",
    category: "list",
    duration: "medium",
    template: "Green flags in {topic}:\n\n{green_1}\n{green_2}\n{green_3}\n\nRed flags in {topic}:\n\n{red_1}\n{red_2}\n{red_3}\n\nWhich ones hit home? {cta}",
    placeholders: [
      { key: "topic", label: "Topic", example: "a relationship" },
      { key: "green_1", label: "Green Flag 1", example: "✅ They remember small details about you" },
      { key: "green_2", label: "Green Flag 2", example: "✅ They celebrate your wins genuinely" },
      { key: "green_3", label: "Green Flag 3", example: "✅ They communicate when something bothers them" },
      { key: "red_1", label: "Red Flag 1", example: "🚩 They never apologize first" },
      { key: "red_2", label: "Red Flag 2", example: "🚩 They guilt-trip you for spending time with friends" },
      { key: "red_3", label: "Red Flag 3", example: "🚩 They only reach out when they need something" },
      { key: "cta", label: "Call to Action", example: "Drop a ✅ or 🚩 for which ones you've experienced." },
    ],
  },
  {
    id: "story-time-cringe",
    name: "Cringe Storytime",
    niche: "general",
    category: "story",
    duration: "medium",
    template: "The most cringe thing that ever happened to me:\n\n{story}\n\nI wanted to disappear. {reaction}\n\nTo this day, {aftermath}.\n\n{cta}",
    placeholders: [
      { key: "story", label: "Story", example: "I accidentally sent a voice memo roasting my boss... to my boss." },
      { key: "reaction", label: "Reaction", example: "My soul left my body." },
      { key: "aftermath", label: "Aftermath", example: "I can't make eye contact with him in meetings" },
      { key: "cta", label: "Call to Action", example: "What's your most cringe moment? Tell me in the comments." },
    ],
  },
  {
    id: "day-in-my-life",
    name: "Day In My Life",
    niche: "general",
    category: "story",
    duration: "long",
    template: "A day in my life as a {role}:\n\n{time_1}: {activity_1}\n{time_2}: {activity_2}\n{time_3}: {activity_3}\n{time_4}: {activity_4}\n{time_5}: {activity_5}\n\nMost people think {misconception}. The reality? {reality}\n\n{cta}",
    placeholders: [
      { key: "role", label: "Role", example: "full-time content creator" },
      { key: "time_1", label: "Time 1", example: "6 AM" },
      { key: "activity_1", label: "Activity 1", example: "Wake up, no phone for the first hour" },
      { key: "time_2", label: "Time 2", example: "7 AM" },
      { key: "activity_2", label: "Activity 2", example: "Workout — non-negotiable" },
      { key: "time_3", label: "Time 3", example: "9 AM" },
      { key: "activity_3", label: "Activity 3", example: "Batch create content for the week" },
      { key: "time_4", label: "Time 4", example: "2 PM" },
      { key: "activity_4", label: "Activity 4", example: "Engage with community and respond to comments" },
      { key: "time_5", label: "Time 5", example: "6 PM" },
      { key: "activity_5", label: "Activity 5", example: "Done. Phone off. Rest." },
      { key: "misconception", label: "Misconception", example: "it's all glamorous" },
      { key: "reality", label: "Reality", example: "it's 90% discipline and 10% creativity" },
      { key: "cta", label: "Call to Action", example: "Follow for more behind-the-scenes content." },
    ],
  },
];

// Get unique niches from templates
export function getTemplateNiches(): string[] {
  return [...new Set(SCRIPT_TEMPLATES.map(t => t.niche))].sort();
}

// Get templates by niche
export function getTemplatesByNiche(niche: string): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(t => t.niche === niche || t.niche === "general");
}

// Get templates by category
export function getTemplatesByCategory(category: ScriptTemplate["category"]): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(t => t.category === category);
}

// Get templates by duration
export function getTemplatesByDuration(duration: ScriptTemplate["duration"]): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(t => t.duration === duration);
}
