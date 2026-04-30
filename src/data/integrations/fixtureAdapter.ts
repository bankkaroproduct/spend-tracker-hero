// V2 fixture adapter.
// Normalizes static JSON/API fixtures before they enter the engine.

import { adaptMockCard } from "./mockAdapter";

export function adaptFixtureCards(values: unknown) {
  if (!Array.isArray(values)) {
    throw new Error("[v2:adapter] fixture cards must be an array");
  }
  return values.map(adaptMockCard);
}

