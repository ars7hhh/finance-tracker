import React, { useState } from "react";
import { CATS, fmt, t, Panel, PanelTitle, Inp, Sel, BtnPrimary, BtnOutline, TxnRow } from "./theme.jsx";

export default function AddTransaction({ transactions, onAdd, onDelete, dark }) {
  const c = t(dark);
  const [desc,   setDesc]   = useState("");
  const [amount, setAmount] = useState("");
  const [type,   setType]   = useState("expense");
  const [cat,    setCat]    = useState("");
  const [date,   setDate]   = useState(new Date().toISOString().split("T")[0]);
  const [recur,  setRecur]  = useState("");
  const [note,   setNote]   = useState("");
  const [busy,   setBusy]   = useState(false);

  const [sms,     setSms]     = useState("");
  const [smsNote, setSmsNote] = useState("");
  const [smsBusy, setSmsBusy] = useState(false);

  async function autoCat() {
    if (!desc.trim()) { setNote("Enter a description first."); return; }
    setBusy(true); setNote("Classifying...");
    const res  = await fetch("/api/ai/categorize", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({desc}) });
    const data = await res.json();
    if (CATS.includes(data.cat)) { setCat(data.cat); setNote(`Classified as: ${data.cat}`); }
    else setNote(`Suggested: ${data.cat}`);
    setBusy(false);
  }

  async function handleAdd() {
    if (!desc.trim()||!amount||parseFloat(amount)<=0||!date) { setNote("Fill in description, amount and date."); return; }
    setBusy(true);
    await onAdd({ desc, amount:parseFloat(amount), type, cat:cat||"Other", date, recurring:recur });
    setDesc(""); setAmount(""); setCat(""); setRecur(""); setNote("✅ Transaction added!");
    setBusy(false);
  }

  async function parseSMS() {
    if (!sms.trim()) { setSmsNote("Paste a bank SMS first."); return; }
    setSmsBusy(true); setSmsNote("Parsing...");
    const res  = await fetch("/api/ai/sms-parse", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({sms}) });
    const data = await res.json();
    if (data.amount) {
      setDesc(data.desc||""); setAmount(String(data.amount));
      setType(data.type||"expense"); setCat(data.cat||"Other"); setDate(data.date||date);
      setSmsNote("✅ Filled from SMS — review and add.");
    } else {
      setSmsNote("Couldn't parse. Fill manually.");
    }
    setSmsBusy(false);
  }

  return (
    <div>
      {/* SMS parser */}
      <Panel dark={dark}>
        <PanelTitle dark={dark}>📱 Import from UPI / bank SMS</PanelTitle>
        <p style={{ fontSize:13, color:c.sub, marginBottom:10 }}>Copy a bank debit SMS (e.g. from HDFC, SBI, ICICI) and paste below — AI will auto-fill the form.</p>
        <textarea
          style={{ width:"100%", padding:"8px 10px", fontSize:12, border:`1px solid ${c.inpBdr}`, borderRadius:8, background:c.inp, color:c.text, fontFamily:"monospace", resize:"vertical", minHeight:60, outline:"none" }}
          placeholder={"e.g. INR 450.00 debited from A/c XX1234 on 23-04-26 to VPA zomato@okicici UPI Ref 4521367890"}
          value={sms} onChange={e=>setSms(e.target.value)}
        />
        <div style={{ display:"flex", gap:8, marginTop:8, alignItems:"center" }}>
          <BtnPrimary dark={dark} onClick={parseSMS} disabled={smsBusy}>{smsBusy?"Parsing...":"Parse SMS ↗"}</BtnPrimary>
          {smsNote && <span style={{ fontSize:12, color:c.sub }}>{smsNote}</span>}
        </div>
      </Panel>

      {/* manual form */}
      <Panel dark={dark}>
        <PanelTitle dark={dark}>New transaction</PanelTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
          <Inp dark={dark} placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <Inp dark={dark} type="number" placeholder="Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} min="0" />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:10 }}>
          <Sel dark={dark} value={type} onChange={e=>setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Sel>
          <Sel dark={dark} value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">Category</option>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </Sel>
          <Inp dark={dark} type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <Sel dark={dark} value={recur} onChange={e=>setRecur(e.target.value)}>
            <option value="">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </Sel>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <BtnOutline dark={dark} onClick={autoCat} disabled={busy}>Auto-classify ↗</BtnOutline>
          <BtnPrimary dark={dark} onClick={handleAdd} disabled={busy}>{busy?"Adding...":"Add transaction"}</BtnPrimary>
        </div>
        {note && <div style={{ marginTop:8, fontSize:12, color:c.sub }}>{note}</div>}
      </Panel>

      {/* all transactions */}
      <Panel dark={dark}>
        <PanelTitle dark={dark}>All transactions ({transactions.length})</PanelTitle>
        {[...transactions].reverse().map(tx=><TxnRow key={tx.id} t={tx} onDelete={onDelete} dark={dark} />)}
      </Panel>
    </div>
  );
}
