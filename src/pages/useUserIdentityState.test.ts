import { describe, expect, it } from "vitest";
import { deriveUserIdentityState } from "./useUserIdentityState";

describe("user identity state derivation", () => {
  it("derives State 1 for SMS-only users", () => {
    expect(deriveUserIdentityState({ hasGmail: false, userFlag: "PARTIAL", mappingCompleted: false })).toMatchObject({
      linkedGmail: false,
      isState1: true,
      isState2: false,
      isState3: false,
    });
  });

  it("derives State 2 for manually mapped users", () => {
    expect(deriveUserIdentityState({ hasGmail: false, userFlag: "PARTIAL", mappingCompleted: true })).toMatchObject({
      linkedGmail: false,
      isState1: false,
      isState2: true,
      isState3: false,
    });
  });

  it("derives State 3 for Gmail or NORMAL users", () => {
    expect(deriveUserIdentityState({ hasGmail: true, userFlag: "PARTIAL", mappingCompleted: false }).isState3).toBe(true);
    expect(deriveUserIdentityState({ hasGmail: false, userFlag: "NORMAL", mappingCompleted: false }).isState3).toBe(true);
  });
});

