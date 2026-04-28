// @ts-nocheck
import { ChevronLeft, ChevronRight, ChevronDown, CreditCard, HelpCircle, Sparkles } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { RBar } from "@/components/shared/Primitives";
import { TxnRow } from "@/components/shared/TxnRow";
import { TransactionRow, ActionBar, UnaccountedRow, groupByDate } from "@/features/legacy/LegacyShared";
import { ActionCard } from "@/components/shared/ActionCard";
import { CARDS, SEMI_CARDS, CD, CALC_CARDS, ALL_TXNS, br, ic, tg, BEST_FOR_BRAND } from "@/data/simulation/legacy";
import { getTransactionScenario } from "@/data/simulation/txnScenario";
import { useAppContext } from "@/store/AppContext";
import { NavBar as NavBarShared } from "@/components/shared/NavBar";
import { CardAnalysisFigma } from "./CardAnalysisFigma";
import { Toast, InfoBS, TxnSheet, ActSheet, GmailNudgeBanner, GmailNudgePopup, GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CatBS, FilterSheet } from "@/components/sheets/BottomSheets";
import React, { useState, useRef, useEffect } from "react";

const DTABS=["Card Analysis","Transactions","Benefits","Fees"];

const CAT_ICONS={
  "Shopping":"/categories/shopping.png",
  "Groceries":"/categories/groceries.png",
  "Bills":"/categories/bills.png",
  "Fuel":"/categories/fuel.png",
  "Travel":"/categories/travel.png",
  "Dining":"/categories/dining.png",
  "Food Ordering":"/categories/food.png",
  "Entertainment":"/categories/entertainment.png",
  "Cab Rides":"/categories/cab.png",
  "Flipkart":"/brands/flipkart.png",
  "Amazon":"/brands/amazon.png",
  "Swiggy":"/brands/swiggy.png",
  "Zomato":"/brands/zomato.png",
  "BigBasket":"/brands/bb.png",
  "Myntra":"/brands/myntra.png",
  "Adidas":"/brands/adiddas.png",
  "MuscleBlaze":"/brands/muscle-blaze.png",
};

function CardImg({ src }: { src: string }) {
  const [isPortrait, setIsPortrait] = useState(false);
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onDragStart={(e) => { e.preventDefault(); }}
      onLoad={(e) => {
        const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
        if (nh > nw * 1.15) setIsPortrait(true);
      }}
      style={
        isPortrait
          ? { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-90deg)", width: "100%", height: "auto", minHeight: "140%", objectFit: "cover", userSelect: "none", pointerEvents: "none" }
          : { width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none", pointerEvents: "none" }
      }
    />
  );
}

