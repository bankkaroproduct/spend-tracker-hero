// @ts-nocheck
import { useEffect, useState } from "react";
import { X, Clock, Gift, Mail, CreditCard, FileText, Sparkles, Lock, AlertTriangle, Mic, Check, ChevronRight, ChevronDown } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { useAppContext } from "@/store/AppContext";
import { SEMI_CARDS, ALL_TXNS, CAT_OPTIONS, BRAND_MAP, SIM_CARD_RATE, SIM_CARD_BASE_RATE, SIM_BEST_FOR, SIM_MARKET_BEST, computeTxnMissed, computeTxnMarketDelta, CD, CARDS, CARD_IMG_MAP } from "@/data/simulation/legacy";
import { USER_CARDS } from "@/data/simulation/inputs";
import { SCENARIO_SAVED_COLOR, getTransactionScenario } from "@/data/simulation/txnScenario";

const NOT_SPEND_REASONS=["Loan / EMI","Refund / Reversal","OTP / Auth charge","Duplicate SMS","Other (not a spend)"];

export function Toast(){
  const {toast}=useAppContext();
  if(!toast)return null;
  return(<div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:300,padding:"12px 24px",borderRadius:12,background:"#059669",color:"#fff",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"toastIn 0.3s ease",whiteSpace:"nowrap"}}>{toast}<style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style></div>);
}

export function InfoBS(){
  const {infoSheet,setInfoSheet}=useAppContext();
  if(!infoSheet)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,padding:"0 16px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setInfoSheet(null);}}><div style={{background:C.white,borderRadius:24,padding:"16px 28px 44px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 20px"}}/><div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:12}}>{infoSheet.title}</div><div style={{fontSize:13,color:C.sub,lineHeight:1.6,marginBottom:20,whiteSpace:"pre-line"}}>{infoSheet.desc}</div><button onClick={()=>setInfoSheet(null)} style={{width:"100%",padding:14,background:C.blue,color:"#fff",border:"none",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FN}}>Got it</button></div></div>);
}

