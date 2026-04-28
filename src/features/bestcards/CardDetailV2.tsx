// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Star, Lock, ChevronRight as ChevR, CreditCard, Check } from "lucide-react";
import { FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";

/* Image map for known cards (falls back to gradient placeholder otherwise) */
const IMG: Record<string,string> = {
  "HDFC Infinia":"/legacy-assets/cards/hdfc-infinia.png",
  "IDFC First Classic":"/legacy-assets/cards/idfc-select.png",
  "Amex MRCC":"/legacy-assets/cards/amex-platinum-travel.png",
  "HDFC Regalia":"/legacy-assets/cards/hdfc-infinia.png",
  "Axis Flipkart":"/legacy-assets/cards/axis-flipkart.png",
  "HSBC Live+":"/legacy-assets/cards/hsbc-live.png",
  "HSBC Travel One":"/legacy-assets/cards/hsbc-travel-one.png",
  "Amex Travel Platinum":"/legacy-assets/cards/amex-platinum-travel.png",
};

/* Wallet (existing user cards) — single source of truth.
   Per-card spend & save are calibrated so the four rows tally to the
   stacked-bar segments and the headline "Save Upto" exactly. */
const WALLET = [
  {name:"Amex Travel Platinum", spend:800000, save:50000, pct:50, c1:"#583598", c2:"#9359FE", tags:["Bills","Food Ordering","Dining","Travel"]},
  {name:"Axis Flipkart",        spend:400000, save:20000, pct:25, c1:"#117E47", c2:"#0AA759", tags:["Online Shopping"]},
  {name:"HSBC Live+",           spend:200000, save:10000, pct:13, c1:"#4C98F4", c2:"#0862CF", tags:["Groceries","Travel"]},
  {name:"HSBC Travel One",      spend:200000, save:10000, pct:12, c1:"#EB8807", c2:"#FCAA3F", tags:["Travel"]},
];
const TOTAL_SPEND = WALLET.reduce((s,w)=>s+w.spend,0);              // 16,00,000
const TOTAL_SAVE  = WALLET.reduce((s,w)=>s+w.save,0);               // 90,000

/* Per-category breakdown for the "Cards Usage" section.
   `share` percentages within each category MUST sum to 100. */
const CATEGORIES = [
  {key:"Milestones", icon:"⭐", color:"#FFD82C"},
  {key:"Shopping",   icon:"/categories/shopping.png", color:"#3B82F6", spend:634122, save:38400, cards:[
    {name:"Axis Flipkart", spend:540000, share:81, caption:"Gives 5% Cashback",            c1:"#117E47", c2:"#0AA759"},
    {name:"HSBC Live+",    spend: 60000, share:19, caption:"4 Reward points per ₹100 spent", c1:"#4C98F4", c2:"#0862CF"},
  ]},
  {key:"Groceries",  icon:"/categories/groceries.png", color:"#16A34A", spend:220000, save:12500, cards:[
    {name:"HSBC Live+",    spend:160000, share:73, caption:"3% Cashback on groceries",     c1:"#4C98F4", c2:"#0862CF"},
    {name:"Axis Flipkart", spend: 60000, share:27, caption:"4% on Big Basket",              c1:"#117E47", c2:"#0AA759"},
  ]},
  {key:"Bills",      icon:"/categories/bills.png",     color:"#F59E0B", spend:180000, save: 7200, cards:[
    {name:"Amex Travel Platinum", spend:180000, share:100, caption:"2X MR points on bills", c1:"#583598", c2:"#9359FE"},
  ]},
  {key:"Fuel",       icon:"/categories/fuel.png",      color:"#EF4444", spend: 96000, save: 3800, cards:[
    {name:"Amex Travel Platinum", spend: 96000, share:100, caption:"Fuel surcharge waiver", c1:"#583598", c2:"#9359FE"},
  ]},
  {key:"Travel",     icon:"/categories/travel.png",    color:"#06B6D4", spend:240000, save:18600, cards:[
    {name:"HSBC Travel One", spend:160000, share:67, caption:"4X on flights & hotels",      c1:"#EB8807", c2:"#FCAA3F"},
    {name:"HSBC Live+",      spend: 80000, share:33, caption:"Lounge access at ₹1.5K trip", c1:"#4C98F4", c2:"#0862CF"},
  ]},
  {key:"Food Ordering", icon:"/categories/food.png",   color:"#F97316", spend:120000, save: 5400, cards:[
    {name:"Amex Travel Platinum", spend:120000, share:100, caption:"3X MR on food apps",    c1:"#583598", c2:"#9359FE"},
  ]},
];

/* Milestone benefits — green-bordered cards with claimable badge or lock state */
const MILESTONES = [
  {points:"7500 reward points",  spend:"Spend ₹1,90,000 in 365 days", status:"claimable"},
  {points:"10000 reward points", spend:"Spend ₹4,00,000 in 365 days", status:"claimable"},
  {points:"22500 reward points", spend:"Spend ₹7,00,000 in 365 days", status:"claimable"},
  {points:"Taj Experiences (Worth ~ ₹10,000)", spend:"Spend ₹2,00,000 on this card in 120 Days", status:"locked", lockText:"spend ₹32,750/yr more to unlock"},
];

/* Lounge & additional benefits — white cards with subtle gradient */
const LOUNGE = [
  {t:"1 free airport lounge visit/quarter",   d:"Spend ₹75,000 in the previous quarter to unlock"},
  {t:"1 free railway lounge visit/quarter",   d:"No minimum spend required"},
  {t:"25% off movie tickets, 2x a month",     d:"Min. 2 tickets on BookMyShow or INOX, up to ₹100 off per booking"},
  {t:"No International Lounge benefit availble on this card", d:"", muted:true},
];

/* Welcome benefit — single card */
const WELCOME = [
  {t:"Bookmyshow Voucher", d:"Bonus reward points awarded your first spend with this card"},
];

/* Fees & Waivers — lounge-style cards */
const FEES_WAIVERS = [
  {t:"Annual Fee (₹500 + GST)",  d:"Spend ₹1,50,000 or more to waive the next year's annual fee", badge:"Can waive on existing spends"},
  {t:"Joining Fee (₹500 + GST)", d:"Fee is mandatory and non-waivable"},
];

/* Two-column fee tables */
const ADDITIONAL_BANK_FEES: [string,string][] = [
  ["Forex Markups",            "3.50%"],
  ["APR Fees",                 "3.75%"],
  ["ATM Withdrawl",            "2.50%"],
  ["Reward Redemption Fees",   "Not Applicable"],
  ["Link for all T&Cs",        "0.054 g"],
  ["Railway Surcharge",        "1%"],
  ["Rent Payment Fee",         "1%"],
  ["Cheque Payment Fee",       "N/A"],
  ["Cash Payment Fees",        "₹100"],
];
const LATE_PAYMENT_FEES: [string,string][] = [
  ["Amount Due",        "Late Payment Fee"], // header row
  ["₹0 - ₹100",         "₹0"],
  ["₹101 - ₹500",       "₹100"],
  ["₹501 - ₹5000",      "₹500"],
  ["₹5001 - ₹10000",    "₹700"],
  ["₹10001 - ₹25000",   "₹800"],
  ["₹25001 And Above",  "₹1200"],
];

/* Step-by-step "how to spend" timeline for the active category */
const TIMELINE = [
  {kind:"card",  card:"Axis Flipkart", c1:"#117E47", c2:"#0AA759", title:"Spend ₹20,000/month on Axis Flipkart Card", caption:"via the Flipkart App", monthly:2200, yearly:26400},
  {kind:"lock",  title:"Reward points cap reached on Axis Flipkart", caption:"Cap at 2,000 RP per month"},
  {kind:"card",  card:"HSBC Live+",    c1:"#4C98F4", c2:"#0862CF", title:"Rest of ₹10,000/month on HSBC Live+",         caption:"via the Flipkart App", monthly:1200, yearly:14400},
];

const SECTION_TITLE = {fontFamily:"'Blacklist','Google Sans',serif", fontSize:20, fontWeight:700, lineHeight:"140%", color:"rgba(54,64,96,0.9)"};
const TINY_LABEL = {fontFamily:FN, fontSize:10, fontWeight:500, lineHeight:"12px", letterSpacing:"0.1em", textTransform:"uppercase" as const};

export const CardDetailV2 = ({ card, ctx }: { card: any; ctx: any }) => {
  const {
    setBestCardDetail, setBcEligSheet,
  } = ctx;
  const [tab, setTab] = useState<"how"|"benefits"|"fees"|"elig">("how");
  const [eligType, setEligType] = useState<"salaried"|"self">("self");
  const [eligPin, setEligPin] = useState("");
  const [eligIncome, setEligIncome] = useState("");
  const [activeCat, setActiveCat] = useState("Shopping");
  const [period, setPeriod] = useState<"monthly"|"yearly">("monthly");
  const cat = CATEGORIES.find(c=>c.key===activeCat) || CATEGORIES[1];
  const cardImg = IMG[card.name];
  const headlineSave = card.savings || 40000;
  /* Scale per-card saves so the row totals tally to headline exactly.
     Last row absorbs any rounding drift so Σ saves === headlineSave. */
  const SAVE_BASE = 90000; // base sum of WALLET[*].save
  const scaledSaves = WALLET.map((w,i)=>i===WALLET.length-1?0:Math.round(w.save*headlineSave/SAVE_BASE));
  scaledSaves[WALLET.length-1] = headlineSave - scaledSaves.reduce((s,v)=>s+v,0);

  /* Compute spotlight rectangle left position based on active category */
  const catWidth = (k:string) => k==="Milestones"?72:k==="Shopping"?82:75;
  const activeIdx = CATEGORIES.findIndex(c=>c.key===activeCat);
  let spotlightLeft = 10; // padding-left of strip
  for (let j=0; j<activeIdx; j++) spotlightLeft += catWidth(CATEGORIES[j].key) + 2;
  // Center the 78px rectangle within the active tile
  spotlightLeft += (catWidth(activeCat) - 78) / 2;

  /* Sticky footer appears only after the top Apply Now button scrolls out of view */
  const topApplyRef = useRef<HTMLButtonElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    if (!topApplyRef.current) return;
    const obs = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), {threshold:0, rootMargin:"0px"});
    obs.observe(topApplyRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{fontFamily:FN, maxWidth:400, margin:"0 auto", height:"100vh", display:"flex", flexDirection:"column", position:"relative", background:"#F5F9FA"}}>
      <FL/>
      <div data-scroll="1" style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", paddingBottom:120}}>
        <div className="slide-in">

          {/* ── HERO (dark band + floating card + Save Upto + Apply now) ── */}
          <div style={{position:"relative", background:"#FFFFFF"}}>
            {/* Dark gradient band */}
            <div style={{height:206, background:"linear-gradient(180deg, #010904 -15.07%, #072A4D 112.18%)", position:"relative"}}>
              <div onClick={()=>setBestCardDetail(null)} style={{position:"absolute", top:46, left:16, width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>
                <ChevronLeft size={20} color="#fff" strokeWidth={2.2}/>
              </div>
              <div style={{position:"absolute", top:75, left:0, right:0, display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
                <div style={{fontFamily:FN, fontSize:10, fontWeight:500, lineHeight:"140%", letterSpacing:"0.04em", textTransform:"uppercase", color:"rgba(217,218,218,0.8)", textAlign:"center"}}>{card.bank || "Bank"}</div>
                <div style={{fontFamily:FN, fontSize:14, fontWeight:700, lineHeight:"140%", letterSpacing:"0.04em", textTransform:"uppercase", color:"#FFFFFF", textAlign:"center"}}>{card.name}</div>
              </div>
            </div>
            {/* Card art — bridges dark + white */}
            <div style={{position:"absolute", top:131, left:"50%", transform:"translateX(-50%)", width:199, height:133, borderRadius:12, boxShadow:"0px 18px 36px rgba(0,0,0,0.35)", overflow:"hidden", background:`linear-gradient(135deg,${card.color || "#1a3a7a"},${card.accent || "#0c1f4a"})`, border:"0.83px solid rgba(255,255,255,0.2)", zIndex:2}}>
              {cardImg ? <img src={cardImg} alt={card.name} style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}}/> : <div style={{width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center"}}><CreditCard size={48} strokeWidth={1} color="rgba(255,255,255,0.4)"/></div>}
              {/* shine */}
              <div style={{position:"absolute", top:-70, left:"50%", transform:"translateX(-50%)", width:235, height:119, background:"#FFFFFF", opacity:0.2, mixBlendMode:"plus-lighter", filter:"blur(26px)", pointerEvents:"none"}}/>
            </div>
            {/* White block — Save Upto + Apply now (paddingTop clears floating card by ~20px) */}
            <div style={{paddingTop:80, paddingBottom:24, display:"flex", flexDirection:"column", alignItems:"center", gap:4}}>
              <div style={{...TINY_LABEL, fontWeight:700, color:"#36405E"}}>Save upto</div>
              <div style={{display:"flex", alignItems:"flex-start", gap:4}}>
                <span style={{fontFamily:"'IBM Plex Serif',Georgia,serif", fontSize:30, fontWeight:700, lineHeight:"110%", backgroundImage:"linear-gradient(180deg,#17B226 10.83%,#0A4C10 80%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", color:"transparent"}}>₹</span>
                <span className="legacy-serif" style={{fontFamily:"'Blacklist','Google Sans',serif", fontSize:32, fontWeight:800, lineHeight:"120%", letterSpacing:"-0.01em", backgroundImage:"linear-gradient(180deg,#17B226 10.83%,#0A4C10 80%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", color:"transparent"}}>{f(headlineSave)}/yr</span>
              </div>
              <div style={{fontFamily:FN, fontSize:12, fontWeight:400, lineHeight:"150%", color:"rgba(0,0,0,0.6)", textAlign:"center", marginTop:4}}>Add this Card to your setup</div>
              {/* Two-button row — Create Portfolio + Apply Now */}
              <div ref={topApplyRef as any} style={{marginTop:16, width:328, display:"flex", gap:8}}>
                <button onClick={()=>setBcEligSheet(card)} style={{flex:"0 0 162px", height:49, padding:"12px 20px", background:"#fff", border:"1px solid rgba(17,52,172,0.2)", borderRadius:8, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:4}}>
                  <span style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"150%", color:"#222941"}}>Create Portfolio</span>
                  <span style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"12px", color:"#222941"}}>+</span>
                </button>
                <button onClick={()=>setBcEligSheet(card)} style={{flex:"1 1 0", height:48.5, padding:"12px 20px", background:"linear-gradient(90deg, #222941 0%, #101C43 100%)", border:"none", borderRadius:10.17, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)"}}>
                  <span style={{fontFamily:FN, fontSize:12, fontWeight:600, lineHeight:"150%", color:"#E8E8E8"}}>Apply Now</span>
                  <ChevR size={12} color="#fff" strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          </div>

          {/* ── TAB BAR — sticky directly under the mini header (top: 56). Shadow appears only when stuck. ── */}
          <div style={{height:48, background:"#FFFFFF", padding:"0 8px", display:"flex", flexDirection:"column", alignItems:"center", borderTop:"0.8px dashed #E3EBED", borderBottom:"0.8px solid rgba(202,196,208,0.7)", boxSizing:"border-box", position:"sticky", top:56, zIndex:5, boxShadow: showSticky ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition:"box-shadow 200ms ease-out"}}>
            <div style={{flex:1, width:"100%", padding:"0 12px", display:"flex", justifyContent:"space-between", alignItems:"stretch", boxSizing:"border-box"}}>
              {[{k:"how", l:"How to use"}, {k:"benefits", l:"Benefits"}, {k:"fees", l:"Fee"}, {k:"elig", l:"Eligibility, T&C"}].map(t=>{
                const active = tab===t.k;
                return (
                  <div key={t.k} onClick={()=>setTab(t.k as any)} style={{display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center", position:"relative", cursor:"pointer", flex:"0 0 auto"}}>
                    <div style={{padding:"14px 0", display:"flex", alignItems:"center", justifyContent:"center"}}>
                      <span style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight: active?"20px":"18px", letterSpacing:"0.1px", textAlign:"center", color: active ? "#36405E" : "#676F88", whiteSpace:"nowrap"}}>{t.l}</span>
                    </div>
                    {active && <div style={{position:"absolute", left:2, right:2, bottom:0, height:3, background:"#36405E", borderRadius:"100px 100px 0 0"}}/>}
                  </div>
                );
              })}
            </div>
          </div>

          {tab==="how" && <>
            {/* ── SECTION A: SPENDS DISTRIBUTION ── */}
            {/* Title block */}
            <div style={{padding:"24px 16px 7px", display:"flex", flexDirection:"column", gap:2}}>
              <div style={SECTION_TITLE}>Spends Distribution</div>
              <div style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"160%", color:"#808387"}}>Based on your spend over last 365 days</div>
            </div>

            {/* Total + stacked bar */}
            <div style={{padding:"12px 17px", display:"flex", flexDirection:"column", gap:12, alignItems:"center"}}>
              <div style={{width:"100%", padding:"0 4px", display:"flex", justifyContent:"space-between", boxSizing:"border-box"}}>
                <span style={TINY_LABEL}>Total spends</span>
                <span style={{...TINY_LABEL, fontWeight:700}}>₹{f(TOTAL_SPEND)}</span>
              </div>
              <div style={{width:"100%", height:56, background:"#FFFFFF", borderRadius:12, padding:4, display:"flex", gap:4, boxShadow:"inset 0 0.9px 1.8px rgba(0,0,0,0.15), inset 0.9px -1.8px 1.8px rgba(0,0,0,0.08)", boxSizing:"border-box"}}>
                {WALLET.map((w,i)=>(
                  <div key={i} title={w.name} style={{flexBasis:`${w.pct}%`, height:48, borderRadius:10, background:`linear-gradient(180deg,${w.c1} 0%,${w.c2} 100%)`, boxShadow:"inset 0 3.5px 3.4px rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", minWidth:36}}>
                    <span style={{fontFamily:FN, fontSize:12, fontWeight:700, lineHeight:"140%", color:"#FFFFFF"}}>{w.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination dots */}
            <div style={{display:"flex", gap:4, justifyContent:"center", marginBottom:8}}>
              <div style={{width:20, height:4, borderRadius:10, background:"#222941"}}/>
              <div style={{width:20, height:4, borderRadius:10, background:"rgba(34,41,65,0.2)"}}/>
            </div>

            {/* Header strip — YOU SPEND / SAVINGS */}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"#F3F6F7", border:"1px solid #E7ECEF", marginTop:8}}>
              <span style={TINY_LABEL}>You spend</span>
              <span style={{...TINY_LABEL, fontWeight:700}}>Savings</span>
            </div>

            {/* Per-card rows */}
            {WALLET.map((w,i)=>{
              const isFirst = i===0;
              const wImg = IMG[w.name];
              return (
                <div key={i} style={{padding:"18px 16px", background: isFirst ? "#ECEBFF" : "#FFFFFF", borderBottom:"1px dashed rgba(0,0,0,0.1)", display:"flex", flexDirection:"column", gap:18}}>
                  {/* Top row: card image + name+spend + save */}
                  <div style={{display:"flex", alignItems:"flex-end", gap:12}}>
                    {/* Card image */}
                    <div style={{width:54, height:36, borderRadius:2.7, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${w.c1},${w.c2})`, border:"0.225px solid rgba(255,255,255,0.2)", filter:"drop-shadow(0px 4.4px 2.6px rgba(20,21,72,0.1)) drop-shadow(0px 2px 2px rgba(20,21,72,0.17))"}}>
                      {wImg && <img src={wImg} alt={w.name} style={{width:"100%", height:"100%", objectFit:"cover"}}/>}
                    </div>
                    {/* Middle: name + spend */}
                    <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", gap:6, minWidth:0}}>
                      <div style={{display:"flex", alignItems:"center", gap:6}}>
                        <div style={{width:10, height:10, borderRadius:2.04, background:`linear-gradient(180deg,${w.c1},${w.c2})`, boxShadow:"inset 0 3.5px 3.4px rgba(255,255,255,0.25)", flexShrink:0}}/>
                        <span style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"140%", letterSpacing:"-0.01em", color:"rgba(54,64,96,0.6)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{w.name}</span>
                      </div>
                      <span style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"145%", color:"#364060"}}>₹{f(w.spend)}</span>
                    </div>
                    {/* Right: save */}
                    <span style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"145%", color:"#139366", whiteSpace:"nowrap"}}>Save ₹{f(scaledSaves[i])}</span>
                  </div>
                  {/* Tags */}
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    {w.tags.map((t,j)=>(
                      <div key={j} style={{padding:"4px 8px", background:isFirst?"#FFFFFF":"linear-gradient(105.22deg, rgba(76,66,222,0.02) 9.46%, rgba(242,247,253,0.02) 57.36%)", border:"0.86px solid #C7D1FF", borderRadius:6, fontFamily:"'SF Pro Display',sans-serif", fontSize:11, fontWeight:600, lineHeight:"150%", color:"#6560A1"}}>{t}</div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Total footer — tally row */}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px", background:"linear-gradient(90deg, #F5F9FA 0%, #F0FFEB 100%)", borderTop:"1px solid rgba(19,147,102,0.2)", borderBottom:"1px solid rgba(19,147,102,0.2)"}}>
              <div style={{display:"flex", alignItems:"baseline", gap:4}}>
                <span style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"140%", letterSpacing:"-0.01em", color:"rgba(54,64,96,0.6)"}}>Total:</span>
                <span style={{fontFamily:FN, fontSize:14, fontWeight:700, lineHeight:"150%", letterSpacing:"-0.01em", color:"#364060"}}>₹{f(TOTAL_SPEND)}/yr</span>
              </div>
              <span style={{fontFamily:FN, fontSize:14, fontWeight:700, lineHeight:"100%", color:"#139366"}}>₹{f(headlineSave)}/yr</span>
            </div>

            {/* ── SECTION B: CARDS USAGE ── */}
            <div style={{padding:"24px 24px 12px"}}>
              <div style={SECTION_TITLE}>See how to spend on</div>
            </div>
            {/* T-shape band: small "tab" (78×94, rounded top) sits above wide rectangle (full×127),
                both sliced from the same 218px-tall blue→lavender→white gradient so they merge seamlessly.
                The tab moves horizontally with the active category. */}
            <div style={{position:"relative", height:200, overflow:"hidden"}}>
              {/* Bottom wide rectangle — y=91 to y=200 (height 109), shows the lower portion of the gradient */}
              <div style={{
                position:"absolute", left:0, right:0, top:91, height:109,
                backgroundImage:"linear-gradient(180deg, rgba(69,137,255,0.3) 0%, rgba(184,202,247,0.3) 45%, rgba(245,249,250,0.3) 100%)",
                backgroundSize:"100% 218px",
                backgroundPosition:"0 -91px",
                backgroundRepeat:"no-repeat",
                zIndex:0,
              }}/>
              {/* Top tab — y=0 to y=94, rounded top corners, slides with active category */}
              <div className="cards-usage-spotlight" style={{
                position:"absolute", top:0, left:spotlightLeft, width:78, height:94,
                borderTopLeftRadius:8, borderTopRightRadius:8,
                backgroundImage:"linear-gradient(180deg, rgba(69,137,255,0.3) 0%, rgba(184,202,247,0.3) 45%, rgba(245,249,250,0.3) 100%)",
                backgroundSize:"100% 218px",
                backgroundPosition:"0 0",
                backgroundRepeat:"no-repeat",
                transition:"left 220ms cubic-bezier(0.32,0.72,0,1)",
                zIndex:0,
              }}/>
              {/* Categories scroll — sits inside the tab area */}
              <div data-scroll="1" id="cards-usage-cats" style={{
                position:"absolute", top:12, left:0, right:0,
                display:"flex", gap:2, padding:"0 10px", overflowX:"auto",
                zIndex:1,
              }}>
                {CATEGORIES.map((c,i)=>{
                  const active = activeCat===c.key;
                  return (
                    <div key={i} data-cat={c.key} onClick={()=>c.key!=="Milestones" && setActiveCat(c.key)} style={{flex:"0 0 auto", width:c.key==="Milestones"?72:c.key==="Shopping"?82:75, height:84, padding:"5px", display:"flex", flexDirection:"column", alignItems:"center", gap:7, cursor:c.key==="Milestones"?"default":"pointer", position:"relative"}}>
                      <div style={{width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center"}}>
                        {c.key==="Milestones" ? (
                          <Star size={32} fill="#FFD82C" color="#EF8F03" strokeWidth={1.5}/>
                        ) : (
                          <img src={c.icon as string} alt={c.key} style={{width:48, height:48, objectFit:"contain"}} onError={(e:any)=>{e.target.style.display='none'}}/>
                        )}
                      </div>
                      <span style={{fontFamily:FN, fontSize:12, fontWeight:active?700:400, lineHeight:active?"16px":"14px", textAlign:"center", letterSpacing:"0.01em", color: active ? "#0064E0" : "#000000"}}>{c.key}</span>
                    </div>
                  );
                })}
              </div>
              {/* Save Upto for selected category — sits inside the wide bottom rectangle */}
              <div style={{
                position:"absolute", top:114, left:0, right:0,
                display:"flex", flexDirection:"column", alignItems:"center", padding:"0 16px",
                zIndex:1,
              }}>
                <span style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"16px", color:"rgba(54,64,96,0.8)", textAlign:"center"}}>Save Upto</span>
                <div style={{display:"flex", justifyContent:"center", alignItems:"flex-start", gap:4, marginTop:4}}>
                  <span style={{fontFamily:"'IBM Plex Serif',Georgia,serif", fontSize:30, fontWeight:700, lineHeight:"110%", color:"#146CD5"}}>₹</span>
                  <span className="legacy-serif" style={{fontFamily:"'Blacklist','Google Sans',serif", fontSize:32, fontWeight:800, lineHeight:"120%", letterSpacing:"0.02em", color:"#146CD5"}}>{f(cat.save || 0)}/yr</span>
                </div>
                <div style={{fontFamily:FN, fontSize:12, fontWeight:400, lineHeight:"150%", color:"rgba(0,0,0,0.6)", textAlign:"center", marginTop:4}}>Based on {cat.key} Spends of ₹{f(cat.spend || 0)}/yr</div>
              </div>
            </div>

            {/* "Cards to use" white box — Frame 1991635027: 326px wide, 20px 16px padding, 16px gap */}
            {cat.cards && (
              <div style={{margin:"8px 17px 0", background:"#FFFFFF", borderRadius:16, padding:"20px 16px", display:"flex", flexDirection:"column", gap:16, boxShadow:"0 1px 0 rgba(255,255,255,0.19), inset 0 0.9px 1.8px rgba(0,0,0,0.15), inset 0.9px -1.8px 1.8px rgba(0,0,0,0.08)"}}>
                {/* Header row */}
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 4px"}}>
                  <span style={TINY_LABEL}>Cards to use</span>
                  <span style={{...TINY_LABEL, fontWeight:700}}>You spend</span>
                </div>
                <div style={{height:0, borderTop:"1px dashed rgba(0,0,0,0.1)"}}/>
                {/* Card rows */}
                {cat.cards.map((cc,i)=>(
                  <div key={i} style={{display:"flex", flexDirection:"column", gap:16}}>
                    <div style={{display:"flex", gap:12, alignItems:"flex-start"}}>
                      <div style={{width:54, height:36, borderRadius:2.7, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${cc.c1},${cc.c2})`, border:"0.225px solid rgba(255,255,255,0.2)", filter:"drop-shadow(0px 8px 3.2px rgba(20,21,72,0.03)) drop-shadow(0px 4.4px 2.6px rgba(20,21,72,0.1)) drop-shadow(0px 2px 2px rgba(20,21,72,0.17)) drop-shadow(0px 0.4px 1px rgba(20,21,72,0.2))"}}>
                        {IMG[cc.name] && <img src={IMG[cc.name]} alt={cc.name} style={{width:"100%", height:"100%", objectFit:"cover"}}/>}
                      </div>
                      <div style={{flex:1, display:"flex", flexDirection:"column", gap:4, minWidth:0}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:4}}>
                          <div style={{display:"flex", alignItems:"center", gap:4}}>
                            <div style={{width:9, height:9, borderRadius:2.2, background:`linear-gradient(180deg,${cc.c1} 0%,${cc.c2} 100%)`, boxShadow:"inset 0 3.9px 3.7px rgba(255,255,255,0.25)", flexShrink:0}}/>
                            <span style={{fontFamily:FN, fontSize:13, fontWeight:500, lineHeight:"18px", color:"#36405E"}}>{cc.name}</span>
                          </div>
                          <span style={{fontFamily:FN, fontSize:11, fontWeight:500, lineHeight:"18px", color:"#36405E", whiteSpace:"nowrap"}}>₹{f(cc.spend)}</span>
                        </div>
                        <span style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"145%", color:"#808387"}}>{cc.caption}</span>
                      </div>
                    </div>
                    {i<cat.cards.length-1 && <div style={{height:0, borderTop:"1px dashed rgba(0,0,0,0.1)"}}/>}
                  </div>
                ))}
                <div style={{height:0, borderTop:"1px dashed rgba(0,0,0,0.1)"}}/>
                {/* Spend distribution — Frame 1991635063: gap 12 */}
                <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  <div style={{padding:"0 4px"}}>
                    <span style={TINY_LABEL}>Spend distribution</span>
                  </div>
                  <div style={{display:"flex", gap:8}}>
                    {cat.cards.map((cc,i)=>(
                      <div key={i} style={{flex:`${cc.share} 1 0`, minWidth:60, height:24, borderRadius:6.04, background:`linear-gradient(180deg,${cc.c1} 0%,${cc.c2} 100%)`, boxShadow:"inset 0 3.5px 3.4px rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                        <span style={{fontFamily:FN, fontSize:12, fontWeight:700, lineHeight:"140%", color:"#FFFFFF"}}>{cc.share}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION C: SPEND WITH THESE CARDS ── */}
            <div style={{marginTop:24}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"#F3F6F7", border:"1px solid #E7ECEF"}}>
                <span style={TINY_LABEL}>How to spend</span>
                <span style={{...TINY_LABEL, fontWeight:700}}>{period==="monthly"?"Per month":"Per year"}</span>
              </div>
              {/* Filter row with toggle */}
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 8px 8px 16px", background:"linear-gradient(90deg, #F5F9FA 0%, #D6E6FB 100%)"}}>
                <span style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"135%", letterSpacing:"-0.02em", color:"#495270"}}>Filter Spends &amp; Savings</span>
                <div style={{display:"flex", background:"#FFFFFF", borderRadius:8, boxShadow:"inset 1px 1px 2px rgba(0,0,0,0.11), inset 0 0.9px 1.8px rgba(0,0,0,0.15)", height:28}}>
                  {(["monthly","yearly"] as const).map((p,i)=>(
                    <div key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 16px", borderRadius: p==="monthly"?"8px 0 0 8px":"0 8px 8px 0", display:"flex", alignItems:"center", cursor:"pointer", borderRight: i===0?"1px solid rgba(43,84,134,0.2)":"none"}}>
                      <span style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"150%", color: period===p ? "#0064E0" : "#1C2A33"}}>{p==="monthly"?"Monthly":"Yearly"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div style={{position:"relative", padding:"24px 16px 8px"}}>
                {TIMELINE.map((t,i)=>(
                  <div key={i} style={{position:"relative", display:"flex", gap:12, paddingBottom:i===TIMELINE.length-1?0:24}}>
                    {/* node + connector */}
                    <div style={{position:"relative", width:56, flexShrink:0}}>
                      {t.kind==="card" ? (
                        <div style={{width:56, height:37, borderRadius:2.8, overflow:"hidden", background:`linear-gradient(135deg,${(t as any).c1},${(t as any).c2})`, filter:"drop-shadow(0px 4.5px 2.7px rgba(20,21,72,0.1))"}}>
                          {IMG[(t as any).card] && <img src={IMG[(t as any).card]} alt={(t as any).card} style={{width:"100%", height:"100%", objectFit:"cover"}}/>}
                        </div>
                      ) : (
                        <div style={{width:24, height:24, marginLeft:16, borderRadius:"50%", border:"0.5px solid #B98F8F", background:"#FCF5F5", display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <Lock size={11} color="#B98F8F" strokeWidth={2}/>
                        </div>
                      )}
                      {/* dashed vertical connector */}
                      {i<TIMELINE.length-1 && <div style={{position:"absolute", left:28, top:t.kind==="card"?44:30, bottom:-24, width:0, borderLeft:"1px dashed #C1CBD0"}}/>}
                    </div>
                    {/* content */}
                    <div style={{flex:1, display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingTop:4}}>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"150%", color:"#36405E"}}>{t.title}</div>
                        <div style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"155%", color:"#808387", marginTop:4}}>{t.caption}</div>
                      </div>
                      {t.kind==="card" && (
                        <span style={{fontFamily:FN, fontSize:14, fontWeight:700, lineHeight:"18px", color:"#139366", marginLeft:8, whiteSpace:"nowrap"}}>₹{f(period==="monthly"?(t as any).monthly:(t as any).yearly)}/{period==="monthly"?"mn":"yr"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo upsell */}
              <div style={{margin:"16px", borderRadius:10, padding:16, background:"linear-gradient(276deg, #FFFFFF 42.53%, #90B8F8 103.12%)", border:"1px solid #E8F0F1", boxShadow:"0 2px 6px rgba(190,203,206,0.15)", position:"relative", overflow:"hidden", minHeight:90}}>
                <div style={{position:"relative", zIndex:2, maxWidth:200}}>
                  <div style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"140%", color:"#121E43"}}>Use Flipkart Pay Later for an extra 5% off</div>
                  <div style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"120%", color:"rgba(91,100,126,0.7)", marginTop:4}}>Auto-pay your bill in EMIs</div>
                  <button style={{marginTop:12, padding:"6px 12px", background:"linear-gradient(90deg, #222941 0%, #101C43 100%)", border:"none", borderRadius:5, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:5, color:"#fff"}}>
                    <span style={{fontFamily:FN, fontSize:10, fontWeight:500, lineHeight:"140%"}}>Try now</span>
                    <ChevR size={10} color="#fff" strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            </div>

          </>}

          {tab==="benefits" && (<>
            {/* ── MILESTONE BENEFITS ── */}
            <div style={{padding:"24px 16px 0"}}>
              <div style={SECTION_TITLE}>Milestone Benefits</div>
            </div>
            {/* Each milestone is a row with rail+card aligned. Line is absolute so it
                spans from this circle's bottom into the next row's top, regardless of card height. */}
            <div style={{padding:"16px 16px 24px", display:"flex", flexDirection:"column"}}>
              {MILESTONES.map((m,i)=>{
                const isClaim = m.status==="claimable";
                const isLast = i===MILESTONES.length-1;
                const nextIsLocked = !isLast && MILESTONES[i+1].status!=="claimable";
                const ROW_GAP = 19;
                return (
                  <div key={i} style={{display:"flex", gap:14, position:"relative", marginBottom: isLast ? 0 : ROW_GAP}}>
                    {/* Rail column — fixed width, icon at top, line stretches down */}
                    <div style={{width:30, flexShrink:0, position:"relative", display:"flex", justifyContent:"center", alignItems:"flex-start"}}>
                      {isClaim ? (
                        <div style={{width:24, height:24, borderRadius:"50%", background:"#08CF6F", border:"1px solid #08CF6F", display:"flex", alignItems:"center", justifyContent:"center", marginTop:14, position:"relative", zIndex:1}}>
                          <Check size={12} color="#FFFFFF" strokeWidth={3}/>
                        </div>
                      ) : (
                        <div style={{width:30, height:30, borderRadius:"50%", background:"#F5FCF9", border:"0.6px solid #8FB9AA", display:"flex", alignItems:"center", justifyContent:"center", marginTop:11, position:"relative", zIndex:1}}>
                          <Lock size={14} color="#8FB9AA" strokeWidth={2}/>
                        </div>
                      )}
                      {/* Connector — extends from below the icon to the next row's icon */}
                      {!isLast && (
                        <div style={{
                          position:"absolute",
                          top: isClaim ? 14+24 : 11+30,
                          bottom: -ROW_GAP - (nextIsLocked ? 11 : 14),
                          left:"50%",
                          width:0,
                          borderLeft: nextIsLocked ? "1px dashed #C1CBD0" : "1px solid #08CF6F",
                        }}/>
                      )}
                    </div>
                    {/* Card */}
                    <div style={{
                      flex:1,
                      background:"#FFFFFF",
                      border: isClaim ? "1px solid #25DC9B" : "none",
                      boxShadow:"0 0.6px 4.4px rgba(63,66,70,0.11)",
                      borderRadius:8,
                      padding:"12px 12px 14px",
                      display:"flex", flexDirection:"column", gap:10,
                    }}>
                      <div style={{display:"flex", flexDirection:"column", gap:4}}>
                        <div style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"21px", color:"#36405E"}}>{m.points}</div>
                        <div style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"155%", color:"#808387"}}>{m.spend}</div>
                      </div>
                      {isClaim ? (
                        <div style={{
                          alignSelf:"flex-start",
                          padding:"8px",
                          background:"linear-gradient(90deg, #E0F9ED 0%, rgba(224,249,237,0) 100%), linear-gradient(90deg, #FEFEDD 0%, rgba(249,249,224,0) 100%)",
                          borderRadius:4,
                        }}>
                          <span style={{fontFamily:FN, fontSize:9, fontWeight:700, lineHeight:"120%", letterSpacing:"0.1em", textTransform:"uppercase", color:"#08CF6F"}}>Claimable</span>
                        </div>
                      ) : (
                        <div style={{
                          alignSelf:"flex-start",
                          padding:"8px",
                          background:"linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)",
                          borderRadius:4,
                        }}>
                          <span style={{fontFamily:FN, fontSize:9, fontWeight:700, lineHeight:"120%", letterSpacing:"0.1em", textTransform:"uppercase", color:"#0897CF"}}>{m.lockText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Section divider */}
            <div style={{height:10, background:"rgba(23,73,47,0.06)"}}/>

            {/* ── LOUNGE & ADDITIONAL BENEFITS ── */}
            <div style={{padding:"24px 16px 16px"}}>
              <div style={SECTION_TITLE}>Lounge and Additional Benefits</div>
            </div>
            <div style={{padding:"0 16px 24px", display:"flex", flexDirection:"column", gap:16}}>
              {LOUNGE.map((b,i)=>(
                <div key={i} style={{
                  background:"linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF",
                  border:"1px solid #E8EBED",
                  borderRadius:12,
                  padding:"16px 18px",
                  display:"flex",
                  alignItems: b.muted ? "center" : "flex-start",
                  gap:16,
                  opacity: b.muted ? 0.7 : 1,
                }}>
                  <div style={{width:45, height:42, background:"#F7F5F5", flexShrink:0, borderRadius:4}}/>
                  <div style={{flex:1, display:"flex", flexDirection:"column", gap:4}}>
                    <div style={{fontFamily:FN, fontSize: b.muted ? 12 : 14, fontWeight:500, lineHeight: b.muted ? "150%" : "21px", color: b.muted ? "rgba(54,64,94,0.8)" : "#36405E"}}>{b.t}</div>
                    {b.d && <div style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"160%", color:"#808387"}}>{b.d}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Section divider */}
            <div style={{height:10, background:"rgba(23,73,47,0.06)"}}/>

            {/* ── WELCOME BENEFITS ── */}
            <div style={{padding:"24px 16px 16px"}}>
              <div style={SECTION_TITLE}>Welcome Benefits</div>
            </div>
            <div style={{padding:"0 16px 32px", display:"flex", flexDirection:"column", gap:16}}>
              {WELCOME.map((w,i)=>(
                <div key={i} style={{
                  background:"#FFFFFF",
                  boxShadow:"0 0.6px 4.4px rgba(63,66,70,0.11)",
                  borderRadius:8,
                  padding:"12px 12px 14px",
                  display:"flex", alignItems:"flex-start", gap:14,
                }}>
                  <div style={{width:45, height:42, background:"#F7F5F5", flexShrink:0, borderRadius:4}}/>
                  <div style={{flex:1, display:"flex", flexDirection:"column", gap:4}}>
                    <div style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"21px", color:"#36405E"}}>{w.t}</div>
                    <div style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"160%", color:"#808387"}}>{w.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </>)}
          {tab==="fees" && (<>
            {/* ── FEES & WAIVERS ── */}
            <div style={{padding:"24px 16px 16px"}}>
              <div style={SECTION_TITLE}>Fees &amp; Waivers</div>
            </div>
            <div style={{padding:"0 16px 24px", display:"flex", flexDirection:"column", gap:16}}>
              {FEES_WAIVERS.map((f,i)=>(
                <div key={i} style={{
                  background:"linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF",
                  border:"1px solid #E8EBED",
                  borderRadius:12,
                  padding:"16px 18px",
                  display:"flex", alignItems:"flex-start", gap:16,
                }}>
                  <div style={{width:45, height:42, background:"#F7F5F5", flexShrink:0, borderRadius:4}}/>
                  <div style={{flex:1, display:"flex", flexDirection:"column", gap:10}}>
                    <div style={{display:"flex", flexDirection:"column", gap:4}}>
                      <div style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"21px", color:"#36405E"}}>{f.t}</div>
                      <div style={{fontFamily:FN, fontSize:11, fontWeight:400, lineHeight:"160%", color:"#808387"}}>{f.d}</div>
                    </div>
                    {f.badge && (
                      <div style={{
                        alignSelf:"flex-start",
                        padding:"8px",
                        background:"linear-gradient(90deg, #E0F9ED 0%, rgba(224,249,237,0) 100%), linear-gradient(90deg, #FEFEDD 0%, rgba(249,249,224,0) 100%)",
                        borderRadius:4,
                      }}>
                        <span style={{fontFamily:FN, fontSize:9, fontWeight:700, lineHeight:"120%", letterSpacing:"0.1em", textTransform:"uppercase", color:"#08CF6F"}}>{f.badge}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── ADDITIONAL BANK FEE — diamond divider + table ── */}
            <div style={{padding:"8px 20px 16px", display:"flex", alignItems:"center", gap:8}}>
              <span style={{fontFamily:FN, fontSize:9.3, fontWeight:600, lineHeight:"11px", textAlign:"center", letterSpacing:"0.2em", textTransform:"uppercase", color:"#2F374B", whiteSpace:"nowrap"}}>Additional Bank Fee</span>
              <div style={{flex:1, height:4, display:"flex", alignItems:"center", gap:1.5, opacity:0.4}}>
                <div style={{width:3, height:3, background:"#848CA0", transform:"rotate(45deg)", flexShrink:0}}/>
                <div style={{flex:1, borderTop:"1px solid #848CA0"}}/>
              </div>
            </div>
            <div style={{margin:"0 16px 32px", borderRadius:12, overflow:"hidden", display:"flex", border:"1px solid #E8EBED", background:"linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF"}}>
              {/* Left column (labels) */}
              <div style={{flex:1, background:"#F7F8F9", display:"flex", flexDirection:"column"}}>
                {ADDITIONAL_BANK_FEES.map(([label],i)=>(
                  <div key={i} style={{
                    padding:"12px 12px 12px 20px",
                    fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"17px", color:"#36405E",
                    borderTop: i===0 ? "none" : "1px solid #EEEEEE",
                    minHeight:41, display:"flex", alignItems:"center",
                  }}>{label}</div>
                ))}
              </div>
              {/* Right column (values) */}
              <div style={{flex:1, background:"#FFFFFF", borderLeft:"1px solid #EEEEEE", display:"flex", flexDirection:"column"}}>
                {ADDITIONAL_BANK_FEES.map(([,value],i)=>(
                  <div key={i} style={{
                    padding:"12px",
                    fontFamily:FN, fontSize:12, fontWeight:400, lineHeight:"17px", color:"#36405E", textAlign:"center",
                    borderTop: i===0 ? "none" : "1px solid #EEEEEE",
                    minHeight:41, display:"flex", alignItems:"center", justifyContent:"center",
                  }}>{value}</div>
                ))}
              </div>
            </div>

            {/* ── FEE ON LATE BILL PAYMENT — diamond divider + table ── */}
            <div style={{padding:"0 20px 16px", display:"flex", alignItems:"center", gap:8}}>
              <span style={{fontFamily:FN, fontSize:9.3, fontWeight:600, lineHeight:"11px", textAlign:"center", letterSpacing:"0.2em", textTransform:"uppercase", color:"#2F374B", whiteSpace:"nowrap"}}>Fee on late bill payment</span>
              <div style={{flex:1, height:4, display:"flex", alignItems:"center", gap:1.5, opacity:0.4}}>
                <div style={{width:3, height:3, background:"#848CA0", transform:"rotate(45deg)", flexShrink:0}}/>
                <div style={{flex:1, borderTop:"1px solid #848CA0"}}/>
              </div>
            </div>
            <div style={{margin:"0 16px 32px", borderRadius:12, overflow:"hidden", display:"flex", border:"1px solid #E8EBED", background:"linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF"}}>
              {/* Left column */}
              <div style={{flex:1, background:"#F7F8F9", display:"flex", flexDirection:"column"}}>
                {LATE_PAYMENT_FEES.map(([label],i)=>(
                  <div key={i} style={{
                    padding: i===0 ? "14px 12px 12px 20px" : "12px 12px 12px 20px",
                    fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"17px",
                    color:"#36405E",
                    borderTop: i===0 ? "none" : "1px solid #EEEEEE",
                    minHeight:41, display:"flex", alignItems:i===0?"flex-end":"center",
                  }}>{label}</div>
                ))}
              </div>
              {/* Right column */}
              <div style={{flex:1, background:"#FFFFFF", borderLeft:"1px solid #EEEEEE", display:"flex", flexDirection:"column"}}>
                {LATE_PAYMENT_FEES.map(([,value],i)=>(
                  <div key={i} style={{
                    padding: i===0 ? "14px 12px 12px" : "12px",
                    fontFamily:FN, fontSize:12, fontWeight: i===0?500:400, lineHeight:"17px", color:"#36405E", textAlign:"center",
                    borderTop: i===0 ? "none" : "1px solid #EEEEEE",
                    minHeight:41, display:"flex", alignItems:i===0?"flex-end":"center", justifyContent:"center",
                  }}>{value}</div>
                ))}
              </div>
            </div>
          </>)}

          {tab==="elig" && (<>
            {/* ═══ ELIGIBILITY CRITERIA ═══ */}
            <div style={{padding:"24px 16px 0"}}>
              <h2 style={{fontFamily:"'Blacklist','Google Sans',serif",fontWeight:700,fontSize:20,lineHeight:"140%",letterSpacing:"-0.01em",color:"rgba(54,64,96,0.9)",margin:0}}>Eligibility Criteria</h2>
            </div>

            {/* Stats grid — 2 rows × 2 then 3 cols */}
            <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
              {/* Row 1 — Age + Salary (2 cols) */}
              <div style={{display:"flex",flexDirection:"row",gap:12,height:102}}>
                <div style={{flex:1,background:"#FFFFFF",borderRadius:10,padding:"0 12px",display:"flex",flexDirection:"column",justifyContent:"center",gap:8,boxShadow:"0px 2px 5px rgba(0,0,0,0.04)"}}>
                  <div style={{fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"140%",color:"rgba(34,34,34,0.8)"}}>Age Criteria</div>
                  <div style={{fontFamily:FN,fontSize:16,fontWeight:700,lineHeight:"140%",color:"#222222"}}>21–60 yrs</div>
                </div>
                <div style={{flex:1,background:"#FFFFFF",borderRadius:12.75,padding:"0 12px",display:"flex",flexDirection:"column",justifyContent:"center",gap:8,boxShadow:"0px 2px 5px rgba(0,0,0,0.04)"}}>
                  <div style={{fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"140%",color:"rgba(34,34,34,0.8)"}}>Salary Criteria</div>
                  <div style={{fontFamily:FN,fontSize:16,fontWeight:700,lineHeight:"140%",color:"#222222"}}>₹1L+/mo</div>
                </div>
              </div>
              {/* Row 2 — Credit Rating + New to Credit + Existing Bank Customer (3 cols) */}
              <div style={{display:"flex",flexDirection:"row",gap:12,height:118}}>
                <div style={{flex:1,background:"#FFFFFF",borderRadius:12.75,padding:"9px 10px",display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:"0px 2px 5px rgba(0,0,0,0.04)"}}>
                  <div style={{fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"140%",color:"rgba(34,34,34,0.8)"}}>Credit Rating</div>
                  <div style={{fontFamily:"'Poppins','Google Sans',sans-serif",fontSize:16,fontWeight:600,lineHeight:"120%",color:"#222222"}}>750+</div>
                </div>
                <div style={{flex:1,background:"#FFFFFF",borderRadius:12.75,padding:"9px 10px",display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:"0px 2px 5px rgba(0,0,0,0.04)"}}>
                  <div style={{fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"140%",color:"rgba(34,34,34,0.8)"}}>New to Credit</div>
                  <div style={{fontFamily:"'Poppins','Google Sans',sans-serif",fontSize:15.94,fontWeight:600,lineHeight:"120%",color:"#222222"}}>No</div>
                </div>
                <div style={{flex:1,background:"#FFFFFF",borderRadius:12.75,padding:"6px 10px",display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:"0px 2px 5px rgba(0,0,0,0.04)"}}>
                  <div style={{fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"140%",color:"rgba(34,34,34,0.8)"}}>Existing Bank Customer</div>
                  <div style={{fontFamily:FN,fontSize:16,fontWeight:700,lineHeight:"140%",color:"#222222"}}>Bonus</div>
                </div>
              </div>
            </div>

            {/* Section band divider */}
            <div style={{height:10,background:"rgba(23,73,47,0.06)"}}/>

            {/* ═══ CHECK IF YOU ARE ELIGIBLE ═══ */}
            <div style={{padding:"24px 16px 12px"}}>
              <h2 style={{fontFamily:"'Blacklist','Google Sans',serif",fontWeight:700,fontSize:20,lineHeight:"140%",letterSpacing:"-0.01em",color:"rgba(54,64,96,0.9)",margin:0}}>Check if you are eligible</h2>
            </div>

            {/* Salaried / Self Employed pill toggle */}
            <div style={{margin:"4px 16px 16px",height:37,padding:2,background:"rgba(6,60,109,0.03)",borderRadius:8,boxShadow:"0px 1px 0px rgba(255,255,255,0.25), inset 0px 1px 2px rgba(6,60,109,0.15)",display:"flex",flexDirection:"row"}}>
              {[{k:"sal",l:"Salaried"},{k:"self",l:"Self Employed",active:true}].map((p:any)=>(
                <div key={p.k} style={{flex:1,height:33,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,background:p.active?"#FFFFFF":"transparent",boxShadow:p.active?"0.44px 0.44px 0.63px -0.75px rgba(0,0,0,0.26), 1.21px 1.21px 1.71px -1.5px rgba(0,0,0,0.247), 2.66px 2.66px 3.76px -2.25px rgba(0,0,0,0.23), 10px 10px 21.21px -3.75px rgba(0,0,0,0.055), inset 1px 1px 1px #FFFFFF, inset -1px -1px 0px rgba(0,0,0,0.1)":"none",cursor:"pointer"}}>
                  <span style={{fontFamily:FN,fontSize:12,fontWeight:p.active?500:400,lineHeight:"140%",letterSpacing:"-0.01em",textAlign:"center",color:p.active?"rgba(74,83,112,0.9)":"rgba(74,83,112,0.7)"}}>{p.l}</span>
                </div>
              ))}
            </div>

            {/* Form card */}
            <div style={{margin:"0 16px",padding:14.5778,background:"#FFFFFF",boxShadow:"0px 2px 5px rgba(0,0,0,0.05)",borderRadius:14.5778,display:"flex",flexDirection:"column",gap:21.87}}>
              {/* Pin Code */}
              <div style={{display:"flex",flexDirection:"column",gap:7.29}}>
                <label style={{fontFamily:FN,fontSize:12.76,fontWeight:500,lineHeight:"140%",letterSpacing:"0.01em",color:"#222222"}}>Pin Code</label>
                <input placeholder="Enter 6 Digits" style={{height:43.73,padding:"15.49px 14.58px",background:"#FFFFFF",border:"0.91px solid #D3E4FA",borderRadius:10.93,fontFamily:FN,fontSize:12.76,fontWeight:400,lineHeight:"145%",letterSpacing:"0.02em",color:"#222222",outline:"none",boxSizing:"border-box"}}/>
              </div>
              {/* Monthly Income */}
              <div style={{display:"flex",flexDirection:"column",gap:7.29}}>
                <label style={{fontFamily:FN,fontSize:12.76,fontWeight:500,lineHeight:"140%",letterSpacing:"0.01em",color:"#222222"}}>Monthly In Hand Income</label>
                <input placeholder="Enter amount" style={{height:43.73,padding:"15.49px 14.58px",background:"#FFFFFF",border:"0.91px solid #D3E4FA",borderRadius:10.93,fontFamily:FN,fontSize:12.76,fontWeight:400,lineHeight:"145%",color:"#222222",outline:"none",boxSizing:"border-box"}}/>
              </div>
              {/* Income Type */}
              <div style={{display:"flex",flexDirection:"column",gap:7.29}}>
                <label style={{fontFamily:FN,fontSize:12.76,fontWeight:500,lineHeight:"140%",letterSpacing:"0.01em",color:"#222222"}}>Select Income Type</label>
                <div style={{display:"flex",flexDirection:"row",gap:14.58}}>
                  <div style={{flex:1,height:43.73,background:"#FFFFFF",border:"0.91px solid #D3E4FA",borderRadius:10.93,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    <span style={{fontFamily:FN,fontSize:12.76,fontWeight:500,lineHeight:"145%",color:"#0A3580"}}>Salaried</span>
                  </div>
                  <div style={{flex:1,height:43.73,background:"#FFFFFF",border:"0.91px solid #D3E4FA",borderRadius:10.93,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    <span style={{fontFamily:FN,fontSize:12.76,fontWeight:500,lineHeight:"145%",color:"#0A3580"}}>Self Employed</span>
                  </div>
                </div>
              </div>

              {/* CTA + dashed divider + disclaimer */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <button style={{height:43.73,background:"rgba(0,100,224,0.1)",borderRadius:8,border:"0.91px solid #0064E0",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:FN,fontSize:12,fontWeight:500,lineHeight:"150%",letterSpacing:"0.01em",color:"#0064E0"}}>Check Eligibility</span>
                </button>
                <div style={{borderTop:"0.5px dashed rgba(0,0,0,0.5)"}}/>
                <div style={{fontFamily:FN,fontSize:11,fontWeight:400,lineHeight:"150%",letterSpacing:"0.02em",color:"rgba(2,40,81,0.6)"}}>Don't worry! Entering this information will not affect your Credit Score and we will not share this info with anyone</div>
              </div>
            </div>

            {/* Section band divider */}
            <div style={{height:10,background:"rgba(23,73,47,0.06)",marginTop:24}}/>

            {/* ═══ TERMS AND CONDITIONS ═══ */}
            <div style={{padding:"24px 16px 16px"}}>
              <h2 style={{fontFamily:"'Blacklist','Google Sans',serif",fontWeight:700,fontSize:20,lineHeight:"140%",letterSpacing:"-0.01em",color:"rgba(54,64,96,0.9)",margin:0}}>Terms and Conditions</h2>
              <div style={{marginTop:12,fontFamily:FN,fontSize:12,fontWeight:400,lineHeight:"160%",color:"rgba(54,64,96,0.7)"}}>
                <p style={{margin:"0 0 8px"}}>• Annual fees and charges as applicable, subject to change at the bank's discretion.</p>
                <p style={{margin:"0 0 8px"}}>• Reward points and cashback are credited as per the bank's reward programme terms.</p>
                <p style={{margin:"0 0 8px"}}>• Welcome benefits and milestone rewards subject to spend thresholds being met within stipulated timelines.</p>
                <p style={{margin:0}}>• For full T&Cs, refer to the bank's official documentation.</p>
              </div>
            </div>
          </>)}

        </div>
      </div>

      {/* ── MINI TOP HEADER — appears when hero CTAs scroll out (no shadow — shadow lives on the tab bar) ── */}
      <div style={{position:"absolute", left:0, right:0, top:0, height:56, background:"#FFFFFF", display:"flex", alignItems:"center", padding:"0 16px", gap:12, zIndex:10, opacity: showSticky ? 1 : 0, transform: showSticky ? "translateY(0)" : "translateY(-8px)", pointerEvents: showSticky ? "auto" : "none", transition:"opacity 200ms ease-out, transform 200ms ease-out"}}>
        <div onClick={()=>setBestCardDetail(null)} style={{width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
          <ChevronLeft size={20} color="#36405E" strokeWidth={2.2}/>
        </div>
        <span style={{fontFamily:FN, fontSize:14, fontWeight:600, lineHeight:"140%", color:"#36405E", flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{card.name}</span>
        <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", flexShrink:0}}>
          <span style={{fontFamily:FN, fontSize:9, fontWeight:700, lineHeight:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(54,64,96,0.6)"}}>Save upto</span>
          <span style={{fontFamily:"'Blacklist','Google Sans',serif", fontSize:16, fontWeight:800, lineHeight:"120%", letterSpacing:"-0.01em", backgroundImage:"linear-gradient(180deg,#17B226 10.83%,#0A4C10 80%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", color:"transparent"}}>₹{f(headlineSave)}/yr</span>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR — appears only after top Apply Now scrolls out ── */}
      <div style={{position:"absolute", left:0, right:0, bottom:0, height:79, background:"#FFFFFF", boxShadow:"0 -1px 8px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", padding:"0 16px", gap:8, opacity: showSticky ? 1 : 0, transform: showSticky ? "translateY(0)" : "translateY(8px)", pointerEvents: showSticky ? "auto" : "none", transition:"opacity 200ms ease-out, transform 200ms ease-out"}}>
        <button onClick={()=>setBcEligSheet(card)} style={{flex:"0 0 162px", height:49, padding:"12px 20px", background:"#fff", border:"1px solid rgba(17,52,172,0.2)", borderRadius:8, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:4}}>
          <span style={{fontFamily:FN, fontSize:12, fontWeight:500, lineHeight:"150%", color:"#222941"}}>Create Portfolio</span>
          <span style={{fontFamily:FN, fontSize:14, fontWeight:500, lineHeight:"12px", color:"#222941"}}>+</span>
        </button>
        <button onClick={()=>setBcEligSheet(card)} style={{flex:1, height:48.5, padding:"12px 20px", background:"linear-gradient(90deg, #222941 0%, #101C43 100%)", border:"none", borderRadius:10, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)"}}>
          <span style={{fontFamily:FN, fontSize:12, fontWeight:600, lineHeight:"150%", color:"#E8E8E8"}}>Apply Now</span>
          <ChevR size={12} color="#fff" strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
};
