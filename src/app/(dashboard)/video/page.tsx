"use client";
import { useState } from "react";

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

export default function VideoGen() {
  const [tpl,setTpl] = useState("minecraft-parkour");
  const [topic,setTopic] = useState("");
  const [style,setStyle] = useState("educational");
  const [dur,setDur] = useState(30);
  const [script,setScript] = useState("");
  const [busy,setBusy] = useState(false);
  const [url,setUrl] = useState("");
  const [err,setErr] = useState("");

  const genScript = async()=>{setBusy(true);setErr("");try{const r=await fetch("/api/video/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topic||"interesting facts",style,duration:dur})});const d=await r.json();if(!r.ok){setErr(d.error);return}setScript(d.script)}catch{setErr("Failed")}setBusy(false)};

  const genVideo = async()=>{if(!script.trim()){setErr("Generate script first");return}setBusy(true);setErr("");setUrl("");try{const r=await fetch("/api/video/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({templateId:tpl,script,title:topic||"AI Video"})});const d=await r.json();if(!r.ok){setErr(d.error);return}setUrl(d.videoUrl)}catch{setErr("Video failed")}setBusy(false)};

  const wc=script.split(/\s+/).filter(Boolean).length;

  return(<div className="space-y-6"><div><h1 className="font-headline text-2xl">Video Generator</h1><p className="text-[13px] mt-1" style={{color:"var(--muted)"}}>Create short-form videos for YouTube Shorts, TikTok, and Reels</p></div>
  <div className="grid lg:grid-cols-2 gap-6"><div className="space-y-6">
  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Template</h3><div className="grid grid-cols-3 gap-3">{TPLS.map(t=><button key={t.id} onClick={()=>setTpl(t.id)} className="p-3 rounded-xl text-left" style={{border:`1px solid ${tpl===t.id?"var(--accent-copper)":"var(--lg-border)"}`,background:tpl===t.id?"rgba(201,168,124,0.08)":"var(--lg-bg)"}}><div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold mb-2" style={{background:"rgba(201,168,124,0.15)",color:"var(--accent-copper)"}}>{t.tag}</div><p className="text-[12px] font-medium">{t.name}</p></button>)}</div></div>
  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Content</h3><div className="space-y-4">
  <div><label className="block text-[11px] uppercase mb-2" style={{color:"var(--muted)"}}>Topic</label><input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g., 5 productivity hacks" className="w-full px-4 py-2.5 rounded-xl liquid-input text-[13px]" /></div>
  <div><label className="block text-[11px] uppercase mb-2" style={{color:"var(--muted)"}}>Style</label><div className="flex flex-wrap gap-2">{STYLES.map(s=><button key={s} onClick={()=>setStyle(s)} className="px-3 py-1.5 rounded-lg text-[11px]" style={{border:`1px solid ${style===s?"var(--accent-copper)":"var(--lg-border)"}`,background:style===s?"rgba(201,168,124,0.1)":"var(--lg-bg)",color:style===s?"var(--foreground)":"var(--muted)"}}>{s}</button>)}</div></div>
  <div><label className="block text-[11px] uppercase mb-2" style={{color:"var(--muted)"}}>Duration</label><div className="flex gap-2">{DURS.map(d=><button key={d} onClick={()=>setDur(d)} className="px-4 py-2 rounded-lg text-[12px]" style={{border:`1px solid ${dur===d?"var(--accent-copper)":"var(--lg-border)"}`,background:dur===d?"rgba(201,168,124,0.1)":"var(--lg-bg)",color:dur===d?"var(--foreground)":"var(--muted)"}}>{d}s</button>)}</div></div>
  <button onClick={genScript} disabled={busy} className="w-full py-2.5 liquid-btn-primary text-[13px] disabled:opacity-50">{busy?"Generating...":"Generate AI Script"}</button></div></div>
  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Script</h3><textarea value={script} onChange={e=>setScript(e.target.value)} placeholder="AI script appears here. Edit it." className="w-full h-40 px-4 py-3 rounded-xl liquid-input text-[13px] resize-none" /><div className="flex justify-between mt-2 text-[11px]" style={{color:"var(--muted)"}}><span>{wc} words</span><span>~{Math.round(wc/2.5)}s</span></div></div>
  </div><div className="space-y-6">
  <div className="liquid-card p-6"><h3 className="font-semibold mb-4">Preview</h3>{url?<video src={url} controls className="w-full rounded-xl" style={{aspectRatio:"9/16",maxHeight:500}} />:<div className="rounded-xl flex items-center justify-center" style={{aspectRatio:"9/16",maxHeight:500,background:"var(--lg-bg)",border:"1px solid var(--lg-border)"}}><p className="text-[13px]" style={{color:"var(--muted)"}}>Video preview here</p></div>}</div>
  <button onClick={genVideo} disabled={busy||!script.trim()} className="w-full py-3 liquid-btn-primary text-[13px] disabled:opacity-50">{busy?"Generating Video... (1 min)":"Generate Video (10 credits)"}</button>
  {err&&<div className="p-3 rounded-xl text-[12px]" style={{background:"rgba(224,108,117,0.1)",color:"var(--danger)"}}>{err}</div>}
  {url&&<div className="liquid-card p-6"><h3 className="font-semibold mb-3">Publish</h3><div className="space-y-2"><button className="w-full py-2.5 liquid-btn text-[12px]">YouTube Shorts</button><button className="w-full py-2.5 liquid-btn text-[12px]">TikTok</button><button className="w-full py-2.5 liquid-btn text-[12px]">Instagram Reels</button></div></div>}
  <div className="liquid-card p-6"><h3 className="font-semibold mb-3">How It Works</h3><div className="space-y-2 text-[12px]" style={{color:"var(--muted)"}}><p>1. Pick a template (Minecraft, Subway Surfers, etc.)</p><p>2. Enter a topic</p><p>3. AI generates script (Gemini - free)</p><p>4. Voiceover (ElevenLabs - free tier)</p><p>5. FFmpeg composes video with captions</p><p>6. Publish to YouTube Shorts, TikTok, Reels</p></div></div>
  </div></div></div>);
}
