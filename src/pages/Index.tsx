
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { WebHaptics } from "web-haptics";
import { Info, User } from "lucide-react";

/* Phase 4 refactor: Index.tsx is now a pure orchestrator (state + router). */
import { C, FN } from "@/lib/theme";
import "@/features/legacy/legacy.css";
import { CARDS, SEMI_CARDS, ACTIONS, ALL_TXNS } from "@/data/simulation/legacy";
import { CARD_CATALOGUE } from "@/data/bestCards";
import { doSort, doFilter } from "@/components/shared/SortFilter";
import { NavBar as NavBarShared } from "@/components/shared/NavBar";
import { AppContext, setAppContext } from "@/store/AppContext";
import { ActionsScreen } from "@/features/actions/ActionsScreen";
import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { BestCardsScreen } from "@/features/bestcards/BestCardsScreen";
import { PortfolioCreateScreen } from "@/features/portfolio/PortfolioCreateScreen";
import { PortfolioResultsScreen } from "@/features/portfolio/PortfolioResultsScreen";
import { RedeemScreen } from "@/features/redeem/RedeemScreen";
import { CalcScreen } from "@/features/calc/CalcScreen";
import { CardDetailScreen } from "@/features/cardDetail/CardDetailScreen";
import { GmailMockFlow } from "@/features/gmail/GmailMockFlow";
import { BuildingScreen } from "@/features/building/BuildingScreen";
import { SpendAnalysisScreen } from "@/features/onboard/SpendAnalysisScreen";
import { CardIdentificationScreen } from "@/features/onboard/CardIdentificationScreen";
import { ManualEntryScreen } from "@/features/onboard/ManualEntryScreen";
import { GmailExtraInfoScreen } from "@/features/onboard/GmailExtraInfoScreen";
import { TxnEvalScreen } from "@/features/onboard/TxnEvalScreen";
import { ToolsIntroScreen } from "@/features/onboard/ToolsIntroScreen";
import { FinalLoadingScreen } from "@/features/onboard/FinalLoadingScreen";
import { OnboardScreen } from "@/features/onboard/OnboardScreen";
import { HomeScreen } from "@/features/new/HomeScreen";
import { TransactionsScreen } from "@/features/new/TransactionsScreen";
import { OptimizeScreen } from "@/features/new/OptimizeScreen";

