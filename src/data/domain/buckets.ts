// V2 bucket identity helpers.
// Canonical bucket/category/merchant names live here so UI files do not invent mappings.

export const CATEGORY_ASSET_NAMES: Record<string, string> = {
  Shopping: "Shopping",
  Groceries: "Groceries",
  Dining: "Dining Out",
  "Dining Out": "Dining Out",
  "Food Ordering": "Food Ordering",
  Bills: "Bills",
  Fuel: "Fuel",
  Flights: "Flights",
  Travel: "Flights",
  Hotels: "Hotels",
  Entertainment: "Entertainment",
  Rent: "Rent",
  Insurance: "Insurance",
  "Friends and Family": "Friends and Family",
  // The current CDN set does not have Cab/Education icons. These are deliberate
  // visual fallbacks until dedicated assets exist.
  "Cab Rides": "Shopping",
  Education: "Bills",
};

export function slugify(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cardRouteId(card: { card_alias?: string; cardAlias?: string; name?: string }): string {
  return card.card_alias || card.cardAlias || slugify(card.name || "");
}

export function categoryImage(name: string): string {
  const canonical = CATEGORY_ASSET_NAMES[name] || name;
  return `/cdn/categories/${canonical}.webp`;
}
