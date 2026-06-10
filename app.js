const SUPA_URL = "https://angdxojhkdgutolggujg.supabase.co";
const SUPA_KEY = "sb_publishable_5lgEl7IDOk6IKOVVaa9pQw_oYYls5gU";
const supabase = window.supabase.createClient(SUPA_URL, SUPA_KEY);

const { useState, useEffect } = React;

const CLASSES = [
  { id:"A",  label:"Klasa A",  sub:"Suret",           color:"#B8860B", light:"#FFFBF0", border:"#D4A017" },
  { id:"B",  label:"Klasa B",  sub:"Shkronjat Arabe", color:"#8B1A1A", light:"#FFF5F5", border:"#C0392B" },
  { id:"C1", label:"Klasa C1", sub:"Kuran · Grupi 1", color:"#1A5C2A", light:"#F5FFF8", border:"#27AE60" },
  { id:"C2", label:"Klasa C2", sub:"Kuran · Grupi 2", color:"#1A3A5C", light:"#F5F8FF", border:"#2980B9" },
];
const SUREN = [
  "En Nas – Kul eudhu birabbinas","Felek – Kul eudhu birabbil felek",
  "Ihlas – Kul huwallahu ehad","Leheb – Tebbet jedaa","En Nasr – Idha xhaae",
  "Kafirun – Kul jaa ejjuhelkafirun","Keuther – Inna eatajna","El Maun – Eraejteledhi",
  "Kurejsh – Li iila fikurajsh","El Fiil – Elem tera kejfe","Ettehijjatu",
  "Allahumme sal-li ala","Allahumme barik ala","Allahumm rabbena","Rabbenegfirlii",
  "Allahumme inna nesteinuke","Allahumme ijjaka neabudu",
];
const PART = [{e:"⭐",l:"Shkëlqyer"},{e:"😊",l:"Mirë"},{e:"😐",l:"Mesatar"},{e:"😴",l:"Pak"}];
const GOLD="#C9A84C", RED="#8B1A1A", DARK="#1A0A00";

// Passwort-Reset Token aus URL abfangen
const urlParams = new URLSearchParams(window.location.hash.replace("#","?"));
const accessToken = urlParams.get("access_token");
const refreshToken = urlParams.get("refresh_token");
const type = urlParams.get("type");
if (accessToken && type === "recovery") {
  supabase.auth.setSession({access_token: accessToken, refresh_token: refreshToken});
}

// ── SUPABASE ──────────────────────────────────────────────────────────────────
async function getAll(table, order) {
  const { data, error } = await supabase.from(table).select("*").order(order);
  if (error) throw error;
  return data;
}
async function upsertRow(table, row) {
  const { error } = await supabase.from(table).upsert(row);
  if (error) throw error;
}
async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
async function getFortschritt() {
  const { data } = await supabase.from("fortschritt").select("*").eq("id","main");
  return data?.[0]?.data || {};
}
async function setFortschritt(data) {
  await supabase.from("fortschritt").upsert({ id:"main", data });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function initials(n=""){ return (n||"").split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2)||"?"; }
function todaySunday(){ const d=new Date(),dow=d.getDay(); d.setDate(d.getDate()-(dow===0?0:dow)); return d.toISOString().slice(0,10); }
function getSundays(){ const res=[],base=new Date(todaySunday()); for(let i=-52;i<=8;i++){const d=new Date(base);d.setDate(base.getDate()+i*7);res.push(d.toISOString().slice(0,10));} return res.sort((a,b)=>b.localeCompare(a)); }
function fmtDate(s){ if(!s)return""; const d=new Date(s+"T12:00:00"); return d.toLocaleDateString("de-CH",{day:"2-digit",month:"short",year:"numeric"}); }

