// Persisted user identity state for the production Index orchestrator.
// Owns Gmail/linking flags, card mapping state, and derived State 1/2/3 helpers.

import { useEffect, useState } from "react";
import { safeRead, safeWrite } from "@/lib/storage";

export interface UserIdentityInput {
  hasGmail: boolean;
  userFlag: string;
  mappingCompleted: boolean;
}

export function deriveUserIdentityState({ hasGmail, userFlag, mappingCompleted }: UserIdentityInput) {
  const linkedGmail = hasGmail || userFlag === "NORMAL";
  return {
    linkedGmail,
    isState1: !linkedGmail && !mappingCompleted,
    isState2: !linkedGmail && mappingCompleted,
    isState3: linkedGmail,
  };
}

export function useUserIdentityState(cards: any[], semiCards: any[]) {
  const [userFlag, setUserFlag] = useState(() => safeRead("sa:userFlag", "PARTIAL"));
  const [hasGmail, setHasGmail] = useState(() => safeRead("sa:hasGmail", false));
  const [cardMapping, setCardMapping] = useState<any>(() => safeRead("sa:cardMapping", {}));
  const [mappingCompleted, setMappingCompleted] = useState(() => safeRead("sa:mappingCompleted", false));

  useEffect(() => {
    if (userFlag === "NORMAL" && !hasGmail) setHasGmail(true);
  }, [userFlag, hasGmail]);

  useEffect(() => {
    safeWrite("sa:hasGmail", hasGmail);
  }, [hasGmail]);
  useEffect(() => {
    safeWrite("sa:cardMapping", cardMapping);
  }, [cardMapping]);
  useEffect(() => {
    safeWrite("sa:mappingCompleted", mappingCompleted);
  }, [mappingCompleted]);
  useEffect(() => {
    safeWrite("sa:userFlag", userFlag);
  }, [userFlag]);

  const identityState = deriveUserIdentityState({ hasGmail, userFlag, mappingCompleted });

  const getCardDisplayName = (i: number) => {
    if (hasGmail) return cards[i].name;
    if (cardMapping[i] && cardMapping[i] !== "Other") return semiCards[i].bank.replace(" Bank", "") + " " + cardMapping[i];
    return semiCards[i].bank.replace(" Bank", "") + " â€¢â€¢" + semiCards[i].last4;
  };

  const isCardMapped = (i: number) => hasGmail || (cardMapping[i] && cardMapping[i] !== "Other");

  const getFilteredActions = (actions: any[]) => {
    if (hasGmail) return actions;
    return actions.filter((action) => action.type === "points" || action.type === "milestone" || (action.type === "cap" && action.creditLimit === true));
  };

  return {
    userFlag,
    setUserFlag,
    hasGmail,
    setHasGmail,
    cardMapping,
    setCardMapping,
    mappingCompleted,
    setMappingCompleted,
    ...identityState,
    getCardDisplayName,
    isCardMapped,
    getFilteredActions,
  };
}

