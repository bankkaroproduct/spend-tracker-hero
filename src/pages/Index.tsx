
import { useState } from "react";

/* Production screen orchestrator: owns MVP screen state and delegates route parsing to src/routes. */
import "@/features/legacy/legacy.css";
import { CARDS, SEMI_CARDS, BEST_CARDS } from "@/data/simulation/legacy";
import { AppContext, setAppContext } from "@/store/AppContext";
import { getScreenComponent } from "./indexScreenRegistry";
import { useRouteSync } from "./useRouteSync";
import { useUserIdentityState } from "./useUserIdentityState";
import { useGmailFlow } from "./useGmailFlow";
import { useOnboardingFlow } from "./useOnboardingFlow";
import { useBuildingFlow } from "./useBuildingFlow";
import { useNudgeAndVoiceFlow } from "./useNudgeAndVoiceFlow";
import { useTransactionUiState } from "./useTransactionUiState";
import { useBestCardsUiState } from "./useBestCardsUiState";
import { useCardDetailUiState } from "./useCardDetailUiState";
import { useCalculatorRedeemUiState } from "./useCalculatorRedeemUiState";
import { useOverlayUiState } from "./useOverlayUiState";
import { useOptimizeActionsUiState } from "./useOptimizeActionsUiState";
import { useScreenScrollReset } from "./useScreenScrollReset";
import { buildIndexContext } from "./buildIndexContext";