export function CardDetailScreen(){
  const ctx:any = useAppContext();
  const {
    ci, setCi, setScreen, detailTab, setDetailTab, txnPage, setTxnPage, filters, setFilters, sortBy, setSortBy, setFilterSheet,
    usageCat, setUsageCat, usageMode, chartPage, setChartPage,
    timePeriod, setTimePeriod, timePeriodOpen, setTimePeriodOpen,
    isState1, isState2, getCardDisplayName, getFilteredActions,
    setActSheet, setRedeemCard, setRedeemPts, setRedeemResult, setRedeemPref,
    openCard, setShowGmailNudgeSheet, setShowCardMappingUI, setMappingStep, setMappingSearchQ,
    setOptSheet, setOptSheetFrom, setTxnSheet, setCatSheet, dRef
  } = ctx;
  const NavBar = NavBarShared;

  const carouselRef = useRef<HTMLDivElement>(null);
  const userScrollingRef = useRef(false);
  const scrollSettleTimerRef = useRef<any>(null);
  const actsRailRef = useRef<HTMLDivElement>(null);
  const actsDragRef = useRef<any>({ down: false, startX: 0, startLeft: 0, moved: false });
  const dragRef = useRef<{
    down: boolean;
    startX: number;
    startLeft: number;
    lastX: number;
    lastT: number;
    vx: number;
    raf?: number | null;
  }>({ down: false, startX: 0, startLeft: 0, lastX: 0, lastT: 0, vx: 0, raf: null });

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || userScrollingRef.current) return;
    const target = ci * (270 + 20);
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [ci]);

  const snapCarousel = (el: HTMLDivElement) => {
    const step = 270 + 20;
    const idx = Math.round(el.scrollLeft / step);
    el.scrollTo({ left: idx * step, behavior: "smooth" });
    setTimeout(() => { userScrollingRef.current = false; }, 220);
  };

  const goToCard = (nextIdx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.max(0, Math.min(CARDS.length - 1, nextIdx));
    userScrollingRef.current = true;
    setTxnPage(1);
    el.scrollTo({ left: idx * (270 + 20), behavior: "smooth" });
    setTimeout(() => { userScrollingRef.current = false; }, 260);
  };

  const uc=CARDS[ci];const cd=CD[ci];const sc=SEMI_CARDS[ci];
  const cardArtByIndex=[
    "/legacy-assets/cards/hsbc-travel-one.png",
    "/legacy-assets/cards/axis-flipkart.png",
    "/legacy-assets/cards/hsbc-live.png"
  ];
  const ud=usageCat==="Brands"?cd.brands:cd.categories;
  const su=[...ud].sort((a,b)=>b.saved-a.saved);
  const CARD_VIA={"Axis Flipkart Card":"Axis Flipkart","HSBC Travel One":"HSBC Travel One","HSBC Live+":"HSBC Live+"};
  const cardTxns=ALL_TXNS.filter(t=>t.via&&t.via.includes(uc.name)).map(t=>{
    const cardUsed=CARD_VIA[t.via]||t.via;
    const best=BEST_FOR_BRAND[t.brand];
    if(!best||t.unaccounted)return t;
    const isOptimal=cardUsed===best;
    if(isOptimal)return{...t,tag:"Best card for this brand",tagColor:C.dkGreen,tagBg:"#EAF3DE"};
    const missedAmt=getTransactionScenario(t).walletDelta;
    return{...t,tag:"Use "+best+" — saves ₹"+missedAmt,tagColor:C.orange,tagBg:"#FAEEDA",missed:missedAmt};
  });
  const visibleTxns=cardTxns.slice(0,txnPage*20);

  const TIME_OPTIONS=["Last 30 Days","Last 90 Days","Last 180 Days","Last 365 Days"];

  return(<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative"}}><div data-scroll="1" ref={dRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"#F5F9FA",paddingBottom:100}}><div className="slide-in"><FL/>

  {/* ═══ HEADER + SWIPABLE CAROUSEL ═══
       Background gradient swaps per active card (driven by headerAccent).
       Carousel uses CSS scroll-snap so the next card is half-visible on each
       side; native swipe updates `ci` and the bg colour follows.
       Quality tag + redundant info-bar removed per design. */}
  <div style={{background:`radial-gradient(164.93% 164.93% at 50% -64.93%, ${uc.headerAccent||uc.accent} 0%, #1B1B1B 100%)`,padding:"0 0 18px",transition:"background 0.6s ease",position:"relative",zIndex:1}}>
    {/* iOS status bar — 9:41 left + cellular/wifi/battery right (white over hero) */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 0"}}>
      <span style={{fontFamily:"'SF Pro',sans-serif",fontWeight:700,fontSize:15,lineHeight:"18px",letterSpacing:"-0.02em",color:"#F5F9FA"}}>9:41</span>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0"  y="8" width="3" height="4" rx="0.5" fill="#F5F9FA"/>
          <rect x="5"  y="6" width="3" height="6" rx="0.5" fill="#F5F9FA"/>
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="#F5F9FA"/>
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#F5F9FA"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 10.5l1.7-1.7a2.4 2.4 0 0 0-3.4 0z" fill="#F5F9FA"/>
          <path d="M5 6.5a4.5 4.5 0 0 1 6 0" stroke="#F5F9FA" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
          <path d="M2.5 4a8 8 0 0 1 11 0" stroke="#F5F9FA" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="#F5F9FA" strokeOpacity="0.4"/>
          <rect x="2"   y="2"   width="19" height="8"  rx="1.3" fill="#F5F9FA"/>
          <rect x="23.5" y="4" width="1.5" height="4" rx="0.5" fill="#F5F9FA" fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",padding:"10px 22px 6px"}}>
      <div onClick={()=>setScreen("home")} style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
          <path d="M21 7H1M1 7L7 1M1 7L7 13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
    {/* Title block — bank · CARD NAME · XXXX last4 (Figma 11/700/0.04em + 14/700/0.08em + 11/700/0.04em).
         Card name uses the full marketing string (e.g. "TRAVEL ONE CREDIT CARD") so it matches Figma. */}
    {(()=>{const FULL_NAME:Record<string,string>={
      "HSBC Travel One":"TRAVEL ONE CREDIT CARD",
      "Axis Flipkart":"AXIS FLIPKART CARD",
      "HSBC Live+":"LIVE+ CREDIT CARD",
    };const displayName=(FULL_NAME[uc.name]||uc.name).toUpperCase();return(
    <div style={{textAlign:"center",margin:"14px 0 20px"}}>
      <div style={{fontFamily:FN,fontSize:11,fontWeight:700,letterSpacing:"0.04em",color:"rgba(177,177,177,0.8)",textTransform:"uppercase"}}>{sc.bank.toUpperCase()}</div>
      <div style={{fontFamily:FN,fontSize:14,fontWeight:700,letterSpacing:"0.08em",color:"#FFFFFF",textTransform:"uppercase",marginTop:8,padding:"0 16px"}}>{displayName}</div>
      <div style={{fontFamily:FN,fontSize:11,fontWeight:700,letterSpacing:"0.04em",color:"rgba(177,177,177,0.8)",textTransform:"uppercase",marginTop:8}}>XXXX {uc.last4}</div>
    </div>);})()}
    {/* Swipable carousel — scroll-snap rail, prev/next card half-visible.
         Sits inside the hero with marginBottom: -89 so the bottom half of the
         178-tall card breaks out onto the light page bg. */}
    <div style={{ position: "relative" }}>
    <div
      data-scroll="1"
      ref={carouselRef}
      tabIndex={0}
      role="region"
      aria-label="Card carousel"
      onKeyDown={(e:any)=>{
        if(e.key==="ArrowLeft"){ e.preventDefault(); goToCard(ci-1); }
        if(e.key==="ArrowRight"){ e.preventDefault(); goToCard(ci+1); }
      }}
      onTouchStart={() => { userScrollingRef.current = true; }}
      onTouchEnd={() => { setTimeout(() => { userScrollingRef.current = false; }, 300); }}
      onMouseDown={(e:any)=>{
        const el = e.currentTarget as HTMLDivElement;
        userScrollingRef.current = true;
        dragRef.current.down = true;
        dragRef.current.startX = e.clientX;
        dragRef.current.startLeft = el.scrollLeft;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastT = performance.now();
        dragRef.current.vx = 0;
        try { el.setPointerCapture?.(e.pointerId); } catch(_) {}
      }}
      onMouseMove={(e:any)=>{
        if(!dragRef.current.down) return;
        e.preventDefault();
        const el=e.currentTarget as HTMLDivElement;
        const dx=e.clientX-dragRef.current.startX;
        el.scrollLeft = dragRef.current.startLeft - dx;
        const now = performance.now();
        const dt = Math.max(1, now - dragRef.current.lastT);
        const vx = (e.clientX - dragRef.current.lastX) / dt; // px/ms
        dragRef.current.vx = vx;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastT = now;
      }}
      onMouseUp={(e:any)=>{
        const el = e.currentTarget as HTMLDivElement;
        dragRef.current.down=false;
        // inertia
        const startV = dragRef.current.vx;
        const v0 = -startV * 28; // tune: converts px/ms to px/frame-ish
        const maxThrow = 220;
        const throwPx = Math.max(-maxThrow, Math.min(maxThrow, v0));
        el.scrollLeft += throwPx;
        snapCarousel(el);
        try { el.releasePointerCapture?.(e.pointerId); } catch(_) {}
      }}
      onMouseLeave={(e:any)=>{
        const el = e.currentTarget as HTMLDivElement;
        if(!dragRef.current.down) return;
        dragRef.current.down=false;
        snapCarousel(el);
        try { el.releasePointerCapture?.(e.pointerId); } catch(_) {}
      }}
      onWheel={(e:any)=>{
        const el = e.currentTarget as HTMLDivElement;
        if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){
          e.preventDefault();
          el.scrollLeft += e.deltaY * 0.9;
          // debounce snap
          userScrollingRef.current = true;
          if (dragRef.current.raf) cancelAnimationFrame(dragRef.current.raf as any);
          dragRef.current.raf = requestAnimationFrame(() => snapCarousel(el));
        }
      }}
      onScroll={(e:any)=>{
        const el = e.currentTarget as HTMLDivElement;
        userScrollingRef.current = true;
        if (scrollSettleTimerRef.current) clearTimeout(scrollSettleTimerRef.current);
        scrollSettleTimerRef.current = setTimeout(() => {
          const step = 270 + 20;
          const idx = Math.round(el.scrollLeft / step);
          if (idx !== ci && idx >= 0 && idx < CARDS.length) {
            setCi(idx);
            setTxnPage(1);
          }
          userScrollingRef.current = false;
        }, 120);
      }}
      style={{
        display:"flex",
        gap:20,
        overflowX:"auto",
        scrollSnapType:"x mandatory",
        WebkitOverflowScrolling:"touch",
        scrollbarWidth:"none",
        cursor: dragRef.current.down ? "grabbing" : "grab",
        userSelect: "none",
        scrollBehavior: "smooth",
        padding:"0 calc(50% - 135px)",  /* 135 px outer pad → snap-align: center on 270-wide card */
        marginBottom:-89,            /* lift bottom half of 178-tall card (270 × 132/200) onto page bg */
        position:"relative",zIndex:2,
      }}
    >
      {CARDS.map((card:any,i:number)=>(
        <div key={i} style={{
          width:270, aspectRatio:"200/132", flexShrink:0,
          scrollSnapAlign:"center",
          borderRadius:11,
          overflow:"hidden",
          background:"#1a1a2e",
          border:"0.83px solid rgba(255,255,255,0.2)",
          boxShadow:"0px 5px 15px rgba(0,0,0,0.35), 0px 7px 29px rgba(0,0,0,0.15)",
          opacity:i===ci?1:0.9,
          transform:i===ci?"scale(1)":"scale(0.97)",
          transition:"opacity 0.35s ease, transform 0.35s ease",
          position:"relative",
        }}>
          <CardImg src={cardArtByIndex[i]||""} />
        </div>
      ))}
    </div>
    {/* Desktop-friendly click targets */}
    <div
      onClick={() => goToCard(ci - 1)}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 56,
        zIndex: 5,
        cursor: "pointer",
        background: "linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: ci === 0 ? 0 : 1,
        pointerEvents: ci === 0 ? "none" : "auto",
      }}
    >
      <ChevronLeft size={18} color="#FFFFFF" strokeWidth={2} />
    </div>
    <div
      onClick={() => goToCard(ci + 1)}
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 56,
        zIndex: 5,
        cursor: "pointer",
        background: "linear-gradient(270deg, rgba(0,0,0,0.18), rgba(0,0,0,0))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: ci === CARDS.length - 1 ? 0 : 1,
        pointerEvents: ci === CARDS.length - 1 ? "none" : "auto",
      }}
    >
      <ChevronRight size={18} color="#FFFFFF" strokeWidth={2} />
    </div>
    </div>
  </div>
  <div style={{height:107,background:"#FFFFFF"}} aria-hidden="true" />

  {isState1?(<div style={{padding:"0 24px 44px",background:"#FFFFFF"}}>
    <div style={{margin:"16px 0 18px",padding:"22px 20px",borderRadius:16,background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:`1px solid ${C.blueBrd}`}}>
      <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
        <div style={{width:44,height:44,borderRadius:12,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><HelpCircle size={22} strokeWidth={1.5} color={C.blue}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>We don't know this card yet</div>
          <div style={{fontSize:12,color:C.sub,lineHeight:1.5}}>Identify it to unlock benefits, milestones and fee details</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <div onClick={()=>setShowGmailNudgeSheet(true)} style={{flex:1,padding:"12px",borderRadius:12,background:"#1a2233",color:"#fff",textAlign:"center",fontSize:12,fontWeight:700,cursor:"pointer"}}>Connect Gmail</div>
        <div onClick={()=>{setShowCardMappingUI(true);setMappingStep(ci);setMappingSearchQ("");setScreen("building");}} style={{flex:1,padding:"12px",borderRadius:12,background:C.white,border:`1.5px solid ${C.brd}`,color:C.text,textAlign:"center",fontSize:12,fontWeight:700,cursor:"pointer"}}>Add manually</div>
      </div>
    </div>
    <div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:2,textTransform:"uppercase",margin:"20px 0 12px"}}>Recent Transactions</div>
    <div>{visibleTxns.slice(0,10).map((t,i)=>{const bImg=CAT_ICONS[t.brand];return(<div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${C.brd}`}}><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{width:38,height:39,borderRadius:4,border:"1px solid #EDEDED",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>{bImg?<img src={bImg} alt="" style={{width:36,height:31,objectFit:"contain"}}/>:<span style={{fontSize:16}}>{t.icon}</span>}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>{t.brand} · ₹{f(t.amt)}</div><div style={{fontSize:10,color:C.dim,marginTop:2}}>{t.date} | {getCardDisplayName(ci)}</div></div></div></div>);})}</div>
    <div style={{marginTop:20}}><GmailNudgeBanner line="See what you saved and missed" subline="Connect Gmail to evaluate your transactions" onPress={()=>setShowGmailNudgeSheet(true)}/></div>
  </div>):(<>

  {/* ═══ IMPORTANT ACTIONS ═══ */}
  {(()=>{const allActs=CARDS.flatMap((c,idx)=>getFilteredActions(CD[idx].actions).map(a=>({...a,_ci:idx,_card:c.name})));const sorted=[...allActs.filter(a=>a._ci===ci),...allActs.filter(a=>a._ci!==ci)];return sorted.length>0&&<div style={{padding:"8px 0 0",background:"#FFFFFF"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 24px 12px"}}>
      <span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.sub,textTransform:"uppercase"}}>Important Actions</span>
      <span onClick={()=>setScreen("actions")} style={{fontSize:12,fontWeight:600,color:"#36405E",cursor:"pointer"}}>View All &gt;</span>
    </div>
    <div
      ref={actsRailRef}
      data-scroll="1"
      onMouseDown={(e:any)=>{
        const el = e.currentTarget as HTMLDivElement;
        actsDragRef.current.down = true;
        actsDragRef.current.moved = false;
        actsDragRef.current.startX = e.clientX;
        actsDragRef.current.startLeft = el.scrollLeft;
      }}
      onMouseMove={(e:any)=>{
        if(!actsDragRef.current.down) return;
        e.preventDefault();
        const el = e.currentTarget as HTMLDivElement;
        const dx = e.clientX - actsDragRef.current.startX;
        if (Math.abs(dx) > 6) actsDragRef.current.moved = true;
        el.scrollLeft = actsDragRef.current.startLeft - dx;
      }}
      onMouseUp={()=>{
        actsDragRef.current.down = false;
        // give the click event (if any) a chance to see moved=true
        setTimeout(() => { actsDragRef.current.moved = false; }, 0);
      }}
      onMouseLeave={()=>{
        actsDragRef.current.down = false;
        setTimeout(() => { actsDragRef.current.moved = false; }, 0);
      }}
      onWheel={(e:any)=>{
        const el = e.currentTarget as HTMLDivElement;
        if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }}
      style={{display:"flex",gap:12,overflowX:"auto",padding:"0 16px 24px",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",touchAction:"pan-x",cursor:actsDragRef.current.down?"grabbing":"grab",userSelect:"none"}}
    >
      {sorted.map((a:any,i:number)=>{const isCurrent=a._ci===ci;return(<div key={i} onClick={(e:any)=>{if(actsDragRef.current.moved){e.preventDefault();e.stopPropagation();return;}setActSheet(a);}} style={{
        width:300,minWidth:300,minHeight:69,flexShrink:0,
        borderRadius:12,
        background:isCurrent?"linear-gradient(90deg, rgba(255,240,240,0.8) 0%, rgba(255,235,224,0.8) 100%)":"linear-gradient(270deg, rgba(240,251,255,0.8) 0%, rgba(224,236,255,0.8) 100%)",
        border:"1px solid #FFFFFF",
        boxShadow:"0px 0.62px 2px rgba(9,84,171,0.11)",
        padding:"14px 16px",
        display:"flex",alignItems:"center",gap:12,
        cursor:"pointer",
      }}>
        <div style={{width:40,height:40,borderRadius:10,background:isCurrent?"rgba(224,0,0,0.08)":"rgba(9,84,171,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {a.Ic&&<a.Ic size={18} strokeWidth={1.5} color={isCurrent?"#dc2626":"#0064E0"}/>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,lineHeight:"18px",color:"rgba(36,45,74,0.9)"}}>{a.title}</div>
          <div style={{fontSize:11,color:C.sub,lineHeight:1.4,marginTop:2}}>{a.desc}</div>
        </div>
      </div>);})}
    </div>
  </div>;})()}

  {/* ═══ TAB BAR ═══ */}
  <div style={{position:"sticky",top:0,zIndex:20,marginTop:0}}>
    <div style={{
      display:"flex",flexDirection:"column",alignItems:"stretch",
      background:"#FFFFFF",
      padding:"0 20px",
      height:48,
      borderTop:"0.8px dashed #E3EBED",
      borderBottom:"0.8px solid rgba(202,196,208,0.7)",
      boxSizing:"border-box",
    }}>
      <div style={{
        display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",
        flex:1,
      }}>
        {DTABS.map((t,i)=>{
          const isActive = detailTab===i;
          return (
            <div key={t} onClick={()=>{setDetailTab(i);setTxnPage(1);}} style={{
              display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",
              background:"transparent",
              cursor:"pointer",position:"relative",
              alignSelf:"stretch",
            }}>
              <div style={{
                display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",
                padding:"14px 0",gap:4,
              }}>
                <span style={{
                  fontFamily:FN,fontWeight:500,fontSize:12,
                  lineHeight:isActive?"20px":"18px",
                  letterSpacing:"0.1px",textAlign:"center",
                  color:isActive?"#36405E":"#676F88",
                  transition:"color 0.2s",
                }}>{t}</span>
              </div>
              {isActive && (
                <div style={{position:"absolute",height:14,left:0,right:0,bottom:0.4,pointerEvents:"none"}}>
                  <div style={{position:"absolute",height:3,left:2,right:2,bottom:0,background:"#36405E",borderRadius:"100px 100px 0 0"}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>

  <div style={{padding:"0 0 44px"}}>

  {/* ═══ TAB 0: CARD ANALYSIS ═══ */}
  {detailTab===0&&<div className="fade-up"><CardAnalysisFigma
    uc={uc}
    ptName={uc.ptName}
    onSaveMore={()=>{ setScreen("optimize"); }}
    onRowClick={({view,name}:{view:any,name:string})=>{
      // Route to full Transactions screen with a pre-applied filter.
      // (CardDetail's own Transactions tab only supports the "Unaccounted" chip today.)
      setFilters([name]);
      setSortBy("Recent");
      setScreen("transactions");
    }}
  /></div>}
  {detailTab===1&&(()=>{
    const sortLabel=sortBy==="Recent"?"Sort By":sortBy;
    const unaccActive=(filters||[]).includes("Unaccounted");
    let txnList=unaccActive?cardTxns.filter((t:any)=>t.unaccounted):cardTxns;
    if(sortBy==="Most Spent")txnList=[...txnList].sort((a:any,b:any)=>(b.amt||0)-(a.amt||0));
    else if(sortBy==="Least Spent")txnList=[...txnList].sort((a:any,b:any)=>(a.amt||0)-(b.amt||0));
    const txnsLimited=txnList.slice(0,30);
    const mapped=txnsLimited.map((t:any,idx:number)=>({
      id:idx,
      brand:(t.brand||"").toLowerCase().replace(/\s+/g,""),
      merchant:t.brand||"Transaction",
      cardLine:`${t.via||"Card"} | ${t.date||""}`,
      amount:`₹${(t.amt||0).toLocaleString("en-IN")}`,
      saved:t.saved!=null?`₹${t.saved}`:null,
      savedColor:t.saved>0?"#078146":"#B56D3C",
      cta:{variant:t.unaccounted?"needsdata":t.tag?.startsWith("★")||t.tag?.startsWith("✦")?"newcard":t.saved>0?"best":"switch",text:t.unaccounted?"Need more details about this transaction":((t.tag||"Used best card for this").replace(/^[★✦]\s*/,""))},
      raw:t,
    }));
    const groups=groupByDate(mapped);
    return(<div className="fade-up" style={{padding:"4px 0 8px"}}>
      <ActionBar
        sort={sortLabel}
        onSortClick={()=>setSortBy(sortBy==="Recent"?"Most Spent":sortBy==="Most Spent"?"Least Spent":"Recent")}
        filter="Filter"
        onFilterClick={()=>setFilterSheet(true)}
        chips={["Unaccounted"]}
        activeChip={unaccActive?"Unaccounted":null}
        onChipClick={(chip:string)=>{
          if(chip==="Unaccounted"&&unaccActive){setFilters([]);return;}
          setFilters(["Unaccounted"]);
        }}
      />
      {groups.map((g:any)=>(
        <div key={g.date} style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px 10px"}}>
            <span className="legacy-overline" style={{flexShrink:0}}>{g.label}</span>
            <div style={{display:"flex",alignItems:"center",gap:1.55,flex:1,opacity:0.4}}>
              <div style={{width:3.09,height:3.09,background:"#848CA0",transform:"rotate(45deg)",flexShrink:0}}/>
              <div style={{flex:1,height:0,borderBottom:"0.62px solid",borderImage:"linear-gradient(90deg,#848CA0,rgba(48,51,58,0)) 1"}}/>
            </div>
          </div>
          <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:18}}>
            {g.items.map((t:any)=>{
              if(t.raw?.unaccounted)return <UnaccountedRow key={`u-${t.id}`} onClick={()=>setCatSheet(t.raw)}/>;
              return <TransactionRow key={t.id} {...t} onClick={()=>setTxnSheet(t.raw)}/>;
            })}
          </div>
        </div>
      ))}
      {groups.length===0&&<div style={{textAlign:"center",padding:40,color:"rgba(74,83,112,0.7)",fontSize:13}}>No transactions match this filter.</div>}
      {cardTxns.length>30&&<div style={{padding:"4px 0 4px"}}><div onClick={()=>{const filterKey={"HSBC Travel One":"Travel One","Axis Flipkart":"Flipkart","HSBC Live+":"Live+"}[uc.name]||uc.name;setFilters([filterKey]);setSortBy("Recent");setScreen("transactions");}} style={{margin:"0 16px",padding:"14px",borderRadius:12,background:C.white,border:`1px solid ${C.brd}`,fontSize:13,fontWeight:600,color:"#222941",cursor:"pointer",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>View all {cardTxns.length} transactions →</div></div>}
    </div>);
  })()}

  {/* ═══ TAB 2: BENEFITS ═══ */}
  {detailTab===2&&(()=>{
    const SerifTitle=({children}:{children:any})=>(<div className="legacy-serif" style={{fontSize:20,fontWeight:700,letterSpacing:"-0.01em",color:"rgba(54,64,96,0.9)",lineHeight:"140%",padding:"0 4px"}}>{children}</div>);
    const ClaimedBadge=()=>(<div style={{display:"inline-flex",alignSelf:"flex-start",justifyContent:"center",alignItems:"center",padding:8,borderRadius:4,background:"linear-gradient(90deg, #E0F9ED 0%, rgba(224,249,237,0) 100%), linear-gradient(90deg, #FEFEDD 0%, rgba(249,249,224,0) 100%)",fontFamily:FN,fontSize:9,fontWeight:700,color:"#08CF6F",letterSpacing:"0.1em",textTransform:"uppercase",lineHeight:"120%"}}>Claimed</div>);
    const StripDivider=()=>(<div style={{height:10,background:"rgba(23,73,47,0.06)",marginTop:40}}/>);
    const activeIdx=cd.milestones.findIndex((x:any)=>x.status!=="Claimed");

    return(<div className="fade-up">
      {isState2&&<div style={{padding:"20px 16px 0"}}><GmailNudgeBanner line="Unlock personalised benefits" subline="Connect Gmail to track points, fee waivers and vouchers" onPress={()=>setShowGmailNudgeSheet(true)}/></div>}

      {/* ── Welcome Benefits ── */}
      <div style={{padding:"24px 16px 0"}}>
        <SerifTitle>Welcome Benefits</SerifTitle>
        <div style={{marginTop:13,padding:"12px 12px 14px",background:"#FFFFFF",borderRadius:8,boxShadow:"0 0.62px 4.35px rgba(63,66,70,0.11)",display:"flex",alignItems:"flex-start",gap:14}}>
          <div style={{width:45,height:42,background:"#F7F5F5",flexShrink:0}}/>
          <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <div style={{fontFamily:FN,fontSize:14,fontWeight:500,color:"#36405E",lineHeight:"21px"}}>{cd.welcome.title}</div>
              <div style={{fontFamily:FN,fontSize:11,fontWeight:400,color:"#808387",lineHeight:"160%"}}>{cd.welcome.desc}</div>
            </div>
            {cd.welcome.status==="Claimed"&&<ClaimedBadge/>}
          </div>
        </div>
      </div>

      <StripDivider/>

      {/* ── Milestone Benefits ── */}
      <div style={{padding:"40px 16px 0"}}>
        <SerifTitle>Milestone Benefits</SerifTitle>
        <div style={{marginTop:23,display:"flex",alignItems:"stretch",gap:13}}>
          {/* Cards column drives row heights — timeline aligns to them */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 4px",gap:6,flexShrink:0}}>
            {cd.milestones.map((m:any,i:number)=>{
              const isClaimed=m.status==="Claimed";
              const isActive=!isClaimed&&i===activeIdx;
              const isLast=i===cd.milestones.length-1;
              const nodeSize=isLast?30:24;
              return(<React.Fragment key={i}>
                {isClaimed?
                  <div style={{width:24,height:24,minHeight:24,background:"#08CF6F",border:"1px solid #08CF6F",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                : isActive?
                  <div style={{width:24,height:24,minHeight:24,background:"#F5FCF9",border:"0.49px solid #08CF6F",borderRadius:"50%",position:"relative",flexShrink:0}}>
                    <div style={{position:"absolute",width:8,height:8,left:8,top:"calc(50% - 4px)",background:"#08CF6F",borderRadius:"50%"}}/>
                  </div>
                :
                  <div style={{width:nodeSize,height:nodeSize,minHeight:nodeSize,background:"#F5FCF9",border:"0.49px solid #8FB9AA",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width={nodeSize===30?15:12} height={nodeSize===30?15:12} viewBox="0 0 12 12" fill="none"><rect x="2.4" y="5.4" width="7.2" height="4.6" rx="1" stroke="#8FB9AA" strokeWidth="1" fill="none"/><path d="M3.6 5.4V3.8C3.6 2.5 4.7 1.4 6 1.4C7.3 1.4 8.4 2.5 8.4 3.8V5.4" stroke="#8FB9AA" strokeWidth="1" fill="none"/></svg>
                  </div>
                }
                {!isLast&&<div style={{width:0,flex:1,minHeight:isClaimed?60:isActive?55:50,borderLeft:isClaimed?"1px solid #08CF6F":"1px dashed #C1CBD0"}}/>}
              </React.Fragment>);
            })}
          </div>

          <div style={{flex:1,display:"flex",flexDirection:"column",gap:16,minWidth:0}}>
            {cd.milestones.map((m:any,i:number)=>{
              const isClaimed=m.status==="Claimed";
              const isActive=!isClaimed&&i===activeIdx;
              const isLocked=!isClaimed&&!isActive;
              const remain=m.remaining || 0;
              if(isClaimed){
                return(<div key={i} style={{padding:"16px 18px",borderRadius:12,background:"linear-gradient(124.24deg, rgba(199,246,191,0.1) 5.73%, rgba(255,255,255,0.1) 28.15%), #F5FCF9",border:"1px solid rgba(37,220,155,0.3)",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{fontFamily:FN,fontSize:14,fontWeight:500,color:"#36405E",lineHeight:"21px"}}>{m.title}</div>
                    <div style={{fontFamily:FN,fontSize:11,fontWeight:400,color:"#808387",lineHeight:"155%"}}>{m.desc}</div>
                  </div>
                  <ClaimedBadge/>
                </div>);
              }
              if(isActive){
                return(<div key={i} style={{padding:"12px 12px 14px",borderRadius:8,background:"#FFFFFF",border:"1px solid #25DC9B",boxShadow:"0 0.62px 4.35px rgba(63,66,70,0.11)",display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{fontFamily:FN,fontSize:14,fontWeight:500,color:"#36405E",lineHeight:"21px"}}>{m.title}</div>
                    <div style={{fontFamily:FN,fontSize:11,fontWeight:400,color:"#808387",lineHeight:"155%"}}>{m.desc}</div>
                  </div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <div style={{display:"inline-flex",justifyContent:"center",alignItems:"center",padding:8,borderRadius:4,background:"linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)",fontFamily:FN,fontSize:9,fontWeight:700,color:"#0897CF",letterSpacing:"0.1em",textTransform:"uppercase",lineHeight:"120%"}}>₹{f(remain)} more to spend</div>
                    {m.expiry&&<div style={{display:"inline-flex",justifyContent:"center",alignItems:"center",padding:8,borderRadius:4,background:"linear-gradient(90deg, #FCF9EA 0%, rgba(252,244,234,0) 100%)",fontFamily:FN,fontSize:9,fontWeight:700,color:"#CF6C08",letterSpacing:"0.1em",textTransform:"uppercase",lineHeight:"120%"}}>{m.expiry} left</div>}
                  </div>
                </div>);
              }
              return(<div key={i} style={{padding:"12px 12px 14px",borderRadius:8,background:"#FFFFFF",boxShadow:"0 0.62px 4.35px rgba(63,66,70,0.11)",display:"flex",flexDirection:"column",gap:4,opacity:0.85}}>
                <div style={{fontFamily:FN,fontSize:14,fontWeight:500,color:"#36405E",lineHeight:"21px"}}>{m.title}</div>
                <div style={{fontFamily:FN,fontSize:11,fontWeight:400,color:"#808387",lineHeight:"155%"}}>{m.desc}</div>
              </div>);
            })}
          </div>
        </div>
      </div>

      <StripDivider/>

      {/* ── Lounge & Additional Benefits ── */}
      <div style={{padding:"40px 15px 0"}}>
        <SerifTitle>Lounge and Additional Benefits</SerifTitle>
        <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:16}}>
          {cd.lounge.map((l:any,i:number)=>{
            const isLocked=l.locked||/no .* benefit/i.test(l.title||"");
            return(<div key={i} style={{padding:"16px 18px",borderRadius:12,background:"linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF",border:"1px solid #E8EBED",display:"flex",alignItems:"flex-start",gap:16,opacity:isLocked?0.7:1}}>
              <div style={{width:45,height:42,background:"#F7F5F5",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:4,justifyContent:isLocked?"center":"flex-start"}}>
                <div style={{fontFamily:FN,fontSize:isLocked?12:14,fontWeight:500,color:isLocked?"rgba(54,64,94,0.8)":"#36405E",lineHeight:isLocked?"150%":"21px"}}>{l.title}</div>
                {!isLocked&&l.desc&&<div style={{fontFamily:FN,fontSize:11,fontWeight:400,color:"#808387",lineHeight:"160%"}}>{l.desc}</div>}
              </div>
            </div>);
          })}
        </div>
      </div>

      {isState2&&<div style={{padding:"24px 16px 0"}}><GmailNudgeBanner line="See your actual progress" subline="Connect Gmail to track your milestones and welcome benefits" onPress={()=>setShowGmailNudgeSheet(true)}/></div>}
    </div>);
  })()}

  {/* ═══ TAB 3: FEES ═══ */}
  {detailTab===3&&(()=>{
    const SerifTitle=({children}:{children:any})=>(<div className="legacy-serif" style={{fontSize:20,fontWeight:700,letterSpacing:"-0.01em",color:"rgba(54,64,96,0.9)",lineHeight:"140%",padding:"0 4px"}}>{children}</div>);
    const SectionHeader=({label}:{label:string})=>(
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 4px",marginBottom:24}}>
        <span style={{fontFamily:FN,fontSize:9.28,fontWeight:600,color:"#2F374B",letterSpacing:"0.2em",textTransform:"uppercase",lineHeight:"11px",flexShrink:0}}>{label}</span>
        <div style={{display:"flex",alignItems:"center",gap:1.55,flex:1,opacity:0.4}}>
          <div style={{width:3.09,height:3.09,background:"#848CA0",transform:"rotate(45deg)",flexShrink:0}}/>
          <div style={{flex:1,height:0,borderBottom:"0.62px solid #848CA0"}}/>
        </div>
      </div>
    );
    const TwoColTable=({rows,headerL,headerR}:{rows:[string,string][];headerL?:string;headerR?:string})=>{
      const all:[string,string,boolean][]=[];
      if(headerL||headerR)all.push([headerL||"",headerR||"",true]);
      rows.forEach(([l,r])=>all.push([l,r,false]));
      return(
        <div style={{borderRadius:12,overflow:"hidden",background:"linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF",border:"1px solid #EEEEEE"}}>
          {all.map(([l,r,isHdr],i)=>{
            const isLast=i===all.length-1;
            return(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",alignItems:"stretch"}}>
                <div style={{padding:"14px 20px",background:"#F7F8F9",borderBottom:isLast?"none":"1px solid #EEEEEE",fontFamily:FN,fontSize:12,fontWeight:500,color:"#36405E",lineHeight:"17px",display:"flex",alignItems:"center"}}>{l}</div>
                <div style={{padding:"14px 12px",background:"#FFFFFF",borderLeft:"1px solid #EEEEEE",borderBottom:isLast?"none":"1px solid #EEEEEE",fontFamily:FN,fontSize:12,fontWeight:isHdr?500:400,color:"#36405E",lineHeight:"17px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>{typeof r === "string" && r.startsWith("http") ? <a href={r} target="_blank" rel="noopener noreferrer" style={{color:"#0054A6",fontWeight:600,textDecoration:"none"}}>Click here →</a> : r}</div>
              </div>
            );
          })}
        </div>
      );
    };

    return(<div className="fade-up" style={{padding:"24px 15px 0",display:"flex",flexDirection:"column",gap:36}}>

      {/* ── Fees & Waivers ── */}
      <div style={{display:"flex",flexDirection:"column",gap:24}}>
        <SerifTitle>Fees & Waivers</SerifTitle>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[
            {t:`Annual Fee (${cd.fees.annual})`,d:cd.fees.annualWaiver,b:cd.fees.annualStatus},
            {t:`Joining Fee (${cd.fees.joining})`,d:cd.fees.joiningNote},
          ].map((x:any,i:number)=>(
            <div key={i} style={{padding:"16px 18px",borderRadius:12,background:"linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF",border:"1px solid #E8EBED",display:"flex",alignItems:"flex-start",gap:16}}>
              <div style={{width:45,height:42,background:"#F7F5F5",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontFamily:FN,fontSize:14,fontWeight:500,color:"#36405E",lineHeight:"21px"}}>{x.t}</div>
                  <div style={{fontFamily:FN,fontSize:11,fontWeight:400,color:"#808387",lineHeight:"160%"}}>{x.d}</div>
                </div>
                {x.b==="Waived"&&<div style={{display:"inline-flex",alignSelf:"flex-start",justifyContent:"center",alignItems:"center",padding:8,borderRadius:4,background:"linear-gradient(90deg, #E0F9ED 0%, rgba(224,249,237,0) 100%), linear-gradient(90deg, #FEFEDD 0%, rgba(249,249,224,0) 100%)",fontFamily:FN,fontSize:9,fontWeight:700,color:"#08CF6F",letterSpacing:"0.1em",textTransform:"uppercase",lineHeight:"120%"}}>Waived on your spends</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Additional Bank Fee ── */}
      <div>
        <SectionHeader label="Additional Bank Fee"/>
        <TwoColTable rows={cd.bankFees}/>
      </div>

      {/* ── Late Payment Fee ── */}
      <div>
        <SectionHeader label="Fee on late bill payment"/>
        <TwoColTable rows={cd.lateFees} headerL="Amount Due" headerR="Late Payment Fee"/>
      </div>

    </div>);
  })()}

  </div>
  </>)}
  <InfoBS/></div></div><TxnSheet/><ActSheet/><CatBS/><FilterSheet/><GmailNudgePopup/><GmailNudgeSheet/><RetroOverlay/><VoiceFlowOverlay/><Toast/></div>);
}
