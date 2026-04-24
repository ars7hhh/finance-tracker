import React, { useState, useEffect } from "react";
import { fmt, t, Panel, PanelTitle, Inp, BtnPrimary, BtnOutline } from "./theme.jsx";

export default function Goals({ dark }) {
  const c = t(dark);
  const [goals,  setGoals]  = useState([]);
  const [name,   setName]   = useState("");
  const [target, setTarget] = useState("");
  const [saved,  setSaved]  = useState("");
  const [due,    setDue]    = useState("");
  const [adding, setAdding] = useState(false);
  const [deposit, setDeposit] = useState({});

  async function fetchGoals() {
    const res = await fetch("/api/goals");
    setGoals(await res.json());
  }
  useEffect(()=>{ fetchGoals(); }, []);

  async function addGoal() {
    if (!name||!target) return;
    await fetch("/api/goals", { method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name, target:parseFloat(target), saved:parseFloat(saved)||0, due_date:due }) });
    setName(""); setTarget(""); setSaved(""); setDue(""); setAdding(false);
    fetchGoals();
  }

  async function addDeposit(id) {
    const amt = parseFloat(deposit[id]||0);
    if (!amt) return;
    const goal = goals.find(g=>g.id===id);
    await fetch(`/api/goals/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ saved: (goal.saved||0) + amt }) });
    setDeposit(p=>({...p,[id]:""}));
    fetchGoals();
  }

  async function deleteGoal(id) {
    await fetch(`/api/goals/${id}`, { method:"DELETE" });
    fetchGoals();
  }

  return (
    <div>
      <Panel dark={dark}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <PanelTitle dark={dark}>Savings goals</PanelTitle>
          <BtnPrimary dark={dark} onClick={()=>setAdding(a=>!a)} style={{ padding:"5px 12px", fontSize:12 }}>
            {adding?"Cancel":"+ New goal"}
          </BtnPrimary>
        </div>

        {adding && (
          <div style={{ background:dark?"#222":"#f9f9f9", borderRadius:10, padding:12, marginBottom:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <Inp dark={dark} placeholder="Goal name (e.g. Goa trip)" value={name} onChange={e=>setName(e.target.value)} />
              <Inp dark={dark} type="number" placeholder="Target amount (₹)" value={target} onChange={e=>setTarget(e.target.value)} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <Inp dark={dark} type="number" placeholder="Already saved (₹)" value={saved} onChange={e=>setSaved(e.target.value)} />
              <Inp dark={dark} type="date" value={due} onChange={e=>setDue(e.target.value)} />
            </div>
            <BtnPrimary dark={dark} onClick={addGoal}>Create goal</BtnPrimary>
          </div>
        )}

        {goals.length===0 && !adding && (
          <div style={{ textAlign:"center", padding:"2rem", color:c.sub, fontSize:13 }}>No goals yet — create one to start tracking!</div>
        )}

        {goals.map(g=>{
          const pct  = g.target>0 ? Math.min(100,Math.round(g.saved/g.target*100)) : 0;
          const left = g.target - g.saved;
          const done = pct >= 100;
          const color = done?"#1D9E75":pct>60?"#378ADD":"#BA7517";
          const daysLeft = g.due_date ? Math.round((new Date(g.due_date)-new Date())/86400000) : null;
          return (
            <div key={g.id} style={{ background:dark?"#222":"#f9f9f9", borderRadius:10, padding:14, marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <div>
                  <span style={{ fontSize:14, fontWeight:600, color:c.text }}>{done?"🏆 ":""}{g.name}</span>
                  {g.due_date && <span style={{ fontSize:11, color:c.sub, marginLeft:8 }}>Due: {g.due_date}{daysLeft!==null&&` (${daysLeft}d left)`}</span>}
                </div>
                <button onClick={()=>deleteGoal(g.id)} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:13 }}>✕</button>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ color:c.sub }}>Saved: <strong style={{ color:c.text }}>{fmt(g.saved)}</strong></span>
                <span style={{ color, fontWeight:600 }}>{pct}% · {fmt(left)} to go</span>
              </div>
              <div style={{ height:8, background:dark?"#2a2a2a":"#e5e5e5", borderRadius:99, overflow:"hidden", marginBottom:8 }}>
                <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width .4s" }}/>
              </div>
              {!done && (
                <div style={{ display:"flex", gap:6 }}>
                  <Inp dark={dark} type="number" placeholder="Add deposit (₹)" value={deposit[g.id]||""} onChange={e=>setDeposit(p=>({...p,[g.id]:e.target.value}))} style={{ maxWidth:160 }} />
                  <BtnOutline dark={dark} onClick={()=>addDeposit(g.id)} style={{ padding:"5px 10px", fontSize:12 }}>+ Add</BtnOutline>
                </div>
              )}
              {done && <div style={{ fontSize:12, color:"#1D9E75", fontWeight:500 }}>🎉 Goal reached!</div>}
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
