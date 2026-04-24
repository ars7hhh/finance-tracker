import React, { useState } from "react";
import { fmt, t, Panel, PanelTitle, Inp, BtnPrimary, BtnOutline, Spinner, AIBox } from "./theme.jsx";

export default function AIAnalysis({ transactions, summary, budgets, dark }) {
  const c = t(dark);
  const [analysisRes, setAnalysisRes] = useState("");
  const [anomalyRes,  setAnomalyRes]  = useState("");
  const [question,    setQuestion]    = useState("");
  const [chatRes,     setChatRes]     = useState("");
  const [loadA, setLoadA] = useState(false);
  const [loadN, setLoadN] = useState(false);
  const [loadQ, setLoadQ] = useState(false);

  async function runAnalysis() {
    setLoadA(true); setAnalysisRes("");
    const res  = await fetch("/api/ai/analyze", { method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ total_income:summary.total_income, total_expenses:summary.total_expenses, cat_totals:summary.cat_totals, budgets }) });
    const data = await res.json();
    setAnalysisRes(data.result); setLoadA(false);
  }

  async function runAnomalies() {
    setLoadN(true); setAnomalyRes("");
    const res  = await fetch("/api/ai/anomalies", { method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ transactions, budgets }) });
    const data = await res.json();
    setAnomalyRes(data.result); setLoadN(false);
  }

  async function askClaude() {
    if (!question.trim()) return;
    setLoadQ(true); setChatRes("");
    const res  = await fetch("/api/ai/ask", { method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ question, total_expenses:summary.total_expenses, cat_totals:summary.cat_totals, budgets }) });
    const data = await res.json();
    setChatRes(data.result); setLoadQ(false);
  }

  const quickPrompts = [
    "How much am I spending on food vs average?",
    "Which category should I cut first?",
    "Am I on track to save this month?",
    "Give me a 30-day savings plan",
  ];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
        {Object.entries(summary?.cat_totals||{}).slice(0,3).map(([cat,amt])=>(
          <div key={cat} style={{ background:c.panel, border:`1px solid ${c.bdr}`, borderRadius:10, padding:"10px 14px" }}>
            <div style={{ fontSize:11, color:c.sub }}>{cat}</div>
            <div style={{ fontSize:18, fontWeight:700, color:c.text }}>{fmt(amt)}</div>
          </div>
        ))}
      </div>

      <Panel dark={dark}>
        <PanelTitle dark={dark}>AI-powered insights</PanelTitle>
        <p style={{ fontSize:13, color:c.sub, lineHeight:1.6, marginBottom:12 }}>
          Your local Ollama model analyzes spending patterns and gives personalized recommendations.
        </p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <BtnPrimary dark={dark} onClick={runAnalysis} disabled={loadA}>{loadA?"Analyzing...":"Analyze my finances ↗"}</BtnPrimary>
          <BtnOutline dark={dark} onClick={runAnomalies} disabled={loadN}>{loadN?"Scanning...":"Detect anomalies ↗"}</BtnOutline>
        </div>
        {loadA && <Spinner />}
        {analysisRes && <AIBox text={analysisRes} dark={dark} />}
        {loadN && <Spinner />}
        {anomalyRes && <AIBox text={anomalyRes} dark={dark} />}
      </Panel>

      <Panel dark={dark}>
        <PanelTitle dark={dark}>Ask AI anything</PanelTitle>
        <p style={{ fontSize:13, color:c.sub, marginBottom:10 }}>Your financial data is included as context automatically.</p>
        <div style={{ display:"flex", gap:8 }}>
          <input
            style={{ flex:1, padding:"7px 10px", fontSize:13, border:`1px solid ${c.inpBdr}`, borderRadius:8, background:c.inp, color:c.text, fontFamily:"inherit", outline:"none" }}
            placeholder="e.g. How can I save more on food this month?"
            value={question} onChange={e=>setQuestion(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&askClaude()}
          />
          <BtnPrimary dark={dark} onClick={askClaude} disabled={loadQ}>{loadQ?"...":"Ask ↗"}</BtnPrimary>
        </div>
        {loadQ && <Spinner />}
        {chatRes && (
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:12, color:c.sub, marginBottom:4 }}>You: {question}</div>
            <AIBox text={chatRes} dark={dark} />
          </div>
        )}
      </Panel>

      <Panel dark={dark} style={{ background:dark?"#181818":c.panel }}>
        <PanelTitle dark={dark}>Quick prompts</PanelTitle>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {quickPrompts.map(q=>(
            <button key={q} onClick={()=>setQuestion(q)}
              style={{ padding:"5px 12px", fontSize:12, background:dark?"#2a2a2a":"#f0f0f0", color:c.text, border:"none", borderRadius:99, cursor:"pointer" }}>
              {q}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