const fmtRate=(cardName,brand)=>{const r=SIM_CARD_RATE[cardName]?.[brand];const isPoints=cardName==="HSBC Travel One";if(!r){const baseR=SIM_CARD_BASE_RATE[cardName]||0;return isPoints?Math.round(baseR/10)+"X REWARDS":Math.round(baseR)+"% CASHBACK";}return isPoints?Math.round(r/10)+"X REWARDS":Math.round(r)+"% CASHBACK";};
const fmtBaseRate=(cardName)=>{const r=SIM_CARD_BASE_RATE[cardName]||1;const isPoints=cardName==="HSBC Travel One";return isPoints?Math.round(r/10)+"X BASE REWARDS":Math.round(r)+"% BASE CASHBACK";};
const CARD_VIA_MAP={"Axis Flipkart Card":"Axis Flipkart","HSBC Travel One":"HSBC Travel One","HSBC Live+":"HSBC Live+"};
const cardImgStyle={width:70.72,height:47.15,borderRadius:3.54,border:"0.29px solid rgba(255,255,255,0.2)",boxShadow:"0px 0.52px 1.31px rgba(20,21,72,0.2), 0px 2.62px 2.62px rgba(20,21,72,0.17), 0px 5.76px 3.41px rgba(20,21,72,0.1)",objectFit:"cover",flexShrink:0};
const txnBtnStyle={width:"100%",height:48.51,background:"linear-gradient(90deg, #222941 0%, #101C43 100%)",color:"#E8E8E8",border:"none",borderRadius:10.17,fontSize:12,fontWeight:600,lineHeight:"150%",textAlign:"center",cursor:"pointer",boxShadow:"0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.25), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 3.85px 3.85px 5.44px -1.96px rgba(0,0,0,0.19), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2), -0.33px -0.33px 0px rgba(0,0,0,0.69), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)"};
const SectionLabel=({text})=>(<div style={{marginBottom:14,padding:"0 4px"}}><span style={{fontSize:9.28,fontWeight:700,color:"#2F374B",letterSpacing:"0.2em",textTransform:"uppercase",lineHeight:"10.76px"}}>{text}</span></div>);
const YouSpentBadge=({amt})=>(<div style={{padding:"8px 15px",borderRadius:6,background:"rgba(255,255,255,0.65)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",boxShadow:"inset 3px 3px 0.5px -3.5px rgba(255,255,255,0.5), inset 2px 2px 1px -2px #B3B3B3, inset -2px -2px 1px -2px #B3B3B3, inset 0px 0px 0px 1px #999999, inset 0px 0px 22px rgba(242,242,242,0.5)",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{fontSize:11,fontWeight:400,color:"#808387",lineHeight:"155%",textAlign:"right"}}>You Spent</div><div style={{fontSize:14,fontWeight:600,color:"#364060",lineHeight:"140%",letterSpacing:"0.01em",textAlign:"right"}}>₹{f(amt)}</div></div>);
const DashedLine=({color="rgba(173,203,171,0.3)"})=>(<svg width="100%" height="1" style={{display:"block",margin:"14px 0"}}><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke={color} strokeWidth="1" strokeDasharray="2 2"/></svg>);

const TxnSheetAnims=()=>(<style>{`
@keyframes txnSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes txnOverlayIn{from{opacity:0}to{opacity:1}}
@keyframes txnFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.txn-sheet-overlay{animation:txnOverlayIn 200ms cubic-bezier(0.23,1,0.32,1) forwards}
.txn-sheet-panel{animation:txnSheetUp 350ms cubic-bezier(0.32,0.72,0,1) forwards}
.txn-stagger{opacity:0;animation:txnFadeUp 300ms cubic-bezier(0.23,1,0.32,1) forwards}
.txn-s1{animation-delay:80ms}.txn-s2{animation-delay:160ms}.txn-s3{animation-delay:240ms}.txn-s4{animation-delay:320ms}.txn-s5{animation-delay:400ms}
.txn-sheet-panel button:active{transform:scale(0.97);transition:transform 100ms ease-out}
`}</style>);

// Bottom-sheet section helpers — render scenario-driven blocks
const SHEET_BG: Record<string, string> = {
  S1: "linear-gradient(44.22deg, #FFFFFF 64.77%, #FFF4DC 93.92%)",
  S2: "linear-gradient(44.22deg, #FFFFFF 64.77%, #FFF4DC 93.92%)",
  S3: "linear-gradient(44.22deg, #FFFFFF 64.77%, #FDF2E9 93.92%)",
  S4: "linear-gradient(44.22deg, #FFFFFF 64.77%, #FFE4DC 93.92%)",
  S5a: "linear-gradient(44.22deg, #FFFFFF 64.77%, #FDF2E9 93.92%)",
  S5b: "linear-gradient(44.22deg, #FFFFFF 64.77%, #FDF2E9 93.92%)",
  S5c: "linear-gradient(44.22deg, #FFFFFF 64.77%, #FFE4DC 93.92%)",
  S6: "#FFFFFF",
};

function CardYouUsedBlock({ scn, cardName, cardImg, txn }) {
  if (scn.isUPI) {
    return (
      <div className="txn-stagger txn-s2" style={{ borderRadius: 6, border: "1px solid rgba(0,0,0,0.05)", background: "rgba(237,237,237,0.2)", padding: "14px 16px", marginBottom: 20, fontSize: 12, fontWeight: 500, color: "#364060", lineHeight: "154%" }}>
        {`You've used UPI for this transaction. No rewards earned`}
      </div>
    );
  }
  const isBest = scn.id === "S1" || scn.id === "S2";
  const boxBg = isBest ? "rgba(218,255,217,0.2)" : "rgba(255,247,217,0.2)";
  const boxBorder = isBest ? "1px solid #CFF3CE" : "1px solid #F3E2CE";
  const noReward = scn.actualSavings === 0;
  const usedCard = scn.cardUsed || {};
  const displayName = usedCard.name || cardName || "Card";
  const displayImg = usedCard.image || cardImg;
  const rateText = usedCard.rateLabel || fmtRate(displayName, txn.brand);
  const savedColor = noReward ? "#B56D3C" : SCENARIO_SAVED_COLOR[scn.id] || "#008846";
  return (
    <div className="txn-stagger txn-s3" style={{ borderRadius: 8, border: boxBorder, background: boxBg, padding: 14, marginBottom: isBest ? 24 : 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {displayImg && <img src={displayImg} alt="" style={cardImgStyle} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#36405E", lineHeight: "18px" }}>{displayName}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: noReward ? "#B56D3C" : "#68A250", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "120%", marginTop: 4 }}>
            {noReward ? "No reward on this brand" : rateText}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 400, color: "#808387", lineHeight: "155%", textAlign: "right" }}>Saved</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: savedColor, lineHeight: "140%", letterSpacing: "0.01em", textAlign: "right", marginTop: 2 }}>₹{f(scn.actualSavings)}</div>
        </div>
      </div>
      {isBest && (
        <div>
          <DashedLine />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/legacy-assets/save star.webp" alt="" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#395E36", lineHeight: "170%" }}>
                {scn.id === "S1" ? `Best card to use for ${txn.brand}` : `Best card in market for ${txn.brand}`}
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(37,37,37,0.5)", lineHeight: "170%" }}>Keep using it for maximum rewards</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoWalletRewardSubtext() {
  return (
    <div className="txn-stagger txn-s3" style={{ borderRadius: 6, border: "1px solid rgba(0,0,0,0.05)", background: "rgba(237,237,237,0.2)", padding: "14px 16px", marginBottom: 20, fontSize: 12, fontWeight: 500, color: "#364060", lineHeight: "154%" }}>
      No cards in your wallet give rewards on this brand
    </div>
  );
}

function BetterCardInWalletBlock({ scn, txn }) {
  const w = scn.bestWalletCard;
  if (!w) return null;
  const showGreenBadge = scn.id === "S5a" || (scn.id === "S3" && scn.walletEqualsMarket);
  const showAmberBadge = scn.id === "S5b" || (scn.id === "S3" && !scn.walletEqualsMarket);
  const couldSave = scn.id === "S3" ? scn.walletDelta : scn.bestWalletSavings;
  return (
    <div className="txn-stagger txn-s3" style={{ borderRadius: 8, border: "1px solid #CFF3CE", background: "rgba(218,255,217,0.2)", padding: 14, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {w.image && <img src={w.image} alt="" style={cardImgStyle} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#36405E", lineHeight: "18px" }}>{w.name}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#68A250", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "120%", marginTop: 4 }}>{w.rateLabel}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 400, color: "#808387", lineHeight: "155%", textAlign: "right" }}>Could Save</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#008846", lineHeight: "140%", letterSpacing: "0.01em", textAlign: "right", marginTop: 2 }}>₹{f(couldSave)}</div>
        </div>
      </div>
      {(showGreenBadge || showAmberBadge) && (
        <div>
          <DashedLine />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/legacy-assets/save star.webp" alt="" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#395E36", lineHeight: "170%" }}>
                {showGreenBadge ? `Best card in market for ${txn.brand}` : `Better card for ${txn.brand}`}
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(37,37,37,0.5)", lineHeight: "170%" }}>
                {showGreenBadge ? "Keep using it for maximum rewards" : "Use it next time"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorthAddingBlock({ scn, txn, onDetails }) {
  const m = scn.worthAddingCard || scn.bestMarketCard;
  if (!m) return null;
  return (
    <div>
      <div className="txn-stagger txn-s4"><SectionLabel text="Worth adding" /></div>
      <div className="txn-stagger txn-s4" style={{ borderRadius: 8, border: "1px solid #CED3F3", background: "rgba(217,229,255,0.2)", padding: 14, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {m.image && <img src={m.image} alt="" style={cardImgStyle} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#36405E", lineHeight: "18px" }}>{m.name}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#098039", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "120%", marginTop: 4 }}>{m.rateLabel}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 400, color: "#808387", lineHeight: "155%", textAlign: "right" }}>Could Save</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#008846", lineHeight: "140%", letterSpacing: "0.01em", textAlign: "right", marginTop: 2 }}>₹{f(scn.bestMarketSavings)}</div>
          </div>
        </div>
        <DashedLine color="rgba(173,203,171,0.3)" />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/ui/market-badge.webp" alt="" style={{ width: 31, height: 37, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "#363B5E", lineHeight: "170%" }}>Best card for {txn.brand} out there</div>
          <div onClick={onDetails} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#232A42", cursor: "pointer" }}>
            Details <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="#232A42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TxnSheet() {
  const { txnSheet, setTxnSheet, setScreen } = useAppContext();
  if (!txnSheet) return null;

  const cardName = CARD_VIA_MAP[txnSheet.via] || txnSheet.via;
  const cardImg = CARD_IMG_MAP[cardName];
  const merchantIcon = { "Flipkart": "/brands/flipkart.webp", "Amazon": "/brands/amazon.webp", "Swiggy": "/brands/swiggy.webp", "Zomato": "/brands/zomato.webp", "BigBasket": "/brands/bb.webp", "Myntra": "/brands/myntra.webp", "Adidas": "/brands/adiddas.webp", "MuscleBlaze": "/brands/muscle-blaze.webp" }[txnSheet.brand];

  const scn = getTransactionScenario(txnSheet);
  const bgGrad = SHEET_BG[scn.id] || SHEET_BG.S6;

  const showNoWalletSubtext = scn.showNoWalletSubtext;
  const showBetterInWallet = scn.showBetterInWallet;
  const showWorthAdding = scn.showWorthAdding;

  const header = (
    <>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.1)", margin: "0 auto 20px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 4px", marginBottom: 20 }}>
        {merchantIcon
          ? <img src={merchantIcon} alt="" style={{ width: 65, height: 57, borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
          : <div style={{ width: 65, height: 57, borderRadius: 8, border: "1px solid #EDEDED", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>{txnSheet.icon}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#36405E", lineHeight: "17px" }}>{txnSheet.brand}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#808387", lineHeight: "140%", marginTop: 6 }}>{txnSheet.date}</div>
        </div>
        <YouSpentBadge amt={txnSheet.amt} />
      </div>
      <div style={{ height: 0, borderBottom: "1px solid rgba(5,34,73,0.15)", margin: "0 0 20px" }} />
    </>
  );

  // S6 dead transaction — minimal sheet
  if (scn.id === "S6") {
    return (
      <div className="txn-sheet-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }} onClick={e => { if (e.target === e.currentTarget) setTxnSheet(null); }}>
        <TxnSheetAnims />
        <div className="txn-sheet-panel" style={{ background: bgGrad, borderRadius: "24px 24px 0 0", padding: "16px 16px 32px", maxWidth: 400, width: "100%", maxHeight: "85vh", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflowY: "auto" }}>
          <div className="txn-stagger txn-s1">{header}</div>
          <div className="txn-stagger txn-s2"><SectionLabel text="Card you used" /></div>
          <div className="txn-stagger txn-s3" style={{ borderRadius: 6, border: "1px solid rgba(0,0,0,0.05)", background: "rgba(237,237,237,0.2)", padding: "14px 16px", marginBottom: 20, fontSize: 12, fontWeight: 500, color: "#364060", lineHeight: "154%" }}>
            No reward on this brand
          </div>
          <div className="txn-stagger txn-s5"><button onClick={() => setTxnSheet(null)} style={{ ...txnBtnStyle, fontFamily: FN }}>Got it</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="txn-sheet-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }} onClick={e => { if (e.target === e.currentTarget) setTxnSheet(null); }}>
      <TxnSheetAnims />
      <div className="txn-sheet-panel" style={{ background: bgGrad, borderRadius: "24px 24px 0 0", padding: "16px 16px 32px", maxWidth: 400, width: "100%", maxHeight: "85vh", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflowY: "auto" }}>
        <div className="txn-stagger txn-s1">{header}</div>
        <div className="txn-stagger txn-s2"><SectionLabel text="Card you used" /></div>
        <CardYouUsedBlock scn={scn} cardName={cardName} cardImg={cardImg} txn={txnSheet} />
        {showNoWalletSubtext && <NoWalletRewardSubtext />}

        {showBetterInWallet && (
          <div>
            <div className="txn-stagger txn-s3"><SectionLabel text="Better card in your wallet" /></div>
            <BetterCardInWalletBlock scn={scn} txn={txnSheet} />
          </div>
        )}

        {showWorthAdding && (
          <WorthAddingBlock scn={scn} txn={txnSheet} onDetails={() => { setTxnSheet(null); setScreen("bestcards"); }} />
        )}

        <div className="txn-stagger txn-s5"><button onClick={() => setTxnSheet(null)} style={{ ...txnBtnStyle, fontFamily: FN }}>Got it</button></div>
      </div>
    </div>
  );
}

function ActCapBar({label,used,total,unit="",resetDays=12,suffix="left"}:{label:string,used:number,total:number,unit?:string,resetDays?:number,suffix?:string}){const pct=total>0?Math.min(100,Math.round(used/total*100)):0;const barColor=pct>70?"linear-gradient(90deg,#FF7D66,#FF9B85)":pct>40?"linear-gradient(90deg,#FFE666,#FFD633)":"linear-gradient(90deg,#4DC20D,#6AD82E)";const rightText=pct>=100?`${unit?unit+" ":""}₹${f(total)} fully Used`:`${unit?unit+" ":""}${f(used)} / ${f(total)} ${unit?unit+" ":""}${suffix}`;return(<div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}><div style={{fontSize:14,fontWeight:600,color:"#222941"}}>{label}</div><div style={{fontSize:12,fontWeight:600,color:"#364060"}}>{rightText}</div></div><div style={{height:16,borderRadius:4,background:"rgba(123,142,178,0.1)",boxShadow:"0px 1px 0px rgba(255,255,255,0.19), inset 1px 1px 2px rgba(0,0,0,0.11)",overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",borderRadius:4,background:barColor,boxShadow:"0px 2.75px 5px rgba(0,0,0,0.12)"}}/></div>{resetDays>0&&<div style={{fontSize:11,color:"#808387",marginTop:6}}>{resetDays} Days left</div>}</div>);}

function ActFAQ({question,answer}:{question:string,answer:string}){const[open,setOpen]=useState(false);return(<div style={{borderRadius:12,border:"1px solid #E8F0F1",marginBottom:16,overflow:"hidden"}}><div onClick={()=>setOpen(!open)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",cursor:"pointer"}}><span style={{fontSize:13,fontWeight:500,color:"#222941"}}>{question}</span><ChevronDown size={16} color="#808387" style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 200ms ease"}}/></div>{open&&<div style={{padding:"0 16px 14px",fontSize:13,fontWeight:400,color:"#808387",lineHeight:1.6,whiteSpace:"pre-line"}}>{answer}</div>}</div>);}

function ActCategoryCard({icon,name,rate}:{icon:string,name:string,rate:string}){return(<div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0"}}><img src={icon} alt="" style={{width:48,height:48,borderRadius:12,objectFit:"contain"}} onError={e=>{e.currentTarget.style.display="none";}}/><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#222941"}}>{name}</div><div style={{fontSize:10,fontWeight:700,color:"#068846",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:4}}>BEST REWARD RATE - {rate}</div></div></div>);}

export function ActSheet(){
  const {actSheet,setActSheet,setScreen,setRedeemCard,setRedeemPts,setRedeemResult,setRedeemPref,openCard}=useAppContext();
  const[redeemTab,setRedeemTab]=useState("Air Miles");
  if(!actSheet)return null;
  const isCap=actSheet.type==="cap";
  const isCreditLimit=actSheet.type==="credit-limit";
  const isPoints=actSheet.type==="points";
  const isFee=actSheet.type==="fee";
  const isBenefit=actSheet.type==="benefit";
  const cardName=actSheet.title?.match(/on (.+?)( Card)?$/)?.[1]||actSheet._card||actSheet.altCard||"HSBC Travel One";
  const altCard=actSheet.altCard||SIM_BEST_FOR[cardName]||"HSBC Live+";
  const altImg=CARD_IMG_MAP[altCard]||"/legacy-assets/cards/hsbc-live.webp";
  const altRateText=typeof actSheet.altRate==="number"
    ? `${Math.round(actSheet.altRate)}% CASHBACK`
    : (SIM_CARD_RATE[altCard] ? fmtBaseRate(altCard) : fmtBaseRate(altCard));
  const capCategory=actSheet.title?.split(" rewards")[0]||actSheet.title?.split(" on ")[0]||"Dining";

  const cardIndex=(CARDS||[]).findIndex((c:any)=>c.name===cardName);
  const cd=(CD||[])[cardIndex]||null;
  const creditUsed=cd?.limits?.creditUsed ?? null;
  const creditTotal=cd?.limits?.creditTotal ?? null;

  const ci=actSheet._ci??cardIndex;
  const pointsFromTitle=(()=>{const m=(actSheet.title||"").match(/([\d,]+)\s*points/i);if(!m)return null;return parseInt(m[1].replace(/,/g,""),10);})();
  const baseConvRate=USER_CARDS[ci>=0?ci:0]?.conv_rate||0.20;
  const worthFromDesc=(()=>{const m=(actSheet.desc||"").match(/Worth\s*₹\s*([\d,]+)/i);if(!m)return null;return parseInt(m[1].replace(/,/g,""),10);})();
  const pointsWorth=worthFromDesc??Math.round((pointsFromTitle??5000)*baseConvRate);
  const capLimitFromDesc=(()=>{const m=(actSheet.desc||"").match(/₹\s*([\d,]+)\/mo/i);if(!m)return null;return parseInt(m[1].replace(/,/g,""),10);})();

  const handleCta=()=>{setActSheet(null);if(isPoints||isBenefit){setScreen("redeem");setRedeemCard(null);setRedeemPts("");setRedeemResult(null);setRedeemPref(null);}else if(isFee){openCard(0);}else if(isCreditLimit){openCard(1);}else{setScreen("calc");}};
  const ctaText=isCreditLimit?"Pay Bill Now →":isCap?"See alternatives on savings finder →":isPoints?"Find best redemption options →":isBenefit?"Find best redemption options →":isFee?"Find recommendations on savings finder →":actSheet.cta||"Take action →";
  const headerTitle=isBenefit?"Benefits Expiring":isFee?"Fee Waiver":isCreditLimit?"Credit Limit Reached":isPoints?"Points expiring":actSheet.title;
  const headerSub=isFee||isCreditLimit||isPoints||isBenefit?cardName:actSheet.desc||cardName;

  return(<div className="txn-sheet-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={e=>{if(e.target===e.currentTarget)setActSheet(null);}}>
  <TxnSheetAnims/>
  <div className="txn-sheet-panel" style={{background:C.white,borderRadius:"24px 24px 0 0",padding:"16px 20px 32px",maxWidth:400,width:"100%",maxHeight:"85vh",boxShadow:"0 20px 60px rgba(0,0,0,0.12)",overflowY:"auto"}} data-scroll="1">
    <div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 16px"}}/>

    {/* ── Header ── */}
    <div className="txn-stagger txn-s1" style={{display:"flex",alignItems:"center",gap:14,paddingBottom:16,borderBottom:"1px solid #E8F0F1"}}>
      <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
        <img src="/categories/image 4623.webp" alt="" style={{width:48,height:48,objectFit:"contain"}} onError={e=>{e.currentTarget.style.display="none";}}/>
        {isFee&&<div style={{position:"absolute",bottom:-2,right:-2,width:18,height:18,borderRadius:"50%",background:"#059669",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={10} color="#fff" strokeWidth={3}/></div>}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:16,fontWeight:700,color:"#222941"}}>{headerTitle}</div>
        <div style={{fontSize:12,fontWeight:400,color:"#808387",marginTop:4}}>{headerSub}</div>
      </div>
    </div>

    {/* ══════════════════ FEE WAIVER ══════════════════ */}
    {isFee&&<>
      <div className="txn-stagger txn-s2" style={{margin:"20px 0"}}>
        <ActCapBar label="Annual Fee Waiver" used={CD[actSheet._ci??cardIndex]?.totalSpend||0} total={USER_CARDS[actSheet._ci??cardIndex]?.fee_waiver_threshold||350000} unit="₹" resetDays={50} suffix="Spent"/>
      </div>

      <div className="txn-stagger txn-s3" style={{marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,color:"#364060",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14}}>Best Categories to Spend</div>
        <ActCategoryCard icon="/categories/dining.webp" name="Dining" rate="5%"/>
        <div style={{height:0,borderBottom:"1px dashed rgba(0,0,0,0.06)"}}/>
        <ActCategoryCard icon="/categories/groceries.webp" name="Groceries" rate="3%"/>
        <div style={{height:0,borderBottom:"1px dashed rgba(0,0,0,0.06)"}}/>
        <ActCategoryCard icon="/categories/shopping.webp" name="Online Shopping" rate="2%"/>
      </div>

      <div className="txn-stagger txn-s4">
        <ActFAQ question="What is a Fee Waiver" answer={"A fee waiver is when the bank cancels your annual fee because you spent enough on the card to \"earn\" it back\n\nHow it works\nYour spend cycle starts from your card anniversary. The bank tracks all spends till the next anniversary\n\n• Hit the spend target → fee is waived automatically\n• Miss it → fee is charged in your next statement"}/>
      </div>
    </>}

    {/* ══════════════════ CAP MAXED ══════════════════ */}
    {isCap&&<>
      <div className="txn-stagger txn-s2" style={{display:"flex",alignItems:"flex-start",gap:10,padding:"14px 16px",borderRadius:10,background:"#FFF7ED",border:"1px solid #FED7AA",margin:"16px 0"}}><AlertTriangle size={18} strokeWidth={1.5} color="#D97706" style={{flexShrink:0,marginTop:1}}/><div style={{fontSize:13,fontWeight:500,color:"#D97706"}}>Every {capCategory.toLowerCase()} spend on this card now earns 0%</div></div>

      <div className="txn-stagger txn-s3" style={{marginTop:8}}>
        <ActCapBar label={capCategory+" Rewards Cap"} used={(()=>{const caps=CD[actSheet._ci??cardIndex]?.limits?.caps||[];const match=caps.find(c=>c.name.toLowerCase().includes(capCategory.toLowerCase()));return (match||caps[0])?.used||0;})()} total={(()=>{const caps=CD[actSheet._ci??cardIndex]?.limits?.caps||[];const match=caps.find(c=>c.name.toLowerCase().includes(capCategory.toLowerCase()));return (match||caps[0])?.total||30000;})()} unit="Points" resetDays={12} suffix="left"/>
      </div>

      <div className="txn-stagger txn-s4" style={{margin:"8px 0 16px"}}>
        <div style={{fontSize:10,fontWeight:700,color:"#364060",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Best Alternatives</div>
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:"1px solid #E8F0F1"}}>
          <img src={altImg} alt="" style={{...cardImgStyle,objectFit:"cover"} as any}/>
          <div><div style={{fontSize:14,fontWeight:600,color:"#222941"}}>{altCard}</div><div style={{fontSize:10,fontWeight:700,color:"#068846",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:4}}>{altRateText} ON {capCategory.toUpperCase()}</div></div>
        </div>
      </div>

      <div className="txn-stagger txn-s5">
        <ActFAQ question="What is a reward cap?" answer={`A reward cap is the maximum reward you can earn on a card set by the bank, not by you.\n\nFor ${capCategory.toLowerCase()} spends, ${cardName} has a monthly reward cap${capLimitFromDesc?` of ₹${capLimitFromDesc.toLocaleString("en-IN")}`:""}. Once you hit the cap, additional spends may earn reduced or no rewards.\n\nWe track your spend against every cap on every card and flag it the moment one is breached so rewards keep flowing instead of going to waste.`}/>
      </div>
    </>}

    {/* ══════════════════ CREDIT LIMIT ══════════════════ */}
    {isCreditLimit&&<>
      <div className="txn-stagger txn-s2" style={{marginTop:20}}>
        <ActCapBar label="Card limit" used={creditUsed??0} total={creditTotal??0} unit="₹" resetDays={12} suffix="fully Used"/>
      </div>

      <div className="txn-stagger txn-s3" style={{margin:"0 0 16px"}}>
        <div style={{padding:"14px 16px",borderRadius:10,border:"1px solid #E8F0F1",textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:500,color:"#808387",lineHeight:1.5}}>Check your bank app for billing details</div>
        </div>
      </div>

      <div className="txn-stagger txn-s4" style={{display:"flex",alignItems:"flex-start",gap:10,padding:"14px 16px",borderRadius:10,background:"#FFF7ED",border:"1px solid #FED7AA",marginBottom:16}}><AlertTriangle size={18} strokeWidth={1.5} color="#D97706" style={{flexShrink:0,marginTop:1}}/><div style={{fontSize:13,fontWeight:500,color:"#D97706"}}>High credit use (&gt;30%) hurts your credit score. Try to reduce usage below 30% to protect your score</div></div>
    </>}

    {/* ══════════════════ POINTS EXPIRING ══════════════════ */}
    {isPoints&&<>
      <div className="txn-stagger txn-s2" style={{borderRadius:12,border:"1px solid #E8F0F1",padding:20,margin:"20px 0",textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:400,color:"#808387"}}>Expiring in {actSheet.badge?.replace("In ","")?.replace("Days","days")||"6 days"}</div>
        <div className="legacy-serif" style={{fontSize:28,fontWeight:700,color:"#222941",margin:"8px 0 4px"}}>{(pointsFromTitle??5000).toLocaleString("en-IN")} points</div>
        <div style={{fontSize:13,fontWeight:500,color:"#068846"}}>(worth {"₹"}{f(pointsWorth)})</div>
      </div>

      <div className="txn-stagger txn-s3" style={{marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,color:"#364060",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14}}>Best Redemption Options</div>

        {/* Tab bar */}
        <div style={{display:"flex",borderBottom:"1px solid #E8F0F1",marginBottom:16}}>
          {["Air Miles","Hotels","Vouchers"].map(tab=>(<div key={tab} onClick={()=>setRedeemTab(tab)} style={{flex:1,textAlign:"center",paddingBottom:10,cursor:"pointer",fontSize:13,fontWeight:tab===redeemTab?600:400,color:tab===redeemTab?"#1d4ed8":"#808387",borderBottom:tab===redeemTab?"2.5px solid #1d4ed8":"2.5px solid transparent",transition:"all 150ms ease"}}>{tab}</div>))}
        </div>

        {/* Table */}
        {redeemTab==="Air Miles"&&<div>
          <div style={{display:"flex",padding:"8px 0",borderBottom:"1px solid #E8F0F1"}}>
            <div style={{flex:2,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase"}}>Airline</div>
            <div style={{flex:1,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase",textAlign:"center"}}>Rate</div>
            <div style={{flex:1,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase",textAlign:"right"}}>Your Value</div>
          </div>
          {[{airline:"Air India",rate:"1:1",mult:1},{airline:"Vistara",rate:"1:1.2",mult:1.2},{airline:"Singapore Air",rate:"1:0.8",mult:0.8}].map((r,i)=>(<div key={i}><div style={{display:"flex",padding:"12px 0",alignItems:"center"}}><div style={{flex:2,fontSize:13,fontWeight:500,color:"#222941"}}>{r.airline}</div><div style={{flex:1,fontSize:13,fontWeight:500,color:"#364060",textAlign:"center"}}>{r.rate}</div><div style={{flex:1,fontSize:13,fontWeight:600,color:"#222941",textAlign:"right"}}>{"₹"}{f(Math.round((pointsWorth)*r.mult))}</div></div>{i<2&&<svg width="100%" height="1"><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#E8F0F1" strokeWidth="1" strokeDasharray="2 2"/></svg>}</div>))}
        </div>}
        {redeemTab==="Hotels"&&<div>
          <div style={{display:"flex",padding:"8px 0",borderBottom:"1px solid #E8F0F1"}}>
            <div style={{flex:2,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase"}}>Program</div>
            <div style={{flex:1,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase",textAlign:"center"}}>Rate</div>
            <div style={{flex:1,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase",textAlign:"right"}}>Your Value</div>
          </div>
          {[{airline:"Marriott Bonvoy",rate:"1:0.3",mult:0.3},{airline:"IHG Rewards",rate:"1:0.5",mult:0.5},{airline:"Taj InnerCircle",rate:"1:0.4",mult:0.4}].map((r,i)=>(<div key={i}><div style={{display:"flex",padding:"12px 0",alignItems:"center"}}><div style={{flex:2,fontSize:13,fontWeight:500,color:"#222941"}}>{r.airline}</div><div style={{flex:1,fontSize:13,fontWeight:500,color:"#364060",textAlign:"center"}}>{r.rate}</div><div style={{flex:1,fontSize:13,fontWeight:600,color:"#222941",textAlign:"right"}}>{"₹"}{f(Math.round((pointsWorth)*r.mult))}</div></div>{i<2&&<svg width="100%" height="1"><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#E8F0F1" strokeWidth="1" strokeDasharray="2 2"/></svg>}</div>))}
        </div>}
        {redeemTab==="Vouchers"&&<div>
          <div style={{display:"flex",padding:"8px 0",borderBottom:"1px solid #E8F0F1"}}>
            <div style={{flex:2,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase"}}>Brand</div>
            <div style={{flex:1,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase",textAlign:"center"}}>Rate</div>
            <div style={{flex:1,fontSize:10,fontWeight:700,color:"#808387",textTransform:"uppercase",textAlign:"right"}}>Your Value</div>
          </div>
          {[{airline:"Amazon",rate:"1:0.25",mult:0.25},{airline:"Flipkart",rate:"1:0.30",mult:0.3},{airline:"Tanishq",rate:"1:0.20",mult:0.2}].map((r,i)=>(<div key={i}><div style={{display:"flex",padding:"12px 0",alignItems:"center"}}><div style={{flex:2,fontSize:13,fontWeight:500,color:"#222941"}}>{r.airline}</div><div style={{flex:1,fontSize:13,fontWeight:500,color:"#364060",textAlign:"center"}}>{r.rate}</div><div style={{flex:1,fontSize:13,fontWeight:600,color:"#222941",textAlign:"right"}}>{"₹"}{f(Math.round((pointsWorth)*r.mult))}</div></div>{i<2&&<svg width="100%" height="1"><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#E8F0F1" strokeWidth="1" strokeDasharray="2 2"/></svg>}</div>))}
        </div>}
      </div>
    </>}

    {/* ══════════════════ BENEFIT EXPIRING ══════════════════ */}
    {isBenefit&&<>
      <div className="txn-stagger txn-s2" style={{borderRadius:12,border:"1px solid #E8F0F1",padding:20,margin:"20px 0",background:"linear-gradient(135deg, #F8FAFC, #EFF6FF)"}}>
        <div style={{fontSize:12,fontWeight:400,color:"#808387"}}>{actSheet.badge?`Expiring in ${actSheet.badge.replace("In ","").replace("Days","days").replace("days","days")}`:"Expiring in 6 days"}</div>
        <div className="legacy-serif" style={{fontSize:22,fontWeight:700,color:"#222941",margin:"8px 0 0"}}>{actSheet.desc||"1 chauffeur airport transfer"}</div>
      </div>

      <div className="txn-stagger txn-s3" style={{marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,color:"#364060",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14}}>Why Do You Have This Benefit?</div>
        <div style={{background:"#EFF6FF",border:"1px solid #DBEAFE",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
          <AlertTriangle size={18} strokeWidth={1.5} color="#1E40AF" style={{flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:13,fontWeight:500,color:"#1E40AF",lineHeight:1.6}}>{actSheet.explanation||"This benefit is part of your card's annual fee package. Use it before it resets on your card anniversary."}</div>
        </div>
      </div>

      <div className="txn-stagger txn-s4" style={{marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,color:"#364060",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:14}}>How To Use</div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {["Book at least 24 hrs before pickup","Domestic airports only - within city","Call the concierge number on your card"].map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:40,height:40,borderRadius:"50%",border:"1.5px solid #86EFAC",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14,fontWeight:600,color:"#22C55E"}}>{i+1}</span></div>
            <div style={{fontSize:13,fontWeight:500,color:"#222941",lineHeight:1.5}}>{step}</div>
          </div>))}
        </div>
      </div>
    </>}

    {/* ── CTA ── */}
    <div className={isPoints||isBenefit?"txn-stagger txn-s4":isCreditLimit?"txn-stagger txn-s5":"txn-stagger txn-s5"}>
      <button onClick={handleCta} style={{width:"100%",height:48,padding:0,background:"linear-gradient(90deg, #222941 0%, #101C43 100%)",color:"#E8E8E8",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FN,boxShadow:"0 4px 12px rgba(16,28,67,0.2)"}}>{ctaText}</button>
    </div>
  </div></div>);
}

export function GmailNudgeBanner({line,subline,onPress,style={}}){
  const {hasGmail,nudgePermanentlyDismissed,nudgeDismissals,setShowGmailNudgeSheet,showGmailNudgeSheet}=useAppContext();
  if(hasGmail||nudgePermanentlyDismissed||nudgeDismissals>=3)return null;
  return(<div onClick={onPress||(()=>setShowGmailNudgeSheet(true))} style={{display:"flex",alignItems:"center",gap:16,padding:"20px 20px",borderRadius:16,background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid "+C.blueBrd,cursor:"pointer",boxShadow:"0 2px 8px rgba(29,78,216,0.06)",margin:"8px 0",...style}}>
    <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#bfdbfe,#93c5fd)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Mail size={20} strokeWidth={1.5} color={C.blue}/></div>
    <div style={{flex:1}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.4}}>{line}</div>
      <div style={{fontSize:12,color:C.sub,marginTop:4,lineHeight:1.5}}>{subline}</div>
    </div>
    <ChevronRight size={20} strokeWidth={1.5} color={C.sub}/>
  </div>);
}

export function GmailNudgePopup(){
  const {showGmailNudge,setShowGmailNudge,retroEnrichFromGmail,dismissNudge,nudgeDismissals,setNudgePermanentlyDismissed,hasGmail}=useAppContext();
  useEffect(()=>{
    if(hasGmail&&showGmailNudge)setShowGmailNudge(false);
  },[hasGmail,showGmailNudge,setShowGmailNudge]);
  if(hasGmail)return null;
  if(!showGmailNudge)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:250,padding:"0 16px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setShowGmailNudge(false);}}>
    <div style={{background:C.white,borderRadius:24,padding:"36px 24px 32px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.12)",position:"relative"}}>
      <div onClick={()=>setShowGmailNudge(false)} style={{position:"absolute",right:16,top:16,width:32,height:32,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={16} strokeWidth={1.5} color={C.dim}/></div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:22}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"radial-gradient(circle,#60a5fa,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(29,78,216,0.3)",border:"4px solid rgba(255,255,255,0.35)"}}><Mail size={28} strokeWidth={1.5} color="#fff"/></div>
      </div>
      <div style={{textAlign:"center",fontSize:19,fontWeight:700,color:C.text,marginBottom:12}}>Connect Gmail for deeper insights</div>
      <div style={{textAlign:"center",fontSize:12,color:C.sub,lineHeight:1.5,marginBottom:22}}>Unlock the full Spend Analyser experience</div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
        {[{Ic:CreditCard,t:"Identify your exact card product"},{Ic:Gift,t:"See unclaimed benefits & milestones"},{Ic:FileText,t:"Track fee waivers & annual fee status"},{Ic:Sparkles,t:"Get personalised card advice"}].map((b,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:32,height:32,borderRadius:10,background:C.blueBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><b.Ic size={16} strokeWidth={1.5} color={C.blue}/></div>
          <div style={{fontSize:13,color:C.text,fontWeight:600}}>{b.t}</div>
        </div>))}
      </div>
      <div onClick={retroEnrichFromGmail} style={{padding:"16px",borderRadius:16,background:"#1a2233",color:"#fff",textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:14}}>📧 Connect Gmail</div>
      <div onClick={dismissNudge} style={{padding:"12px",textAlign:"center",fontSize:13,fontWeight:600,color:C.sub,cursor:"pointer"}}>Maybe later</div>
      {nudgeDismissals>=1&&<div onClick={()=>{setNudgePermanentlyDismissed(true);dismissNudge();}} style={{padding:"8px",textAlign:"center",fontSize:12,fontWeight:600,color:C.dim,cursor:"pointer"}}>Don't ask me again</div>}
    </div>
  </div>);
}

export function GmailNudgeSheet(){
  const {showGmailNudgeSheet,setShowGmailNudgeSheet,retroEnrichFromGmail,dismissNudge,nudgeDismissals,setNudgePermanentlyDismissed,hasGmail,nudgePermanentlyDismissed}=useAppContext();
  useEffect(()=>{
    if(hasGmail&&showGmailNudgeSheet)setShowGmailNudgeSheet(false);
  },[hasGmail,showGmailNudgeSheet,setShowGmailNudgeSheet]);
  if(hasGmail)return null;
  if(!showGmailNudgeSheet)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:250,padding:"0 16px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setShowGmailNudgeSheet(false);}}>
    <div style={{background:C.white,borderRadius:24,padding:"16px 22px 32px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.12)",position:"relative"}}>
      <div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 16px"}}/>
      <div onClick={()=>setShowGmailNudgeSheet(false)} style={{position:"absolute",right:16,top:16,width:32,height:32,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={16} strokeWidth={1.5} color={C.dim}/></div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"radial-gradient(circle,#60a5fa,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 32px rgba(29,78,216,0.25)"}}><Mail size={26} strokeWidth={1.5} color="#fff"/></div>
      </div>
      <div style={{textAlign:"center",fontSize:18,fontWeight:700,color:C.text,marginBottom:6}}>Connect Gmail for deeper insights</div>
      <div style={{textAlign:"center",fontSize:12,color:C.sub,lineHeight:1.5,marginBottom:22}}>Unlock the full experience</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
        {[{Ic:CreditCard,t:"Identify exact card"},{Ic:Gift,t:"Unclaimed benefits"},{Ic:FileText,t:"Fee waivers tracking"},{Ic:Sparkles,t:"Personalised advice"}].map((b,i)=>(<div key={i} style={{padding:"14px 12px",borderRadius:12,background:C.blueBg,border:`1px solid ${C.blueBrd}`,display:"flex",flexDirection:"column",alignItems:"center",gap:8,textAlign:"center"}}>
          <b.Ic size={22} strokeWidth={1.5} color={C.blue}/>
          <div style={{fontSize:11,fontWeight:600,color:C.text,lineHeight:1.3}}>{b.t}</div>
        </div>))}
      </div>
      <div onClick={retroEnrichFromGmail} style={{padding:"16px",borderRadius:16,background:"#1a2233",color:"#fff",textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12}}>📧 Connect Gmail</div>
      <div onClick={dismissNudge} style={{padding:"12px",textAlign:"center",fontSize:13,fontWeight:600,color:C.sub,cursor:"pointer"}}>Maybe later</div>
      {nudgeDismissals>=1&&<div onClick={()=>{setNudgePermanentlyDismissed(true);dismissNudge();}} style={{padding:"6px",textAlign:"center",fontSize:12,fontWeight:600,color:C.dim,cursor:"pointer"}}>Don't ask me again</div>}
    </div>
  </div>);
}

export function LockedSection({title,desc}){
  const {setShowGmailNudgeSheet}=useAppContext();
  return(<div style={{padding:"28px 20px",borderRadius:16,background:C.white,border:`1px dashed ${C.brd}`,textAlign:"center"}}>
    <div style={{width:52,height:52,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Lock size={22} strokeWidth={1.5} color={C.dim}/></div>
    <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>{title}</div>
    <div style={{fontSize:12,color:C.sub,lineHeight:1.5,marginBottom:16,maxWidth:280,margin:"0 auto 16px"}}>{desc}</div>
    <div onClick={()=>setShowGmailNudgeSheet(true)} style={{display:"inline-flex",padding:"10px 22px",borderRadius:10,background:"#1a2233",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",alignItems:"center",gap:6}}><Mail size={14} strokeWidth={1.5} color="#fff"/>Connect Gmail</div>
  </div>);
}

export function RetroOverlay(){
  const {relinkingGmail}=useAppContext();
  if(!relinkingGmail)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(10,15,30,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:400}}>
    <div className="orb-pulse" style={{width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,#60a5fa,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 80px rgba(37,99,235,0.5),0 0 160px rgba(37,99,235,0.25)",border:"4px solid rgba(255,255,255,0.3)",marginBottom:28}}><Mail size={44} strokeWidth={1.5} color="#fff"/></div>
    <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:6}}>Identifying your cards...</div>
    <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>Connecting to Gmail & resolving card details</div>
  </div>);
}

export function VoiceFlowOverlay(){
  const {showVoiceFlow,setShowVoiceFlow,setVoiceTranscript,setVoiceMatch,setIsListening,recognitionRef,voiceCardIndex,isListening,beginListening,voiceTranscript,voiceMatch,confirmVoiceMatch,setShowCardMappingUI,setMappingStep,setScreen}=useAppContext();
  if(!showVoiceFlow)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300,padding:"0 16px 16px"}} onClick={e=>{if(e.target===e.currentTarget){setShowVoiceFlow(false);setVoiceTranscript("");setVoiceMatch(null);setIsListening(false);if(recognitionRef.current){try{recognitionRef.current.stop();}catch{/* ignore */}}}}}>
    <div style={{background:C.white,borderRadius:24,padding:"16px 28px 44px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 20px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Identify your card</div>
        <div onClick={()=>{setShowVoiceFlow(false);setVoiceTranscript("");setVoiceMatch(null);setIsListening(false);}} style={{width:32,height:32,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={16} strokeWidth={1.5} color={C.dim}/></div>
      </div>
      {voiceCardIndex!==null&&<div style={{display:"flex",alignItems:"center",gap:12,padding:"18px 22px",borderRadius:16,background:C.bg,border:`1px solid ${C.brd}`,marginBottom:28}}>
        <div style={{width:44,height:28,borderRadius:6,background:SEMI_CARDS[voiceCardIndex].color,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:5,color:"rgba(255,255,255,0.5)",fontWeight:700}}>••••</span></div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{SEMI_CARDS[voiceCardIndex].bank}</div>
          <div style={{fontSize:10,color:C.dim}}>XXXX {SEMI_CARDS[voiceCardIndex].last4}</div>
        </div>
        <span style={{fontSize:10,fontWeight:700,color:C.orange,background:C.orangeBg,padding:"3px 8px",borderRadius:4}}>PARTIAL</span>
      </div>}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0 24px"}}>
        <div onClick={()=>{if(!isListening){setVoiceTranscript("");setVoiceMatch(null);beginListening();}}} className={isListening?"listen-pulse":""} style={{width:88,height:88,borderRadius:"50%",background:isListening?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:14,border:isListening?"none":`2px solid ${C.brd}`}}>
          <Mic size={36} strokeWidth={1.5} color={isListening?"#fff":C.dim}/>
        </div>
        <div style={{fontSize:13,fontWeight:600,color:isListening?C.blue:C.sub}}>{isListening?"Listening...":"Tap to speak"}</div>
      </div>
      {voiceTranscript&&<div style={{padding:"12px 14px",borderRadius:10,background:C.bg,border:`1px solid ${C.brd}`,marginBottom:22}}>
        <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>You said</div>
        <div style={{fontSize:13,color:C.text}}>{voiceTranscript}</div>
      </div>}
      {voiceMatch&&<div style={{padding:"18px 22px",borderRadius:12,background:C.greenBg,border:`1px solid ${C.greenBrd}`,marginBottom:22}}>
        <div style={{fontSize:10,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Did you mean?</div>
        <div style={{fontSize:15,fontWeight:700,color:C.text}}>{voiceMatch.bank.replace(" Bank","")} {voiceMatch.name}</div>
        <div style={{fontSize:11,color:C.sub,marginTop:2}}>{voiceMatch.benefit}</div>
      </div>}
      {voiceTranscript&&!voiceMatch&&!isListening&&<div style={{padding:"18px 22px",borderRadius:12,background:C.orangeBg,border:"1px solid #fed7aa",marginBottom:14,fontSize:12,color:C.orange,fontWeight:600}}>Couldn't find a match. Try again or use the search list.</div>}
      {voiceMatch&&<div style={{display:"flex",gap:16}}>
        <div onClick={()=>{setVoiceTranscript("");setVoiceMatch(null);beginListening();}} style={{flex:1,padding:"14px",borderRadius:12,background:C.white,border:`1.5px solid ${C.brd}`,textAlign:"center",fontSize:13,fontWeight:700,color:C.text,cursor:"pointer"}}>Try again</div>
        <div onClick={confirmVoiceMatch} style={{flex:1,padding:"14px",borderRadius:12,background:C.green,color:"#fff",textAlign:"center",fontSize:13,fontWeight:700,cursor:"pointer"}}>Yes, that's my card ✓</div>
      </div>}
      {voiceTranscript&&!voiceMatch&&!isListening&&<div onClick={()=>{setShowVoiceFlow(false);setVoiceTranscript("");setVoiceMatch(null);setShowCardMappingUI(true);setMappingStep(voiceCardIndex||0);setScreen("building");}} style={{padding:"14px",borderRadius:12,background:"#1a2233",color:"#fff",textAlign:"center",fontSize:13,fontWeight:700,cursor:"pointer"}}>Search manually instead</div>}
    </div>
  </div>);
}

export function SkipConfirmSheet(){
  const {showSkipConfirm,setShowSkipConfirm,setShowCardMappingUI,setShowResolutionSummary,setScreen,retroEnrichFromGmail}=useAppContext();
  if(!showSkipConfirm)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:260,padding:"0 16px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setShowSkipConfirm(false);}}>
    <div style={{background:C.white,borderRadius:24,padding:"32px 22px 32px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.12)",position:"relative"}}>
      <div onClick={()=>setShowSkipConfirm(false)} style={{position:"absolute",right:16,top:16,width:32,height:32,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={16} strokeWidth={1.5} color={C.dim}/></div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:C.orangeBg,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #fed7aa"}}><AlertTriangle size={28} strokeWidth={1.5} color={C.orange}/></div>
      </div>
      <div style={{textAlign:"center",fontSize:18,fontWeight:700,color:C.text,marginBottom:8,lineHeight:1.4}}>Your spends won't be evaluated accurately</div>
      <div style={{textAlign:"center",fontSize:13,color:C.sub,lineHeight:1.6,marginBottom:28}}>Without knowing your cards, we can't tell you how much you're saving or missing on each transaction.</div>
      <div onClick={()=>{setShowSkipConfirm(false);setShowCardMappingUI(false);retroEnrichFromGmail();}} style={{padding:"16px",borderRadius:16,background:"#1a2233",color:"#fff",textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:14}}>📧 Connect Gmail instead</div>
      <div onClick={()=>{setShowSkipConfirm(false);setShowCardMappingUI(false);setShowResolutionSummary(false);setScreen("home");}} style={{padding:"12px",textAlign:"center",fontSize:13,fontWeight:600,color:C.sub,cursor:"pointer"}}>Skip and let me in</div>
    </div>
  </div>);
}

export function CapBS(){
  const {capSheet,setCapSheet}=useAppContext();
  if(!capSheet)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,padding:"0 16px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setCapSheet(null);}}><div style={{background:C.white,borderRadius:24,padding:"16px 28px 44px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 20px"}}/><div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:12}}>Recommended alternative</div><div style={{fontSize:13,color:C.sub,marginBottom:20,lineHeight:1.5}}>Since your cap has been reached, switch to:</div><div style={{padding:18,borderRadius:16,background:C.greenBg,border:`1px solid ${C.greenBrd}`,marginBottom:20}}><div style={{fontSize:17,fontWeight:700,color:C.text}}>{capSheet.altCard}</div><div style={{fontSize:13,color:C.sub,marginTop:4}}>{capSheet.altRate}% reward rate</div></div><button onClick={()=>setCapSheet(null)} style={{width:"100%",padding:14,background:C.blue,color:"#fff",border:"none",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FN}}>Got it</button></div></div>);
}

const CAT_COLORS={"Shopping":"#E7DCFF","Groceries":"#FFE8DC","Food Ordering":"#FFDFDC","Travel":"#D9FFF9","Insurance":"#D6FFE8","Fuel":"#FFE0D0","Entertainment":"#DCE7FF","Bills":"#FFF3D6","Cab Rides":"#E0F0FF","Health":"#FFD6E8","Dining":"#FFE8DC","Recharge":"#E0EEFF"};
const CAT_IMG={"Shopping":"/categories/shopping.webp","Groceries":"/categories/groceries.webp","Food Ordering":"/categories/food.webp","Travel":"/categories/travel.webp","Bills":"/categories/bills.webp","Fuel":"/categories/fuel.webp","Dining":"/categories/dining.webp","Entertainment":"/categories/entertainment.webp","Cab Rides":"/categories/cab.webp","Insurance":"/categories/groceries.webp","Health":"/categories/groceries.webp","Recharge":"/categories/bills.webp"};

export function CatBS(){
  const {catSheet,setCatSheet,catStep,setCatStep,selCat,setSelCat,setRemovedTxns,setToast,setTxnCatOverride}=useAppContext();
  if(!catSheet)return null;
  const applyOverride=(idx,patch)=>{if(idx>=0&&typeof setTxnCatOverride==="function")setTxnCatOverride(idx,patch);};
  const close=()=>{setCatSheet(null);setCatStep(1);setSelCat(null);};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
    <div style={{background:"linear-gradient(360deg, #FFFFFF 87.42%, #FFFFFF 100%)",borderRadius:"24px 24px 0 0",padding:"16px 16px 44px",maxWidth:400,width:"100%",maxHeight:"85vh",boxShadow:"0 20px 60px rgba(0,0,0,0.12)",overflowY:"auto"}}>
      <div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 20px"}}/>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"0 0 0 0"}}>
        <div style={{width:38,height:39,borderRadius:4,border:"1px solid #EDEDED",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#9699A0" strokeWidth="1.2"/><path d="M6.5 6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .66-.42 1-.84 1.26-.24.12-.36.24-.42.36-.06.12-.09.27-.09.48" stroke="#9699A0" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="12" r="0.5" fill="#9699A0"/></svg>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:"#36405E",lineHeight:"17px"}}>Unaccounted Transaction</div>
          <div style={{fontSize:11,fontWeight:500,color:"#808387",lineHeight:"140%",marginTop:6}}>{catSheet.date||"17 Apr"} | {catSheet.via||"UPI"} | ₹{f(catSheet.amt)}</div>
        </div>
      </div>
      <svg width="100%" height="1" style={{display:"block",marginBottom:16}}><line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="rgba(5,34,73,0.15)" strokeWidth="1" strokeDasharray="2 2"/></svg>
      {catSheet.sms&&<div style={{marginBottom:16,position:"relative"}}>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",top:-7,left:14,background:"#fff",padding:"0 4px",fontSize:10,fontWeight:600,color:"#364060",lineHeight:"150%"}}>Original SMS</div>
          <div style={{padding:"18px 15px 12px",borderRadius:6,background:"rgba(237,237,237,0.2)",border:"1px solid rgba(0,0,0,0.05)"}}><div style={{fontSize:12,fontWeight:400,color:"#364060",lineHeight:"154%"}}>{catSheet.sms}</div></div>
        </div>
      </div>}
      {catStep===0?(<>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>Why is this not a spend?</div>
        <div style={{fontSize:12,color:C.sub,marginBottom:16,lineHeight:1.5}}>This will remove it from your transaction history and recalculate your savings.</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{NOT_SPEND_REASONS.map(reason=>(<div key={reason} onClick={()=>{const idx=ALL_TXNS.indexOf(catSheet);if(idx>=0)setRemovedTxns(prev=>{const n=new Set(prev);n.add(idx);return n;});close();setToast("🗑 Removed — "+reason);}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,background:"#fff",border:`1.5px solid ${C.brd}`,cursor:"pointer"}}><span style={{fontSize:16}}>{{"Loan / EMI":"🏦","Refund / Reversal":"↩️","OTP / Auth charge":"🔐","Duplicate SMS":"📋","Other (not a spend)":"🚫"}[reason]}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{reason}</div></div><ChevronRight size={16} strokeWidth={1.5} color={C.dim}/></div>))}</div>
        <div onClick={()=>setCatStep(1)} style={{padding:"14px",textAlign:"center",fontSize:13,fontWeight:600,color:C.blue,cursor:"pointer",marginTop:8}}>← Back to categories</div>
      </>):catStep===1?(<>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <span style={{fontSize:12,fontWeight:600,color:"#5C5C5C",flexShrink:0}}>Select a category</span>
          <div style={{flex:1,height:0,borderBottom:"0.62px solid",borderImage:"linear-gradient(90deg,#848CA0,rgba(48,51,58,0)) 1",opacity:0.4}}/>
        </div>
        <input type="text" placeholder="Search Category name" style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"1px solid #D3E4FA",background:"#fff",fontSize:14,fontWeight:400,color:C.text,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:"inherit",lineHeight:"145%",letterSpacing:"0.02em"}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"18px 12px"}}>
          {CAT_OPTIONS.map(cat=>(<div key={cat} onClick={()=>{setSelCat(cat);setCatStep(2);}} style={{width:101,borderRadius:16,border:"1.31px solid #E2E8EF",background:"#FCFCFC",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",padding:4,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:93,height:69,borderRadius:14,background:CAT_COLORS[cat]||"#E8E8E8",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
              {CAT_IMG[cat]?<img src={CAT_IMG[cat]} alt={cat} style={{width:55,height:65,objectFit:"contain"}}/>:<span style={{fontSize:28}}>📦</span>}
            </div>
            <div style={{fontSize:12,fontWeight:500,color:"#001C3D",textAlign:"center",lineHeight:"18px",letterSpacing:"0.02em"}}>{cat}</div>
          </div>))}
        </div>
        <div onClick={()=>setCatStep(0)} style={{marginTop:14,padding:"14px 16px",borderRadius:12,background:"#fef2f2",border:"1.5px solid #fecaca",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:16}}>🚫</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#dc2626"}}>Not a spend</div><div style={{fontSize:11,color:"#b91c1c",marginTop:2}}>Loan, refund, OTP, or duplicate</div></div><ChevronRight size={16} strokeWidth={1.5} color="#dc2626"/></div>
      </>):(<>
        <div onClick={()=>setCatStep(1)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderRadius:8,border:"1px solid #D3E4FA",background:"#fff",cursor:"pointer",marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,color:"rgba(54,64,96,0.7)",letterSpacing:"-0.01em",lineHeight:"136%"}}><span style={{color:"rgba(54,64,96,0.7)"}}>Category : </span><span style={{fontWeight:600,color:"#364060"}}>{selCat}</span></div>
          <ChevronDown size={14} color="#364060" strokeWidth={1.5}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <span style={{fontSize:12,fontWeight:600,color:"#5C5C5C",flexShrink:0}}>Select Brand</span>
          <div style={{flex:1,height:0,borderBottom:"0.62px solid",borderImage:"linear-gradient(90deg,#848CA0,rgba(48,51,58,0)) 1",opacity:0.4}}/>
        </div>
        <input type="text" placeholder="Search Brand name" style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"1px solid #D3E4FA",background:"#fff",fontSize:14,fontWeight:400,color:C.text,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:"inherit",lineHeight:"145%",letterSpacing:"0.02em"}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"18px 12px"}}>
          {(BRAND_MAP[selCat]||["Other"]).map(b=>{const brandImg={"Flipkart":"/brands/flipkart.webp","Amazon":"/brands/amazon.webp","Myntra":"/brands/myntra.webp","Swiggy":"/brands/swiggy.webp","Zomato":"/brands/zomato.webp","BigBasket":"/brands/bb.webp","Adidas":"/brands/adiddas.webp","MuscleBlaze":"/brands/muscle-blaze.webp"}[b];return(<div key={b} onClick={()=>{const idx=ALL_TXNS.indexOf(catSheet);applyOverride(idx,{brand:b,icon:"🏷️",unaccounted:false,manuallyTagged:true,tag:"Best card for this brand",tagColor:C.dkGreen,tagBg:"#EAF3DE",saved:Math.round(catSheet.amt*(SIM_CARD_RATE[SIM_BEST_FOR[b]]?.[b]||SIM_CARD_BASE_RATE[SIM_BEST_FOR[b]]||0)/100),missed:null,cat:selCat});close();setToast("✓ Tagged as "+b);}} style={{width:101,borderRadius:16,border:"1.31px solid #E2E8EF",background:"#FCFCFC",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",padding:4,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:93,height:69,borderRadius:14,background:"#F5F5F5",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                {brandImg?<img src={brandImg} alt={b} style={{width:55,height:55,objectFit:"contain"}}/>:<div style={{fontSize:24,fontWeight:700,color:"rgba(54,64,96,0.7)"}}>{b.charAt(0)}</div>}
              </div>
              <div style={{fontSize:12,fontWeight:500,color:"#001C3D",textAlign:"center",lineHeight:"18px",letterSpacing:"0.02em"}}>{b}</div>
            </div>);})}
          <div onClick={()=>{const idx=ALL_TXNS.indexOf(catSheet);applyOverride(idx,{brand:selCat,icon:"🏷️",unaccounted:false,manuallyTagged:true,saved:Math.round(catSheet.amt*(SIM_CARD_BASE_RATE[SIM_BEST_FOR[selCat]]||0)/100),missed:null,tag:"Best card for this brand",tagColor:C.dkGreen,tagBg:"#EAF3DE",cat:selCat});close();setToast("✓ Tagged as Other in "+selCat);}} style={{width:101,borderRadius:16,border:"1.31px solid #E2E8EF",background:"#FCFCFC",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",padding:4,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:93,height:69,borderRadius:14,background:"#F0F2F6",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:20,color:"rgba(54,64,96,0.5)"}}>+</div></div>
            <div style={{fontSize:12,fontWeight:500,color:"#001C3D",textAlign:"center",lineHeight:"18px"}}>Other</div>
          </div>
        </div>
      </>)}
    </div>
  </div>);
}

export function FilterSheet(){
  const {filterSheet,setFilterSheet,filterTab,setFilterTab,setFilters,setSortBy,sortBy,filters,toggleFilter,multiToggle,isState1,isState2,cardMapping}=useAppContext();
  if(!filterSheet)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,padding:"0 16px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setFilterSheet(false);}}>
    <div style={{background:C.white,borderRadius:24,maxWidth:400,width:"100%",height:"70vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}>
      <div style={{padding:"20px 22px 0",borderBottom:"1px solid "+C.brd}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:18,fontWeight:700,color:C.text}}>Filters</span>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span onClick={()=>{setFilters([]);setSortBy("Recent");}} style={{fontSize:12,fontWeight:600,color:C.blue,cursor:"pointer"}}>Reset</span>
            <div onClick={()=>setFilterSheet(false)} style={{width:30,height:30,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} strokeWidth={1.5} color={C.dim}/></div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:120,background:C.bg,borderRight:"1px solid "+C.brd,overflowY:"auto",flexShrink:0}}>
          {["Sort","Card Used","Categories","Brands"].map(tab=>(<div key={tab} onClick={()=>setFilterTab(tab)} style={{padding:"16px 14px",cursor:"pointer",fontSize:13,fontWeight:filterTab===tab?700:500,color:filterTab===tab?C.blue:C.sub,background:filterTab===tab?C.white:"transparent",borderLeft:filterTab===tab?"3px solid "+C.blue:"3px solid transparent"}}>{tab}</div>))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
          {filterTab==="Sort"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
            {(isState1?["Recent","Most Spent","Least Spent"]:["Recent","Most Saved","Least Saved","Most Spent","Least Spent"]).map(o=>(<div key={o} onClick={()=>setSortBy(o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,background:sortBy===o?C.blueBg:C.white,border:"1px solid "+(sortBy===o?C.blueBrd:C.brd),cursor:"pointer"}}><span style={{fontSize:13,fontWeight:sortBy===o?700:500,color:sortBy===o?C.blue:C.text}}>{o}</span>{sortBy===o&&<Check size={16} strokeWidth={2} color={C.blue}/>}</div>))}
          </div>}
          {filterTab==="Card Used"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
            {(isState1?[{label:"HSBC ••7891",key:"Travel One",color:"#0c2340"},{label:"Axis ••4521",key:"Flipkart",color:"#5b2c8e"},{label:"HSBC ••3364",key:"Live+",color:"#006d5b"},{label:"UPI",key:"UPI",color:"#6d28d9"}]:isState2?[{label:(cardMapping[0]&&cardMapping[0]!=="Other"?"HSBC "+cardMapping[0]:"HSBC ••7891"),key:"Travel One",color:"#0c2340"},{label:(cardMapping[1]&&cardMapping[1]!=="Other"?"Axis "+cardMapping[1]:"Axis ••4521"),key:"Flipkart",color:"#5b2c8e"},{label:(cardMapping[2]&&cardMapping[2]!=="Other"?"HSBC "+cardMapping[2]:"HSBC ••3364"),key:"Live+",color:"#006d5b"},{label:"UPI",key:"UPI",color:"#6d28d9"}]:[{label:"Axis Flipkart Card",key:"Flipkart",color:"#5b2c8e"},{label:"HSBC Travel One",key:"Travel One",color:"#0c2340"},{label:"HSBC Live+",key:"Live+",color:"#006d5b"},{label:"UPI",key:"UPI",color:"#6d28d9"}]).map(card=>{const on=filters.includes(card.key);return(<div key={card.key} onClick={()=>toggleFilter(card.key)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,background:on?C.blueBg:C.white,border:"1px solid "+(on?C.blueBrd:C.brd),cursor:"pointer"}}><div style={{width:32,height:20,borderRadius:4,background:card.color,flexShrink:0}}/><span style={{flex:1,fontSize:13,fontWeight:on?700:500,color:on?C.blue:C.text}}>{card.label}</span>{on&&<Check size={16} strokeWidth={2} color={C.blue}/>}</div>);})}
          </div>}
          {filterTab==="Categories"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
            {["Shopping","Groceries","Bills","Travel","Insurance","Fuel","Dining","Entertainment","Cab Rides","Health","Recharge"].map(cat=>{const on=filters.includes(cat);return(<div key={cat} onClick={()=>multiToggle(cat)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,background:on?C.blueBg:C.white,border:"1px solid "+(on?C.blueBrd:C.brd),cursor:"pointer"}}><span style={{fontSize:13,fontWeight:on?700:500,color:on?C.blue:C.text}}>{cat}</span>{on&&<Check size={16} strokeWidth={2} color={C.blue}/>}</div>);})}
          </div>}
          {filterTab==="Brands"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
            {["Flipkart","Amazon","Swiggy","Zomato","Myntra","MakeMyTrip","Uber","Ola","BigBasket","BookMyShow","Nykaa","Shell"].map(br=>{const on=filters.includes(br);return(<div key={br} onClick={()=>multiToggle(br)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,background:on?C.blueBg:C.white,border:"1px solid "+(on?C.blueBrd:C.brd),cursor:"pointer"}}><span style={{fontSize:13,fontWeight:on?700:500,color:on?C.blue:C.text}}>{br}</span>{on&&<Check size={16} strokeWidth={2} color={C.blue}/>}</div>);})}
          </div>}
        </div>
      </div>
      <div style={{padding:"16px 22px",borderTop:"1px solid "+C.brd}}>
        <button onClick={()=>setFilterSheet(false)} style={{width:"100%",padding:16,background:"#111827",color:"#fff",border:"none",borderRadius:16,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FN}}>Apply Filters</button>
      </div>
    </div>
  </div>);
}

/** Mounts every overlay/sheet at once. Place once near the App root. */
export function BottomSheets(){
  return(<>
    <Toast/>
    <InfoBS/>
    <TxnSheet/>
    <ActSheet/>
    <GmailNudgePopup/>
    <GmailNudgeSheet/>
    <RetroOverlay/>
    <VoiceFlowOverlay/>
    <SkipConfirmSheet/>
    <CapBS/>
    <CatBS/>
    <FilterSheet/>
  </>);
}
