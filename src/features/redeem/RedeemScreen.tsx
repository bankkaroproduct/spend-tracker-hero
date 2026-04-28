// @ts-nocheck
import { useState, useEffect } from "react";
import { CreditCard, ChevronDown, ChevronRight, Plane, Home, ShoppingBag, UtensilsCrossed, CircleDollarSign, HandCoins } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { NavBar } from "@/components/shared/NavBar";
import { CARDS, REDEEM_DATA, MARKET_REDEEM_CARDS } from "@/data/simulation/legacy";

import { useAppContext } from "@/store/AppContext";
import { Toast, InfoBS, TxnSheet, ActSheet, GmailNudgePopup, GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CatBS, FilterSheet } from "@/components/sheets/BottomSheets";

const MARKET_CARDS = MARKET_REDEEM_CARDS;

const cardClrs = {
  "HSBC Travel One": ["#0c2340", "#1a5276"],
  "Axis Flipkart": ["#5b2c8e", "#8b5cf6"],
  "HSBC Live+": ["#006d5b", "#00a086"],
  "HDFC Infinia": ["#1a1a2e", "#333"],
  "Amex MRCC": ["#006fcf", "#4a9ee5"],
  "HDFC Regalia": ["#1a2744", "#3b5998"],
  "SBI Elite": ["#0a4c8c", "#3b82f6"],
};

const CARD_IMG_MAP = {
  "HSBC Travel One": "/legacy-assets/cards/hsbc-travel-one.png",
  "Axis Flipkart": "/legacy-assets/cards/axis-flipkart.png",
  "HSBC Live+": "/legacy-assets/cards/hsbc-live.png",
  "HDFC Infinia": "/legacy-assets/cards/hdfc-infinia.png",
  "Amex Travel Platinum": "/legacy-assets/cards/amex-platinum-travel.png",
  "ICICI Emeralde": "/legacy-assets/cards/icici-emeralde.png",
  "AU Zenith Plus": "/legacy-assets/cards/AU-Zenith.png",
  "SBI Miles": "/legacy-assets/cards/sbi-miles.png",
};

const isCashbackOnly = (nm) => nm === "Axis Flipkart" || nm === "HSBC Live+";

