"use client";
import { useState, useEffect } from "react";

interface ChatMessage {
  sender: "left" | "right";
  text: string;
}

const TPLS = [
  { id:"minecraft-parkour", name:"Minecraft Parkour", tag:"MC" },
  { id:"subway-surfers", name:"Subway Surfers", tag:"SS" },
  { id:"satisfying-loops", name:"Satisfying Loops", tag:"SL" },
  { id:"ai-cartoon", name:"AI Cartoon", tag:"AC" },
];

const CHAT_STYLES = [
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "horror", label: "Horror", emoji: "👻" },
  { id: "drama", label: "Drama", emoji: "🎭" },
  { id: "romance", label: "Romance", emoji: "💕" },
  { id: "wholesome", label: "Wholesome", emoji: "🥹" },
  { id: "revenge", label: "Revenge", emoji: "🔥" },
  { id: "shocking", label: "Shocking", emoji: "😱" },
  { id: "relatable", label: "Relatable", emoji: "💀" },
];

export default function FakeChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "right", text: "" },
    { sender: "left", text: "" },
  ]);
  const [tpl, setTpl] = useState("minecraft-parkour");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // AI generation state
  const [aiTopic, setAiTopic] = useState("");
  const [aiStyle, setAiStyle] = useState("funny");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  useEffect(()=>{fetch("/api/admin/check").then(r=>r.json()).then(d=>setIsAdmin(d.isAdmin??false)).catch(()=>{});},[]);

  const extractErr = (d: {error?: string | {message?: string}}) => typeof d.error === "string" ? d.error : d.error?.message || "Request failed";

  // AI Generate chat messages from topic
  const generateChat = async () => {
    if (!aiTopic.trim()) { setErr("Enter a topic first"); return; }
    setAiBusy(true);
    setErr("");
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 60000);
      const res = await fetch("/api/video/fakechat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), style: aiStyle, messageCount: 12 }),
        signal: c.signal,
      });
      clearTimeout(t);
      const data = await res.json();
      if (!res.ok) { setErr(extractErr(data)); return; }
      setMessages(data.messages);
      setTitle(aiTopic.trim());
      setAiGenerated(true);
    } catch (e: unknown) {
      setErr(e instanceof DOMException && e.name === "AbortError"
        ? "AI generation timed out"
        : "Failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setAiBusy(false);
  };

  const addMessage = (sender: "left" | "right") => {
    setMessages([...messages, { sender, text: "" }]);
  };

  const removeMessage = (idx: number) => {
    if (messages.length <= 2) return;
    setMessages(messages.filter((_, i) => i !== idx));
  };

  const updateMessage = (idx: number, text: string) => {
    const updated = [...messages];
    updated[idx] = { ...updated[idx], text };
    setMessages(updated);
  };

  const swapSender = (idx: number) => {
    const updated = [...messages];
    updated[idx] = {
      ...updated[idx],
      sender: updated[idx].sender === "left" ? "right" : "left",
    };
    setMessages(updated);
  };

  const moveMessage = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= messages.length) return;
    const updated = [...messages];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setMessages(updated);
  };

  const generate = async () => {
    const validMessages = messages.filter(m => m.text.trim());
    if (validMessages.length < 2) {
      setErr("Need at least 2 messages with text");
      return;
    }

    setBusy(true);
    setErr("");
    setUrl("");

    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 180000);
      const res = await fetch("/api/video/fakechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: validMessages,
          templateId: tpl,
          title: title || "Fake Chat Video",
        }),
        signal: c.signal,
      });
      clearTimeout(t);
      const data = await res.json();
      if (!res.ok) { setErr(extractErr(data)); return; }
      setUrl(data.videoUrl);
    } catch (e: unknown) {
      setErr(e instanceof DOMException && e.name === "AbortError"
        ? "Video generation timed out (took too long)"
        : "Failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setBusy(false);
  };

  const validMsgCount = messages.filter(m => m.text.trim()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl">Fake Text Chat Video</h1>
        <p className="text-[13px] mt-1" style={{color:"var(--muted)"}}>
          Create viral iPhone/WhatsApp style chat videos — like Short AI
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Chat Builder */}
        <div className="space-y-6">
          {/* AI Topic Generator */}
          <div className="liquid-card p-6" style={{border: "1px solid rgba(201,168,124,0.3)"}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[14px]">✨</span>
              <h3 className="font-semibold">AI Chat Generator</h3>
            </div>
            <p className="text-[12px] mb-4" style={{color:"var(--muted)"}}>Enter a topic and AI writes the entire conversation</p>

            <div className="space-y-3">
              <input
                type="text"
                value={aiTopic}
                onChange={e=>setAiTopic(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!aiBusy&&generateChat()}
                placeholder="e.g., my ex texts me at 3am, breakup conversation, job interview gone wrong..."
                className="w-full px-4 py-2.5 rounded-xl liquid-input text-[13px]"
              />

              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{color:"var(--muted)"}}>Chat Style</label>
                <div className="flex flex-wrap gap-2">
                  {CHAT_STYLES.map(s => (
                    <button key={s.id} onClick={()=>setAiStyle(s.id)} className="px-3 py-1.5 rounded-lg text-[11px]" style={{border:`1px solid ${aiStyle===s.id?"var(--accent-copper)":"var(--lg-border)"}`,background:aiStyle===s.id?"rgba(201,168,124,0.15)":"var(--lg-bg)",color:aiStyle===s.id?"var(--foreground)":"var(--muted)"}}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generateChat} disabled={aiBusy||!aiTopic.trim()} className="w-full py-2.5 liquid-btn-primary text-[13px] disabled:opacity-50">
                {aiBusy ? "Generating chat..." : "✨ AI Generate Chat"}
              </button>
            </div>

            {aiGenerated && (
              <p className="text-[11px] mt-2" style={{color:"var(--success)"}}>✓ Chat generated — edit messages below or generate the video</p>
            )}
          </div>

          {/* Template */}
          <div className="liquid-card p-6">
            <h3 className="font-semibold mb-4">Background</h3>
            <div className="grid grid-cols-4 gap-3">
              {TPLS.map(t => (
                <button key={t.id} onClick={()=>setTpl(t.id)} className="p-3 rounded-xl text-center" style={{border:`1px solid ${tpl===t.id?"var(--accent-copper)":"var(--lg-border)"}`,background:tpl===t.id?"rgba(201,168,124,0.08)":"var(--lg-bg)"}}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold mx-auto mb-1" style={{background:"rgba(201,168,124,0.15)",color:"var(--accent-copper)"}}>{t.tag}</div>
                  <p className="text-[10px]">{t.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Builder */}
          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chat Messages</h3>
              <span className="text-[11px]" style={{color:"var(--muted)"}}>{validMsgCount} messages</span>
            </div>

            {/* iPhone-style chat preview */}
            <div className="rounded-2xl p-4 mb-4 space-y-3 max-h-[300px] overflow-y-auto" style={{background:"#000",border:"1px solid var(--lg-border)"}}>
              {messages.filter(m => m.text.trim()).map((m, i) => (
                <div key={i} className={`flex ${m.sender === "right" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px]" style={{
                    background: m.sender === "right" ? "#0B93F6" : "#333",
                    color: "#fff",
                    borderBottomRightRadius: m.sender === "right" ? "4px" : "18px",
                    borderBottomLeftRadius: m.sender === "left" ? "4px" : "18px",
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {validMsgCount === 0 && (
                <p className="text-center text-[12px] py-4" style={{color:"#666"}}>Use AI to generate a chat or type messages below</p>
              )}
            </div>

            {/* Message inputs */}
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={()=>swapSender(i)} className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{background:m.sender==="left"?"rgba(34,197,94,0.15)":"rgba(59,130,246,0.15)",color:m.sender==="left"?"var(--success)":"#3b82f6",border:`1px solid ${m.sender==="left"?"rgba(34,197,94,0.3)":"rgba(59,130,246,0.3)"}`}}>
                    {m.sender==="left"?"L":"R"}
                  </button>
                  <input
                    type="text"
                    value={m.text}
                    onChange={e=>updateMessage(i, e.target.value)}
                    placeholder={m.sender==="left"?"Other person says...":"You say..."}
                    className="flex-1 px-3 py-2 rounded-lg text-[12px] liquid-input"
                  />
                  <div className="flex gap-1">
                    <button onClick={()=>moveMessage(i,-1)} disabled={i===0} className="w-6 h-6 rounded flex items-center justify-center text-[10px] disabled:opacity-20" style={{color:"var(--muted)"}}>↑</button>
                    <button onClick={()=>moveMessage(i,1)} disabled={i===messages.length-1} className="w-6 h-6 rounded flex items-center justify-center text-[10px] disabled:opacity-20" style={{color:"var(--muted)"}}>↓</button>
                    <button onClick={()=>removeMessage(i)} disabled={messages.length<=2} className="w-6 h-6 rounded flex items-center justify-center text-[10px] disabled:opacity-20" style={{color:"var(--danger)"}}>×</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={()=>addMessage("right")} className="flex-1 py-2 rounded-lg text-[11px]" style={{background:"rgba(59,130,246,0.1)",color:"#3b82f6",border:"1px solid rgba(59,130,246,0.2)"}}>
                + You message
              </button>
              <button onClick={()=>addMessage("left")} className="flex-1 py-2 rounded-lg text-[11px]" style={{background:"rgba(34,197,94,0.1)",color:"var(--success)",border:"1px solid rgba(34,197,94,0.2)"}}>
                + Other message
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="liquid-card p-6">
            <label className="block text-[11px] uppercase mb-2" style={{color:"var(--muted)"}}>Video Title</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., My Crazy Ex" className="w-full px-4 py-2.5 rounded-xl liquid-input text-[13px]" />
          </div>

          <button onClick={generate} disabled={busy || validMsgCount < 2} className="w-full py-3 liquid-btn-primary text-[13px] disabled:opacity-50">
            {busy ? "Generating Video... (1-2 min)" : isAdmin ? "Generate Chat Video (Free)" : "Generate Chat Video (10 credits)"}
          </button>

          {err && <div className="p-3 rounded-xl text-[12px]" style={{background:"rgba(224,108,117,0.1)",color:"var(--danger)"}}>{err}</div>}
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <div className="liquid-card p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            {url ? (
              <video src={url} controls className="w-full rounded-xl" style={{aspectRatio:"9/16",maxHeight:500}} />
            ) : (
              <div className="rounded-xl flex items-center justify-center" style={{aspectRatio:"9/16",maxHeight:500,background:"var(--lg-bg)",border:"1px solid var(--lg-border)"}}>
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-[13px]" style={{color:"var(--muted)"}}>Your chat video will appear here</p>
                </div>
              </div>
            )}
          </div>

          {url && (
            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-3">Publish</h3>
              <div className="space-y-2">
                <button className="w-full py-2.5 liquid-btn text-[12px]">TikTok</button>
                <button className="w-full py-2.5 liquid-btn text-[12px]">YouTube Shorts</button>
                <button className="w-full py-2.5 liquid-btn text-[12px]">Instagram Reels</button>
              </div>
            </div>
          )}

          <div className="liquid-card p-6">
            <h3 className="font-semibold mb-3">How It Works</h3>
            <div className="space-y-2 text-[12px]" style={{color:"var(--muted)"}}>
              <p>1. Enter a topic (e.g., "breakup at 3am")</p>
              <p>2. Pick a style: funny, horror, drama, romance...</p>
              <p>3. AI generates the entire conversation</p>
              <p>4. Edit any messages you want to change</p>
              <p>5. Generate video with voiceover + background</p>
              <p>6. Share on TikTok, YouTube Shorts, or Reels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