export default function App(){
  /* User flag: NORMAL | PARTIAL | DEBIT | NTC | ENTRY_ELIGIBLE */
  const identity=useUserIdentityState(CARDS,SEMI_CARDS);
  const {
    userFlag,setUserFlag,hasGmail,setHasGmail,cardMapping,setCardMapping,mappingCompleted,setMappingCompleted,
    isState1,isState2,isState3,getCardDisplayName,isCardMapped,getFilteredActions,
  }=identity;
  const [screen,setScreenState]=useState("onboard");
  const setScreen=(next)=>{
    setScreenState(next);
  };
  const bestCardsUi=useBestCardsUiState();
  const {
    bestCardDetail,setBestCardDetail,portfolioNew,setPortfolioNew,portfolioEntryCard,setPortfolioEntryCard,
    bcFilter,setBcFilter,bcSearch,setBcSearch,bcSearchOpen,setBcSearchOpen,bcDetTab,setBcDetTab,
    bcViewMode,setBcViewMode,bcSection,setBcSection,bcFavs,setBcFavs,bcSort,setBcSort,
    bcListView,setBcListView,bcShowSort,setBcShowSort,bcEligSheet,setBcEligSheet,bcFromScreen,setBcFromScreen,
  }=bestCardsUi;
  const onboardingFlow=useOnboardingFlow({screen,setScreen});
  const {
    onStep,setOnStep,vpSlide,setVpSlide,phone,setPhone,otp,setOtp,
    otpTimer,setOtpTimer,smsStatus,setSmsStatus,welcomeTyped,otpRefs,
  }=onboardingFlow;
  const optimizeActionsUi=useOptimizeActionsUiState();
  const {actFilter,setActFilter,optTab,setOptTab,optSheet,setOptSheet,optSheetFrom,setOptSheetFrom,optExpanded,setOptExpanded}=optimizeActionsUi;
  const overlayUi=useOverlayUiState();
  const {capSheet,setCapSheet,toast,setToast,infoSheet,setInfoSheet,actSheet,setActSheet,showSkipConfirm,setShowSkipConfirm}=overlayUi;
  const calculatorRedeemUi=useCalculatorRedeemUiState();
  const {
    selBrand,setSelBrand,calcAmt,setCalcAmt,calcPopup,setCalcPopup,calcResult,setCalcResult,
    searchQ,setSearchQ,calcTab,setCalcTab,chartPage,setChartPage,calcFilter,setCalcFilter,
    howExpanded,setHowExpanded,redeemCard,setRedeemCard,redeemPts,setRedeemPts,
    redeemPref,setRedeemPref,redeemResult,setRedeemResult,redeemTab,setRedeemTab,
  }=calculatorRedeemUi;
  const cardDetailUi=useCardDetailUiState({screen,setScreen});
  const {
    ci,setCi,spendTab,setSpendTab,showAllBrands,setShowAllBrands,detailTab,setDetailTab,
    usageMode,setUsageMode,usageCat,setUsageCat,timePeriod,setTimePeriod,timePeriodOpen,setTimePeriodOpen,
    txnExp,setTxnExp,tabSticky,setTabSticky,txnPage,setTxnPage,dRef,dRefs,sentRef,openCard,
  }=cardDetailUi;
  const transactionUi=useTransactionUiState({setScreen});
  const {
    sortBy,setSortBy,filters,setFilters,catSheet,setCatSheet,txnSheet,setTxnSheet,
    filterSheet,setFilterSheet,filterTab,setFilterTab,catStep,setCatStep,selCat,setSelCat,
    removedTxns,setRemovedTxns,txnCatOverrides,setTxnCatOverride,toggleFilter,multiToggle,
    activeTxnList,filtered,goTxns,
  }=transactionUi;
  const buildingFlow=useBuildingFlow({screen,setScreen});
  const {
    buildPhase,setBuildPhase,buildSub,setBuildSub,buildCardReveal,setBuildCardReveal,
    carouselIdx,setCarouselIdx,touchStartX,buildRef,showCardMappingUI,setShowCardMappingUI,
    mappingStep,setMappingStep,mappingSearchQ,setMappingSearchQ,showResolutionSummary,setShowResolutionSummary,
    toolStep,setToolStep,reminderStep,setReminderStep,finalLoad,setFinalLoad,savePhase,setSavePhase,
  }=buildingFlow;
  const gmailFlow=useGmailFlow({setScreen,setHasGmail,setUserFlag,setMappingCompleted,setCardMapping,setBuildPhase});
  const {
    gmailStep,setGmailStep,gmailReturnTo,gmailOtp,setGmailOtp,
    gmailFirstName,setGmailFirstName,gmailLastName,setGmailLastName,gmailDob,setGmailDob,
    hsbcDigits1,setHsbcDigits1,hsbcDigits2,setHsbcDigits2,
    completeGmailLink,startGmailFlow,
  }=gmailFlow;
  const nudgeVoiceFlow=useNudgeAndVoiceFlow({hasGmail,screen,setCardMapping,setMappingCompleted,startGmailFlow});
  const {
    gmailSheet,setGmailSheet,relinkingGmail,setRelinkingGmail,nudgeDismissals,setNudgeDismissals,
    nudgePermanentlyDismissed,setNudgePermanentlyDismissed,showGmailNudge,setShowGmailNudge,
    showGmailNudgeSheet,setShowGmailNudgeSheet,nudgeShownThisSession,setNudgeShownThisSession,
    showVoiceFlow,setShowVoiceFlow,voiceCardIndex,setVoiceCardIndex,isListening,setIsListening,
    voiceTranscript,setVoiceTranscript,voiceMatch,setVoiceMatch,recognitionRef,
    shouldShowNudge,markNudgeShown,dismissNudge,retroEnrichFromGmail,beginListening,confirmVoiceMatch,
  }=nudgeVoiceFlow;

  const prevScreenRef=useScreenScrollReset(screen);

  /* ═══ URL ⇄ state sync ═══ */
  useRouteSync({screen,ci,bestCardDetail,setScreen,setCi,setBestCardDetail,bestCards:BEST_CARDS,prevScreenRef});


  const ctxValue=buildIndexContext({
    setScreen,
    screen,
    identity,
    bestCardsUi,
    onboardingFlow,
    optimizeActionsUi,
    overlayUi,
    calculatorRedeemUi,
    cardDetailUi,
    transactionUi,
    buildingFlow,
    gmailFlow,
    nudgeVoiceFlow,
  });
  /* Mirror to module store as a fallback for any consumer outside the Provider tree. */
  setAppContext(ctxValue);

  const ActiveScreen=getScreenComponent(screen);
  const body=<ActiveScreen/>;

  return <AppContext.Provider value={ctxValue}><div key={screen} className="legacy-screen-transition" style={{height:"100%"}}>{body}</div></AppContext.Provider>;
}
