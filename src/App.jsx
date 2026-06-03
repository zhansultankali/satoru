import { useState, useEffect, useRef, useCallback } from "react"

const COMMANDS = [
  { icon: "🚀", label: "/start", desc: "Ботты іске қос" },
  { icon: "🔄", label: "/reset", desc: "Тарихты тазала" },
  { icon: "📊", label: "/stats", desc: "Статистика" },
  { icon: "🔒", label: "/private", desc: "Ollama режимі" },
  { icon: "🌐", label: "/search", desc: "Интернет іздеу" },
  { icon: "🎨", label: "/imagine", desc: "Сурет жасау" },
  { icon: "📁", label: "/files", desc: "Файлдар" },
  { icon: "📅", label: "/calendar", desc: "Google Calendar" },
  { icon: "📈", label: "/benchmark", desc: "Groq vs Ollama" },
  { icon: "🎭", label: "/role student", desc: "Рөл ауыстыру" },
]

export default function App() {
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [showCfg, setShowCfg] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem("bot_token") || "")
  const [chatId, setChatId] = useState(() => localStorage.getItem("chat_id") || "")
  const [hovCmd, setHovCmd] = useState(null)
  const endRef = useRef(null)
  const taRef = useRef(null)
  const pollRef = useRef(null)
  const lastIdRef = useRef(0)

  useEffect(() => {
    if (!token || !chatId) setShowCfg(true)
    else startPoll(token, chatId)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs, typing])

  function addMsg(text, role) {
    setMsgs(p => [...p, { id: Date.now() + Math.random(), role, text, time: new Date().toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" }) }])
  }

  async function startPoll(tok, cid) {
    if (pollRef.current) clearInterval(pollRef.current)
    try {
      const r = await fetch(`https://api.telegram.org/bot${tok}/getUpdates?limit=1&offset=-1`)
      const d = await r.json()
      if (d.ok && d.result.length > 0) lastIdRef.current = d.result[d.result.length - 1].update_id + 1
    } catch {}
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`https://api.telegram.org/bot${tok}/getUpdates?offset=${lastIdRef.current}&timeout=1`)
        const d = await r.json()
        if (!d.ok) return
        for (const u of d.result) {
          lastIdRef.current = u.update_id + 1
          const m = u.message
          if (!m || String(m.chat.id) !== String(cid)) continue
          setTyping(false)
          addMsg(m.text || "[медиа]", "bot")
        }
      } catch {}
    }, 5000)
  }

  async function doSend(text) {
    if (!text.trim() || !token || !chatId) return
    addMsg(text, "user")
    setInput("")
    if (taRef.current) taRef.current.style.height = "auto"
    setTyping(true)
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text })
      })
    } catch { setTyping(false); addMsg("❌ Қате", "bot") }
  }

  function saveCfg(tok, cid) {
    localStorage.setItem("bot_token", tok); localStorage.setItem("chat_id", cid)
    setToken(tok); setChatId(cid); setShowCfg(false); startPoll(tok, cid)
  }

  const isReady = token && chatId

  return (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .msg{animation:fadeUp .2s ease}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#07080f;color:#eeeef5;font-family:Outfit,sans-serif}
        input,textarea{font-family:Outfit,sans-serif}
        textarea::placeholder,input::placeholder{color:#4a4b66}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#252638;border-radius:4px}
      `}</style>

      {showCfg && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#0e0f1a",border:"1px solid #252638",borderRadius:20,padding:32,width:420,maxWidth:"90vw"}}>
            <div style={{fontSize:20,fontWeight:700,marginBottom:8,color:"#6c63ff"}}>⚙️ Баптау</div>
            <div style={{fontSize:13,color:"#7b7c99",marginBottom:20,lineHeight:1.65}}>Bot Token — @BotFather-дан.<br/>Chat ID — @userinfobot-қа /start жіберіп аласың.</div>
            {[{label:"BOT TOKEN",val:token,set:setToken,ph:"123456:AAF..."},{label:"CHAT ID",val:chatId,set:setChatId,ph:"123456789"}].map(f=>(
              <div key={f.label}>
                <div style={{fontSize:12,fontWeight:600,color:"#7b7c99",marginBottom:6}}>{f.label}</div>
                <input style={{width:"100%",padding:"11px 14px",background:"#151623",border:"1px solid #252638",borderRadius:10,color:"#eeeef5",fontSize:14,outline:"none",marginBottom:14}}
                  placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveCfg(token,chatId)}/>
              </div>
            ))}
            <button onClick={()=>saveCfg(token,chatId)} style={{width:"100%",padding:13,background:"linear-gradient(135deg,#6c63ff,#857cf8)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer"}}>
              Сақтап бастау →
            </button>
          </div>
        </div>
      )}

      <div style={{display:"flex",height:"100vh",width:"100vw",overflow:"hidden"}}>
        <aside style={{width:250,background:"#0e0f1a",borderRight:"1px solid #252638",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"20px 16px",borderBottom:"1px solid #252638"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6c63ff,#00d4aa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
              <span style={{fontWeight:800,fontSize:18,background:"linear-gradient(135deg,#fff,#9b95ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>AI BOT</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#00d4aa"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#00d4aa",animation:"pulse 2s infinite"}}/>
              {isReady ? "Онлайн" : "Баптау керек"}
            </div>
          </div>
          <div style={{padding:"12px 8px 4px",fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:"#4a4b66",textTransform:"uppercase"}}>Командалар</div>
          <div style={{flex:1,overflowY:"auto",padding:"0 6px"}}>
            {COMMANDS.map((c,i)=>(
              <div key={i} onClick={()=>doSend(c.label.split(" ")[0])}
                onMouseEnter={()=>setHovCmd(i)} onMouseLeave={()=>setHovCmd(null)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,cursor:"pointer",marginBottom:2,background:hovCmd===i?"#151623":"transparent",border:`1px solid ${hovCmd===i?"#252638":"transparent"}`,transition:"all .15s"}}>
                <span style={{fontSize:15,width:20,textAlign:"center"}}>{c.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:hovCmd===i?"#eeeef5":"#7b7c99"}}>{c.label}</div>
                  <div style={{fontSize:11,color:"#4a4b66"}}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"8px 6px",borderTop:"1px solid #252638"}}>
            <button onClick={()=>setShowCfg(true)} style={{width:"100%",padding:"9px 10px",background:"#151623",border:"1px solid #252638",borderRadius:8,color:"#7b7c99",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:8}}>
              ⚙️ {isReady ? "✅ Қосылған" : "❌ Баптау"}
            </button>
          </div>
        </aside>

        <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"14px 24px",background:"rgba(14,15,26,0.95)",borderBottom:"1px solid #252638",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,fontSize:15}}>Чат</span>
            <span style={{padding:"3px 10px",borderRadius:20,background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",fontSize:11,color:"#9b95ff",fontWeight:600}}>Telegram Bot API</span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:24,display:"flex",flexDirection:"column",gap:16}}>
            {msgs.length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                <div style={{width:70,height:70,borderRadius:18,background:"linear-gradient(135deg,#6c63ff,#00d4aa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,boxShadow:"0 0 40px rgba(108,99,255,0.35)"}}>🤖</div>
                <div style={{fontWeight:800,fontSize:24}}>Сәлем!</div>
                <div style={{color:"#7b7c99",fontSize:14,lineHeight:1.65,maxWidth:360}}>AI ботыңмен браузерден сөйлес.<br/>Сол жақтан команда таңда немесе хабар жаз.</div>
              </div>
            )}
            {msgs.map(m=>(
              <div key={m.id} className="msg" style={{display:"flex",gap:10,flexDirection:m.role==="user"?"row-reverse":"row"}}>
                <div style={{width:32,height:32,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,
                  ...(m.role==="bot"?{background:"linear-gradient(135deg,#6c63ff,#00d4aa)"}:{background:"#1c1d2e",border:"1px solid #252638"})}}>
                  {m.role==="bot"?"🤖":"👤"}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3,maxWidth:"70%",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{padding:"10px 14px",borderRadius:12,fontSize:14,lineHeight:1.6,wordBreak:"break-word",
                    ...(m.role==="bot"?{background:"#151623",border:"1px solid #252638",borderTopLeftRadius:3}:{background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.3)",borderTopRightRadius:3})}}
                    {...(m.role==="bot"?{background:"#151623",border:"1px solid #252638",borderTopLeftRadius:3}:{background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.3)",borderTopRightRadius:3})}
                    dangerouslySetInnerHTML={{__html: m.text.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split("\n").join("<br/>") }}/>
                </div>
              </div>
            ))}
            {typing&&(
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#6c63ff,#00d4aa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🤖</div>
                <div style={{padding:"10px 14px",borderRadius:12,borderTopLeftRadius:3,background:"#151623",border:"1px solid #252638",display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#6c63ff",animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>
          <div style={{padding:"12px 20px",background:"rgba(14,15,26,0.95)",borderTop:"1px solid #252638"}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,background:"#151623",border:"1px solid #252638",borderRadius:12,padding:"8px 10px"}}>
              <textarea ref={taRef} style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#eeeef5",fontSize:14,resize:"none",lineHeight:1.5,maxHeight:120}}
                placeholder={isReady?"Хабар жаз...":"Алдымен баптауды орнат →"}
                value={input} rows={1}
                onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"}}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();doSend(input)}}}/>
              <button onClick={()=>doSend(input)} style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#6c63ff,#857cf8)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
