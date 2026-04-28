// LEGACY SCREEN: kept for fallback/reference only.
// Active implementation now routes through `src/features/new/OptimizeScreen.tsx`.
// @ts-nocheck
import { CreditCard, ChevronDown, ChevronLeft, ChevronRight, Lock, Clock, Gift, Star, Info } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { NavBar } from "@/components/shared/NavBar";
import { CARDS } from "@/data/cards";
import { OPT_BRANDS, SAVINGS_COMP } from "@/data/optimize";
import { DotDiv, ThkDiv, SemiGauge } from "@/components/shared/Primitives";
import { ActionCard } from "@/components/shared/ActionCard";
import { useAppContext } from "@/store/AppContext";
import { Toast, InfoBS, TxnSheet, ActSheet, GmailNudgePopup, GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CatBS, FilterSheet, LockedSection } from "@/components/sheets/BottomSheets";

const optCardClr = { "HSBC Travel One": ["#0c2340", "#1a5276"], "Axis Flipkart": ["#5b2c8e", "#8b5cf6"], "HSBC Live+": ["#006d5b", "#00a086"], "HDFC Infinia": ["#111827", "#374151"] };

const OPT_CATS = [
  {name:"Online Shopping",icon:"🛍️",totalSpend:95000,bestCard:"Axis Flipkart",bestRate:5,bestSaved:4750,altCard:"HSBC Live+",altRate:2.5,txnCount:42,breakdown:[{card:"Axis Flipkart",pct:60,spend:57000,saved:2850},{card:"HSBC Live+",pct:40,spend:38000,saved:950}]},
  {name:"Food Delivery",icon:"🍔",totalSpend:54000,bestCard:"Axis Flipkart",bestRate:4,bestSaved:2160,altCard:"HSBC Travel One",altRate:0.5,txnCount:84,capInfo:"Dining cap at 67%",breakdown:[{card:"Axis Flipkart",pct:67,spend:36000,saved:1440},{card:"HSBC Travel One",pct:33,spend:18000,saved:90}]},
  {name:"Travel",icon:"✈️",totalSpend:42000,bestCard:"Axis Flipkart",bestRate:5,bestSaved:2100,altCard:"HSBC Live+",altRate:2.5,txnCount:12,breakdown:[{card:"Axis Flipkart",pct:60,spend:25200,saved:1260},{card:"HSBC Live+",pct:40,spend:16800,saved:420}]},
  {name:"Groceries",icon:"🥦",totalSpend:36000,bestCard:"Axis Flipkart",bestRate:4,bestSaved:1440,altCard:"HSBC Live+",altRate:1.25,txnCount:60,breakdown:[{card:"Axis Flipkart",pct:100,spend:36000,saved:1440}]},
  {name:"Cab Rides",icon:"🚗",totalSpend:25000,bestCard:"Axis Flipkart",bestRate:4,bestSaved:1000,altCard:"HSBC Travel One",altRate:0.5,txnCount:48,breakdown:[{card:"Axis Flipkart",pct:100,spend:25000,saved:1000}]},
  {name:"Bills & Recharges",icon:"📄",totalSpend:22000,bestCard:"HSBC Travel One",bestRate:0.25,bestSaved:55,altCard:"HSBC Live+",altRate:0.25,txnCount:14,breakdown:[{card:"HSBC Travel One",pct:100,spend:22000,saved:55}]},
  {name:"Entertainment",icon:"🎬",totalSpend:16000,bestCard:"HSBC Live+",bestRate:2.5,bestSaved:400,altCard:"HSBC Travel One",altRate:0.5,txnCount:20,breakdown:[{card:"HSBC Live+",pct:100,spend:16000,saved:400}]},
];

const catBrandMap = {"Online Shopping":[{n:"Flipkart",ic:"🔵",sp:45000},{n:"Amazon",ic:"🟠",sp:30000},{n:"Myntra",ic:"🟣",sp:20000}],"Food Delivery":[{n:"Swiggy",ic:"🟠",sp:36000},{n:"Zomato",ic:"🔴",sp:18000}],"Travel":[{n:"MakeMyTrip",ic:"✈️",sp:24000},{n:"Cleartrip",ic:"🔵",sp:18000}],"Groceries":[{n:"BigBasket",ic:"🟢",sp:20000},{n:"DMart",ic:"🛒",sp:16000}],"Cab Rides":[{n:"Uber",ic:"🚗",sp:18000},{n:"Ola",ic:"🚕",sp:7000}],"Bills & Recharges":[{n:"Jio",ic:"🔵",sp:12000},{n:"Airtel",ic:"🔴",sp:10000}],"Entertainment":[{n:"BookMyShow",ic:"🎬",sp:8000},{n:"Netflix",ic:"🔴",sp:5000},{n:"Hotstar",ic:"🔵",sp:3000}]};