export const RedeemScreen = () => {
  const {
    hasGmail, setHasGmail, setShowGmailNudgeSheet, setScreen,
    redeemCard, setRedeemCard,
    redeemPts, setRedeemPts,
    redeemPref, setRedeemPref,
    redeemResult, setRedeemResult,
    redeemTab, setRedeemTab,
    howExpanded, setHowExpanded,
  } = useAppContext();

  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("result") === "1" && !redeemResult) {
      if (!hasGmail) setHasGmail(true);
      setRedeemResult({ card: "HDFC Infinia", pts: 7000, options: [] });
      setRedeemTab("Air Miles");
    }
  }, []);

  // Gmail-not-connected state
  if (!hasGmail) {
    return (<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative",background:C.bg}}><div data-scroll="1" style={{flex:1,overflowY:"auto",paddingBottom:100}}><FL/>
      <div style={{background:"linear-gradient(180deg, #2F117B -15.07%, #432054 112.18%)",padding:"56px 24px 36px",color:"#fff"}}>
        <div onClick={()=>setScreen("home")} style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,marginBottom:20}}>←</div>
        <div style={{fontFamily:"var(--legacy-serif), Georgia, serif",fontSize:22,fontWeight:700,lineHeight:1.3}}>Redemption Finder</div>
      </div>
      <div style={{padding:"60px 24px 40px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        <div style={{width:84,height:84,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,border:`1px solid ${C.brd}`}}><HandCoins size={36} strokeWidth={1.5} color={C.dim}/></div>
        <div style={{fontSize:22,fontWeight:700,color:C.text,marginBottom:14}}>Your points balance is unknown</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.6,marginBottom:28,maxWidth:300}}>Connect Gmail to see your actual reward balance and find the best redemption options.</div>
        <div onClick={()=>setShowGmailNudgeSheet(true)} style={{width:"100%",maxWidth:300,padding:"15px",borderRadius:16,background:"#1a2233",color:"#fff",textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer"}}>Connect Gmail</div>
      </div>
    </div><div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",padding:"12px 0 5vw",pointerEvents:"none",zIndex:50}}><div style={{pointerEvents:"auto"}}><NavBar/></div></div><TxnSheet/><ActSheet/><CatBS/><FilterSheet/><GmailNudgePopup/><GmailNudgeSheet/><RetroOverlay/><VoiceFlowOverlay/><Toast/></div>);
  }

  const rd = redeemCard ? REDEEM_DATA[redeemCard.name] : null;
  const pts = parseInt(String(redeemPts).replace(/[^\d]/g, "")) || 0;
  const bestOpt = rd ? [...rd.options].sort((a, b) => b.rate - a.rate)[0] : null;
  const liveValue = rd && pts > 0 ? `₹${f(Math.round(pts * bestOpt.rate))}` : "";

  /* Redeem Bottom Sheet */
  const sheetCardImg = redeemCard ? (CARD_IMG_MAP[redeemCard.name] || null) : null;
  const RedeemBS = () => redeemCard && !redeemResult && (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,padding:"0",touchAction:"none",overscrollBehavior:"none"}} onClick={e=>{if(e.target===e.currentTarget){setRedeemCard(null);setRedeemPts("");setRedeemPref(null);}}} onTouchMove={e=>e.preventDefault()}>
    <div style={{background:"linear-gradient(360deg, #FFFFFF 87.42%, #EEEEEE 100%)",borderTopLeftRadius:24,borderTopRightRadius:24,padding:"12px 22px 36px",width:360,maxWidth:"100%",maxHeight:"85vh",boxShadow:"0 -10px 40px rgba(0,0,0,0.15)",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()}><div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 20px"}}/>
      <div style={{display:"flex",alignItems:"center",gap:16,paddingBottom:20,borderBottom:"1.5px dashed #e5e7eb"}}>
        {sheetCardImg ? (
          <img src={sheetCardImg} alt={redeemCard.name} style={{width:64,height:44,borderRadius:8,objectFit:"cover",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}} />
        ) : (
          <div style={{width:64,height:44,borderRadius:8,background:`linear-gradient(135deg,${(cardClrs[redeemCard.name]||["#333","#555"])[0]},${(cardClrs[redeemCard.name]||["#333","#555"])[1]})`,flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}} />
        )}
        <div><div style={{fontSize:16,fontWeight:700,color:C.text}}>{redeemCard.name} Credit Card</div>{redeemCard.isMarket?<div style={{fontSize:11,fontWeight:700,color:C.blue,marginTop:4}}>BEST RATE: {redeemCard.bestRate||"varies"}</div>:<div style={{fontSize:11,fontWeight:700,color:"#1F8A3A",marginTop:4,letterSpacing:0.5}}>{f(redeemCard.availPts||3200)} POINTS AVAILABLE</div>}</div>
      </div>
      <div style={{marginTop:28}}>
        <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:22}}>Enter the amount of points you want to redeem</div>
        <div style={{padding:"18px 16px",background:C.bg,borderRadius:16,border:"1.5px solid "+(redeemPts?C.blue:C.brd),marginBottom:22}}>
          <input type="text" inputMode="numeric" placeholder="" value={redeemPts} onChange={e=>{const n=e.target.value.replace(/[^\d]/g,"");setRedeemPts(n?parseInt(n).toLocaleString("en-IN"):"");}} autoFocus style={{border:"none",background:"none",outline:"none",fontSize:20,fontWeight:700,color:C.text,fontFamily:FN,width:"100%"}}/>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:28}}>{["1,000","5,000","10,000","20,000"].map(a=>{const isActive=redeemPts===a;const isDisabled=pts>0&&!isActive;return(<button key={a} onClick={()=>{if(!isDisabled)setRedeemPts(a);}} style={{flex:1,padding:10,background:isActive?C.blueBg:C.bg,border:"1.5px solid "+(isActive?C.blueBrd:C.brd),borderRadius:10,fontSize:11,fontWeight:600,color:isActive?C.blue:isDisabled?"#d1d5db":C.sub,cursor:isDisabled?"default":"pointer",fontFamily:FN,opacity:isDisabled?0.5:1}}>₹{a}</button>);})}</div>
        <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:20}}>Redemption preference <span style={{fontWeight:400,color:C.dim}}>(optional)</span></div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:28}}>
          {[{l:"Flights",v:"Flights",Ic:Plane},{l:"Hotels",v:"Hotels",Ic:Home},{l:"Shopping",v:"Shopping",Ic:ShoppingBag},{l:"Dining",v:"Dining",Ic:UtensilsCrossed},{l:"Cashback",v:"Cashback",Ic:CircleDollarSign}].map(p=>(<div key={p.v} onClick={()=>setRedeemPref(redeemPref===p.v?null:p.v)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",borderRadius:20,background:redeemPref===p.v?"#111827":C.white,color:redeemPref===p.v?"#fff":C.sub,fontSize:12,fontWeight:600,border:"1.5px solid "+(redeemPref===p.v?"#111827":C.brd),cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}><p.Ic size={14} strokeWidth={1.5} color={redeemPref===p.v?"#fff":C.dim}/>{p.l}</div>))}
        </div>
        <button onClick={()=>{if(pts<1)return;const opts=[...REDEEM_DATA[redeemCard.name].options].sort((a,b)=>{if(redeemPref){const am=a.method===redeemPref?1:0,bm=b.method===redeemPref?1:0;if(am!==bm)return bm-am;}if(a.recommended!==b.recommended)return(b.recommended?1:0)-(a.recommended?1:0);return b.rate-a.rate;});setRedeemResult({card:redeemCard.name,pts,options:opts});setRedeemTab(opts[0]?.method||"Flights");setHowExpanded(null);}} disabled={pts<1} style={{width:"100%",padding:18,background:pts>0?"linear-gradient(90deg, #222941 0%, #101C43 100%)":"#d1d5db",color:"#fff",border:"none",borderRadius:16,fontSize:15,fontWeight:700,cursor:pts>0?"pointer":"not-allowed",fontFamily:FN}}>Find best redemption options  ›</button>
      </div>
    </div>
  </div>);

  if (redeemResult) {
    const bestVal = Math.round(redeemResult.pts * 1);
    const ratePerPt = 1;
    const bestPartner = "Cathay Pacific";
    const cardDisplay = redeemResult.card;
    const tabOptions = {
      "Air Miles": [
        { partner: "Emirates Skywards", rate: 0.67 },
        { partner: "Qatar Airways Privilege Club", rate: 0.6 },
        { partner: "Etihad Airways - Guest", rate: 0.57 },
        { partner: "British Airways - Avios", rate: 0.55 },
      ],
      "Hotels": [
        { partner: "Marriott Bonvoy", rate: 0.55 },
        { partner: "Hilton Honors", rate: 0.5 },
        { partner: "IHG One Rewards", rate: 0.48 },
        { partner: "Accor Live Limitless", rate: 0.42 },
      ],
      "Vouchers": [
        { partner: "Amazon Voucher", rate: 0.5 },
        { partner: "Flipkart Voucher", rate: 0.45 },
        { partner: "Myntra Voucher", rate: 0.4 },
        { partner: "BookMyShow Voucher", rate: 0.35 },
      ],
    };
    const tabLabels = ["Air Miles", "Hotels", "Vouchers"];
    const colHeaders = { "Air Miles": "AIRLINE", "Hotels": "HOTEL", "Vouchers": "PARTNER" };
    const activeTab = tabLabels.includes(redeemTab) ? redeemTab : "Air Miles";
    const activeRows = tabOptions[activeTab];
    const stepsArr = ["Login to the HDFC Smartbuy Portal", "Select Merchant (Cathay Pacific)", "Select your Routes", "Pay with Infinia Points"];

    return (<div key="redeem-result" className="slide-in" style={{fontFamily:FN,maxWidth:400,margin:"0 auto",background:"#f5f9fa",minHeight:"100vh"}}><FL/>
      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(180deg, #2F117B -15.07%, #432054 112.18%)",padding:"0 0 100px",color:"#fff",position:"relative"}}>
        <div style={{height:32,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 28px 0",fontFamily:"-apple-system, system-ui",fontSize:15,fontWeight:700}}>
          <span>9:41</span>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></g></svg>
            <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#fff"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z"/><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z"/><circle cx="8" cy="10" r="1.2"/></g></svg>
          </div>
        </div>
        <div style={{padding:"2px 20px 0"}}>
          <div onClick={()=>setRedeemResult(null)} className="legacy-tap" style={{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:6}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </div>
          <div style={{fontFamily:"var(--legacy-serif), Georgia, serif",fontSize:22,lineHeight:"134%",fontWeight:700,letterSpacing:"-0.01em",textAlign:"center",padding:"0 20px"}}>Here's the highest conversion value for your reward points</div>
          <div style={{display:"flex",justifyContent:"center",marginTop:14}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:16,padding:"8px",borderRadius:8,background:"rgba(0,0,0,0.1)",backdropFilter:"blur(12.5px)",WebkitBackdropFilter:"blur(12.5px)",fontSize:9.28,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,0.6)"}}>
              <div style={{display:"flex",alignItems:"center",gap:1.55,opacity:0.4}}><div style={{width:26.58,height:0,borderBottom:"0.62px solid",borderImage:"linear-gradient(90deg,#848CA0,rgba(48,51,58,0)) 1"}}/><div style={{width:3.09,height:3.09,background:"rgba(255,255,255,0.6)",transform:"rotate(45deg)"}}/></div>
              <span>For your {cardDisplay}</span>
              <div style={{display:"flex",alignItems:"center",gap:1.55,opacity:0.4}}><div style={{width:3.09,height:3.09,background:"rgba(255,255,255,0.6)",transform:"rotate(45deg)"}}/><div style={{width:26.58,height:0,borderBottom:"0.62px solid",borderImage:"linear-gradient(270deg,#848CA0,rgba(48,51,58,0)) 1"}}/></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ORB + CARD ── */}
      <div style={{padding:"0 16px 28px",marginTop:-100,position:"relative"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:-41,position:"relative",zIndex:2}}>
          <img src="/legacy-assets/Frame 1991634521.png" alt="" style={{width:82,height:82,objectFit:"contain",filter:"drop-shadow(0 8px 24px rgba(174,60,255,0.35))"}}/>
        </div>
        <div style={{background:"#fff",border:"1px solid #E8F0F1",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",paddingTop:52,position:"relative",overflow:"hidden"}}>
          <div style={{textAlign:"center",padding:"0 20px"}}>
            <div style={{fontSize:32,fontWeight:700,color:"#09A93B",letterSpacing:"0.01em"}}>₹{f(bestVal)}</div>
            <div style={{display:"inline-flex",marginTop:12,padding:"6px 12px",borderRadius:4,background:"linear-gradient(90deg, rgba(224,249,237,0.8) 0%, rgba(224,249,237,0.8) 100%)"}}>
              <span style={{fontSize:9,fontWeight:700,color:"#09A93B",letterSpacing:"0.1em",textTransform:"uppercase"}}>1 Reward point = ₹{ratePerPt}</span>
            </div>
            <div style={{fontSize:14,color:"#4A5370",marginTop:10,paddingBottom:20,fontWeight:500,letterSpacing:"-0.01em"}}>Via {bestPartner}</div>
          </div>
          <div style={{background:"#F0F9FF",padding:"14px 18px 16px",borderTop:"1px solid #E0F2FE",borderRadius:"0 0 12px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:500,color:"rgba(74,83,112,0.8)",letterSpacing:"-0.01em",lineHeight:"140%"}}>Adjust Points</span>
              <span style={{fontSize:12,fontWeight:600,color:"#4A5370",letterSpacing:"-0.01em",lineHeight:"140%"}}>{f(redeemResult.pts)}</span>
            </div>
            <style>{`
.redeem-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;background:linear-gradient(to right,#0064E0 var(--pct),#C5E7FE var(--pct));border-radius:90px;outline:none;cursor:pointer}
.redeem-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#0064E0;border:2px solid #fff;box-shadow:0 3px 3px rgba(0,0,0,0.25);cursor:pointer}
.redeem-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#0064E0;border:2px solid #fff;box-shadow:0 3px 3px rgba(0,0,0,0.25);cursor:pointer}
            `}</style>
            <input className="redeem-slider" type="range" min={100} max={20000} step={100} value={redeemResult.pts} onChange={e=>{const v=parseInt(e.target.value);setRedeemResult({...redeemResult,pts:v});}} style={{"--pct":`${((redeemResult.pts-100)/19900)*100}%`} as any}/>
          </div>
        </div>

        {/* ── HOW TO REDEEM ── */}
        <div onClick={()=>setHowExpanded(howExpanded==="redeem-how"?null:"redeem-how")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",background:"#fff",borderRadius:howExpanded==="redeem-how"?"8px 8px 0 0":8,border:"1.32px solid #DFE7FF",cursor:"pointer",marginTop:16}}>
          <span style={{fontFamily:"var(--legacy-serif), Georgia, serif",fontSize:16,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>How to redeem</span>
          <ChevronDown size={18} strokeWidth={1.8} color="#7f8a9f" style={{transform:howExpanded==="redeem-how"?"rotate(180deg)":"none",transition:"transform 0.2s"}}/>
        </div>
        {howExpanded==="redeem-how"&&<div style={{background:"#fff",borderRadius:"0 0 8px 8px",border:"1.32px solid #DFE7FF",borderTop:"none",padding:"12px 12px 16px 16px"}}>
          <style>{`
@keyframes htrIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes htrPop{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes htrLine{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes htrGlow{0%,100%{filter:drop-shadow(0 0 0px rgba(163,230,235,0))}50%{filter:drop-shadow(0 0 6px rgba(163,230,235,0.5))}}
@keyframes htrNum{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
          `}</style>
          {stepsArr.map((step,si)=>(<div key={si} style={{display:"flex",gap:9,alignItems:"flex-start",animation:`htrIn 0.45s ease-out ${si*0.13}s both`}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,width:42}}>
              <div style={{width:42,height:42,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src="/ui/progress-indicator.png" alt="" style={{width:42,height:42,position:"absolute",top:0,left:0,animation:`htrPop 0.6s ease-out ${si*0.15}s both, htrGlow 2.5s ease-in-out ${1+si*0.5}s infinite`}}/>
                <span style={{position:"relative",zIndex:1,fontSize:12,fontWeight:500,color:"#4A5370",animation:`htrNum 0.4s ease-out ${0.2+si*0.15}s both`}}>{si+1}</span>
              </div>
              {si<stepsArr.length-1&&<div style={{width:2,height:22,background:"#DEECF5",borderRadius:90,transformOrigin:"top",animation:`htrLine 0.35s ease-out ${0.35+si*0.15}s both`}}/>}
            </div>
            <div style={{flex:1,paddingTop:10,paddingBottom:si<stepsArr.length-1?12:0}}>
              <div style={{fontSize:14,fontWeight:500,color:"#4A5370",letterSpacing:"-0.01em",lineHeight:"140%"}}>{step}</div>
            </div>
          </div>))}
        </div>}

        {/* ── OTHER REDEMPTION OPTIONS ── */}
        <div style={{marginTop:28}}>
          <div style={{display:"flex",alignItems:"center",gap:8,margin:"0 20px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:1.55,flex:1,opacity:0.4}}><div style={{flex:1,height:0,borderBottom:"0.62px solid",borderImage:"linear-gradient(90deg,#848CA0,rgba(48,51,58,0)) 1"}}/><div style={{width:3.09,height:3.09,background:"#848CA0",transform:"rotate(45deg)",flexShrink:0}}/></div>
            <span style={{fontSize:9.28,fontWeight:600,color:"#848CA0",letterSpacing:"0.2em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Other redemption options</span>
            <div style={{display:"flex",alignItems:"center",gap:1.55,flex:1,opacity:0.4}}><div style={{width:3.09,height:3.09,background:"#848CA0",transform:"rotate(45deg)",flexShrink:0}}/><div style={{flex:1,height:0,borderBottom:"0.62px solid",borderImage:"linear-gradient(270deg,#848CA0,rgba(48,51,58,0)) 1"}}/></div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",alignItems:"flex-start",padding:2,background:"rgba(6,60,109,0.03)",boxShadow:"0px 1px 0px rgba(255,255,255,0.25), inset 0px 1px 2px rgba(6,60,109,0.15)",borderRadius:8,marginBottom:12}}>
            {tabLabels.map(tab=>{
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={()=>setRedeemTab(tab)} style={{flex:1,padding:"8px 0",cursor:"pointer",border:"none",fontSize:12,fontWeight:isActive?500:400,color:isActive?"rgba(74,83,112,0.9)":"rgba(74,83,112,0.7)",textAlign:"center",borderRadius:isActive?6:21,background:isActive?"#F4F8FF":"transparent",boxShadow:isActive?"0.44px 0.44px 0.63px -0.75px rgba(0,0,0,0.26), 1.21px 1.21px 1.71px -1.5px rgba(0,0,0,0.25), 2.66px 2.66px 3.76px -2.25px rgba(0,0,0,0.23), 10px 10px 21.21px -3.75px rgba(0,0,0,0.055), inset 1px 1px 1px #FFFFFF, inset -1px -1px 0px rgba(0,0,0,0.1)":"none",fontFamily:FN,transition:"all 0.2s",letterSpacing:"-0.01em",lineHeight:"140%"}}>
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div style={{background:"#fff",borderRadius:10,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            <div style={{display:"flex",padding:"12px 14px",background:"#F4F9FB",borderBottom:"1px solid rgba(226,239,252,0.3)"}}>
              <span style={{flex:1,fontSize:8,fontWeight:600,color:"#848CA0",letterSpacing:"0.1em",textTransform:"uppercase"}}>{colHeaders[activeTab]}</span>
              <span style={{width:62,fontSize:8,fontWeight:600,color:"#848CA0",textAlign:"center",letterSpacing:"0.1em",textTransform:"uppercase"}}>Rate</span>
              <span style={{width:56,fontSize:8,fontWeight:600,color:"#848CA0",textAlign:"center",letterSpacing:"0.1em",textTransform:"uppercase"}}>Your Value</span>
              <span style={{width:20}}/>
            </div>
            {activeRows.map((o,i)=>{
              const val = Math.round(redeemResult.pts * o.rate);
              const isExp = howExpanded === ("t"+i);
              return (<div key={i}>
                <div onClick={()=>setHowExpanded(isExp?null:"t"+i)} style={{display:"flex",alignItems:"center",padding:"14px 14px",cursor:"pointer",borderTop:i>0?"1px dashed rgba(226,239,252,0.4)":"none"}}>
                  <span style={{flex:1,fontSize:12,fontWeight:500,color:"#4A5370",lineHeight:"140%",letterSpacing:"-0.01em",paddingRight:8}}>{o.partner}</span>
                  <span style={{width:62,fontSize:12,fontWeight:500,color:"#4A5370",textAlign:"center",letterSpacing:"-0.01em"}}>₹{o.rate}</span>
                  <span style={{width:56,fontSize:12,fontWeight:500,color:"#4A5370",textAlign:"center",letterSpacing:"-0.01em"}}>₹{f(val)}</span>
                  <div style={{width:20,display:"flex",justifyContent:"flex-end"}}>
                    <ChevronDown size={16} strokeWidth={1.8} color="#7f8a9f" style={{transform:isExp?"rotate(180deg)":"none",transition:"transform 0.2s"}}/>
                  </div>
                </div>
                {isExp&&<div style={{padding:"0 16px 14px"}}><div style={{padding:"10px 12px",background:"#F5F9FA",borderRadius:8,fontSize:12,color:"#54658d",lineHeight:1.6}}>Transfer your points to {o.partner} via the card's rewards portal. Transfers typically complete in 3-5 business days.</div></div>}
              </div>);
            })}
          </div>
        </div>

        {redeemCard&&redeemCard.isMarket&&<div onClick={()=>setScreen("bestcards")} className="legacy-tap" style={{marginTop:24,padding:"16px",borderRadius:10,background:"linear-gradient(90deg, #222941 0%, #101C43 100%)",textAlign:"center",cursor:"pointer",boxShadow:"0.99px 0.99px 1.41px -0.84px rgba(0,0,0,0.23), 0.45px 0.45px 0.64px -0.56px rgba(0,0,0,0.25)"}}><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Interested? Apply now ›</div></div>}
      </div>
    </div>);
  }

  const CardRow = ({ c, isMarket }: { c: any; isMarket?: boolean }) => {
    const imgSrc = CARD_IMG_MAP[c.name] || (c.img ? `/legacy-assets/cards/${c.img}` : null);
    const isCashback = !isMarket && isCashbackOnly(c.name);
    const subtitle = isMarket
      ? `BEST RATE · ${c.bestRate || "₹0.50/PT"}`
      : isCashback
        ? "CASHBACK AUTOCREDITED"
        : `${f(c.availPts || 0)} POINTS AVAILABLE`;
    const subtitleColor = isMarket ? "#7f8a9f" : isCashback ? "#804009" : "#098039";
    const rowOpacity = isCashback ? 0.6 : 1;

    return (
      <div onClick={() => {
        if (isMarket) { setRedeemCard({ ...c, isMarket: true }); } else if (!isCashback) { setRedeemCard(c); }
        if (!isCashback) { setRedeemPts(""); setRedeemResult(null); setRedeemPref(null); }
      }} style={{
        width: 328, maxWidth: "100%", height: 87, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 12px", boxSizing: "border-box",
        background: "#fff", borderRadius: 10,
        border: "1px solid #E8F0F1",
        boxShadow: "0px 2px 8px 0px rgba(0,0,0,0.08)",
        cursor: isCashback ? "default" : "pointer",
        opacity: rowOpacity,
      }}>
        {imgSrc ? (
          <img src={imgSrc} alt={c.name} style={{ width: 60, height: 42, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 60, height: 42, borderRadius: 6, background: `linear-gradient(135deg,${(cardClrs[c.name] || ["#333", "#555"])[0]},${(cardClrs[c.name] || ["#333", "#555"])[1]})`, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#202f61", lineHeight: 1.3 }}>{c.name}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: subtitleColor, marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.2 }}>{subtitle}</div>
        </div>
        <ChevronRight size={16} strokeWidth={2} color="#7f8a9f" style={{ flexShrink: 0 }} />
      </div>
    );
  };

  const allYourCards = CARDS.filter(c => !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()));
  const allOtherCards = MARKET_CARDS.filter(c => !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()));

  return (<div key="redeem" className="slide-in" style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", position: "relative", background: "#f5f9fa" }}>
    <div data-scroll="1" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 100 }}>
      <FL />

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(180deg, #2F117B -15.07%, #432054 112.18%)", color: "#fff", padding: "0 0 28px" }}>
        <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700 }}>
          <span>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></g></svg>
            <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#fff"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z" /><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z" /><circle cx="8" cy="10" r="1.2" /></g></svg>
          </div>
        </div>
        <div style={{ padding: "12px 20px 0", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div className="legacy-tap" onClick={() => setScreen("home")} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginTop: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </div>
          <span style={{ fontFamily: "var(--legacy-serif), Georgia, serif", fontSize: 22, lineHeight: 1.35, fontWeight: 700, letterSpacing: 0, color: "#EAEDF7" }}>Choose a card. We'll find you the best redemption options</span>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div style={{ padding: "16px 16px 0" }}>
        <input type="text" placeholder="Search Card Name" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{
          width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #d7e2ef",
          background: "#fff", fontSize: 14, fontWeight: 500, color: "#202f61",
          fontFamily: FN, outline: "none", boxSizing: "border-box",
        }} />
      </div>

      {/* ── YOUR CARDS ── */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#7f8a9f", letterSpacing: 1.5, textTransform: "uppercase", flexShrink: 0 }}>YOUR CARDS</span>
          <div style={{ flex: 1, height: 0, borderTop: "0.62px solid transparent", backgroundImage: "linear-gradient(90deg, #848CA0, rgba(48,51,58,0))", backgroundOrigin: "border-box", backgroundClip: "border-box" }}>
            <div style={{ width: "100%", height: 0, borderTop: "0.62px solid #848CA0", opacity: 0.5, background: "linear-gradient(90deg, #848CA0, rgba(48,51,58,0))" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {allYourCards.map((c, i) => <CardRow key={i} c={c} />)}
        </div>
      </div>

      {/* ── OTHER CARDS ── */}
      <div style={{ padding: "24px 16px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#7f8a9f", letterSpacing: 1.5, textTransform: "uppercase", flexShrink: 0 }}>OTHER CARDS</span>
          <div style={{ flex: 1, height: 0 }}>
            <div style={{ width: "100%", height: 0, borderTop: "0.62px solid #848CA0", opacity: 0.5, background: "linear-gradient(90deg, #848CA0, rgba(48,51,58,0))" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {allOtherCards.map((c, i) => <CardRow key={i} c={c} isMarket />)}
        </div>
      </div>
    </div>

    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "12px 0 5vw", pointerEvents: "none", zIndex: 50 }}>
      <div style={{ pointerEvents: "auto" }}><NavBar /></div>
    </div>

    <RedeemBS /><InfoBS />
    <TxnSheet /><ActSheet /><CatBS /><FilterSheet />
    <GmailNudgePopup /><GmailNudgeSheet />
    <RetroOverlay /><VoiceFlowOverlay /><Toast />
  </div>);
};
