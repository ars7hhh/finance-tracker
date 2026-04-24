import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { CATS, COLORS, fmt, t, Panel, PanelTitle } from "./theme.jsx";

export default function MonthlyComparison({ dark }) {
  const c = t(dark);
  const [data, setData] = useState([]);

  useEffect(()=>{
    fetch("/api/monthly").then(r=>r.json()).then(setData);
  }, []);

  if (!data.length) return <div style={{ textAlign:"center", padding:"3rem", color:c.sub }}>Loading...</div>;

  const chartData = data.map(d=>({
    month: d.month.slice(5),
    Expenses: d.expenses,
    Income: d.income,
    Savings: Math.max(0, d.income - d.expenses),
  }));

  const latest    = data[data.length-1];
  const prev      = data[data.length-2];
  const expChange = prev ? Math.round(((latest.expenses-prev.expenses)/prev.expenses)*100) : 0;
  const incChange = prev ? Math.round(((latest.income-prev.income)/prev.income)*100) : 0;

  return (
    <div>
      {prev && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
          {[
            { label:"Expenses vs last month", value:`${expChange>0?"+":""}${expChange}%`, color:expChange>0?"#E24B4A":"#1D9E75" },
            { label:"Income vs last month",   value:`${incChange>0?"+":""}${incChange}%`, color:incChange>0?"#1D9E75":"#E24B4A" },
            { label:"This month savings",      value:fmt(Math.max(0,latest.income-latest.expenses)), color:"#1D9E75" },
          ].map(m=>(
            <div key={m.label} style={{ background:c.panel, border:`1px solid ${c.bdr}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:c.sub, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:20, fontWeight:700, color:m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      <Panel dark={dark}>
        <PanelTitle dark={dark}>Income vs expenses (last 6 months)</PanelTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top:4, right:8, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark?"#2a2a2a":"#f0f0f0"} />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:c.sub }} />
            <YAxis tick={{ fontSize:10, fill:c.sub }} tickFormatter={v=>`₹${v/1000}k`} />
            <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:c.panel, border:`1px solid ${c.bdr}`, color:c.text, fontSize:12 }} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="Income"   fill="#1D9E75" radius={[3,3,0,0]} />
            <Bar dataKey="Expenses" fill="#E24B4A" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel dark={dark}>
        <PanelTitle dark={dark}>Savings trend</PanelTitle>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top:4, right:8, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark?"#2a2a2a":"#f0f0f0"} />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:c.sub }} />
            <YAxis tick={{ fontSize:10, fill:c.sub }} tickFormatter={v=>`₹${v/1000}k`} />
            <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:c.panel, border:`1px solid ${c.bdr}`, color:c.text, fontSize:12 }} />
            <Line type="monotone" dataKey="Savings" stroke="#378ADD" strokeWidth={2} dot={{ fill:"#378ADD", r:4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel dark={dark}>
        <PanelTitle dark={dark}>Month-by-month breakdown</PanelTitle>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>
                {["Month","Income","Expenses","Savings","Rate"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"6px 10px", color:c.sub, fontWeight:600, fontSize:11, borderBottom:`1px solid ${c.bdr}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map(d=>{
                const savings = d.income - d.expenses;
                const rate    = d.income>0 ? Math.round(savings/d.income*100) : 0;
                return (
                  <tr key={d.month}>
                    <td style={{ padding:"8px 10px", color:c.text, fontWeight:500 }}>{d.month}</td>
                    <td style={{ padding:"8px 10px", color:"#1D9E75" }}>{fmt(d.income)}</td>
                    <td style={{ padding:"8px 10px", color:"#E24B4A" }}>{fmt(d.expenses)}</td>
                    <td style={{ padding:"8px 10px", color:savings>=0?"#1D9E75":"#E24B4A", fontWeight:600 }}>{fmt(savings)}</td>
                    <td style={{ padding:"8px 10px", color:rate>=20?"#1D9E75":rate>=10?"#BA7517":"#E24B4A" }}>{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
