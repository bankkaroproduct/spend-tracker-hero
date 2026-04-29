// Production URL-to-screen mapping.
// Keep this pure so App and Index can share route behavior without changing the MVP router.

export interface ParsedScreenRoute {
  screen: string;
  ci?: number;
  bestCardSlug?: string;
}

export function nameToSlug(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function matchCardsBest(path: string): string | null {
  const match = /^\/cards\/best\/([^/?#]+)$/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
}

function matchOwnedCardIndex(path: string): number | null {
  const match = /^\/cards\/([^/?#]+)$/.exec(path);
  if (!match) return null;
  const id = parseInt(decodeURIComponent(match[1]), 10);
  return Number.isNaN(id) ? 0 : id;
}

export function screenToPath(screen: string, cardIdx?: number, bestCardDetail?: { name?: string } | null): string {
  if (screen === "home") return "/home";
  if (screen === "calc") return "/calculate";
  if (screen === "redeem") return "/redeem";
  if (screen === "optimize") return "/optimize";
  if (screen === "actions") return "/actions";
  if (screen === "transactions") return "/transactions";
  if (screen === "profile") return "/profile";
  if (screen === "bestcards") {
    if (bestCardDetail?.name) {
      const slug = nameToSlug(bestCardDetail.name);
      return slug ? `/cards/best/${slug}` : "/cards";
    }
    return "/cards";
  }
  if (screen === "portfolio-create") return "/portfolio/create";
  if (screen === "portfolio-results") return "/portfolio/results";
  if (screen === "detail") return `/cards/${cardIdx ?? 0}`;
  if (screen === "gmail") return "/gmail";
  if (screen === "building") return "/building";
  if (screen === "analysis") return "/analysis";
  if (screen === "card-id") return "/card-id";
  if (screen === "manual-entry") return "/manual-entry";
  if (screen === "gmail-extra") return "/gmail-extra";
  if (screen === "txn-eval") return "/txn-eval";
  if (screen === "tools-intro") return "/tools-intro";
  if (screen === "final-loading") return "/final-loading";
  return "/onboard";
}

export function pathToScreen(path: string): ParsedScreenRoute | null {
  if (path === "/" || path === "/index" || path === "/onboard") return { screen: "onboard" };
  if (path === "/building") return { screen: "building" };
  if (path === "/analysis") return { screen: "analysis" };
  if (path === "/card-id") return { screen: "card-id" };
  if (path === "/manual-entry") return { screen: "manual-entry" };
  if (path === "/gmail-extra") return { screen: "gmail-extra" };
  if (path === "/txn-eval") return { screen: "txn-eval" };
  if (path === "/tools-intro") return { screen: "tools-intro" };
  if (path === "/final-loading") return { screen: "final-loading" };
  if (path === "/home") return { screen: "home" };
  if (path === "/calculate") return { screen: "calc" };
  if (path === "/redeem") return { screen: "redeem" };
  if (path === "/optimize" || path === "/optimise") return { screen: "optimize" };
  if (path === "/actions") return { screen: "actions" };
  if (path === "/transactions") return { screen: "transactions" };
  if (path === "/profile") return { screen: "profile" };
  if (path === "/cards") return { screen: "bestcards" };
  if (path === "/portfolio/create") return { screen: "portfolio-create" };
  if (path === "/portfolio/results") return { screen: "portfolio-results" };
  if (path === "/gmail") return { screen: "gmail" };

  const bestCardSlug = matchCardsBest(path);
  if (bestCardSlug) return { screen: "bestcards", bestCardSlug };

  const ci = matchOwnedCardIndex(path);
  if (ci !== null) return { screen: "detail", ci };

  return null;
}