export default function App(){
  const safeRead=(key,fallback)=>{
    try{
      if(typeof window==="undefined")return fallback;
      const raw=window.localStorage.getItem(key);
      if(raw===null)return fallback;
      try{
        return JSON.parse(raw);
      }catch(e){
        // If older builds stored plain strings (e.g. NORMAL) without JSON encoding,
        // fall back to the raw value instead of resetting state.
        if(raw==="true")return true;
        if(raw==="false")return false;
        return raw;
      }
    }catch(e){return fallback;}
  };
  const safeWrite=(key,value)=>{
    try{
      if(typeof window==="undefined")return;
      window.localStorage.setItem(key,JSON.stringify(value));
    }catch(e){return;}
  };
  const hapticsRef=useRef(null);
  useEffect(()=>{try{hapticsRef.current=new WebHaptics();}catch(e){}},[]);
  const haptic=(pattern)=>{try{if(hapticsRef.current){if(pattern)hapticsRef.current.trigger(pattern);else hapticsRef.current.trigger();}}catch(e){}};
  /* User flag: NORMAL | PARTIAL | DEBIT | NTC | ENTRY_ELIGIBLE */
  const [userFlag,setUserFlag]=useState(()=>safeRead("sa:userFlag","PARTIAL"));
  const [screen,setScreenState]=useState("onboard");
  const setScreen=(next)=>{
    const nextValue=typeof next==="function"?"[function]":next;
    const currentPath=typeof window!=="undefined"?window.location.pathname:"";
    const stackPreview=typeof Error!=="undefined"?new Error().stack?.split("\n").slice(1,4).join(" | "):"";
    setScreenState(next);
  };
  const [bestCardDetail,setBestCardDetail]=useState(null);
  const [portfolioNew,setPortfolioNew]=useState<string[]>([]);
  const [portfolioEntryCard,setPortfolioEntryCard]=useState<string|null>(null);
  const [bcFilter,setBcFilter]=useState([]);
  const [bcSearch,setBcSearch]=useState("");
  const [bcSearchOpen,setBcSearchOpen]=useState(false);
  const [bcDetTab,setBcDetTab]=useState(100);
  const [bcViewMode,setBcViewMode]=useState("On Brands");
  const [bcSection,setBcSection]=useState("howtouse");
  const [bcFavs,setBcFavs]=useState([]);
  const [bcSort,setBcSort]=useState("Best Match");
  const [bcListView,setBcListView]=useState("list");
  const [bcShowSort,setBcShowSort]=useState(false);
  const [bcEligSheet,setBcEligSheet]=useState(null);
  const [bcFromScreen,setBcFromScreen]=useState("home");
  const [onStep,setOnStep]=useState(0); /* 0=value-prop-carousel,1=phone,2=otp,3=sms,4=loading,5=done */
  const [vpSlide,setVpSlide]=useState(0);
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [otpTimer,setOtpTimer]=useState(30);
  const [smsStatus,setSmsStatus]=useState("idle");
  const [welcomeTyped,setWelcomeTyped]=useState(""); /* idle,dialog,loading,granted */
  const otpRefs=useRef([]);
  const [ci,setCi]=useState(0);
  const [spendTab,setSpendTab]=useState("Categories");
  const [showAllBrands,setShowAllBrands]=useState(false);
  const [sortBy,setSortBy]=useState("Recent");
  const [filters,setFilters]=useState([]);
  const [actFilter,setActFilter]=useState("All");
  const [capSheet,setCapSheet]=useState(null);
  const [catSheet,setCatSheet]=useState(null);
  const [toast,setToast]=useState(null);
  const [filterSheet,setFilterSheet]=useState(false);
  const [filterTab,setFilterTab]=useState("Sort");
  const [catStep,setCatStep]=useState(1);
  const [selCat,setSelCat]=useState(null);
  const [removedTxns,setRemovedTxns]=useState(new Set());
  const NOT_SPEND_REASONS=["Loan / EMI","Refund / Reversal","OTP / Auth charge","Duplicate SMS","Other (not a spend)"];
  const [optTab,setOptTab]=useState("Brands");
  const [optSheet,setOptSheet]=useState(null);
  const [optSheetFrom,setOptSheetFrom]=useState("optimize");
  const [optExpanded,setOptExpanded]=useState(0);
  const [detailTab,setDetailTab]=useState(0);
  const [usageMode,setUsageMode]=useState("Savings");
  const [usageCat,setUsageCat]=useState("Categories");
  const [timePeriod,setTimePeriod]=useState("Last 365 Days");
  const [timePeriodOpen,setTimePeriodOpen]=useState(false);
  const [txnExp,setTxnExp]=useState(false);
  const [tabSticky,setTabSticky]=useState(false);
  const dRef=useRef(null);const dRefs=useRef({});const sentRef=useRef(null);
  const [selBrand,setSelBrand]=useState(null);
  const [calcAmt,setCalcAmt]=useState("");const [calcPopup,setCalcPopup]=useState(false);
  const [calcResult,setCalcResult]=useState(null);const [searchQ,setSearchQ]=useState("");
  const [calcTab,setCalcTab]=useState("Brands");
  const [chartPage,setChartPage]=useState(0);
  const [calcFilter,setCalcFilter]=useState("All");
  const [howExpanded,setHowExpanded]=useState(null);
  const [redeemCard,setRedeemCard]=useState(null);
  const [redeemPts,setRedeemPts]=useState("");
  const [redeemPref,setRedeemPref]=useState(null);
  const [redeemResult,setRedeemResult]=useState(null);
  const [redeemTab,setRedeemTab]=useState("All");
  const [infoSheet,setInfoSheet]=useState(null);
  const [txnSheet,setTxnSheet]=useState(null);
  const [actSheet,setActSheet]=useState(null);
  const [txnPage,setTxnPage]=useState(1);
  const [buildPhase,setBuildPhase]=useState(0);
  const [buildSub,setBuildSub]=useState(0);
  const [txnCatOverrides,setTxnCatOverridesState]=useState({});
  const setTxnCatOverride=(idx,patch)=>setTxnCatOverridesState(p=>({...p,[idx]:{...(p[idx]||{}),...patch}}));
  const [buildCardReveal,setBuildCardReveal]=useState(-1);
  const [carouselIdx,setCarouselIdx]=useState(0);
  const touchStartX=useRef(0);
  const [gmailSheet,setGmailSheet]=useState(false);
  const [hasGmail,setHasGmail]=useState(()=>safeRead("sa:hasGmail",false));
  const [cardMapping,setCardMapping]=useState(()=>safeRead("sa:cardMapping",{}));
  const [mappingCompleted,setMappingCompleted]=useState(()=>safeRead("sa:mappingCompleted",false));
  const [showCardMappingUI,setShowCardMappingUI]=useState(false);
  const [mappingStep,setMappingStep]=useState(0);
  const [mappingSearchQ,setMappingSearchQ]=useState("");
  const [showResolutionSummary,setShowResolutionSummary]=useState(false);
  const [showSkipConfirm,setShowSkipConfirm]=useState(false);
  const [relinkingGmail,setRelinkingGmail]=useState(false);
  const [nudgeDismissals,setNudgeDismissals]=useState(0);
  const [nudgePermanentlyDismissed,setNudgePermanentlyDismissed]=useState(false);
  const [showGmailNudge,setShowGmailNudge]=useState(false);
  const [showGmailNudgeSheet,setShowGmailNudgeSheet]=useState(false);
  const [nudgeShownThisSession,setNudgeShownThisSession]=useState({home:false,detail:false,redeem:false,optimize:false});
  const [showVoiceFlow,setShowVoiceFlow]=useState(false);
  const [voiceCardIndex,setVoiceCardIndex]=useState(null);
  const [isListening,setIsListening]=useState(false);
  const [voiceTranscript,setVoiceTranscript]=useState("");
  const [voiceMatch,setVoiceMatch]=useState(null);
  const recognitionRef=useRef(null);
  const buildRef=useRef(null);
  const [gmailStep,setGmailStep]=useState(0);
  const [toolStep,setToolStep]=useState(0);
  const [reminderStep,setReminderStep]=useState(0);
  const [finalLoad,setFinalLoad]=useState(0);
  const [savePhase,setSavePhase]=useState(false);
  const [gmailReturnTo,setGmailReturnTo]=useState("building");
  const [gmailOtp,setGmailOtp]=useState(["","","",""]);
  const [gmailFirstName,setGmailFirstName]=useState("Aarav");
  const [gmailLastName,setGmailLastName]=useState("Sharma");
  const [gmailDob,setGmailDob]=useState("");
  const [hsbcDigits1,setHsbcDigits1]=useState(["","","","","8","4"]);
  const [hsbcDigits2,setHsbcDigits2]=useState(["","","","","2","1"]);
  useEffect(()=>{
    if(userFlag==="NORMAL"&&!hasGmail)setHasGmail(true);
  },[userFlag,hasGmail]);
  const completeGmailLink=()=>{
    setHasGmail(true);
    setUserFlag("NORMAL");
    setMappingCompleted(true);
    setCardMapping({0:"Travel One",1:"Flipkart",2:"Live+"});
    setGmailStep(0);
    setGmailOtp(["","","",""]);
    // Honor the return target set by `startGmailFlow(returnTo)`.
    // (Onboarding wants to go through txn-eval/tools-intro; other entry points may return to home/detail.)
    if(gmailReturnTo==="building") setScreen("txn-eval");
    else setScreen(gmailReturnTo);
  };
  const startGmailFlow=(returnTo)=>{
    setGmailReturnTo(returnTo);
    setGmailStep(0);
    setGmailOtp(["","","",""]);
    setScreen("gmail");
  };
  const linkedGmail=hasGmail||userFlag==="NORMAL";
  const isState1=!linkedGmail&&!mappingCompleted;
  const isState2=!linkedGmail&&mappingCompleted;
  const isState3=linkedGmail;

  const getCardDisplayName=(i)=>{
    if(hasGmail)return CARDS[i].name;
    if(cardMapping[i]&&cardMapping[i]!=="Other")return SEMI_CARDS[i].bank.replace(" Bank","")+" "+cardMapping[i];
    return SEMI_CARDS[i].bank.replace(" Bank","")+" ••"+SEMI_CARDS[i].last4;
  };
  const isCardMapped=(i)=>hasGmail||(cardMapping[i]&&cardMapping[i]!=="Other");
  const shouldShowNudge=(screenKey)=>{
    if(hasGmail)return false;
    if(nudgePermanentlyDismissed)return false;
    if(nudgeDismissals>=3)return false;
    if(nudgeShownThisSession[screenKey])return false;
    return true;
  };
  const markNudgeShown=(k)=>setNudgeShownThisSession(p=>({...p,[k]:true}));
  const dismissNudge=()=>{
    setNudgeDismissals(p=>p+1);
    setShowGmailNudge(false);
    setShowGmailNudgeSheet(false);
  };
  const getFilteredActions=(actions)=>{
    if(hasGmail)return actions;
    return actions.filter(a=>a.type==="points"||a.type==="milestone"||(a.type==="cap"&&a.creditLimit===true));
  };
  const retroEnrichFromGmail=()=>{
    setShowGmailNudge(false);
    setShowGmailNudgeSheet(false);
    startGmailFlow("home");
  };
  const beginListening=()=>{
    const w=window as any;
    const SR=typeof window!=="undefined"&&(w.SpeechRecognition||w.webkitSpeechRecognition);
    if(!SR){setVoiceTranscript("Voice not supported on this browser");return;}
    const r=new SR();
    r.lang="en-IN";
    r.onresult=(e)=>{
      const t=e.results[0][0].transcript;
      setVoiceTranscript(t);
      const allCards=Object.entries(CARD_CATALOGUE).flatMap(([bank,cards])=>cards.map(c=>({...c,bank})));
      const tl=t.toLowerCase();
      const match=allCards.find(c=>{
        const full=(c.bank.replace(" Bank","")+" "+c.name).toLowerCase();
        return full.includes(tl)||tl.includes(c.name.toLowerCase())||c.name.toLowerCase().split(" ").some(w=>w.length>3&&tl.includes(w));
      });
      setVoiceMatch(match||null);
      setIsListening(false);
    };
    r.onerror=()=>setIsListening(false);
    r.onend=()=>setIsListening(false);
    try{r.start();}catch(e){}
    recognitionRef.current=r;
    setIsListening(true);
  };
  const confirmVoiceMatch=()=>{
    if(voiceMatch===null||voiceCardIndex===null)return;
    setCardMapping(prev=>({...prev,[voiceCardIndex]:voiceMatch.name}));
    setShowVoiceFlow(false);
    setVoiceTranscript("");
    setVoiceMatch(null);
    if(screen==="detail")setMappingCompleted(true);
  };

  /* OTP countdown timer */
  useEffect(()=>{if(onStep!==2||otpTimer<=0)return;const t=setTimeout(()=>setOtpTimer(s=>s-1),1000);return()=>clearTimeout(t);},[onStep,otpTimer]);
  /* Welcome typing animation */
  useEffect(()=>{if(onStep!==3)return;const msg="Hello there!";let i=0;setWelcomeTyped("");const iv=setInterval(()=>{i++;setWelcomeTyped(msg.slice(0,i));if(i>=msg.length)clearInterval(iv);},60);return()=>clearInterval(iv);},[onStep]);
  /* Auto-navigate to spend-analysis (Phase A) 2s after SMS permission granted */
  useEffect(()=>{if(smsStatus!=="granted")return;const t=setTimeout(()=>{setScreen("analysis");},2000);return()=>clearTimeout(t);},[smsStatus]);

  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(t);}},[toast]);
  useEffect(()=>{if(screen!=="onboard"||onStep!==0)return;const t=setInterval(()=>setVpSlide(s=>(s+1)%4),4000);return()=>clearInterval(t);},[screen,onStep]);
  useEffect(()=>{if(!savePhase)return;setToolStep(0);setReminderStep(0);setFinalLoad(0);const t=[];t.push(setTimeout(()=>setToolStep(1),2000));t.push(setTimeout(()=>setToolStep(2),6000));t.push(setTimeout(()=>setToolStep(3),10000));t.push(setTimeout(()=>setReminderStep(1),13500));t.push(setTimeout(()=>setReminderStep(2),15500));t.push(setTimeout(()=>setReminderStep(3),16500));t.push(setTimeout(()=>setReminderStep(4),17500));t.push(setTimeout(()=>setFinalLoad(1),20000));t.push(setTimeout(()=>setFinalLoad(2),22500));t.push(setTimeout(()=>setFinalLoad(3),25000));t.push(setTimeout(()=>{setSavePhase(false);setScreen("home");},27500));return()=>t.forEach(clearTimeout);},[savePhase]);
  const prevScreenRef=useRef(screen);
  const scrollTimerRef=useRef(null);
  useEffect(()=>{if(prevScreenRef.current!==screen){if(scrollTimerRef.current)clearTimeout(scrollTimerRef.current);scrollTimerRef.current=setTimeout(()=>{document.querySelectorAll("[data-scroll]").forEach(el=>{el.scrollTop=0;});scrollTimerRef.current=null;},50);prevScreenRef.current=screen;}return()=>{if(scrollTimerRef.current){clearTimeout(scrollTimerRef.current);scrollTimerRef.current=null;}};},[screen]);
  useEffect(()=>{if(screen!=="detail"||!dRef.current)return;const el=dRef.current;const fn=()=>{if(sentRef.current)setTabSticky(sentRef.current.getBoundingClientRect().top<=el.getBoundingClientRect().top);};el.addEventListener("scroll",fn);return()=>el.removeEventListener("scroll",fn);},[screen]);
  useEffect(()=>{safeWrite("sa:hasGmail",hasGmail);},[hasGmail]);
  useEffect(()=>{safeWrite("sa:cardMapping",cardMapping);},[cardMapping]);
  useEffect(()=>{safeWrite("sa:mappingCompleted",mappingCompleted);},[mappingCompleted]);
  useEffect(()=>{safeWrite("sa:userFlag",userFlag);},[userFlag]);

  /* ═══ URL ⇄ state sync ═══ */
  const navigate=useNavigate();
  const location=useLocation();
  const routeSyncedRef=useRef(false);
  
  const screenToPath=(s,cardIdx)=>{
    if(s==="home")return "/home";
    if(s==="calc")return "/calculate";
    if(s==="redeem")return "/redeem";
    if(s==="optimize")return "/optimize";
    if(s==="actions")return "/actions";
    if(s==="transactions")return "/transactions";
    if(s==="profile")return "/profile";
    if(s==="bestcards")return "/cards";
    if(s==="portfolio-create")return "/portfolio/create";
    if(s==="portfolio-results")return "/portfolio/results";
    if(s==="detail")return `/cards/${cardIdx ?? 0}`;
    if(s==="gmail")return "/gmail";
    if(s==="building")return "/building";
    if(s==="analysis")return "/analysis";
    if(s==="card-id")return "/card-id";
    if(s==="manual-entry")return "/manual-entry";
    if(s==="gmail-extra")return "/gmail-extra";
    if(s==="txn-eval")return "/txn-eval";
    if(s==="tools-intro")return "/tools-intro";
    if(s==="final-loading")return "/final-loading";
    return "/onboard";
  };
  const pathToScreen=(p)=>{
    if(p==="/"||p==="/onboard")return {screen:"onboard"};
    if(p==="/building")return {screen:"building"};
    if(p==="/analysis")return {screen:"analysis"};
    if(p==="/card-id")return {screen:"card-id"};
    if(p==="/manual-entry")return {screen:"manual-entry"};
    if(p==="/gmail-extra")return {screen:"gmail-extra"};
    if(p==="/txn-eval")return {screen:"txn-eval"};
    if(p==="/tools-intro")return {screen:"tools-intro"};
    if(p==="/final-loading")return {screen:"final-loading"};
    if(p==="/home")return {screen:"home"};
    if(p==="/calculate")return {screen:"calc"};
    if(p==="/redeem")return {screen:"redeem"};
    if(p==="/optimize")return {screen:"optimize"};
    if(p==="/optimise")return {screen:"optimize"};
    if(p==="/actions")return {screen:"actions"};
    if(p==="/transactions")return {screen:"transactions"};
    if(p==="/profile")return {screen:"profile"};
    if(p==="/cards")return {screen:"bestcards"};
    if(p==="/portfolio/create")return {screen:"portfolio-create"};
    if(p==="/portfolio/results")return {screen:"portfolio-results"};
    if(p==="/gmail")return {screen:"gmail"};
    const m=matchPath("/cards/:id",p);
    if(m){const id=parseInt(m.params.id,10);return {screen:"detail",ci:isNaN(id)?0:id};}
    return null;
  };
  /* State → URL */
  useEffect(()=>{
    if(!routeSyncedRef.current)return;
    const target=screenToPath(screen,ci);
    if(location.pathname!==target){
      const replace=screen==="building"||screen==="home"&&prevScreenRef.current==="building";
      console.log("[debug State→URL]", "screen=", screen, "target=", target, "current path=", location.pathname);
      navigate(target,{replace});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[screen,ci]);
  /* URL → State (incl. initial deep-link + back/forward).
     No onboarding gate: the app's internal state machine (buildPhase, userFlag, etc.)
     governs what each screen renders. Gating here caused calculate/redeem to bounce
     back to /onboard during normal in-app navigation. */
  useEffect(()=>{
    const parsed=pathToScreen(location.pathname);
    if(!parsed){routeSyncedRef.current=true;return;}
    if(parsed.screen!==screen)setScreen(parsed.screen);
    if(parsed.ci!=null&&parsed.ci!==ci)setCi(parsed.ci);
    routeSyncedRef.current=true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[location.pathname]);

  const toggleFilter=fl=>setFilters(p=>p.includes(fl)?[]:[fl]);
  const multiToggle=fl=>setFilters(p=>p.includes(fl)?p.filter(x=>x!==fl):[...p,fl]);
  const openCard=i=>{setCi(i);setScreen("detail");setDetailTab(0);setTxnPage(1);};
  const goTxns=pf=>{if(pf)setFilters([pf]);setSortBy("Recent");setScreen("transactions");};
  const activeTxnList=ALL_TXNS.filter((_,i)=>!removedTxns.has(i));const sorted=doSort(activeTxnList,sortBy);const filtered=doFilter(sorted,filters);
  const DTABS=["Overview","Transactions","Benefits","Fees info"];
  const TabBarD=({x})=>(<div style={{display:"flex",background:C.white,borderBottom:`1px solid ${C.brd}`,padding:"0 8px",...x}}>{DTABS.map((t,i)=>(<div key={t} onClick={()=>{setDetailTab(i);setTxnPage(1);}} style={{flex:1,textAlign:"center",padding:"15px 0",cursor:"pointer",borderBottom:detailTab===i?`2.5px solid ${C.blue}`:"2.5px solid transparent",color:detailTab===i?C.blue:C.dim,fontSize:13,fontWeight:detailTab===i?700:600,fontFamily:FN,transition:"color 0.2s"}}>{t}</div>))}</div>);

  /* Info Bottom Sheet */

  /* Gmail Nudge Banner (inline) */

  /* Gmail Nudge Popup Overlay */
  /* Gmail Nudge Bottom Sheet */
  /* Locked Section */
  /* Retro-enrich overlay */
  /* Voice Flow Overlay */
  /* Skip Confirm Sheet */
  /* Bottom Nav */
  const NavBar = NavBarShared;
  const BottomNav=()=>null;
  const NavPage=({children,cls})=>(<div className={cls} style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:400,margin:"0 auto",fontFamily:FN}}><div style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>{children}</div></div>);

  /* Page wrapper: scrollable content + sticky nav at bottom */
  /* PW inlined into each page for scroll stability */

  /* Bottom sheets */
  const optCardClr={"HSBC Travel One":["#0c2340","#1a5276"],"Axis Flipkart":["#5b2c8e","#8b5cf6"],"HSBC Live+":["#006d5b","#00a086"],"HDFC Infinia":["#111827","#374151"]};
  const OptBS=()=>null;
  useEffect(()=>{if(screen!=="building"||showCardMappingUI||showResolutionSummary)return;
    const t={0:3000,1:4000,3:2500,4:4000,5:3000,6:6000,7:2000,8:4000,10:4000,11:4000,12:4000,13:3000};
    const d=t[buildPhase];
    if(d){const tm=setTimeout(()=>{setBuildSub(0);setBuildPhase(p=>p+1);},d);return()=>clearTimeout(tm);}
  },[screen,buildPhase,showCardMappingUI,showResolutionSummary]);
  useEffect(()=>{if(buildPhase!==9)return;if(buildSub<7){const t=setTimeout(()=>setBuildSub(s=>s+1),[0,1200,1200,1200,1200,2000,2500,2500][buildSub+1]||1200);return()=>clearTimeout(t);}else{const t=setTimeout(()=>{setBuildSub(0);setBuildPhase(10);},3000);return()=>clearTimeout(t);}},[buildPhase,buildSub]);
  useEffect(()=>{if(screen==="building"&&buildPhase>=14)setScreen("home");},[buildPhase,screen]);
  useEffect(()=>{if(screen==="building"&&buildRef.current){setTimeout(()=>buildRef.current.scrollTo({top:0,behavior:"smooth"}),200);}},[buildPhase]);
  useEffect(()=>{if(screen==="building"&&buildRef.current&&buildPhase===9){setTimeout(()=>buildRef.current.scrollTo({top:0,behavior:"smooth"}),100);}},[buildSub]);
  useEffect(()=>{if(buildPhase===1){setBuildCardReveal(-1);setCarouselIdx(0);const t0=setTimeout(()=>setBuildCardReveal(0),400);const t1=setTimeout(()=>{setBuildCardReveal(1);setCarouselIdx(1);},1400);const t2=setTimeout(()=>{setBuildCardReveal(2);setCarouselIdx(2);},2400);const t3=setTimeout(()=>setCarouselIdx(0),3200);return()=>{clearTimeout(t0);clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};}if(buildPhase>1&&buildCardReveal<2)setBuildCardReveal(2);},[buildPhase]);

  const ctxValue={toast,setToast,infoSheet,setInfoSheet,txnSheet,setTxnSheet,actSheet,setActSheet,setScreen,redeemCard,setRedeemCard,redeemPts,setRedeemPts,redeemResult,setRedeemResult,redeemPref,setRedeemPref,redeemTab,setRedeemTab,howExpanded,setHowExpanded,openCard,hasGmail,setHasGmail,nudgePermanentlyDismissed,nudgeDismissals,setShowGmailNudgeSheet,showGmailNudge,setShowGmailNudge,retroEnrichFromGmail,dismissNudge,setNudgePermanentlyDismissed,showGmailNudgeSheet,relinkingGmail,showVoiceFlow,setShowVoiceFlow,setVoiceTranscript,setVoiceMatch,setIsListening,recognitionRef,voiceCardIndex,setVoiceCardIndex,isListening,beginListening,voiceTranscript,voiceMatch,confirmVoiceMatch,showCardMappingUI,setShowCardMappingUI,mappingStep,setMappingStep,mappingSearchQ,setMappingSearchQ,showSkipConfirm,setShowSkipConfirm,showResolutionSummary,setShowResolutionSummary,capSheet,setCapSheet,catSheet,setCatSheet,catStep,setCatStep,selCat,setSelCat,setRemovedTxns,removedTxns,filterSheet,setFilterSheet,filterTab,setFilterTab,setFilters,setSortBy,sortBy,filters,toggleFilter,multiToggle,isState1,isState2,isState3,cardMapping,setCardMapping,screen,ci,setCi,actFilter,setActFilter,getFilteredActions,selBrand,setSelBrand,calcAmt,setCalcAmt,calcPopup,setCalcPopup,calcResult,setCalcResult,searchQ,setSearchQ,calcTab,setCalcTab,calcFilter,setCalcFilter,optTab,setOptTab,optSheet,setOptSheet,optSheetFrom,setOptSheetFrom,optExpanded,setOptExpanded,bestCardDetail,setBestCardDetail,portfolioNew,setPortfolioNew,portfolioEntryCard,setPortfolioEntryCard,bcFilter,setBcFilter,bcSearch,setBcSearch,bcSearchOpen,setBcSearchOpen,bcDetTab,setBcDetTab,bcViewMode,setBcViewMode,bcSection,setBcSection,bcFavs,setBcFavs,bcSort,setBcSort,bcShowSort,setBcShowSort,bcListView,setBcListView,bcEligSheet,setBcEligSheet,bcFromScreen,getCardDisplayName,isCardMapped,detailTab,setDetailTab,txnPage,setTxnPage,usageCat,setUsageCat,usageMode,setUsageMode,timePeriod,setTimePeriod,timePeriodOpen,setTimePeriodOpen,chartPage,setChartPage,dRef,sentRef,tabSticky,spendTab,setSpendTab,showAllBrands,setShowAllBrands,activeTxnList,filtered,goTxns,gmailStep,setGmailStep,gmailReturnTo,completeGmailLink,gmailFirstName,setGmailFirstName,gmailLastName,setGmailLastName,gmailDob,setGmailDob,hsbcDigits1,setHsbcDigits1,hsbcDigits2,setHsbcDigits2,buildPhase,setBuildPhase,buildSub,buildCardReveal,savePhase,setSavePhase,toolStep,reminderStep,finalLoad,buildRef,setMappingCompleted,mappingCompleted,setUserFlag,userFlag,startGmailFlow,onStep,setOnStep,vpSlide,setVpSlide,phone,setPhone,otp,setOtp,otpTimer,setOtpTimer,smsStatus,setSmsStatus,welcomeTyped,touchStartX,txnCatOverrides,setTxnCatOverride};
  /* Mirror to module store as a fallback for any consumer outside the Provider tree. */
  setAppContext(ctxValue);

  let body=<HomeScreen/>;
  if(screen==="building")body=<BuildingScreen/>;
  else if(screen==="analysis")body=<SpendAnalysisScreen/>;
  else if(screen==="card-id")body=<CardIdentificationScreen/>;
  else if(screen==="manual-entry")body=<ManualEntryScreen/>;
  else if(screen==="gmail-extra")body=<GmailExtraInfoScreen/>;
  else if(screen==="txn-eval")body=<TxnEvalScreen/>;
  else if(screen==="tools-intro")body=<ToolsIntroScreen/>;
  else if(screen==="final-loading")body=<FinalLoadingScreen/>;
  else if(screen==="onboard")body=<OnboardScreen/>;
  else if(screen==="actions")body=<ActionsScreen/>;
  else if(screen==="transactions")body=<TransactionsScreen/>;
  else if(screen==="optimize")body=<OptimizeScreen/>;
  else if(screen==="gmail")body=<GmailMockFlow/>;
  else if(screen==="detail")body=<CardDetailScreen/>;
  else if(screen==="calc")body=<CalcScreen/>;
  else if(screen==="redeem")body=<RedeemScreen/>;
  else if(screen==="profile")body=<ProfileScreen/>;
  else if(screen==="bestcards")body=<BestCardsScreen/>;
  else if(screen==="portfolio-create")body=<PortfolioCreateScreen/>;
  else if(screen==="portfolio-results")body=<PortfolioResultsScreen/>;
  else if(screen==="home")body=<HomeScreen/>;

  useEffect(()=>{
  },[screen,location.pathname,ci,buildPhase,gmailStep,onStep,hasGmail,mappingCompleted]);

  return <AppContext.Provider value={ctxValue}><div key={screen} className="legacy-screen-transition" style={{height:"100%"}}>{body}</div></AppContext.Provider>;
}