function calcAge(geb) {
  if (!geb) return null;
  // supports DD.MM.YYYY and YYYY-MM-DD
  let d;
  if (geb.includes(".")) {
    const [day,mon,yr] = geb.split(".");
    d = new Date(`${yr}-${mon}-${day}`);
  } else {
    d = new Date(geb);
  }
  if (isNaN(d)) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

// ── UI ────────────────────────────────────────────────────────────────────────
function Btn({children,onClick,primary,danger,style={}}){
  return React.createElement("button",{onClick,style:{padding:"9px 18px",borderRadius:10,border:`1.5px solid ${primary?GOLD:danger?"#E74C3C":"#E8D080"}`,background:primary?`linear-gradient(135deg,${GOLD},#E8C55A)`:danger?"#FFF0F0":"white",color:primary?DARK:danger?RED:DARK,fontSize:13,fontWeight:primary?700:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",...style}},children);
}
function TInput({value,onChange,placeholder,style={}}){
  return React.createElement("input",{value,onChange:e=>onChange(e.target.value),placeholder,style:{padding:"9px 12px",border:"1.5px solid #E8D080",borderRadius:10,fontSize:14,background:"#FFFDF5",color:DARK,fontFamily:"inherit",outline:"none",boxSizing:"border-box",width:"100%",...style}});
}
function Sel({value,onChange,children,style={}}){
  return React.createElement("select",{value,onChange:e=>onChange(e.target.value),style:{padding:"9px 12px",border:"1.5px solid #E8D080",borderRadius:10,fontSize:14,background:"#FFFDF5",color:DARK,fontFamily:"inherit",outline:"none",cursor:"pointer",boxSizing:"border-box",width:"100%",...style}},children);
}
function Modal({onClose,title,children}){
  return React.createElement("div",{onClick:onClose,style:{position:"fixed",inset:0,background:"rgba(26,10,0,0.45)",display:"flex",alignItems:"flex-end",zIndex:200,backdropFilter:"blur(4px)"}},
    React.createElement("div",{onClick:e=>e.stopPropagation(),style:{width:"100%",background:"white",borderRadius:"20px 20px 0 0",borderTop:`3px solid ${GOLD}`,padding:"1.5rem",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}},
        React.createElement("div",{style:{fontSize:17,fontWeight:700,color:DARK}},title),
        React.createElement("button",{onClick:onClose,style:{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#BBB",padding:0}},"✕")
      ),children
    )
  );
}
function ConfirmModal({msg,onYes,onNo}){
  return React.createElement("div",{style:{position:"fixed",inset:0,background:"rgba(26,10,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(4px)"}},
    React.createElement("div",{style:{background:"white",borderRadius:20,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center",border:`1.5px solid ${GOLD}44`}},
      React.createElement("div",{style:{fontSize:38,marginBottom:10}},"🗑️"),
      React.createElement("div",{style:{fontSize:15,fontWeight:700,color:DARK,marginBottom:6}},"Löschen bestätigen"),
      React.createElement("div",{style:{fontSize:13,color:"#666",marginBottom:20}},msg),
      React.createElement("div",{style:{display:"flex",gap:10}},
        React.createElement(Btn,{onClick:onNo,style:{flex:1}},"Abbrechen"),
        React.createElement(Btn,{onClick:onYes,style:{flex:1,background:"#C0392B",color:"white",border:"none",fontWeight:700}},"Ja, löschen")
      )
    )
  );
}
function Donut({present,absent,total,size=110}){
  if(!total) return React.createElement("div",{style:{width:size,height:size,borderRadius:"50%",background:"#F5F0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#AAA"}},"—");
  const r=42,cx=55,cy=55,circ=2*Math.PI*r;
  const pArc=circ*(present/total),aArc=circ*(absent/total),gap=circ*0.015;
  return React.createElement("svg",{width:size,height:size,viewBox:"0 0 110 110"},
    React.createElement("circle",{cx,cy,r,fill:"none",stroke:"#F5EDDC",strokeWidth:14}),
    absent>0&&React.createElement("circle",{cx,cy,r,fill:"none",stroke:"#E8C0C0",strokeWidth:14,strokeDasharray:`${aArc-gap} ${circ-aArc+gap}`,strokeDashoffset:-(circ*(present/total))+gap/2,transform:`rotate(-90 ${cx} ${cy})`,strokeLinecap:"round"}),
    present>0&&React.createElement("circle",{cx,cy,r,fill:"none",stroke:GOLD,strokeWidth:14,strokeDasharray:`${pArc-gap} ${circ-pArc+gap}`,strokeDashoffset:0,transform:`rotate(-90 ${cx} ${cy})`,strokeLinecap:"round"}),
    React.createElement("text",{x:cx,y:cy-6,textAnchor:"middle",fontSize:"15",fontWeight:"700",fill:DARK},present),
    React.createElement("text",{x:cx,y:cy+10,textAnchor:"middle",fontSize:"9",fill:"#888"},`von ${total}`)
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  async function handleLogin(){
    if(!email.trim()||!password.trim())return;
    setLoading(true);setError(null);
    const {error:err}=await supabase.auth.signInWithPassword({email,password});
    if(err){setError("E-Mail oder Passwort falsch.");setLoading(false);}
    else onLogin();
  }

  return React.createElement("div",{style:{minHeight:"100vh",background:`linear-gradient(135deg,${DARK} 0%,#3A1A00 100%)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",padding:"1rem"}},
    React.createElement("div",{style:{background:"white",borderRadius:24,padding:"2.5rem 2rem",maxWidth:380,width:"100%",boxShadow:`0 20px 60px rgba(0,0,0,0.4)`,border:`1.5px solid ${GOLD}33`}},
      React.createElement("div",{style:{textAlign:"center",marginBottom:"2rem"}},
        React.createElement("div",{style:{width:72,height:72,borderRadius:18,background:`linear-gradient(135deg,${GOLD},#E8C55A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 1rem",boxShadow:`0 8px 24px ${GOLD}44`}},"🕌"),
        React.createElement("div",{style:{fontSize:20,fontWeight:800,color:DARK}},"Islamische Gemeinschaft Wil"),
        React.createElement("div",{style:{fontSize:12,color:GOLD,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",marginTop:4}},"Maktab · Unterrichtsverwaltung")
      ),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:12,marginBottom:16}},
        React.createElement("div",null,
          React.createElement("label",{style:{fontSize:12,color:"#888",display:"block",marginBottom:4,fontWeight:500}},"E-Mail"),
          React.createElement("input",{value:email,onChange:e=>setEmail(e.target.value),placeholder:"name@example.com",type:"email",
            onKeyDown:e=>{if(e.key==="Enter")handleLogin();},
            style:{width:"100%",padding:"11px 14px",border:`1.5px solid ${error?"#E74C3C":"#E8D080"}`,borderRadius:10,fontSize:14,background:"#FFFDF5",color:DARK,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}})
        ),
        React.createElement("div",null,
          React.createElement("label",{style:{fontSize:12,color:"#888",display:"block",marginBottom:4,fontWeight:500}},"Passwort"),
          React.createElement("input",{value:password,onChange:e=>setPassword(e.target.value),placeholder:"••••••••",type:"password",
            onKeyDown:e=>{if(e.key==="Enter")handleLogin();},
            style:{width:"100%",padding:"11px 14px",border:`1.5px solid ${error?"#E74C3C":"#E8D080"}`,borderRadius:10,fontSize:14,background:"#FFFDF5",color:DARK,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}})
        )
      ),
      error&&React.createElement("div",{style:{fontSize:13,color:RED,background:"#FFF0F0",border:"1px solid #E74C3C33",borderRadius:8,padding:"8px 12px",marginBottom:12}},"⚠️ "+error),
      React.createElement("button",{onClick:handleLogin,disabled:loading,style:{width:"100%",padding:"13px",background:loading?`${GOLD}88`:`linear-gradient(135deg,${GOLD},#E8C55A)`,border:"none",borderRadius:12,cursor:loading?"not-allowed":"pointer",fontSize:15,fontWeight:700,color:DARK,boxShadow:`0 4px 16px ${GOLD}44`,transition:"all 0.2s"}},
        loading?"Anmelden...":"Anmelden"
      )
    )
  );
}

// ── RESET PASSWORD ─────────────────────────────────────────────────────────────────────
function ResetPasswordScreen(){
  const [password,setPassword]=useState("");
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);

  async function handleReset(){
    setLoading(true);
    const {error}=await supabase.auth.updateUser({password});
    if(!error){setDone(true);window.location.hash="";}
    setLoading(false);
  }

  if(done) return React.createElement("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:DARK,fontFamily:"system-ui"}},
    React.createElement("div",{style:{background:"white",borderRadius:20,padding:"2rem",textAlign:"center",maxWidth:340,width:"90%"}},
      React.createElement("div",{style:{fontSize:40,marginBottom:12}},"✅"),
      React.createElement("div",{style:{fontSize:16,fontWeight:700,marginBottom:8}},"Passwort geändert!"),
      React.createElement("div",{style:{fontSize:13,color:"#888",marginBottom:16}},"Du kannst dich jetzt einloggen."),
      React.createElement("button",{onClick:()=>window.location.reload(),style:{padding:"10px 24px",background:`linear-gradient(135deg,${GOLD},#E8C55A)`,border:"none",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:700,color:DARK}},"Zum Login")
    )
  );

  return React.createElement("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:DARK,fontFamily:"system-ui",padding:"1rem"}},
    React.createElement("div",{style:{background:"white",borderRadius:20,padding:"2rem",maxWidth:360,width:"100%",border:`1.5px solid ${GOLD}33`}},
      React.createElement("div",{style:{textAlign:"center",marginBottom:"1.5rem"}},
        React.createElement("div",{style:{fontSize:32,marginBottom:8}},"🔑"),
        React.createElement("div",{style:{fontSize:18,fontWeight:700,color:DARK}},"Neues Passwort setzen")
      ),
      React.createElement("input",{value:password,onChange:e=>setPassword(e.target.value),type:"password",placeholder:"Neues Passwort...",
        onKeyDown:e=>{if(e.key==="Enter")handleReset();},
        style:{width:"100%",padding:"11px 14px",border:`1.5px solid ${GOLD}`,borderRadius:10,fontSize:14,background:"#FFFDF5",color:DARK,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:12}}),
      React.createElement("button",{onClick:handleReset,disabled:loading,style:{width:"100%",padding:"12px",background:`linear-gradient(135deg,${GOLD},#E8C55A)`,border:"none",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:700,color:DARK}},
        loading?"Speichern...":"Passwort speichern")
    )
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
function App(){
  const [page,setPage]=useState("overview");
  const [students,setStudents]=useState([]);
  const [lektionen,setLektionen]=useState([]);
  const [lehrer,setLehrer]=useState([]);
  const [progress,setProgress]=useState({});
  const [loading,setLoading]=useState(true);
  const [syncing,setSyncing]=useState(false);
  const [error,setError]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  if(type==="recovery") return React.createElement(ResetPasswordScreen,null);

  // Check existing session on load
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      setAuthChecked(true);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user)return;
    (async()=>{
      try {
        const [s,t,l,p] = await Promise.all([
          getAll("schueler","nachname"),
          getAll("lektionen","date"),
          getAll("lehrer","name"),
          getFortschritt(),
        ]);
        setStudents(s); setLektionen(t.reverse()); setLehrer(l); setProgress(p);
      } catch(e){ setError("Verbindungsfehler: "+e.message); }
      setLoading(false);
    })();
  },[user]);

  // Show nothing while checking auth
  if(!authChecked) return React.createElement("div",{style:{minHeight:"100vh",background:DARK}});
  // Show login if not authenticated
  if(!user) return React.createElement(LoginScreen,{onLogin:()=>{}});

  const wrap = fn => async (...args) => { setSyncing(true); try { await fn(...args); } catch(e){ alert("Fehler: "+e.message); } setSyncing(false); };
  const saveStudent  = wrap(async s => { await upsertRow("schueler",s); setStudents(await getAll("schueler","nachname")); });
  const delStudent   = wrap(async id => { await deleteRow("schueler",id); setStudents(s=>s.filter(x=>x.id!==id)); });
  const saveLektion  = wrap(async l => { await upsertRow("lektionen",l); const all=await getAll("lektionen","date"); setLektionen(all.reverse()); });
  const delLektion   = wrap(async id => { await deleteRow("lektionen",id); setLektionen(l=>l.filter(x=>x.id!==id)); });
  const saveLehrerFn = wrap(async l => { await upsertRow("lehrer",l); setLehrer(await getAll("lehrer","name")); });
  const delLehrer    = wrap(async id => { await deleteRow("lehrer",id); setLehrer(l=>l.filter(x=>x.id!==id)); });
  const saveProgress = wrap(async p => { setProgress(p); await setFortschritt(p); });
  const saveClassProgress  = p => saveProgress({...progress,[p.cid]:{page:p.val,updatedAt:new Date().toISOString().slice(0,10)}});
  const saveStudentProgress= (sid,text) => saveProgress({...progress,students:{...(progress.students||{}),[sid]:{text,updatedAt:new Date().toISOString().slice(0,10)}}});

  const askConfirm=(msg,onYes)=>setConfirm({msg,onYes});
  const clsById=id=>CLASSES.find(c=>c.id===id)||CLASSES[0];
  const byCls=id=>students.filter(s=>s.klasse===id);

  function getLastAtt(sid,cid){
    const sorted=lektionen.filter(l=>l.class_id===cid&&l.att?.[sid]!==undefined).sort((a,b)=>b.date.localeCompare(a.date));
    return sorted[0]?.att?.[sid]||null;
  }
  function getStats(sid){
    const my=lektionen.filter(l=>l.att?.[sid]!==undefined);
    const present=my.filter(l=>l.att[sid]?.present===true).length;
    const absent=my.filter(l=>l.att[sid]?.present===false).length;
    const parts=my.filter(l=>l.att[sid]?.part).map(l=>PART.findIndex(x=>x.e===l.att[sid].part));
    const avg=parts.length?parts.reduce((a,b)=>a+b,0)/parts.length:null;
    const missed=my.filter(l=>l.att[sid]?.present===false).map(l=>l.topic).filter(Boolean);
    const sorted=[...my].sort((a,b)=>b.date.localeCompare(a.date));
    let consec=0; for(const l of sorted){if(l.att[sid]?.present===false)consec++;else break;}
    return{total:my.length,present,absent,avg,missed,consec};
  }

  const NAV=[
    {id:"overview",label:"Übersicht"},
    {id:"students",label:"Schüler"},
    {id:"lektionen",label:"Lektionen"},
    {id:"lehrer",label:"Lehrpersonen"},
    {id:"statistik",label:"Statistik"},    
  ];

  if(loading) return React.createElement("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}},
    React.createElement("div",{style:{textAlign:"center"}},
      React.createElement("div",{style:{width:64,height:64,borderRadius:16,background:`linear-gradient(135deg,${GOLD},#E8C55A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 16px"}},"🕌"),
      React.createElement("div",{style:{color:GOLD,fontSize:16,fontWeight:600}},"Verbinde mit Supabase...")
    )
  );
  if(error) return React.createElement("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",padding:"2rem"}},
    React.createElement("div",{style:{textAlign:"center",maxWidth:400}},
      React.createElement("div",{style:{fontSize:40,marginBottom:12}},"⚠️"),
      React.createElement("div",{style:{fontSize:16,fontWeight:700,color:RED,marginBottom:8}},"Verbindungsfehler"),
      React.createElement("div",{style:{fontSize:13,color:"#666",marginBottom:16}},error),
      React.createElement(Btn,{primary:true,onClick:()=>window.location.reload()},"Neu laden")
    )
  );

  return React.createElement("div",{style:{minHeight:"100vh",background:"#FAFAF8",fontFamily:"system-ui,sans-serif",color:DARK}},
    React.createElement("div",{style:{background:"white",borderBottom:`2px solid ${GOLD}33`,boxShadow:`0 2px 16px rgba(201,168,76,0.12)`,position:"sticky",top:0,zIndex:100}},
React.createElement("div",{style:{maxWidth:1100,margin:"0 auto",padding:"0 1.25rem"}},
  // Zeile 1: Logo
  React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"10px 0 0"}},
    React.createElement("div",{style:{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${GOLD},#E8C55A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},"🕌"),
    React.createElement("div",null,
      React.createElement("div",{style:{fontWeight:700,fontSize:14,color:DARK}},"Islamische Gemeinschaft Wil"),
      React.createElement("div",{style:{fontSize:10,color:GOLD,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase"}},"Maktab · Unterrichtsverwaltung")
    )
  ),
  // Zeile 2: Navigation + Abmelden
  React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4}},
    syncing&&React.createElement("div",{style:{fontSize:11,color:GOLD,padding:"3px 8px",background:`${GOLD}14`,borderRadius:20,flexShrink:0}},"⟳"),
    React.createElement("nav",{style:{display:"flex",gap:2,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none",flex:1}},
      NAV.map(n=>React.createElement("button",{key:n.id,onClick:()=>setPage(n.id),style:{padding:"8px 14px",border:"none",background:page===n.id?`${GOLD}18`:"transparent",color:page===n.id?GOLD:"#888",fontSize:13,fontWeight:page===n.id?700:400,borderRadius:8,cursor:"pointer",fontFamily:"inherit",borderBottom:page===n.id?`2px solid ${GOLD}`:"2px solid transparent",whiteSpace:"nowrap"}},n.label))
    ),
    React.createElement("button",{onClick:()=>supabase.auth.signOut(),title:"Abmelden",style:{flexShrink:0,padding:"6px 10px",borderRadius:20,border:`1px solid ${GOLD}44`,background:"white",color:"#AAA",fontSize:11,cursor:"pointer",fontFamily:"inherit"}},"↩")
  )
)
    ),
    React.createElement("div",{style:{maxWidth:1100,margin:"0 auto",padding:"1.5rem 1.25rem"}},
      page==="overview"  && React.createElement(Overview,  {students,lektionen,lehrer,byCls,clsById,getStats,setPage,progress,saveClassProgress}),
      page==="statistik" && React.createElement(Statistik, {students,lektionen,byCls}),
      page==="students"  && React.createElement(Students,  {students,lektionen,byCls,clsById,getStats,getLastAtt,saveStudent,delStudent,askConfirm,progress,saveStudentProgress}),
      page==="lektionen" && React.createElement(Lektionen, {students,lektionen,lehrer,byCls,clsById,getLastAtt,saveLektion,delLektion,askConfirm}),
      page==="lehrer"    && React.createElement(LehrerPage,{lehrer,saveLehrerFn,delLehrer,askConfirm})
    ),
    confirm&&React.createElement(ConfirmModal,{msg:confirm.msg,onYes:()=>{confirm.onYes();setConfirm(null);},onNo:()=>setConfirm(null)})
  );
}

// ── STATISTIK ─────────────────────────────────────────────────────────────────
function Statistik({students,lektionen,byCls}){
  const cntA=byCls("A").length, cntB=byCls("B").length, cntC1=byCls("C1").length, cntC2=byCls("C2").length;
  const cntC=cntC1+cntC2, total=students.length;

  // Age groups
  const ageGroups={"5-7":0,"8-10":0,"11-13":0,"14-16":0,"17+":0,"?":0};
  students.forEach(s=>{
    const a=calcAge(s.geburtsdatum);
    if(a===null){ageGroups["?"]++;}
    else if(a<=7)ageGroups["5-7"]++;
    else if(a<=10)ageGroups["8-10"]++;
    else if(a<=13)ageGroups["11-13"]++;
    else if(a<=16)ageGroups["14-16"]++;
    else ageGroups["17+"]++;
  });
  const ages=students.map(s=>calcAge(s.geburtsdatum)).filter(a=>a!==null);
  const avgAge=ages.length?Math.round(ages.reduce((a,b)=>a+b,0)/ages.length):null;
  const minAge=ages.length?Math.min(...ages):null;
  const maxAge=ages.length?Math.max(...ages):null;

  // Attendance overall
  const totalLeks=lektionen.length;
  const allAtt=lektionen.flatMap(l=>Object.values(l.att||{}));
  const totalPresent=allAtt.filter(a=>a.present===true).length;
  const totalAbsent=allAtt.filter(a=>a.present===false).length;
  const attRate=totalPresent+totalAbsent>0?Math.round(totalPresent/(totalPresent+totalAbsent)*100):null;

  // Orte
  const orte={};
  students.forEach(s=>{if(s.ort)orte[s.ort]=(orte[s.ort]||0)+1;});
  const topOrte=Object.entries(orte).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const orteMax=topOrte[0]?.[1]||1;

  const barMax=Math.max(cntA,cntB,cntC1,cntC2,1);
  const ageMax=Math.max(...Object.values(ageGroups),1);

  function StatCard({icon,value,label,sub,color}){
    return React.createElement("div",{style:{background:"white",borderRadius:16,padding:"1.25rem",textAlign:"center",border:`2px solid ${(color||GOLD)}22`,boxShadow:`0 2px 12px ${(color||GOLD)}11`}},
      React.createElement("div",{style:{fontSize:28,marginBottom:4}},icon),
      React.createElement("div",{style:{fontSize:32,fontWeight:800,color:color||GOLD}},value),
      React.createElement("div",{style:{fontSize:12,color:"#888",marginTop:2}},label),
      sub&&React.createElement("div",{style:{fontSize:11,color:"#BBB",marginTop:2}},sub)
    );
  }

  function Bar({label,value,max,color}){
    return React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:8}},
      React.createElement("div",{style:{width:70,fontSize:12,color:DARK,fontWeight:500,flexShrink:0}},label),
      React.createElement("div",{style:{flex:1,height:22,background:"#F5F0E8",borderRadius:8,overflow:"hidden"}},
        React.createElement("div",{style:{width:`${Math.round(value/max*100)}%`,height:"100%",background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:8,display:"flex",alignItems:"center",paddingLeft:8,boxSizing:"border-box",transition:"width 0.6s"}},
          value>0&&React.createElement("span",{style:{fontSize:11,fontWeight:700,color:"white"}},value)
        )
      ),
      React.createElement("div",{style:{fontSize:11,color:"#AAA",minWidth:28,textAlign:"right"}},`${Math.round(value/students.length*100)}%`)
    );
  }

  return React.createElement("div",null,
    React.createElement("div",{style:{marginBottom:"1.5rem"}},
      React.createElement("h1",{style:{margin:0,fontSize:24,fontWeight:800,color:DARK}},"Statistik"),
      React.createElement("p",{style:{margin:"2px 0 0",fontSize:13,color:"#888"}},"Übersicht über alle Schüler und Lektionen")
    ),

    // Top stat cards
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:"1.5rem"}},
      React.createElement(StatCard,{icon:"👥",value:total,label:"Schüler total"}),
      React.createElement(StatCard,{icon:"📖",value:cntA,label:"Klasa A",sub:"Suret",color:"#B8860B"}),
      React.createElement(StatCard,{icon:"✏️",value:cntB,label:"Klasa B",sub:"Shkronjat",color:"#8B1A1A"}),
      React.createElement(StatCard,{icon:"📗",value:cntC,label:"Klasa C",sub:`C1: ${cntC1} · C2: ${cntC2}`,color:"#1A5C2A"}),
      avgAge&&React.createElement(StatCard,{icon:"🎂",value:avgAge,label:"Ø Alter",sub:`${minAge}–${maxAge} Jahre`}),
      attRate!==null&&React.createElement(StatCard,{icon:"✅",value:`${attRate}%`,label:"Anwesenheitsrate",sub:`${totalLeks} Lektionen`})
    ),

    // Klassen + Altersverteilung side by side
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:"1.5rem"}},

      // Klassen Balken
      React.createElement("div",{style:{background:"white",borderRadius:18,padding:"1.25rem",border:`1px solid ${GOLD}22`}},
        React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:4}},"Schüler pro Klasse"),
        React.createElement("div",{style:{fontSize:12,color:"#AAA",marginBottom:14}},`${total} total`),
        React.createElement(Bar,{label:"Klasa A",value:cntA,max:barMax,color:"#D4A017"}),
        React.createElement(Bar,{label:"Klasa B",value:cntB,max:barMax,color:"#C0392B"}),
        React.createElement(Bar,{label:"C1",value:cntC1,max:barMax,color:"#27AE60"}),
        React.createElement(Bar,{label:"C2",value:cntC2,max:barMax,color:"#2980B9"}),
        // C1+C2 combined
        React.createElement("div",{style:{marginTop:10,paddingTop:10,borderTop:`1px dashed ${GOLD}33`,display:"flex",gap:12}},
          React.createElement("div",{style:{flex:1,background:"#F5FFF8",borderRadius:10,padding:"8px",textAlign:"center",border:"1px solid #27AE6022"}},
            React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#1A5C2A"}},cntC1),
            React.createElement("div",{style:{fontSize:11,color:"#888"}},"Klasa C1")
          ),
          React.createElement("div",{style:{flex:1,background:"#F5F8FF",borderRadius:10,padding:"8px",textAlign:"center",border:"1px solid #2980B922"}},
            React.createElement("div",{style:{fontSize:18,fontWeight:800,color:"#1A3A5C"}},cntC2),
            React.createElement("div",{style:{fontSize:11,color:"#888"}},"Klasa C2")
          )
        )
      ),

      // Altersverteilung
      React.createElement("div",{style:{background:"white",borderRadius:18,padding:"1.25rem",border:`1px solid ${GOLD}22`}},
        React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:4}},"Altersverteilung"),
        React.createElement("div",{style:{fontSize:12,color:"#AAA",marginBottom:14}},avgAge?`Durchschnitt: ${avgAge} Jahre`:"Keine Daten"),
        // Bar chart visual
        React.createElement("div",{style:{display:"flex",alignItems:"flex-end",gap:8,height:120,marginBottom:8}},
          Object.entries(ageGroups).filter(([k])=>k!=="?").map(([group,cnt])=>
            React.createElement("div",{key:group,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}},
              React.createElement("div",{style:{fontSize:11,color:"#888",fontWeight:600}},cnt),
              React.createElement("div",{style:{width:"100%",height:`${Math.max(8,Math.round(cnt/ageMax*100))}px`,background:`linear-gradient(180deg,${GOLD},#E8C55A)`,borderRadius:"6px 6px 0 0",minHeight:4}})
            )
          )
        ),
        React.createElement("div",{style:{display:"flex",gap:8}},
          Object.entries(ageGroups).filter(([k])=>k!=="?").map(([group])=>
            React.createElement("div",{key:group,style:{flex:1,textAlign:"center",fontSize:10,color:"#AAA"}},group)
          )
        ),
        ageGroups["?"]>0&&React.createElement("div",{style:{fontSize:11,color:"#BBB",marginTop:8}},`${ageGroups["?"]} Schüler ohne Geburtsdatum`)
      )
    ),

    // Top Ortschaften + Anwesenheit
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:"1.5rem"}},

      // Ortschaften
      React.createElement("div",{style:{background:"white",borderRadius:18,padding:"1.25rem",border:`1px solid ${GOLD}22`}},
        React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:4}},"Top Ortschaften"),
        React.createElement("div",{style:{fontSize:12,color:"#AAA",marginBottom:14}},"Wo wohnen die Schüler?"),
        topOrte.map(([ort,cnt])=>
          React.createElement("div",{key:ort,style:{display:"flex",alignItems:"center",gap:10,marginBottom:8}},
            React.createElement("div",{style:{width:90,fontSize:12,color:DARK,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},ort),
            React.createElement("div",{style:{flex:1,height:16,background:"#F5F0E8",borderRadius:6,overflow:"hidden"}},
              React.createElement("div",{style:{width:`${cnt/orteMax*100}%`,height:"100%",background:`linear-gradient(90deg,${GOLD}88,${GOLD})`,borderRadius:6}})
            ),
            React.createElement("div",{style:{fontSize:11,color:"#AAA",minWidth:20,textAlign:"right"}},cnt)
          )
        )
      ),

      // Anwesenheit pro Klasse
      React.createElement("div",{style:{background:"white",borderRadius:18,padding:"1.25rem",border:`1px solid ${GOLD}22`}},
        React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:4}},"Anwesenheit"),
        React.createElement("div",{style:{fontSize:12,color:"#AAA",marginBottom:14}},`${totalLeks} Lektionen total`),
        totalLeks===0
          ? React.createElement("div",{style:{textAlign:"center",padding:"2rem",color:"#CCC",fontSize:13}},"Noch keine Lektionen")
          : React.createElement("div",null,
              // Big rate display
              React.createElement("div",{style:{textAlign:"center",marginBottom:16}},
                React.createElement("div",{style:{fontSize:48,fontWeight:800,color:GOLD}},`${attRate}%`),
                React.createElement("div",{style:{fontSize:12,color:"#888"}},"Gesamte Anwesenheitsrate")
              ),
              React.createElement("div",{style:{display:"flex",gap:12}},
                React.createElement("div",{style:{flex:1,background:"#FFFBF0",borderRadius:12,padding:"10px",textAlign:"center",border:`1px solid ${GOLD}22`}},
                  React.createElement("div",{style:{fontSize:22,fontWeight:800,color:GOLD}},totalPresent),
                  React.createElement("div",{style:{fontSize:11,color:"#888"}},"✓ Anwesend")
                ),
                React.createElement("div",{style:{flex:1,background:"#FFF0F0",borderRadius:12,padding:"10px",textAlign:"center",border:"1px solid #E74C3C22"}},
                  React.createElement("div",{style:{fontSize:22,fontWeight:800,color:RED}},totalAbsent),
                  React.createElement("div",{style:{fontSize:11,color:"#888"}},"✗ Abwesend")
                )
              )
            )
      )
    )
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function Overview({students,lektionen,lehrer,byCls,clsById,getStats,setPage,progress,saveClassProgress}){
  const [showAbsent,setShowAbsent]=useState(false);
  const sunStr=todaySunday();
  const lastLeks=lektionen.filter(l=>l.date===sunStr);
  const sumP=lastLeks.reduce((a,l)=>a+Object.values(l.att||{}).filter(x=>x.present===true).length,0);
  const sumA=lastLeks.reduce((a,l)=>a+Object.values(l.att||{}).filter(x=>x.present===false).length,0);
  const sumT=sumP+sumA;

  function classLastAtt(cid){
    const leks=lektionen.filter(l=>l.class_id===cid);
    if(!leks.length)return{present:0,absent:0,total:0};
    const last=[...leks].sort((a,b)=>b.date.localeCompare(a.date))[0];
    const vals=Object.values(last.att||{});
    return{present:vals.filter(x=>x.present===true).length,absent:vals.filter(x=>x.present===false).length,total:vals.filter(x=>x.present!==null).length};
  }

  const consecStudents=students.filter(s=>getStats(s.id).consec>=3);
  const allP=new Set(),allA=new Set();
  lektionen.forEach(l=>Object.entries(l.att||{}).forEach(([sid,a])=>{if(a.present===true)allP.add(String(sid));else if(a.present===false)allA.add(String(sid));}));
  const barMax=Math.max(1,...CLASSES.map(c=>byCls(c.id).length));

  return React.createElement("div",null,
    React.createElement("div",{style:{marginBottom:"1.5rem"}},
      React.createElement("div",{style:{fontSize:11,color:GOLD,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}},"بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم"),
      React.createElement("h1",{style:{margin:0,fontSize:24,fontWeight:800,color:DARK}},"Übersicht"),
      React.createElement("p",{style:{margin:"2px 0 0",fontSize:13,color:"#888"}},`${students.length} Schüler · ${CLASSES.length} Klassen · ${lehrer.length} Lehrpersonen`)
    ),
    sumT>0&&React.createElement("div",{style:{background:"white",border:`1.5px solid ${GOLD}33`,borderRadius:16,padding:"1rem 1.25rem",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}},
      React.createElement("div",{style:{fontSize:13,color:"#888"}},"📅 Letzter Sonntag ",React.createElement("span",{style:{color:GOLD,fontWeight:600}},fmtDate(sunStr))),
      React.createElement("div",{style:{marginLeft:"auto",display:"flex",gap:12}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},React.createElement("div",{style:{width:10,height:10,borderRadius:"50%",background:GOLD}}),React.createElement("span",{style:{fontSize:14,fontWeight:700}},sumP),React.createElement("span",{style:{fontSize:12,color:"#888"}},"anwesend")),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},React.createElement("div",{style:{width:10,height:10,borderRadius:"50%",background:"#E8C0C0"}}),React.createElement("span",{style:{fontSize:14,fontWeight:700,color:RED}},sumA),React.createElement("span",{style:{fontSize:12,color:"#888"}},"abwesend"))
      )
    ),
    React.createElement("div",{style:{background:"white",border:`1.5px solid ${GOLD}33`,borderRadius:20,padding:"1.5rem",marginBottom:"1.5rem"}},
      React.createElement("div",{style:{fontSize:15,fontWeight:700,marginBottom:2}},"Alle Schüler"),
      React.createElement("div",{style:{fontSize:12,color:"#AAA",marginBottom:"1.25rem"}},`${students.length} angemeldet · ${lektionen.length} Lektionen`),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"auto 1fr",gap:"1.5rem",alignItems:"center"}},
        React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:8}},
          React.createElement(Donut,{present:allP.size,absent:allA.size,total:Math.max(1,allP.size+allA.size),size:120}),
          React.createElement("div",{style:{display:"flex",gap:10}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4}},React.createElement("div",{style:{width:8,height:8,borderRadius:"50%",background:GOLD}}),React.createElement("span",{style:{fontSize:11,color:"#888"}},"Anwesend")),
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4}},React.createElement("div",{style:{width:8,height:8,borderRadius:"50%",background:"#E8C0C0"}}),React.createElement("span",{style:{fontSize:11,color:"#888"}},"Abwesend"))
          )
        ),
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:11,color:GOLD,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:1}},"Schüler pro Klasse"),
          CLASSES.map(cl=>{
            const cnt=byCls(cl.id).length;
            return React.createElement("div",{key:cl.id,style:{display:"flex",alignItems:"center",gap:8,marginBottom:6}},
              React.createElement("span",{style:{fontSize:11,color:cl.color,fontWeight:600,minWidth:58}},cl.label),
              React.createElement("div",{style:{flex:1,height:13,background:"#F5F0E8",borderRadius:6,overflow:"hidden"}},
                React.createElement("div",{style:{width:`${(cnt/barMax)*100}%`,height:"100%",background:`linear-gradient(90deg,${cl.border},${cl.color})`,borderRadius:6}})
              ),
              React.createElement("span",{style:{fontSize:11,color:"#AAA",minWidth:18,textAlign:"right"}},cnt)
            );
          })
        )
      )
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14,marginBottom:"1.5rem"}},
      CLASSES.map(cl=>{
        const st=classLastAtt(cl.id),cnt=byCls(cl.id).length,isKuran=cl.id==="C1"||cl.id==="C2";
        return React.createElement("div",{key:cl.id,style:{background:"white",border:`1.5px solid ${cl.border}33`,borderRadius:18,padding:"1.25rem",position:"relative",overflow:"hidden"}},
          React.createElement("div",{style:{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${cl.border},${cl.color}88)`}}),
          React.createElement("div",{style:{fontWeight:700,fontSize:15,color:cl.color}},cl.label),
          React.createElement("div",{style:{fontSize:11,color:"#AAA",marginTop:1}},cl.sub),
          React.createElement("div",{style:{fontSize:12,color:"#888",marginTop:4,marginBottom:10}},`${cnt} Schüler`),
          React.createElement("div",{style:{display:"flex",justifyContent:"center",marginBottom:8}},React.createElement(Donut,{present:st.present,absent:st.absent,total:st.total,size:100})),
          React.createElement("div",{style:{display:"flex",justifyContent:"center",gap:14}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5}},React.createElement("div",{style:{width:7,height:7,borderRadius:"50%",background:GOLD}}),React.createElement("span",{style:{fontSize:11,color:"#666"}},`${st.present} anw.`)),
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5}},React.createElement("div",{style:{width:7,height:7,borderRadius:"50%",background:"#E8C0C0"}}),React.createElement("span",{style:{fontSize:11,color:"#666"}},`${st.absent} abw.`))
          ),
          isKuran&&React.createElement("div",{style:{borderTop:`1px dashed ${cl.border}33`,marginTop:10,paddingTop:8}},
            React.createElement("div",{style:{fontSize:10,color:"#AAA",textTransform:"uppercase",letterSpacing:1,fontWeight:600,marginBottom:4}},"Aktuelle Seite"),
            React.createElement("input",{defaultValue:progress?.[cl.id]?.page||"",onBlur:e=>saveClassProgress({cid:cl.id,val:e.target.value.trim()}),onKeyDown:e=>{if(e.key==="Enter")saveClassProgress({cid:cl.id,val:e.target.value.trim()});},placeholder:"z.B. Seite 42...",style:{width:"100%",padding:"5px 10px",border:`1.5px solid ${cl.border}`,borderRadius:8,fontSize:12,background:cl.light,color:DARK,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}})
          )
        );
      })
    ),
    React.createElement("div",{style:{background:"white",border:`1.5px solid ${GOLD}33`,borderRadius:18,padding:"1.25rem"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"},onClick:()=>setShowAbsent(v=>!v)},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},
          React.createElement("div",{style:{width:36,height:36,borderRadius:10,background:consecStudents.length>0?"#FFF0F0":`${GOLD}18`,border:`1.5px solid ${consecStudents.length>0?"#E74C3C33":GOLD+"33"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}},consecStudents.length>0?"⚠️":"✅"),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:14,fontWeight:700,color:consecStudents.length>0?RED:DARK}},"3× aufeinander abwesend"),
            React.createElement("div",{style:{fontSize:12,color:"#888"}},consecStudents.length===0?"Kein Schüler betroffen":`${consecStudents.length} Schüler betroffen`)
          )
        ),
        consecStudents.length>0&&React.createElement("span",{style:{fontSize:18,color:"#AAA",display:"inline-block",transform:showAbsent?"rotate(180deg)":"none",transition:"transform 0.2s"}},"⌄")
      ),
      showAbsent&&consecStudents.map(s=>{
        const c=clsById(s.klasse),st=getStats(s.id);
        return React.createElement("div",{key:s.id,style:{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#FFF8F8",borderRadius:12,border:"1px solid #E74C3C22",marginTop:10}},
          React.createElement("div",{style:{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${c.border},${c.color})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white"}},initials(s.vorname+" "+s.nachname)),
          React.createElement("div",{style:{flex:1}},React.createElement("div",{style:{fontSize:13,fontWeight:600}},`${s.vorname} ${s.nachname}`),React.createElement("div",{style:{fontSize:11,color:c.color}},c.label)),
          React.createElement("div",{style:{textAlign:"right"}},React.createElement("div",{style:{fontSize:13,fontWeight:700,color:RED}},`${st.consec}× gefehlt`))
        );
      })
    )
  );
}

// ── STUDENTS ──────────────────────────────────────────────────────────────────
function Students({students,lektionen,byCls,clsById,getStats,getLastAtt,saveStudent,delStudent,askConfirm,progress,saveStudentProgress}){
  const [filterC,setFilterC]=useState("all");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [editModal,setEditModal]=useState(false);
  const [editData,setEditData]=useState({});
  const [showAdd,setShowAdd]=useState(false);
  const [addData,setAddData]=useState({vorname:"",nachname:"",geburtsdatum:"",eltern:"",telefon:"",klasse:"A",schuljahr:""});

  const filtered=students.filter(s=>{
    const mc=filterC==="all"?true:filterC==="C"?(s.klasse==="C1"||s.klasse==="C2"):s.klasse===filterC;
    const ms=!search||(s.vorname+" "+s.nachname).toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });

  if(selected){
    const s=selected,c=clsById(s.klasse),st=getStats(s.id);
    const hist=lektionen.filter(l=>l.att?.[s.id]!==undefined||l.att?.[String(s.id)]!==undefined).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20);
    const stuProg=progress?.students?.[s.id]||progress?.students?.[String(s.id)];
    const showProg=s.klasse==="A"||s.klasse==="B";
    const age=calcAge(s.geburtsdatum);

    return React.createElement("div",null,
      React.createElement(Btn,{onClick:()=>setSelected(null),style:{marginBottom:"1rem"}},"← Zurück"),
      React.createElement("div",{style:{background:"white",borderRadius:20,border:`1.5px solid ${c.border}44`,padding:"1.5rem",marginBottom:"1rem",position:"relative",overflow:"hidden"}},
        React.createElement("div",{style:{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${c.border},${c.color}88)`}}),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:14,marginBottom:16}},
          React.createElement("div",{style:{width:60,height:60,borderRadius:"50%",background:`linear-gradient(135deg,${c.border},${c.color})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"white",flexShrink:0}},initials(s.vorname+" "+s.nachname)),
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{fontSize:20,fontWeight:800}},`${s.vorname} ${s.nachname}`),
            React.createElement("div",{style:{fontSize:13,color:c.color,fontWeight:600}},`${c.label} · ${c.sub}`),
            React.createElement("div",{style:{display:"flex",gap:16,marginTop:4,flexWrap:"wrap"}},
              s.geburtsdatum&&React.createElement("div",{style:{fontSize:12,color:"#888"}},`🎂 ${s.geburtsdatum}${age!==null?` · ${age} Jahre`:""}`),
              s.eltern&&React.createElement("div",{style:{fontSize:12,color:"#888"}},`👤 ${s.eltern}`),
              s.telefon&&React.createElement("div",{style:{fontSize:12,color:"#888"}},`📞 ${s.telefon}`),
              s.schuljahr&&React.createElement("div",{style:{fontSize:12,color:"#888"}},`🏫 ${s.schuljahr}. Klasse`)
            )
          ),
          React.createElement(Btn,{onClick:()=>{setEditData({vorname:s.vorname,nachname:s.nachname,geburtsdatum:s.geburtsdatum||"",eltern:s.eltern||"",telefon:s.telefon||"",klasse:s.klasse,schuljahr:s.schuljahr||""});setEditModal(true);}},"✏️")
        ),
        showProg&&React.createElement("div",{style:{background:c.light,border:`1.5px solid ${c.border}33`,borderRadius:12,padding:"12px 14px",marginBottom:14}},
          React.createElement("div",{style:{fontSize:11,color:c.color,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8}},s.klasse==="A"?"📖 Aktuelle Sure":"✏️ Aktueller Buchstabe"),
          s.klasse==="A"
            ? React.createElement("select",{value:stuProg?.text||"",onChange:e=>saveStudentProgress(s.id,e.target.value),style:{width:"100%",padding:"9px 12px",border:`1.5px solid ${c.border}`,borderRadius:10,fontSize:13,background:"white",color:stuProg?.text?DARK:"#AAA",fontFamily:"inherit",outline:"none",cursor:"pointer"}},
                React.createElement("option",{value:""},"— Sure auswählen —"),
                SUREN.map(sr=>React.createElement("option",{key:sr,value:sr},sr))
              )
            : React.createElement("input",{defaultValue:stuProg?.text||"",onBlur:e=>saveStudentProgress(s.id,e.target.value.trim()),onKeyDown:e=>{if(e.key==="Enter")saveStudentProgress(s.id,e.target.value.trim());},placeholder:"z.B. Ba, Ta, Tha...",style:{width:"100%",padding:"9px 12px",border:`1.5px solid ${c.border}`,borderRadius:10,fontSize:13,background:"white",color:DARK,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}),
          stuProg?.updatedAt&&React.createElement("div",{style:{fontSize:10,color:"#BBB",marginTop:4}},`Zuletzt: ${fmtDate(stuProg.updatedAt)}`)
        ),
        st.consec>=3&&React.createElement("div",{style:{background:"#FFF0F0",border:"1px solid #E74C3C33",borderRadius:10,padding:"8px 12px",marginBottom:14,fontSize:13,color:RED}},`⚠️ ${st.consec}× hintereinander abwesend`),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}},
          [{v:st.total,l:"Lektionen"},{v:st.present,l:"Anwesend",col:"#27AE60"},{v:st.absent,l:"Abwesend",col:RED},{v:st.avg!==null?PART[Math.min(3,Math.round(st.avg))].e:"—",l:"Ø Mitarbeit"}].map(m=>
            React.createElement("div",{key:m.l,style:{background:"#FAFAF8",borderRadius:12,padding:"10px",textAlign:"center",border:`1px solid ${GOLD}22`}},
              React.createElement("div",{style:{fontSize:22,fontWeight:800,color:m.col||GOLD}},m.v),
              React.createElement("div",{style:{fontSize:11,color:"#AAA",marginTop:2}},m.l)
            )
          )
        )
      ),
      st.missed.length>0&&React.createElement("div",{style:{background:"#FFF8F8",border:"1px solid #E74C3C22",borderRadius:14,padding:"1rem",marginBottom:"1rem"}},
        React.createElement("div",{style:{fontSize:13,fontWeight:600,color:RED,marginBottom:8}},"Verpasste Themen"),
        React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},st.missed.map((t,i)=>React.createElement("span",{key:i,style:{fontSize:12,padding:"3px 10px",background:"white",border:"1px solid #E74C3C22",color:RED,borderRadius:20}},t)))
      ),
      React.createElement("div",{style:{background:"white",borderRadius:16,border:`1px solid ${GOLD}22`,padding:"1rem"}},
        React.createElement("div",{style:{fontSize:14,fontWeight:600,color:GOLD,marginBottom:10}},"Anwesenheitsverlauf"),
        hist.length===0&&React.createElement("div",{style:{textAlign:"center",padding:"2rem",color:"#AAA",fontSize:14}},"Noch keine Einträge"),
        hist.map(l=>{
          const a=l.att[s.id]||l.att[String(s.id)];
          return React.createElement("div",{key:l.id,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${GOLD}11`}},
            React.createElement("span",{style:{fontSize:12,color:"#AAA",minWidth:90}},fmtDate(l.date)),
            React.createElement("span",{style:{flex:1,fontSize:13,color:"#666"}},l.topic||"—"),
            React.createElement("span",{style:{fontSize:12,padding:"2px 10px",borderRadius:20,background:a?.present===true?"#FFFBF0":"#FFF0F0",color:a?.present===true?GOLD:RED,border:`1px solid ${a?.present===true?GOLD+"44":"#E74C3C33"}`}},a?.present===true?"✓"+(a.part?" "+a.part:""):"✗ Gefehlt")
          );
        })
      ),
      editModal&&React.createElement(Modal,{onClose:()=>setEditModal(false),title:"Schüler bearbeiten"},
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}},
          React.createElement(TInput,{value:editData.vorname,onChange:v=>setEditData(d=>({...d,vorname:v})),placeholder:"Vorname *"}),
          React.createElement(TInput,{value:editData.nachname,onChange:v=>setEditData(d=>({...d,nachname:v})),placeholder:"Nachname"}),
          React.createElement(TInput,{value:editData.geburtsdatum,onChange:v=>setEditData(d=>({...d,geburtsdatum:v})),placeholder:"Geburtsdatum (z.B. 24.06.2016)"}),
          React.createElement(TInput,{value:editData.eltern,onChange:v=>setEditData(d=>({...d,eltern:v})),placeholder:"Elternteil"}),
          React.createElement(TInput,{value:editData.telefon,onChange:v=>setEditData(d=>({...d,telefon:v})),placeholder:"Telefon"}),
          React.createElement(Sel,{value:editData.klasse,onChange:v=>setEditData(d=>({...d,klasse:v}))},CLASSES.map(c=>React.createElement("option",{key:c.id,value:c.id},`${c.label} – ${c.sub}`))),
          React.createElement(TInput,{value:editData.schuljahr,onChange:v=>setEditData(d=>({...d,schuljahr:v})),placeholder:"Schuljahr",style:{gridColumn:"1/-1"}})
        ),
        React.createElement("div",{style:{display:"flex",gap:8}},
          React.createElement(Btn,{primary:true,onClick:async()=>{await saveStudent({...selected,...editData});setSelected(p=>({...p,...editData}));setEditModal(false);},style:{flex:1}},"Speichern"),
          React.createElement(Btn,{danger:true,onClick:()=>askConfirm("Diesen Schüler wirklich löschen?",async()=>{await delStudent(s.id);setSelected(null);setEditModal(false);})},"🗑 Löschen"),
          React.createElement(Btn,{onClick:()=>setEditModal(false)},"Abbrechen")
        )
      )
    );
  }

  return React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",flexWrap:"wrap",gap:8}},
      React.createElement("div",null,React.createElement("h2",{style:{margin:0,fontSize:22,fontWeight:800}},"Schüler"),React.createElement("p",{style:{margin:0,fontSize:13,color:"#888"}},`${students.length} angemeldet · ${filtered.length} angezeigt`)),
      React.createElement(Btn,{primary:true,onClick:()=>setShowAdd(true)},"+ Neuer Schüler")
    ),
    React.createElement(TInput,{value:search,onChange:setSearch,placeholder:"🔍  Schüler suchen...",style:{marginBottom:"0.75rem"}}),
    React.createElement("div",{style:{display:"flex",gap:6,marginBottom:"1rem",flexWrap:"wrap"}},
      ["all","A","B","C","C1","C2"].map(id=>{
        const lbl={"all":"Alle","A":"Klasa A","B":"Klasa B","C":"Klasa C","C1":"↳ C1","C2":"↳ C2"}[id];
        const cnt=id==="all"?students.length:id==="C"?byCls("C1").length+byCls("C2").length:byCls(id).length;
        const active=filterC===id;
        return React.createElement("button",{key:id,onClick:()=>setFilterC(id),style:{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${active?GOLD:"#E8D080"}`,background:active?`${GOLD}18`:"white",color:active?GOLD:DARK,fontSize:12,fontWeight:active?700:400,cursor:"pointer",fontFamily:"inherit"}},`${lbl} (${cnt})`);
      })
    ),
    filtered.length===0&&React.createElement("div",{style:{textAlign:"center",padding:"4rem",color:"#AAA",background:"white",borderRadius:16,border:`1px solid ${GOLD}22`,fontSize:14}},"Keine Schüler gefunden"),
    React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6}},
      filtered.map(s=>{
        const c=clsById(s.klasse),st=getStats(s.id),la=getLastAtt(s.id,s.klasse);
        const stuProg=progress?.students?.[s.id]||progress?.students?.[String(s.id)];
        const age=calcAge(s.geburtsdatum);
        return React.createElement("div",{key:s.id,onClick:()=>setSelected(s),style:{background:"white",border:`1.5px solid ${st.consec>=3?"#E74C3C44":c.border+"22"}`,borderRadius:12,padding:"10px 14px",cursor:"pointer",transition:"all 0.2s"},
          onMouseEnter:e=>{e.currentTarget.style.borderColor=c.border+"66";e.currentTarget.style.transform="translateX(3px)";},
          onMouseLeave:e=>{e.currentTarget.style.borderColor=st.consec>=3?"#E74C3C44":c.border+"22";e.currentTarget.style.transform="";}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12}},
            React.createElement("div",{style:{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${c.border},${c.color})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white",flexShrink:0}},initials(s.vorname+" "+s.nachname)),
            React.createElement("div",{style:{flex:1,minWidth:0}},
              React.createElement("div",{style:{fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},`${s.vorname} ${s.nachname}`),
              React.createElement("div",{style:{fontSize:11,color:c.color}},`${c.label}${age!==null?" · "+age+" J.":""}`)
            ),
            React.createElement("div",{style:{display:"flex",gap:6,alignItems:"center",flexShrink:0}},
              st.consec>=3&&React.createElement("span",{style:{fontSize:11,padding:"2px 8px",background:"#FFF0F0",color:RED,borderRadius:20}},`⚠️ ${st.consec}×`),
              la?.present===false&&st.consec<3&&React.createElement("span",{style:{fontSize:11,padding:"2px 8px",background:"#FFF8F8",color:RED,borderRadius:20}},"Letztes Mal gefehlt"),
              la?.part&&la?.present===true&&React.createElement("span",{style:{fontSize:15}},la.part),
              st.total>0&&React.createElement("span",{style:{fontSize:12,color:"#AAA"}},`${st.absent} F.`),
              React.createElement("span",{style:{color:"#DDD",fontSize:16}},"›")
            )
          ),
          (s.klasse==="A"||s.klasse==="B")&&stuProg?.text&&React.createElement("div",{style:{marginTop:5,marginLeft:50,fontSize:12,color:c.color,background:c.light,display:"inline-block",padding:"2px 10px",borderRadius:20,border:`1px solid ${c.border}33`}},`${s.klasse==="A"?"📖":"✏️"} ${stuProg.text}`)
        );
      })
    ),
    showAdd&&React.createElement(Modal,{onClose:()=>setShowAdd(false),title:"Neuer Schüler"},
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}},
        React.createElement(TInput,{value:addData.vorname,onChange:v=>setAddData(d=>({...d,vorname:v})),placeholder:"Vorname *"}),
        React.createElement(TInput,{value:addData.nachname,onChange:v=>setAddData(d=>({...d,nachname:v})),placeholder:"Nachname"}),
        React.createElement(TInput,{value:addData.geburtsdatum,onChange:v=>setAddData(d=>({...d,geburtsdatum:v})),placeholder:"Geburtsdatum (z.B. 24.06.2016)"}),
        React.createElement(TInput,{value:addData.eltern,onChange:v=>setAddData(d=>({...d,eltern:v})),placeholder:"Elternteil"}),
        React.createElement(TInput,{value:addData.telefon,onChange:v=>setAddData(d=>({...d,telefon:v})),placeholder:"Telefon"}),
        React.createElement(Sel,{value:addData.klasse,onChange:v=>setAddData(d=>({...d,klasse:v}))},CLASSES.map(c=>React.createElement("option",{key:c.id,value:c.id},`${c.label} – ${c.sub}`))),
        React.createElement(TInput,{value:addData.schuljahr,onChange:v=>setAddData(d=>({...d,schuljahr:v})),placeholder:"Schuljahr",style:{gridColumn:"1/-1"}})
      ),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement(Btn,{primary:true,onClick:async()=>{if(!addData.vorname.trim())return;await saveStudent({id:Date.now(),...addData});setAddData({vorname:"",nachname:"",geburtsdatum:"",eltern:"",telefon:"",klasse:"A",schuljahr:""});setShowAdd(false);},style:{flex:1}},"Hinzufügen"),
        React.createElement(Btn,{onClick:()=>setShowAdd(false)},"Abbrechen")
      )
    )
  );
}

