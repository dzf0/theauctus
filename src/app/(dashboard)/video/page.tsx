"use client";
import { useState, useEffect } from "react";
import { SCRIPT_TEMPLATES } from "@/lib/script-templates";
import { CAPTION_STYLES } from "@/lib/caption-styles";

const TPLS = [
  { id:"minecraft-parkour", name:"Minecraft Parkour", tag:"MC" },
  { id:"subway-surfers", name:"Subway Surfers", tag:"SS" },
  { id:"gta-gameplay", name:"GTA V", tag:"GT" },
  { id:"satisfying-loops", name:"Satisfying Loops", tag:"SL" },
  { id:"nature-stock", name:"Nature", tag:"NA" },
  { id:"ai-cartoon", name:"AI Cartoon", tag:"AC" },
];
const STYLES = ["educational","storytelling","hot-take","tutorial","listicle"];
const DURS = [15,30,45,60];

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "hook", label: "Hooks" },
  { id: "story", label: "Stories" },
  { id: "list", label: "Lists" },
  { id: "myth", label: "Myths" },
  { id: "secret", label: "Secrets" },
  { id: "challenge", label: "Challenges" },
] as const;

export default function VideoGen() {
  const [tpl,setTpl] = useState("minecraft-parkour");
  const [topic,setTopic] = useState("");
  const [style,setStyle] = useState("educational");
  const [dur,setDur] = useState(30);
  const [script,setScript] = useState("");
  const [busy,setBusy] = useState(false);
  const [url,setUrl] = useState("");
  const [err,setErr] = useState("");
  const [isAdmin,setIsAdmin] = useState(false);

  // Script template state
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});

  // Caption style state
  const [captionStyle, setCaptionStyle] = useState<string>("tiktok-classic");
  const [showCaptionPicker, setShowCaptionPicker] = useState(false);

  // Reddit URL state
  const [redditUrl, setRedditUrl] = useState("");
  const [redditBusy, setRedditBusy] = useState(false);

  useEffect(()=>{fetch("/api/admin/check").then(r=>r.json()).then(d=>setIsAdmin(d.isAdmin??false)).catch(()=>{});},[]);

  const extractErr = (d: {error?: string | {message?: string}}) => typeof d.error === "string" ? d.error : d.error?.message || "Request failed";

  // Filter templates by category
  const filteredTemplates = SCRIPT_TEMPLATES.filter(t =>
    templateCat === "all" || t.category === templateCat
  );

  // Apply template with variables
  const applyTemplate = (templateId: string) => {
    const tmpl = SCRIPT_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    setSelectedTemplate(templateId);

    // Pre-fill topic from current input
    const vars: Record<string, string> = { topic: topic || "" };
    tmpl.placeholders?.forEach(p => {
      if (!vars[p.key]) vars[p.key] = "";
    });
    setTemplateVars(vars);
  };

  const generateFromTemplate = () => {
    const tmpl = SCRIPT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!tmpl) return;

    let result = tmpl.template;
    for (const [key, value] of Object.entries(templateVars)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value || `[${key}]`);
    }
    setScript(result);
    setShowTemplates(false);
    if (templateVars.topic) setTopic(templateVars.topic);
  };

  const genRedditScript = async()=>{if(!redditUrl.trim()){setErr("Enter a Reddit URL");return}setBusy(true);setErr("");try{const c=new AbortController();const t=setTimeout(()=>c.abort(),60000);const r=await fetch("/api/video/reddit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:redditUrl.trim(),duration:dur}),signal:c.signal});clearTimeout(t);const d=await r.json();if(!r.ok){setErr(extractErr(d));return}setScript(d.script);setRedditUrl("")}catch(e:unknown){setErr(e instanceof DOMException&&e.name==="AbortError"?"Request timed out":"Failed: "+(e instanceof Error?e.message:String(e)))}setBusy(false)};

  const genScript = async()=>{setBusy(true);setErr("");try{const c=new AbortController();const t=setTimeout(()=>c.abort(),60000);const r=await fetch("/api/video/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topic||"interesting facts",style,duration:dur}),signal:c.signal});clearTimeout(t);const txt=await r.text();let d: Record<string,unknown>;try{d=JSON.parse(txt)}catch{console.error("[video] Non-JSON response:",txt.substring(0,200));setErr("Server error — check if you're logged in");return}if(!r.ok){setErr(extractErr(d as {error?: string | {message?: string}}));return}setScript(d.script as string)}catch(e:unknown){console.error("[video] Script generation error:",e);setErr(e instanceof DOMException&&e.name==="AbortError"?"Request timed out — try again (Gemini can be slow)":"Failed to generate script: "+(e instanceof Error?e.message:String(e)))}setBusy(false)};

  const genVideo = async()=>{if(!script.trim()){setErr("Generate script first");return}setBusy(true);setErr("");setUrl("");try{const c=new AbortController();const t=setTimeout(()=>c.abort(),120000);const r=await fetch("/api/video/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({templateId:tpl,script,title:topic||"AI Video",captionStyleId:captionStyle}),signal:c.signal});clearTimeout(t);const d=await r.json();if(!r.ok){setErr(extractErr(d));return}setUrl(d.videoUrl)}catch(e:unknown){setErr(e instanceof DOMException&&e.name==="AbortError"?"Video generation timed out":"Video generation failed")}setBusy(false)};

  const wc=script.split(/\s+/).filter(Boolean).length;

  return(<div className="space-y-6"><div><h1 className="font-headline text-2xl">Video Generator</h1><p className="text-[13px] mt-1" style={{color:"var(--muted)"}}>Create short-form videos for YouTube Shorts, TikTok, and Reels</p></div>
  <div className="grid lg:grid-cols-2 gap-6"><div className="space-y-6">
  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Template</h3><div className="grid grid-cols-3 gap-3">{TPLS.map(t=><button key={t.id} onClick={()=>setTpl(t.id)} className="p-3 rounded-xl text-left" style={{border:`1px solid ${tpl===t.id?"var(--accent-copper)":"var(--lg-border)"}`,background:tpl===t.id?"rgba(201,168,124,0.08)":"var(--lg-bg)"}}><div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold mb-2" style={{background:"rgba(201,168,124,0.15)",color:"var(--accent-copper)"}}>{t.tag}</div><p className="text-[12px] font-medium">{t.name}</p></button>)}</div></div>

  {/* Caption Style Picker */}
  <div className="liquid-card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">Caption Style</h3>
      <button onClick={()=>setShowCaptionPicker(!showCaptionPicker)} className="text-[11px] px-2 py-1 rounded-lg" style={{background:"var(--lg-bg)",color:"var(--accent-copper)",border:"1px solid var(--lg-border)"}}>
        {showCaptionPicker ? "Hide" : "Show All"}
      </button>
    </div>
    <div className={`flex flex-wrap gap-2 ${showCaptionPicker ? "" : "max-h-[80px] overflow-hidden"}`}>
      {CAPTION_STYLES.map(s => (
        <button key={s.id} onClick={()=>setCaptionStyle(s.id)} className="px-3 py-1.5 rounded-lg text-[11px] transition-all" style={{border:`1px solid ${captionStyle===s.id?"var(--accent-copper)":"var(--lg-border)"}`,background:captionStyle===s.id?"rgba(201,168,124,0.15)":"var(--lg-bg)",color:captionStyle===s.id?"var(--foreground)":"var(--muted)"}}>
          {s.name}{s.creator ? ` ✓` : ""}
        </button>
      ))}
    </div>
    {showCaptionPicker && <div className="mt-3 p-3 rounded-lg text-[11px]" style={{background:"var(--lg-bg)",border:"1px solid var(--lg-border)",color:"var(--muted)"}}>
      <p className="font-medium mb-1" style={{color:"var(--foreground)"}}>{CAPTION_STYLES.find(s=>s.id===captionStyle)?.name}</p>
      <p>{CAPTION_STYLES.find(s=>s.id===captionStyle)?.description}</p>
    </div>}
  </div>

  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Content</h3><div className="space-y-4">
  <div><label className="block text-[11px] uppercase mb-2" style={{color:"var(--muted)"}}>Topic</label><input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g., 5 productivity hacks" className="w-full px-4 py-2.5 rounded-xl liquid-input text-[13px]" /></div>
  <div><label className="block text-[11px] uppercase mb-2" style={{color:"var(--muted)"}}>Style</label><div className="flex flex-wrap gap-2">{STYLES.map(s=><button key={s} onClick={()=>setStyle(s)} className="px-3 py-1.5 rounded-lg text-[11px]" style={{border:`1px solid ${style===s?"var(--accent-copper)":"var(--lg-border)"}`,background:style===s?"rgba(201,168,124,0.1)":"var(--lg-bg)",color:style===s?"var(--foreground)":"var(--muted)"}}>{s}</button>)}</div></div>
  <div><label className="block text-[11px] uppercase mb-2" style={{color:"var(--muted)"}}>Duration</label><div className="flex gap-2">{DURS.map(d=><button key={d} onClick={()=>setDur(d)} className="px-4 py-2 rounded-lg text-[12px]" style={{border:`1px solid ${dur===d?"var(--accent-copper)":"var(--lg-border)"}`,background:dur===d?"rgba(201,168,124,0.1)":"var(--lg-bg)",color:dur===d?"var(--foreground)":"var(--muted)"}}>{d}s</button>)}</div></div>

  {/* Reddit URL to Video */}
  <div className="p-3 rounded-xl" style={{background:"var(--lg-bg)",border:"1px solid var(--lg-border)"}}>
    <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{color:"var(--muted)"}}>Reddit URL → Video</label>
    <div className="flex gap-2">
      <input type="text" value={redditUrl} onChange={e=>setRedditUrl(e.target.value)} placeholder="Paste a Reddit post URL..." className="flex-1 px-3 py-2 rounded-lg text-[12px] liquid-input" />
      <button onClick={genRedditScript} disabled={busy||!redditUrl.trim()} className="px-4 py-2 rounded-lg text-[11px] shrink-0" style={{background:"rgba(255,69,0,0.1)",color:"#ff4500",border:"1px solid rgba(255,69,0,0.2)"}}>Import</button>
    </div>
  </div>

  {/* Script Templates Button */}
  <div className="flex gap-2">
    <button onClick={()=>setShowTemplates(true)} className="flex-1 py-2.5 text-[13px] rounded-xl" style={{background:"var(--lg-bg)",border:"1px solid var(--lg-border)",color:"var(--accent-copper)"}}>
      Browse 50+ Templates
    </button>
    <button onClick={genScript} disabled={busy} className="flex-1 py-2.5 liquid-btn-primary text-[13px] disabled:opacity-50">{busy?"Generating...":"AI Generate"}</button>
  </div>
  </div></div>

  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Script</h3><textarea value={script} onChange={e=>setScript(e.target.value)} placeholder="AI script appears here. Edit it." className="w-full h-40 px-4 py-3 rounded-xl liquid-input text-[13px] resize-none" /><div className="flex justify-between mt-2 text-[11px]" style={{color:"var(--muted)"}}><span>{wc} words</span><span>~{Math.round(wc/2.5)}s</span></div></div>
  </div><div className="space-y-6">
  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Preview</h3>{url?<video src={url} controls className="w-full rounded-xl" style={{aspectRatio:"9/16",maxHeight:500}} />:<div className="rounded-xl flex items-center justify-center" style={{aspectRatio:"9/16",maxHeight:500,background:"var(--lg-bg)",border:"1px solid var(--lg-border)"}}><p className="text-[13px]" style={{color:"var(--muted)"}}>Video preview here</p></div>}</div>
  <button onClick={genVideo} disabled={busy||!script.trim()} className="w-full py-3 liquid-btn-primary text-[13px] disabled:opacity-50">{busy?"Generating Video... (1 min)":isAdmin?"Generate Video (Free)":"Generate Video (10 credits)"}</button>
  {err&&<div className="p-3 rounded-xl text-[12px]" style={{background:"rgba(224,108,117,0.1)",color:"var(--danger)"}}>{err}</div>}
  {url&&<div className="liquid-card p-6"><h3 className="font-semibold mb-3">Publish</h3><div className="space-y-2"><button className="w-full py-2.5 liquid-btn text-[12px]">YouTube Shorts</button><button className="w-full py-2.5 liquid-btn text-[12px]">TikTok</button><button className="w-full py-2.5 liquid-btn text-[12px]">Instagram Reels</button></div></div>}
  </div></div>

  {/* Script Templates Modal */}
  {showTemplates && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.7)"}} onClick={()=>setShowTemplates(false)}>
      <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl" style={{background:"var(--lg-bg-strong)",border:"1px solid var(--lg-border)"}} onClick={e=>e.stopPropagation()}>
        <div className="p-5 border-b" style={{borderColor:"var(--lg-border)"}}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline text-lg" style={{color:"var(--foreground)"}}>Script Templates</h2>
            <button onClick={()=>setShowTemplates(false)} style={{color:"var(--muted)"}}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map(c => (
              <button key={c.id} onClick={()=>setTemplateCat(c.id)} className="px-3 py-1.5 rounded-lg text-[11px]" style={{border:`1px solid ${templateCat===c.id?"var(--accent-copper)":"var(--lg-border)"}`,background:templateCat===c.id?"rgba(201,168,124,0.15)":"var(--lg-bg)",color:templateCat===c.id?"var(--foreground)":"var(--muted)"}}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredTemplates.map(t => (
            <button key={t.id} onClick={()=>applyTemplate(t.id)} className="w-full p-4 rounded-xl text-left transition-all" style={{border:`1px solid ${selectedTemplate===t.id?"var(--accent-copper)":"var(--lg-border)"}`,background:selectedTemplate===t.id?"rgba(201,168,124,0.08)":"var(--lg-bg)"}}>
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider" style={{background:"rgba(201,168,124,0.12)",color:"var(--accent-copper)"}}>{t.category}</div>
                <div className="px-2 py-0.5 rounded text-[9px] uppercase" style={{background:"var(--lg-bg)",color:"var(--muted)"}}>{t.duration}</div>
              </div>
              <p className="font-medium text-[13px] mt-2" style={{color:"var(--foreground)"}}>{t.name}</p>
              <p className="text-[11px] mt-1 line-clamp-2" style={{color:"var(--muted)"}}>{t.template.substring(0, 120)}...</p>
              {selectedTemplate === t.id && t.placeholders && t.placeholders.length > 0 && (
                <div className="mt-3 space-y-2" onClick={e=>e.stopPropagation()}>
                  {t.placeholders.map(p => (
                    <div key={p.key}>
                      <label className="block text-[10px] uppercase mb-1" style={{color:"var(--muted)"}}>{p.label}</label>
                      <input type="text" value={templateVars[p.key]||""} onChange={e=>setTemplateVars({...templateVars,[p.key]:e.target.value})} placeholder={p.example} className="w-full px-3 py-1.5 rounded-lg text-[12px] liquid-input" />
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
        {selectedTemplate && (
          <div className="p-5 border-t" style={{borderColor:"var(--lg-border)"}}>
            <button onClick={generateFromTemplate} className="w-full py-3 liquid-btn-primary text-[13px]">Apply Template</button>
          </div>
        )}
      </div>
    </div>
  )}
  </div>);
}
