export const CATS   = ["Food","Transport","Bills","Shopping","Health","Entertainment","Other"];
export const COLORS = ["#E24B4A","#378ADD","#BA7517","#1D9E75","#D4537E","#534AB7","#888780"];
export const ICONS  = {Food:"🍽",Transport:"🚗",Bills:"⚡",Shopping:"🛍",Health:"💊",Entertainment:"🎬",Other:"📦"};

export function fmt(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }

export function t(dark) {
  return {
    bg:     dark ? "#0f0f0f" : "#f5f5f5",
    panel:  dark ? "#1a1a1a" : "#fff",
    panel2: dark ? "#222"    : "#f8f8f8",
    bdr:    dark ? "#2e2e2e" : "#e8e8e8",
    text:   dark ? "#e5e5e5" : "#111",
    sub:    dark ? "#888"    : "#888",
    inp:    dark ? "#252525" : "#fff",
    inpBdr: dark ? "#3a3a3a" : "#e0e0e0",
    badge:  dark ? "#1e3a5f" : "#e8f0fe",
    bdgTxt: dark ? "#90c4ff" : "#3266ad",
  };
}

export function Panel({ dark, children, style={} }) {
  const c = t(dark);
  return (
    <div style={{
      background: c.panel, border: `1px solid ${c.bdr}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 14, ...style
    }}>
      {children}
    </div>
  );
}

export function PanelTitle({ dark, children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: t(dark).sub,
      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12
    }}>
      {children}
    </div>
  );
}

export function Inp({ dark, style={}, ...props }) {
  const c = t(dark);
  return (
    <input style={{
      width: "100%", padding: "7px 10px", fontSize: 13,
      border: `1px solid ${c.inpBdr}`, borderRadius: 8,
      background: c.inp, color: c.text, fontFamily: "inherit", outline: "none", ...style
    }} {...props} />
  );
}

export function Sel({ dark, style={}, children, ...props }) {
  const c = t(dark);
  return (
    <select style={{
      width: "100%", padding: "7px 10px", fontSize: 13,
      border: `1px solid ${c.inpBdr}`, borderRadius: 8,
      background: c.inp, color: c.text, fontFamily: "inherit", outline: "none", ...style
    }} {...props}>
      {children}
    </select>
  );
}

export function BtnPrimary({ dark, children, style={}, ...props }) {
  const c = t(dark);
  return (
    <button style={{
      padding: "7px 16px", fontSize: 13, fontWeight: 600,
      background: dark ? "#fff" : "#111", color: dark ? "#111" : "#fff",
      border: "none", borderRadius: 8, cursor: "pointer", ...style
    }} {...props}>{children}</button>
  );
}

export function BtnOutline({ dark, children, style={}, ...props }) {
  const c = t(dark);
  return (
    <button style={{
      padding: "7px 16px", fontSize: 13, fontWeight: 500,
      background: "none", color: c.text,
      border: `1px solid ${c.inpBdr}`, borderRadius: 8, cursor: "pointer", ...style
    }} {...props}>{children}</button>
  );
}

export function TxnRow({ t: txn, onDelete, dark }) {
  const c = t(dark);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${c.bdr}` }}>
      <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, background: COLORS[CATS.indexOf(txn.cat)]+"22" }}>
        {ICONS[txn.cat]||"📦"}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:500, color:c.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{txn.desc}</div>
        <div style={{ fontSize:11, color:c.sub }}>{txn.date} · <span style={{ background:c.badge, color:c.bdgTxt, padding:"1px 7px", borderRadius:99, fontSize:10, fontWeight:500 }}>{txn.cat}</span>{txn.recurring && <span style={{ marginLeft:4, fontSize:10, color:"#BA7517" }}>🔁 {txn.recurring}</span>}</div>
      </div>
      <span style={{ fontSize:14, fontWeight:600, color: txn.type==="income"?"#1D9E75":"#E24B4A" }}>
        {txn.type==="income"?"+":"-"}{fmt(txn.amount)}
      </span>
      {onDelete && <button onClick={()=>onDelete(txn.id)} style={{ background:"none", border:"1px solid #fca5a5", color:"#ef4444", borderRadius:6, cursor:"pointer", padding:"2px 8px", fontSize:11 }}>✕</button>}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, color:"#888", fontSize:13, padding:"8px 0" }}>
      <span style={dot(0)}/><span style={dot(.2)}/><span style={dot(.4)}/>
      <span>Thinking...</span>
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </div>
  );
}
function dot(d) {
  return { width:7, height:7, borderRadius:"50%", background:"#888", display:"inline-block", animation:`pulse 1.2s ${d}s ease-in-out infinite` };
}

export function AIBox({ text, dark }) {
  const c = t(dark);
  return (
    <div style={{ background: dark?"#0d1f35":"#eff6ff", border:`1px solid ${dark?"#1e3a5f":"#bfdbfe"}`, borderRadius:10, padding:"12px 14px", marginTop:10 }}>
      {text.split("\n").filter(l=>l.trim()).map((line,i)=>(
        <p key={i} style={{ fontSize:13, lineHeight:1.7, marginBottom:4, color: dark?"#90c4ff":"#1e3a5f" }}>{line}</p>
      ))}
    </div>
  );
}
