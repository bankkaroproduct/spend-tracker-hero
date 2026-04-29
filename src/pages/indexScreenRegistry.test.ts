import { describe, expect, it } from "vitest";
import { INDEX_ROUTE_PATHS } from "@/routes/appRoutes";
import { pathToScreen } from "@/routes/routeState";
import { SCREEN_COMPONENTS, getScreenComponent } from "./indexScreenRegistry";

describe("production screen registry", () => {
  it("has a component for every concrete app route screen", () => {
    const concreteRoutes = INDEX_ROUTE_PATHS
      .filter((path) => !path.includes(":"))
      .map((path) => pathToScreen(path))
      .filter(Boolean);

    for (const route of concreteRoutes) {
      expect(SCREEN_COMPONENTS[route!.screen] || getScreenComponent(route!.screen)).toBeTruthy();
    }
  });

  it("falls back to Home for unknown screen keys", () => {
    expect(getScreenComponent("missing-screen")).toBe(SCREEN_COMPONENTS.home);
  });
});

