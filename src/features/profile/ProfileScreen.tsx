// @ts-nocheck
import { User, Smartphone, Mail, Bell, CreditCard, Target, Settings, Calculator, HandCoins, Award, Lock, BarChart3, HelpCircle, FileText, ChevronRight } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { DotDiv } from "@/components/shared/Primitives";
import { NavBar } from "@/components/shared/NavBar";
import { CARDS, ALL_TXNS, SAVINGS_BARS } from "@/data/simulation/legacy";
import { useAppContext } from "@/store/AppContext";
import { Toast, InfoBS, TxnSheet, ActSheet, GmailNudgePopup, GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CatBS, FilterSheet } from "@/components/sheets/BottomSheets";

export const ProfileScreen = () => {
  const { hasGmail, openCard, setInfoSheet, setScreen, setSelBrand, setCalcAmt, setCalcResult, setSearchQ, setRedeemCard, setRedeemPts, setRedeemResult, setRedeemPref, setShowGmailNudgeSheet } = useAppContext();
  const savedLabel = "₹" + f(SAVINGS_BARS.bar1);
  const txnCount = ALL_TXNS.length;
  const syncItems=[{Ic:Smartphone,label:"SMS Parsing",desc:"Auto-reads transaction SMS",status:"Active",statusColor:C.green},{Ic:Mail,label:"Gmail Sync",desc:"Statement import via Gmail",status:hasGmail?"Connected":"Not Connected",statusColor:hasGmail?C.green:C.orange},{Ic:Bell,label:"Push Notifications",desc:"Spending alerts & tips",status:"Enabled",statusColor:C.green}];
  const menuItems=[
    {Ic:CreditCard,label:"Manage Cards",desc:`${CARDS.length} cards linked`,action:()=>openCard(0)},
    {Ic:Target,label:"Spending Goals",desc:"Set monthly budgets per category",action:()=>setInfoSheet({title:"Spending Goals",desc:"Set monthly spending limits for each category. Get notified when you're approaching your budget. Coming soon!"})},
    {Ic:Settings,label:"Optimization Settings",desc:"Card suggestion preferences",action:()=>setScreen("optimize")},
    {Ic:Calculator,label:"Savings Calculator",desc:"Check best card before spending",action:()=>{setScreen("calc");setSelBrand(null);setCalcAmt("");setCalcResult(null);setSearchQ("");}},
    {Ic:HandCoins,label:"Redemption Finder",desc:"Best ways to redeem your points",action:()=>{setScreen("redeem");setRedeemCard(null);setRedeemPts("");setRedeemResult(null);setRedeemPref(null);}},
    {Ic:Award,label:"Best Cards for You",desc:"Market recommendations for your spend",action:()=>setScreen("bestcards")},
  ];
  const settingsItems=[
    {Ic:Lock,label:"Security & Privacy",desc:"Biometric lock, data encryption"},
    {Ic:BarChart3,label:"Data & Storage",desc:"Cache: 12MB · Last sync: 2 min ago"},
    {Ic:HelpCircle,label:"Help & Support",desc:"FAQs, contact support"},
    {Ic:FileText,label:"Terms & Conditions",desc:"Privacy policy, terms of use"},
  ];
  return(<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative"}}><div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",background:C.bg,paddingBottom:100}}><div className="slide-in"><FL/>
    <div style={{background:"linear-gradient(180deg,#1a3fc7 0%,#2563eb 40%,#3b82f6 100%)",padding:"56px 24px 36px",color:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}><div onClick={()=>setScreen("home")} style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>←</div><span style={{fontSize:16,fontWeight:700}}>Profile</span></div>
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <div style={{width:60,height:60,borderRadius:20,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}><User size={28} strokeWidth={1.5} color="#fff"/></div>
        <div><div style={{fontSize:18,fontWeight:700}}>User</div><div style={{fontSize:12,opacity:0.7,marginTop:4}}>Member since Jan 2025</div></div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:20}}>
        <div style={{flex:1,padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",backdropFilter:"blur(12px)",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700}}>{CARDS.length}</div><div style={{fontSize:10,opacity:0.5,marginTop:2}}>Cards</div></div>
        <div style={{flex:1,padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",backdropFilter:"blur(12px)",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700}}>{savedLabel}</div><div style={{fontSize:10,opacity:0.5,marginTop:2}}>Saved</div></div>
        <div style={{flex:1,padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",backdropFilter:"blur(12px)",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700}}>{txnCount}</div><div style={{fontSize:10,opacity:0.5,marginTop:2}}>Txns</div></div>
      </div>
    </div>
    <div style={{padding:"0 24px 44px"}}>
      {/* Data Sources */}
      <DotDiv label="Data Sources"/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {syncItems.map((s,i)=>(<div key={i} onClick={()=>{if(s.label==="Gmail Sync"&&!hasGmail)setShowGmailNudgeSheet(true);}} style={{display:"flex",alignItems:"center",gap:14,padding:"18px 20px",background:C.white,borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.04)",cursor:s.label==="Gmail Sync"&&!hasGmail?"pointer":"default"}}>
          <div style={{width:40,height:40,borderRadius:12,background:s.statusColor==="C.green"||s.statusColor===C.green?C.greenBg:C.orangeBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><s.Ic size={18} strokeWidth={1.5} color={s.statusColor}/></div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{s.label}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{s.desc}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,fontWeight:600,color:s.statusColor,background:`${s.statusColor}12`,padding:"4px 10px",borderRadius:6}}>{s.status}</span>
            {s.label==="Gmail Sync"&&!hasGmail&&<ChevronRight size={14} strokeWidth={1.5} color={C.orange}/>}
          </div>
        </div>))}
      </div>

      {/* Tools & Features */}
      <DotDiv label="Tools & Features"/>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {menuItems.map((m,i)=>(<div key={i} onClick={m.action} style={{display:"flex",alignItems:"center",gap:12,padding:"18px 22px",background:C.white,borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.04)",cursor:"pointer"}}>
          <div style={{width:36,height:36,borderRadius:10,background:C.blueBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{m.Ic?<m.Ic size={18} strokeWidth={1.5} color={C.blue}/>:m.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{m.label}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{m.desc}</div></div>
          <span style={{color:C.dim,fontSize:22}}><ChevronRight size={18} strokeWidth={1.5} color={C.dim}/></span>
        </div>))}
      </div>

      {/* Settings */}
      <DotDiv label="Settings"/>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {settingsItems.map((s,i)=>(<div key={i} onClick={()=>setInfoSheet({title:s.label,desc:s.desc+". This feature is part of the settings module."})} style={{display:"flex",alignItems:"center",gap:12,padding:"18px 22px",background:C.white,borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.04)",cursor:"pointer"}}>
          <div style={{width:36,height:36,borderRadius:10,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.Ic?<s.Ic size={18} strokeWidth={1.5} color={C.green}/>:s.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{s.label}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{s.desc}</div></div>
          <span style={{color:C.dim,fontSize:22}}><ChevronRight size={18} strokeWidth={1.5} color={C.dim}/></span>
        </div>))}
      </div>

      <div style={{marginTop:28,textAlign:"center"}}><div style={{fontSize:10,color:C.dim}}>Spend Analyser v1.0</div><div style={{fontSize:10,color:C.dim,marginTop:4}}>By CashKaro</div></div>
    </div>
    <InfoBS/>
  </div></div><div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",padding:"12px 0 5vw",pointerEvents:"none",zIndex:50}}><div style={{pointerEvents:"auto"}}><NavBar/></div></div><TxnSheet/><ActSheet/><CatBS/><FilterSheet/><GmailNudgePopup/><GmailNudgeSheet/><RetroOverlay/><VoiceFlowOverlay/><Toast/></div>);
};
