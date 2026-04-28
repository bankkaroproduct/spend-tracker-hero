// LEGACY SCREEN: kept for fallback/reference only.
// Active implementation now routes through `src/features/new/TransactionsScreen.tsx`.
// @ts-nocheck
import { C, FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { Circles } from "@/components/shared/Circles";
import { TxnRow } from "@/components/shared/TxnRow";
import { SortFilter, doSort, doFilter } from "@/components/shared/SortFilter";
import { NavBar } from "@/components/shared/NavBar";
import { ALL_TXNS } from "@/data/transactions";
import { useAppContext } from "@/store/AppContext";
import { Toast, InfoBS, TxnSheet, ActSheet, GmailNudgePopup, GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CatBS, FilterSheet } from "@/components/sheets/BottomSheets";

export const TransactionsScreen = () => {
  const { removedTxns, setRemovedTxns, sortBy, setSortBy, filters, toggleFilter, setFilters, setFilterSheet, setCatSheet, setTxnSheet, setScreen, txnCatOverrides } = useAppContext();
  const overrides = txnCatOverrides || {};
  const merged = ALL_TXNS.map((t,i)=> overrides[i] ? { ...t, ...overrides[i] } : t);
  const activeTxns = merged.filter((_,i)=>!removedTxns.has(i));
  const txns = doFilter(doSort(activeTxns,sortBy),filters);
  return (<div style={{fontFamily:FN,maxWidth:400,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",position:"relative"}}><div data-scroll="1" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",background:C.bg,paddingBottom:100}}><div className="slide-in"><FL/><div style={{background:"linear-gradient(180deg,#1a3fc7,#3b82f6)",padding:"56px 24px 28px",color:"#fff"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><div onClick={()=>{setScreen("home");setFilters([]);}} style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>←</div><span style={{fontSize:16,fontWeight:700}}>All Transactions</span></div></div><div style={{padding:"0 24px"}}><Circles/>{removedTxns.size>0&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"#fef2f2",border:"1px solid #fecaca",marginBottom:12}}><span style={{fontSize:11,fontWeight:600,color:"#dc2626"}}>{removedTxns.size} transaction{removedTxns.size>1?"s":""} removed</span><span onClick={()=>setRemovedTxns(new Set())} style={{fontSize:11,fontWeight:700,color:"#dc2626",cursor:"pointer",textDecoration:"underline"}}>Undo all</span></div>}<div style={{fontSize:10,fontWeight:700,color:C.sub,letterSpacing:2,textTransform:"uppercase",textAlign:"center",margin:"16px 0 12px"}}>Transactions ({txns.length})</div><SortFilter sortBy={sortBy} setSortBy={setSortBy} filters={filters} toggleFilter={toggleFilter} onFilterOpen={()=>setFilterSheet(true)}/><div>{txns.map((t,i)=>(<TxnRow key={i} t={t} onTap={()=>{if(t.unaccounted)setCatSheet(t);else setTxnSheet(t);}}/>))}</div></div><InfoBS/></div></div><div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",padding:"12px 0 5vw",pointerEvents:"none"}}><div style={{pointerEvents:"auto"}}><NavBar/></div></div><TxnSheet/><ActSheet/><CatBS/><FilterSheet/><GmailNudgePopup/><GmailNudgeSheet/><RetroOverlay/><VoiceFlowOverlay/><Toast/></div>);
};
