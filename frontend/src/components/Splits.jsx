import React, { useState, useEffect } from "react";
import { fmt, t, Panel, PanelTitle, Inp, Sel, BtnPrimary, BtnOutline } from "./theme.jsx";

export default function Splits({ dark }) {
  const c = t(dark);
  const [splits,  setSplits]  = useState([]);
  const [adding,  setAdding]  = useState(false);
  const [desc,    setDesc]    = useState("");
  const [amount,  setAmount]  = useState("");
  const [person,  setPerson]  = useState("");
  const [type,    setType]    = useState("owe");  // owe = they owe me, lent = I owe them
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);

  async function fetchSplits() {
    const res = await fetch("/api/splits");
    setSplits(await res.json());
  }
  useEffect(() => { fetchSplits(); }, []);

  async function addSplit() {
    if (!desc || !amount || !person) return;
    await fetch("/api/splits", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desc, amount: parseFloat(amount), person, type, date }),
    });
    setDesc(""); setAmount(""); setPerson(""); setAdding(false);
    fetchSplits();
  }

  async function settle(id) {
    await fetch(`/api/splits/${id}/settle`, { method: "PUT" });
    fetchSplits();
  }

  async function deleteSplit(id) {
    await fetch(`/api/splits/${id}`, { method: "DELETE" });
    fetchSplits();
  }

  const pending  = splits.filter(s => !s.settled);
  const settled  = splits.filter(s => s.settled);
  const totalOwe = pending.filter(s=>s.type==="owe").reduce((s,x)=>s+x.amount,0);
  const totalLent= pending.filter(s=>s.type==="lent").reduce((s,x)=>s+x.amount,0);

  return (
    <div>
      {/* summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <div style={{ background:c.panel, border:`1px solid ${c.bdr}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, color:c.sub, marginBottom:4 }}>People owe you</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#1D9E75" }}>{fmt(totalOwe)}</div>
        </div>
        <div style={{ background:c.panel, border:`1px solid ${c.bdr}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, color:c.sub, marginBottom:4 }}>You owe others</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#E24B4A" }}>{fmt(totalLent)}</div>
        </div>
      </div>

      <Panel dark={dark}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <PanelTitle dark={dark}>Split expenses</PanelTitle>
          <BtnPrimary dark={dark} onClick={()=>setAdding(a=>!a)} style={{ padding:"5px 12px", fontSize:12 }}>
            {adding ? "Cancel" : "+ Add split"}
          </BtnPrimary>
        </div>

        {adding && (
          <div style={{ background:dark?"#222":"#f9f9f9", borderRadius:10, padding:12, marginBottom:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <Inp dark={dark} placeholder="Description (e.g. Dinner at Barbeque)" value={desc} onChange={e=>setDesc(e.target.value)} />
              <Inp dark={dark} type="number" placeholder="Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
              <Inp dark={dark} placeholder="Person name" value={person} onChange={e=>setPerson(e.target.value)} />
              <Sel dark={dark} value={type} onChange={e=>setType(e.target.value)}>
                <option value="owe">They owe me</option>
                <option value="lent">I owe them</option>
              </Sel>
              <Inp dark={dark} type="date" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <BtnPrimary dark={dark} onClick={addSplit}>Add split</BtnPrimary>
          </div>
        )}

        {pending.length === 0 && !adding && (
          <div style={{ textAlign:"center", padding:"1.5rem", color:c.sub, fontSize:13 }}>No pending splits — you're all settled up! 🎉</div>
        )}

        {pending.map(s => (
          <div key={s.id} style={{
            display:"flex", alignItems:"center", gap:10, padding:"10px 0",
            borderBottom:`1px solid ${c.bdr}`
          }}>
            <div style={{
              width:36, height:36, borderRadius:"50%", flexShrink:0,
              background: s.type==="owe"?"#dcfce7":"#fee2e2",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:16
            }}>
              {s.type==="owe" ? "💰" : "💸"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:c.text }}>{s.desc}</div>
              <div style={{ fontSize:11, color:c.sub }}>
                {s.type==="owe" ? `${s.person} owes you` : `You owe ${s.person}`} · {s.date}
              </div>
            </div>
            <span style={{ fontSize:15, fontWeight:700, color:s.type==="owe"?"#1D9E75":"#E24B4A" }}>
              {s.type==="owe"?"+":"-"}{fmt(s.amount)}
            </span>
            <BtnOutline dark={dark} onClick={()=>settle(s.id)} style={{ padding:"4px 10px", fontSize:11, color:"#1D9E75", borderColor:"#1D9E75" }}>
              ✓ Settle
            </BtnOutline>
            <button onClick={()=>deleteSplit(s.id)} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:13 }}>✕</button>
          </div>
        ))}
      </Panel>

      {settled.length > 0 && (
        <Panel dark={dark}>
          <PanelTitle dark={dark}>Settled ({settled.length})</PanelTitle>
          {settled.map(s => (
            <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${c.bdr}`, opacity:0.5 }}>
              <div>
                <div style={{ fontSize:13, color:c.text }}>{s.desc}</div>
                <div style={{ fontSize:11, color:c.sub }}>{s.person} · {s.date}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:13, color:c.sub }}>{fmt(s.amount)}</span>
                <span style={{ fontSize:11, color:"#1D9E75" }}>✓ Settled</span>
                <button onClick={()=>deleteSplit(s.id)} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:11 }}>✕</button>
              </div>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