export const OptimizeScreen = () => {
  const {
    isState1, hasGmail, setScreen, setShowGmailNudgeSheet,
    setShowCardMappingUI, setMappingStep, setMappingSearchQ,
    optTab, setOptTab,
    optSheet, setOptSheet,
    optSheetFrom, setOptSheetFrom,
    optExpanded, setOptExpanded,
    setInfoSheet,
    setSelBrand, setCalcAmt, setCalcResult, setSearchQ,
  } = useAppContext();

  // Empty state — no Gmail
  if (isState1) {
    return (<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative",background:C.bg}}><div data-scroll="1" style={{flex:1,overflowY:"auto",paddingBottom:100}}><FL/>
      <div style={{background:"linear-gradient(180deg,#1a3fc7,#3b82f6)",padding:"56px 24px 36px",color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}><div onClick={()=>setScreen("home")} style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>←</div><span style={{fontSize:16,fontWeight:700}}>Optimise your cards</span></div>
      </div>
      <div style={{padding:"60px 24px 40px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        <div style={{width:84,height:84,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,border:`1px solid ${C.brd}`}}><Lock size={36} strokeWidth={1.5} color={C.dim}/></div>
        <div style={{fontSize:22,fontWeight:700,color:C.text,marginBottom:14}}>Optimise your cards</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.6,marginBottom:28,maxWidth:300}}>Connect Gmail or identify your cards to see how to optimise your spending and upgrade your wallet.</div>
        <div onClick={()=>setShowGmailNudgeSheet(true)} style={{width:"100%",maxWidth:300,padding:"15px",borderRadius:16,background:"#1a2233",color:"#fff",textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:14}}>Connect Gmail</div>
        <div onClick={()=>{setShowCardMappingUI(true);setMappingStep(0);setMappingSearchQ("");setScreen("building");}} style={{width:"100%",maxWidth:300,padding:"15px",borderRadius:16,background:C.white,border:`1.5px solid ${C.brd}`,color:C.text,textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer"}}>Identify my cards</div>
      </div>
    </div><div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",padding:"12px 0 5vw",pointerEvents:"none"}}><div style={{pointerEvents:"auto"}}><NavBar/></div></div><TxnSheet/><ActSheet/><CatBS/><FilterSheet/><GmailNudgePopup/><GmailNudgeSheet/><RetroOverlay/><VoiceFlowOverlay/><Toast/></div>);
  }

  const optData = optTab === "Brands" ? OPT_BRANDS : OPT_CATS;

  // Detail sheet view
  if (optSheet) {
    const bestClr = optCardClr[optSheet.bestCard] || ["#333", "#555"];
    const altClr = optCardClr[optSheet.altCard] || ["#333", "#555"];
    const catBrands = catBrandMap[optSheet.name] || [];
    const rBrands = catBrands.map(b => b.n).slice(0, 4);
    return (<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      <div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:40}}>
        <div className="slide-in"><FL/>
          <div style={{padding:"56px 24px 28px",background:C.white,borderBottom:"1px solid "+C.brd}}>
            <div onClick={()=>{setOptSheet(null);if(optSheetFrom==="bestcards")setScreen("bestcards");else if(optSheetFrom==="detail"){setScreen("detail");}}} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:28}}><div style={{width:34,height:34,borderRadius:10,background:C.bg,border:"1px solid rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronLeft size={16} strokeWidth={1.5} color={C.text}/></div><span style={{fontSize:13,fontWeight:600,color:C.sub}}>Back</span></div>
            <div style={{display:"flex",alignItems:"center",gap:16}}><div style={{width:52,height:52,borderRadius:16,background:C.bg,border:"1px solid rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{optSheet.icon}</div><div><div style={{fontSize:22,fontWeight:700,color:C.text}}>{optSheet.name}</div><div style={{fontSize:12,color:C.sub,marginTop:2}}>{optSheet.cat||optSheet.txnCount+" transactions"}</div></div></div>
          </div>
          <div style={{padding:"0 24px"}}>
            <div style={{display:"flex",margin:"20px 0",borderRadius:16,border:"1px solid rgba(0,0,0,0.05)",background:C.white,overflow:"hidden"}}><div style={{flex:1,padding:"16px 0",textAlign:"center",borderRight:"1px solid "+C.brd}}><div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.5,textTransform:"uppercase"}}>Spent</div><div style={{fontSize:18,fontWeight:700,color:C.text,marginTop:4}}>₹{f(optSheet.totalSpend)}</div></div><div style={{flex:1,padding:"16px 0",textAlign:"center",borderRight:"1px solid "+C.brd}}><div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.5,textTransform:"uppercase"}}>Saved</div><div style={{fontSize:18,fontWeight:700,color:C.text,marginTop:4}}>₹{f(optSheet.saved||0)}</div></div><div style={{flex:1,padding:"16px 0",textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:C.green,letterSpacing:0.5,textTransform:"uppercase"}}>Could Save</div><div style={{fontSize:18,fontWeight:700,color:C.green,marginTop:4}}>₹{f(optSheet.bestSaved)}</div></div></div>
            {optTab==="Categories"&&catBrands.length>0&&<div style={{marginBottom:28}}><div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.5,textTransform:"uppercase",marginBottom:14}}>Your {optSheet.name} spends by brand</div><div style={{background:C.white,borderRadius:16,border:"1px solid rgba(0,0,0,0.05)",overflow:"hidden"}}>{catBrands.map((b,bi)=>(<div key={bi} style={{display:"flex",alignItems:"center",gap:10,padding:"18px 22px",borderBottom:bi<catBrands.length-1?"1px solid "+C.brd:"none"}}><div style={{width:34,height:34,borderRadius:10,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{b.ic}</div><div style={{flex:1,fontSize:14,fontWeight:600,color:C.text}}>{b.n}</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>₹{f(b.sp)}</div></div>))}</div></div>}
            <div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.5,textTransform:"uppercase",marginBottom:20}}>Recommended cards for {optSheet.name}</div>
            {[{card:optSheet.bestCard,rate:optSheet.bestRate,label:"Best Card to Use",color:C.green,bg:"#f0fdf4",border:C.greenBrd,clr:bestClr},{card:optSheet.altCard,rate:optSheet.altRate,label:"If Reward Cap Reached",color:"#7c3aed",bg:"#faf5ff",border:"#c4b5fd",clr:altClr}].map((rc,ri)=>(<div key={ri} style={{padding:"18px",borderRadius:16,border:"1.5px dashed "+rc.border,background:rc.bg,marginBottom:22}}><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{width:56,height:36,borderRadius:8,background:"linear-gradient(135deg,"+rc.clr[0]+","+rc.clr[1]+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}><CreditCard size={14} strokeWidth={1.5} color="rgba(255,255,255,0.5)"/></div><div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:rc.color,letterSpacing:0.5,textTransform:"uppercase"}}>{rc.label}</div><div style={{fontSize:16,fontWeight:700,color:C.text,marginTop:2}}>{rc.card}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.3,textTransform:"uppercase"}}>{rc.card&&rc.card.includes("Flipkart")?"Cashback":"Rewards"}</div><div style={{fontSize:20,fontWeight:700,color:rc.color}}>{rc.rate}%</div></div></div>{optTab==="Categories"&&rBrands.length>0&&<div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.6)",border:"1px solid rgba(0,0,0,0.05)"}}><div style={{fontSize:10,fontWeight:600,color:C.dim}}>Use at: {rBrands.join(", ")}</div><div style={{fontSize:11,color:C.sub,marginTop:4,lineHeight:1.5}}>Spend on {rBrands[0]} with {rc.card} to get {rc.rate}% rewards</div></div>}{optTab==="Brands"&&<div style={{fontSize:11,color:C.sub,marginTop:10,lineHeight:1.5}}>This card gives {rc.rate}% {rc.card&&rc.card.includes("Flipkart")?"Cashback":"RP"} on {optSheet.name}</div>}</div>))}
            <div style={{marginTop:8,padding:"22px",background:C.white,borderRadius:16,border:"1px solid rgba(0,0,0,0.05)"}}><div style={{fontSize:10,fontWeight:700,color:C.text,letterSpacing:1,textTransform:"uppercase",marginBottom:22}}>Strategy based on your spends</div><div style={{display:"flex",height:24,borderRadius:10,overflow:"hidden",marginBottom:8}}>{optSheet.breakdown.map((seg,si)=>(<div key={si} style={{width:seg.pct+"%",background:["#1d4ed8","#7c3aed","#059669"][si%3]}}/>))}</div><div style={{display:"flex",marginBottom:20}}>{optSheet.breakdown.map((seg,si)=>(<span key={si} style={{width:seg.pct+"%",fontSize:12,fontWeight:700,color:["#1d4ed8","#7c3aed","#059669"][si%3]}}>{seg.pct}%</span>))}</div><div style={{display:"flex",padding:"8px 0",borderBottom:"1px solid "+C.brd}}><span style={{flex:1,fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.5,textTransform:"uppercase"}}>Card</span>{optTab==="Categories"&&<span style={{width:70,fontSize:10,fontWeight:700,color:C.sub,textAlign:"center",letterSpacing:0.5,textTransform:"uppercase"}}>Brands</span>}<span style={{width:70,fontSize:10,fontWeight:700,color:C.sub,textAlign:"right",letterSpacing:0.5,textTransform:"uppercase"}}>Spent</span><span style={{width:70,fontSize:10,fontWeight:700,color:C.sub,textAlign:"right",letterSpacing:0.5,textTransform:"uppercase"}}>Could Save</span></div>{optSheet.breakdown.map((seg,si)=>{const segBrands=(catBrandMap[optSheet.name]||[]).slice(si*2,(si+1)*2).map(b=>b.n);return(<div key={si} style={{display:"flex",alignItems:"center",padding:"14px 0",borderBottom:si<optSheet.breakdown.length-1?"1px solid "+C.brd:"none"}}><div style={{flex:1,display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:["#1d4ed8","#7c3aed","#059669"][si%3]}}/><span style={{fontSize:13,fontWeight:600,color:C.text}}>{seg.card}</span></div>{optTab==="Categories"&&<div style={{width:70,display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>{segBrands.map(bn=>(<span key={bn} style={{fontSize:10,fontWeight:600,color:C.dim,background:C.bg,padding:"2px 6px",borderRadius:4}}>{bn}</span>))}</div>}<span style={{width:70,fontSize:13,fontWeight:700,color:C.text,textAlign:"right"}}>₹{f(seg.spend)}</span><span style={{width:70,fontSize:13,fontWeight:700,color:C.green,textAlign:"right"}}>₹{f(seg.saved)}</span></div>);})}</div>
            {optSheet.capInfo&&<div style={{padding:"12px 16px",borderRadius:12,background:"#fffbeb",border:"1px solid #fde68a",marginTop:16,fontSize:11,fontWeight:600,color:"#92400e"}}>⚠️ {optSheet.capInfo}</div>}
            {optSheet.howToUse&&<div style={{marginTop:24,padding:"22px",background:C.white,borderRadius:16,border:"1px solid rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>How to use this card</div>
              {optSheet.howToUse.map((s,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:14}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:C.greenBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:700,color:C.green}}>{i+1}</div>
                <span style={{fontSize:13,color:C.text,lineHeight:1.5}}>{s}</span>
              </div>))}
            </div>}
          </div>
        </div>
      </div>
    </div>);
  }

  // Main optimize screen
  return (<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
    <div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      <div><FL/>
        <div style={{background:"linear-gradient(180deg,#0f1b4d 0%,#1e3a8a 40%,#1d4ed8 100%)",padding:"48px 20px 36px",color:"#fff",textAlign:"center",position:"relative"}}>
          <div onClick={()=>setScreen("home")} style={{position:"absolute",left:16,top:48,width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>←</div>
          <div style={{fontSize:18,fontWeight:700,lineHeight:1.5,marginBottom:6}}>You are saving<br/><span style={{fontWeight:700}}>70% less</span> than what you could save</div>
          <div style={{display:"flex",justifyContent:"center",position:"relative",margin:"8px 0 -20px"}}><SemiGauge pct={30}/><div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",textAlign:"center"}}><div style={{fontSize:32,fontWeight:700}}>30%</div><div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.4)",letterSpacing:1}}>Saving efficiency</div></div></div>
          <div style={{display:"flex",padding:"14px 4px",borderRadius:14,background:"rgba(255,255,255,0.08)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.18)",marginTop:28}}><div style={{flex:1,textAlign:"center",borderRight:"1px solid rgba(255,255,255,0.12)"}}><div style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontWeight:600}}>You saved</div><div style={{fontSize:16,fontWeight:700,marginTop:4}}>₹50,000</div></div><div style={{flex:1,textAlign:"center"}}><div style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontWeight:600}}>You could save</div><div style={{fontSize:16,fontWeight:700,marginTop:4}}>₹1,50,000</div></div></div>
        </div>

        <div className="opt-in" style={{padding:"0 24px 44px"}}>
          <DotDiv label="Recommended changes"/>

          <div style={{background:C.white,borderRadius:16,border:"1px solid rgba(0,0,0,0.05)",overflow:"hidden",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.03)"}}>
            <div style={{display:"flex"}}>
              <div style={{width:90,background:"linear-gradient(135deg,#dbeafe,#bfdbfe)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:"20px 10px"}}><div style={{fontSize:36}}>💳</div></div>
              <div style={{flex:1,padding:"16px 14px"}}>
                <div style={{fontFamily:FN,fontSize:16,fontWeight:700,color:C.text}}>Upgrade your Cards</div>
                <div style={{fontSize:12,color:C.sub,marginTop:6,lineHeight:1.5}}>Replace your bad cards with the ones that's best suited for you</div>
                <div style={{marginTop:10,fontSize:11,fontWeight:700,color:C.dkGreen,letterSpacing:0.3}}>SAVE UPTO: ₹1,00,000 (30% UP)</div>
                <div onClick={()=>{const el=document.getElementById("opt-upgrade");if(el){const sc=el.closest("[data-scroll]");if(sc)sc.scrollTo({top:el.offsetTop-sc.offsetTop-20,behavior:"smooth"});else el.scrollIntoView({behavior:"smooth"})};}} style={{display:"inline-flex",marginTop:12,padding:"8px 18px",borderRadius:8,background:"transparent",border:"1.5px solid #94a3b8",cursor:"pointer"}}><span style={{fontSize:12,fontWeight:600,color:C.text}}>Know more ▾</span></div>
              </div>
            </div>
          </div>

          <div style={{background:C.white,borderRadius:16,border:"1px solid rgba(0,0,0,0.05)",overflow:"hidden",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.03)"}}>
            <div style={{display:"flex"}}>
              <div style={{width:90,background:"linear-gradient(135deg,#ede9fe,#c4b5fd)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:"20px 10px"}}><div style={{fontSize:36}}>🧮</div></div>
              <div style={{flex:1,padding:"16px 14px"}}>
                <div style={{fontFamily:FN,fontSize:16,fontWeight:700,color:C.text}}>Optimize your Card Usage</div>
                <div style={{fontSize:12,color:C.sub,marginTop:6,lineHeight:1.5}}>Use your existing cards in a better way to optimise savings</div>
                <div style={{marginTop:10,fontSize:11,fontWeight:700,color:C.dkGreen,letterSpacing:0.3}}>SAVE UPTO: ₹20,000 (30% UP)</div>
                <div onClick={()=>{const el=document.getElementById("opt-usage");if(el){const sc=el.closest("[data-scroll]");if(sc)sc.scrollTo({top:el.offsetTop-sc.offsetTop-20,behavior:"smooth"});else el.scrollIntoView({behavior:"smooth"})};}} style={{display:"inline-flex",marginTop:12,padding:"8px 18px",borderRadius:8,background:"transparent",border:"1.5px solid #94a3b8",cursor:"pointer"}}><span style={{fontSize:12,fontWeight:600,color:C.text}}>Know more ▾</span></div>
              </div>
            </div>
          </div>

          <DotDiv label="Also important"/>

          <div style={{background:C.white,borderRadius:16,border:"1px solid rgba(0,0,0,0.05)",overflow:"hidden",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.03)"}}>
            <div style={{display:"flex"}}>
              <div style={{width:90,background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:"20px 10px"}}><div style={{fontSize:36}}>🎁</div></div>
              <div style={{flex:1,padding:"16px 14px"}}>
                <div style={{fontFamily:FN,fontSize:16,fontWeight:700,color:C.text}}>Claim and Redeem Benefits</div>
                <div style={{fontSize:12,color:C.sub,marginTop:6,lineHeight:1.5}}>Claiming your redeemed benefits will save you more</div>
                <div onClick={()=>{const el=document.getElementById("opt-claim");if(el){const sc=el.closest("[data-scroll]");if(sc)sc.scrollTo({top:el.offsetTop-sc.offsetTop-20,behavior:"smooth"});else el.scrollIntoView({behavior:"smooth"})};}} style={{display:"inline-flex",marginTop:12,padding:"8px 18px",borderRadius:8,background:"transparent",border:"1.5px solid #94a3b8",cursor:"pointer"}}><span style={{fontSize:12,fontWeight:600,color:C.text}}>Know more ▾</span></div>
              </div>
            </div>
          </div>

          <ThkDiv/>
          <div id="opt-upgrade" style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontFamily:FN,fontSize:24,fontWeight:700,color:C.text}}>Upgrade your Cards</div>
            <div style={{fontSize:13,color:C.sub,marginTop:10,lineHeight:1.5}}>You have <span style={{fontWeight:700,color:C.text}}>1 card</span> that is not suitable for your spends</div>
          </div>

          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28}}>
            <div style={{width:140,height:195,borderRadius:18,background:"linear-gradient(145deg,"+CARDS[0].color+","+CARDS[0].accent+")",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 12px 32px rgba(0,0,0,0.2)",position:"relative",transform:"rotate(-3deg)"}}>
              <CreditCard size={36} strokeWidth={1.5} color="rgba(255,255,255,0.4)"/>
              <div style={{position:"absolute",bottom:16,left:16,right:16}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:2}}>••••  ••••  ••••</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:700,marginTop:4}}>7891</div>
              </div>
            </div>
            <div style={{fontSize:15,fontWeight:700,textTransform:"uppercase",marginTop:16,color:C.text}}>{CARDS[0].name}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>XXXX 7891</div>
            <div onClick={()=>setScreen("bestcards")} style={{marginTop:14,padding:"12px 32px",borderRadius:10,background:"#111827",cursor:"pointer"}}><span style={{fontSize:13,fontWeight:700,color:"#fff"}}>Find a replacement</span></div>
          </div>

          <div style={{marginTop:24,marginBottom:28}}>
            <div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",textAlign:"center",marginBottom:28}}>· Comparison of your annual savings ·</div>
            {SAVINGS_COMP.map((card,i)=>(<div key={i}>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0"}}>
                <div style={{width:56,height:36,borderRadius:6,background:card.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,fontWeight:700,color:"#fff"}}>{card.name.split(" ").map(w=>w[0]).join("").slice(0,3)}</span></div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:11,fontWeight:700,color:card.clsColor,letterSpacing:0.5,textTransform:"uppercase"}}>{card.cls}</span>
                    {i===0&&<span style={{fontSize:10,fontWeight:700,color:C.blue,background:C.blueBg,padding:"2px 6px",borderRadius:3}}>OUR PICK</span>}
                  </div>
                  <div style={{height:14,borderRadius:6,background:"#e9ecef",overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${card.barPct}%`,borderRadius:6,background:card.barColor}}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{card.name}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13,fontWeight:700,color:C.text}}>₹{f(card.savings)}</span><div onClick={()=>setInfoSheet({title:card.name+" — Savings Breakdown",desc:`Annual savings: ₹${f(card.savings)}\n\n${card.cls==="Best Card For You"?"This card maximises your rewards across all your spending categories. Based on 365 days of transaction data, it outperforms every other card in your wallet.":"Based on your spending patterns over 365 days, "+card.name+" would earn you ₹"+f(card.savings)+" annually. "+("The best card could save you ₹"+f(SAVINGS_COMP[0].savings)+" — that's ₹"+f(SAVINGS_COMP[0].savings-card.savings)+" more per year.")}`})} style={{width:16,height:16,borderRadius:"50%",border:`1px solid ${C.brd}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Info size={10} strokeWidth={2} color={C.blue}/></div></div>
                  </div>
                </div>
              </div>
              {i<SAVINGS_COMP.length-1&&<div style={{borderBottom:"1.5px dotted #d1d5db",margin:"0 0 0 70px"}}/>}
            </div>))}
          </div>

          <div style={{padding:"20px 22px",borderRadius:16,background:"#fffbeb",border:"1px solid #fde68a",marginTop:4,marginBottom:28}}>
            <div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Expert Advice</div>
            <div style={{fontSize:14,fontWeight:600,color:C.text,lineHeight:1.6}}>{CARDS[0].name} saves you <span style={{color:"#b45309",fontWeight:700}}>₹1,30,000 less</span> than the best card out there. We suggest you replace this card with a better card</div>
            <div onClick={()=>setScreen("bestcards")} style={{marginTop:14,fontSize:12,fontWeight:700,color:"#92400e",cursor:"pointer"}}><div onClick={()=>setScreen("bestcards")} style={{marginTop:14,fontSize:12,fontWeight:700,color:"#92400e",cursor:"pointer"}}>Find a better card for me {'>'}</div></div>
          </div>

          <ThkDiv/>
          <div id="opt-usage" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontFamily:FN,fontSize:24,fontWeight:700,color:C.text}}>Optimize your Card Usage</div>
            <div style={{fontSize:13,color:C.sub,marginTop:8}}>Here's a comparison of your savings</div>
          </div>

          <div style={{padding:"22px",background:C.white,borderRadius:20,border:"1px solid rgba(0,0,0,0.05)",margin:"20px 0 4px",boxShadow:"0 4px 20px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"center",gap:28,alignItems:"flex-end"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{fontSize:10,color:C.sub,fontWeight:600,marginBottom:4}}>On Current Usage</div>
                <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:6}}>₹50,000</div>
                <div style={{width:80,height:90,borderRadius:10,background:"linear-gradient(to top,#16a34a,#22c55e)"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:4}}>If used optimally</div>
                <div style={{fontSize:17,fontWeight:700,color:C.green,marginBottom:6}}>₹80,000</div>
                <div style={{width:80,height:135,borderRadius:10,background:"linear-gradient(to top,#dcfce7,#86efac)",border:"1.5px dashed #4ade80"}}/>
              </div>
            </div>
          </div>

          <DotDiv label="Here's how to manage your card spends"/>
          <div style={{display:"flex",borderRadius:10,background:C.white,border:"1px solid rgba(0,0,0,0.05)",padding:3,marginBottom:20}}>{["Brands","Categories"].map(t=>(<div key={t} onClick={()=>{setOptTab(t);setOptExpanded(0);}} style={{flex:1,textAlign:"center",padding:"9px 0",borderRadius:8,cursor:"pointer",background:optTab===t?C.blue:"transparent",color:optTab===t?"#fff":C.sub,fontSize:12,fontWeight:700}}>{t}</div>))}</div>

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {optData.map((item,idx)=>{const isOpen=optExpanded===idx;const bestClr=({"HSBC Travel One":["#0c2340","#1a5276"],"Axis Flipkart":["#5b2c8e","#8b5cf6"],"HSBC Live+":["#006d5b","#00a086"]})[item.bestCard]||["#333","#555"];return(
            <div key={item.name+optTab} style={{background:C.white,borderRadius:16,border:"1px solid rgba(0,0,0,0.05)",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>
              <div onClick={()=>setOptExpanded(isOpen?null:idx)} style={{display:"flex",alignItems:"center",gap:12,padding:"18px 22px",cursor:"pointer"}}>
                <div style={{width:38,height:38,borderRadius:12,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,position:"relative"}}>{item.icon}{item.bestSaved>2000&&<div style={{position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:C.orange,border:"2px solid "+C.white}}/>}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{item.name}</div>
                  {optTab==="Brands"&&item.cat&&<div style={{fontSize:10,color:C.dim,marginTop:1}}>{item.cat}</div>}
                </div>
                {!isOpen&&<div style={{padding:"4px 10px",borderRadius:6,background:C.greenBg,border:"1px solid "+C.greenBrd,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.green,letterSpacing:0.3,textTransform:"uppercase"}}>Could Save</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.green}}>₹{f(item.bestSaved)}</div>
                </div>}
                <ChevronDown size={16} strokeWidth={1.5} color={C.dim} style={{transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0}}/>
              </div>
              {isOpen&&<div>
                <div style={{display:"flex",borderTop:"1px solid "+C.brd,borderBottom:"1px solid "+C.brd}}>
                  <div style={{flex:1,padding:"10px 0",textAlign:"center",borderRight:"1px solid "+C.brd}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.5,textTransform:"uppercase"}}>Spent</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text,marginTop:2}}>₹{f(item.totalSpend)}</div>
                  </div>
                  <div style={{flex:1,padding:"10px 0",textAlign:"center",borderRight:"1px solid "+C.brd}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.5,textTransform:"uppercase"}}>Saved</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text,marginTop:2}}>₹{f(item.saved||0)}</div>
                  </div>
                  <div style={{flex:1,padding:"10px 0",textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.green,letterSpacing:0.5,textTransform:"uppercase"}}>Could Save</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.green,marginTop:2}}>₹{f(item.bestSaved)}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px"}}>
                  <div style={{width:48,height:30,borderRadius:6,background:"linear-gradient(135deg,"+bestClr[0]+","+bestClr[1]+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}><CreditCard size={12} strokeWidth={1.5} color="rgba(255,255,255,0.5)"/></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:0.3,textTransform:"uppercase"}}>Best Card to Use</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,marginTop:1}}>{item.bestCard}</div>
                  </div>
                  <div onClick={(e)=>{e.stopPropagation();const withHow={...item,howToUse:["Use "+item.bestCard+" for all "+item.name+" purchases to earn "+item.bestRate+"% back","If reward cap is reached, switch to "+item.altCard+" at "+item.altRate+"%"]};setOptSheetFrom("optimize");setOptSheet(withHow);}} style={{padding:"8px 16px",borderRadius:8,background:"#111827",cursor:"pointer",display:"flex",alignItems:"center",gap:4,border:"none"}}>
                    <span style={{fontSize:11,fontWeight:600,color:"#fff"}}>Details</span>
                    <ChevronRight size={12} strokeWidth={1.5} color={C.dim}/>
                  </div>
                </div>
              </div>}
            </div>
          );})}
          </div>

          <div style={{marginTop:28,padding:"22px",borderRadius:16,background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid "+C.blueBrd,boxShadow:"0 2px 8px rgba(29,78,216,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#bfdbfe,#93c5fd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>🧮</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.4}}>Use Savings Finder the next time you pay</div>
                <div style={{fontSize:11,color:C.sub,marginTop:4}}>and never miss out on rewards</div>
                <div onClick={()=>{setScreen("calc");setSelBrand(null);setCalcAmt("");setCalcResult(null);setSearchQ("");}} style={{display:"inline-flex",marginTop:10,padding:"8px 18px",borderRadius:8,background:"#111827",cursor:"pointer"}}><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>Try now ›</span></div>
              </div>
            </div>
          </div>

          <ThkDiv/>
          <div id="opt-claim" style={{textAlign:"center",marginBottom:28}}><div style={{fontFamily:FN,fontSize:24,fontWeight:700,color:C.text}}>Claim and Redeem Benefits</div>
          {hasGmail&&<div style={{fontSize:13,color:C.sub,marginTop:8}}>You have <span style={{fontWeight:700,color:C.text}}>3 benefits</span> to claim and <span style={{fontWeight:700,color:C.text}}>2 expiring</span> benefits</div>}</div>
          {hasGmail?<div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[
              {Ic:Clock,title:"4,820 points expiring soon",desc:"Spend ₹6,500 more on SBI SimplyCLICK",badge:"In 6 Days",cta:"Redeem ›"},
              {Ic:Gift,title:"₹1,500 welcome voucher unclaimed",desc:"Voucher on your Axis Flipkart card",badge:"In 15 Days",cta:"Redeem ›"},
              {Ic:CreditCard,title:"Waive your annual fee",desc:"Spend ₹6,500 more on SBI SimplyCLICK",badge:"In 18 Days",cta:"Track progress ›"},
              {Ic:Star,title:"1 transaction to unlock lounge access",desc:"Spend ₹4,200 more on HDFC Regalia",badge:"In 24 Days",cta:"Track progress ›"},
              {Ic:Star,title:"Unlock a free flight voucher",desc:"Spend ₹4,200 more on HDFC Regalia",badge:"In 24 Days",cta:"Track progress ›"},
            ].map((a,i)=>(<ActionCard key={i} a={a} onCta={()=>{}}/>))}
          </div>:<LockedSection title="Unlock your rewards" desc="Connect Gmail to track your points and claimed benefits"/>}
        </div>
        <InfoBS/><TxnSheet/><ActSheet/>
      </div>
    </div>
  </div>);
};
