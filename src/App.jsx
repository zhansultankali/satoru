import { useState, useRef } from "react"

const COMMANDS = [
  { icon: "🚀", label: "/start", desc: "Ботты іске қос" },
  { icon: "🔄", label: "/reset", desc: "Тарихты тазала" },
  { icon: "📊", label: "/stats", desc: "Статистика" },
  { icon: "🌐", label: "/search", desc: "Интернет іздеу" },
  { icon: "🎨", label: "/imagine", desc: "Сурет жасау" },
  { icon: "📅", label: "/calendar", desc: "Google Calendar" },
  { icon: "📈", label: "/benchmark", desc: "Groq vs Ollama" },
]

const SYSTEM = "Sen AI komekshi botsyng. Qazaqsha, oryssha, agylshynsha soileshe alasyn. Paidalanushy qai tilde jazsa, sol tilde zhaup ber."

export default function App() {
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Salem! Men AI botynmyn 🤖", time: "00:00" }])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [history, setHistory] = useState([])
  const endRef = useRef(null)

  function addMsg(text, role) {
    const time = new Date().toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" })
    setMsgs(p => [...p, { id: Date.now(), role, text, time }])
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  async function doSend(text) {
    if (!text.trim() || typing) return
    addMsg(text, "user")
    setInput("")
    setTyping(true)
    const newHistory = [...history, { role: "user", content: text }]
    setHistory(newHistory)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM, messages: newHistory })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || "Qate boldy."
      addMsg(reply, "bot")
      setHistory(h => [...h, { role: "assistant", content: reply }])
    } catch {
      addMsg("Qosylu qatesi.", "bot")
    }
    setTyping(false)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07080f; color: #eeeef5; font-family: sans-serif; }
        @keyframes bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-6px) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }
      `}</style>
      <div style={{ display: "flex", height: "100vh" }}>
        <aside style={{ width: 220, background: "#0e0f1a", borderRight: "1px solid #252638", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 16, borderBottom: "1px solid #252638" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>🤖 AI BOT</div>
            <div style={{ fontSize: 12, color: "#00d4aa", marginTop: 4 }}>● Claude AI</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {COMMANDS.map((c, i) => (
              <div key={i} onClick={() => c.label === "/reset" ? (setMsgs([{ role: "bot", text: "Tarih tazalandi!", time: "00:00" }]), setHistory([])) : doSend(c.label)}
                style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, color: "#7b7c99", fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = "#151623"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {c.icon} {c.label} <span style={{ fontSize: 11, color: "#4a4b66" }}>— {c.desc}</span>
              </div>
            ))}
          </div>
        </aside>
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 24px", background: "#0e0f1a", borderBottom: "1px solid #252638" }}>
            <span style={{ fontWeight: 700 }}>Чат — Claude AI</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {msgs.map(m => (
              <div key={m.id} style={{ display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: m.role === "bot" ? "linear-gradient(135deg,#6c63ff,#00d4aa)" : "#1c1d2e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {m.role === "bot" ? "🤖" : "👤"}
                </div>
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", background: m.role === "bot" ? "#151623" : "rgba(108,99,255,0.2)", border: "1px solid " + (m.role === "bot" ? "#252638" : "rgba(108,99,255,0.3)") }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: 11, color: "#4a4b66", marginTop: 3 }}>{m.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6c63ff,#00d4aa)", display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</div>
                <div style={{ padding: "10px 14px", borderRadius: 12, background: "#151623", border: "1px solid #252638", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6c63ff", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ padding: "12px 20px", background: "#0e0f1a", borderTop: "1px solid #252638" }}>
            <div style={{ display: "flex", gap: 8, background: "#151623", border: "1px solid #252638", borderRadius: 12, padding: "8px 10px" }}>
              <input value={input} placeholder="Хабар жаз..." onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") doSend(input) }}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#eeeef5", fontSize: 14 }} />
              <button onClick={() => doSend(input)} disabled={typing}
                style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#6c63ff,#857cf8)", border: "none", cursor: "pointer", color: "#fff", fontSize: 18 }}>
                ➤
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}