// ── LEKTIONEN ─────────────────────────────────────────────────────────────────
function Lektionen({students,lektionen,lehrer,byCls,clsById,getLastAtt,saveLektion,delLektion,askConfirm}){
  const [filterC,setFilterC]=useState("all");
  const [showModal,setShowModal]=useState(false);
  const [editLek,setEditLek]=useState(null);
  const [form,setForm]=useState({date:"",class_id:"A",topic:"",lehrer_id:""});
  const [att,setAtt]=useState({});

  const allSundays=[...new Set([...getSundays(),...lektionen.map(l=>l.date)])].sort((a,b)=>b.localeCompare(a));

  function openNew(){setForm({date:todaySunday(),class_id:"A",topic:"",lehrer_id:lehrer[0]?.id||""});const init={};byCls("A").forEach(s=>init[s.id]={present:null,part:null});setAtt(init);setEditLek(null);setShowModal(true);}
  function openEdit(l){setForm({date:l.date,class_id:l.class_id,topic:l.topic||"",lehrer_id:l.lehrer_id||""});const init={};byCls(l.class_id).forEach(s=>init[s.id]={...(l.att?.[s.id]||l.att?.[String(s.id)]||{present:null,part:null})});setAtt(init);setEditLek(l);setShowModal(true);}
  function changeClass(cid){setForm(f=>({...f,class_id:cid}));const init={};byCls(cid).forEach(s=>init[s.id]={present:null,part:null});setAtt(init);}

  const filtered=filterC==="all"?lektionen:lektionen.filter(l=>l.class_id===filterC);
  const byDate={};filtered.forEach(l=>{if(!byDate[l.date])byDate[l.date]=[];byDate[l.date].push(l);});

  return React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",flexWrap:"wrap",gap:8}},
      React.createElement("div",null,React.createElement("h2",{style:{margin:0,fontSize:22,fontWeight:800}},"Lektionen"),React.createElement("p",{style:{margin:0,fontSize:13,color:"#888"}},`${lektionen.length} erfasst`)),
      React.createElement(Btn,{primary:true,onClick:openNew},"+ Neue Lektion")
    ),
    React.createElement("div",{style:{display:"flex",gap:6,marginBottom:"1rem",flexWrap:"wrap"}},
      ["all",...CLASSES.map(c=>c.id)].map(id=>{
        const lbl=id==="all"?"Alle":CLASSES.find(c=>c.id===id)?.label||id,active=filterC===id;
        return React.createElement("button",{key:id,onClick:()=>setFilterC(id),style:{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${active?GOLD:"#E8D080"}`,background:active?`${GOLD}18`:"white",color:active?GOLD:DARK,fontSize:12,fontWeight:active?700:400,cursor:"pointer",fontFamily:"inherit"}},lbl);
      })
    ),
    Object.keys(byDate).length===0&&React.createElement("div",{style:{textAlign:"center",padding:"4rem",color:"#AAA",background:"white",borderRadius:16,border:`1px solid ${GOLD}22`,fontSize:14}},React.createElement("div",{style:{fontSize:32,marginBottom:8}},"📋"),"Noch keine Lektionen erfasst."),
    Object.keys(byDate).map(date=>{
      const leks=byDate[date];
      const tP=leks.reduce((a,l)=>a+Object.values(l.att||{}).filter(x=>x.present===true).length,0);
      const tA=leks.reduce((a,l)=>a+Object.values(l.att||{}).filter(x=>x.present===false).length,0);
      return React.createElement("div",{key:date,style:{marginBottom:14}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:8}},
          React.createElement("div",{style:{height:1,flex:1,background:`linear-gradient(90deg,${GOLD}44,transparent)`}}),
          React.createElement("span",{style:{fontSize:13,fontWeight:700,color:GOLD,padding:"4px 14px",background:`${GOLD}11`,borderRadius:20,border:`1px solid ${GOLD}33`}},`📅 ${fmtDate(date)}`),
          React.createElement("span",{style:{fontSize:12,color:GOLD,background:`${GOLD}11`,padding:"3px 10px",borderRadius:20}},`✓ ${tP}`),
          React.createElement("span",{style:{fontSize:12,color:RED,background:"#FFF0F0",padding:"3px 10px",borderRadius:20}},`✗ ${tA}`),
          React.createElement("div",{style:{height:1,flex:1,background:`linear-gradient(90deg,transparent,${GOLD}44)`}})
        ),
        leks.map(l=>{
          const c=clsById(l.class_id),lv=Object.values(l.att||{});
          const p=lv.filter(x=>x.present===true).length,ab=lv.filter(x=>x.present===false).length;
          const lr=lehrer.find(x=>x.id===l.lehrer_id);
          return React.createElement("div",{key:l.id,onClick:()=>openEdit(l),style:{background:"white",border:`1.5px solid ${c.border}22`,borderRadius:12,padding:"12px 16px",marginBottom:6,cursor:"pointer",transition:"all 0.2s"},
            onMouseEnter:e=>{e.currentTarget.style.borderColor=c.border+"55";e.currentTarget.style.transform="translateX(3px)";},
            onMouseLeave:e=>{e.currentTarget.style.borderColor=c.border+"22";e.currentTarget.style.transform="";}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}},
              React.createElement("span",{style:{fontSize:12,padding:"3px 10px",borderRadius:20,background:c.light,color:c.color,fontWeight:600,border:`1px solid ${c.border}33`}},c.label),
              React.createElement("span",{style:{flex:1,fontSize:14,fontWeight:500}},l.topic||React.createElement("span",{style:{color:"#CCC",fontStyle:"italic"}},"Kein Thema")),
              lr&&React.createElement("span",{style:{fontSize:12,color:"#AAA"}},`👤 ${lr.name}`),
              React.createElement("span",{style:{fontSize:12,color:GOLD,background:`${GOLD}11`,padding:"2px 8px",borderRadius:20}},`✓ ${p}`),
              React.createElement("span",{style:{fontSize:12,color:RED,background:"#FFF0F0",padding:"2px 8px",borderRadius:20}},`✗ ${ab}`),
              React.createElement("span",{style:{fontSize:12,color:"#CCC"}},"›")
            )
          );
        })
      );
    }),
    showModal&&React.createElement(Modal,{onClose:()=>setShowModal(false),title:editLek?"Lektion bearbeiten":"Neue Lektion"},
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}},
        React.createElement("div",null,React.createElement("label",{style:{fontSize:12,color:"#AAA",display:"block",marginBottom:4}},"Datum"),React.createElement(Sel,{value:form.date,onChange:v=>setForm(f=>({...f,date:v}))},allSundays.map(d=>React.createElement("option",{key:d,value:d},fmtDate(d))))),
        React.createElement("div",null,React.createElement("label",{style:{fontSize:12,color:"#AAA",display:"block",marginBottom:4}},"Klasse"),React.createElement(Sel,{value:form.class_id,onChange:changeClass},CLASSES.map(c=>React.createElement("option",{key:c.id,value:c.id},`${c.label} – ${c.sub}`)))),
        React.createElement("div",{style:{gridColumn:"1/-1"}},React.createElement("label",{style:{fontSize:12,color:"#AAA",display:"block",marginBottom:4}},"Thema"),React.createElement(TInput,{value:form.topic,onChange:v=>setForm(f=>({...f,topic:v})),placeholder:"z.B. Surah Al-Fatiha, Wudu..."})),
        lehrer.length>0&&React.createElement("div",{style:{gridColumn:"1/-1"}},React.createElement("label",{style:{fontSize:12,color:"#AAA",display:"block",marginBottom:4}},"Lehrperson"),React.createElement(Sel,{value:form.lehrer_id,onChange:v=>setForm(f=>({...f,lehrer_id:v}))},React.createElement("option",{value:""},"— Keine Auswahl —"),lehrer.map(l=>React.createElement("option",{key:l.id,value:l.id},l.name))))
      ),
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:10,alignItems:"center"}},
        React.createElement("button",{onClick:()=>{const a={};byCls(form.class_id).forEach(s=>a[s.id]={...att[s.id],present:true});setAtt(a);},style:{padding:"5px 12px",border:"1px solid #27AE6033",background:"#F5FFF8",color:"#27AE60",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit"}},"Alle anwesend"),
        React.createElement("span",{style:{fontSize:12,color:"#AAA"}},`${Object.values(att).filter(a=>a.present===true).length} ✓ · ${Object.values(att).filter(a=>a.present===false).length} ✗`)
      ),
      React.createElement("div",{style:{maxHeight:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:5,marginBottom:12}},
        byCls(form.class_id).length===0&&React.createElement("div",{style:{textAlign:"center",padding:"1rem",color:"#AAA",fontSize:13}},"Keine Schüler in dieser Klasse"),
        byCls(form.class_id).map(s=>{
          const a=att[s.id]||{},la=getLastAtt(s.id,form.class_id),wasAbsent=la?.present===false&&!editLek,c=clsById(s.klasse);
          return React.createElement("div",{key:s.id,style:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,border:`1px solid ${GOLD}22`,background:"#FAFAF8",opacity:a.present===false?0.5:1}},
            React.createElement("div",{style:{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${c.border},${c.color})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0}},initials(s.vorname+" "+s.nachname)),
            React.createElement("div",{style:{flex:1,minWidth:0}},
              React.createElement("span",{style:{fontSize:13,fontWeight:500}},`${s.vorname} ${s.nachname}`),
              wasAbsent&&React.createElement("span",{style:{fontSize:10,color:RED,background:"#FFF0F0",borderRadius:20,padding:"1px 6px",marginLeft:6}},"Letztes Mal gefehlt")
            ),
            React.createElement("div",{style:{display:"flex",gap:4,alignItems:"center"}},
              React.createElement("button",{onClick:()=>setAtt(d=>({...d,[s.id]:{...d[s.id],present:true}})),style:{padding:"3px 10px",fontSize:12,cursor:"pointer",border:"1.5px solid",borderRadius:8,fontFamily:"inherit",background:a.present===true?"#1A5C2A":"white",color:a.present===true?"#A8DABB":DARK,borderColor:a.present===true?"#27AE60":"#E8D080"}},"✓"),
              React.createElement("button",{onClick:()=>setAtt(d=>({...d,[s.id]:{...d[s.id],present:false,part:null}})),style:{padding:"3px 10px",fontSize:12,cursor:"pointer",border:"1.5px solid",borderRadius:8,fontFamily:"inherit",background:a.present===false?"#5C1010":"white",color:a.present===false?"#DFA8A8":DARK,borderColor:a.present===false?RED:"#E8D080"}},"✗"),
              a.present===true&&PART.map(p=>React.createElement("button",{key:p.e,title:p.l,onClick:()=>setAtt(d=>({...d,[s.id]:{...d[s.id],part:p.e}})),style:{fontSize:15,cursor:"pointer",background:"none",border:"none",padding:"2px",borderRadius:6,outline:a.part===p.e?`2px solid ${GOLD}`:"none",opacity:a.part&&a.part!==p.e?0.25:1}},p.e))
            )
          );
        })
      ),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement(Btn,{primary:true,onClick:async()=>{await saveLektion({id:editLek?.id||Date.now(),...form,att});setShowModal(false);},style:{flex:1}},"Speichern"),
        editLek&&React.createElement(Btn,{danger:true,onClick:()=>askConfirm("Diese Lektion löschen?",()=>{delLektion(editLek.id);setShowModal(false);})},"🗑 Löschen"),
        React.createElement(Btn,{onClick:()=>setShowModal(false)},"Abbrechen")
      )
    )
  );
}

// ── LEHRER ────────────────────────────────────────────────────────────────────
function LehrerPage({lehrer,saveLehrerFn,delLehrer,askConfirm}){
  const [editModal,setEditModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [editData,setEditData]=useState({});
  const [showAdd,setShowAdd]=useState(false);
  const [addData,setAddData]=useState({name:"",rolle:"",telefon:"",email:""});

  return React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",flexWrap:"wrap",gap:8}},
      React.createElement("div",null,React.createElement("h2",{style:{margin:0,fontSize:22,fontWeight:800}},"Lehrpersonen"),React.createElement("p",{style:{margin:0,fontSize:13,color:"#888"}},`${lehrer.length} erfasst`)),
      React.createElement(Btn,{primary:true,onClick:()=>setShowAdd(true)},"+ Neue Lehrperson")
    ),
    lehrer.length===0&&React.createElement("div",{style:{textAlign:"center",padding:"4rem",color:"#AAA",background:"white",borderRadius:16,border:`1px solid ${GOLD}22`,fontSize:14}},React.createElement("div",{style:{fontSize:32,marginBottom:8}},"👤"),"Noch keine Lehrpersonen erfasst."),
    React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8}},
      lehrer.map(l=>React.createElement("div",{key:l.id,style:{background:"white",border:`1.5px solid ${GOLD}22`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:14}},
        React.createElement("div",{style:{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},#E8C55A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:DARK,flexShrink:0}},initials(l.name)),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:15,fontWeight:600}},l.name),
          l.rolle&&React.createElement("div",{style:{fontSize:13,color:GOLD}},l.rolle),
          React.createElement("div",{style:{display:"flex",gap:12,marginTop:2,flexWrap:"wrap"}},
            l.telefon&&React.createElement("div",{style:{fontSize:12,color:"#888"}},`📞 ${l.telefon}`),
            l.email&&React.createElement("div",{style:{fontSize:12,color:"#888"}},`✉️ ${l.email}`)
          )
        ),
        React.createElement(Btn,{onClick:()=>{setEditId(l.id);setEditData({name:l.name,rolle:l.rolle||"",telefon:l.telefon||"",email:l.email||""});setEditModal(true);}},"✏️ Bearbeiten")
      ))
    ),
    showAdd&&React.createElement(Modal,{onClose:()=>setShowAdd(false),title:"Neue Lehrperson"},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:12}},
        React.createElement(TInput,{value:addData.name,onChange:v=>setAddData(d=>({...d,name:v})),placeholder:"Name *"}),
        React.createElement(TInput,{value:addData.rolle,onChange:v=>setAddData(d=>({...d,rolle:v})),placeholder:"Rolle"}),
        React.createElement(TInput,{value:addData.telefon,onChange:v=>setAddData(d=>({...d,telefon:v})),placeholder:"Telefon"}),
        React.createElement(TInput,{value:addData.email,onChange:v=>setAddData(d=>({...d,email:v})),placeholder:"E-Mail"})
      ),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement(Btn,{primary:true,onClick:async()=>{if(!addData.name.trim())return;await saveLehrerFn({id:Date.now(),...addData});setAddData({name:"",rolle:"",telefon:"",email:""});setShowAdd(false);},style:{flex:1}},"Hinzufügen"),
        React.createElement(Btn,{onClick:()=>setShowAdd(false)},"Abbrechen")
      )
    ),
    editModal&&React.createElement(Modal,{onClose:()=>setEditModal(false),title:"Lehrperson bearbeiten"},
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:12}},
        React.createElement(TInput,{value:editData.name,onChange:v=>setEditData(d=>({...d,name:v})),placeholder:"Name *"}),
        React.createElement(TInput,{value:editData.rolle,onChange:v=>setEditData(d=>({...d,rolle:v})),placeholder:"Rolle"}),
        React.createElement(TInput,{value:editData.telefon,onChange:v=>setEditData(d=>({...d,telefon:v})),placeholder:"Telefon"}),
        React.createElement(TInput,{value:editData.email,onChange:v=>setEditData(d=>({...d,email:v})),placeholder:"E-Mail"})
      ),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement(Btn,{primary:true,onClick:async()=>{await saveLehrerFn({...lehrer.find(l=>l.id===editId),...editData});setEditModal(false);},style:{flex:1}},"Speichern"),
        React.createElement(Btn,{danger:true,onClick:()=>askConfirm("Diese Lehrperson löschen?",()=>{delLehrer(editId);setEditModal(false);})},"🗑 Löschen"),
        React.createElement(Btn,{onClick:()=>setEditModal(false)},"Abbrechen")
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
