import React, { useState, useEffect } from "react";
import { CATS, ICONS, fmt, t, Panel, PanelTitle, Inp, BtnPrimary } from "./theme.jsx";

const EXP_CATS = ["Food","Transport","Bills","Shopping","Health","Entertainment"];

export default function Budget({ budgets, summary, onSave, dark }) {
  const c = t(dark);
  const [local,  setLocal]  = useState({});
  const [saved,  setSaved]  = useState(false);

  useEffect(()=>{ setLocal({...budgets}); }, [budgets]);

  const catTotals = summary?.cat_totals || {};
  const CAT_AVG   = {Food:1500,Transport:500,Bills:1500,Shopping:1500,Health:500,Entertainment:700};
  const anomalies = [];
  EXP_CATS.forEach(cat=>{
    const spent  = catTotals[cat]||0;
    const budget = local[cat]||0;
    if (spent>0 && CAT_AVG[cat] && spent>CAT_AVG[cat]*2)
      anomalies.push(`${ICONS[cat]} ${cat} spending (${fmt(spent)}) is ${Math.round(spent/CAT_AVG[cat])}x the typical average`);
    if (budget>0 && spent>budget)
      anomalies.push(`${ICONS[cat]} ${cat} is over budget — spent ${fmt(spent)} of ${fmt(budget)}`);
  });

  async function handleSave() {
    await onSave(local); setSaved(true); setTimeout(()=>setSaved(false),2000);
  }

  return (
    <div>
      <Panel dark={dark}>
        <PanelTitle dark={dark}>Set monthly budgets (₹)</PanelTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          {EXP_CATS.map(cat=>(
            <div key={cat} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:c.sub, width:110, flexShrink:0 }}>{ICONS[cat]} {cat}</span>
              <Inp dark={dark} type="number" value={local[cat]||""} onChange={e=>setLocal(p=>({...p,[cat]:parseFloat(e.target.value)||0}))} min="0" step="100" />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <BtnPrimary dark={dark} onClick={handleSave}>Save budgets</BtnPrimary>
          {saved && <span style={{ fontSize:12, color:"#1D9E75" }}>Saved!</span>}
        </div>
      </Panel>

      <Panel dark={dark}>
        <PanelTitle dark={dark}>Budget vs actual</PanelTitle>
        {EXP_CATS.map(cat=>{
          const spent  = catTotals[cat]||0;
          const budget = local[cat]||0;
          const pct    = budget>0 ? Math.min(100,Math.round(spent/budget*100)) : 0;
          const over   = budget>0 && spent>budget;
          const warn   = !over && pct>75;
          const color  = over?"#E24B4A":warn?"#BA7517":"#1D9E75";
          return (
            <div key={cat} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ color:c.text, fontWeight:500 }}>{ICONS[cat]} {cat}</span>
                <span style={{ color, fontWeight:600 }}>{fmt(spent)} / {fmt(budget)}{over&&" ⚠ over"}</span>
              </div>
              <div style={{ height:7, background:dark?"#2a2a2a":"#f0f0f0", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width .4s" }}/>
              </div>
              <div style={{ fontSize:10, color:c.sub, marginTop:3 }}>{pct}% used</div>
            </div>
          );
        })}
      </Panel>

      {anomalies.length>0 && (
        <Panel dark={dark}>
          <PanelTitle dark={dark}>⚠ Anomalies detected</PanelTitle>
          {anomalies.map((a,i)=>(
            <div key={i} style={{ background:dark?"#2a1a00":"#fffbeb", border:`1px solid ${dark?"#7c4a00":"#fde68a"}`, borderRadius:8, padding:"8px 12px", fontSize:12, color:dark?"#fbbf24":"#92400e", marginBottom:6 }}>{a}</div>
          ))}
        </Panel>
      )}
    </div>
  );
}
