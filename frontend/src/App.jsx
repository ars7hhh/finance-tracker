import React, { useState, useEffect, createContext, useContext } from "react";
import Dashboard from "./components/Dashboard.jsx";
import AddTransaction from "./components/AddTransaction.jsx";
import Budget from "./components/Budget.jsx";
import AIAnalysis from "./components/AIAnalysis.jsx";
import Goals from "./components/Goals.jsx";
import Recurring from "./components/Recurring.jsx";
import MonthlyComparison from "./components/MonthlyComparison.jsx";
import Splits from "./components/Splits.jsx";

export const ThemeCtx = createContext();
export function useTheme() { return useContext(ThemeCtx); }

const TABS = [
  { id:"dashboard", label:"Dashboard",  icon:"⊞" },
  { id:"add",       label:"Add",        icon:"＋" },
  { id:"budget",    label:"Budget",     icon:"◎" },
  { id:"goals",     label:"Goals",      icon:"◈" },
  { id:"recurring", label:"Recurring",  icon:"↻" },
  { id:"monthly",   label:"Monthly",    icon:"▦" },
  { id:"splits",    label:"Splits",     icon:"⇄" },
  { id:"ai",        label:"AI",         icon:"✦" },
];

export default function App() {
  const [tab,          setTab]          = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [budgets,      setBudgets]      = useState({});
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [dark,         setDark]         = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.style.background = dark
      ? "linear-gradient(135deg,#0a0a0f 0%,#0f0f1a 100%)"
      : "linear-gradient(135deg,#f0f4ff 0%,#faf5ff 100%)";
    document.body.style.minHeight = "100vh";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  async function fetchAll() {
    setLoading(true);
    const [txRes, bdRes, smRes] = await Promise.all([
      fetch("/api/transactions"),
      fetch("/api/budgets"),
      fetch("/api/summary"),
    ]);
    setTransactions(await txRes.json());
    setBudgets(await bdRes.json());
    setSummary(await smRes.json());
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  async function addTransaction(data) {
    await fetch("/api/transactions", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data),
    });
    fetchAll();
  }

  async function deleteTransaction(id) {
    await fetch(`/api/transactions/${id}`, { method:"DELETE" });
    fetchAll();
  }

  async function saveBudgets(data) {
    await fetch("/api/budgets", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data),
    });
    fetchAll();
  }

  function exportCSV() { window.open("/api/export/csv","_blank"); }

  const accent = dark ? "#a78bfa" : "#7c3aed";
  const glass  = dark
    ? "rgba(255,255,255,0.04)"
    : "rgba(255,255,255,0.72)";
  const glassBdr = dark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(255,255,255,0.9)";
  const text = dark ? "#f0f0f5" : "#1a1a2e";
  const sub  = dark ? "#888"    : "#8888aa";

  return (
    <ThemeCtx.Provider value={{ dark }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${dark?"#333":"#ddd"}; border-radius: 99px; }

        .liquid-btn {
          position: relative; overflow: hidden; cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .liquid-btn:hover { transform: translateY(-1px); }
        .liquid-btn:active { transform: scale(0.96); }
        .liquid-btn::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.25) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
          pointer-events: none;
        }
        .liquid-btn:hover::after { opacity: 1; }

        .tab-pill {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 8px 14px; border: none; cursor: pointer; border-radius: 14px;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap; position: relative; overflow: hidden;
        }
        .tab-pill.active {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .tab-pill:not(.active):hover {
          transform: translateY(-2px);
        }
        .tab-pill::after {
          content:''; position:absolute; inset:0;
          background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 70%);
          pointer-events:none;
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .loading-shimmer {
          background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div style={{ minHeight:"100vh", color:text }}>

        {/* ── header ── */}
        <header style={{
          background: glass,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: glassBdr,
          padding: "1rem 1.5rem 0",
          position: "sticky", top:0, zIndex:100,
          boxShadow: dark
            ? "0 1px 40px rgba(0,0,0,0.4)"
            : "0 1px 40px rgba(124,58,237,0.08)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
            {/* logo */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:38, height:38, borderRadius:12,
                background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, boxShadow:"0 4px 14px rgba(124,58,237,0.4)",
              }}>💰</div>
              <div>
                <div style={{ fontSize:"1rem", fontWeight:700, color:text, letterSpacing:"-0.02em" }}>Finance Tracker</div>
                <div style={{ fontSize:"0.68rem", color:sub }}>AI-powered · {new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</div>
              </div>
            </div>

            {/* action buttons */}
            <div style={{ display:"flex", gap:8 }}>
              <button className="liquid-btn" onClick={exportCSV} style={{
                padding:"7px 14px", fontSize:12, fontWeight:600, borderRadius:10,
                border:"none",
                background: dark?"rgba(255,255,255,0.08)":"rgba(124,58,237,0.08)",
                color: accent,
                boxShadow: dark?"0 2px 8px rgba(0,0,0,0.3)":"0 2px 8px rgba(124,58,237,0.15)",
              }}>⬇ Export</button>
              <button className="liquid-btn" onClick={() => setDark(d=>!d)} style={{
                padding:"7px 14px", fontSize:12, fontWeight:600, borderRadius:10,
                border:"none",
                background: dark
                  ? "linear-gradient(135deg,rgba(255,200,50,0.15),rgba(255,160,20,0.1))"
                  : "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(124,58,237,0.08))",
                color: dark?"#fbbf24":accent,
                boxShadow: dark?"0 2px 8px rgba(0,0,0,0.3)":"0 2px 8px rgba(124,58,237,0.12)",
              }}>{dark?"☀ Light":"🌙 Dark"}</button>
            </div>
          </div>

          {/* ── pill tab bar ── */}
          <div style={{
            display:"flex", gap:4, overflowX:"auto", paddingBottom:12,
            scrollbarWidth:"none", msOverflowStyle:"none",
          }}>
            {TABS.map(t => (
              <button key={t.id}
                className={`tab-pill ${tab===t.id?"active":""}`}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab===t.id
                    ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
                    : dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",
                  color: tab===t.id ? "#fff" : sub,
                  boxShadow: tab===t.id
                    ? "0 4px 20px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "none",
                }}
              >
                <span style={{ fontSize:14 }}>{t.icon}</span>
                <span style={{ fontSize:10, fontWeight:600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* ── main content ── */}
        <main style={{ maxWidth:980, margin:"0 auto", padding:"1.5rem" }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[1,2,3].map(i => (
                <div key={i} className="loading-shimmer" style={{
                  height:80, borderRadius:16,
                  background: dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.6)",
                }}/>
              ))}
            </div>
          ) : (
            <>
              {tab==="dashboard"  && <Dashboard transactions={transactions} summary={summary} budgets={budgets} onDelete={deleteTransaction} dark={dark} />}
              {tab==="add"        && <AddTransaction transactions={transactions} onAdd={addTransaction} onDelete={deleteTransaction} dark={dark} />}
              {tab==="budget"     && <Budget budgets={budgets} summary={summary} onSave={saveBudgets} dark={dark} />}
              {tab==="goals"      && <Goals dark={dark} />}
              {tab==="recurring"  && <Recurring dark={dark} />}
              {tab==="monthly"    && <MonthlyComparison dark={dark} />}
              {tab==="splits"     && <Splits dark={dark} />}
              {tab==="ai"         && <AIAnalysis transactions={transactions} summary={summary} budgets={budgets} dark={dark} />}
            </>
          )}
        </main>
      </div>
    </ThemeCtx.Provider>
  );
}