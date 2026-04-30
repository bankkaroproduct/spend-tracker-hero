import { describe, expect, it } from "vitest";
import { nameToSlug, pathToScreen, screenToPath } from "./routeState";

describe("routeState", () => {
  it("normalizes card names into stable URL slugs", () => {
    expect(nameToSlug("HDFC  Diners Black Credit Card")).toBe("hdfc-diners-black-credit-card");
    expect(nameToSlug("Axis Flipkart / Myntra 7.5%")).toBe("axis-flipkart-myntra-7-5");
  });

  it("maps core paths to screen state", () => {
    expect(pathToScreen("/")).toEqual({ screen: "onboard" });
    expect(pathToScreen("/home")).toEqual({ screen: "home" });
    expect(pathToScreen("/calculate")).toEqual({ screen: "calc" });
    expect(pathToScreen("/optimise")).toEqual({ screen: "optimize" });
    expect(pathToScreen("/portfolio/create")).toEqual({ screen: "portfolio-create" });
    expect(pathToScreen("/portfolio/results")).toEqual({ screen: "portfolio-results" });
  });

  it("separates owned-card detail routes from market-card detail routes", () => {
    expect(pathToScreen("/cards/2")).toEqual({ screen: "detail", ci: 2 });
    expect(pathToScreen("/cards/not-a-number")).toEqual({ screen: "detail", ci: 0 });
    expect(pathToScreen("/cards/best/hdfc-diners-black-credit-card")).toEqual({
      screen: "bestcards",
      bestCardSlug: "hdfc-diners-black-credit-card",
    });
  });

  it("maps screen state back to canonical paths", () => {
    expect(screenToPath("home")).toBe("/home");
    expect(screenToPath("calc")).toBe("/calculate");
    expect(screenToPath("optimize")).toBe("/optimize");
    expect(screenToPath("detail", 3)).toBe("/cards/3");
    expect(screenToPath("bestcards", undefined, { name: "HDFC Diners Black Credit Card" })).toBe(
      "/cards/best/hdfc-diners-black-credit-card",
    );
    expect(screenToPath("bestcards")).toBe("/cards");
  });

  it("returns null for unknown paths", () => {
    expect(pathToScreen("/definitely-not-a-route")).toBeNull();
  });
});
