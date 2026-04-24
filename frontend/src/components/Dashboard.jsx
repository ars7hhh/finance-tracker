import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const CATS   = ["Food","Transport","Bills","Shopping","Health","Entertainment","Other"];
const COLORS = ["#f87171","#60a5fa","#fbbf24","#34d399","#f472b6","#a78bfa","#94a3b8"];
const ICONS  = {Food:"🍽",Transport:"🚗",Bills:"⚡",Shopping:"🛍",Health:"💊",Entertainment:"🎬",Other:"📦"};

function fmt(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }

function glass(dark) {
  return {
    background: dark ? "rgba(168, 75, 75, 0.05)" : "rgba(255,255,255,0.75)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.95)",
    borderRadius: 20,
    boxShadow: dark
      ? "0 8px 32px rgba(0,0,0,0.4)"
      : "0 8px 32px rgba(124,58,237,0.08)",
  };
}

export default function Dashboard({ transactions, summary, budgets, onDelete, dark }) {
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("All");

  if (!summary) return null;
  const { total_expenses, total_income, balance, cat_totals, daily, forecast, last_month } = summary;

  const pieData = Object.entries(cat_totals).filter(([,v])=>v>0).map(([name,value])=>({name,value}));

  const last7 = [];
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = d.toISOString().split("T")[0];
    last7.push({ date:key.slice(5), amount:daily[key]||0 });
  }

  const expDiff    = total_expenses - (last_month?.expenses||0);
  const expDiffPct = last_month?.expenses ? Math.round((expDiff/last_month.expenses)*100) : 0;

  const filtered = [...transactions]
    .filter(tx => filterCat==="All" || tx.cat===filterCat)
    .filter(tx => tx.desc.toLowerCase().includes(search.toLowerCase()))
    .reverse().slice(0,30);

  const text = dark ? "#f0f0f5" : "#1a1a2e";
  const sub  = dark ? "#888"    : "#8888aa";
  const inp  = dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)";
  const inpBdr = dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.15)";

  const metrics = [
    { label:"Total spent",    value:fmt(total_expenses), sub:"This month",         grad:"linear-gradient(135deg,#f87171,#ef4444)", icon:"💸" },
    { label:"Income",         value:fmt(total_income),   sub:"This month",         grad:"linear-gradient(135deg,#34d399,#059669)", icon:"💵" },
    { label:"Balance",        value:fmt(Math.abs(balance)), sub:balance>=0?"Saved":"Deficit", grad: balance>=0?"linear-gradient(135deg,#60a5fa,#3b82f6)":"linear-gradient(135deg,#f87171,#dc2626)", icon: balance>=0?"🏦":"⚠️" },
    { label:"Month forecast", value:fmt(forecast),       sub:"At current rate",    grad:"linear-gradient(135deg,#fbbf24,#d97706)", icon:"📈" },
  ];

  return (
    <div>
      {/* metric cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            ...glass(dark),
            padding:"16px",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{
              position:"absolute", top:-10, right:-10,
              width:60, height:60, borderRadius:"50%",
              background:m.grad, opacity:0.15,
            }}/>
            <div style={{ fontSize:22, marginBottom:6 }}>{m.icon}</div>
            <div style={{ fontSize:11, color:sub, marginBottom:4, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{m.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:text, letterSpacing:"-0.02em" }}>{m.value}</div>
            <div style={{ fontSize:11, color:sub, marginTop:3 }}>{m.sub}</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:m.grad, borderRadius:"0 0 20px 20px", opacity:0.6 }}/>
          </div>
        ))}
      </div>

      {/* vs last month */}
      {last_month?.expenses > 0 && (
        <div style={{
          ...glass(dark),
          padding:"12px 16px", marginBottom:16,
          display:"flex", alignItems:"center", gap:10,
          background: expDiff>0
            ? dark?"rgba(239,68,68,0.1)":"rgba(239,68,68,0.06)"
            : dark?"rgba(52,211,153,0.1)":"rgba(52,211,153,0.06)",
          border: expDiff>0?"1px solid rgba(239,68,68,0.2)":"1px solid rgba(52,211,153,0.2)",
        }}>
          <span style={{ fontSize:20 }}>{expDiff>0?"📈":"📉"}</span>
          <span style={{ fontSize:13, color:text }}>
            vs last month: <strong style={{ color:expDiff>0?"#f87171":"#34d399" }}>{expDiff>0?"+":""}{fmt(expDiff)} ({expDiffPct}%)</strong>
            {" — "}spending is {expDiff>0?"higher 🔴":"lower 🟢"} than last month
          </span>
        </div>
      )}

      {/* charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
        <div style={{ ...glass(dark), padding:"16px 18px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:sub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>By category</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {pieData.map((e,i)=><Cell key={e.name} fill={COLORS[CATS.indexOf(e.name)]} />)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:dark?"#1a1a2e":"#fff", border:"none", borderRadius:12, fontSize:12, boxShadow:"0 8px 24px rgba(0,0,0,0.15)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
            {pieData.map(d=>(
              <span key={d.name} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:sub }}>
                <span style={{ width:8,height:8,borderRadius:3,background:COLORS[CATS.indexOf(d.name)],display:"inline-block" }}/>
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div style={{ ...glass(dark), padding:"16px 18px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:sub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Daily spending</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7} margin={{ top:4,right:8,left:-10,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"} />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:sub }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:sub }} tickFormatter={v=>`₹${v}`} axisLine={false} tickLine={false} />
              <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:dark?"#1a1a2e":"#fff", border:"none", borderRadius:12, fontSize:12, boxShadow:"0 8px 24px rgba(0,0,0,0.15)" }} cursor={{ fill:"rgba(124,58,237,0.08)" }} />
              <Bar dataKey="amount" radius={[8,8,0,0]}>
                {last7.map((_,i)=>(
                  <Cell key={i} fill={`url(#barGrad${i})`} />
                ))}
              </Bar>
              <defs>
                {last7.map((_,i)=>(
                  <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* search + filter */}
      <div style={{ ...glass(dark), padding:"16px 18px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:sub, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Transactions</div>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          <input
            placeholder="🔍  Search transactions..."
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ flex:1, padding:"9px 14px", fontSize:13, border:`1px solid ${inpBdr}`, borderRadius:12, background:inp, color:text, fontFamily:"inherit", outline:"none" }}
          />
          <select
            value={filterCat} onChange={e=>setFilterCat(e.target.value)}
            style={{ padding:"9px 14px", fontSize:13, border:`1px solid ${inpBdr}`, borderRadius:12, background:inp, color:text, fontFamily:"inherit", outline:"none" }}
          >
            <option value="All">All categories</option>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"2rem", color:sub, fontSize:13 }}>No transactions found</div>}
        {filtered.map(tx => <TxnRow key={tx.id} tx={tx} onDelete={onDelete} dark={dark} />)}
      </div>
    </div>
  );
}

