import { useState } from "react";
import { Star, ChevronDown, ChevronRight, Check, CreditCard, Search, Lock as LockIcon, Mail, MapPin, Plane, UtensilsCrossed, Tv, HelpCircle, Gift, Target, Sparkles, X, ChevronLeft, LayoutList, Table2, Calculator } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { TOTAL_ACC, BEST_CARDS as SIM_BEST_CARDS, BEST_CARDS_FILTER_OPTS, BEST_CARDS_COMB_SAVINGS, getBestCardDetail, SAVINGS_BARS, SPEND_DIST_WITH_ULTIMATE, OPT_BRANDS, CARD_PROMO } from "@/data/simulation/legacy";
import { USER_CARDS } from "@/data/simulation/inputs";
import { NavBar } from "@/components/shared/NavBar";
import { useAppContext } from "@/store/AppContext";
import { Toast, InfoBS, TxnSheet, ActSheet, GmailNudgePopup, GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CatBS, FilterSheet } from "@/components/sheets/BottomSheets";

let bestCardsLogOnce=false;

export const BestCardsScreen = () => {
  const {
    bestCardDetail, setBestCardDetail,
    bcFilter, setBcFilter,
    bcSearch, setBcSearch,
    bcSearchOpen, setBcSearchOpen,
    bcDetTab, setBcDetTab,
    bcViewMode, setBcViewMode,
    bcSection, setBcSection,
    bcFavs, setBcFavs,
    bcSort, setBcSort,
    bcShowSort, setBcShowSort,
    bcListView, setBcListView,
    bcEligSheet, setBcEligSheet,
    bcFromScreen,
    setScreen, setToast, setInfoSheet, setActSheet,
    setOptSheet, setOptSheetFrom,
    openCard, hasGmail, isState1, isState2, isState3,
    cardMapping, getCardDisplayName, isCardMapped,
    setShowGmailNudgeSheet,
  } = useAppContext();

  if(!bestCardsLogOnce){
    bestCardsLogOnce=true;
  }

    const BEST_CARDS = SIM_BEST_CARDS;
    const bcFilterOpts = BEST_CARDS_FILTER_OPTS.map(o => o.label);
    const toggleBcFilter=(f)=>setBcFilter(v=>v.includes(f)?v.filter(x=>x!==f):[...v,f]);
    const filteredCards=BEST_CARDS.filter(c=>{if(bcSearch&&!c.name.toLowerCase().includes(bcSearch.toLowerCase())&&!c.bank.toLowerCase().includes(bcSearch.toLowerCase()))return false;if(bcFilter.length===0)return true;return bcFilter.some(fl=>c.tags.includes(fl));}).sort((a,b)=>{if(bcSort==="Highest Savings")return b.savings-a.savings;if(bcSort==="Lowest Fee")return a.annualFee-b.annualFee;if(bcSort==="Lifetime Free First")return(a.annualFee===0?0:1)-(b.annualFee===0?0:1)||b.match-a.match;return b.savings-a.savings;});
    const top2=[BEST_CARDS[0],BEST_CARDS[1]];
    const combSavings = BEST_CARDS_COMB_SAVINGS;

    /* ═══ BEST CARD DETAIL PAGE ═══ */
    const getCD = (name) => {
      const idx = BEST_CARDS.findIndex(c => c.name === name);
      return getBestCardDetail(idx >= 0 ? idx : 0);
    };

    if(bestCardDetail){const card=bestCardDetail;const netSavings=card.savings-(card.annualFee||0);const _det=getCD(card.name)||{};
    const det={..._det,
      welcome:Array.isArray(_det.welcome)?_det.welcome:_det.welcome?[{t:_det.welcome.amt?`₹${f(_det.welcome.amt)} welcome reward`:"Welcome benefit",d:_det.welcome.validity||"On first spend"}]:[],
      milestones:Array.isArray(_det.milestones)?_det.milestones.map(m=>({t:m.t||m.title||`₹${f(m.amt||0)} reward`,d:m.d||m.desc||`Validity: ${m.validity||"365 days"}`,thr:m.thr||m.minSpend||200000,status:m.status||"locked"})):[],
      lounge:Array.isArray(_det.lounge)?_det.lounge.map(l=>({t:l.t||l.title||"Lounge access",d:l.d||l.desc||""})):_det.lounge?[{t:`${_det.lounge.qty||0} lounge visits ${_det.lounge.type||"per year"}`,d:"Domestic & international combined"}]:[],
      fees:{annual:"N/A",joining:"N/A",waiver:"N/A",waiverStatus:"N/A",bankFees:[],lateFees:[],...(_det.fees||{})},
      replace:_det.replace||"",replaceSave:_det.replaceSave||0,
      brandFit:_det.brandFit||card.brandFit||[],
      comparisonBars:_det.comparisonBars||[],
    };return(
    <div style={{fontFamily:FN,width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative",background:C.bg}}><div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",background:C.bg,paddingBottom:100}}><div className="slide-in"><FL/>
      {/* ── HEADER — dark navy block ── */}
      <div style={{background:"linear-gradient(180deg, #010904 -15.07%, #072A4D 112.18%)",position:"relative",minHeight:249,padding:"0 16px",color:"#fff"}}>
        {/* Status bar area */}
        <div style={{height:44}}/>
        {/* Back arrow */}
        <div onClick={()=>setBestCardDetail(null)} style={{position:"absolute",top:46.5,left:16,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:2}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M8.70703 5.29286C9.09753 4.90236 9.73056 4.90241 10.1211 5.29286C10.5116 5.68338 10.5116 6.31639 10.1211 6.70692L5.82812 10.9999H20.4141C20.9663 10.9999 21.4141 11.4476 21.4141 11.9999C21.4141 12.5522 20.9663 12.9999 20.4141 12.9999H5.82812L10.1211 17.2929C10.5116 17.6834 10.5116 18.3164 10.1211 18.7069C9.73056 19.0974 9.09753 19.0974 8.70703 18.7069L2 11.9999L8.70703 5.29286Z" fill="white"/></svg>
        </div>
        {/* Bank name */}
        <div style={{textAlign:"center",marginTop:8,fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.04em",color:"rgba(217,218,218,0.8)"}}>{card.bank}</div>
        {/* Card title */}
        <div style={{textAlign:"center",marginTop:4,fontSize:14,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",color:"#fff"}}>{card.name}</div>
        {/* Card image */}
        <div style={{display:"flex",justifyContent:"center",marginTop:14}}>
          {(card.image||card.card_bg_image)?
            <img src={card.image||card.card_bg_image} alt={card.name} style={{width:199,height:133,borderRadius:12,border:"0.83px solid rgba(255,255,255,0.2)",boxShadow:"0px 5px 15px rgba(0,0,0,0.35)",objectFit:"cover"}}/>
          :
            <div style={{width:199,height:133,borderRadius:12,border:"0.83px solid rgba(255,255,255,0.2)",boxShadow:"0px 5px 15px rgba(0,0,0,0.35)",background:card.card_bg_gradient||`linear-gradient(135deg,${card.color},${card.accent})`,display:"flex",alignItems:"center",justifyContent:"center"}}><CreditCard size={32} strokeWidth={1} color="rgba(255,255,255,0.4)"/></div>
          }
        </div>
      </div>
      {/* ── Below header — savings + CTAs on page bg ── */}
      <div style={{textAlign:"center",padding:"16px 24px 0",background:C.bg}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#808387"}}>SAVE UPTO</div>
        <div className="legacy-serif" style={{fontSize:32,fontWeight:800,lineHeight:1.2,marginTop:4,background:"linear-gradient(180deg, #17B226 10.83%, #0A4C10 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{"₹"+f(card.savings)+"/yr"}</div>
        <div style={{fontSize:12,fontWeight:400,color:"rgba(0,0,0,0.6)",marginTop:6}}>Add this Card to your setup</div>
        <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"center"}}>
          <div onClick={()=>setBcEligSheet(card)} style={{width:162,height:49,borderRadius:8,border:"1px solid rgba(17,52,172,0.2)",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><span style={{fontSize:13,fontWeight:600,color:"#1C2A33"}}>Swap and compare</span></div>
          <div onClick={()=>setBcEligSheet(card)} style={{width:155,height:48.51,borderRadius:10.17,background:"linear-gradient(90deg, #222941 0%, #101C43 100%)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247)"}}><span style={{fontSize:14,fontWeight:700,color:"#fff"}}>{"Apply Now >"}</span></div>
        </div>
      </div>

      {/* ── USAGE ADVICE ── */}
      <div style={{padding:"0 24px"}}><div style={{padding:"14px 16px",borderRadius:12,background:C.white,boxShadow:"0 2px 12px rgba(0,0,0,0.04)",marginTop:12,position:"relative",zIndex:2}}>
        <div style={{fontSize:10,fontWeight:600,color:C.sub,marginBottom:3}}>Usage advice</div>
        <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.45}}>{det.replace?`Replace your ${det.replace} with this card and save upto ₹${f(det.replaceSave)}`:`This card can save you ₹${f(netSavings)} per year based on your spending`}</div>
        {det.replace&&<div onClick={()=>{}} style={{marginTop:8,fontSize:12,fontWeight:700,color:C.green,cursor:"pointer"}}>See comparison ›</div>}
      </div></div>

      {/* ── SECTION TABS ── */}
      <div style={{position:"sticky",top:0,zIndex:20,background:"#FAFEFF",borderTop:"0.8px dashed #E3EBED",borderBottom:"0.8px solid rgba(202,196,208,0.7)",padding:"0 16px",marginTop:8}}>
        <div style={{display:"flex"}}>
          {[{k:"howtouse",l:"How to use"},{k:"benefits",l:"Benefits"},{k:"fee",l:"Fee"},{k:"eligibility",l:"Eligibility and T&C"}].map(t=>(<div key={t.k} onClick={()=>setBcSection(t.k)} style={{flex:1,textAlign:"center",padding:"11px 0",cursor:"pointer",borderBottom:bcSection===t.k?"3px solid #36405E":"3px solid transparent",borderRadius:bcSection===t.k?"100px 100px 0 0":"0",color:bcSection===t.k?"#36405E":"#676F88",fontSize:12,fontWeight:500}}>{t.l}</div>))}
        </div>
      </div>

      {bcSection==="howtouse"&&(<>
      {/* ── SPENDS DISTRIBUTION (How to use tab) ── */}
      <div id="bc-howtouse" style={{padding:"0 16px",marginTop:20}}>
        {(()=>{
          const distData = SPEND_DIST_WITH_ULTIMATE;
          const totalSpend = distData.reduce((s,d)=>s+d.spend,0);
          // Color mapping by card name
          const nameGradMap = {};
          const nameDotMap = {};
          USER_CARDS.forEach((uc,i)=>{
            const grads = ["linear-gradient(90deg, #117E47, #0AA759)","linear-gradient(90deg, #4C98F4, #0862CF)","linear-gradient(90deg, #EB8807, #FCAA3F)"];
            const dots = ["#117E47","#4C98F4","#EB8807"];
            nameGradMap[uc.name] = grads[i % grads.length];
            nameDotMap[uc.name] = dots[i % dots.length];
          });
          // Market card gets purple
          const marketGrad = "linear-gradient(90deg, #583598, #9359FE)";
          const marketDot = "#583598";
          // Detect market card: any card not in USER_CARDS
          const userNames = new Set(USER_CARDS.map(c=>c.name));
          const isMarket = (name) => !userNames.has(name);

          return(<>
          <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>Spends Distribution</div>
          <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:4}}>Based on your spend over last 365 days</div>

          {/* Segmented bar */}
          <div style={{marginTop:16,background:"#fff",borderRadius:12,padding:12,boxShadow:"inset 0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",borderRadius:8,overflow:"hidden",height:32}}>
              {distData.map((d,i)=>{
                const grad = isMarket(d.name) ? marketGrad : (nameGradMap[d.name] || "linear-gradient(90deg, #999, #bbb)");
                return d.pct > 0 ? <div key={i} style={{width:d.pct+"%",background:grad,display:"flex",alignItems:"center",justifyContent:"center",minWidth:d.pct>4?0:undefined}}>
                  {d.pct>=8&&<span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{d.pct}%</span>}
                </div> : null;
              })}
            </div>
            {/* Dot pagination */}
            <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:10}}>
              {distData.map((_,i)=>(<div key={i} style={{width:6,height:6,borderRadius:3,background:i===0?"#222941":"rgba(34,41,65,0.2)"}}/>))}
            </div>
          </div>

          {/* Header row */}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",marginTop:16,background:"#F3F6F7",borderRadius:8,border:"1px solid #E7ECEF"}}>
            <span style={{fontSize:11,fontWeight:600,color:"#808387",textTransform:"uppercase",letterSpacing:"0.05em"}}>CARD NAME</span>
            <span style={{fontSize:11,fontWeight:600,color:"#808387",textTransform:"uppercase",letterSpacing:"0.05em"}}>SAVINGS</span>
          </div>

          {/* Per-card rows */}
          {distData.map((d,i)=>{
            const mkt = isMarket(d.name);
            const dot = mkt ? marketDot : (nameDotMap[d.name] || "#999");
            return(<div key={i}>
              <div style={{padding:"14px 14px",background:mkt?"#ECEBFF":"transparent",borderRadius:mkt?10:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                    <div style={{width:10,height:10,borderRadius:2,background:dot,flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:500,color:"rgba(54,64,96,0.6)"}}>{d.name}</span>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:14,fontWeight:500,color:"#364060"}}>{"₹"+f(d.spend)}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#139366"}}>{"₹"+f(d.savings)}</div>
                  </div>
                </div>
                {/* Category tags */}
                {d.categories && d.categories.length>0 && <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                  {d.categories.map((cat,ci)=>(<div key={ci} style={{padding:"4px 10px",borderRadius:12,border:"1px solid #C7D1FF",background:"#fff",fontSize:11,fontWeight:600,color:"#6560A1"}}>{cat}</div>))}
                </div>}
              </div>
              {i<distData.length-1&&<svg width="100%" height="1" style={{display:"block"}}><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeDasharray="4 3"/></svg>}
            </div>);
          })}
          </>);
        })()}
      </div>

      {/* ── COMPARISON OF ANNUAL SAVINGS ── */}
      <div style={{padding:"0 24px"}}>
        <div style={{marginTop:16}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>Comparison of Annual Savings</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3,marginBottom:14}}>This card vs your existing cards</div>
          {(()=>{
            const compCards=(det?.comparisonBars||[{name:card.name,savings:card.savings,color:card.color}]).map((c,i)=>({
              name:c.name,bank:"",savings:c.savings,color:c.color,accent:c.color,isThis:i===0,isUser:i>0,
            })).sort((a,b)=>b.savings-a.savings);
            const mx=Math.max(...compCards.map(c=>c.savings));
            return compCards.map((cc,ci)=>(<div key={ci} style={{marginBottom:ci<compCards.length-1?10:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:44,height:28,borderRadius:6,background:`linear-gradient(135deg,${cc.color},${cc.accent})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CreditCard size={12} strokeWidth={1.5} color="rgba(255,255,255,0.5)"/></div>
                <div style={{flex:1}}>
                  <div style={{height:18,borderRadius:4,background:"#f1f5f9",overflow:"hidden",marginBottom:3}}>
                    <div style={{height:"100%",width:`${(cc.savings/mx)*100}%`,borderRadius:4,background:cc.isThis?"linear-gradient(90deg,#059669,#34d399)":cc.isUser?"linear-gradient(90deg,#84cc16,#bef264)":"linear-gradient(90deg,#ef4444,#fca5a5)"}}/>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:9,fontWeight:700,color:C.text,letterSpacing:0.3}}>{cc.name.toUpperCase()}</span>
                    <span style={{fontSize:12,fontWeight:700,color:C.text}}>₹{f(cc.savings)}</span>
                  </div>
                </div>
              </div>
              {cc.isThis&&ci<compCards.length-1&&<div style={{display:"flex",alignItems:"center",gap:3,padding:"6px 0 0 52px"}}>{[0,1,2].map(d=>(<div key={d} style={{width:3,height:3,borderRadius:"50%",background:C.dim,opacity:0.3}}/>))}<div style={{flex:1,height:1,borderTop:"1.5px dashed rgba(0,0,0,0.06)"}}/>
              </div>}
            </div>));
          })()}
        </div>
      </div>

      {/* ── HOW CAN THIS CARD HELP YOU — Bar Chart + Brands/Categories ── */}
      <div id="bc-overview" style={{padding:"0 24px"}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginTop:20}}>How can this card help you</div>
        <div style={{fontSize:12,color:C.sub,marginTop:4,marginBottom:12}}>Based on your spends in the past 365 days</div>
        <div style={{display:"flex",borderRadius:10,background:C.bg,padding:3,marginBottom:16}}>{["On Brands","On Categories"].map(t=>(<div key={t} onClick={()=>setBcViewMode(t)} style={{flex:1,textAlign:"center",padding:"9px 0",borderRadius:8,cursor:"pointer",background:bcViewMode===t?C.blue:"transparent",color:bcViewMode===t?"#fff":C.sub,fontSize:12,fontWeight:700}}>{t}</div>))}</div>
        {(()=>{
          const catMap={"Amazon":"Shopping","Flipkart":"Shopping","Myntra":"Shopping","Swiggy":"Food & Dining","Zomato":"Food & Dining","MakeMyTrip":"Travel","BigBasket":"Groceries"};
          const _bf=det?.brandFit||card.brandFit||[];
          const brandItems=_bf.map(b=>{const rateNum=typeof b.rate==="string"?parseFloat(b.rate):b.rate||0;const potential=Math.round(b.savings||b.spend*rateNum/100);const saved=Math.round(potential*0.35);return{...b,rate:rateNum,potential,saved,cat:catMap[b.brand||b.name]||"Others",name:b.brand||b.name};});
          const totalPotential=brandItems.reduce((s,b)=>s+b.potential,0);
          const totalSaved=brandItems.reduce((s,b)=>s+b.saved,0);
          /* Build category items by grouping brands */
          const catGroups={};brandItems.forEach(b=>{if(!catGroups[b.cat])catGroups[b.cat]={cat:b.cat,spend:0,potential:0,saved:0,brands:[],icon:b.cat==="Shopping"?"🛒":b.cat==="Food & Dining"?"🍔":b.cat==="Travel"?"✈️":b.cat==="Groceries"?"🥬":"📦"};catGroups[b.cat].spend+=b.spend;catGroups[b.cat].potential+=b.potential;catGroups[b.cat].saved+=b.saved;catGroups[b.cat].brands.push(b.name);});
          const catItems=(Object.values(catGroups) as any[]).sort((a,b)=>b.potential-a.potential);
          const viewItems=bcViewMode==="On Brands"?brandItems:catItems;
          const barMx=Math.max(...viewItems.map(x=>x.potential),1);
          return(<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
          <div><div style={{fontSize:12,color:C.sub}}>Total savings you could earn</div><div style={{fontSize:24,fontWeight:700,color:C.text,marginTop:4}}>₹{f(totalPotential)}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,background:C.green}}/><span style={{fontSize:11,color:C.sub}}>Could save</span></div>
        </div>
        {/* Bar chart */}
        <div style={{background:C.white,borderRadius:16,padding:"24px 0 16px",overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
          <div style={{overflowX:"auto",paddingLeft:16,paddingRight:16}}>
            <div style={{display:"flex",alignItems:"flex-end",height:200,gap:12,minWidth:viewItems.length*76}}>
              {viewItems.map((b,i)=>{const hP=Math.max((b.potential/barMx)*175,24);return(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:"0 0 auto",width:56}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.green,marginBottom:4}}>₹{f(b.potential)}</div>
                  <div style={{width:44,height:hP,borderRadius:"8px 8px 0 0",background:"linear-gradient(to top,#059669,#34d399)"}}/>
                </div>);})}
            </div>
            <div style={{height:1,background:C.brd}}/>
            <div style={{display:"flex",gap:12,marginTop:12,minWidth:viewItems.length*76}}>{viewItems.map((b,i)=>(<div key={i} style={{width:56,display:"flex",justifyContent:"center"}}><div style={{width:32,height:32,borderRadius:10,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{b.icon||"📦"}</div></div>))}</div>
            <div style={{display:"flex",gap:12,marginTop:6,minWidth:viewItems.length*76}}>{viewItems.map((b,i)=>(<div key={i} style={{width:56,textAlign:"center",fontSize:10,fontWeight:600,color:C.sub}}>{b.name||b.cat}</div>))}</div>
          </div>
        </div>
        {/* Accordion */}
        <div style={{padding:"16px 0 0"}}><span style={{fontSize:13,fontWeight:700,color:C.sub}}>Best {bcViewMode==="On Brands"?"brands":"categories"} for this card</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:12}}>
          {viewItems.map((b,i)=>{const expanded=bcDetTab===(100+i);return(<div key={i} style={{background:C.white,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
            <div onClick={()=>setBcDetTab(expanded?-1:(100+i))} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:12,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{b.icon||"📦"}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:C.text}}>{b.name||b.cat}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>{b.cat||"Online shopping"}{b.brands?" · "+b.brands.join(", "):""}</div></div>
              <div style={{textAlign:"right",marginRight:6}}><div style={{fontSize:10,fontWeight:600,color:C.sub}}>Could save</div><div style={{fontSize:14,fontWeight:700,color:C.green}}>₹{f(b.potential)}</div></div>
              <ChevronDown size={16} strokeWidth={1.5} color={C.dim} style={{transform:expanded?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}/>
            </div>
            {expanded&&<div style={{padding:"0 18px 18px"}}>
              <div style={{height:1,background:C.brd,marginBottom:14}}/>
              <div style={{display:"flex"}}>{[{l:"Spent",v:"₹"+f(b.spend),c:C.text},{l:"Saved",v:"₹"+f(b.saved),c:C.green},{l:"Could save",v:"₹"+f(b.potential),c:C.green}].map((s,si)=>(<div key={si} style={{flex:1,textAlign:"center"}}><div style={{fontSize:10,fontWeight:600,color:C.sub}}>{s.l}</div><div style={{fontSize:15,fontWeight:700,color:s.c,marginTop:4}}>{s.v}</div></div>))}</div>
              <div style={{marginTop:14,padding:"14px 16px",borderRadius:12,background:C.bg,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:10,fontWeight:600,color:C.sub}}>Benefit on this card</div><div style={{fontSize:14,fontWeight:700,color:C.text,marginTop:3}}>{b.rate?b.rate+"% cashback":"Up to "+Math.max(...(b.brands||[]).map(br=>{const found=brandItems.find(x=>x.name===br);return found?found.rate:0;}))+"%"}</div></div>
              <div onClick={()=>{const userCards=["HSBC Travel One","Axis Flipkart Card","HSBC Live+"];const currentCard=userCards[0];const capAmt=b.rate>3?Math.round(b.spend*0.03):Math.round(b.spend*b.rate/100*1.5);const brandItem={name:b.name||b.cat,icon:b.icon||"📦",cat:b.cat||"Shopping",totalSpend:b.spend,saved:b.saved,bestSaved:b.potential,bestCard:card.name,bestRate:b.rate||3,altCard:currentCard,altRate:1,breakdown:[{card:card.name,pct:100,spend:b.spend,saved:b.potential}],txnCount:Math.round(b.spend/800),capInfo:"Reward cap on "+(b.name||b.cat)+": ₹"+f(capAmt)+"/month. Switch to "+currentCard+" after cap is reached.",howToUse:["Use "+card.name+" for all "+(b.name||b.cat)+" purchases to earn "+(b.rate||3)+"% back","Maximum reward on this category: ₹"+f(capAmt)+"/month — switch card after cap"]};setOptSheetFrom("bestcards");setOptSheet(brandItem);setScreen("optimize");}} style={{padding:"8px 14px",borderRadius:10,background:"#111827",cursor:"pointer"}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>How to use</span></div></div>
            </div>}
          </div>);})}
        </div>
        </>);})()}
      </div>

      {/* ── CARDS USAGE SECTION ── */}
      {(()=>{
        const CAT_IMG_MAP={"Shopping":"/categories/shopping.png","Groceries":"/categories/groceries.png","Dining":"/categories/food.png","Fuel":"/categories/fuel.png","Bills":"/categories/bills.png","Travel":"/categories/travel.png","Cab Rides":"/categories/cab.png","Insurance":"/categories/milestones.png","Rent":"/categories/bills.png","Education":"/categories/milestones.png"};
        const CAT_BG_MAP={"Shopping":"#FFF3E8","Groceries":"#E8FFE8","Dining":"#FFE8E8","Fuel":"#E8F0FF","Bills":"#FFF8E8","Travel":"#E8F4FF","Cab Rides":"#FFF0E8","Insurance":"#F0E8FF","Rent":"#FFE8F0","Education":"#E8FFF4"};
        const catGrouped={};
        OPT_BRANDS.forEach(b=>{const cat=b.cat||"Other";if(!catGrouped[cat])catGrouped[cat]={cat,brands:[],totalSpend:0,totalSavings:0};catGrouped[cat].brands.push(b);catGrouped[cat].totalSpend+=b.totalSpend;catGrouped[cat].totalSavings+=b.bestSaved;});
        const categories=Object.values(catGrouped).sort((a,b)=>(b as any).totalSavings-(a as any).totalSavings) as any[];
        if(categories.length===0)return null;
        const _cuActiveCat=(window as any).__bcCuCat||categories[0].cat;
        const setCuCat=(c)=>{(window as any).__bcCuCat=c;setBcDetTab(v=>v);};
        const activeCat=categories.find(c=>c.cat===_cuActiveCat)||categories[0];
        const activeBrands=activeCat.brands||[];
        const cardGroups={};activeBrands.forEach(b=>{const cn=b.bestCard;if(!cardGroups[cn])cardGroups[cn]={card:cn,spend:0,savings:0,rate:0,brands:[]};cardGroups[cn].spend+=b.totalSpend;cardGroups[cn].savings+=b.bestSaved;cardGroups[cn].brands.push(b.name);});
        const cardRows=Object.values(cardGroups).sort((a,b)=>(b as any).spend-(a as any).spend) as any[];
        cardRows.forEach(cr=>{cr.rate=cr.spend>0?((cr.savings/cr.spend)*100).toFixed(1):0;});
        const totalCatSpend=activeCat.totalSpend;
        const totalCatSavings=activeCat.totalSavings;
        const CARD_COLORS={};USER_CARDS.forEach(uc=>{CARD_COLORS[uc.name]=uc.color;});
        const CARD_IMGS={};USER_CARDS.forEach(uc=>{CARD_IMGS[uc.name]=uc.image;});
        const CARD_ACCENTS={};USER_CARDS.forEach(uc=>{CARD_ACCENTS[uc.name]=uc.accent;});
        return(
        <div style={{padding:"0 24px",marginTop:24}}>
          <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>Cards Usage</div>
          {/* Category picker */}
          <div style={{overflowX:"auto",marginTop:16,marginLeft:-24,marginRight:-24,paddingLeft:24,paddingRight:24}}>
            <div style={{display:"flex",gap:14,minWidth:categories.length*80,background:"linear-gradient(180deg, rgba(224,236,255,0.3) 0%, rgba(255,243,210,0.3) 50%, rgba(255,255,255,0) 100%)",padding:"12px 0 8px",borderRadius:12}}>
              {categories.map((cat,ci)=>{const isActive=cat.cat===activeCat.cat;return(
                <div key={ci} onClick={()=>setCuCat(cat.cat)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",minWidth:60,flexShrink:0}}>
                  <div style={{width:48,height:48,borderRadius:14,background:CAT_BG_MAP[cat.cat]||"#F0F0F0",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                    <img src={CAT_IMG_MAP[cat.cat]||"/categories/shopping.png"} alt={cat.cat} style={{width:36,height:36,objectFit:"contain"}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:isActive?700:400,color:isActive?"#0064E0":"#000",textAlign:"center",lineHeight:1.2}}>{cat.cat}</span>
                  {isActive&&<div style={{width:24,height:3,borderRadius:2,background:"linear-gradient(90deg,#FFD700,#FFA500)"}}/>}
                </div>);})}
            </div>
          </div>
          {/* Save Upto headline */}
          <div style={{marginTop:20}}>
            <div style={{fontSize:11,fontWeight:500,color:"#808387",letterSpacing:"0.05em"}}>Save Upto</div>
            <div className="legacy-serif" style={{fontSize:32,fontWeight:800,background:"linear-gradient(135deg, #0064E0, #1a5276)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.2}}>{"₹"+f(totalCatSavings)+"/yr"}</div>
            <div style={{fontSize:12,fontWeight:400,color:"#808387",marginTop:4}}>{"Based on "+activeCat.cat+" Spends of ₹"+f(totalCatSpend)+"/yr"}</div>
          </div>
          {/* CARDS TO USE table */}
          <div style={{marginTop:16,background:"#fff",borderRadius:16,padding:"16px 14px",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:10,fontWeight:500,color:"#808387",letterSpacing:"0.1em",textTransform:"uppercase"}}>Cards to use</span>
              <span style={{fontSize:10,fontWeight:500,color:"#808387",letterSpacing:"0.1em",textTransform:"uppercase"}}>You spend</span>
            </div>
            {cardRows.map((cr,ri)=>{const cardObj=USER_CARDS.find(uc=>uc.name===cr.card);const cardColor=CARD_COLORS[cr.card]||"#333";const cardImg=CARD_IMGS[cr.card]||null;return(
              <div key={ri}>
                {ri>0&&<svg width="100%" height="2" style={{margin:"10px 0"}}><line x1="0" y1="1" x2="100%" y2="1" stroke="#D1E3F6" strokeDasharray="2 2"/></svg>}
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:54,height:36,borderRadius:2.7,overflow:"hidden",background:`linear-gradient(135deg,${cardColor},${CARD_ACCENTS[cr.card]||cardColor})`,flexShrink:0,boxShadow:"0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)"}}>
                    {cardImg?<img src={cardImg} alt={cr.card} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<CreditCard size={14} strokeWidth={1} color="rgba(255,255,255,0.4)" style={{margin:"auto",display:"block",marginTop:10}}/>}
                  </div>
                  <div style={{width:9,height:9,borderRadius:"50%",background:cardColor,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#36405E"}}>{cr.card}</div>
                    <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:1}}>{"Gives "+cr.rate+"% Cashback"}</div>
                  </div>
                  <div style={{fontSize:11,fontWeight:500,color:"#36405E",textAlign:"right"}}>{"₹"+f(cr.spend)}</div>
                </div>
              </div>);})}
          </div>
          {/* SPEND DISTRIBUTION mini bar */}
          <div style={{marginTop:16}}>
            <span style={{fontSize:10,fontWeight:500,color:"#808387",letterSpacing:"0.1em",textTransform:"uppercase"}}>Spend Distribution</span>
            <div style={{marginTop:8,height:24,borderRadius:12,overflow:"hidden",display:"flex",background:"#F1F3F7"}}>
              {(()=>{const colors=["#059669","#3B82F6","#F59E0B","#8B5CF6","#EF4444"];return cardRows.map((cr,ri)=>{const pct=totalCatSpend>0?Math.round((cr.spend/totalCatSpend)*100):0;if(pct<1)return null;return(<div key={ri} style={{width:pct+"%",height:"100%",background:colors[ri%colors.length],display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{pct>8?pct+"%":""}</span></div>);});})()}
            </div>
            <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
              {(()=>{const colors=["#059669","#3B82F6","#F59E0B","#8B5CF6","#EF4444"];return cardRows.map((cr,ri)=>{const pct=totalCatSpend>0?Math.round((cr.spend/totalCatSpend)*100):0;return(<div key={ri} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:colors[ri%colors.length]}}/><span style={{fontSize:10,fontWeight:500,color:"#36405E"}}>{cr.card} ({pct}%)</span></div>);});})()}
            </div>
          </div>
        </div>);
      })()}

      {/* ── HOW TO SPEND TIMELINE ── */}
      {(()=>{
        const _htTab=(window as any).__bcHtTab||"howToSpend";
        const setHtTab=(t)=>{(window as any).__bcHtTab=t;setBcDetTab(v=>v);};
        const _htPeriod=(window as any).__bcHtPeriod||"monthly";
        const setHtPeriod=(p)=>{(window as any).__bcHtPeriod=p;setBcDetTab(v=>v);};
        const isYearly=_htPeriod==="yearly";
        const mult=isYearly?12:1;
        const perLabel=isYearly?"/yr":"/mn";
        const CARD_IMGS_MAP={};USER_CARDS.forEach(uc=>{CARD_IMGS_MAP[uc.name]=uc.image;});
        const CARD_COLORS_MAP={};USER_CARDS.forEach(uc=>{CARD_COLORS_MAP[uc.name]=uc.color;});
        const steps=[];
        const topBrands=OPT_BRANDS.slice(0,6);
        topBrands.forEach(b=>{
          const monthlySpend=Math.round(b.totalSpend/12);
          const monthlySavings=Math.round(b.bestSaved/12);
          steps.push({type:"card",card:b.bestCard,brand:b.name,spend:monthlySpend*mult,savings:monthlySavings*mult,via:b.cat||"",rate:b.bestRate});
          if(b.capInfo){
            steps.push({type:"cap",card:b.bestCard,text:"Reward points cap reached on "+b.bestCard,sub:b.capInfo});
            if(b.altCard&&b.altCard!==b.bestCard){
              const altMonthly=Math.round(monthlySpend*0.3);
              const altSavings=Math.round(altMonthly*(b.altRate/100));
              steps.push({type:"card",card:b.altCard,brand:b.name,spend:altMonthly*mult,savings:altSavings*mult,via:"after cap",rate:b.altRate});
            }
          }
        });
        if(steps.length===0)return null;
        return(
        <div style={{padding:"0 24px",marginTop:24}}>
          {/* Tab row */}
          <div style={{display:"flex",gap:0,marginBottom:16}}>
            {[{k:"howToSpend",l:"HOW TO SPEND"},{k:"savings",l:"SAVINGS"}].map(t=>(<div key={t.k} onClick={()=>setHtTab(t.k)} style={{flex:1,textAlign:"center",padding:"10px 0",cursor:"pointer",borderBottom:_htTab===t.k?"2.5px solid #1a1f36":"2.5px solid transparent",color:_htTab===t.k?"#36405E":"#808387",fontSize:11,fontWeight:700,letterSpacing:"0.1em"}}>{t.l}</div>))}
          </div>
          {/* Filter row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <span style={{fontSize:12,fontWeight:500,color:"#36405E"}}>Filter Spends & Savings</span>
            <div style={{width:143,height:28,borderRadius:6,display:"flex",overflow:"hidden",background:"#F1F3F7",boxShadow:"inset 1px 1px 2px rgba(0,0,0,0.08)"}}>
              {["monthly","yearly"].map(p=>(<div key={p} onClick={()=>setHtPeriod(p)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:_htPeriod===p?"#fff":"transparent",borderRadius:_htPeriod===p?5:0,boxShadow:_htPeriod===p?"0 1px 3px rgba(0,0,0,0.1)":"none",margin:_htPeriod===p?1:0}}><span style={{fontSize:11,fontWeight:_htPeriod===p?600:400,color:_htPeriod===p?"#36405E":"#808387"}}>{p==="monthly"?"Monthly":"Yearly"}</span></div>))}
            </div>
          </div>
          {_htTab==="howToSpend"?(
          <div style={{position:"relative",paddingLeft:36}}>
            {steps.map((step,si)=>{const isLast=si===steps.length-1;return(
              <div key={si} style={{position:"relative",paddingBottom:isLast?0:20,minHeight:step.type==="cap"?60:70}}>
                {!isLast&&<div style={{position:"absolute",left:-20,top:step.type==="cap"?24:37,bottom:0,width:0,borderLeft:"2px dashed #D1E3F6"}}/>}
                {step.type==="card"?(
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",left:-36-14,top:0,width:55.82,height:37.22,borderRadius:4,overflow:"hidden",background:`linear-gradient(135deg,${CARD_COLORS_MAP[step.card]||"#333"},${CARD_COLORS_MAP[step.card]||"#666"})`,boxShadow:"0 3px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)"}}>
                    {CARD_IMGS_MAP[step.card]?<img src={CARD_IMGS_MAP[step.card]} alt={step.card} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<CreditCard size={14} strokeWidth={1} color="rgba(255,255,255,0.4)" style={{margin:"auto",display:"block",marginTop:10}}/>}
                  </div>
                  <div style={{paddingLeft:24}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#36405E",lineHeight:1.4}}>{"Spend ₹"+f(step.spend)+perLabel+" on "+step.card}</div>
                    <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:2}}>{"via "+step.brand+(step.via?" ("+step.via+")":"")}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#139366",marginTop:4}}>{"₹"+f(step.savings)+perLabel}</div>
                  </div>
                </div>
                ):(
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",left:-36-4,top:0,width:24,height:24,borderRadius:"50%",background:"#FCF5F5",border:"1px solid #B98F8F",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <LockIcon size={12} strokeWidth={1.5} color="#B98F8F"/>
                  </div>
                  <div style={{paddingLeft:24}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#36405E",lineHeight:1.4}}>{step.text}</div>
                    <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:2}}>{step.sub}</div>
                  </div>
                </div>
                )}
              </div>);})}
          </div>
          ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {(()=>{const savMap={};steps.filter(s=>s.type==="card").forEach(s=>{if(!savMap[s.card])savMap[s.card]={card:s.card,savings:0,spend:0};savMap[s.card].savings+=s.savings;savMap[s.card].spend+=s.spend;});return Object.values(savMap).sort((a,b)=>(b as any).savings-(a as any).savings).map((sr:any,sri)=>(
              <div key={sri} style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:54,height:36,borderRadius:4,overflow:"hidden",background:`linear-gradient(135deg,${CARD_COLORS_MAP[sr.card]||"#333"},${CARD_COLORS_MAP[sr.card]||"#666"})`,flexShrink:0,boxShadow:"0 2px 6px rgba(0,0,0,0.12)"}}>
                  {CARD_IMGS_MAP[sr.card]?<img src={CARD_IMGS_MAP[sr.card]} alt={sr.card} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<CreditCard size={14} strokeWidth={1} color="rgba(255,255,255,0.4)" style={{margin:"auto",display:"block",marginTop:10}}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#36405E"}}>{sr.card}</div>
                  <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:2}}>{"Spend ₹"+f(sr.spend)+perLabel}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#139366"}}>{"₹"+f(sr.savings)+perLabel}</div>
                  <div style={{fontSize:10,fontWeight:400,color:"#808387"}}>savings</div>
                </div>
              </div>));})()}
          </div>
          )}
          {/* Promo card */}
          <div style={{marginTop:24,background:"linear-gradient(135deg, #EFF6FF, #F0FDF4)",borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}><Calculator size={22} strokeWidth={1.5} color="#0064E0"/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:"#36405E",lineHeight:1.3}}>Use Savings Finder the next time you pay</div>
              <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:3}}>Calculate exact rewards before every transaction</div>
            </div>
            <div onClick={()=>setScreen("calculate")} style={{padding:"8px 12px",borderRadius:8,background:"linear-gradient(90deg, #222941, #101C43)",cursor:"pointer",flexShrink:0}}><span style={{fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>Try now ›</span></div>
          </div>
        </div>);
      })()}
      </>)}

      {bcSection==="benefits"&&(<>
      {/* ── WELCOME BENEFITS ── */}
      <div id="bc-benefits">
        <div style={{height:10,background:"rgba(23,73,47,0.06)",marginTop:20}}/>
        <div style={{padding:"20px 24px 0"}}>
          <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>Welcome Benefits</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
            {det.welcome.map((w,i)=>(<div key={i} style={{display:"flex",gap:14,padding:"16px",background:"#fff",borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
              <div style={{width:45,height:42,borderRadius:8,background:"#F7F5F5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Gift size={20} strokeWidth={1.5} color={C.green}/></div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:"#36405E"}}>{w.t}</div><div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:4,lineHeight:1.5}}>{w.d}</div></div>
            </div>))}
          </div>
        </div>
      </div>

      {/* ── MILESTONE BENEFITS ── */}
      <div style={{padding:"0 24px",marginTop:24}}>
        <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>Milestone Benefits</div>
        <div style={{display:"flex",flexDirection:"column",gap:0,marginTop:16,position:"relative"}}>
          {det.milestones.map((m,i)=>{const isClaimable=m.thr<=TOTAL_ACC;const remaining=m.thr-TOTAL_ACC;return(<div key={i} style={{display:"flex",gap:14}}>
            {/* Timeline node */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:28,flexShrink:0}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:isClaimable?"#25DC9B":"#E8EBED",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>{isClaimable?<Check size={12} strokeWidth={2.5} color="#fff"/>:<LockIcon size={12} strokeWidth={1.5} color="#9ca3af"/>}</div>
              {i<det.milestones.length-1&&<div style={{width:0,flex:1,borderLeft:"2px dashed #D1E3F6",minHeight:40}}/>}
            </div>
            {/* Milestone card */}
            <div style={{flex:1,paddingBottom:i<det.milestones.length-1?20:0}}>
              <div style={{padding:"16px",background:"#fff",borderRadius:12,border:isClaimable?"1px solid #25DC9B":"1px solid #E8EBED",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
                <div style={{fontSize:14,fontWeight:500,color:"#36405E"}}>{m.t}</div>
                <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:4,lineHeight:1.5}}>{m.d}</div>
                <div style={{marginTop:10}}>
                  {isClaimable
                    ?<span style={{display:"inline-block",padding:"4px 10px",borderRadius:6,background:"#E0F9ED",fontSize:9,fontWeight:700,color:"#08CF6F",textTransform:"uppercase",letterSpacing:"0.1em"}}>CLAIMABLE</span>
                    :<span style={{display:"inline-block",padding:"4px 10px",borderRadius:6,background:"#FCF9EA",fontSize:9,fontWeight:700,color:"#CF6C08",textTransform:"uppercase",letterSpacing:"0.1em"}}>{"SPEND ₹"+f(remaining)+"/YR MORE TO UNLOCK"}</span>
                  }
                </div>
              </div>
            </div>
          </div>);})}
        </div>
      </div>

      {/* ── LOUNGE & ADDITIONAL BENEFITS ── */}
      <div style={{padding:"0 24px",marginTop:24}}>
        <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>Lounge and Additional Benefits</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
          {det.lounge.map((l,i)=>{const lIcon=l.t.toLowerCase().includes("movie")||l.t.toLowerCase().includes("ticket")?<Tv size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("railway")?<MapPin size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("golf")?<Target size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("concierge")?<Sparkles size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("dining")?<UtensilsCrossed size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("no ")?<X size={18} strokeWidth={1.5} color={C.dim}/>:<Plane size={18} strokeWidth={1.5} color={C.dim}/>;return(<div key={i} style={{display:"flex",gap:14,padding:"16px",background:"#fff",borderRadius:12,border:"1px solid #E8EBED",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
            <div style={{width:45,height:42,borderRadius:8,background:"#F7F5F5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{lIcon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:"#36405E"}}>{l.t}</div><div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:4,lineHeight:1.5}}>{l.d}</div></div>
          </div>);})}
        </div>
      </div>
      </>)}

      {bcSection==="fee"&&(<>
      {/* ── FEES & WAIVERS ── */}
      <div id="bc-fee" style={{padding:"0 24px",marginTop:24}}>
        <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>Fees & Waivers</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
          {/* Annual Fee card */}
          <div style={{padding:"16px",background:"#fff",borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",gap:14}}>
              <div style={{width:45,height:42,borderRadius:8,background:"#F7F5F5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>💰</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:"#36405E"}}>{`Annual Fee (${det.fees.annual})`}</div>
                <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:4,lineHeight:1.5}}>{det.fees.waiver}</div>
                {det.fees.waiverStatus&&det.fees.waiverStatus!=="N/A"&&<span style={{display:"inline-block",marginTop:8,padding:"4px 10px",borderRadius:6,background:"#E0F9ED",fontSize:9,fontWeight:700,color:"#08CF6F",textTransform:"uppercase",letterSpacing:"0.1em"}}>CAN WAIVE ON EXISTING SPENDS</span>}
              </div>
            </div>
          </div>
          {/* Joining Fee card */}
          <div style={{padding:"16px",background:"#fff",borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",gap:14}}>
              <div style={{width:45,height:42,borderRadius:8,background:"#F7F5F5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>🎫</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:"#36405E"}}>{`Joining Fee (${det.fees.joining})`}</div>
                <div style={{fontSize:11,fontWeight:400,color:"#808387",marginTop:4,lineHeight:1.5}}>{det.fees.joining==="Nil"?"No joining fee":"Fee is mandatory and non-waivable"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ADDITIONAL BANK FEE ── */}
        <div style={{marginTop:28}}>
          {/* Diamond divider + title */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,opacity:0.4}}>
            <div style={{flex:1,height:0,borderTop:"1px dashed #A09784"}}/>
            {[0,1,2].map(d=>(<div key={d} style={{width:3,height:3,background:"#A09784",transform:"rotate(45deg)",flexShrink:0}}/>))}
            <div style={{flex:1,height:0,borderTop:"1px dashed #A09784"}}/>
          </div>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(68,63,63,0.7)",textTransform:"uppercase",letterSpacing:"0.2em",textAlign:"center",marginBottom:14}}>ADDITIONAL BANK FEE</div>
          <div style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
            {det.fees.bankFees.map(([l,v],i)=>(<div key={i} style={{display:"flex",borderBottom:i<det.fees.bankFees.length-1?"1px solid #EEEEEE":"none"}}>
              <div style={{flex:1,padding:"12px 16px",background:"#F7F8F9",fontSize:12,fontWeight:400,color:"#808387"}}>{l}</div>
              <div style={{flex:1,padding:"12px 16px",background:"#FFFFFF",borderLeft:"1px solid #EEEEEE",fontSize:12,fontWeight:600,color:"#1C2A33"}}>{v}</div>
            </div>))}
          </div>
        </div>

        {/* ── FEE ON LATE BILL PAYMENT ── */}
        <div style={{marginTop:28}}>
          {/* Diamond divider + title */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,opacity:0.4}}>
            <div style={{flex:1,height:0,borderTop:"1px dashed #A09784"}}/>
            {[0,1,2].map(d=>(<div key={d} style={{width:3,height:3,background:"#A09784",transform:"rotate(45deg)",flexShrink:0}}/>))}
            <div style={{flex:1,height:0,borderTop:"1px dashed #A09784"}}/>
          </div>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(68,63,63,0.7)",textTransform:"uppercase",letterSpacing:"0.2em",textAlign:"center",marginBottom:14}}>FEE ON LATE BILL PAYMENT</div>
          <div style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
            {/* Header row */}
            <div style={{display:"flex",borderBottom:"1px solid #EEEEEE"}}>
              <div style={{flex:1,padding:"12px 16px",background:"#F7F8F9",fontSize:11,fontWeight:600,color:"#808387"}}>Amount Due</div>
              <div style={{flex:1,padding:"12px 16px",background:"#F7F8F9",borderLeft:"1px solid #EEEEEE",fontSize:11,fontWeight:600,color:"#808387"}}>Late Payment Fee</div>
            </div>
            {det.fees.lateFees.map(([l,v],i)=>(<div key={i} style={{display:"flex",borderBottom:i<det.fees.lateFees.length-1?"1px solid #EEEEEE":"none"}}>
              <div style={{flex:1,padding:"12px 16px",background:"#F7F8F9",fontSize:12,fontWeight:400,color:"#808387"}}>{l}</div>
              <div style={{flex:1,padding:"12px 16px",background:"#FFFFFF",borderLeft:"1px solid #EEEEEE",fontSize:12,fontWeight:600,color:"#1C2A33"}}>{v}</div>
            </div>))}
          </div>
        </div>
      </div>
      </>)}

      {bcSection==="eligibility"&&(<>
      {/* ── ELIGIBILITY & T&C ── */}
      {(()=>{
        const _eligType=(window as any).__bcEligType||"salaried";
        const setEligType=(t:string)=>{(window as any).__bcEligType=t;setBcDetTab(v=>v);};
        const _eligPin=(window as any).__bcEligPin||"";
        const setEligPin=(v:string)=>{(window as any).__bcEligPin=v;setBcDetTab(v2=>v2);};
        const _eligIncome=(window as any).__bcEligIncome||"";
        const setEligIncome=(v:string)=>{(window as any).__bcEligIncome=v;setBcDetTab(v2=>v2);};
        const _eligIncomeType=(window as any).__bcEligIncomeType||"salaried";
        const setEligIncomeType=(t:string)=>{(window as any).__bcEligIncomeType=t;setBcDetTab(v=>v);};
        return(
      <div id="bc-eligibility" style={{padding:"0 24px",marginTop:24}}>
        {/* ── Eligibility Criteria ── */}
        <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)"}}>Eligibility Criteria</div>

        {/* Salaried / Self Employed toggle */}
        <div style={{display:"flex",marginTop:16,background:"#F4F8FF",borderRadius:10,padding:3,boxShadow:"inset 1px 1px 2px rgba(0,0,0,0.06), inset -1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(0,0,0,0.04)"}}>
          {["salaried","self-employed"].map(t=>(<div key={t} onClick={()=>setEligType(t)} style={{flex:1,textAlign:"center",padding:"10px 0",borderRadius:8,cursor:"pointer",background:_eligType===t?"#fff":"transparent",boxShadow:_eligType===t?"0 1px 3px rgba(0,0,0,0.1)":"none",transition:"all 0.2s"}}><span style={{fontSize:12,fontWeight:_eligType===t?600:400,color:_eligType===t?"#222941":"#808387"}}>{t==="salaried"?"Salaried":"Self Employed"}</span></div>))}
        </div>

        {/* 2-column grid: Age + Salary */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #E2E8EF",padding:16}}>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(54,64,96,0.7)"}}>Age Criteria</div>
            <div style={{fontSize:16,fontWeight:700,color:"#222941",marginTop:6}}>21-60 Yrs</div>
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #E2E8EF",padding:16}}>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(54,64,96,0.7)"}}>Salary Criteria</div>
            <div style={{fontSize:16,fontWeight:700,color:"#222941",marginTop:6}}>{_eligType==="salaried"?"6 LPA":"8 LPA"}</div>
          </div>
        </div>

        {/* 3-column grid: Credit Rating, New to credit, Existing Bank Customer */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:10}}>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #E2E8EF",padding:16}}>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(54,64,96,0.7)"}}>Credit Rating</div>
            <div style={{fontSize:16,fontWeight:700,color:"#222941",marginTop:6}}>725+</div>
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #E2E8EF",padding:16}}>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(54,64,96,0.7)"}}>New to credit</div>
            <div style={{fontSize:16,fontWeight:700,color:"#222941",marginTop:6}}>Yes</div>
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #E2E8EF",padding:16}}>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(54,64,96,0.7)",lineHeight:1.3}}>Existing Bank Customer</div>
            <div style={{fontSize:16,fontWeight:700,color:"#222941",marginTop:6}}>Yes</div>
          </div>
        </div>

        {/* ── Check if you are eligible ── */}
        <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)",marginTop:28}}>Check if you are eligible</div>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",padding:16,marginTop:16}}>
          {/* Pin Code */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:500,color:"#36405E",marginBottom:6}}>Pin Code</div>
            <input value={_eligPin} onChange={e=>{(window as any).__bcEligPin=e.target.value;setBcDetTab(v=>v);}} placeholder="Enter your pin code" style={{width:"100%",padding:"12px 14px",borderRadius:8,border:"1px solid #D3E4FA",fontSize:14,fontFamily:FN,fontWeight:400,color:"#1C2A33",outline:"none",boxSizing:"border-box",background:"#fff"}}/>
          </div>
          {/* Monthly Income */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:500,color:"#36405E",marginBottom:6}}>Monthly Income</div>
            <input value={_eligIncome} onChange={e=>{(window as any).__bcEligIncome=e.target.value;setBcDetTab(v=>v);}} placeholder="Enter monthly income" style={{width:"100%",padding:"12px 14px",borderRadius:8,border:"1px solid #D3E4FA",fontSize:14,fontFamily:FN,fontWeight:400,color:"#1C2A33",outline:"none",boxSizing:"border-box",background:"#fff"}}/>
          </div>
          {/* Income Type selector */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:500,color:"#36405E",marginBottom:6}}>Income Type</div>
            <div style={{display:"flex",gap:10}}>
              {["salaried","self-employed"].map(t=>(<div key={t} onClick={()=>{(window as any).__bcEligIncomeType=t;setBcDetTab(v=>v);}} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 0",borderRadius:8,border:_eligIncomeType===t?"1.5px solid #1D4ED8":"1.5px solid #E2E8EF",background:_eligIncomeType===t?"rgba(29,78,216,0.04)":"#fff",cursor:"pointer"}}>
                {t==="salaried"?<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="1.5" stroke={_eligIncomeType===t?"#1D4ED8":"#9ca3af"} strokeWidth="1.2"/><path d="M5 4V2.5A1.5 1.5 0 016.5 1h3A1.5 1.5 0 0111 2.5V4" stroke={_eligIncomeType===t?"#1D4ED8":"#9ca3af"} strokeWidth="1.2"/></svg>
                :<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke={_eligIncomeType===t?"#1D4ED8":"#9ca3af"} strokeWidth="1.2"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={_eligIncomeType===t?"#1D4ED8":"#9ca3af"} strokeWidth="1.2" strokeLinecap="round"/></svg>}
                <span style={{fontSize:12,fontWeight:_eligIncomeType===t?600:400,color:_eligIncomeType===t?"#1D4ED8":"#808387"}}>{t==="salaried"?"Salaried":"Self Employed"}</span>
              </div>))}
            </div>
          </div>
          {/* Check Eligibility button */}
          <div onClick={()=>setToast({text:"Eligibility check coming soon!",type:"info"})} style={{padding:"14px 0",borderRadius:10,background:"#D6E6FB",textAlign:"center",cursor:"pointer"}}>
            <span style={{fontSize:14,fontWeight:600,color:"#1D4ED8"}}>Check Eligibility</span>
          </div>
          {/* Disclaimer */}
          <div style={{marginTop:14}}>
            <svg width="100%" height="1" style={{display:"block"}}><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#D1E3F6" strokeDasharray="2 2"/></svg>
            <div style={{fontSize:10,fontWeight:400,color:"rgba(54,64,96,0.5)",marginTop:10,lineHeight:1.5}}>This is for indicative purposes only. Final eligibility is subject to the issuing bank's verification and approval process.</div>
          </div>
        </div>

        {/* ── Terms and Conditions ── */}
        <div className="legacy-serif" style={{fontSize:20,fontWeight:700,color:"rgba(54,64,96,0.9)",marginTop:28}}>Terms and Conditions</div>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",padding:16,marginTop:16}}>
          <div style={{fontSize:11,fontWeight:400,color:"#808387",lineHeight:1.6}}>
            Terms and conditions for the {card.name} card are subject to the issuing bank's policies. Please refer to the bank's official website for the most recent and complete terms, including reward program rules, interest rates, fee schedules, and dispute resolution procedures.
          </div>
        </div>
      </div>);})()}
      </>)}

      {/* ── BOTTOM CTA ── */}
      <div style={{padding:"32px 20px 20px"}}/>
    </div></div>
    {/* Sticky bottom CTA */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.white,boxShadow:"0 -2px 16px rgba(0,0,0,0.06)",padding:"12px 24px",paddingBottom:"max(12px, env(safe-area-inset-bottom))",display:"flex",gap:10,zIndex:30}}>
      <div onClick={()=>setBcEligSheet(card)} style={{padding:"12px 14px",borderRadius:12,border:`1.5px solid ${C.brd}`,textAlign:"center",cursor:"pointer",whiteSpace:"nowrap"}}><span style={{fontSize:13,fontWeight:600,color:C.text}}>Swap & compare</span></div>
      <div onClick={()=>setBcEligSheet(card)} style={{flex:1,padding:"12px",borderRadius:12,background:"#111827",textAlign:"center",cursor:"pointer",whiteSpace:"nowrap"}}><span style={{fontSize:14,fontWeight:700,color:"#fff"}}>Apply Now →</span></div>
    </div>
    {bcEligSheet&&<div onClick={e=>{if(e.target===e.currentTarget)setBcEligSheet(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:250,padding:"0 16px 16px"}}>
      <div style={{background:C.white,borderRadius:24,padding:"16px 22px 32px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 20px"}}/>
        <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:16}}>Eligibility for {bcEligSheet.name}</div>
        {[{l:"Minimum Income",v:({"HDFC Infinia":"₹10,00,000/yr","Amex MRCC":"₹6,00,000/yr","HDFC Regalia":"₹6,00,000/yr","Axis Atlas":"₹15,00,000/yr","ICICI Sapphiro":"₹12,00,000/yr","OneCard":"No minimum","IDFC First Classic":"No minimum","ICICI Amazon Pay":"No minimum","Kotak 811":"FD of ₹5,000 minimum"})[bcEligSheet.name]||"₹3,00,000/yr"},{l:"Card Type",v:bcEligSheet.annualFee===0?"Lifetime Free":"Paid — ₹"+f(bcEligSheet.annualFee)+"/yr"},{l:"Fee Waiver",v:bcEligSheet.annualFee===0?"N/A — no fee":"Check bank T&Cs for spend-based waiver"},{l:"Approval Time",v:"3-7 business days"},{l:"Documents",v:"PAN, Aadhaar, Income proof"}].map((r,ri)=>(<div key={ri} style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderBottom:ri<4?`1px solid ${C.brd}`:"none"}}><span style={{fontSize:13,color:C.sub}}>{r.l}</span><span style={{fontSize:13,fontWeight:600,color:C.text,textAlign:"right",maxWidth:180}}>{r.v}</span></div>))}
        <div onClick={()=>setBcEligSheet(null)} style={{marginTop:20,padding:"16px",borderRadius:14,background:"#111827",textAlign:"center",cursor:"pointer"}}><span style={{fontSize:14,fontWeight:700,color:"#fff"}}>Proceed to Apply →</span></div>
        <div onClick={()=>setBcEligSheet(null)} style={{marginTop:10,textAlign:"center",padding:8,cursor:"pointer"}}><span style={{fontSize:13,fontWeight:600,color:C.sub}}>Maybe later</span></div>
      </div>
    </div>}
    <Toast/></div>);}

    const BC_IMG_MAP:Record<string,string>={};

    /* ═══ BEST CARDS LIST PAGE ═══ */
    return(<div style={{fontFamily:FN,width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative",background:"#F4F9FA"}}><div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"#F4F9FA",paddingBottom:100}}><div key="bestcards" className="slide-in"><FL/>

      {/* ── DARK GREEN HEADER ── */}
      <div style={{background:"linear-gradient(360deg, #055B37 0%, #0B2D1C 80.8%)",position:"relative",overflow:"hidden",height:348,padding:"0 16px",boxSizing:"border-box"}}>
        {/* Status bar spacer */}
        <div style={{height:44}}/>
        {/* Back arrow */}
        <div onClick={()=>setScreen(bcFromScreen||"home")} style={{position:"absolute",top:57.5,left:16,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:2}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M8.70703 5.29286C9.09753 4.90236 9.73056 4.90241 10.1211 5.29286C10.5116 5.68338 10.5116 6.31639 10.1211 6.70692L5.82812 10.9999H20.4141C20.9663 10.9999 21.4141 11.4476 21.4141 11.9999C21.4141 12.5522 20.9663 12.9999 20.4141 12.9999H5.82812L10.1211 17.2929C10.5116 17.6834 10.5116 18.3164 10.1211 18.7069C9.73056 19.0974 9.09753 19.0974 8.70703 18.7069L2 11.9999L8.70703 5.29286Z" fill="white"/></svg>
        </div>
        {/* Title block — centered */}
        <div style={{textAlign:"center",marginTop:50,position:"relative",zIndex:2}}>
          <div style={{fontSize:14,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",color:"#fff"}}>BEST CARDS FOR YOU</div>
          <div style={{fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.04em",color:"rgba(217,218,218,0.8)",marginTop:4}}>BASED ON YOUR ANNUAL SPENDS</div>
        </div>
        {/* Glass card — centered */}
        <div style={{position:"relative",width:320,margin:"16px auto 0",zIndex:2}}>
          {/* Conic gradient border wrapper */}
          <div style={{borderRadius:20,padding:1,background:"conic-gradient(from 102.21deg at 52.75% 38.75%, rgba(249,249,249,0.3) 0deg, rgba(64,64,64,0.5) 43deg, rgba(64,64,64,0.35) 65deg, rgba(255,255,255,0.3) 93deg, rgba(255,255,255,0.3) 141deg, rgba(64,64,64,0.35) 221deg, rgba(249,249,249,0.5) 241deg, rgba(255,255,255,0.3) 320deg, rgba(249,249,249,0.3) 360deg)"}}>
            <div style={{width:"100%",borderRadius:19,background:"rgba(255,255,255,0.03)",backdropFilter:"blur(25px)",WebkitBackdropFilter:"blur(25px)",padding:"16px 20px 20px",boxSizing:"border-box"}}>
              {/* Top row: Annual Spends | Current Savings */}
              <div style={{display:"flex",alignItems:"center"}}>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:400,lineHeight:"140%",color:"rgba(255,255,255,0.6)"}}>Annual Spends</div>
                  <div style={{fontSize:13,fontWeight:500,lineHeight:"150%",color:"rgba(255,255,255,0.9)",marginTop:3}}>{"₹"+f(TOTAL_ACC)}</div>
                </div>
                <div style={{width:1,height:28,background:"rgba(245,245,245,0.15)",flexShrink:0}}/>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:400,lineHeight:"140%",color:"rgba(255,255,255,0.6)"}}>Current Savings</div>
                  <div style={{fontSize:13,fontWeight:500,lineHeight:"150%",color:"rgba(255,255,255,0.9)",marginTop:3}}>{"₹"+f(SAVINGS_BARS.bar1)+"/yr"}</div>
                </div>
              </div>
              {/* Horizontal divider */}
              <div style={{height:1,background:"rgba(255,255,255,0.1)",margin:"14px 0"}}/>
              {/* Bottom section: You Could Save */}
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,0.6)"}}>You Could Save</div>
                <div style={{filter:"drop-shadow(0px 26px 10px rgba(73,203,133,0.03)) drop-shadow(0px 15px 9px rgba(73,203,133,0.1))"}}>
                  <div className="legacy-serif" style={{fontSize:32,fontWeight:800,lineHeight:1.2,marginTop:6,background:"linear-gradient(180deg, #82FF8E 10.83%, #00770C 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{"₹"+f(SAVINGS_BARS.bar3)+"/yr"}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating gold coins — real images matching Figma positions */}
          <img src="/ui/coin-small.png" alt="" style={{position:"absolute",top:-12,right:40,width:27,height:28,objectFit:"contain",zIndex:3,pointerEvents:"none"}} />
          <img src="/ui/coin-large.png" alt="" style={{position:"absolute",bottom:20,left:-18,width:39,height:63,objectFit:"contain",zIndex:3,pointerEvents:"none"}} />
          <img src="/ui/coin-medium.png" alt="" style={{position:"absolute",bottom:16,right:-12,width:19,height:21,objectFit:"contain",zIndex:3,pointerEvents:"none"}} />
        </div>
      </div>

      {/* ── WHITE SECTION (overlaps header) ── */}
      <div style={{borderRadius:"24px 24px 0 0",background:"#F4F9FA",marginTop:-38,position:"relative",zIndex:3,padding:"20px 16px 40px"}}>
        {/* Search + List/Table toggle */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          <div style={{position:"relative",flex:1}}>
            <Search size={18} strokeWidth={1.5} color="#9ca3af" style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)"}}/>
            <input value={bcSearch} onChange={e=>setBcSearch(e.target.value)} placeholder="Search Card Name" style={{width:"100%",padding:"14px 16px 14px 44px",borderRadius:12,border:"1px solid #E2E8EF",background:"#fff",fontSize:14,fontFamily:FN,fontWeight:400,color:C.text,outline:"none",boxSizing:"border-box",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}/>
          </div>
          <div style={{width:92,height:44,borderRadius:8,border:"1px solid #D3E4FA",background:"#fff",display:"flex",overflow:"hidden",flexShrink:0}}>
            <div onClick={()=>setBcListView("list")} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer",background:bcListView==="list"||!bcListView?"rgba(214,228,250,0.4)":"transparent"}}>
              <LayoutList size={18} strokeWidth={2} color={bcListView==="list"||!bcListView?"#1D4ED8":"#6b7280"}/>
              <span style={{fontSize:9,fontWeight:700,color:bcListView==="list"||!bcListView?"#1D4ED8":"#6b7280"}}>List</span>
            </div>
            <div onClick={()=>setBcListView("table")} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer",background:bcListView==="table"?"rgba(214,228,250,0.4)":"transparent"}}>
              <Table2 size={18} strokeWidth={2} color={bcListView==="table"?"#1D4ED8":"#6b7280"}/>
              <span style={{fontSize:9,fontWeight:700,color:bcListView==="table"?"#1D4ED8":"#6b7280"}}>Table</span>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
          {bcFilterOpts.map(fl=>{const on=bcFilter.includes(fl);return(<div key={fl} onClick={()=>toggleBcFilter(fl)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:6,border:on?"1px solid #059669":"1px solid rgba(23,51,144,0.06)",background:on?"#f0fdf4":"linear-gradient(180deg, #FFFFFF 0%, #F5FAFF 100%)",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,boxShadow:"0px 1px 2px rgba(0,0,0,0.06)"}}>
            <div style={{width:18,height:18,borderRadius:4,border:on?"1.5px solid #059669":"1.5px solid #d1d5db",background:on?"#059669":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{on&&<Check size={11} strokeWidth={3} color="#fff"/>}</div>
            <span style={{fontSize:13,fontWeight:500,color:on?"#059669":"#374151"}}>{fl}</span>
          </div>);})}
        </div>

        {/* Card list / Table view */}
        {bcListView==="table"?(
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginLeft:-16,marginRight:-16}}>
          <div style={{display:"flex",position:"relative"}}>
            {/* Sticky left column: Cards */}
            <div style={{width:140,flexShrink:0,position:"sticky",left:0,zIndex:2,background:"#fff",boxShadow:"4px 0px 10px 0px rgba(0,0,0,0.06)"}}>
              <div style={{padding:"8px 12px",height:43,display:"flex",alignItems:"center",justifyContent:"center",background:"#F0F0F7",border:"0.95px solid #EBEBF4",boxSizing:"border-box",boxShadow:"4px 0px 10px 0px rgba(0,0,0,0.06)",position:"sticky",left:0,zIndex:3}}><span style={{fontSize:13,fontWeight:600,color:"#374151"}}>Cards</span></div>
              {filteredCards.map((card,i)=>{
                const imgSrc=BC_IMG_MAP[card.name]||card.image||null;
                const _ft=card.tags||[];const tag=_ft.includes("Invite Only")?"INVITE ONLY":_ft.includes("Lifetime Free")?"LIFETIME FREE":_ft.includes("FD backed")?"FD BACKED":null;
                const tagBg=tag==="INVITE ONLY"?"linear-gradient(90deg, #FEF3C7 0%, #FDE68A 100%)":tag==="LIFETIME FREE"?"linear-gradient(90deg, #D1FAE5 0%, #A7F3D0 100%)":"linear-gradient(90deg, #DBEAFE 0%, #BFDBFE 100%)";
                const tagColor=tag==="INVITE ONLY"?"#92400E":tag==="LIFETIME FREE"?"#065F46":"#1E40AF";
                return(
                <div key={i} style={{width:140,borderWidth:"0 1px 1px 0",borderStyle:"solid",borderColor:"rgba(0,0,0,0.08)",boxSizing:"border-box",background:"#fff"}}>
                  {tag&&<div style={{padding:"4px 0",textAlign:"center",background:tagBg}}><span style={{fontSize:9,fontWeight:800,color:tagColor,letterSpacing:"0.1em"}}>{tag}</span></div>}
                  <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#1D4ED8",textAlign:"center"}}>{card.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{fontSize:18,fontWeight:700,color:"#374151"}}>{i+1}</div>
                      <div style={{width:90,height:57,borderRadius:4,overflow:"hidden",background:`linear-gradient(135deg,${card.color},${card.accent})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {imgSrc?<img src={imgSrc} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<CreditCard size={20} strokeWidth={1} color="rgba(255,255,255,0.4)"/>}
                      </div>
                    </div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:4,paddingRight:10,borderRadius:"5.93px 100px 100px 5.93px",background:"linear-gradient(92.04deg, rgba(255,109,29,0.2) 2.34%, rgba(255,109,29,0.08) 29.05%, rgba(255,109,29,0.02) 78.32%, rgba(255,109,29,0) 98.12%)",marginTop:2}}>
                      <div style={{display:"flex",alignItems:"center",width:32.59,height:17.6}}>
                        <div style={{width:17.6,height:17.6,borderRadius:4,background:"linear-gradient(90deg, #FDF7F5 1.16%, #FFFFFF 88.19%)",border:"0.65px solid #FCEAE4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><img src="/brands/amazon.png" alt="" style={{width:8.6,height:8.6,objectFit:"contain"}}/></div>
                        <div style={{width:17.6,height:17.6,borderRadius:4,background:"linear-gradient(90deg, #FDF7F5 1.16%, #FFFFFF 88.19%)",border:"0.65px solid #FCEAE4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:-2}}><img src="/brands/flipkart.png" alt="" style={{width:10.5,height:10.5,objectFit:"contain"}}/></div>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:"#FF6D1D",whiteSpace:"nowrap",lineHeight:1}}>₹1400 REWARDS</span>
                    </div>
                  </div>
                </div>);})}
            </div>
            {/* Scrollable right columns */}
            <div style={{display:"flex"}}>
              {["Combined Savings","Total Savings","Milestone Benefits"].map((col,ci)=>(
              <div key={ci} style={{minWidth:76}}>
                <div style={{padding:"8px 12px",height:43,display:"flex",alignItems:"center",justifyContent:"center",background:"#F0F0F7",border:"0.95px solid #EBEBF4",boxSizing:"border-box"}}><span style={{fontSize:11,fontWeight:600,color:"#374151",textAlign:"center"}}>{col}</span></div>
                {filteredCards.map((card,i)=>{
                  const val=ci===0?"₹"+f(Math.round(card.savings*0.66)):ci===1?"₹"+f(Math.round(card.savings*0.75)):"₹"+f(Math.round(card.savings*0.75));
                  return(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"center",height:134,boxSizing:"border-box",borderWidth:"0 1px 1px 0",borderStyle:"solid",borderColor:"rgba(0,0,0,0.08)",background:"#fff",padding:"0 8px"}}><span style={{fontSize:14,fontWeight:600,color:"#1C2A33"}}>{val}</span></div>);
                })}
              </div>))}
            </div>
          </div>
        </div>
        ):(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {filteredCards.map((card,i)=>{
            const imgSrc=BC_IMG_MAP[card.name]||card.image||null;
            const _tags=card.tags||[];
            const isInviteOnly=_tags.includes("Invite Only");
            const isLTF=_tags.includes("Lifetime Free");
            return(
          <div key={i} style={{background:"#fff",borderRadius:10,border:"1px solid #E8F0F1",boxShadow:"0px 2px 8px rgba(0,0,0,0.08)",overflow:"hidden",position:"relative"}}>
            {/* Card header: image + name + CTA badge */}
            <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 16px 12px"}}>
              {/* Card art with tag overlay */}
              <div style={{width:170,height:107,borderRadius:6,overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${card.color},${card.accent})`,boxShadow:"0px 1px 2px rgba(0,0,0,0.06)",border:"1px solid rgba(23,51,144,0.06)",position:"relative"}}>
                {isInviteOnly&&<div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",zIndex:2,width:95,height:25,borderRadius:4,background:"linear-gradient(102.32deg, #FFEFBA 1.93%, #FFEDB0 59.29%, #FFEFBA 107.52%)",border:"1.07px solid rgba(120,60,46,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",background:"linear-gradient(97.92deg, #77552E 10.66%, #B07023 50.43%, #77552E 89.82%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>INVITE ONLY</span></div>}
                {isLTF&&!isInviteOnly&&<div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",zIndex:2,padding:"4px 10px",borderRadius:4,background:"linear-gradient(90deg, #D1FAE5 0%, #A7F3D0 100%)"}}><span style={{fontSize:9,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"#065F46"}}>LIFETIME FREE</span></div>}
                {imgSrc?<img src={imgSrc} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><CreditCard size={28} strokeWidth={1} color="rgba(255,255,255,0.4)"/></div>}
              </div>
              {/* Name + badge */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:16,fontWeight:600,color:"#1C2A33",lineHeight:1.35}}>{card.name}</div>
                <div style={{marginTop:10,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 11px",borderRadius:"6px 100px 100px 6px",background:"linear-gradient(92.04deg, rgba(255,109,29,0.2) 2.34%, rgba(255,109,29,0.08) 29.05%, rgba(255,109,29,0.02) 97.73%)",cursor:"pointer"}}>
                  <span style={{fontSize:14,fontWeight:600,color:"#FF6D1D",whiteSpace:"nowrap"}}>Apply &amp; Get ₹1400</span>
                </div>
              </div>
            </div>

            {/* Fee row */}
            <div style={{display:"flex",padding:"10px 16px 12px",borderTop:"0.8px solid rgba(206,200,200,0.4)"}}>
              <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:11,fontWeight:400,color:"#808387"}}>Annual Fees</div><div style={{fontSize:14,fontWeight:600,color:"#1C2A33",marginTop:2}}>{card.annualFee>0?"₹"+f(card.annualFee):"Free"}</div></div>
              <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:11,fontWeight:400,color:"#808387"}}>Joining Fees</div><div style={{fontSize:14,fontWeight:600,color:"#1C2A33",marginTop:2}}>{card.annualFee>0?"₹"+f(card.annualFee):"Free"}</div></div>
              <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:11,fontWeight:400,color:"#808387"}}>Eligibility</div><div style={{fontSize:14,fontWeight:600,color:"#1D4ED8",marginTop:2,cursor:"pointer"}} onClick={()=>setBcEligSheet(card)}>Check Now</div></div>
            </div>

            {/* Combine banner */}
            <div style={{margin:"0 12px 12px",padding:"16px 12px",borderRadius:8,border:"1px solid #E2FAEF",background:"linear-gradient(90deg, #E1FAEF 0%, #F4FDF9 100%)",display:"flex",alignItems:"center",gap:10}}>
              <img src="/legacy-assets/save star.png" alt="" style={{width:36,height:36,objectFit:"contain",flexShrink:0}}/>
              <div><div style={{fontSize:11,fontWeight:400,color:"#6B7280"}}>Combine with your cards &</div><div style={{fontSize:18,fontWeight:700,color:"#059669",marginTop:1}}>Save ₹{f(card.savings)}/yr</div></div>
            </div>

            {/* CTAs */}
            <div style={{display:"flex",gap:10,padding:"0 12px 16px"}}>
              <div style={{flex:1,padding:"12px 20px",borderRadius:8,border:"1px solid #1134AC33",textAlign:"center",cursor:"pointer",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:13,fontWeight:600,color:"#1C2A33"}}>Create Portfolio +</span></div>
              <div onClick={()=>{setBcSection("howtouse");setBcDetTab(100);setBestCardDetail(card);}} style={{flex:1,padding:"12px 20px",borderRadius:8,background:"linear-gradient(90deg, #222941 0%, #101C43 100%)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247)"}}><span style={{fontSize:13,fontWeight:700,color:"#fff"}}>View details</span><ChevronRight size={14} strokeWidth={2.5} color="#fff"/></div>
            </div>
          </div>);})}
        </div>
        )}
      </div>
      <InfoBS/>
    </div></div><div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",padding:"12px 0 5vw",pointerEvents:"none",zIndex:50}}><div style={{pointerEvents:"auto"}}><NavBar/></div></div><TxnSheet/><ActSheet/><CatBS/><FilterSheet/><GmailNudgePopup/><GmailNudgeSheet/><RetroOverlay/><VoiceFlowOverlay/><Toast/></div>);
};