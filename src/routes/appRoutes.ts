// Production app route contract.
// All routes still render Index; Index maps URL state to the active screen.

export const INDEX_ROUTE_PATHS = [
  "/",
  "/index",
  "/onboard",
  "/building",
  "/analysis",
  "/card-id",
  "/manual-entry",
  "/gmail-extra",
  "/txn-eval",
  "/tools-intro",
  "/final-loading",
  "/home",
  "/calculate",
  "/redeem",
  "/optimize",
  "/optimise",
  "/actions",
  "/transactions",
  "/profile",
  "/cards",
  "/cards/best/:slug",
  "/cards/:id",
  "/portfolio/create",
  "/portfolio/results",
  "/gmail",
] as const;

