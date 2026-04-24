import React, { useState, useEffect } from "react";
import { ICONS, fmt, t, Panel, PanelTitle } from "./theme.jsx";

export default function Recurring({ dark }) {
  const c = t(dark);
  const [recurring,  setRecurring]  = useState([]);
  const [reminders,  setReminders]  = useState([]);

  useEffect(()=>{
    fetch("/api/recurring").then(r=>r.json()).then(setRecurring);
    fetch("/api/reminders").then(r=>r.json()).then(setReminders);
  }, []);

  const monthlyTotal = recurring.filter(r=>r.recurring==="monthly").reduce((s,r)=>s+r.amount,0);

  return (
    <div>
      <Panel dark={dark}>
        <PanelTitle dark={dark}>Bill reminders</PanelTitle>
        <p style={{ fontSize:13, color:c.sub, marginBottom:12 }}>
          Monthly recurring expenses — mark bills as "monthly" when adding to see them here.
        </p>
        <div style={{ background:dark?"#222":"#f0fdf4", border:`1px solid ${dark?"#1a3a1a":"#bbf7d0"}`, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:13 }}>
          <span style={{ color:c.sub }}>Total monthly commitments: </span>
          <strong style={{ color:"#1D9E75", fontSize:16 }}>{fmt(monthlyTotal)}</strong>
        </div>
        {reminders.length===0 && (
          <div style={{ textAlign:"center", padding:"1.5rem", color:c.sub, fontSize:13 }}>No recurring expenses found. Mark transactions as "monthly" when adding them.</div>
        )}
        {reminders.map((r,i)=>{
          const urgent  = r.days_left>=0 && r.days_left<=5;
          const overdue = r.overdue;
          const bg      = overdue?(dark?"#2a0a0a":"#fef2f2"):urgent?(dark?"#2a1a00":"#fffbeb"):(dark?"#1e1e1e":"#f9f9f9");
          const bdrCol  = overdue?(dark?"#7f1d1d":"#fecaca"):urgent?(dark?"#7c4a00":"#fde68a"):(dark?"#2e2e2e":"#e5e5e5");
          const badge   = overdue?"🔴 Overdue":urgent?`🟡 Due in ${r.days_left}d`:`🟢 Due ${r.next_due}`;
          return (
            <div key={i} style={{ background:bg, border:`1px solid ${bdrCol}`, borderRadius:10, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:c.text }}>{ICONS[r.cat]||"📦"} {r.desc}</div>
                <div style={{ fontSize:11, color:c.sub, marginTop:2 }}>{r.cat} · Next: {r.next_due}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#E24B4A" }}>{fmt(r.amount)}</div>
                <div style={{ fontSize:11, marginTop:2 }}>{badge}</div>
              </div>
            </div>
          );
        })}
      </Panel>

      <Panel dark={dark}>
        <PanelTitle dark={dark}>All recurring transactions</PanelTitle>
        {recurring.length===0 && <div style={{ textAlign:"center", padding:"1.5rem", color:c.sub, fontSize:13 }}>None yet.</div>}
        {[...recurring].reverse().map(r=>(
          <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${c.bdr}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:c.text }}>{ICONS[r.cat]||"📦"} {r.desc}</div>
              <div style={{ fontSize:11, color:c.sub }}>{r.cat} · {r.date} · <span style={{ color:"#BA7517" }}>🔁 {r.recurring}</span></div>
            </div>
            <span style={{ fontSize:13, fontWeight:600, color: r.type==="income"?"#1D9E75":"#E24B4A" }}>
              {r.type==="income"?"+":"-"}{fmt(r.amount)}
            </span>
          </div>
        ))}
      </Panel>
    </div>
  );
}
