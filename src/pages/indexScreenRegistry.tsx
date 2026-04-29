// Production screen registry for the MVP Index orchestrator.
// Keeps screen imports and screen-key mapping out of Index without changing routing behavior.

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

export const SCREEN_COMPONENTS = {
  home: HomeScreen,
  building: BuildingScreen,
  analysis: SpendAnalysisScreen,
  "card-id": CardIdentificationScreen,
  "manual-entry": ManualEntryScreen,
  "gmail-extra": GmailExtraInfoScreen,
  "txn-eval": TxnEvalScreen,
  "tools-intro": ToolsIntroScreen,
  "final-loading": FinalLoadingScreen,
  onboard: OnboardScreen,
  actions: ActionsScreen,
  transactions: TransactionsScreen,
  optimize: OptimizeScreen,
  gmail: GmailMockFlow,
  detail: CardDetailScreen,
  calc: CalcScreen,
  redeem: RedeemScreen,
  profile: ProfileScreen,
  bestcards: BestCardsScreen,
  "portfolio-create": PortfolioCreateScreen,
  "portfolio-results": PortfolioResultsScreen,
} as const;

export function getScreenComponent(screen: string) {
  return SCREEN_COMPONENTS[screen] || HomeScreen;
}