function TxnRow({ tx, onDelete, dark }) {
  const text = dark ? "#f0f0f5" : "#1a1a2e";
  const sub  = dark ? "#888"    : "#8888aa";
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12, padding:"10px 0",
      borderBottom:`1px solid ${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}`,
    }}>
      <div style={{
        width:38, height:38, borderRadius:12, flexShrink:0,
        background:`${COLORS[CATS.indexOf(tx.cat)]}22`,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
        border:`1px solid ${COLORS[CATS.indexOf(tx.cat)]}44`,
      }}>
        {ICONS[tx.cat]||"📦"}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tx.desc}</div>
        <div style={{ fontSize:11, color:sub, marginTop:2 }}>
          {tx.date} ·{" "}
          <span style={{ background:`${COLORS[CATS.indexOf(tx.cat)]}22`, color:COLORS[CATS.indexOf(tx.cat)], padding:"1px 8px", borderRadius:99, fontSize:10, fontWeight:600 }}>{tx.cat}</span>
        </div>
      </div>
      <span style={{ fontSize:14, fontWeight:700, color:tx.type==="income"?"#34d399":"#f87171" }}>
        {tx.type==="income"?"+":"-"}{fmt(tx.amount)}
      </span>
      <button onClick={()=>onDelete(tx.id)} style={{
        background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
        color:"#f87171", borderRadius:8, cursor:"pointer", padding:"4px 9px", fontSize:11, fontWeight:600,
      }}>✕</button>
    </div>
  );
}