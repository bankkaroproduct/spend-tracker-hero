import { useState } from "react";
import { Star, ChevronDown, ChevronRight, Check, CreditCard, Search, Lock, Mail, MapPin, Plane, UtensilsCrossed, Tv, HelpCircle, Gift, Target, Sparkles, X, ChevronLeft, LayoutList, Table2 } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { TOTAL_ACC } from "@/data/simulation/legacy";
import { BEST_CARDS as LEGACY_BEST_CARDS, BEST_CARDS_COMB_SAVINGS, getBestCardDetail, USER_CARD_YEARLY_SAVINGS } from "@/data/simulation/legacy";
import { NavBar } from "@/components/shared/NavBar";
import { useAppContext } from "@/store/AppContext";
import { Toast, InfoBS, TxnSheet, ActSheet, GmailNudgePopup, GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CatBS, FilterSheet } from "@/components/sheets/BottomSheets";
import { CardDetailV2 } from "./CardDetailV2";

/* Feature flag — flip to false to revert to the legacy detail page */
const USE_NEW_CARD_DETAIL = true;

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
    portfolioNew, setPortfolioNew, setPortfolioEntryCard,
  } = useAppContext();

  if(!bestCardsLogOnce){
    bestCardsLogOnce=true;
  }

    const BEST_CARDS=LEGACY_BEST_CARDS;
    const bcFilterOpts=["All Cards","In Your Wallet","Lifetime Free","Invite Only"];
    const toggleBcFilter=(fl)=>setBcFilter(v=>{if(fl==="All Cards")return[];return v.includes(fl)?v.filter(x=>x!==fl):[...v,fl];});
    const filteredCards=BEST_CARDS.filter(c=>{if(bcSearch&&!c.name.toLowerCase().includes(bcSearch.toLowerCase())&&!c.bank.toLowerCase().includes(bcSearch.toLowerCase()))return false;if(bcFilter.length===0)return true;return bcFilter.some(fl=>{if(fl==="In Your Wallet")return c.is_owned;if(fl==="Lifetime Free")return c.filterTags.includes("Lifetime Free");if(fl==="Invite Only")return c.filterTags.includes("Invite Only");return c.filterTags.includes(fl);});}).sort((a,b)=>{if(bcSort==="Highest Savings")return b.savings-a.savings;if(bcSort==="Lowest Fee")return a.annualFee-b.annualFee;if(bcSort==="Lifetime Free First")return(a.annualFee===0?0:1)-(b.annualFee===0?0:1)||b.match-a.match;return b.match-a.match;});
    const top2=[BEST_CARDS[0],BEST_CARDS[1]];
    const combSavings=BEST_CARDS_COMB_SAVINGS;

    /* ═══ TABLE TAB STATE & SHARED SAVINGS DATA ═══
       Single source of truth so values tally across both tabs.
       For each card:
         thisCard  = milestone + 9 category amounts
         combined  = thisCard + onAxisFlipkart + onHSBCTravelOne + onHSBCLivePlus
       Both tabs read from getBC() — Combined Savings is identical in either tab. */
    const [bcTableTab,setBcTableTab]=useState<"combined"|"category">("combined");
    const [tableSort,setTableSort]=useState<{key:string,dir:"asc"|"desc"}>({key:"combined",dir:"desc"});
    const onSortClick=(k:string)=>setTableSort(s=>s.key===k?{key:k,dir:s.dir==="asc"?"desc":"asc"}:{key:k,dir:"desc"});
    const SortIcon=({active,dir}:{active:boolean,dir:"asc"|"desc"})=>(
      <div style={{width:18,height:18,borderRadius:"50%",background:active?"#D6E4FA":"#EDF1F5",display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,marginTop:4}}>
        <div style={{width:0,height:0,borderLeft:"3px solid transparent",borderRight:"3px solid transparent",borderBottom:`4px solid ${active&&dir==="asc"?"#0064E0":"#9CA3AF"}`}}/>
        <div style={{width:0,height:0,borderLeft:"3px solid transparent",borderRight:"3px solid transparent",borderTop:`4px solid ${active&&dir==="desc"?"#0064E0":"#9CA3AF"}`}}/>
      </div>
    );
    const BUCKET_TO_CAT:Record<string,string>={
      amazon_spends:"shopping",flipkart_spends:"shopping",other_online_spends:"shopping",other_offline_spends:"shopping",
      grocery_spends_online:"groceries",offline_grocery:"groceries",
      online_food_ordering:"food",
      dining_or_going_out:"dining",
      fuel:"fuel",
      flights_annual:"flights",
      hotels_annual:"hotels",
      mobile_phone_bills:"bills",electricity_bills:"bills",water_bills:"bills",
      rent:"rent",
      insurance_health_annual:"bills",insurance_car_or_bike_annual:"bills",life_insurance:"bills",school_fees:"bills",
    };
    const getBC=(card:any)=>{
      const bd=card.spending_breakdown;
      if(!bd){
        const base=card.savings||0;
        return {milestone:0,shopping:Math.round(base*0.3),groceries:Math.round(base*0.1),food:Math.round(base*0.08),dining:Math.round(base*0.12),fuel:Math.round(base*0.05),flights:Math.round(base*0.15),hotels:Math.round(base*0.1),bills:Math.round(base*0.05),rent:Math.round(base*0.05),thisCard:base,onAxisFlipkart:0,onHSBCTravelOne:0,onHSBCLivePlus:0,combined:base};
      }
      const catMap:Record<string,number>={};
      let thisCardTotal=0;
      for(const [bucket,data] of Object.entries(bd)){
        const savings=(data as any).savings||0;
        const cat=BUCKET_TO_CAT[bucket]||"other";
        catMap[cat]=(catMap[cat]||0)+Math.round(savings*12);
        thisCardTotal+=Math.round(savings*12);
      }
      const idx=BEST_CARDS.indexOf(card);
      const detail=idx>=0?getBestCardDetail(idx):null;
      const milestone=(detail?.milestones||[]).reduce((s:number,m:any)=>s+(m.amt||0),0);
      thisCardTotal+=milestone;
      const userSavings=USER_CARD_YEARLY_SAVINGS;
      const onCard0=userSavings[0]?.savings||0;
      const onCard1=userSavings[1]?.savings||0;
      const onCard2=userSavings[2]?.savings||0;
      const combined=thisCardTotal+onCard0+onCard1+onCard2;
      return {milestone,shopping:catMap.shopping||0,groceries:catMap.groceries||0,food:catMap.food||0,dining:catMap.dining||0,fuel:catMap.fuel||0,flights:catMap.flights||0,hotels:catMap.hotels||0,bills:catMap.bills||0,rent:catMap.rent||0,thisCard:thisCardTotal,onAxisFlipkart:onCard1,onHSBCTravelOne:onCard0,onHSBCLivePlus:onCard2,combined};
    };

    /* ═══ BEST CARD DETAIL PAGE ═══ */
    const getCD=(name:any)=>{
      const idx=BEST_CARDS.findIndex((c:any)=>c.name===name);
      const detail=idx>=0?getBestCardDetail(idx):null;
      const card=BEST_CARDS.find((c:any)=>c.name===name);
      if(detail) return {
        welcome:detail.welcome?[{t:detail.welcome.amt>0?`₹${f(detail.welcome.amt)} welcome bonus`:"Welcome reward on first spend",d:detail.welcome.validity?`Within ${detail.welcome.validity}`:"On activation"}]:[{t:"Welcome reward on first spend",d:"On activation"}],
        milestones:(detail.milestones||[]).map((m:any)=>({t:`₹${f(m.amt)} reward`,d:m.validity?`Within ${m.validity}`:"Annual",thr:0,status:"locked"})),
        lounge:detail.lounge?.qty>0?[{t:`${detail.lounge.qty} lounge visits ${detail.lounge.type}`,d:"Domestic & international"}]:[{t:"Check bank website for lounge benefits",d:""}],
        fees:{annual:card&&card.annualFee>0?`₹${f(card.annualFee)} + GST`:"Lifetime Free",joining:card&&card.annualFee>0?`₹${f(card.annualFee)} + GST`:"Nil",waiver:detail.fees?.waiver||"Check bank website",waiverStatus:"Check T&Cs",bankFees:[["Forex Markup","Check bank website"],["APR","Check bank website"]],lateFees:[["Check bank website",""]]},
        replace:detail.replace||"",replaceSave:detail.replaceSave||0,
      };
      return {
        welcome:[{t:"Welcome reward on first spend",d:"On activation"}],
        milestones:[{t:"Check bank website for milestones",d:"",thr:0,status:"locked"}],
        lounge:[{t:"Check bank website for lounge benefits",d:""}],
        fees:{annual:card&&card.annualFee>0?`₹${f(card.annualFee)} + GST`:"Lifetime Free",joining:card&&card.annualFee>0?`₹${f(card.annualFee)} + GST`:"Nil",waiver:"Check bank website",waiverStatus:"Check T&Cs",bankFees:[["Check bank website",""]],lateFees:[["Check bank website",""]]},
        replace:"",replaceSave:0,
      };
    };

    if(bestCardDetail && USE_NEW_CARD_DETAIL){
      return <CardDetailV2 card={bestCardDetail} ctx={{setBestCardDetail, setBcEligSheet, setScreen, setPortfolioEntryCard}}/>;
    }
    if(bestCardDetail){const card=bestCardDetail;const netSavings=card.savings-(card.annualFee||0);const det=getCD(card.name);const _detIdx=BEST_CARDS.findIndex((c:any)=>c.name===card.name);const _detData=_detIdx>=0?getBestCardDetail(_detIdx):null;if(!card.brandFit&&_detData?.brandFit){card.brandFit=_detData.brandFit.map((bf:any)=>({name:bf.brand,icon:"📦",rate:parseFloat(bf.rate)||0,yourSave:bf.savings||0,spend:bf.spend||0}));}if(!card.brandFit)card.brandFit=[];return(
    <div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative"}}><div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",background:C.bg,paddingBottom:100}}><div className="slide-in"><FL/>
      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(160deg,${card.color},${card.accent})`,padding:"44px 24px 0",color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div onClick={()=>setBestCardDetail(null)} style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14}}>←</div>
          <div onClick={()=>{setBcFavs(v=>v.includes(card.name)?v.filter(x=>x!==card.name):[...v,card.name]);setToast(bcFavs.includes(card.name)?"Removed from favourites":"Added to favourites");}} style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Star size={14} strokeWidth={bcFavs.includes(card.name)?0:1.5} fill={bcFavs.includes(card.name)?"#fbbf24":"none"} color={bcFavs.includes(card.name)?"#fbbf24":"rgba(255,255,255,0.6)"}/></div>
        </div>
        <div style={{fontSize:10,opacity:0.45,letterSpacing:0.5}}>{card.bank}</div>
        <div style={{fontSize:18,fontWeight:700,marginTop:2}}>{card.name}</div>
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 12px"}}>
          <div style={{width:160,height:100,borderRadius:12,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"12px 14px",boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{fontSize:8,fontWeight:600,opacity:0.4}}>{card.bank.toUpperCase()}</div><CreditCard size={12} strokeWidth={1.5} color="rgba(255,255,255,0.25)"/></div>
            <div><div style={{fontSize:12,fontWeight:700,letterSpacing:0.3}}>{card.name}</div><div style={{display:"flex",gap:2,marginTop:4}}>{[0,1,2,3].map(d=>(<div key={d} style={{display:"flex",gap:1}}>{[0,1,2,3].map(dd=>(<div key={dd} style={{width:2,height:2,borderRadius:1,background:"rgba(255,255,255,0.2)"}}/>))}</div>))}</div></div>
          </div>
        </div>
      </div>

      {/* ── USAGE ADVICE ── */}
      <div style={{padding:"0 24px"}}><div style={{padding:"14px 16px",borderRadius:12,background:C.white,boxShadow:"0 2px 12px rgba(0,0,0,0.04)",marginTop:-10,position:"relative",zIndex:2}}>
        <div style={{fontSize:10,fontWeight:600,color:C.sub,marginBottom:3}}>Usage advice</div>
        <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.45}}>{det.replace?`Replace your ${det.replace} with this card and save upto ₹${f(det.replaceSave)}`:`This card can save you ₹${f(netSavings)} per year based on your spending`}</div>
        {det.replace&&<div onClick={()=>{}} style={{marginTop:8,fontSize:12,fontWeight:700,color:C.green,cursor:"pointer"}}>See comparison ›</div>}
      </div></div>

      {/* ── SECTION TABS ── */}
      <div style={{position:"sticky",top:0,zIndex:20,background:C.white,boxShadow:"0 2px 8px rgba(0,0,0,0.04)",padding:"0 24px",marginTop:8}}>
        <div style={{display:"flex"}}>
          {[{k:"overview",l:"Overview"},{k:"benefits",l:"Benefits"},{k:"fees",l:"Fees"}].map(t=>(<div key={t.k} onClick={()=>{setBcSection(t.k);const el=document.getElementById("bc-"+t.k);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});}} style={{flex:1,textAlign:"center",padding:"11px 0",cursor:"pointer",borderBottom:bcSection===t.k?`2.5px solid ${C.blue}`:"2.5px solid transparent",color:bcSection===t.k?C.blue:C.dim,fontSize:13,fontWeight:bcSection===t.k?700:500}}>{t.l}</div>))}
        </div>
      </div>

      {/* ── COMPARISON OF ANNUAL SAVINGS ── */}
      <div style={{padding:"0 24px"}}>
        <div style={{marginTop:16}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>Comparison of Annual Savings</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3,marginBottom:14}}>This card vs your existing cards</div>
          {(()=>{
            const compCards=[
              {name:card.name,bank:card.bank,savings:card.savings,color:card.color,accent:card.accent,isThis:true},
              ...USER_CARD_YEARLY_SAVINGS.map((uc:any)=>({name:uc.name,bank:"",savings:uc.savings,color:uc.color,accent:uc.color,isUser:true})),
            ].sort((a,b)=>b.savings-a.savings);
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
          const brandItems=card.brandFit.map(b=>{const potential=Math.round(b.spend*b.rate/100);const saved=Math.round(potential*0.35);return{...b,potential,saved,cat:catMap[b.name]||"Others"};});
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

      {/* ── WELCOME BENEFITS ── */}
      <div id="bc-benefits" style={{padding:"0 24px",marginTop:20}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Welcome Benefits</div>
        <div style={{fontSize:12,color:C.sub,marginTop:4,marginBottom:16}}>Don't miss out on your rewards</div>
        {det.welcome.map((w,i)=>(<div key={i} style={{display:"flex",gap:14,padding:"18px 20px",background:C.white,borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.04)",marginBottom:10}}>
          <div style={{width:44,height:44,borderRadius:12,background:C.greenBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Gift size={20} strokeWidth={1.5} color={C.green}/></div>
          <div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{w.t}</div><div style={{fontSize:12,color:C.sub,marginTop:4,lineHeight:1.5}}>{w.d}</div></div>
        </div>))}
      </div>

      {/* ── MILESTONE BENEFITS ── */}
      <div style={{padding:"0 24px",marginTop:20}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Milestone Benefits</div>
        <div style={{fontSize:12,color:C.sub,marginTop:4,marginBottom:16}}>Don't miss out on your rewards</div>
        {det.milestones.map((m,i)=>(<div key={i} style={{display:"flex",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:28}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:m.status==="claim"?C.green:"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center"}}>{m.status==="claim"?<Check size={12} strokeWidth={2.5} color="#fff"/>:<Lock size={12} strokeWidth={1.5} color={C.dim}/>}</div>
            {i<det.milestones.length-1&&<div style={{width:2.5,flex:1,background:"#e5e7eb",minHeight:40,borderRadius:2}}/>}
          </div>
          <div style={{flex:1,paddingBottom:20}}>
            <div style={{padding:"16px",background:C.white,borderRadius:14,boxShadow:"0 2px 16px rgba(0,0,0,0.04)",borderLeft:m.status==="claim"?`3px solid ${C.green}`:m.status==="locked"?"3px solid #e5e7eb":"none"}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>{m.t}</div>
              <div style={{fontSize:12,color:C.sub,marginTop:4,lineHeight:1.5}}>{m.d}</div>
              <div style={{marginTop:10}}><span style={{padding:"4px 12px",borderRadius:6,background:m.status==="claim"?C.greenBg:"#fef3c7",fontSize:10,fontWeight:700,color:m.status==="claim"?C.green:C.orange}}>{m.status==="claim"?"Achievable with your current spending":"Spend ₹"+f(m.thr-Math.round(m.thr*0.6))+" more"}</span></div>
            </div>
          </div>
        </div>))}
      </div>

      {/* ── LOUNGE & ADDITIONAL ── */}
      <div style={{padding:"0 24px",marginTop:20}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Lounge and Additional Benefits</div>
        <div style={{fontSize:12,color:C.sub,marginTop:4,marginBottom:16}}>Don't miss out on your rewards</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {det.lounge.map((l,i)=>{const lIcon=l.t.toLowerCase().includes("movie")||l.t.toLowerCase().includes("ticket")?<Tv size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("railway")?<MapPin size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("golf")?<Target size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("concierge")?<Sparkles size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("dining")?<UtensilsCrossed size={18} strokeWidth={1.5} color={C.dim}/>:l.t.toLowerCase().includes("no ")?<X size={18} strokeWidth={1.5} color={C.dim}/>:<Plane size={18} strokeWidth={1.5} color={C.dim}/>;return(<div key={i} style={{display:"flex",gap:14,padding:"18px",background:C.white,borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
            <div style={{width:40,height:40,borderRadius:12,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{lIcon}</div>
            <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{l.t}</div><div style={{fontSize:12,color:C.sub,marginTop:4,lineHeight:1.5}}>{l.d}</div></div>
          </div>)})}
        </div>
      </div>

      {/* ── FEES & WAIVERS ── */}
      <div id="bc-fees" style={{padding:"0 24px",marginTop:20}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Fees & Waivers</div>
        <div style={{marginTop:12,padding:"16px 20px",borderRadius:14,background:card.annualFee>0?"#fef3c7":"#ecfdf5",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:600,color:card.annualFee>0?"#92400e":C.green}}>Total first year cost</span>
          <span style={{fontSize:16,fontWeight:700,color:card.annualFee>0?"#92400e":C.green}}>{card.annualFee>0?"₹"+f(Math.round(card.annualFee*2*1.18)):"₹0 — Free"}</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
          {[{icon:"💰",t:`Annual Fee (${det.fees.annual})`,d:det.fees.waiver,badge:det.fees.waiverStatus},{icon:"🎫",t:`Joining Fee (${det.fees.joining})`,d:det.fees.joining==="Nil"?"No joining fee":"Fee is mandatory and non-waivable"}].map((x,i)=>(<div key={i} style={{display:"flex",gap:14,padding:"18px",background:C.white,borderRadius:16,boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
            <div style={{width:40,height:40,borderRadius:12,background:i===0?C.greenBg:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{x.icon}</div>
            <div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{x.t}</div><div style={{fontSize:12,color:C.sub,marginTop:4,lineHeight:1.5}}>{x.d}</div>{x.badge&&<span style={{display:"inline-block",marginTop:8,padding:"4px 12px",borderRadius:6,background:x.badge==="Waived"?C.greenBg:C.orangeBg,fontSize:10,fontWeight:600,color:x.badge==="Waived"?C.green:C.orange}}>{x.badge}</span>}</div>
          </div>))}
        </div>
        {/* Additional Bank Fees */}
        <div style={{marginTop:24}}><div style={{fontSize:13,fontWeight:700,color:C.sub,marginBottom:12}}>Additional bank fees</div>
          <div style={{background:C.white,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>{det.fees.bankFees.map(([l,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"14px 18px",borderBottom:i<det.fees.bankFees.length-1?`1px solid ${C.brd}`:"none"}}><span style={{fontSize:12,color:C.sub}}>{l}</span><span style={{fontSize:12,fontWeight:700,color:C.text}}>{v}</span></div>))}</div>
        </div>
        {/* Late Fees */}
        <div style={{marginTop:24}}><div style={{fontSize:13,fontWeight:700,color:C.sub,marginBottom:12}}>Late payment fees</div>
          <div style={{background:C.white,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><div style={{display:"flex",padding:"12px 18px",background:C.bg}}><span style={{flex:1,fontSize:11,fontWeight:600,color:C.sub}}>Amount Due</span><span style={{width:100,fontSize:11,fontWeight:600,color:C.sub,textAlign:"right"}}>Late Fee</span></div>{det.fees.lateFees.map(([l,v],i)=>(<div key={i} style={{display:"flex",padding:"14px 18px",borderBottom:i<det.fees.lateFees.length-1?`1px solid ${C.brd}`:"none"}}><span style={{flex:1,fontSize:12,color:C.sub}}>{l}</span><span style={{width:100,fontSize:12,fontWeight:700,color:C.text,textAlign:"right"}}>{v}</span></div>))}</div>
        </div>
      </div>

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

    const BC_IMG_MAP:Record<string,string>={
      "HDFC Infinia":"/legacy-assets/cards/hdfc-infinia.png",
      "Amex MRCC":"/legacy-assets/cards/amex-platinum-travel.png",
      "Flipkart Axis":"/legacy-assets/cards/axis-flipkart.png",
      "ICICI Sapphiro":"/legacy-assets/cards/icici-emeralde.png",
      "SBI Aurum":"/legacy-assets/cards/sbi-miles.png",
      "IDFC First Classic":"/legacy-assets/cards/idfc-select.png",
      "AU Lit":"/legacy-assets/cards/AU-Zenith.png",
    };
    const getCardImg=(card:any)=>BC_IMG_MAP[card.name]||card.image||card.card_bg_image||null;

    /* ═══ BEST CARDS LIST PAGE ═══ */
    return(<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative"}}><div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"#F4F9FA",paddingBottom:24}}><div key="bestcards" className="slide-in"><FL/>

      {/* ── HEADER — bg image holds the green frame, title, and coins ── */}
      <div style={{backgroundImage:"url('/cdn/best-cards-bg.png')",backgroundSize:"cover",backgroundPosition:"center",backgroundColor:"#0B2D1C",position:"relative",overflow:"hidden",height:348,boxSizing:"border-box"}}>
        {/* Back arrow */}
        <div onClick={()=>setScreen(bcFromScreen||"home")} style={{position:"absolute",top:57.5,left:16,width:24,height:24,cursor:"pointer",zIndex:3}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M8.70703 5.29286C9.09753 4.90236 9.73056 4.90241 10.1211 5.29286C10.5116 5.68338 10.5116 6.31639 10.1211 6.70692L5.82812 10.9999H20.4141C20.9663 10.9999 21.4141 11.4476 21.4141 11.9999C21.4141 12.5522 20.9663 12.9999 20.4141 12.9999H5.82812L10.1211 17.2929C10.5116 17.6834 10.5116 18.3164 10.1211 18.7069C9.73056 19.0974 9.09753 19.0974 8.70703 18.7069L2 11.9999L8.70703 5.29286Z" fill="white"/></svg>
        </div>

        {/* Title cluster — Frame 1991634940 — centered, top:55 */}
        <div style={{position:"absolute",left:"calc(50% - 86px)",top:55,width:172,display:"flex",flexDirection:"column",alignItems:"center",gap:4,mixBlendMode:"plus-lighter",zIndex:3}}>
          <div style={{fontFamily:FN,fontSize:14,fontWeight:700,lineHeight:"140%",letterSpacing:"0.04em",textTransform:"uppercase",color:"#FFFFFF",textAlign:"center"}}>Best Cards for you</div>
          <div style={{fontFamily:FN,fontSize:10,fontWeight:500,lineHeight:"140%",letterSpacing:"0.04em",textTransform:"uppercase",color:"rgba(217,218,218,0.8)",textAlign:"center"}}>Based on your annual spends</div>
        </div>

        {/* Stats content — overlaid on the bg's frosted frame at top:123 */}
        <div style={{position:"absolute",top:123,left:"calc(50% - 157px)",width:314,height:163,padding:"20px 24px",boxSizing:"border-box",display:"flex",flexDirection:"column",alignItems:"center",gap:16,zIndex:2}}>
          {/* Top row — Annual Spends | Current Savings */}
          <div style={{display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"center",width:"100%",height:36,padding:"0 12px",gap:24,boxSizing:"border-box",mixBlendMode:"plus-lighter",opacity:0.8}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}>
              <div style={{fontFamily:FN,fontSize:10,fontWeight:400,lineHeight:"140%",color:"rgba(255,255,255,0.6)"}}>Annual Spends</div>
              <div style={{fontFamily:FN,fontSize:13,fontWeight:500,lineHeight:"150%",color:"rgba(255,255,255,0.9)"}}>{"₹"+f(TOTAL_ACC)}</div>
            </div>
            <div style={{width:1,height:24,background:"rgba(255,255,255,0.4)",opacity:0.6,flexShrink:0}}/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
              <div style={{fontFamily:FN,fontSize:10,fontWeight:400,lineHeight:"140%",color:"rgba(255,255,255,0.6)"}}>Current Savings</div>
              <div style={{fontFamily:FN,fontSize:13,fontWeight:500,lineHeight:"150%",color:"rgba(255,255,255,0.9)"}}>{"₹"+f(USER_CARD_YEARLY_SAVINGS.reduce((s:number,c:any)=>s+c.savings,0))+"/yr"}</div>
            </div>
          </div>

          {/* You Could Save — big green highlight, pushed down to sit below the bg image's divider */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,mixBlendMode:"plus-lighter",marginTop:28}}>
            <div style={{fontFamily:FN,fontSize:10,fontWeight:400,lineHeight:"140%",color:"rgba(255,255,255,0.6)",textAlign:"center"}}>You Could Save</div>
            <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"flex-start",gap:4,filter:"drop-shadow(0px 26px 10px rgba(73,203,133,0.03)) drop-shadow(0px 15px 9px rgba(73,203,133,0.1)) drop-shadow(0px 7px 7px rgba(73,203,133,0.17)) drop-shadow(0px 2px 4px rgba(73,203,133,0.2))"}}>
              <span style={{fontFamily:"'IBM Plex Serif',serif",fontSize:30,fontWeight:700,lineHeight:"110%",background:"linear-gradient(180deg, #82FF8E 10.83%, #00770C 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>₹</span>
              <span style={{fontFamily:"'Blacklist','Google Sans',serif",fontSize:32,fontWeight:800,lineHeight:"120%",letterSpacing:"-0.01em",background:"linear-gradient(180deg, #82FF8E 10.83%, #00770C 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{f(combSavings)+"/yr"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHITE SECTION (overlaps header) ── */}
      <div style={{borderRadius:"24px 24px 0 0",background:"#F4F9FA",marginTop:-26,position:"relative",zIndex:3,padding:"20px 16px 40px"}}>
        {/* Search + List/Table toggle */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          <div style={{position:"relative",flex:1}}>
            <Search size={18} strokeWidth={1.5} color="#9ca3af" style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)"}}/>
            <input value={bcSearch} onChange={e=>setBcSearch(e.target.value)} placeholder="Search Card Name" style={{width:"100%",padding:"14px 16px 14px 44px",borderRadius:12,border:"1px solid #E2E8EF",background:"#fff",fontSize:14,fontFamily:FN,fontWeight:400,color:C.text,outline:"none",boxSizing:"border-box",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}/>
          </div>
          <div style={{width:118,height:52,borderRadius:10,border:"1px solid #D3E4FA",background:"#fff",display:"flex",overflow:"hidden",flexShrink:0}}>
            <div onClick={()=>setBcListView("list")} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,padding:"8px 6px",cursor:"pointer",background:bcListView==="list"||!bcListView?"rgba(214,228,250,0.4)":"transparent"}}>
              <LayoutList size={20} strokeWidth={2} color={bcListView==="list"||!bcListView?"#1D4ED8":"#6b7280"}/>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.02em",color:bcListView==="list"||!bcListView?"#1D4ED8":"#6b7280"}}>List</span>
            </div>
            <div onClick={()=>setBcListView("table")} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,padding:"8px 6px",cursor:"pointer",background:bcListView==="table"?"rgba(214,228,250,0.4)":"transparent"}}>
              <Table2 size={20} strokeWidth={2} color={bcListView==="table"?"#1D4ED8":"#6b7280"}/>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.02em",color:bcListView==="table"?"#1D4ED8":"#6b7280"}}>Compare</span>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div data-scroll="1" style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
          {bcFilterOpts.map(fl=>{const on=fl==="All Cards"?bcFilter.length===0:bcFilter.includes(fl);return(<div key={fl} onClick={()=>toggleBcFilter(fl)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",height:32.48,boxSizing:"border-box",borderRadius:6,border:on?"1px solid #059669":"1px solid rgba(23,51,144,0.06)",background:on?"#f0fdf4":"linear-gradient(90deg, #FFFFFF 0%, #F5FAFF 100%)",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,boxShadow:"0px 1px 2px rgba(0,0,0,0.06)"}}>
            <div style={{width:16.48,height:16.48,borderRadius:5.88,border:on?"1.5px solid #059669":"0.82px solid rgba(28,42,51,0.2)",background:on?"#059669":"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<Check size={11} strokeWidth={3} color="#fff"/>}</div>
            <span style={{fontSize:12,fontWeight:500,lineHeight:"16px",color:on?"#059669":"#2B2B2B"}}>{fl}</span>
          </div>);})}
        </div>

        {/* Card list / Table view — sort cards by active table column for table view */}
        {bcListView==="table"?(()=>{
        const sortedTableCards=[...filteredCards].sort((a,b)=>{const av=(getBC(a) as any)[tableSort.key]||0;const bv=(getBC(b) as any)[tableSort.key]||0;return tableSort.dir==="asc"?av-bv:bv-av;});
        return(
        <div>
        {/* Tab bar — Combined Savings vs Category Breakdown */}
        <div style={{display:"flex",borderBottom:"1px solid #E2E8EF",marginLeft:-16,marginRight:-16,marginBottom:0,background:"#fff"}}>
          {[{k:"combined",l:"Combined Savings"},{k:"category",l:"Category Breakdown"}].map(t=>{
            const active=bcTableTab===t.k;
            return(<div key={t.k} onClick={()=>setBcTableTab(t.k as any)} style={{flex:1,padding:"14px 12px",textAlign:"center",cursor:"pointer",borderBottom:active?"2px solid #0064E0":"2px solid transparent",fontFamily:FN,fontSize:14,fontWeight:active?700:500,color:active?"#0064E0":"#2B2B2B"}}>{t.l}</div>);
          })}
        </div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginLeft:-16,marginRight:-16}}>
          <div style={{display:"flex",position:"relative"}}>
            {/* Sticky left column: Cards */}
            <div style={{width:140,flexShrink:0,position:"sticky",left:0,zIndex:2,background:"#fff",boxShadow:"4px 0px 10px 0px rgba(0,0,0,0.06)"}}>
              <div style={{padding:"10px 16px",height:78,display:"flex",alignItems:"center",justifyContent:"center",background:"#F0F0F7",border:"0.95px solid #EBEBF4",boxSizing:"border-box",boxShadow:"4px 0px 10px 0px rgba(0,0,0,0.06)",position:"sticky",left:0,zIndex:3}}><span style={{fontSize:11,fontWeight:500,lineHeight:"13px",color:"rgba(28,42,51,0.6)"}}>Cards</span></div>
              {sortedTableCards.map((card,i)=>{
                const imgSrc=getCardImg(card);
                const tag=card.is_owned?"IN YOUR WALLET":card.filterTags.includes("Invite Only")?"INVITE ONLY":card.filterTags.includes("Lifetime Free")?"LIFETIME FREE":card.filterTags.includes("FD backed")?"FD BACKED":null;
                const tagBg=tag==="IN YOUR WALLET"?"linear-gradient(102.32deg, rgba(186,255,202,0.5) 1.93%, rgba(158,255,200,0.5) 59.29%, rgba(186,255,202,0.5) 107.52%)":tag==="INVITE ONLY"?"linear-gradient(102.32deg, rgba(255,239,186,0.5) 1.93%, rgba(255,237,176,0.5) 59.29%, rgba(255,239,186,0.5) 107.52%)":tag==="LIFETIME FREE"?"linear-gradient(102.32deg, rgba(186,255,254,0.35) 1.93%, rgba(158,255,253,0.35) 59.29%, rgba(186,255,202,0.35) 107.52%)":"linear-gradient(102.32deg, rgba(186,210,255,0.5) 1.93%, rgba(176,200,255,0.5) 59.29%, rgba(186,210,255,0.5) 107.52%)";
                const tagTextGrad=tag==="IN YOUR WALLET"?"linear-gradient(97.92deg, #2E775D 10.66%, #23B07E 50.43%, #2E775D 89.82%)":tag==="INVITE ONLY"?"linear-gradient(97.92deg, #77552E 10.66%, #B07023 50.43%, #77552E 89.82%)":tag==="LIFETIME FREE"?"linear-gradient(97.92deg, #2E775D 10.66%, #23B07E 50.43%, #2E775D 89.82%)":"linear-gradient(97.92deg, #1E40AF 10.66%, #3B82F6 50.43%, #1E40AF 89.82%)";
                return(
                <div key={i} style={{width:140,height:146,position:"relative",borderWidth:"0 1px 1px 0",borderStyle:"solid",borderColor:"rgba(0,0,0,0.08)",boxSizing:"border-box",background:"#fff",overflow:"hidden"}}>
                  {/* Tag pill */}
                  {tag&&<div style={{position:"absolute",top:0,left:0,width:"100%",height:19,display:"flex",alignItems:"center",justifyContent:"center",background:tagBg}}><span style={{fontFamily:FN,fontSize:8.5,fontWeight:800,lineHeight:"10px",letterSpacing:"0.12em",textTransform:"uppercase",background:tagTextGrad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{tag}</span></div>}
                  {/* Rank number on left */}
                  <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontFamily:FN,fontSize:14,fontWeight:600,lineHeight:"18px",color:"#2B2B2B"}}>{i+1}</div>
                  {/* Card name (dashed underline) — vertically centered with image */}
                  <div style={{position:"absolute",top:tag?37:27,left:"50%",transform:"translateX(-50%)",maxWidth:108,textAlign:"center",fontFamily:FN,fontSize:10,fontWeight:600,lineHeight:"14px",color:"#0064E0",borderBottom:"0.91px dashed #0064E0",paddingBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
                  {/* Card image 69×46 with drop-shadow */}
                  <div style={{position:"absolute",top:tag?55:45,left:"50%",transform:"translateX(-50%)",width:69,height:46,borderRadius:3.5,border:"0.29px solid rgba(255,255,255,0.2)",overflow:"hidden",filter:"drop-shadow(0px 6.44px 26.68px rgba(23,59,3,0.1))",background:`linear-gradient(135deg,${card.color},${card.accent})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {imgSrc?<img src={imgSrc} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<CreditCard size={16} strokeWidth={1} color="rgba(255,255,255,0.4)"/>}
                  </div>
                  {/* Reward chip — orange gradient with brand logos */}
                  <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",height:19,display:"flex",alignItems:"center",padding:"4px 9.6px 4px 6px",gap:3,background:"linear-gradient(92.04deg, rgba(255,109,29,0.2) 2.34%, rgba(255,109,29,0.08) 29.05%, rgba(255,109,29,0.02) 78.32%, rgba(255,109,29,0) 98.12%)",borderRadius:"4px 0 0 4px",boxSizing:"border-box"}}>
                    <span style={{fontFamily:FN,fontSize:8.52,fontWeight:700,lineHeight:"11px",letterSpacing:"0.04em",textTransform:"uppercase",background:"linear-gradient(97.92deg, #FF8D2F 10.66%, #F27E40 50.43%, #F29069 89.82%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",whiteSpace:"nowrap"}}>₹1400 Rewards</span>
                  </div>
                </div>);})}
            </div>
            {/* Scrollable right columns — schema differs per tab; values come from getBC() so totals tally */}
            <div style={{display:"flex"}}>
              {(bcTableTab==="combined"
                ? [
                    {label:"Combined Savings",key:"combined",w:130},
                    {label:"Savings on this card",key:"thisCard",w:130},
                    {label:`Savings on ${USER_CARD_YEARLY_SAVINGS[1]?.name||"Card 2"}`,key:"onAxisFlipkart",w:130},
                    {label:`Savings on ${USER_CARD_YEARLY_SAVINGS[0]?.name||"Card 1"}`,key:"onHSBCTravelOne",w:140},
                    {label:`Savings on ${USER_CARD_YEARLY_SAVINGS[2]?.name||"Card 3"}`,key:"onHSBCLivePlus",w:130},
                  ]
                : [
                    {label:"Combined Savings",key:"combined",w:130},
                    {label:"Milestone Benefits",key:"milestone",w:120},
                    {label:"Savings on Shopping",key:"shopping",w:120},
                    {label:"Savings on Groceries",key:"groceries",w:120},
                    {label:"Savings on Food Ordering",key:"food",w:130},
                    {label:"Savings on Dining Out",key:"dining",w:120},
                    {label:"Savings on Fuel",key:"fuel",w:110},
                    {label:"Savings on Flights",key:"flights",w:115},
                    {label:"Savings on Hotels",key:"hotels",w:115},
                    {label:"Savings on Bills",key:"bills",w:110},
                    {label:"Savings on Rent",key:"rent",w:110},
                  ]
              ).map((col,ci)=>{
              const activeCol=tableSort.key===col.key;
              const colCellBg=activeCol?"rgba(214,228,250,0.18)":"#fff";
              const colHeadBg=activeCol?"#E6EEFB":"#F0F0F7";
              return(
              <div key={ci} style={{width:col.w,flexShrink:0}}>
                <div onClick={()=>onSortClick(col.key)} style={{padding:"8px 12px",height:78,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:colHeadBg,border:"0.95px solid #EBEBF4",boxSizing:"border-box",cursor:"pointer"}}>
                  <span style={{fontSize:11,fontWeight:500,lineHeight:"13px",color:"rgba(28,42,51,0.6)",textAlign:"center"}}>{col.label}</span>
                  <SortIcon active={activeCol} dir={tableSort.dir}/>
                </div>
                {sortedTableCards.map((card,i)=>{
                  const bc=getBC(card);
                  const val="₹"+f((bc as any)[col.key]||0);
                  return(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"center",height:146,boxSizing:"border-box",borderWidth:"0 1px 1px 0",borderStyle:"solid",borderColor:"rgba(0,0,0,0.08)",background:colCellBg,padding:"0 12px"}}><span style={{fontSize:13,fontWeight:600,lineHeight:"18px",color:"#2B2B2B"}}>{val}</span></div>);
                })}
              </div>);})}
            </div>
          </div>
        </div>
        </div>);})():(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {filteredCards.map((card,i)=>{
            const imgSrc=getCardImg(card);
            const bc=getBC(card);
            return(
          <div key={i} style={{boxSizing:"border-box",background:"#fff",borderRadius:10,boxShadow:"0px 2px 8px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            {/* Card header: 120×80 image + name + Apply pill (per Figma) */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 12px 0"}}>
              <div style={{width:120,height:80,borderRadius:6.08,overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${card.color},${card.accent})`,border:"0.51px solid rgba(255,255,255,0.2)",filter:"drop-shadow(0px 11.2px 46.4px rgba(23,59,3,0.1))"}}>
                {imgSrc?<img src={imgSrc} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><CreditCard size={28} strokeWidth={1} color="rgba(255,255,255,0.4)"/></div>}
              </div>
              <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"center",gap:8,padding:"10px 0"}}>
                <div style={{fontFamily:FN,fontSize:14,fontWeight:600,lineHeight:"20px",color:"#36405E"}}>{card.name} Credit Card</div>
                {card.is_owned?(<div style={{display:"inline-flex",alignSelf:"flex-start",alignItems:"center",justifyContent:"center",padding:"8px 11px",borderRadius:6,background:"linear-gradient(92.04deg, rgba(5,150,105,0.15) 2.34%, rgba(5,150,105,0.05) 97.73%)"}}>
                  <span style={{fontFamily:FN,fontSize:11,fontWeight:600,lineHeight:"11px",letterSpacing:"0.02em",textTransform:"uppercase",color:"#059669",whiteSpace:"nowrap"}}>In Your Wallet</span>
                </div>):(<div style={{display:"inline-flex",alignSelf:"flex-start",alignItems:"center",justifyContent:"center",padding:"8px 11px",borderRadius:6,background:"linear-gradient(92.04deg, rgba(255,109,29,0.2) 2.34%, rgba(255,109,29,0.08) 29.05%, rgba(255,109,29,0.02) 97.73%)",cursor:"pointer"}}>
                  <span style={{fontFamily:FN,fontSize:11,fontWeight:600,lineHeight:"11px",letterSpacing:"0.02em",textTransform:"uppercase",color:"#FF6D1D",whiteSpace:"nowrap"}}>Apply &amp; Get ₹1400</span>
                </div>)}
              </div>
            </div>

            {/* Fee row — 3 cells with gradient dividers (per Figma) */}
            <div style={{display:"flex",alignItems:"stretch",padding:"14px 16px"}}>
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:8}}>
                <span style={{fontFamily:FN,fontSize:11,fontWeight:400,lineHeight:"155%",color:"#808387"}}>Annual Fees</span>
                <span style={{fontFamily:FN,fontSize:12,fontWeight:600,lineHeight:"18px",color:"#36405E"}}>{card.annualFee>0?"₹"+f(card.annualFee):"Free"}</span>
              </div>
              <div style={{width:1,alignSelf:"stretch",background:"linear-gradient(180deg, #FCFEFF 0%, #CCD1D6 52.88%, #FCFEFF 100%)"}}/>
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:8}}>
                <span style={{fontFamily:FN,fontSize:11,fontWeight:400,lineHeight:"155%",color:"#808387"}}>Joining Fees</span>
                <span style={{fontFamily:FN,fontSize:12,fontWeight:600,lineHeight:"18px",color:"#36405E"}}>{card.annualFee>0?"₹"+f(card.annualFee):"Free"}</span>
              </div>
              <div style={{width:1,alignSelf:"stretch",background:"linear-gradient(180deg, #FCFEFF 0%, #CCD1D6 52.88%, #FCFEFF 100%)"}}/>
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,padding:8}}>
                <span style={{fontFamily:FN,fontSize:11,fontWeight:400,lineHeight:"155%",color:"#808387"}}>{card.is_owned?"Status":"Eligibility"}</span>
                {card.is_owned?<span style={{fontFamily:FN,fontSize:11,fontWeight:600,lineHeight:"16px",color:"#059669"}}>Owned</span>:<button onClick={()=>setBcEligSheet(card)} style={{border:"none",background:"transparent",cursor:"pointer",padding:2,fontFamily:"'SF Pro Display',sans-serif",fontSize:11,fontWeight:500,lineHeight:"16px",color:"#0064E0"}}>Check Now</button>}
              </div>
            </div>

            {/* Combine banner — gradient bg, Blacklist save text */}
            <div style={{margin:"0 12px 12px",padding:"16px 12px",borderRadius:8,border:"1px solid #E2FAEF",background:"linear-gradient(0deg, #E1FAEF 0%, #F4FDF9 100%)",display:"flex",alignItems:"center",gap:10}}>
              <img src="/legacy-assets/save star.png" alt="" style={{width:35,height:37,objectFit:"contain",flexShrink:0}}/>
              <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:6}}>
                <span style={{fontFamily:FN,fontSize:11,fontWeight:400,lineHeight:"155%",color:"#808387"}}>Combine with your cards &amp;</span>
                <span className="legacy-serif" style={{fontFamily:"'Blacklist','Google Sans',serif",fontSize:18,fontWeight:800,lineHeight:"120%",letterSpacing:"0.02em",background:"linear-gradient(180deg, #17B226 10.83%, #0A4C10 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Save ₹{f(bc.combined)}/yr</span>
              </div>
            </div>

            {/* CTAs — outlined Create Portfolio / View Card + filled View details */}
            <div style={{display:"flex",gap:10,padding:"0 12px 16px"}}>
              {card.is_owned?(
                <button onClick={()=>{if(typeof card.owned_card_index==="number"&&card.owned_card_index>=0){openCard(card.owned_card_index);}}} style={{flex:1,height:42,boxSizing:"border-box",padding:"12px 20px",borderRadius:8,border:"1px solid rgba(5,150,105,0.3)",background:"#f0fdf4",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:5,fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"150%",color:"#059669"}}>
                  View Card
                </button>
              ):(()=>{
                const isAdded = (portfolioNew||[]).includes(card.name);
                const portfolioStarted = (portfolioNew||[]).length > 0;
                const portfolioFull = (portfolioNew||[]).length >= 3;
                const onClick = () => {
                  if (isAdded) {
                    setPortfolioNew((portfolioNew||[]).filter((n: string) => n !== card.name));
                    return;
                  }
                  if (portfolioFull) return;
                  if (portfolioStarted) {
                    setPortfolioNew([...(portfolioNew||[]), card.name]);
                  } else {
                    setPortfolioEntryCard(card.name);
                    setPortfolioNew([card.name]);
                    setScreen("portfolio-create");
                  }
                };
                const label = isAdded ? "Added" : portfolioStarted ? "Add to Portfolio +" : "Create Portfolio +";
                return (
                  <button onClick={onClick} disabled={!isAdded && portfolioFull} style={{flex:1,height:42,boxSizing:"border-box",padding:"12px 20px",borderRadius:8,border:"1px solid rgba(17,52,172,0.2)",background: isAdded ? "#E3E8F8" : "#fff",cursor: !isAdded && portfolioFull ? "not-allowed" : "pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:5,fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"150%",color:"#222941",opacity: !isAdded && portfolioFull ? 0.5 : 1}}>
                    {label}
                    {isAdded && <Check size={14} strokeWidth={2.5} color="#222941" style={{marginLeft:2}}/>}
                  </button>
                );
              })()}
              <button onClick={()=>{setBcSection("overview");setBcDetTab(100);setBestCardDetail(card);}} style={{flex:1,height:41,padding:"12px 20.34px",borderRadius:8,border:"none",background:"linear-gradient(90deg, #222941 0%, #101C43 100%)",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8.48,boxShadow:"0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)"}}><span style={{fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"140%",color:"#FFFFFF"}}>View details</span><ChevronRight size={12} strokeWidth={2.5} color="#fff"/></button>
            </div>
          </div>);})}
        </div>
        )}
      </div>
      <InfoBS/>
      {/* Floating "Card Portfolio" widget — visible when user has added cards */}
      {(portfolioNew||[]).length > 0 && (() => {
        const sel = portfolioNew || [];
        const remaining = 3 - sel.length;
        const PORTFOLIO_CARD_IMG: Record<string,string> = {
          "Axis Flipkart":"/legacy-assets/cards/axis-flipkart.png","HSBC Travel One":"/legacy-assets/cards/hsbc-travel-one.png","HSBC Live+":"/legacy-assets/cards/hsbc-live.png","HDFC Infinia":"/legacy-assets/cards/hdfc-infinia.png","IDFC First Select":"/legacy-assets/cards/idfc select.png","Amex Travel Platinum":"/legacy-assets/cards/amex-platinum-travel.png","American Express Travel Platinum":"/legacy-assets/cards/amex-platinum-travel.png","AU Zenith":"/legacy-assets/cards/AU-Zenith.png","ICICI Emeralde":"/legacy-assets/cards/icici-emeralde.png","SBI Miles":"/legacy-assets/cards/sbi-miles.png","HDFC Swiggy":"/legacy-assets/cards/Hdfc swiggy.png"
        };
        // Always render 3 slots — placeholders for empty, actual cards filling from the bottom (newest at bottom).
        const slots = [0, 1, 2].map(i => {
          const filledFromBottom = i >= (3 - sel.length);
          return filledFromBottom ? sel[i - (3 - sel.length)] : null;
        });
        const rotations = [-11.92, -6.7, 0];
        const offsets = [{ left: 0, top: 0 }, { left: 1.9, top: 5.6 }, { left: 5.17, top: 12.62 }];
        return (
          <div onClick={() => { setScreen("portfolio-create"); }} style={{position:"sticky",bottom:24,marginLeft:"auto",marginRight:"auto",marginTop:-55.24,width:201.1,height:55.24,background:"#000",borderRadius:12,boxShadow:"0px 5px 15px rgba(0,0,0,0.35)",display:"flex",flexDirection:"row",alignItems:"center",padding:"8px 16px",gap:24,cursor:"pointer",zIndex:60,fontFamily:FN,boxSizing:"border-box"}}>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",width:100,height:36}}>
              <span style={{fontFamily:FN,fontSize:14,fontWeight:500,lineHeight:"150%",color:"rgba(255,255,255,0.8)",whiteSpace:"nowrap"}}>Card Portfolio</span>
              <span style={{fontFamily:FN,fontSize:10,fontWeight:500,lineHeight:"150%",color:"rgba(255,255,255,0.58)",letterSpacing:"0.12em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{remaining > 0 ? `Can add ${remaining} more` : "Tap to view"}</span>
            </div>
            <div style={{position:"relative",width:45.1,height:39.24,flexShrink:0}}>
              {slots.map((nm, i) => {
                const img = nm ? PORTFOLIO_CARD_IMG[nm] : null;
                const rot = rotations[i];
                const off = offsets[i];
                return (
                  <div key={i} style={{position:"absolute",left:off.left,top:off.top,width:39.93,height:26.62,borderRadius:1.99,overflow:"hidden",transform:`rotate(${rot}deg)`,boxShadow:"0px 2.96px 4.44px -0.89px rgba(0,0,0,0.1), 0px 1.18px 1.77px -0.59px rgba(0,0,0,0.05)",background:img ? "transparent" : "rgba(217,217,217,0.2)"}}>
                    {img && <img src={img} alt={nm || ""} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div></div><TxnSheet/><ActSheet/><CatBS/><FilterSheet/><GmailNudgePopup/><GmailNudgeSheet/><RetroOverlay/><VoiceFlowOverlay/><Toast/></div>);
};