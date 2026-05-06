import { useState, useCallback } from "react";

const GENRE_PRESETS = {
  luxury_commercial: { label: "럭셔리 광고", colorPalette: "Deep black, warm gold, ivory white", cinematography: "Shallow depth of field, macro beauty shots, slow motion", audio: "Orchestral strings, soft piano, ambient luxury soundscape" },
  romance_short: { label: "로맨스 단편", colorPalette: "Warm amber, soft rose, candlelight gold", cinematography: "Handheld intimacy, golden hour light, rack focus", audio: "Acoustic guitar, soft vocals, ambient city sounds" },
  beauty_ad: { label: "뷰티 광고", colorPalette: "Clean white, blush pink, metallic silver", cinematography: "High-key lighting, beauty dish, micro close-ups", audio: "Upbeat electronic, feminine pop, product sound design" },
  fashion_film: { label: "패션 필름", colorPalette: "Desaturated tones, bold accents, noir contrast", cinematography: "Wide angles, symmetry, dramatic shadows, long takes", audio: "Electronic minimalism, fashion week ambient, silence" },
  music_video: { label: "뮤직 비디오", colorPalette: "High saturation, neon accents, bold contrast", cinematography: "Dynamic cutting, creative angles, match cuts", audio: "Source music driven, beat-sync editing" },
  product_launch: { label: "제품 런칭", colorPalette: "Brand identity colors, clean white, metallic", cinematography: "Tabletop macro, studio precision, reveal shots", audio: "Cinematic build, tech sound design, impact hits" },
  travel_film: { label: "트래블 필름", colorPalette: "Rich earth tones, vivid sky blues, warm sunset", cinematography: "Drone aerials, wide establishing, time-lapse", audio: "World music fusion, ambient nature, narrator VO" },
  cinematic_trailer: { label: "시네마틱 예고편", colorPalette: "Teal & orange grade, high contrast, dark shadow", cinematography: "Hero shots, whip pans, slow motion impact", audio: "Trailer music, sub-bass hits, voice over, sound design" },
};

const SAMPLE = {
  title: "AMORE WITH A SMILE", brand: "HotLips Lipstick", format: "Commercial / Short Film",
  totalShots: 8, aspectRatio: "16:9", duration: "60–75 Sec", genre: "luxury_commercial",
  genreTone: "Romantic, Elegant, Luxurious",
  setting: "Paris, France — Evening",
  colorPalette: "Deep black, warm gold, deep red, ivory",
  character: "Elegant woman in her 30s, confident and radiant, wearing a deep red satin gown",
  wardrobe: "Deep red satin dress, gold drop earrings, black satin clutch, black stiletto heels",
  beauty: "Bold red lips (HotLips signature shade), soft smoky eye, luminous natural glow, flawless skin",
  environment: "Paris restaurant exterior, rain-slicked cobblestone streets, Eiffel Tower at dusk, intimate candlelit interior",
  moodKeywords: "Romantic, Elegant, Confident, Feminine, Timeless, Luxurious, Sophisticated",
  audio: "Orchestral strings with soft piano. Modern romantic score with cinematic strings, light piano, subtle jazz undertones. Overall tone warm, intimate, sophisticated, emotionally engaging.",
  cinematography: "Primes: 24mm, 35mm, 85mm, 100mm Macro for cinematic shallow depth-of-field look. Mostly static or smooth tracking / steadicam to maintain elegance and control. Rich warm tones, deep reds, gold highlights, soft contrast, subtle film grain.",
  shots: [
    { id:1, title:"Establishing Shot — Outside Restaurant", size:"Wide", lens:"24mm", movement:"Static", lighting:"Twilight, warm practicals, wet streets, cinematic contrast", mood:"Romantic & Inviting", action:"The iconic Paris restaurant glows as evening falls. Romantic and inviting.", prompt:"Cinematic wide shot of iconic Parisian restaurant exterior at twilight, warm glowing windows, rain-wet cobblestone reflecting golden light, Eiffel Tower background, 24mm film look" },
    { id:2, title:"Woman Walks to Entrance", size:"Wide", lens:"35mm", movement:"Tracking", lighting:"Warm street lights, soft evening glow, elegant and dreamy", mood:"Confident & Dreamy", action:"The woman walks with confidence through the Parisian street.", prompt:"Elegant woman in deep red satin dress walking on Parisian cobblestone at dusk, 35mm tracking, warm street lamps, bokeh background, cinematic fashion film" },
    { id:3, title:"Close-Up — Product (HotLips)", size:"Close-Up", lens:"85mm Macro", movement:"Static", lighting:"Soft beauty light, warm skin tones, luxurious feel", mood:"Luxurious", action:"She smiles and shows the lipstick so the label 'HotLips' is clearly visible.", prompt:"Close-up elegant woman holding HotLips lipstick, warm beauty lighting, soft bokeh, luxurious product reveal, 85mm macro, editorial beauty photography" },
    { id:4, title:"Close-Up — Lip Application", size:"Extreme Close-Up", lens:"100mm Macro", movement:"Static", lighting:"Soft, intimate, sensual", mood:"Sensual", action:"She applies the red lipstick with precision.", prompt:"Extreme close-up macro shot of perfect red lips being applied with lipstick, 100mm macro, soft intimate beauty lighting, sensual luxurious, deep red" },
    { id:5, title:"Over the Shoulder — Walking to Table", size:"Medium Wide", lens:"35mm", movement:"Steadicam", lighting:"Warm candlelight, romantic ambience", mood:"Anticipation", action:"She approaches the man at their table. Anticipation builds.", prompt:"Over-the-shoulder steadicam shot following elegant woman in red dress through candlelit Paris restaurant, warm amber light, 35mm, romantic anticipation" },
    { id:6, title:"Man Close-Up — Amore With a Smile", size:"Close-Up", lens:"85mm", movement:"Static", lighting:"Soft key light, warm, intimate", mood:"Romance", action:"He smiles at her and says 'Amore with a Smile.'", prompt:"Close-up handsome man in suit smiling warmly in candlelit Paris restaurant, 85mm portrait, soft warm key light, romantic intimate atmosphere" },
    { id:7, title:"Two Shot — Dinner Table", size:"Medium Wide", lens:"35mm", movement:"Static / Slight Push", lighting:"Romantic, warm, intimate, candlelight glow", mood:"Intimate", action:"They talk, laugh, and hold hands across the table.", prompt:"Couple laughing and holding hands across candlelit dinner table in Paris restaurant, warm romantic lighting, 35mm, intimate and luxurious" },
    { id:8, title:"Close-Up — Wink & Tagline", size:"Close-Up", lens:"85mm", movement:"Static", lighting:"Glowing, confident, playful", mood:"Playful & Glamorous", action:"She winks at the camera. End card with product name and tagline.", prompt:"Glamorous woman with perfect red lips winking playfully at camera, soft glamorous lighting, 85mm, confident joyful, HotLips Lipstick tagline end card" },
  ],
};

const callAI = async (prompt, maxTokens = 1200) => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] })
  });
  const d = await r.json();
  return d.content?.find(b => b.type === "text")?.text || "";
};

function useProject() {
  const [project, setProject] = useState({
    title: "", brand: "", format: "Commercial", totalShots: 6, aspectRatio: "16:9",
    duration: "30–60 seconds", genre: "luxury_commercial", genreTone: "Romantic, Elegant, Luxurious",
    setting: "", colorPalette: "", character: "", wardrobe: "", beauty: "",
    environment: "", moodKeywords: "", audio: "", cinematography: "",
    shots: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, title: `Shot ${i + 1}`, size: "Medium", lens: "50mm", movement: "Static", lighting: "", mood: "", action: "", prompt: "" })),
  });
  const update = useCallback((k, v) => setProject(p => ({ ...p, [k]: v })), []);
  const updateShot = useCallback((id, k, v) => setProject(p => ({ ...p, shots: p.shots.map(s => s.id === id ? { ...s, [k]: v } : s) })), []);
  const addShot = useCallback(() => setProject(p => { const nid = Math.max(...p.shots.map(s => s.id), 0) + 1; return { ...p, shots: [...p.shots, { id: nid, title: `Shot ${nid}`, size: "Medium", lens: "50mm", movement: "Static", lighting: "", mood: "", action: "", prompt: "" }] }; }), []);
  const removeShot = useCallback((id) => setProject(p => ({ ...p, shots: p.shots.filter(s => s.id !== id) })), []);
  const duplicateShot = useCallback((id) => setProject(p => { const s = p.shots.find(x => x.id === id); if (!s) return p; const nid = Math.max(...p.shots.map(x => x.id)) + 1; const idx = p.shots.findIndex(x => x.id === id); const ns = [...p.shots]; ns.splice(idx + 1, 0, { ...s, id: nid, title: s.title + " (Copy)" }); return { ...p, shots: ns }; }), []);
  const applyGenre = useCallback((g) => { const pr = GENRE_PRESETS[g]; if (!pr) return; setProject(p => ({ ...p, genre: g, colorPalette: pr.colorPalette, cinematography: pr.cinematography, audio: pr.audio })); }, []);
  const loadSample = useCallback(() => setProject(SAMPLE), []);
  return { project, setProject, update, updateShot, addShot, removeShot, duplicateShot, applyGenre, loadSample };
}

/* ── PALETTE DOTS ── */
function PaletteDots({ str, size = 18 }) {
  const colorMap = { black: "#1a1410", gold: "#c4a24a", red: "#8b1a1a", ivory: "#f5f0e8", white: "#f5f0e8", cream: "#e8dcc8", amber: "#c07820", rose: "#c87890", blue: "#304878", green: "#386040", silver: "#a8a8a0", pink: "#d89098", teal: "#307878", orange: "#c07030", purple: "#604880", brown: "#6a4830", beige: "#d8c8b0", grey: "#888880", gray: "#888880" };
  const parts = (str || "").split(",").slice(0, 5);
  const cols = parts.map(p => { const lower = p.toLowerCase().trim(); for (const [k, v] of Object.entries(colorMap)) { if (lower.includes(k)) return v; } return "#c8b89a"; });
  return <div style={{ display: "flex", gap: 5, alignItems: "center" }}>{cols.map((c, i) => <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: c, border: "1px solid #d0c0a8", flexShrink: 0 }} />)}</div>;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#ece7df;color:#1a1410;font-family:'Inter',sans-serif;min-height:100vh;}
:root{
  --c:#f7f3ed; --c2:#ece7df; --c3:#e4ddd4;
  --tan:#d4c8b4; --tan2:#c0b49e;
  --br:#6b5d4f; --br2:#4a3d32;
  --go:#9a7d3a; --go2:#c4a24a; --go3:#e8d080;
  --re:#8b1a1a; --re2:#b02020;
  --ink:#1a1410; --ink2:#2d2520; --ink3:#5a4e44;
  --bd:#d0c4b4; --bd2:#b8ac9c;
}
.app{min-height:100vh;display:flex;flex-direction:column;background:var(--c2);}

.hdr{background:var(--ink2);padding:12px 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--go2);}
.hdr-brand{display:flex;align-items:center;gap:10px;}
.hdr-logo{width:28px;height:28px;border:1px solid var(--go2);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;color:var(--go2);font-size:12px;font-style:italic;}
.hdr-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:400;color:#f0e8d8;letter-spacing:0.1em;}
.hdr-sub{font-size:9px;color:#908070;letter-spacing:0.22em;text-transform:uppercase;}

.kr-toggle{padding:6px 13px;border:1px solid var(--go2);background:rgba(196,162,74,0.12);color:var(--go2);font-family:'Inter',sans-serif;font-size:11px;cursor:pointer;letter-spacing:0.07em;transition:all .2s;display:flex;align-items:center;gap:6px;}
.kr-toggle:hover,.kr-toggle.on{background:rgba(196,162,74,0.22);}
.kr-panel{background:var(--ink2);border-bottom:1px solid var(--go);overflow:hidden;transition:max-height .3s ease,opacity .25s;max-height:0;opacity:0;}
.kr-panel.open{max-height:250px;opacity:1;}
.kr-inner{padding:16px 28px 20px;display:flex;flex-direction:column;gap:10px;}
.kr-ta{width:100%;background:#2a2218;border:1px solid #4a3d2a;color:#e8dcc8;font-family:'Inter',sans-serif;font-size:13px;padding:11px 13px;outline:none;resize:none;line-height:1.6;}
.kr-ta::placeholder{color:#7a6a58;}
.kr-ta:focus{border-color:var(--go2);}
.kr-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;}
.kr-step{font-size:11px;color:var(--go2);font-style:italic;display:flex;align-items:center;gap:7px;}
.kr-btn{padding:8px 22px;border:1px solid var(--go2);background:rgba(196,162,74,0.15);color:var(--go2);font-family:'Inter',sans-serif;font-size:12px;cursor:pointer;letter-spacing:0.07em;transition:all .2s;white-space:nowrap;}
.kr-btn:hover{background:rgba(196,162,74,0.26);}
.kr-btn:disabled{opacity:.45;cursor:not-allowed;}

.genre-bar{background:var(--c);border-bottom:1px solid var(--bd);padding:9px 28px;display:flex;align-items:center;gap:7px;overflow-x:auto;}
.g-lbl{font-size:9px;color:var(--br);letter-spacing:0.2em;text-transform:uppercase;white-space:nowrap;margin-right:4px;font-weight:600;}
.g-btn{padding:4px 12px;border:1px solid var(--bd2);background:transparent;color:var(--br);font-family:'Inter',sans-serif;font-size:11px;cursor:pointer;letter-spacing:0.03em;white-space:nowrap;transition:all .2s;}
.g-btn:hover{border-color:var(--go);color:var(--go);}
.g-btn.on{border-color:var(--re);color:var(--re);background:rgba(139,26,26,0.06);}
.samp{margin-left:auto;padding:4px 13px;border:1px solid var(--go);background:transparent;color:var(--go);font-family:'Inter',sans-serif;font-size:11px;cursor:pointer;letter-spacing:0.06em;white-space:nowrap;transition:all .2s;}
.samp:hover{background:rgba(154,125,58,0.09);}

.main-tabs{background:var(--c);border-bottom:2px solid var(--ink2);padding:0 28px;display:flex;gap:0;}
.mt-btn{padding:11px 22px;background:transparent;border:none;font-family:'Inter',sans-serif;font-size:11px;color:var(--br);cursor:pointer;letter-spacing:0.09em;text-transform:uppercase;font-weight:600;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .2s;}
.mt-btn:hover{color:var(--ink);}
.mt-btn.on{color:var(--re);border-bottom-color:var(--re);}

.wrap{flex:1;overflow-y:auto;}

.sidebar{width:172px;min-width:172px;background:var(--c);border-right:1px solid var(--bd);padding:18px 0;display:flex;flex-direction:column;gap:1px;}
.sb-btn{padding:10px 18px;background:transparent;border:none;border-left:3px solid transparent;color:var(--br);font-family:'Inter',sans-serif;font-size:12px;cursor:pointer;text-align:left;letter-spacing:0.05em;font-weight:400;transition:all .2s;}
.sb-btn:hover{color:var(--ink);background:rgba(139,26,26,0.03);}
.sb-btn.on{color:var(--re);border-left-color:var(--re);background:rgba(139,26,26,0.04);font-weight:600;}

.content{padding:28px;max-width:1200px;}

.s-title{font-family:'Playfair Display',serif;font-size:21px;font-weight:600;color:var(--ink2);margin-bottom:3px;}
.s-sub{font-size:9px;letter-spacing:0.22em;color:var(--br);text-transform:uppercase;margin-bottom:18px;font-weight:500;}
.divider{width:32px;height:2px;background:var(--re);margin:10px 0 20px;}

.fg{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:13px;}
.fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:13px;margin-bottom:13px;}
.full{grid-column:1/-1;}
.fl{display:flex;flex-direction:column;gap:5px;}
.fl-lbl{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--go);font-weight:600;}
.fl input,.fl textarea,.fl select{background:#fff;border:1px solid var(--bd);color:var(--ink);font-family:'Inter',sans-serif;font-size:13px;padding:8px 11px;outline:none;transition:border-color .2s;resize:vertical;}
.fl input:focus,.fl textarea:focus,.fl select:focus{border-color:var(--go);}
.fl select option{background:#fff;}

.card{background:#fff;border:1px solid var(--bd);padding:16px;margin-bottom:13px;border-left:3px solid var(--tan);}
.card-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:13px;gap:10px;}
.shot-num{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--tan2);line-height:1;flex-shrink:0;}
.shot-ti{background:transparent;border:none;border-bottom:1px solid var(--bd);color:var(--ink2);font-family:'Playfair Display',serif;font-size:15px;font-weight:600;padding:3px 0;width:100%;outline:none;}
.shot-ti:focus{border-bottom-color:var(--go);}

.btn{padding:7px 16px;border:1px solid var(--bd2);background:transparent;color:var(--br);font-family:'Inter',sans-serif;font-size:11px;cursor:pointer;letter-spacing:0.06em;transition:all .2s;}
.btn:hover{border-color:var(--go);color:var(--go);}
.btn-re{border-color:var(--re);color:var(--re);}
.btn-re:hover{background:rgba(139,26,26,0.06);}
.btn-go{border-color:var(--go);color:var(--go);}
.btn-go:hover{background:rgba(154,125,58,0.09);}
.btn-dk{border-color:var(--ink2);background:var(--ink2);color:#f0e8d8;}
.btn-dk:hover{background:var(--br2);}
.btn-group{display:flex;gap:9px;flex-wrap:wrap;}

.ai-box{background:var(--c);border:1px solid var(--bd);border-left:3px solid var(--go);padding:14px 16px;margin-top:13px;}
.ai-lbl{font-size:9px;letter-spacing:0.25em;color:var(--go);text-transform:uppercase;font-weight:600;margin-bottom:7px;}
.ai-txt{font-size:13px;color:var(--ink2);line-height:1.75;white-space:pre-wrap;}

.idea-bar{background:#fff;border:1px solid var(--bd);padding:12px 16px;display:flex;align-items:center;gap:13px;margin-bottom:22px;}
.idea-ta{flex:1;background:transparent;border:none;color:var(--ink);font-family:'Inter',sans-serif;font-size:13px;outline:none;resize:none;height:36px;line-height:1.5;}
.idea-ta::placeholder{color:var(--tan2);}

.kw-wrap{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.kw{padding:3px 11px;border:1px solid var(--bd2);font-size:11px;color:var(--br);cursor:pointer;transition:all .2s;letter-spacing:0.04em;}
.kw:hover{border-color:var(--go);color:var(--go);}
.kw.on{border-color:var(--re);color:var(--re);background:rgba(139,26,26,0.05);}

.exp-opt{background:#fff;border:1px solid var(--bd);padding:16px 20px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px;margin-bottom:9px;}
.exp-opt:hover{border-color:var(--go);background:var(--c);}
.exp-title{font-family:'Playfair Display',serif;font-size:15px;color:var(--ink2);margin-bottom:2px;}
.exp-desc{font-size:11px;color:var(--br);}

.spin{display:inline-block;width:11px;height:11px;border:1.5px solid var(--tan2);border-top-color:var(--go);border-radius:50%;animation:sp .8s linear infinite;}
@keyframes sp{to{transform:rotate(360deg);}}

/* ═══ PRODUCTION SHEET ═══ */
.ps{background:var(--c);font-family:'Inter',sans-serif;color:var(--ink);}
.ps-topbar{background:var(--ink2);color:#f0e8d8;padding:14px 22px;display:flex;align-items:center;gap:0;flex-wrap:wrap;}
.ps-tb-main{display:flex;flex-direction:column;padding-right:22px;margin-right:22px;border-right:1px solid #3a3028;}
.ps-tb-lbl{font-size:7px;letter-spacing:0.25em;color:var(--go2);text-transform:uppercase;margin-bottom:3px;}
.ps-tb-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#f0e8d8;letter-spacing:0.08em;line-height:1.1;display:flex;align-items:center;gap:10px;}
.ps-meta{display:flex;align-items:stretch;gap:0;flex-wrap:wrap;}
.ps-meta-blk{padding:0 18px;border-right:1px solid #3a3028;display:flex;flex-direction:column;justify-content:center;}
.ps-meta-blk:last-child{border-right:none;}
.ps-meta-lbl{font-size:7px;letter-spacing:0.2em;color:var(--go2);text-transform:uppercase;margin-bottom:3px;}
.ps-meta-val{font-size:12px;font-weight:600;color:#f0e8d8;letter-spacing:0.05em;}
.ps-body{display:grid;grid-template-columns:310px 1fr;border:1px solid var(--tan);border-top:none;}
.ps-left{border-right:1px solid var(--tan);}
.ps-panel-hdr{font-size:8px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;color:var(--ink2);background:var(--tan);padding:7px 13px;border-bottom:1px solid var(--bd);}
.ps-sec{padding:12px 13px;border-bottom:1px solid var(--bd);}
.ps-sec:last-child{border-bottom:none;}
.ps-s-lbl{font-size:7px;letter-spacing:0.22em;text-transform:uppercase;color:var(--br);font-weight:700;margin-bottom:9px;}
.char-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;}
.char-box{aspect-ratio:3/4;background:linear-gradient(160deg,var(--c3),var(--tan));display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:hidden;position:relative;}
.char-lbl{font-size:6px;letter-spacing:0.12em;text-transform:uppercase;color:var(--br2);background:rgba(247,243,237,0.88);padding:3px 0;width:100%;text-align:center;}
.char-svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-56%);opacity:.22;}
.ward-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.ward-box{background:#fff;border:1px solid var(--bd);padding:8px 10px;}
.ward-lbl{font-size:7px;letter-spacing:0.18em;text-transform:uppercase;color:var(--br);font-weight:700;margin-bottom:4px;}
.ward-val{font-size:10px;color:var(--ink2);line-height:1.45;}
.beauty-row{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;}
.beauty-box{background:#fff;border:1px solid var(--bd);padding:7px 8px;text-align:center;}
.beauty-sw{width:24px;height:24px;border-radius:50%;margin:0 auto 5px;border:1px solid var(--bd);}
.beauty-lbl{font-size:7px;letter-spacing:0.1em;text-transform:uppercase;color:var(--br);font-weight:600;line-height:1.3;}
.env-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
.env-box{background:var(--tan);aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--br2);letter-spacing:0.08em;text-align:center;padding:5px;}
.map-box{background:var(--c3);border:1px solid var(--bd);padding:8px;margin-top:5px;display:flex;align-items:center;justify-content:center;}
.ps-right{background:#fff;}
.ps-sb-hdr{font-size:8px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;color:var(--ink2);background:var(--tan);padding:7px 13px;border-bottom:1px solid var(--bd);}
.sb-grid{display:grid;grid-template-columns:repeat(4,1fr);}
.sb-cell{border-right:1px solid var(--bd);border-bottom:1px solid var(--bd);padding:9px;}
.sb-cell:nth-child(4n){border-right:none;}
.sb-n{font-family:'Playfair Display',serif;font-size:10px;font-weight:700;color:var(--ink2);margin-bottom:2px;}
.sb-t{font-size:9px;font-weight:700;color:var(--ink2);margin-bottom:5px;line-height:1.3;text-transform:uppercase;letter-spacing:0.04em;}
.sb-frame{background:var(--c3);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;margin-bottom:5px;border:1px solid var(--bd);position:relative;overflow:hidden;}
.sb-size-lbl{font-size:7px;color:var(--br2);letter-spacing:0.1em;font-style:italic;}
.sb-meta{display:flex;gap:10px;margin-bottom:3px;}
.sb-mk{font-size:6px;letter-spacing:0.18em;text-transform:uppercase;color:var(--go);font-weight:700;}
.sb-mv{font-size:8px;color:var(--ink2);font-weight:500;}
.sb-desc{font-size:8px;color:var(--ink3);line-height:1.4;margin-top:3px;border-top:1px solid var(--bd);padding-top:3px;}
.sb-prompt{margin-top:4px;padding:4px 6px;background:var(--c);border:1px solid var(--bd);border-left:2px solid var(--go);}
.sb-prompt-lbl{font-size:6px;letter-spacing:0.18em;text-transform:uppercase;color:var(--go);font-weight:700;margin-bottom:2px;}
.sb-prompt-txt{font-size:7px;color:var(--ink3);line-height:1.4;}
.light-strip{background:var(--c);border:1px solid var(--tan);border-top:1px solid var(--bd2);padding:12px 14px;}
.light-strip-title{font-size:8px;letter-spacing:0.25em;text-transform:uppercase;font-weight:700;color:var(--ink2);margin-bottom:9px;}
.light-row{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;}
.light-box{background:#fff;border:1px solid var(--bd);padding:7px 6px;text-align:center;}
.light-name{font-size:7px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink2);font-weight:700;margin-bottom:4px;}
.light-sw{height:26px;border-radius:2px;margin-bottom:4px;}
.light-desc{font-size:7px;color:var(--br);line-height:1.3;}
.ps-bot{border:1px solid var(--tan);border-top:1px solid var(--bd2);display:grid;grid-template-columns:1fr 1fr 1fr 1fr;background:var(--c);}
.ps-bot-sec{padding:12px 14px;border-right:1px solid var(--bd);}
.ps-bot-sec:last-child{border-right:none;}
.ps-bot-hdr{font-size:8px;letter-spacing:0.25em;text-transform:uppercase;font-weight:700;color:var(--ink2);margin-bottom:9px;padding-bottom:5px;border-bottom:1px solid var(--bd2);}
.mood-kw-list{display:flex;flex-direction:column;gap:3px;}
.mood-kw-item{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--ink2);font-weight:500;letter-spacing:0.04em;}
.mood-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.aud-item{margin-bottom:7px;}
.aud-lbl{font-size:7px;letter-spacing:0.18em;text-transform:uppercase;color:var(--go);font-weight:700;margin-bottom:2px;}
.aud-val{font-size:9px;color:var(--ink2);line-height:1.4;}
.cin-item{display:flex;align-items:flex-start;gap:7px;margin-bottom:7px;}
.cin-dot{width:16px;height:16px;border-radius:50%;background:var(--tan);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.cin-lbl{font-size:7px;letter-spacing:0.15em;text-transform:uppercase;color:var(--go);font-weight:700;margin-bottom:2px;}
.cin-txt{font-size:9px;color:var(--ink2);line-height:1.4;}
.ps-footer{text-align:center;padding:9px;border-top:1px solid var(--bd);}
.ps-footer-txt{font-size:7px;letter-spacing:0.28em;color:var(--br2);text-transform:uppercase;}

@media(max-width:900px){
  .ps-body{grid-template-columns:1fr;}
  .ps-left{border-right:none;border-bottom:1px solid var(--tan);}
  .sb-grid{grid-template-columns:repeat(2,1fr);}
  .ps-bot{grid-template-columns:1fr 1fr;}
  .ps-topbar{flex-direction:column;align-items:flex-start;gap:10px;}
  .ps-meta{flex-wrap:wrap;}
}
@media(max-width:640px){
  .fg,.fg3{grid-template-columns:1fr;}
  .content{padding:16px;}
  .genre-bar{padding:8px 14px;}
  .hdr{padding:11px 16px;}
  .sidebar{display:none;}
}
`;

/* ══ PRODUCTION SHEET ══ */
function ProductionSheet({ project }) {
  const shots = project.shots || [];
  const kws = (project.moodKeywords || "").split(",").map(k => k.trim()).filter(Boolean);
  const lightStages = [
    { name: "Dusk", desc: "Blue hour skies, warm practicals, reflections.", col: "linear-gradient(180deg,#1e2e4a,#2e3a5a)" },
    { name: "Evening", desc: "Street lamps, golden highlights, soft contrast.", col: "linear-gradient(180deg,#2a1e0e,#3a2a14)" },
    { name: "Intimate", desc: "Warm interior tones, elegant shadows.", col: "linear-gradient(180deg,#3a1e0a,#4a2810)" },
    { name: "Candlelight", desc: "Flickering candles, soft highlights, depth.", col: "linear-gradient(180deg,#4a2608,#5a3010)" },
    { name: "Glow", desc: "Soft rim light, glamorous finish.", col: "linear-gradient(180deg,#5a3c12,#6a4820)" },
  ];
  const dotColors = ["#8b1a1a", "#3a3028", "#1a1410", "#d4a870", "#c4a24a"];
  const cinNotes = (project.cinematography || "").split(".").map(s => s.trim()).filter(Boolean);
  const audNotes = (project.audio || "").split(".").map(s => s.trim()).filter(Boolean);

  return (
    <div className="ps">
      {/* TOP BAR */}
      <div className="ps-topbar">
        <div className="ps-tb-main">
          <div className="ps-tb-lbl">Project Title:</div>
          <div className="ps-tb-title">
            {project.title || "UNTITLED PROJECT"}
            <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 3 C8 3 5 6 5 9 C5 14 11 19 11 19 C11 19 17 14 17 9 C17 6 14 3 11 3Z" fill="#8b1a1a"/></svg>
          </div>
        </div>
        <div className="ps-meta">
          {[
            { lbl: "Format:", val: (project.format || "—").toUpperCase() },
            { lbl: "Total Shots:", val: shots.length, big: true },
            { lbl: "Aspect Ratio:", val: project.aspectRatio || "16:9" },
            { lbl: "Duration (Est.):", val: (project.duration || "—").toUpperCase() },
            { lbl: "Genre / Tone:", val: project.genreTone || project.moodKeywords || "—", small: true },
          ].map((m, i) => (
            <div key={i} className="ps-meta-blk">
              <div className="ps-meta-lbl">{m.lbl}</div>
              <div className="ps-meta-val" style={{ fontSize: m.big ? 20 : m.small ? 10 : 12, fontFamily: m.big ? "'Playfair Display',serif" : "inherit" }}>{m.val}</div>
            </div>
          ))}
          <div className="ps-meta-blk">
            <div className="ps-meta-lbl">Palette:</div>
            <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
              {dotColors.map((c, i) => <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,0.2)" }} />)}
            </div>
          </div>
          <div className="ps-meta-blk">
            <div className="ps-meta-lbl">Setting:</div>
            <div className="ps-meta-val" style={{ fontSize: 10 }}>{project.setting || "—"}</div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="ps-body">
        {/* LEFT */}
        <div className="ps-left">
          <div className="ps-panel-hdr">Character + Styling Reference</div>
          <div className="ps-sec">
            <div className="ps-s-lbl">Main Character — The Woman</div>
            <div className="char-grid">
              {["Front", "Back", "Side", "Close-Up", "Relaxed Pose"].map(lbl => (
                <div key={lbl} className="char-box">
                  <svg className="char-svg" viewBox="0 0 40 72" width="26" height="46" fill="#4a3d32">
                    <circle cx="20" cy="10" r="8" /><path d="M9 26 Q20 20 31 26 L33 54 Q20 60 7 54Z" /><path d="M9 28 L3 50" stroke="#4a3d32" strokeWidth="5" fill="none" /><path d="M31 28 L37 50" stroke="#4a3d32" strokeWidth="5" fill="none" /><path d="M14 54 L11 70" stroke="#4a3d32" strokeWidth="5" fill="none" /><path d="M26 54 L29 70" stroke="#4a3d32" strokeWidth="5" fill="none" />
                  </svg>
                  <div className="char-lbl">{lbl}</div>
                </div>
              ))}
            </div>
            {project.character && <div style={{ marginTop: 7, fontSize: 9, color: "var(--ink3)", lineHeight: 1.5, fontStyle: "italic" }}>{project.character}</div>}
          </div>

          <div className="ps-sec">
            <div className="ward-grid">
              <div className="ward-box">
                <div className="ward-lbl">Wardrobe & Accessories</div>
                <div className="ward-val">{project.wardrobe || "—"}</div>
              </div>
              <div className="ward-box">
                <div className="ward-lbl">Beauty Details</div>
                <div className="beauty-row" style={{ marginBottom: 5 }}>
                  {[{ lbl: "Bold Red Lip", c: "#8b1a1a" }, { lbl: "Soft Smoky Eye", c: "#3a3028" }, { lbl: "Natural Glow", c: "#d4a870" }].map(b => (
                    <div key={b.lbl} className="beauty-box">
                      <div className="beauty-sw" style={{ background: b.c }} />
                      <div className="beauty-lbl">{b.lbl}</div>
                    </div>
                  ))}
                </div>
                {project.beauty && <div style={{ fontSize: 8, color: "var(--ink3)", lineHeight: 1.4 }}>{project.beauty}</div>}
              </div>
            </div>
          </div>

          <div className="ps-sec">
            <div className="ps-s-lbl">Environment & Set Design</div>
            <div style={{ fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--br)", marginBottom: 7, fontWeight: 600 }}>Location: {project.setting || "TBD"}</div>
            <div className="env-grid">
              <div className="env-box">Ext. Restaurant</div>
              <div className="env-box">Street / City</div>
            </div>
            <div className="map-box">
              <svg viewBox="0 0 200 96" width="178" height="86">
                <text x="100" y="9" textAnchor="middle" fontSize="6" fill="var(--go)" fontFamily="Inter" letterSpacing="1.5" fontWeight="700">TOP-DOWN BLOCKING &amp; CAMERA MAP</text>
                <rect x="58" y="14" width="84" height="46" fill="none" stroke="var(--tan2)" strokeWidth="1" strokeDasharray="4,2" />
                <text x="100" y="42" textAnchor="middle" fontSize="7" fill="var(--br2)" fontFamily="Inter" fontWeight="600">RESTAURANT</text>
                <text x="100" y="52" textAnchor="middle" fontSize="6" fill="var(--br)" fontFamily="Inter">INT / EXT</text>
                {[{ x: 40, y: 76, n: "①", lbl: "EST." }, { x: 74, y: 76, n: "②", lbl: "WALK" }, { x: 108, y: 76, n: "③", lbl: "INT." }, { x: 142, y: 76, n: "④", lbl: "TABLE" }].map((c, i, a) => (
                  <g key={i}>
                    <circle cx={c.x} cy={c.y} r="7" fill="none" stroke="var(--go)" strokeWidth="1" />
                    <text x={c.x} y={c.y + 2} textAnchor="middle" fontSize="5.5" fill="var(--ink2)" fontFamily="Inter" fontWeight="700">{c.n}</text>
                    <text x={c.x} y={c.y + 14} textAnchor="middle" fontSize="5.5" fill="var(--br)" fontFamily="Inter">{c.lbl}</text>
                    {i < a.length - 1 && <line x1={c.x + 8} y1={c.y} x2={a[i + 1].x - 8} y2={c.y} stroke="var(--re)" strokeWidth="0.8" strokeDasharray="3,2" markerEnd="url(#arr)" />}
                  </g>
                ))}
                <defs><marker id="arr" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4" fill="none" stroke="var(--re)" strokeWidth="0.8" /></marker></defs>
                <text x="6" y="22" fontSize="5" fill="var(--go)" fontFamily="Inter" letterSpacing="0.5">● CAMERA</text>
                <text x="6" y="30" fontSize="5" fill="var(--re)" fontFamily="Inter" letterSpacing="0.5">-- TALENT</text>
              </svg>
            </div>
            {project.environment && <div style={{ marginTop: 7, fontSize: 8, color: "var(--ink3)", lineHeight: 1.45 }}>{project.environment}</div>}
          </div>
        </div>

        {/* RIGHT = STORYBOARD */}
        <div className="ps-right">
          <div className="ps-sb-hdr">Storyboard / Shot List</div>
          <div className="sb-grid">
            {shots.map((shot, i) => (
              <div key={shot.id} className="sb-cell">
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 4 }}>
                  <div className="sb-n">{i + 1}</div>
                  <div className="sb-t">{shot.title}</div>
                </div>
                <div className="sb-frame">
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,var(--c3) 0%,var(--tan) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 70 40" width="52" height="30" opacity="0.2">
                      <rect width="70" height="40" fill="none" stroke="var(--br2)" strokeWidth="1" />
                      <line x1="0" y1="0" x2="70" y2="40" stroke="var(--br2)" strokeWidth="0.5" />
                      <line x1="70" y1="0" x2="0" y2="40" stroke="var(--br2)" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <div className="sb-size-lbl" style={{ position: "relative", zIndex: 1 }}>{shot.size}</div>
                </div>
                <div className="sb-meta">
                  <div><div className="sb-mk">Camera / Lens</div><div className="sb-mv">{shot.lens}</div></div>
                  <div><div className="sb-mk">Shot Size</div><div className="sb-mv">{shot.size}</div></div>
                  <div><div className="sb-mk">Movement</div><div className="sb-mv">{shot.movement}</div></div>
                </div>
                {shot.action && <div className="sb-desc">{shot.action}</div>}
                {shot.lighting && <div style={{ fontSize: 7, color: "var(--go)", marginTop: 2, fontStyle: "italic" }}>Lighting / Mood: {shot.lighting}{shot.mood ? `, ${shot.mood}` : ""}</div>}
                {shot.prompt && (
                  <div className="sb-prompt">
                    <div className="sb-prompt-lbl">AI Image Prompt</div>
                    <div className="sb-prompt-txt">{shot.prompt}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LIGHTING STRIP */}
      <div className="light-strip">
        <div className="light-strip-title">Lighting / Mood / Style Notes</div>
        <div className="light-row">
          {lightStages.map((ls, i) => (
            <div key={i} className="light-box">
              <div className="light-name">{ls.name}</div>
              <div className="light-sw" style={{ background: ls.col }} />
              <div className="light-desc">{ls.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM 4-COL */}
      <div className="ps-bot">
        {/* MOOD */}
        <div className="ps-bot-sec">
          <div className="ps-bot-hdr">Mood & Keywords</div>
          <div className="mood-kw-list">
            {kws.length > 0 ? kws.map((k, i) => (
              <div key={k} className="mood-kw-item">
                <div className="mood-dot" style={{ background: ["#8b1a1a", "#c4a24a", "#4a3d32", "#6b5d4f", "#9a7d3a", "#2d2520", "#8b1a1a"][i % 7] }} />
                {k}
              </div>
            )) : <div style={{ fontSize: 10, color: "var(--br)", fontStyle: "italic" }}>No keywords set</div>}
          </div>
        </div>
        {/* AUDIO */}
        <div className="ps-bot-sec">
          <div className="ps-bot-hdr">Audio / Tone</div>
          {audNotes.length > 0 ? (
            [["Ambient Sound", 0], ["Music Style", 1], ["Overall Tone", 2]].map(([lbl, idx]) => audNotes[idx] && (
              <div key={lbl} className="aud-item">
                <div className="aud-lbl">{lbl}</div>
                <div className="aud-val">{audNotes[idx]}</div>
              </div>
            ))
          ) : (
            <div className="aud-item"><div className="aud-val">{project.audio || "—"}</div></div>
          )}
        </div>
        {/* CINEMA */}
        <div className="ps-bot-sec">
          <div className="ps-bot-hdr">Cinematography Notes</div>
          {(cinNotes.length > 0 ? cinNotes : ["—"]).map((n, i) => (
            <div key={i} className="cin-item">
              <div className="cin-dot"><svg viewBox="0 0 10 10" width="8" height="8"><circle cx="5" cy="5" r="3" fill="var(--go)" /></svg></div>
              <div>
                <div className="cin-lbl">{["Lens Choices", "Movement Style", "Visual Philosophy", "Color & Finish"][i] || `Note ${i + 1}`}</div>
                <div className="cin-txt">{n}</div>
              </div>
            </div>
          ))}
        </div>
        {/* PALETTE */}
        <div className="ps-bot-sec">
          <div className="ps-bot-hdr">Color Palette</div>
          <div style={{ fontSize: 10, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 9 }}>{project.colorPalette || "—"}</div>
          <PaletteDots str={project.colorPalette} size={22} />
          {project.brand && (
            <div style={{ marginTop: 12, padding: "9px 12px", background: "var(--ink2)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, color: "#f0e8d8", letterSpacing: "0.12em", fontStyle: "italic" }}>{project.brand}</div>
              {project.title && <div style={{ fontSize: 8, color: "var(--go2)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>— {project.title.toLowerCase()} —</div>}
            </div>
          )}
        </div>
      </div>

      <div className="ps-footer">
        <div className="ps-footer-txt">AI Video Production Planner · Confidential Treatment · {project.brand || "Film Production"}</div>
      </div>
    </div>
  );
}

/* ══ PLANNER SECTIONS ══ */
const MOOD_KWS = ["로맨틱", "우아한", "자신감", "여성스러운", "시간초월", "럭셔리", "세련된", "관능적", "신비로운", "몽환적", "역동적", "대담한", "친밀한", "예술적", "에디토리얼", "시네마틱", "노스탤직", "모던", "날것의", "발랄한", "환상적", "어두운", "따뜻한", "드라마틱"];

function ConceptTab({ project, update }) {
  const [idea, setIdea] = useState(""); const [loading, setLoading] = useState(false); const [result, setResult] = useState("");
  const expand = async () => { if (!idea.trim()) return; setLoading(true); setResult(""); try { const t = await callAI(`You are a professional film producer. Expand this brief idea into a full video production concept.\nIdea: "${idea}"\nGenre: ${GENRE_PRESETS[project.genre]?.label || project.genre}\n\nCover: Narrative/Story Arc, Visual Treatment, Key Scenes (bullets), Emotional Journey, Target Audience. Cinematic and specific.`); setResult(t); } catch { setResult("오류가 발생했습니다. 다시 시도해주세요."); } setLoading(false); };
  return (
    <div>
      <div className="s-title">컨셉 & 개요</div><div className="s-sub">프로덕션 기반 설정</div><div className="divider" />
      <div className="idea-bar">
        <textarea className="idea-ta" value={idea} onChange={e => setIdea(e.target.value)} placeholder="짧은 아이디어를 입력하세요 — 예: '한강변 새벽 안개 속 고급 향수 광고, 30대 여성, 신비롭고 우아한 분위기'..." onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); expand(); } }} rows={2} />
        <button className="btn btn-re" onClick={expand} disabled={loading}>{loading ? "..." : "컨셉 확장 →"}</button>
      </div>
      {result && <div className="ai-box"><div className="ai-lbl">AI 생성 컨셉</div><div className="ai-txt">{result}</div></div>}
      <div style={{ height: 18 }} />
      <div className="fg">
        <div className="fl"><div className="fl-lbl">프로젝트 제목</div><input value={project.title} onChange={e => update("title", e.target.value)} placeholder="예: AMORE WITH A SMILE" /></div>
        <div className="fl"><div className="fl-lbl">브랜드 / 제품</div><input value={project.brand} onChange={e => update("brand", e.target.value)} placeholder="예: HotLips 립스틱" /></div>
        <div className="fl"><div className="fl-lbl">포맷</div><input value={project.format} onChange={e => update("format", e.target.value)} placeholder="예: 광고 / 단편 영화" /></div>
        <div className="fl"><div className="fl-lbl">영상 길이</div><input value={project.duration} onChange={e => update("duration", e.target.value)} placeholder="예: 60–75초" /></div>
        <div className="fl"><div className="fl-lbl">화면 비율</div><select value={project.aspectRatio} onChange={e => update("aspectRatio", e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option><option>2.39:1</option></select></div>
        <div className="fl"><div className="fl-lbl">총 샷 수</div><input type="number" value={project.totalShots} onChange={e => update("totalShots", parseInt(e.target.value) || 1)} min="1" max="30" /></div>
        <div className="fl full"><div className="fl-lbl">장르 / 톤</div><input value={project.genreTone} onChange={e => update("genreTone", e.target.value)} placeholder="예: Romantic, Elegant, Luxurious" /></div>
        <div className="fl full"><div className="fl-lbl">촬영 장소 & 시간대</div><input value={project.setting} onChange={e => update("setting", e.target.value)} placeholder="예: 파리, 프랑스 — 저녁, 빗속 거리" /></div>
        <div className="fl full"><div className="fl-lbl">컬러 팔레트</div><input value={project.colorPalette} onChange={e => update("colorPalette", e.target.value)} placeholder="예: Deep black, warm gold, deep red, ivory" /></div>
      </div>
    </div>
  );
}

function CharacterTab({ project, update }) {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState("");
  const gen = async () => { setLoading(true); setResult(""); try { const t = await callAI(`Generate 4 cinematic image prompts for a film character reference sheet.\nCharacter: ${project.character}\nWardrobe: ${project.wardrobe}\nBeauty: ${project.beauty}\nProject: ${project.title} — ${project.brand}\n\n4 prompts: 1. Front view full body, 2. Side profile, 3. Close-up face/beauty, 4. Relaxed pose. Each 2-3 sentences, cinematic.`); setResult(t); } catch { setResult("오류가 발생했습니다."); } setLoading(false); };
  return (
    <div>
      <div className="s-title">캐릭터 & 스타일링</div><div className="s-sub">출연진 & 비주얼 아이덴티티</div><div className="divider" />
      <div className="fg">
        <div className="fl full"><div className="fl-lbl">주인공 설명</div><textarea value={project.character} onChange={e => update("character", e.target.value)} placeholder="나이, 외모, 분위기, 성격을 자세히 입력하세요..." rows={3} /></div>
        <div className="fl full"><div className="fl-lbl">의상 & 액세서리</div><textarea value={project.wardrobe} onChange={e => update("wardrobe", e.target.value)} placeholder="드레스, 신발, 주얼리, 가방 등..." rows={2} /></div>
        <div className="fl full"><div className="fl-lbl">뷰티 & 스타일링 디테일</div><textarea value={project.beauty} onChange={e => update("beauty", e.target.value)} placeholder="메이크업, 헤어, 피부, 네일 등..." rows={2} /></div>
        <div className="fl full"><div className="fl-lbl">환경 & 세트 디자인</div><textarea value={project.environment} onChange={e => update("environment", e.target.value)} placeholder="주요 촬영 장소, 소품, 세트 구성 등..." rows={2} /></div>
      </div>
      <div className="btn-group"><button className="btn btn-go" onClick={gen} disabled={loading}>{loading ? "생성 중..." : "캐릭터 프롬프트 생성 →"}</button></div>
      {result && <div className="ai-box"><div className="ai-lbl">캐릭터 레퍼런스 이미지 프롬프트</div><div className="ai-txt">{result}</div></div>}
    </div>
  );
}

function StoryboardTab({ project, update, updateShot, addShot, removeShot, duplicateShot }) {
  const [genId, setGenId] = useState(null);
  const genShot = async (shot) => {
    setGenId(shot.id);
    try { const t = await callAI(`Write a cinematic image generation prompt for this shot.\nProject: ${project.title} — ${project.brand}\nSetting: ${project.setting}\nCharacter: ${project.character}\nShot: ${shot.title}\nAction: ${shot.action}\nSize: ${shot.size} | Lens: ${shot.lens} | Movement: ${shot.movement}\nLighting: ${shot.lighting} | Mood: ${shot.mood}\nColor palette: ${project.colorPalette}\n\nONE detailed prompt (3-5 sentences). Specific composition, lighting, color, atmosphere. Cinematic photography.`, 300); updateShot(shot.id, "prompt", t); }
    catch { updateShot(shot.id, "prompt", "오류가 발생했습니다."); }
    setGenId(null);
  };
  const genAll = async () => { for (const s of project.shots) await genShot(s); };
  const shotSizes = ["익스트림 와이드", "와이드", "미디엄 와이드", "미디엄", "미디엄 클로즈업", "클로즈업", "익스트림 클로즈업", "매크로", "인서트"];
  const movements = ["스태틱", "슬로우 푸시인", "풀백", "트래킹", "달리", "팬", "틸트", "크레인", "핸드헬드", "오빗", "스테디캠", "드론"];
  return (
    <div>
      <div className="s-title">스토리보드 & 샷 리스트</div><div className="s-sub">총 {project.shots.length}샷 · {project.aspectRatio} · {project.duration}</div><div className="divider" />
      <div className="btn-group" style={{ marginBottom: 18 }}>
        <button className="btn btn-re" onClick={addShot}>+ 샷 추가</button>
        <button className="btn btn-go" onClick={genAll}>전체 AI 프롬프트 생성 →</button>
      </div>
      {project.shots.map((shot, i) => (
        <div key={shot.id} className="card">
          <div className="card-hdr">
            <div className="shot-num">0{i + 1}</div>
            <div style={{ flex: 1, marginLeft: 12 }}><input className="shot-ti" value={shot.title} onChange={e => updateShot(shot.id, "title", e.target.value)} placeholder="샷 제목" /></div>
            <div style={{ display: "flex", gap: 7 }}>
              <button className="btn" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => duplicateShot(shot.id)}>복제</button>
              <button className="btn btn-re" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => removeShot(shot.id)}>✕</button>
            </div>
          </div>
          <div className="fl" style={{ marginBottom: 9 }}><div className="fl-lbl">액션 / 씬 설명</div><textarea value={shot.action} onChange={e => updateShot(shot.id, "action", e.target.value)} placeholder="이 샷에서 무슨 일이 일어나는지 설명하세요..." rows={2} /></div>
          <div className="fg3">
            <div className="fl"><div className="fl-lbl">샷 사이즈</div><select value={shot.size} onChange={e => updateShot(shot.id, "size", e.target.value)}>{shotSizes.map(o => <option key={o}>{o}</option>)}</select></div>
            <div className="fl"><div className="fl-lbl">렌즈</div><select value={shot.lens} onChange={e => updateShot(shot.id, "lens", e.target.value)}>{["14mm", "24mm", "35mm", "50mm", "85mm", "100mm Macro", "135mm", "200mm", "줌"].map(o => <option key={o}>{o}</option>)}</select></div>
            <div className="fl"><div className="fl-lbl">카메라 무브먼트</div><select value={shot.movement} onChange={e => updateShot(shot.id, "movement", e.target.value)}>{movements.map(o => <option key={o}>{o}</option>)}</select></div>
            <div className="fl"><div className="fl-lbl">조명</div><input value={shot.lighting} onChange={e => updateShot(shot.id, "lighting", e.target.value)} placeholder="예: 캔들라이트, 황금빛 노을..." /></div>
            <div className="fl"><div className="fl-lbl">무드 / 감정</div><input value={shot.mood} onChange={e => updateShot(shot.id, "mood", e.target.value)} placeholder="예: 기대감, 기쁨..." /></div>
            <div className="fl">
              <div className="fl-lbl" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>AI 이미지 프롬프트</span>
                <button style={{ background: "none", border: "none", color: "var(--go)", cursor: "pointer", fontSize: 10, fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 4 }} onClick={() => genShot(shot)} disabled={genId === shot.id}>
                  {genId === shot.id ? <><span className="spin" style={{ width: 9, height: 9 }} /> 생성 중</> : "자동 생성 →"}
                </button>
              </div>
              <textarea value={shot.prompt} onChange={e => updateShot(shot.id, "prompt", e.target.value)} placeholder="자동 생성 버튼을 누르거나 직접 프롬프트를 입력하세요..." rows={3} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MoodTab({ project, update }) {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState("");
  const sel = (project.moodKeywords || "").split(",").map(k => k.trim()).filter(Boolean);
  const toggle = kw => { const n = sel.includes(kw) ? sel.filter(k => k !== kw) : [...sel, kw]; update("moodKeywords", n.join(", ")); };
  const gen = async () => { setLoading(true); setResult(""); try { const t = await callAI(`Generate 4 moodboard image prompts for a film production.\nProject: ${project.title}\nBrand: ${project.brand}\nMood: ${project.moodKeywords}\nSetting: ${project.setting}\nColor: ${project.colorPalette}\nGenre: ${GENRE_PRESETS[project.genre]?.label}\n\n4 prompts: 1. Atmosphere/Environment, 2. Character/Human, 3. Product/Object, 4. Abstract/Texture. Each 2-3 sentences, cinematic.`); setResult(t); } catch { setResult("오류가 발생했습니다."); } setLoading(false); };
  return (
    <div>
      <div className="s-title">무드 & 키워드</div><div className="s-sub">감성 팔레트 설정</div><div className="divider" />
      <div className="fl-lbl" style={{ marginBottom: 7 }}>무드 키워드 선택</div>
      <div className="kw-wrap">{MOOD_KWS.map(kw => <div key={kw} className={"kw" + (sel.includes(kw) ? " on" : "")} onClick={() => toggle(kw)}>{kw}</div>)}</div>
      <div style={{ height: 14 }} />
      <div className="fl"><div className="fl-lbl">직접 입력 (쉼표로 구분)</div><input value={project.moodKeywords} onChange={e => update("moodKeywords", e.target.value)} placeholder="예: 로맨틱, 우아한, 자신감..." /></div>
      <div className="btn-group" style={{ marginTop: 14 }}><button className="btn btn-go" onClick={gen} disabled={loading}>{loading ? "생성 중..." : "무드보드 프롬프트 생성 →"}</button></div>
      {result && <div className="ai-box"><div className="ai-lbl">무드보드 이미지 프롬프트</div><div className="ai-txt">{result}</div></div>}
    </div>
  );
}

function AudioTab({ project, update }) {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState("");
  const gen = async () => { setLoading(true); setResult(""); try { const t = await callAI(`Write a detailed audio direction brief.\nProject: ${project.title} — ${project.brand}\nGenre: ${GENRE_PRESETS[project.genre]?.label}\nMood: ${project.moodKeywords}\nSetting: ${project.setting}\nDuration: ${project.duration}\nNotes: ${project.audio}\n\nCover: 1.Music Direction 2.Sound Design 3.Voice Over 4.Audio Arc 5.Music References`); setResult(t); } catch { setResult("오류가 발생했습니다."); } setLoading(false); };
  return (
    <div>
      <div className="s-title">오디오 & 사운드</div><div className="s-sub">음악, 사운드 디자인 & 보이스</div><div className="divider" />
      <div className="fl"><div className="fl-lbl">오디오 방향성 메모</div><textarea value={project.audio} onChange={e => update("audio", e.target.value)} placeholder="음악 장르, 사운드 디자인, 내레이션, 분위기 등을 입력하세요..." rows={5} /></div>
      <div className="btn-group" style={{ marginTop: 13 }}><button className="btn btn-go" onClick={gen} disabled={loading}>{loading ? "생성 중..." : "오디오 브리프 생성 →"}</button></div>
      {result && <div className="ai-box"><div className="ai-lbl">오디오 방향성 브리프</div><div className="ai-txt">{result}</div></div>}
    </div>
  );
}

function CinemaTab({ project, update }) {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState("");
  const gen = async () => { setLoading(true); setResult(""); try { const t = await callAI(`Write a detailed cinematography brief.\nProject: ${project.title} — ${project.brand}\nGenre: ${GENRE_PRESETS[project.genre]?.label}\nSetting: ${project.setting}\nColor: ${project.colorPalette}\nMood: ${project.moodKeywords}\nNotes: ${project.cinematography}\n\nCover: 1.Camera & Lens Strategy 2.Lighting Approach 3.Color Grade 4.Movement Philosophy 5.Reference Films`); setResult(t); } catch { setResult("오류가 발생했습니다."); } setLoading(false); };
  return (
    <div>
      <div className="s-title">촬영 기법</div><div className="s-sub">카메라, 조명 & 색감</div><div className="divider" />
      <div className="fl"><div className="fl-lbl">촬영 기법 메모</div><textarea value={project.cinematography} onChange={e => update("cinematography", e.target.value)} placeholder="렌즈 선택, 조명 방식, 컬러 그레이딩, 카메라 무브먼트 등을 입력하세요..." rows={5} /></div>
      <div className="btn-group" style={{ marginTop: 13 }}><button className="btn btn-go" onClick={gen} disabled={loading}>{loading ? "생성 중..." : "촬영 기법 브리프 생성 →"}</button></div>
      {result && <div className="ai-box"><div className="ai-lbl">촬영 기법 브리프</div><div className="ai-txt">{result}</div></div>}
    </div>
  );
}

function ExportTab({ project }) {
  const [loading, setLoading] = useState(false);
  const [promptResult, setPromptResult] = useState("");
  const [shotPrompts, setShotPrompts] = useState([]);
  const [activeSection, setActiveSection] = useState("image"); // "image" | "files"
  const [copied, setCopied] = useState(null);

  const dl = (content, name, type) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); };
  const md = () => dl(`# ${project.title || "제목 없음"}\n**브랜드:** ${project.brand}  \n**포맷:** ${project.format} | **길이:** ${project.duration} | **비율:** ${project.aspectRatio}\n**배경:** ${project.setting}\n**무드:** ${project.moodKeywords}\n\n---\n\n## 캐릭터\n${project.character}\n**의상:** ${project.wardrobe}\n**뷰티:** ${project.beauty}\n**환경:** ${project.environment}\n\n---\n\n## 샷 리스트\n\n${project.shots.map((s, i) => `### 샷 ${String(i + 1).padStart(2, "0")} — ${s.title}\n**사이즈:** ${s.size} | **렌즈:** ${s.lens} | **무브먼트:** ${s.movement}\n**조명:** ${s.lighting} | **무드:** ${s.mood}\n**액션:** ${s.action}\n**AI 프롬프트:** ${s.prompt}\n`).join("\n")}\n---\n\n## 오디오\n${project.audio}\n\n## 촬영 기법\n${project.cinematography}\n\n## 컬러 팔레트\n${project.colorPalette}`, `${(project.title || "기획서").replace(/\s+/g, "-").toLowerCase()}.md`, "text/markdown");
  const json = () => dl(JSON.stringify(project, null, 2), `${(project.title || "기획서").replace(/\s+/g, "-").toLowerCase()}.json`, "application/json");

  const copyText = (text, id) => {
    try {
      // iframe 환경에서 clipboard API 실패 시 execCommand 폴백 사용
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(id); setTimeout(() => setCopied(null), 2200);
        }).catch(() => fallbackCopy(text, id));
      } else {
        fallbackCopy(text, id);
      }
    } catch {
      fallbackCopy(text, id);
    }
  };

  const fallbackCopy = (text, id) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      setCopied(id);
      setTimeout(() => setCopied(null), 2200);
    } catch {
      // 복사 실패 시 텍스트 선택만 해줌
      ta.select();
    }
    document.body.removeChild(ta);
  };

  const generateImagePrompts = async () => {
    setLoading(true); setPromptResult(null); setShotPrompts([]);
    try {
      const shots = project.shots || [];
      const shotList = shots.map((s,i)=>`Shot ${i+1}: "${s.title}" — ${s.action || "no action"} | size: ${s.size} | lens: ${s.lens} | movement: ${s.movement} | lighting: ${s.lighting || "natural"} | mood: ${s.mood || "neutral"}`).join("\n");

      // ── 1차 호출: 메인 4개 프롬프트 ──
      const raw1 = await callAI(
        `You are an expert AI image prompt engineer for cinematic production storyboards.
Return ONLY a valid JSON object. No markdown, no code fences, no explanation whatsoever.

Project:
Title: ${project.title || "Untitled"}
Brand: ${project.brand || "unknown brand"}
Genre/Tone: ${project.genreTone || project.moodKeywords || "cinematic"}
Setting: ${project.setting || "studio"}
Color palette: ${project.colorPalette || "neutral"}
Character: ${project.character || "elegant woman"}
Wardrobe: ${project.wardrobe || "elegant outfit"}
Beauty: ${project.beauty || "natural makeup"}
Environment: ${project.environment || "studio setting"}
Mood: ${project.moodKeywords || "elegant"}
Cinematography: ${project.cinematography || "cinematic"}

Output exactly this JSON with no other text:
{"storyboard_sheet_prompt":"<detailed prompt here>","model_reference_prompt":"<detailed prompt here>","outfit_reference_prompt":"<detailed prompt here>","environment_prompt":"<detailed prompt here>","full_storyboard_grid_prompt":"<detailed prompt here>"}

Rules for each prompt:
- storyboard_sheet_prompt: Generate a full luxury film production planning board as ONE landscape 16:9 image. Editorial grid layout, dark burgundy header bar, cream/beige background, professional film production document. Header shows project title and metadata. Left panel has character reference photos. Right panel has numbered storyboard frames in a grid. Bottom bar has color palette, audio notes, cinematography notes. Text labels visible. Luxury Korean fashion commercial aesthetic. Ultra detailed, high resolution.
- model_reference_prompt: 3-panel side-by-side character reference sheet. The character described above. Front view, side profile, close-up face. Clean studio background, fashion photography style.
- outfit_reference_prompt: Flat lay product/outfit reference image. The wardrobe items described above arranged elegantly on cream background. Fashion editorial style.
- environment_prompt: Set/environment reference image for the setting described. Cinematic photography, mood lighting matching the project tone.
- full_storyboard_grid_prompt: A grid of ${shots.length} cinematic still frames (${Math.ceil(shots.length/4)} rows x 4 columns) showing all shots as a contact sheet. Each frame numbered. Film production aesthetic, luxury commercial look.`,
        2000
      );

      // ── 2차 호출: 샷별 프롬프트 ──
      const raw2 = await callAI(
        `You are an expert AI image prompt engineer.
Return ONLY a valid JSON array. No markdown, no code fences, no explanation.

Project: ${project.title || "Untitled"} — Brand: ${project.brand || "unknown"}
Character: ${project.character || "elegant woman"}
Wardrobe: ${project.wardrobe || "elegant outfit"}
Color palette: ${project.colorPalette || "neutral"}
Setting: ${project.setting || "studio"}
Tone: ${project.genreTone || "cinematic elegant"}
Cinematography style: ${project.cinematography || "cinematic"}

Shots:
${shotList}

Output exactly this JSON array with no other text:
[{"shot_num":1,"title":"...","prompt":"..."},{"shot_num":2,"title":"...","prompt":"..."}]

For each shot, write a detailed cinematic still image generation prompt (3-4 sentences) that matches the shot description. Include: composition, lighting, color grade, lens feel, mood, character appearance, environment. Optimized for Midjourney/DALL-E/Stable Diffusion.`,
        Math.min(200 * shots.length + 500, 3000)
      );

      // ── JSON 파싱 (마크다운 코드블록 제거 후) ──
      const clean1 = raw1.replace(/```json|```/gi, "").trim();
      const clean2 = raw2.replace(/```json|```/gi, "").trim();

      const m1 = clean1.match(/\{[\s\S]*\}/);
      const m2 = clean2.match(/\[[\s\S]*\]/);

      if (!m1) throw new Error("메인 프롬프트 JSON을 찾을 수 없습니다. 다시 시도해주세요.");

      const parsed1 = JSON.parse(m1[0]);
      const parsedShots = m2 ? JSON.parse(m2[0]) : [];

      setPromptResult(parsed1);
      setShotPrompts(parsedShots);

    } catch (e) {
      console.error("generateImagePrompts error:", e);
      setPromptResult({ error: `오류: ${e.message || "알 수 없는 오류"}. 다시 시도해주세요.` });
    }
    setLoading(false);
  };

  const allPromptsText = promptResult && !promptResult.error ? [
    `[전체 기획서 시트]\n${promptResult.storyboard_sheet_prompt || ""}`,
    `[모델 레퍼런스]\n${promptResult.model_reference_prompt || ""}`,
    `[의상 레퍼런스]\n${promptResult.outfit_reference_prompt || ""}`,
    `[환경/세트 레퍼런스]\n${promptResult.environment_prompt || ""}`,
    `[전체 스토리보드 그리드]\n${promptResult.full_storyboard_grid_prompt || ""}`,
    ...(shotPrompts.map(s => `[샷 ${s.shot_num}: ${s.title}]\n${s.prompt}`)),
  ].join("\n\n---\n\n") : "";

  return (
    <div>
      <div className="s-title">내보내기</div>
      <div className="s-sub">이미지 프롬프트 생성 & 파일 다운로드</div>
      <div className="divider" />

      {/* Section toggle */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, border: "1px solid var(--bd2)", width: "fit-content" }}>
        {[["image", "🎨 이미지 프롬프트 생성"], ["files", "📁 파일 다운로드"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setActiveSection(id)} style={{ padding: "9px 20px", background: activeSection === id ? "var(--ink2)" : "transparent", color: activeSection === id ? "#f0e8d8" : "var(--br)", border: "none", fontFamily: "Inter,sans-serif", fontSize: 12, cursor: "pointer", letterSpacing: "0.05em", fontWeight: activeSection === id ? 600 : 400, transition: "all .2s" }}>{lbl}</button>
        ))}
      </div>

      {activeSection === "image" && (
        <div>
          {/* Intro card */}
          <div style={{ background: "var(--white)", border: "1px solid var(--bd)", borderLeft: "3px solid var(--re)", padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", marginBottom: 6, fontFamily: "'Playfair Display',serif" }}>📋 이미지 기획서 프롬프트 생성</div>
            <div style={{ fontSize: 12, color: "var(--ink3)", lineHeight: 1.7 }}>
              아래 버튼을 누르면 <strong>Midjourney / DALL-E / Stable Diffusion</strong>에서 바로 사용할 수 있는<br/>
              완성형 기획서 이미지 프롬프트가 자동으로 생성됩니다.<br/>
              <span style={{ color: "var(--go)", fontSize: 11 }}>① 전체 시트 프롬프트 → ② 각 샷별 스틸컷 프롬프트 → ③ 레퍼런스 이미지 프롬프트</span>
            </div>
          </div>

          <div className="btn-group" style={{ marginBottom: 20 }}>
            <button className="btn btn-re" style={{ padding: "11px 28px", fontSize: 13 }} onClick={generateImagePrompts} disabled={loading}>
              {loading ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="spin" />이미지 프롬프트 생성 중...</span> : "✦ 이미지 기획서 프롬프트 전체 생성 →"}
            </button>
            {allPromptsText && (
              <button className="btn btn-go" onClick={() => { dl(allPromptsText, `${(project.title||"프롬프트").replace(/\s+/g,"-")}-image-prompts.txt`, "text/plain"); }}>
                ⬇ 전체 프롬프트 텍스트 저장
              </button>
            )}
          </div>

          {promptResult?.error && (
            <div style={{ padding: "12px 16px", background: "#fff0f0", border: "1px solid #e57373", color: "#c0392b", fontSize: 12 }}>{promptResult.error}</div>
          )}

          {promptResult && !promptResult.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* MAIN SHEET PROMPT */}
              <div style={{ background: "var(--ink2)", border: "1px solid var(--go2)", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "var(--go2)", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>✦ 핵심 — 전체 기획서 시트 이미지</div>
                    <div style={{ fontSize: 11, color: "#a09080" }}>이 프롬프트 하나로 전체 레이아웃 기획서 이미지를 생성합니다</div>
                  </div>
                  <button onClick={() => copyText(promptResult.storyboard_sheet_prompt, "sheet")} style={{ padding: "6px 14px", border: "1px solid var(--go2)", background: copied === "sheet" ? "var(--go2)" : "transparent", color: copied === "sheet" ? "#1a1410" : "var(--go2)", cursor: "pointer", fontSize: 11, fontFamily: "Inter,sans-serif", transition: "all .2s" }}>
                    {copied === "sheet" ? "✓ 복사됨" : "복사"}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#e8dcc8", lineHeight: 1.7, background: "#1a1510", padding: "12px 14px", fontFamily: "monospace", borderLeft: "2px solid var(--go2)" }}>
                  {promptResult.storyboard_sheet_prompt}
                </div>
              </div>

              {/* REFERENCE PROMPTS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { key: "model_reference_prompt", label: "모델 레퍼런스", icon: "👤", id: "model" },
                  { key: "outfit_reference_prompt", label: "의상 & 스타일링", icon: "👗", id: "outfit" },
                  { key: "environment_prompt", label: "환경 & 세트", icon: "🎬", id: "env" },
                ].map(item => (
                  <div key={item.key} style={{ background: "var(--white)", border: "1px solid var(--bd)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink2)", letterSpacing: "0.05em" }}>{item.icon} {item.label}</div>
                      <button onClick={() => copyText(promptResult[item.key], item.id)} style={{ padding: "3px 10px", border: "1px solid var(--bd2)", background: copied === item.id ? "var(--ink2)" : "transparent", color: copied === item.id ? "#f0e8d8" : "var(--br)", cursor: "pointer", fontSize: 10, fontFamily: "Inter,sans-serif" }}>
                        {copied === item.id ? "✓" : "복사"}
                      </button>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--ink3)", lineHeight: 1.6, background: "var(--c)", padding: "8px 10px", fontFamily: "monospace" }}>
                      {(promptResult[item.key] || "").substring(0, 180)}{(promptResult[item.key] || "").length > 180 ? "..." : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* FULL STORYBOARD GRID */}
              <div style={{ background: "var(--white)", border: "1px solid var(--bd)", borderLeft: "3px solid var(--go)", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink2)", letterSpacing: "0.05em" }}>🎞 전체 스토리보드 그리드 이미지</div>
                    <div style={{ fontSize: 10, color: "var(--br)", marginTop: 2 }}>모든 샷을 한 이미지에 그리드로 배치 — 컨택 시트 스타일</div>
                  </div>
                  <button onClick={() => copyText(promptResult.full_storyboard_grid_prompt, "grid")} style={{ padding: "5px 13px", border: "1px solid var(--bd2)", background: copied === "grid" ? "var(--ink2)" : "transparent", color: copied === "grid" ? "#f0e8d8" : "var(--br)", cursor: "pointer", fontSize: 11, fontFamily: "Inter,sans-serif" }}>
                    {copied === "grid" ? "✓ 복사됨" : "복사"}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "var(--ink3)", lineHeight: 1.65, background: "var(--c)", padding: "10px 12px", fontFamily: "monospace" }}>
                  {promptResult.full_storyboard_grid_prompt}
                </div>
              </div>

              {/* SHOT BY SHOT */}
              {shotPrompts.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--br)", fontWeight: 700, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--bd)" }}>
                    🎥 샷별 스틸컷 이미지 프롬프트 — {shotPrompts.length}개
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {shotPrompts.map((sp, i) => (
                      <div key={i} style={{ background: "var(--white)", border: "1px solid var(--bd)", padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 22, height: 22, background: "var(--re)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{sp.shot_num}</div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink2)", letterSpacing: "0.04em" }}>{sp.title}</div>
                            </div>
                          </div>
                          <button onClick={() => copyText(sp.prompt, `shot-${i}`)} style={{ padding: "3px 10px", border: "1px solid var(--bd2)", background: copied === `shot-${i}` ? "var(--ink2)" : "transparent", color: copied === `shot-${i}` ? "#f0e8d8" : "var(--br)", cursor: "pointer", fontSize: 10, fontFamily: "Inter,sans-serif", flexShrink: 0, marginLeft: 8 }}>
                            {copied === `shot-${i}` ? "✓" : "복사"}
                          </button>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ink3)", lineHeight: 1.65, background: "var(--c)", padding: "8px 10px", fontFamily: "monospace" }}>
                          {sp.prompt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOW TO USE */}
              <div style={{ background: "var(--c3)", border: "1px solid var(--bd)", padding: "14px 18px", marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>💡 프롬프트 사용 방법</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { tool: "Midjourney", tip: "프롬프트 복사 후 /imagine 뒤에 붙여넣기. --ar 16:9 --style raw 추가 권장" },
                    { tool: "DALL-E 3 (ChatGPT)", tip: "\"다음 프롬프트로 이미지를 생성해줘:\" 앞에 붙이고 프롬프트 붙여넣기" },
                    { tool: "Stable Diffusion", tip: "Positive prompt에 그대로 붙여넣기. Negative prompt에 blurry, low quality 추가" },
                    { tool: "Adobe Firefly", tip: "Generate 창에 붙여넣기. Style: Photo 선택 권장" },
                  ].map(item => (
                    <div key={item.tool} style={{ background: "var(--white)", border: "1px solid var(--bd)", padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--re)", marginBottom: 4 }}>{item.tool}</div>
                      <div style={{ fontSize: 10, color: "var(--ink3)", lineHeight: 1.5 }}>{item.tip}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {activeSection === "files" && (
        <div>
          <div className="exp-opt" onClick={md}><div style={{ fontSize: 20 }}>⬇</div><div><div className="exp-title">마크다운 (.md)</div><div className="exp-desc">읽기 쉬운 마크다운 문서로 전체 기획서 저장</div></div></div>
          <div className="exp-opt" onClick={json}><div style={{ fontSize: 20 }}>{ }</div><div><div className="exp-title">JSON 데이터 (.json)</div><div className="exp-desc">다른 도구에서 불러오거나 가공할 수 있는 원본 데이터</div></div></div>
          <div className="exp-opt" onClick={() => window.print()}><div style={{ fontSize: 20 }}>⎙</div><div><div className="exp-title">인쇄 / PDF 저장</div><div className="exp-desc">브라우저 인쇄 기능 사용 — 프로덕션 시트 탭에서 실행 권장</div></div></div>
        </div>
      )}
    </div>
  );
}

/* ══ MAIN APP ══ */
export default function App() {
  const [activeTab, setActiveTab] = useState("planner");
  const [planSub, setPlanSub] = useState("concept");
  const { project, setProject, update, updateShot, addShot, removeShot, duplicateShot, applyGenre, loadSample } = useProject();
  const [krOpen, setKrOpen] = useState(false);
  const [krInput, setKrInput] = useState("");
  const [krLoading, setKrLoading] = useState(false);
  const [krStep, setKrStep] = useState("");
  const [krErr, setKrErr] = useState(false);

  const translateAndFill = async () => {
    if (!krInput.trim()) return;
    setKrLoading(true); setKrStep("한글 분석 중..."); setKrErr(false);
    try {
      const raw = await callAI(`You are a professional film production planner. The user has written a video project idea in Korean. Translate and expand into a complete English production plan. Output ONLY valid JSON — no markdown, no explanation.\n\nKorean input:\n"""\n${krInput}\n"""\n\nOutput this exact JSON (all values in English):\n{\n  "title": "PROJECT TITLE IN CAPS",\n  "brand": "Brand or product name",\n  "format": "e.g. Commercial / Short Film",\n  "duration": "e.g. 30–60 seconds",\n  "aspectRatio": "16:9",\n  "genreTone": "Mood1, Mood2, Mood3",\n  "setting": "Location, country — time of day",\n  "colorPalette": "Color1, Color2, Color3",\n  "character": "Character description",\n  "wardrobe": "Clothing and accessories",\n  "beauty": "Makeup and styling",\n  "environment": "Locations and set design",\n  "moodKeywords": "Mood1, Mood2, Mood3, Mood4, Mood5",\n  "audio": "Ambient note. Music style note. Overall tone note.",\n  "cinematography": "Lens choices. Movement style. Color grade style.",\n  "shots": [\n    {"id":1,"title":"Shot Title","size":"Wide","lens":"35mm","movement":"Static","lighting":"desc","mood":"word","action":"what happens","prompt":"cinematic image prompt (3 sentences)"}\n  ]\n}\n\nGenerate 5-8 shots. Output only the JSON.`, 2000);
      setKrStep("번역 완료 — 플래너 입력 중...");
      const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error("no JSON");
      const p = JSON.parse(m[0]);
      const shots = (p.shots || []).map((s, i) => ({ id: s.id || i + 1, title: s.title || `Shot ${i + 1}`, size: s.size || "Medium", lens: s.lens || "50mm", movement: s.movement || "Static", lighting: s.lighting || "", mood: s.mood || "", action: s.action || "", prompt: s.prompt || "" }));
      setProject(prev => ({ ...prev, ...p, totalShots: shots.length, shots }));
      setKrStep(`✓ ${shots.length}개 샷 포함 전체 플래너 자동 입력 완료`);
      setKrInput("");
      setTimeout(() => { setKrOpen(false); setKrStep(""); }, 2200);
      setActiveTab("planner"); setPlanSub("concept");
    } catch { setKrErr(true); setKrStep("오류가 발생했습니다. 다시 시도해주세요."); }
    setKrLoading(false);
  };

  const planSections = [
    { id: "concept", label: "컨셉 & 개요" }, { id: "character", label: "캐릭터 & 스타일" },
    { id: "storyboard", label: "스토리보드" }, { id: "mood", label: "무드 & 키워드" },
    { id: "audio", label: "오디오 & 사운드" }, { id: "cinema", label: "촬영 기법" },
    { id: "export", label: "내보내기" },
  ];

  const renderPlanner = () => {
    switch (planSub) {
      case "concept": return <ConceptTab project={project} update={update} />;
      case "character": return <CharacterTab project={project} update={update} />;
      case "storyboard": return <StoryboardTab project={project} update={update} updateShot={updateShot} addShot={addShot} removeShot={removeShot} duplicateShot={duplicateShot} />;
      case "mood": return <MoodTab project={project} update={update} />;
      case "audio": return <AudioTab project={project} update={update} />;
      case "cinema": return <CinemaTab project={project} update={update} />;
      case "export": return <ExportTab project={project} />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* HEADER */}
        <header className="hdr">
          <div className="hdr-brand">
            <div className="hdr-logo">F</div>
            <div><div className="hdr-title">필름 플래너</div><div className="hdr-sub">AI 영상 기획서 제작 도구</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {project.title && <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, color: "#e8c870", letterSpacing: "0.1em", fontStyle: "italic" }}>{project.title}</div>}
            <button className={"kr-toggle" + (krOpen ? " on" : "")} onClick={() => { setKrOpen(o => !o); setKrStep(""); setKrErr(false); }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>한</span> 한글 입력
            </button>
          </div>
        </header>

        {/* KR PANEL */}
        <div className={"kr-panel" + (krOpen ? " open" : "")}>
          <div className="kr-inner">
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--go2)", textTransform: "uppercase", fontWeight: 600 }}>한글로 기획 내용 입력 — 자동 번역 후 플래너 전체 자동 입력</div>
            <textarea className="kr-ta" rows={3} value={krInput} onChange={e => setKrInput(e.target.value)} placeholder="예: 서울 한강변을 배경으로 한 고급 향수 광고. 30대 여성 배우가 새벽 안개 속에서 걷는 장면으로 시작. 신비롭고 우아한 분위기. 6샷 구성." disabled={krLoading} onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) translateAndFill(); }} />
            <div className="kr-foot">
              <div className="kr-step" style={{ color: krErr ? "#e57373" : "var(--go2)" }}>
                {krLoading && <span className="spin" style={{ borderColor: "#4a3d2a", borderTopColor: "var(--go2)" }} />}
                {krStep || <span style={{ color: "#7a6a58" }}>Ctrl+Enter로 실행</span>}
              </div>
              <button className="kr-btn" onClick={translateAndFill} disabled={krLoading || !krInput.trim()}>
                {krLoading ? "번역 & 입력 중..." : "번역 후 플래너 자동 입력 →"}
              </button>
            </div>
          </div>
        </div>

        {/* GENRE BAR */}
        <div className="genre-bar">
          <span className="g-lbl">장르</span>
          {Object.entries(GENRE_PRESETS).map(([k, v]) => (
            <button key={k} className={"g-btn" + (project.genre === k ? " on" : "")} onClick={() => { applyGenre(k); update("genre", k); }}>{v.label}</button>
          ))}
          <button className="samp" onClick={loadSample}>샘플 불러오기 →</button>
        </div>

        {/* MAIN TABS */}
        <div className="main-tabs">
          <button className={"mt-btn" + (activeTab === "planner" ? " on" : "")} onClick={() => setActiveTab("planner")}>◈ 플래너</button>
          <button className={"mt-btn" + (activeTab === "sheet" ? " on" : "")} onClick={() => setActiveTab("sheet")}>▣ 프로덕션 시트</button>
        </div>

        <div className="wrap">
          {activeTab === "planner" && (
            <div style={{ display: "flex", minHeight: "calc(100vh - 160px)" }}>
              <nav className="sidebar">
                {planSections.map(s => (
                  <button key={s.id} className={"sb-btn" + (planSub === s.id ? " on" : "")} onClick={() => setPlanSub(s.id)}>{s.label}</button>
                ))}
              </nav>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <div className="content">{renderPlanner()}</div>
              </div>
            </div>
          )}
          {activeTab === "sheet" && (
            <div style={{ padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600, color: "var(--ink2)" }}>프로덕션 시트</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--br)", textTransform: "uppercase", marginTop: 2 }}>비주얼 트리트먼트 — {project.aspectRatio}</div>
                </div>
                <div style={{ display: "flex", gap: 9 }}>
                  <button className="btn btn-go" onClick={() => window.print()}>⎙ 인쇄 / PDF</button>
                  <button className="btn btn-dk" onClick={() => setActiveTab("planner")}>← 플래너로 돌아가기</button>
                </div>
              </div>
              <ProductionSheet project={project} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
